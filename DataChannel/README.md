#### [DataChannel.js](https://webrtc-experiment.appspot.com/DataChannel.js) : A JavaScript wrapper library for RTCDataChannel APIs / [Demo](https://webrtc-experiment.appspot.com/DataChannel/)

DataChannel library highly simplifies coding. It also supports fallback to socket.io/websockets/firebase or other your own preferred signaling method. It allows you:

1. Send file directly — of any size
2. Send text-message of any length
3. Send data directly
4. Simplest syntax ever! Same like WebSockets.
5. Supports fallback to socket.io/websockets/etc.
6. Auto users' presence detection
7. Allows you eject any user; or close your entire data session

**DataChannel.js** supports **fallback** to `websocket`/`socket.io` or your other preferred signaling method.

Syntax of **DataChannel.js** is same like **WebSockets**.

#### First Step: Link the library

```html
<script src="https://webrtc-experiment.appspot.com/DataChannel.js"></script>
```

#### Second Step: Start using it!

Data sessions will be auto created/joined if and only if `channel-name` is passed over the constructor.

```javascript
var channel = new DataChannel('channel-name');

// to manually create/open a new channel
channel.open('channel-name');

// if someone already created a channel; to manually join him: use "connect" method
channel.connect('channel-name');

// to send text/data or file
channel.send(file || data || 'text');
```

#### Detect users' presence

To be alerted if a user leaves your room:

```javascript
channel.onUserLeft = function(userid) {
    // remove that user's photo/image using his user-id
};
```

#### Manually eject a user or close your data session

```javascript
channel.leave(userid);  // throw a user out of your room!
channel.leave();        // close your own entire data session
```

Following things will happen if you are a room owner and you tried to close your data session using `channel.leave()`:

1. The entire data session (i.e. all peers, sockets and data ports) will be closed. (from each and every user's side)
2. All participants will be alerted about room owner's (i.e. yours) action. They'll unable to send any single message over same room because everything is closed!

#### Note

DataChannel.js will never "auto" reinitiate the data session.

#### `user-id` over `onopen` method

```javascript
channel.onopen = function(userid) {
    // user.photo.id = userid; ---- see "onUserLeft" and "leave" above ?
}
```

Remember, A-to-Z, everything is optional! You can set `channel-name` in constructor or in `open`/`connect` methods. It is your choice! 

#### Additional 

```javascript
// to be alerted on data ports get open
channel.onopen = function(userid) {}

// to be alerted on data ports get new message
channel.onmessage = function(message) {}
```

#### Set direction — Group data sharing or One-to-One

```javascript
// by default; connection is [many-to-many]; you can use following directions
channel.direction = 'one-to-one';
channel.direction = 'one-to-many';
channel.direction = 'many-to-many';	// --- it is default direction
```

#### Progress helpers when sharing files

```javascript
// show progress bar!
channel.onFileProgress = function (packets) {
    // packets.remaining
    // packets.sent      (for sender)
    // packets.received  (for receiver)
    // packets.length
};

// on file successfully sent
channel.onFileSent = function (file) {
    // file.name
    // file.size
};

// on file successfully received
channel.onFileReceived = function (fileName) {};
```

#### Errors Handling

```javascript
// error to open data ports
channel.onerror = function(event) {}

// data ports suddenly dropped
channel.onclose = function(event) {}
```

#### Use your own socket.io for signaling

```javascript
// by default Firebase is used for signaling; you can override it
channel.openSignalingChannel = function(config) {
    var socket = io.connect('http://your-site:8888');
    socket.channel = config.channel || this.channel || 'default-channel';
    socket.on('message', config.onmessage);

    socket.send = function (data) {
        socket.emit('message', data);
    };

    if (config.onopen) setTimeout(config.onopen, 1);
    return socket;
}
```

#### Demos using [DataChannel.js](https://webrtc-experiment.appspot.com/DataChannel.js)

1. [DataChannel basic demo](https://webrtc-experiment.appspot.com/DataChannel/)
2. [Auto Session Establishment and Users presence detection](https://webrtc-experiment.appspot.com/DataChannel/auto-session-establishment/)

#### Browser Support

[DataChannel.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/DataChannel) works fine on following browsers:

| Browser        | Support           |
| ------------- |:-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Internet Explorer / IE | [Chrome Frame](http://www.google.com/chromeframe) |

----

#### License

[DataChannel.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/DataChannel) is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
