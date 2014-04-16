## MultiRTC / A Demo application for [RTCMultiConnection.js](http://www.RTCMultiConnection.org/docs/)!

1. Source Code: https://github.com/muaz-khan/WebRTC-Experiment/tree/master/MultiRTC-simple
2. Demo: https://www.webrtc-experiment.com/RTCMultiConnection/MultiRTC/
3. RTCMultiConnection.js: http://www.RTCMultiConnection.org/docs/

=

## Note: 

[This MultiRTC Demo](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/MultiRTC-simple) is using [WebSockets over Nodejs](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/websocket-over-nodejs) for signaling and presence detection!

You can easily use any signaling implementation; whether it is Socket.io or XHR-Long polling or SIP/XMPP or WebSync/SignalR etc. [Read more here](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md)!

=

### How it works?

1. It opens [WebRTC](https://www.webrtc-experiment.com/) data connection same like Skype!
2. Multiple users can join same room; text chat and share multiple files concurrently!
3. Choose your own URL! Users from one room can't access data or join users from other rooms.
4. Anyone can add any media stream any-time! Whether it is screen; or audio/video.
5. An advance settings section allows you customize many RTCMultiConnection features in one place!

It is an All-in-One solution for [RTCMultiConnection.js](http://www.RTCMultiConnection.org/docs/)!

=

### Presence Detection!

Presence detection is handled by [websocket-over-nodejs](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/websocket-over-nodejs)! Open `ui.main.js` file and go to line 79.

```javascript
// use "channel" as sessionid or use custom sessionid!
var roomid = connection.channel;

var SIGNALING_SERVER = 'wss://wsnodejs.nodejitsu.com:443';
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

=

### [websocket-over-nodejs](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/websocket-over-nodejs) for signaling!

Open `ui.peer-connection.js` and go to line 15.

```javascript
// wss://wsnodejs.nodejitsu.com:443
// ws://wsnodejs.nodejitsu.com:80
// wss://www.webrtc-experiment.com:8563

var SIGNALING_SERVER = 'wss://wsnodejs.nodejitsu.com:443';
connection.openSignalingChannel = function(config) {
    config.channel = config.channel || this.channel;
    var websocket = new WebSocket(SIGNALING_SERVER);
    websocket.channel = config.channel;
    websocket.onopen = function() {
        websocket.push(JSON.stringify({
            open: true,
            channel: config.channel
        }));
        if (config.callback)
            config.callback(websocket);
    };
    websocket.onmessage = function(event) {
        config.onmessage(JSON.parse(event.data));
    };
    websocket.push = websocket.send;
    websocket.send = function(data) {
        websocket.push(JSON.stringify({
            data: data,
            channel: config.channel
        }));
    };
}
```

=

##### License

[RTCMultiConnection.js](http://www.RTCMultiConnection.org/) WebRTC Library is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
