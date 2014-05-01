## [MultiRTC](https://www.webrtc-experiment.com/RTCMultiConnection/MultiRTC/) / A Demo application for [RTCMultiConnection.js](http://www.RTCMultiConnection.org/docs/)!

1. Source Code: https://github.com/muaz-khan/WebRTC-Experiment/tree/master/MultiRTC
2. Similar Demo: https://www.webrtc-experiment.com/RTCMultiConnection/MultiRTC/
3. RTCMultiConnection.js: http://www.RTCMultiConnection.org/docs/

<img src="https://www.webrtc-experiment.com/images/MultiRTC.gif" />

<a href="https://nodei.co/npm/multirtc/">
    <img src="https://nodei.co/npm/multirtc.png">
</a>

```
// Dependencies: 
// 1) socket (npm install websocket)
// 2) node-static (npm install node-static)

npm install multirtc

// to run it!
cd node_modules/multirtc/ && node signaler.js
```

Now, both WebSocket and HTTPs servers are running at port `12034`:

```
https://localhost:12034/
```

=

## Note: 

[This MultiRTC Demo](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/MultiRTC-simple) is using [WebSockets over Nodejs](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/websocket-over-nodejs) for signaling and presence detection!

You can easily use any signaling implementation; whether it is Socket.io or XHR-Long polling or SIP/XMPP or WebSync/SignalR etc. [Read more here](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md)!

Follow these steps to use other signaling servers:

1. Cut code from "public" directory and paste in a unique directory.
2. Now, open `ui.peer-connection.js` and go to line 14. [You can override your own `openSignalingChannel`](http://www.rtcmulticonnection.org/docs/openSignalingChannel/).
3. Now, open `ui.main.js` and go to line 94. You can easily change websocket to socket.io or any other implementation.

and that's it!

=

### What is MultiRTC?

1. It is a skype-like demo using WebRTC for realtime connections!
2. It allows you enable/disable webcams; and join with or without webcams!
3. It allows you share screen using existing peer connections!
4. It allows you share files with preview and download links!
5. It allows you **auto translate incoming messages** in [your own language](http://www.rtcmulticonnection.org/docs/language/)!
6. It gives you full control over bandwidth and screen resolutions!
7. It allows you adjust file sharing speed yourself by setting [chunk-size](http://www.rtcmulticonnection.org/docs/chunkSize/) and [chunk-intervals](http://www.rtcmulticonnection.org/docs/chunkInterval/)!
8. It allows you test all WebRTC features by enabling/disabling some check-boxes!

Demo here: https://www.webrtc-experiment.com/RTCMultiConnection/MultiRTC/

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
