const http = require("http");
const { log } = require("util");

class shixjs {
  constructor() {
    const server = http.createServer();

    this.listen = (port, callback) => {
      server.listen(port);
      if (callback) callback();
    };

    const middleware = [];
    server.on("request", (req, res) => {
      let i = -1
      const next  = async () =>{
        i++
        if(middleware[i]!==undefined){
          middleware[i](req,res,next)
          console.log(middleware.length);
          next()
        }else{
          res.end()
        }
      }
      next()
    });

    this.use = (middlewareFunction) => {
      middleware.push(middlewareFunction);
    };

    this.get = (path, callback) => {
      const handler = (req, res) => {
        const urlParts = req.url.split("?");
        const routePath = urlParts[0];

        if (req.method === "GET") {
          const routeSegments = routePath.split("/");
          const pathSegments = path.split("/");

          if (routeSegments.length === pathSegments.length) {
            const params = {};
            let match = true;

            for (let i = 0; i < pathSegments.length; i++) {
              const routeSegment = routeSegments[i];
              const pathSegment = pathSegments[i];

              if (pathSegment.startsWith(":")) {
                const paramName = pathSegment.slice(1);
                params[paramName] = routeSegment;
              } else if (routeSegment !== pathSegment) {
                match = false;
                break;
              }
            }

            if (match) {
              req.params = params;
              req.query = {};

              if (urlParts.length > 1) {
                const queryString = urlParts[1];
                const queryParams = new URLSearchParams(queryString);
                req.query = Object.fromEntries(queryParams.entries());
              }

              callback(req, res);
              res.end()
            }
          }
        }
      };

      this.use(handler);
    };

    this.status = (res, statusCode) => {
      res.statusCode = statusCode;
    };

    this.send = (res, body) => {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.write(body);
      res.end()
    };
    this.json = (res, data) => {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.write(JSON.stringify(data));
      res.end()
    };

    this.post = (path, callback) => {
      const handler = (req, res,next) => {
        const urlParts = req.url.split("?");
        const params = parseParams(path,urlParts[0])
        const routePath = urlParts[0];
        if (req.method === "POST" && params) {
          const routeSegments = routePath.split("/");
          const pathSegments = path.split("/");

          if (routeSegments.length === pathSegments.length) {
            const params = {};
            let match = true;

            for (let i = 0; i < pathSegments.length; i++) {
              const routeSegment = routeSegments[i];
              const pathSegment = pathSegments[i];

              if (pathSegment.startsWith(":")) {
                const paramName = pathSegment.slice(1);
                params[paramName] = routeSegment;
              } else if (routeSegment !== pathSegment) {
                match = false;
                break;
              }
            }

            if (match) {
              req.params = params;
              req.query = {};

              if (urlParts.length > 1) {
                const queryString = urlParts[1];
                const queryParams = new URLSearchParams(queryString);
                req.query = Object.fromEntries(queryParams.entries());
              }

              callback(req, res);
            }
          }
        }else{
          next()
        }
      };
      this.use(handler);
    };

    this.put = (path, callback) => {
      const handler = (req, res) => {
        if (req.method === "PUT" && req.url === path) {
          callback(req, res);
          let data = "";
          req.on("data", (chunk) => {
            data += chunk;
          });
          req.on("end", () => {
            req.body = data;
            callback(req, res);
          });
        }
      };
      this.use(handler);
    };

    this.patch = (path, callback) => {
      const handler = (req, res) => {
        if (req.method === "PATCH" && req.url === path) {
          callback(req, res);
          let data = "";
          req.on("data", (chunk) => {
            data += chunk;
          });
          req.on("end", () => {
            req.body = data;
            callback(req, res);
          });
        }
      };
      this.use(handler);
    };

    this.delete = (path, callback) => {
      const handler = (req, res) => {
        if (req.method === "DELETE" && req.url === path) {
          callback(req, res);
          let data = "";
          req.on("data", (chunk) => {
            data += chunk;
          });
          req.on("end", () => {
            req.body = data;
            callback(req, res);
          });
        }
      };
      this.use(handler);
    };
  }
}
function parseParams(url, requestUrl) { 
  let paramsArray = []; 
  paramsArray = url.split("/"); 
  paramsArray.shift(); 
  paramsArray.forEach((value, index) => { 
      if (value.includes(":")) { 
          paramsArray[index] = value.replace(":", ""); 
      } else { 
          paramsArray[index] = undefined; 
      } 
  }); 

  let originalUrl = url.split("/"); 
  originalUrl.shift(); 

  let urlParams = requestUrl.split("/"); 
  urlParams.shift(); 

  const params = {}; 
  if (urlParams.length == paramsArray.length) { 
      for (i in paramsArray) { 
          if (paramsArray[i] !== undefined) { 
              params[paramsArray[i]] = urlParams[i]; 
          } 
      } 
  } else { 
      return false; 
  } 

  return params; 
}

module.exports = shixjs;
