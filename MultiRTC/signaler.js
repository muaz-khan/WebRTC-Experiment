// Last time updated at 05 Feb 2014, 05:46:23

// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence

// RTCMultiConnection
// Documentation  - www.RTCMultiConnection.org/docs

// MultiRTC     - github.com/muaz-khan/WebRTC-Experiment/tree/master/MultiRTC
// Demo         - https://www.webrtc-experiment.com:12034/

var fs = require('fs');

var _static = require('node-static');
var file = new _static.Server('./public');

// HTTP server
var app = require('http').createServer(function(request, response) {
    request.addListener('end', function() {
        if (request.url.search( /.png|.js|.css/g ) == -1) {
            file.serveFile('/index.html', 402, { }, request, response);
        } else file.serve(request, response);
    }).resume();
});

// socket.io implementation
var io = require('socket.io').listen(app);
io.sockets.on('connection', function(socket) {
    socket.on('message', function(data) {
        socket.broadcast.emit('message', data);
    });
});

app.listen(12034);

console.log('Please open: http://localhost:12034/');