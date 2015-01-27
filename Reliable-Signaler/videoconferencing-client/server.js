// Muaz Khan   - www.MuazKhan.com
// MIT License - www.WebRTC-Experiment.com/licence

var path = require("path"),
    fs = require("fs");

var app = require('http').createServer(function (request, response) {
    var uri = require('url').parse(request.url).pathname,
        filename = path.join(process.cwd(), uri);

    fs.exists(filename, function (exists) {
        var contentType = {
            "Content-Type": "text/plain"
        };

        if (!exists) {
            response.writeHead(404, contentType);
            response.write('404 Not Found: ' + filename + '\n');
            response.end();
            return;
        }

        if (fs.statSync(filename).isDirectory()) {
            contentType = {
                "Content-Type": "text/html"
            };
            filename += '/index.html';
        }

        fs.readFile(filename, 'binary', function (err, file) {
            if (err) {
                response.writeHead(500, contentType);
                response.write(err + "\n");
                response.end();
                return;
            }

            response.writeHead(200, contentType);
            response.write(file, 'binary');
            response.end();
        });
    });
});

app.listen(8080);

// npm install reliable-signaler
require('reliable-signaler')(app, {
    path: '/reliable-signaler/signaler.js'
});
