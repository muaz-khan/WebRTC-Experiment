#### [Socket.io over Node.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/socketio-over-nodejs) / [Demo](http://webrtc-signaling.jit.su/) [![npm](https://img.shields.io/npm/v/socketio-over-nodejs.svg)](https://npmjs.org/package/socketio-over-nodejs) [![downloads](https://img.shields.io/npm/dm/socketio-over-nodejs.svg)](https://npmjs.org/package/socketio-over-nodejs)

**socket.io over node.js** for webrtc-signaling!

<a href="https://nodei.co/npm/socketio-over-nodejs/">
    <img src="https://nodei.co/npm/socketio-over-nodejs.png">
</a>

=

#### Install via `npm`

```
npm install socketio-over-nodejs
```

and run the `signaler.js` nodejs file:

```
// run simple HTTP server
node ./node_modules/socketio-over-nodejs/signaler.js

// run HTTPs server
node ./node_modules/socketio-over-nodejs/signaler-ssl.js
```

Now you can test: `http://localhost:8888/` or `https://localhost:8888/`

You can use ip-address `127.1.1` on Mac/Linux instead of `localhost`.

=

### Install on Linux/Ubuntu/CentOS/Debian/Mac etc.

```
# create a directory
mkdir socketio-over-nodejs

# open directory
cd socketio-over-nodejs

# get package
wget http://cdn.webrtc-experiment.com/packages/socketio-over-nodejs.tar

# extract package
tar -xf socketio-over-nodejs.tar

# run simple node.js server
node signaler.js

# run HTTPs server
node signaler-ssl.js
```

Now, you can open port `8888` on your ip address/domain; or otherwise on localhost: `http://localhost:8888/`

=

It is using port `8888`; you can edit this port using following commands:

```
vi signaler.js

# now edit port 8888
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
fuser -v 8888/tcp

// kill all processes running on port "8888"
fuser -vk 8888/tcp

// list again to verify closing ports
fuser -v 8888/tcp
```

You can delete "directory" and re-install:

```
rm -rf socketio-over-nodejs
mkdir socketio-over-nodejs

# and following above steps to "wget" and "tar" then "node" to run!
```

=

1. https://www.webrtc-experiment.com/docs/WebRTC-Signaling-Concepts.html
2. http://www.RTCMultiConnection.org/FAQ/
3. http://www.RTCMultiConnection.org/docs/sessionid/
4. http://www.RTCMultiConnection.org/docs/channel-id/

=

Otherwise, follow these steps:

1. Download and extract **ZIP file** of this repository then copy `folder-location` of the`signaler.js` file
2. Open **Node.js command prompt** window
3. Type command `cd folder-location` where `folder-location` can be `C:\socketio-over-nodejs`
4. Type `npm install express` or [download ZIP](http://code.snyco.net/node_modules/express.zip)
5. Type `npm install socket.io` or [download ZIP](http://code.snyco.net/node_modules/socket.io.zip)
6. Type `node signaler` to run the node.js server

Then open `http://localhost:8888/`.

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
// http://socketio-over-nodejs.hp.af.cm/
// http://socketio-over-nodejs.jit.su:80/
// http://webrtc-signaling.jit.su:80/

var SIGNALING_SERVER = 'https://webrtc-signaling.nodejitsu.com:443/';
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

=

#### `openSocket`

```javascript
var config = {
    openSocket: function (config) {
        // http://socketio-over-nodejs.hp.af.cm/
        // http://socketio-over-nodejs.nodejitsu.com:80/
        // http://webrtc-signaling.nodejitsu.com:80/

        var SIGNALING_SERVER = 'https://webrtc-signaling.nodejitsu.com:443/';

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

=

#### Presence Detection

You can detect presence of a room like this:

```javascript
// http://socketio-over-nodejs.hp.af.cm/
// http://socketio-over-nodejs.jit.su:80/
// http://webrtc-signaling.jit.su:80/

var SIGNALING_SERVER = 'https://webrtc-signaling.nodejitsu.com:443/';
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

=

#### What is `cd folder-location`?

Using this command; you can open project's directory (i.e. folder).

=

#### What is `node signaler`?

This command runs node.js server via `signaler.js` file. That file handles socket.io relevant stuff.

=

#### What is `jitsu deploy`?

This command deploys the **entire directory** (i.e. project, including all `node_modules` dependencies) over `nodejitsu` servers. You will be able to access your deployed project using URL like this:

```javascript
https://username.nodejitsu.com/
```

See the demo URL: https://webrtc-signaling.nodejitsu.com/

=

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

=

#### Are you beginner or totally novice?

1. To **run socket.io on your computer**; you need to [download](http://nodejs.org/download/) `node.js` software from `nodejs.org`.
2. If you're using windows; in the `Start Menus`; you can type `node` in the search-box. `Node.js command prompt` will be listed on the top.
3. You can use same command prompt to run any `node.js` file; also you can write `nodejitsu` commands in the same place e.g. `jitsu deploy` or `jitsu login` etc.
4. Default port `8888` is used for this experiment. You can manually open this URL: `http://localhost:8888/`

=

#### Signaling Concepts

Interested to understand WebRTC Signaling Concepts? Read [this document](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/socketio-over-nodejs/Signaling-Concepts.md).

=

#### SSL/TLS/HTTPS/Socket.io/Node.js ??

https://github.com/muaz-khan/WebRTC-Experiment/issues/62

=

#### License

[Socket.io over Node.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/socketio-over-nodejs) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
