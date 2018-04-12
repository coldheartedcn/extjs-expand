var url = require("url"),
    fs = require("fs"),
    http = require("http"),
    path = require("path"),
    msg = 'ttt'


http.createServer(function (request, response) {
    var pathname = "C:\\Workspaces\\WebstormProjects" + url.parse(request.url).pathname.replace('/', '\\');

    if (path.extname(pathname) == "") {
        pathname += "\\";
    }

    if (pathname.charAt(pathname.length-1) == "\\"){
        pathname += "index.html";
    }

    fs.exists(pathname, function(exists){
        if(exists){
            switch(path.extname(pathname)){
                case ".html":
                    response.writeHead(200, {"Content-Type": "text/html"});
                    break;
                case ".js":
                    response.writeHead(200, {"Content-Type": "text/javascript"});
                    break;
                case ".css":
                    response.writeHead(200, {"Content-Type": "text/css"});
                    break;
                case ".gif":
                    response.writeHead(200, {"Content-Type": "image/gif"});
                    break;
                case ".jpg":
                    response.writeHead(200, {"Content-Type": "image/jpeg"});
                    break;
                case ".png":
                    response.writeHead(200, {"Content-Type": "image/png"});
                    break;
                default:
                    response.writeHead(200, {"Content-Type": "application/octet-stream"});
            }

            fs.readFile(pathname,function (err,data){
                response.end(data);
            });
        } else {
            response.writeHead(200, {"Content-Type": "text/plain"});
            response.end(msg);
        }
    });
}).listen(80);

console.log("Server running at localhost");