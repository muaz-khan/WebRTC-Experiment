#### WebRTC File Sharing i.e. Data Sharing / [Demo](https://www.webrtc-experiment.com/file-sharing/)

`DataConnection.js` library lets you:

1. Share file of any size
2. Share text message of any length
3. Text data regardless of the size and type

=

#### First Step: Link the library

```html
<script src="https://www.webrtc-experiment.com/data-connection.js"></script>
```

=

#### Last Step: Start using it!

```javascript
var connection = new DataConnection( /* 'optional::firebase-channel' */ );

// check pre-established connections
connection.check('connection-name');

document.getElementById('setup-new-connection').onclick = function() {
    connection.setup('connection-name');
};
```

=

#### Text Chat i.e. Text Sharing

```javascript
connection.send('longest possible text message');
```

You may want to share direct messages:

```javascript
connection.channels['user-id'].send('longest possible text message');
```

=

#### File Sharing

```javascript
connection.send(file);
```

You may want to share file between two unique users directly:

```javascript
connection.channels['user-id'].send(file);
```

Extra events:

```javascript
// show progress bar!
channel.onFileProgress = function (e) {
    // e.userid
    // var packets = e.packets;
	
    // packets.remaining
    // packets.sent      (for sender)
    // packets.received  (for receiver)
    // packets.length
};

// on file successfully sent
channel.onFileSent = function (e) {
    // e.userid
    
    // var file = e.file;
    // file.name
    // file.size
};

// on file successfully received
channel.onFileReceived = function (e) { /* e.fileName, e.userid */ };
```

=

#### Errors Handling

```javascript
// error to open data connection
connection.onerror = function(e) {}

// data ports suddenly dropped
connection.onclose = function(e) {}
```

=

#### Custom user-ids?

```javascript
connection.userid = 'username';
```

=

#### Custom signaling channel?

You can use each and every signaling channel:

1. SIP-over-WebSockets
2. WebSocket over Node.js/PHP/etc.
3. Socket.io over Node.js/etc.
4. XMPP/etc.
5. XHR-POST-ing

```javascript
connection.openSignalingChannel = function(callback) {
    return io.connect().on('message', callback);
};
```

If you want to write `socket.io over node.js`; here is the server code:

```javascript
io.sockets.on('connection', function (socket) {
    socket.on('message', function (data) {
        socket.broadcast.emit('message', data);
    });
});
```

That's it! Isn't it easiest method ever!

Want to use `Firebase` for signaling?

```javascript
// "chat" is your firebase id
connection.firebase = 'chat';
```

Want to use XHR, WebSockets, SIP, XMPP, etc. for signaling? Read [this post](https://github.com/muaz-khan/WebRTC-Experiment/issues/56#issuecomment-20090650).

=

#### Want to manually join rooms?

```javascript
connection.onconnection = function(room) {
    var button = document.createElement('button');
    button.onclick = function() {
        connection.join(room);
    };
};
```

`onconnection` is called for each new data connection; and `join` method allows you manually join previously created connections.

=

#### If someone leaves...

Participants' presence can be detected using `onuserleft`:

```javascript
connection.onuserleft = function(userid) {
    console.debug(userid, 'left');
};
```

=

#### Browser Support

This [DataConnection.js](https://www.webrtc-experiment.com/data-connection.js) library is compatible to following web-browsers:

| Browser        | Support           |
| ------------- |-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Android | [Chrome Beta](https://play.google.com/store/apps/details?id=com.chrome.beta&hl=en) |

=

#### License

[DataConnection.js](https://www.webrtc-experiment.com/data-connection.js) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
