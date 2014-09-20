// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence
// Experiments    - github.com/muaz-khan/WebRTC-Experiment

var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),
    port = process.argv[2] || 8888;

var app = http.createServer(function (request, response) {
    var uri = url.parse(request.url).pathname;
    var filename;
    
    filename = path.join(process.cwd() + (process.platform == 'linux'? '/node_modules' : '\\node_modules'), uri);
    
    if (fs.statSync(filename).isDirectory()) {
        filename = path.join(process.cwd(), uri);
    }
    
    fs.exists(filename, function (exists) {
        if (!exists) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.write('404 Not Found: ' + filename + '\n');
            response.end();
            return;
        }
        
        var contentType;

        if (fs.statSync(filename).isDirectory()) {
            filename += '/index.html';
        }
        
        if(filename.indexOf('.html') != -1) {
            contentType = {
                'Content-Type': 'text/html'
            };
        }

        fs.readFile(filename, 'binary', function (err, file) {
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
    });
}).listen(port);

var io = require('socket.io')(app);
io.on('connection', function(socket){
    socket.on('buffer-stream', function(buffer) {
        socket.broadcast.emit('buffer-stream', buffer);
    });
});
