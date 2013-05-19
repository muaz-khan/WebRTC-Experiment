/*  MIT License: https://webrtc-experiment.appspot.com/licence/ -- https://github.com/muaz-khan */

var app = require('http').createServer(handler).listen(8888);

function handler(request, response) {
    var pathname = require('url').parse(request.url).pathname;
    if (pathname == '/') pathname = 'index.html';
    pathname = pathname.replace('/', 'static/');

    setContentType(pathname, response);

    require('fs').readFile(pathname, function (err, file) {
        response.end(file);
    });
}

/* -------------- <socket.io> -------------- */

var io = require('socket.io').listen(app);
io.sockets.on('connection', function (socket) {
    if (!io.connected) io.connected = true;

    socket.on('new-channel', function (data) {
        onNewNamespace(data.channel, data.sender);
    });
});

function onNewNamespace(channel, sender) {
    io.of('/' + channel).on('connection', function (socket) {
        if (io.isConnected) {
            io.isConnected = false;
            socket.emit('connect', true);
        }

        socket.on('message', function (data) {
            if (data.sender == sender) socket.broadcast.emit('message', data.data);
        });
    });
}

/* -------------- </socket.io> -------------- */

// setting static files' content-types
function setContentType(pathname, response) {
    if (pathname.indexOf('.html') !== -1)
        response.writeHead(200, { 'Content-Type': 'text/html' });

    if (pathname.indexOf('.js') !== -1)
        response.writeHead(200, { 'Content-Type': 'application/javascript' });

    if (pathname.indexOf('.ico') !== -1)
        response.writeHead(200, { 'Content-Type': 'image/icon' });

    if (pathname.indexOf('.png') !== -1)
        response.writeHead(200, { 'Content-Type': 'image/png' });
}

// following lines aimed to auto-open the browser
// you can remove them if causing failure
var childProcess = require('child_process'),
    openURL = 'http://localhost:8888/';

var chromeURL = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    firefoxURL = 'c:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe';

childProcess.spawn(chromeURL, ['-incognito', openURL]);
//childProcess.spawn(firefoxURL, ['-new-tab', openURL]);