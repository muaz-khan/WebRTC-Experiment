#### Using [Socket.io over Node.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/socketio-over-nodejs) for WebRTC Signaling / [Demo](http://webrtc-signaling.jit.su/)

This experiment is using **socket.io over node.js** for signaling. Follow these steps:

1. Download **ZIP file** of this repository 
2. Extract and then copy `folder-location` of the`signaler.js` file
3. Open **Node.js command prompt**
4. Type command `cd folder-location`
5. Type `node signaler`

`http://localhost:8888/` will be auto-opened.

----

#### If you want to deploy your application

1. Create an account at `nodejitsu`
2. Use same **Node.js command prompt** window
3. Type `jitsu deploy` 

and you're done!

----

#### if fails to run....

Open `signaler.js` file and remove or comment all following lines:

```javascript
// following lines aimed to auto-open the browser
// you can remove them if causing failure
var childProcess = require('child_process'),
    openURL = 'http://localhost:8888/';

var chromeURL = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    firefoxURL = 'c:\\Program Files (x86)\\Mozilla Firefox\\firefox.exe';

childProcess.spawn(chromeURL, ['-incognito', openURL]);
//childProcess.spawn(firefoxURL, ['-new-tab', openURL]);
```

Actually, these lines are auto-opening chrome/firefox instances.

----

#### What is `cd folder-location`?

Using this command; you can open project's directory (i.e. folder).

----

#### What is `node signaler`?

This command runs the `signaler.js` file. That file handles socket.io server side stuff.

----

#### What is `jitsu deploy`?

This command deploys the entire directory (i.e. project) over `nodejitsu` servers. You will be able to access your deployed project using URL like this:

```javascript
http://username.jit.su/
```

See the demo URL: http://webrtc-signaling.jit.su/

----

#### Note

Each experiment is using something like this:

```javascript
var URL = '/';
```

This is the URL of your site. By default it will be equal to `http://localhost:8888/`.

It is strongly recommended to use absolute URL including port number:

```javascript
var URL = 'http://domain.com:8888/';
```

In `signaler.js` file; there is a function named `handler`. Sometimes (in case of failure) you need to use express framework to access/render files.

----

#### Are you beginner or totally novice?

To run socket.io on your computer; you need to download `node.js` software from `nodejs.org`.

If you're using windows; in the `Start Menus`; you type `node` in the search-box. `Node.js command prompt` will be listed at the top.

You can use same command prompt to run any `node.js` file; also you can write `nodejitsu` commands in the same place e.g. `jitsu deploy` or `jitsu login` etc.

Default port `8888` is used for this experiment. You can manually open this URL, localy: `http://localhost:8888/`

----

#### Are you want to use same socket.io implementation for other WebRTC Experiments?

You need to memorize following points:

1. Same like other WebRTC Experiments; `onmessage` is used to pass data; however `onopen` is skipped.
2. Instead of using `onopen`; `callback` is used.

For example; in other WebRTC Experiments; we're doing like this:

```javascript
defaultSocket = config.openSocket({
    onmessage: onDefaultSocketResponse
});
```

But we need to use something like this for current socket.io implementation:

```javascript
defaultSocket = config.openSocket({
    onmessage: onDefaultSocketResponse,
    callback : function (socket) {
        defaultSocket = socket;
    }
});
```

You can see `callback` additional object.

```javascript
// other firebase specific WebRTC Experiments are using code like this
var socketConfig = {
    channel  : _config.channel,
    onmessage: socketResponse,
    onopen : function () {
        if (isofferer && !peer) initPeer();
    }
};
```

But, for socket.io implementation; we need to use like this:

```javascript
var socketConfig = {
    channel  : _config.channel,
    onmessage: socketResponse,
    callback : function (_socket) {
        socket = _socket;
        if (isofferer && !peer) initPeer();
    }
};
```

And done!

Note: Each WebRTC Experiment has a method named `startBroadcasting` that is invoked by `room initiator`. You just need to use `if-block` to check whether `defaultSocket` is `null` or not:

```javascript
if(defaultSocket) defaultSocket.send(...);
```

----

```javascript
// openSignalingChannel or openSocket!
openSignalingChannel: function(config) {
   var URL = 'http://domain.com:8888/';
   var channel = config.channel || this.channel || 'one-to-one-video-chat';
   var sender = Math.round(Math.random() * 60535) + 5000;
   
   io.connect(URL).emit('new-channel', {
      channel: channel,
      sender : sender
   });
   
   var socket = io.connect(URL + channel);
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
}
```

`io.connect(URL).emit('new-channel')` starts a new namespace that is used privately or publicly to transmit appropriate stuff e.g. room-details, participation-requests, SDP, ICE, etc.

----

#### Signaling Concepts

Interested to understand WebRTC Signaling Concepts? Read [this document](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/socketio-over-nodejs/Signaling-Concepts.md).

----

All [WebRTC Experiments](https://webrtc-experiment.appspot.com) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Internet Explorer / IE | [Chrome Frame](http://www.google.com/chromeframe) |
| Android | [Chrome Beta](https://play.google.com/store/apps/details?id=com.chrome.beta&hl=en) |

----

#### License

[WebRTC Experiments](https://github.com/muaz-khan/WebRTC-Experiment) are released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
