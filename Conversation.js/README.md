## [Conversation.js](https://github.com/muaz-khan/Conversation.js) runs top over [RTCMultiConnection.js](http://www.RTCMultiConnection.org/)  [![npm](https://img.shields.io/npm/v/conversationjs.svg)](https://npmjs.org/package/conversationjs) [![downloads](https://img.shields.io/npm/dm/conversationjs.svg)](https://npmjs.org/package/conversationjs)

Conversation.js is inspired by skype; and it provides simple events-like API to manage conversations, enable/disable media devices; add/download files; and do anything supported by Skype.

It allows you open data conversation between two or more users using their user-ids.

It is <a href="https://www.webrtc-experiment.com/licence/">MIT Licenced</a>, which means that you can use it in any commercial/non-commercial product, free of cost.

```
npm install conversationjs
```

To use it:

```htm
<script src="./node_modules/conversationjs/conversation.js"></script>
```

## [Demos](https://www.webrtc-experiment.com/Conversationjs/) using [Conversation.js](https://github.com/muaz-khan/Conversation.js)

<ol>				
                <li>
					<a href="https://www.webrtc-experiment.com/Conversationjs/AndroidRTC/">AndroidRTC</a>
                </li>
                
                <li>
					<a href="https://www.webrtc-experiment.com/Conversationjs/search-user.html">Search Users</a>
                </li>
                
                <li>
					<a href="https://www.webrtc-experiment.com/Conversationjs/cross-language-chat.html">Cross-Language (Multi-Lingual) Text Chat</a>
                </li>
                
                <li>
                    <a href="https://www.rtcmulticonnection.org/conversationjs/demos/">Old Conversation.js demos</a>
                </li>
</ol>

## Gif Presentation

* https://cdn.webrtc-experiment.com/images/AndroidRTC.gif

## Link the library

```html
<script src="//cdn.webrtc-experiment.com/RTCMultiConnection.js"></script>
<script src="//cdn.webrtc-experiment.com/conversation.js"></script>
```

=

## Open simple conversation between two users

```javascript
var websocket = new WebSocket('ws://domain:port/');

// initializing constructor
var signaler = new Signaler();

// whatever sent from conversation.js
signaler.on('message', function(message) {
    // here, you received message from conversation.js
    // send message over WebSocket connection
    websocket.send(JSON.stringify(message));
});

// your websocket listener that subscribes
// for all messages broadcasted from WebSockets connection
websocket.onmessage = function(event) {
    var message = JSON.parse(event.data);
    
    // here, you received a message from websocket server
    // pass message to conversation.js
    signaler.emit('message', message);
});

var user = new User();

// connect user to signaler
signaler.connect(user);

// invoke this method to open conversation with any user
user.openconversationwith('target-username');

// this event is fired when conversation is opened
user.on('conversation-opened', function (conversation) {
    // conversation.targetuser

    // emit a message to target user
    // conversation.emit('message', 'hello there');

    conversation.on('message', function (event) {
        console.log(event.username, event.data);
    });

    // enable your microphone and tell target user about it; he can 
    // also enable his microphone or he can simply listen your voice!
    // conversation.emit('enable', 'microphone');

    conversation.on('media-enabled', function (media) {
        // media.type == 'audio' || 'video' || 'screen'
        // media.hasmicrophone == true || null
        // media.hascamera == true || null
        // media.hasscreen == true || null
        // media.sender == 'string'
        
        media.emit('join-with', 'microphone');
    });
});
```

## How to use socket.io?

```javascript
var socket = io.connect();

// initializing constructor
var signaler = new Signaler();

// whatever sent from conversation.js
signaler.on('message', function(message) {
    // here, you received message from conversation.js
    // pass/emit message to node.js
    socket.emit('message', message);
});

// your socket.io listener that subscribes
// for all messages broadcasted from Node.js
socket.on('message', function(message) {
    // here, you received a message from node.js server
    // pass message to conversation.js
    signaler.emit('message', message);
});

// connect user to signaler
signaler.connect(user);
```

