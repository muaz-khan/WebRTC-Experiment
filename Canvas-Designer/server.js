var server = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs');

function serverHandler(request, response) {
    var uri = url.parse(request.url).pathname,
        filename = path.join(process.cwd(), uri);

    var stats;

    try {
        stats = fs.lstatSync(filename);
    } catch (e) {
        response.writeHead(404, {
            'Content-Type': 'text/plain'
        });
        response.write('404 Not Found: ' + path.join('/', uri) + '\n');
        response.end();
        return;
    }
    
    if (fs.statSync(filename).isDirectory()) {
        filename += '/index.html';
        
    }

    var contentType;
    if(filename.indexOf('.html') !== -1) {
        contentType = {
            'Content-Type': 'text/html'
        };
    }


    fs.readFile(filename, 'binary', function(err, file) {
        if (err) {
            response.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            response.write(err + '\n');
            response.end();
            return;
        }

        response.writeHead(200, contentType);
        response.write(file, 'binary');
        response.end();
    });
}

var app = server.createServer(serverHandler);

app = app.listen(process.env.PORT || 9001, process.env.IP || "0.0.0.0", function() {
    var addr = app.address();
    console.log("Server listening at", addr.address + ":" + addr.port);
});
