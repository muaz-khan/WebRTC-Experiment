#### [WebSocket over Node.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/websocket-over-nodejs) / [Demo](http://websocket-over-nodejs.jit.su/)

This experiment is using **WebSocket over Node.js** for signaling. Follow these steps:

1. Download **ZIP file** of this repository 
2. Extract and then copy `folder-location` of the`signaler.js` file
3. Open **Node.js command prompt**
4. Type command `cd folder-location` where `folder-location` can be `C:\websocket-over-nodejs`
5. Type `node signaler`

`http://localhost:9999/` will be auto-opened.

----

#### If you want to deploy your application

1. Create an account at `nodejitsu`
2. Use same **Node.js command prompt** window
3. Type `jitsu deploy` 

and you're done!

----

#### How to use?

In `ui.js` files you can find `openSocket` method; or in all libraries; you can find `openSignalingChannel` method.

```javascript
var SIGNALING_SERVER = 'ws://' + document.domain + ':8888/';
openSignalingChannel: function(config) {
    config.channel = config.channel || 'default-channel';
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

----

#### Presence Detection

You can detect presence of a channel like this:

```javascript
var SIGNALING_SERVER = 'ws://' + document.domain + ':8888/';
function testChannelPresence(channel) {
    var websocket = new WebSocket(SIGNALING_SERVER);
    websocket.onopen = function () {
        websocket.send(JSON.stringify({
            checkPresence: true,
            channel: channel
        }));
    };
    websocket.onmessage = function (event) {
        isChannelPresent = JSON.parse(event.data).isChannelPresent;
        if (!isChannelPresent) startNewSession();

        console.log('is channel present', isChannelPresent);
    };
}

// test whether default channel already created or not!
testChannelPresence('default-channel');
```

----

#### Ports

Port `8888` is used for WebSocket server:

```javascript
var wss = new WebSocketServer({
    port: 8888
});
```

And port `9999` is used for HTTP listening. Port `80` is not used because sometimes it fails to run `http://localhost:80/` out of conflict with existing web servers.

```javascript
var app = require('express')(),
    server = require('http').createServer(app);
    server.listen('9999'); // use port 80 for non-localhost web servers
```

Because port `8888` is used for WebSocket server; you need to use it like this:

```javascript
var SIGNALING_SERVER = 'ws://' + document.domain + ':8888/';
var websocket = new WebSocket(SIGNALING_SERVER);
```

----

#### if fails to run....

Open `signaler.js` file and remove or comment all following lines:

```javascript
// following lines aimed to auto-open the browser
// you can remove them if causing failure
var childProcess = require('child_process'),
    openURL = 'http://localhost:9999/';

var chromeURL = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    firefoxURL = 'c:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe';

childProcess.spawn(chromeURL, ['-incognito', openURL]);
//childProcess.spawn(firefoxURL, ['-new-tab', openURL]);
```

Actually, these lines are auto-opening chrome/firefox instances.

----

#### What is `cd folder-location`?

Using this command; you can open project's directory (i.e. folder) in a command prompt window.

----

#### What is `node signaler`?

This command runs the `signaler.js` file as a Node.js instance. That file handles `WebSocket over Node.js` server side stuff.

----

#### What is `jitsu deploy`?

This command deploys the entire directory (i.e. project) over `nodejitsu` servers. You will be able to access your deployed project using URL like this:

```javascript
http://username.jit.su/
```

See the demo URL: http://websocket-over-nodejs.jit.su/

----

#### Are you beginner or totally novice?

1. To run `WebSocket over Node.js` on your computer; you need to download `node.js` software from `nodejs.org`.
2. If you're using windows; in the `Start Menus`; you can type `node` in the search-box. `Node.js command prompt` will be listed at the top.
3. You can use same command prompt to run any `node.js` file; also you can write `nodejitsu` commands in the same place e.g. `jitsu deploy` or `jitsu login` etc.
4. Default port `9999` is used for this experiment. You can manually open this URL: `http://localhost:9999/`

----

#### Signaling Concepts

Interested to understand WebRTC Signaling Concepts? Read [this document](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/socketio-over-nodejs/Signaling-Concepts.md).

----

#### License

[WebSocket over Node.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/websocket-over-nodejs) is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