## How to use WebSockets?

```javascript
var websocket = new WebSocket('ws://domain:port/');

// initializing constructor
var signaler = new Signaler();

// whatever sent from conversation.js
signaler.on('message', function(message) {
    // here, you received message from conversation.js
    // send message over WebSocket connection
    websocket.send(JSON.stringify(message));
});

// your websocket listener that subscribes
// for all messages broadcasted from WebSockets connection
websocket.onmessage = function(event) {
    var message = JSON.parse(event.data);
    
    // here, you received a message from websocket server
    // pass message to conversation.js
    signaler.emit('message', message);
});

// connect user to signaler
signaler.connect(user);
```

## How to set defaults?

"defaults" are default properties, objects and methods that are applied to RTCMultiConnection object.

See list of all such properties here: http://www.rtcmulticonnection.org/docs/

```javascript
user.defaults = {
    log: true, // for production use only.
    trickleIce: true, // for SIP/XMPP and XHR
    getExternalIceServers: false, // ice-servers from xirsys.com
    leaveOnPageUnload: true,
    iceServers: [{
        url: 'stun:stun.l.google.com:19302'
    }],
    iceProtocols: {
        tcp: true,
        udp: true
    },
    candidates: {
        host: true,      // local/host candidates
        reflexive: true, // STUN candidates
        relay: true      // TURN candidates
    },
    autoReDialOnFailure: false, // renegotiation will not work if it is true
    body: document.body || document.documentElement
};
```

## How to accept/reject friend requests?

```javascript
user.on('friend-request', function (request) {
    if (window.confirm('Do you want to accept friend-request made by ' + request.sender + '?')) {
        request.accept();
    } else {
        request.reject();
    }
});
```

## How to check friend-request status?

```javascript
user.on('request-status', function (request) {
    if (request.status == 'accepted') {
        alert(request.sender + ' accepted your request.');
    }
    if (request.status == 'rejected') {
        alert(request.sender + ' rejected your request.');
    }
});
```

## How to emit events to multiple users?

```javascript
document.querySelector('#chat-message').onchange = function (event) {
    user.peers.emit('message', this.value);
};

document.querySelector('#enable-microphone').onclick = function () {
    user.peers.emit('enable', 'microphone');
};

document.querySelector('#enable-camera').onclick = function () {
    user.peers.emit('enable', 'camera');
};

document.querySelector('#enable-screen').onclick = function () {
    user.peers.emit('enable', 'screen');
};
```

## How to share files?

```javascript
document.querySelector('input[type=file]').onchange = function () {
    user.peers.emit('add-file', this.files);
};
```

## How to check if target user added file?

```javascript
conversation.on('add-file', function (file) {
    file.download();

    // or file.cancel();
});
```

## How to check file-download progress?

```javascript
conversation.on('file-progress', function (progress) {
    console.log('percentage %', progress.percentage);
    // progress.file.name
    // progress.sender
});
```

## How to save downloaded file to disk?

```javascript
conversation.on('file-downloaded', function (file) {
    // file.sender
    file.savetodisk();
});
```

## How to check if file is successfully sent?

```javascript
conversation.on('file-sent', function (file) {
    // file.sender
    console.log(file.name, 'sent.');
});
```

## How to check if target user refused to receive your file?

```javascript
conversation.on('file-cancelled', function (file) {
    // file.sender
    console.log(file.name, 'cancelled.');
});
```

## Demos

* https://www.rtcmulticonnection.org/conversationjs/demos/

## Credits

[Muaz Khan](https://github.com/muaz-khan):

1. Personal Webpage: http://www.muazkhan.com
2. Email: muazkh@gmail.com
3. Twitter: https://twitter.com/muazkh and https://twitter.com/WebRTCWeb
4. Google+: https://plus.google.com/+WebRTC-Experiment
5. Facebook: https://www.facebook.com/WebRTC

## License

[Conversation.js](https://github.com/muaz-khan/Conversation.js) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
