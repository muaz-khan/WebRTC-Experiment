#### [WebSocket over Node.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/websocket-over-nodejs) / [Demo](https://www.webrtc-experiment.com/websocket/) [![npm](https://img.shields.io/npm/v/websocket-over-nodejs.svg)](https://npmjs.org/package/websocket-over-nodejs) [![downloads](https://img.shields.io/npm/dm/websocket-over-nodejs.svg)](https://npmjs.org/package/websocket-over-nodejs)

This repository has following kinds of browser-based demos:

1. Text Chat using rooms
2. Text Chat without rooms
3. WebRTC Peer Connection using rooms

You can see three node.js files:

1. signaler.js - HTTP based websocket signaling along with creating websocket channels i.e. rooms
2. ssl.js - HTTPs i.e. SSL based websocket signaling along with creating websocket channels i.e. rooms
3. simple.js - HTTP based websocket signaling however NO-room

=

#### How to use?

Following code explains how to override [`openSignalingChannel`](http://www.rtcmulticonnection.org/docs/openSignalingChannel/) method in your HTML pages; `openSignalingChannel` is useful only for RTCMultiConnection.js and DataChannel.js. For other WebRTC Experiments, please check next section.

```javascript
// wss://wsnodejs.nodejitsu.com:443 (Secure port: HTTPs)
// ws://wsnodejs.nodejitsu.com:80 (Ordinary port: HTTP)

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

#### How to use for `openSocket`?

`openSocket` is used in all standalone WebRTC Experiments. You can define this method in your `ui.js` file or in your HTML page.

```javascript
// wss://wsnodejs.nodejitsu.com:443 (Secure port: HTTPs)
// ws://wsnodejs.nodejitsu.com:80 (Ordinary port: HTTP)

var SIGNALING_SERVER = 'wss://wsnodejs.nodejitsu.com:443';
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

=

#### Presence Detection

You can detect presence of any channel/room; and invoke open/join methods accordingly!

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

A simple example using same "presence detection" feature:

* https://github.com/muaz-khan/WebRTC-Experiment/tree/master/MultiRTC-simple

=

#### Dependencies

1. WebSocket - for websocket over node.js connection
2. Node-Static - for serving static resources i.e. HTML/CSS/JS files

=

#### Install via `npm`

```
npm install websocket-over-nodejs
```

and run the `signaler.js` nodejs file:

```
node node_modules/websocket-over-nodejs/signaler.js
```

Now, you can open port "12034" on your ip address/domain; or otherwise on localhost: `http://localhost:12034/`

=

#### Install on Linux/Ubuntu/CentOS/Debian/Mac etc.

```
# create a directory
mkdir websocket-over-nodejs

# open directory
cd websocket-over-nodejs

# get package
wget http://cdn.webrtc-experiment.com/packages/websocket-over-nodejs.tar

# extract package
tar -xf websocket-over-nodejs.tar

# run node.js server
node signaler.js
```

Now, you can open port `12034` on your ip address/domain; or otherwise on localhost: `http://localhost:12034/`

It is using port `12034`; you can edit this port using following commands:

```
vi signaler.js

# now edit port 12034
# and save changes & quit

# press "insert" key; then press "Esc" key and the type
:wq
```

`:wq` command saves changes in the file and exits editing mode. If you don't want to save changes; simply type:

```
# if you don't want to save changes however want to exit editing mode
:q
```

Common Error: `Error: listen EADDRINUSE`. It means that same port is used by another application. You can close all existing processes running on same port:

```
// list all active processes running on same port
sudo fuser -v 12034/tcp

// kill all processes running on port "12034"
sudo fuser -vk 12034/tcp

// list again to verify closing ports
sudo fuser -v 12034/tcp
```

You can delete "directory" and re-install:

```
rm -rf websocket-over-nodejs
mkdir websocket-over-nodejs

# and following above steps to "wget" and "tar" then "node" to run!
```

Following error doesn't matter!!! Simply skip it!

```
Warning: Native modules not compiled.  XOR performance will be degraded.
Warning: Native modules not compiled.  UTF-8 validation disabled.
```

=

#### Download ZIP on windows

http://cdn.webrtc-experiment.com/packages/websocket-over-nodejs.zip

=

#### Test Demos

```
// replace "localhost" with your domain name!
http://localhost:12034/index.html
http://localhost:12034/one-to-one-peerconnection.html
http://localhost:12034/text-chat-with-simple-websocket.html
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
  main: "signaler.js",
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

// or
var websocket = new WebSocket('ws://subdomain.nodejitsu.com:80');

// or SSL
var websocket = new WebSocket('wss://subdomain.nodejitsu.com:443');
```

=

#### Signaler.js or SSL.js

```javascript
// setting room name
var channelName = location.href.replace(/\/|:|#|%|\.|\[|\]/g, ''); // using URL as room-name

// setting up websocket connection
var websocket = new WebSocket('ws://localhost:12034');

// capturing "onopen" event
websocket.onopen = function () {
    // suggesting node.js server to open a websocket room i.e. channel!
    websocket.push(JSON.stringify({
        open: true,
        channel: channelName
    }));
};

// overriding "send" method to customize default behavior!
websocket.push = websocket.send;
websocket.send = function (data) {
    websocket.push(JSON.stringify({
        data: data,
        channel: channelName
    }));
};

// capturing "onmessage" event!
websocket.onmessage = function (e) {
    console.log(JSON.parse(e.data));
};
```

=

https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md

=

#### License

[WebSocket over Node.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/websocket-over-nodejs) is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
