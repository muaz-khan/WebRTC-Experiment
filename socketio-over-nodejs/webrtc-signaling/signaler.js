// 2013, @muazkh » github.com/muaz-khan
// MIT License » https://webrtc-experiment.appspot.com/licence/
// Documentation » https://github.com/muaz-khan/WebRTC-Experiment/blob/master/socketio-over-nodejs
// Demo » http://webrtc-signaling.jit.su/

var port = 8888;
var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

server.listen(port);

var channels = {};

/* -------------- <socket.io> -------------- */

io.sockets.on('connection', function (socket) {
    var initiatorChannel = '';
    if (!io.connected)
        io.connected = true;

    socket.on('new-channel', function (data) {
        channels[data.channel] = data.channel;
        onNewNamespace(data.channel, data.sender);
    });

    socket.on('presence', function (channel) {
        var isChannelPresent = !! channels[channel];
        socket.emit('presence', isChannelPresent);
        if (!isChannelPresent)
            initiatorChannel = channel;
    });

    socket.on('disconnect', function (channel) {
        if (initiatorChannel)
            channels[initiatorChannel] = null;
    });
});

function onNewNamespace(channel, sender) {
    io.of('/' + channel).on('connection', function (socket) {
        if (io.isConnected) {
            io.isConnected = false;
            socket.emit('connect', true);
        }

        socket.on('message', function (data) {
            if (data.sender == sender)
                socket.broadcast.emit('message', data.data);
        });
    });
}

/* -------------- </socket.io> -------------- */

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/static/video-conferencing/index.html');
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

app.get('/chat', function (req, res) {
    res.sendfile(__dirname + '/static/text-chat.html');
});

app.get('/RTCMultiConnection', function (req, res) {
    res.sendfile(__dirname + '/static/RTCMultiConnection/index.html');
});

app.get('/RTCMultiConnection-v1.2.js', function (req, res) {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendfile(__dirname + '/static/RTCMultiConnection/RTCMultiConnection-v1.2.js');
});

app.get('/socketio.js', function (req, res) {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendfile(__dirname + '/static/socket.io.js');
});

app.get('/RTCMultiConnection-v1.4', function (req, res) {
    res.sendfile(__dirname + '/static/RTCMultiConnection-v1.4/index.html');
});

// following lines aimed to auto-open the browser instance
// you can remove them if causing failure
var childProcess = require('child_process'),
    openURL = 'http://localhost:' + port + '/';

var chromeURL = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    firefoxURL = 'c:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe';

childProcess.spawn(chromeURL, ['-incognito', openURL]);
//childProcess.spawn(firefoxURL, ['-new-tab', openURL]);
