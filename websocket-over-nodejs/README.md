#### [WebSocket over Node.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/websocket-over-nodejs) / [Demo](https://www.webrtc-experiment.com/websocket/)

This experiment is using **WebSocket over Node.js** for signaling. Follow these steps:

1. Download and extract **ZIP file** of this repository then copy `folder-location` of the`multisockets.js` file
2. Open **Node.js command prompt**
3. Type command `cd folder-location` where `folder-location` can be `C:\websocket-over-nodejs`
4. Type `npm install websocket` to install the dependency
5. Type `node multisockets` or type `node latest` to run the node.js server

OK, now you can use following URLs: 

1. `wss://localhost:1337/`
2. `ws://localhost:1338/`

=

#### If you want to deploy your application

1. Create an account at `nodejitsu`
2. Use same **Node.js command prompt** window
3. Type `jitsu deploy` 

and you're done!

**Remember:** `jitsu deploy` command will deploy the entire directory containing all all files including `node_modules` (i.e. dependencies).

=

#### How to use?

In `ui.js` files you can find `openSocket` method; or in all libraries; you can find `openSignalingChannel` method.

```javascript
var SIGNALING_SERVER = 'ws://' + document.domain + ':1338/';
connection.openSignalingChannel = function(config) {
    config.channel = config.channel || this.channel || 'default-channel';
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

#### Signaling Concepts

Interested to understand WebRTC Signaling Concepts? Read [this document](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/socketio-over-nodejs/Signaling-Concepts.md).

=

#### License

[WebSocket over Node.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/websocket-over-nodejs) is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
