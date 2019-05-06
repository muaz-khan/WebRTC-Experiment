# [WebSocket over Node.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/websocket-over-nodejs) / [Demo](https://www.webrtc-experiment.com/FileBufferReader/) 

[![npm](https://img.shields.io/npm/v/websocket-over-nodejs.svg)](https://npmjs.org/package/websocket-over-nodejs) [![downloads](https://img.shields.io/npm/dm/websocket-over-nodejs.svg)](https://npmjs.org/package/websocket-over-nodejs)

#### Install

```sh
npm install websocket-over-nodejs
cd node_modules/websocket-over-nodejs
node server.js
```

Now open `https://localhost:9449/` or use this `wss://localhost.com:9449/`.

# How to use?

`openSocket` is used in all standalone WebRTC Experiments. You can define this method in your `ui.js` file or in your HTML page.

```javascript
var SIGNALING_SERVER = 'wss://localhost.com:9449/';
var config = {
    openSocket = function (config) {
        config.channel = config.channel || 'main-public-channel';

        var websocket = new WebSocket(SIGNALING_SERVER);
        websocket.channel = config.channel;
        websocket.onopen = function () {
            websocket.push(JSON.stringify({
                open: true,
                channel: config.channel
            }));
            if (config.callback)
                config.callback(websocket);
        };

        websocket.onmessage = function (event) {
            config.onmessage(JSON.parse(event.data));
        };

        websocket.push = websocket.send;
        websocket.send = function (data) {
            websocket.push(JSON.stringify({
                data: data,
                channel: config.channel
            }));
        };
    }
};
```

# Presence Detection

You can detect presence of any channel/room; and invoke open/join methods accordingly!

```javascript
// use "channel" as sessionid or use custom sessionid!
var roomid = connection.channel;

var SIGNALING_SERVER = 'wss://localhost.com:9449/';
var websocket = new WebSocket(SIGNALING_SERVER);

websocket.onmessage = function (event) {
    var data = JSON.parse(event.data);
  
    if (data.isChannelPresent == false) {
        connection.open();
    } else {
        connection.join(roomid);
    }
};

websocket.onopen = function () {
    websocket.send(JSON.stringify({
        checkPresence: true,
        channel: roomid
    }));
};
```

# License

[WebSocket over Node.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/websocket-over-nodejs) is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
