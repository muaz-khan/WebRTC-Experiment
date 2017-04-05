var SIGNALING_SERVER = 'wss://webrtcweb.com:9449/';
var channel = window.RMCDefaultChannel;

var websocket = new WebSocket(SIGNALING_SERVER);

websocket.push = websocket.send;
websocket.send = function(data) {
    websocket.push(JSON.stringify({
        channel: channel,
        data: data
    }));
};

var signaler = new Signaler();
signaler.on('message', function(data) {
    websocket.send(data);
});

websocket.onmessage = function(event) {
    var data = JSON.parse(event.data);
    signaler.emit('message', data);
};

websocket.onopen = function(){
    console.info('WebSocket connection is opened');

    websocket.send({
        channel: channel
    });
};
