#### [Socket.io over Node.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/socketio-over-nodejs) / [Demo](http://webrtc-signaling.jit.su/)

This experiment is using **socket.io over node.js** for signaling. Follow these steps:

1. Download **ZIP file** of this repository 
2. Extract and then copy `folder-location` of the`signaler.js` file
3. Open **Node.js command prompt**
4. Type command `cd folder-location` where `folder-location` can be `C:\webrtc-signaling`
5. Type `node signaler`

`http://localhost:8888/` will be auto-opened.

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
var SIGNALING_SERVER = 'http://domain.com:8888/';
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

`io.connect(URL).emit('new-channel')` starts a new namespace that is used privately or publicly to transmit appropriate stuff e.g. room-details, participation-requests, SDP, ICE, etc.

----

#### Presence Detection

You can detect presence of a room like this:

```javascript
var SIGNALING_SERVER = 'http://localhost:8888/';
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
var SIGNALING_SERVER = '/';
```

This is the URL of your site. By default it will be equal to `http://localhost:8888/`.

It is strongly recommended to use absolute URL including port number:

```javascript
var SIGNALING_SERVER = 'http://domain.com:8888/';
```

----

#### Are you beginner or totally novice?

1. To run socket.io on your computer; you need to download `node.js` software from `nodejs.org`.
2. If you're using windows; in the `Start Menus`; you can type `node` in the search-box. `Node.js command prompt` will be listed at the top.
3. You can use same command prompt to run any `node.js` file; also you can write `nodejitsu` commands in the same place e.g. `jitsu deploy` or `jitsu login` etc.
4. Default port `8888` is used for this experiment. You can manually open this URL: `http://localhost:8888/`

----

#### Signaling Concepts

Interested to understand WebRTC Signaling Concepts? Read [this document](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/socketio-over-nodejs/Signaling-Concepts.md).

----

#### License

[Socket.io over Node.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/socketio-over-nodejs) is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
