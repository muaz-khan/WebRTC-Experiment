#### [WebSocket over Node.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/websocket-over-nodejs) / [Demo](https://www.webrtc-experiment.com/websocket/)

This experiment is using **WebSocket over Node.js** for signaling.

=

#### Install via `npm`

```
npm install websocket-over-nodejs
```

and run the `signaler.js` nodejs file:

```
node node_modules/websocket-over-nodejs/signaler.js
```

=

Otherwise, follow these steps:

1. Download and extract [**ZIP file**](https://github.com/muaz-khan/WebRTC-Experiment/archive/master.zip) of this repository then copy `folder-location`.
2. Open **Node.js command prompt**.
3. Type command `cd folder-location` where `folder-location` can be `C:\websocket-over-nodejs`.
4. Type `node signaler` to run the node.js server.

OK, now you can listen websocket URL like this:

```javascript
var websocket = new WebSocket('ws://localhost:8888/');
```

=

#### If you want to deploy your application

First of all; change **subdomain** in the `package.json` file:

```
{
  "name": "just-a-name",
  "subdomain": "must-be-unique",
  "scripts": {
    "start": "signaler.js"
  },
  "version": "0.0.0",
  "engines": {
    "node": "0.10.x"
  },
  "dependencies": {
    "websocket": "1.0.x"
  }
}
```

1. Create an account at `nodejitsu`
2. Use same **Node.js command prompt** window
3. Type `jitsu deploy` 

and you're done!

**Remember:** `jitsu deploy` command will deploy the entire directory containing all all files including `node_modules` (i.e. dependencies).

Now, you can listen your nodejitsu server like this:

```javascript
// Remember, must include port "80"!
var websocket = new WebSocket('ws://subdomain.jit.su:80');
```

=

#### How to use?

In `ui.js` files you can find `openSocket` method; or in all libraries; you can find `openSignalingChannel` method.

```javascript
// ws://wsnodejs.jit.su:80
// wss://www.webrtc-experiment.com:8563

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
