1. https://www.webrtc-experiment.com/docs/WebRTC-Signaling-Concepts.html
2. http://www.RTCMultiConnection.org/FAQ/
3. http://www.RTCMultiConnection.org/docs/sessionid/
4. http://www.RTCMultiConnection.org/docs/channel-id/

=

##### Realtime/Working [WebRTC Experiments](https://www.webrtc-experiment.com/) & Signaling

=

##### Signaling for RTCMultiConnection-v1.4 and earlier releases

```javascript
var SIGNALING_SERVER = 'http://socketio-over-nodejs.hp.af.cm';
connection.openSignalingChannel = function(config) {   
   var channel = config.channel || this.channel || 'one-to-one-video-chat';
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

=

##### Signaling for all latest experiments and newer releases.

Your server-side node.js code looks like this:

```javascript
io.sockets.on('connection', function (socket) {
    socket.on('message', function (data) {
        socket.broadcast.emit('message', data);
    });
});
```

And to override `openSignalingChannel` on the client side:

```javascript
connection.openSignalingChannel = function(callback) {
    return io.connect().on('message', callback);
};
```

Want to use XHR, WebSockets, SIP, XMPP, etc. for signaling? Read [this post](https://github.com/muaz-khan/WebRTC-Experiment/issues/56#issuecomment-20090650).

=

#### Want to use [Firebase](https://www.firebase.com/) for signaling?

```javascript
connection.openSignalingChannel = function (config) {
    var channel = config.channel || location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');
    
    var socket = new Firebase('https://chat.firebaseIO.com/' + channel);
    socket.channel = channel;
    
    socket.on('child_added', function (data) {
        config.onmessage(data.val());
    });
    
    socket.send = function(data) {
        this.push(data);
    };
    
    config.onopen && setTimeout(config.onopen, 1);
    socket.onDisconnect().remove();
    return socket;
};

```

=

#### Want to use [PubNub](http://www.pubnub.com/) for signaling?

```javascript
connection.openSignalingChannel = function (config) {
    var channel = config.channel || location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');
    var socket = io.connect('https://pubsub.pubnub.com/' + channel, {
        publish_key: 'demo',
        subscribe_key: 'demo',
        channel: config.channel || channel,
        ssl: true
    });
    socket.channel = channel;
    if (config.onopen) socket.on('connect', config.onopen);
    socket.on('message', config.onmessage);
    return socket;
};
```

=

#### Signaling Concepts

Interested to understand WebRTC Signaling Concepts? Read [this document](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/socketio-over-nodejs/Signaling-Concepts.md).

=

##### License

[WebRTC Experiments](https://www.webrtc-experiment.com/) are released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
