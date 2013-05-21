/*  MIT License: https://webrtc-experiment.appspot.com/licence/ -- https://github.com/muaz-khan */

// var port = 80; // use port:80 for non-localhost tests
var port = 8888; // use port:8888 for localhost tests

var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

server.listen(port);

/* -------------- <socket.io> -------------- */

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

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/static/video-conferencing/index.html');
});

app.get('/socketio.js', function (req, res) {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendfile(__dirname + '/static/socket.io.js');
});

app.get('/RTCPeerConnection-v1.5.js', function (req, res) {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendfile(__dirname + '/static/video-conferencing/RTCPeerConnection-v1.5.js');
});

app.get('/conference.js', function (req, res) {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendfile(__dirname + '/static/video-conferencing/conference.js');
});

app.get('/conference-ui.js', function (req, res) {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendfile(__dirname + '/static/video-conferencing/conference-ui.js');
});

// text chat
app.get('/chat', function (req, res) {
    res.sendfile(__dirname + '/static/text-chat.html');
});

// following lines aimed to auto-open the browser
// you can remove them if causing failure
var childProcess = require('child_process'),
    openURL = 'http://localhost:' + port + '/';

var chromeURL = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    firefoxURL = 'c:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe';

childProcess.spawn(chromeURL, ['-incognito', openURL]);
//childProcess.spawn(firefoxURL, ['-new-tab', openURL]);