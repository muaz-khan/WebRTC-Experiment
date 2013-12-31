1. https://www.webrtc-experiment.com/docs/WebRTC-Signaling-Concepts.html
2. http://www.RTCMultiConnection.org/FAQ/
3. http://www.RTCMultiConnection.org/docs/sessionid/
4. http://www.RTCMultiConnection.org/docs/channel-id/

=

#### WebRTC Experiments Signaling Concepts

This document explains inner-parts of the signaling methods used in [WebRTC Experiments](https://www.webrtc-experiment.com/).

=

#### Dynamic Channels

All "old" WebRTC Experiments require dynamic channels i.e. namespaces.

For those experiments, signaling gateway must have following features:

1. Multiplexing i.e. more than one sockets connectivity
2. Dynamic channels or namespaces

Out of `multiplexing` requirement; simple WebSocket implementation can't be used as signaling method in "old" WebRTC Experiments.

=

#### A sample socket.io implementation

```javascript
var io = require('socket.io').listen(app);
io.sockets.on('connection', function (socket) {
    socket.emit('connect', true);

    socket.on('message', function (data) {
        socket.broadcast.emit('message', data);
    });
});
```

Node.js server is expected to fire two events:

1. `connect` which is used to understand whether socket.io connection is opened
2. `message` which is used to get transmitted messages

Node.js must catch messages passed from client-side and broadcast/transmit that message over all other connected sockets.

=

#### A full-fledge socket.io implementation / [Source Code](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/socketio-over-nodejs)

Node.js server:

```javascript
var port = 8888;

var app = require('express')(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

server.listen(port);

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
```

=

Client side:

```javascript
connection.openSignalingChannel = function(config) {
   var SIGNALING_SERVER = 'http://socketio-over-nodejs.hp.af.cm';
   var channel = config.channel || this.channel || 'default-channel';
   var sender = Math.round(Math.random() * 60535) + 5000;
   
   io.connect(SIGNALING_SERVER).emit('new-channel', {
      channel: channel,
      sender : sender
   });
   
   var socket = io.connect(SIGNALING_SERVER + channel);
   socket.channel = channel;
   
   socket.on('connect', function () {
      if (config.callback) config.callback(socket);
   });
   
   socket.send = function (message) {
        socket.emit('message', {
            sender: sender,
            data  : message
        });
    };
   
   socket.on('message', config.onmessage);
};
```

All WebRTC Experiments separated signaling portion; so you can define a single method to control the entire infrastructure of WebRTC Signaling!

`openSignalingChannel` or `openSocket` are kind of those "custom" reusable methods.

=

#### What about latest WebRTC experiments and libraries?

**All latest WebRTC experiments and libraries are capable to work with each and every gateway exists in the world!**

Taking node.js for instance; your server code looks like this:

```javascript
io.sockets.on('connection', function (socket) {
    socket.on('message', function (data) {
        socket.broadcast.emit('message', data);
    });
});
```

And web-browser side code looks like this:

```javascript
connection.openSignalingChannel = function(callback) {
    return io.connect().on('message', callback);
};
```

Want to use XHR, WebSockets, SIP, XMPP, etc. for signaling? Read [this post](https://github.com/muaz-khan/WebRTC-Experiment/issues/56#issuecomment-20090650).

=

#### What about Firebase?

Firebase is an io-based service stores data in JSON format; considered most suitable solution for WebRTC signaling. Its APIs are easier to use and understand. Firebase supports dynamic channels too!

=

#### What about PubNub or Pusher?

PubNub or Pusher provides APIs for realtime connection. PubNub uses wider methods and techniques.

=

#### Expectations

All "old" WebRTC experiments expects that signaling channels must be able to send and receive messages over unique channels.

All "new" WebRTC experiments can work in any circumstance!

=

#### Links

1. [Socket.io over Node.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/socketio-over-nodejs)
2. [WebSockets over Node.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/websocket-over-nodejs)

=

#### License

[WebRTC Experiments](https://github.com/muaz-khan/WebRTC-Experiment) are released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
