// Last time updated at 29 January 2014, 05:46:23

// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence

// RTCMultiConnection
// Documentation  - www.RTCMultiConnection.org/docs

// MultiRTC     - github.com/muaz-khan/WebRTC-Experiment/tree/master/MultiRTC
// Demo         - https://www.webrtc-experiment.com:12034/

var fs = require('fs');

var _static = require('node-static');
var file = new _static.Server('./public');

var options = {
    key: fs.readFileSync('fakekeys/privatekey.pem').toString(),
    cert: fs.readFileSync('fakekeys/certificate.pem').toString()
};

/*
var options = {
    key: fs.readFileSync('../ssl/private/domain.com.key'),
    cert: fs.readFileSync('../ssl/certs/domain.com.crt'),
    ca: fs.readFileSync('../ssl/certs/domain.com.cabundle')
};
*/

var app = require('https').createServer(options, function(request, response) {
    request.addListener('end', function() {
        if (request.url.indexOf('.js') == -1 && request.url.indexOf('.css') == -1 && request.url.indexOf('.png') == -1) {
            file.serveFile('/index.html', 402, { }, request, response);
        } else file.serve(request, response);
    }).resume();
});

var io = require('socket.io').listen(app);

io.sockets.on('connection', function(socket) {
    socket.on('message', function(data) {
        socket.broadcast.emit('message', data);
    });
});

app.listen(12034);
