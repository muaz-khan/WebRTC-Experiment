# [Socket.io over Node.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/socketio-over-nodejs) / [Demo](https://www.webrtc-experiment.com/video-conferencing/) 

[![npm](https://img.shields.io/npm/v/socketio-over-nodejs.svg)](https://npmjs.org/package/socketio-over-nodejs) [![downloads](https://img.shields.io/npm/dm/socketio-over-nodejs.svg)](https://npmjs.org/package/socketio-over-nodejs)

**socket.io over node.js** for webrtc-signaling!

<a href="https://nodei.co/npm/socketio-over-nodejs/">
    <img src="https://nodei.co/npm/socketio-over-nodejs.png">
</a>

#### `server.js` file

This is the file that I was running on `https://webrtcweb.com:9559/`. I'll recommend to modify and use this file.

```
npm install socketio-over-nodejs
```

# How to use?

In `ui.js` files you can find `openSocket` method; or in all libraries; you can find `openSignalingChannel` method.

```javascript
var SIGNALING_SERVER = 'https://socketio-over-nodejs2.herokuapp.com:443/';
connection.openSignalingChannel = function(config) {
   var channel = config.channel || this.channel || 'default-namespace';
   var sender = Math.round(Math.random() * 9999999999) + 9999999999;
   
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

`io.connect(URL).emit('new-channel')` starts a new namespace that is used privately or publicly to transmit/exchange appropriate stuff e.g. room-details, participation-requests, SDP, ICE, etc.

# `openSocket`

```javascript
var config = {
    openSocket: function (config) {
        var SIGNALING_SERVER = 'https://socketio-over-nodejs2.herokuapp.com:443/';

        config.channel = config.channel || location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');
        var sender = Math.round(Math.random() * 999999999) + 999999999;

        io.connect(SIGNALING_SERVER).emit('new-channel', {
            channel: config.channel,
            sender: sender
        });

        var socket = io.connect(SIGNALING_SERVER + config.channel);
        socket.channel = config.channel;
        socket.on('connect', function () {
            if (config.callback) config.callback(socket);
        });

        socket.send = function (message) {
            socket.emit('message', {
                sender: sender,
                data: message
            });
        };

        socket.on('message', config.onmessage);
    }
};

```

# Presence Detection

You can detect presence of a room like this:

```javascript
var SIGNALING_SERVER = 'https://socketio-over-nodejs2.herokuapp.com:443/';
function testChannelPresence(channel) {
    var socket = io.connect(SIGNALING_SERVER);
    socket.on('presence', function (isChannelPresent) {
        console.log('is channel present', isChannelPresent);
        if (!isChannelPresent) startNewSession();
    });
    socket.emit('presence', channel);
}

// test whether default channel already created or not!
testChannelPresence('default-channel');
```

# License

[Socket.io over Node.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/socketio-over-nodejs) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://MuazKhan.com).
