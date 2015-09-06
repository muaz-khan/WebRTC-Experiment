var useFakeKeys = !(!!process.env.PORT || !!process.env.IP);

var server = require(useFakeKeys ? 'https' : 'http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs');

function serverHandler(request, response) {
    var uri = url.parse(request.url).pathname,
        filename = path.join(process.cwd(), uri);

    fs.exists(filename, function(exists) {
        if (!exists) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.write('404 Not Found: ' + filename + '\n');
            response.end();
            return;
        }

        if (filename.indexOf('favicon.ico') !== -1) {
            return;
        }

        var isWin = !!process.platform.match(/^win/);

        if (fs.statSync(filename).isDirectory() && !isWin) {
            if (filename.indexOf('/demos/') !== -1) {
                filename = filename.replace('/demos/', '');
            }

            filename += '/demos/index.html';
        }

        if (fs.statSync(filename).isDirectory() && !!isWin) {
            if (filename.indexOf('\\demos\\') !== -1) {
                filename = filename.replace('\\demos\\', '');
            }

            filename += '\\demos\\index.html';
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

            response.writeHead(200);
            response.write(file, 'binary');
            response.end();
        });
    });
}

var app;

if (useFakeKeys) {
    var options = {
        key: fs.readFileSync('fake-keys/privatekey.pem'),
        cert: fs.readFileSync('fake-keys/certificate.pem')
    };
    app = server.createServer(options, serverHandler);
} else app = server.createServer(serverHandler);

app = app.listen(process.env.PORT || 9001, process.env.IP || "0.0.0.0", function() {
    var addr = app.address();
    console.log("Server listening at", addr.address + ":" + addr.port);
});

require('./Signaling-Server.js')(app, function(socket) {
    // "socket" object is totally in your own hands!
    // do whatever you want!

    // in your HTML page, you can access socket as following:
    // var socket = connection.getSocket();
    // socket.emit('custom-event', { test: true });

    socket.on('custom-event', function(data) {
        socket.emit('custom-event', data);
    });
});
