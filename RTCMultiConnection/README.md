##### [RTCMultiConnection-v1.4](https://webrtc-experiment.appspot.com/RTCMultiConnection-v1.4.js) Documentation

Supports features like

1. audio/video/screen/data conferences (oneway/broadcast/many-to-many)
2. multiple streams renegotiation and removal of individual streams
3. mute/unmute of individual streams
4. users ejection/rejection and presence detection
5. multi as well as manual session establishment
6. sessions will be LIVE all the time; even if initiator leaves!

and much more.

=

##### Documentations History

1. [`RTCMultiConnection-v1.4`](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection)
2. [`RTCMultiConnection-v1.3`](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-v1.3.md)
3. [`RTCMultiConnection-v1.2 and earlier`](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-v1.2-and-earlier.md)
4. [`RTCMultiConnection-v1.5 --- experimental`](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-v1.5-experimental.md)

=

##### First Step: Link the library

```html
<script src="https://webrtc-experiment.appspot.com/RTCMultiConnection-v1.3.js"></script>
```

##### Second Step: Start using it!

```javascript
connection = new RTCMultiConnection();
connection.userid = 'muazkh'; // username or user-id!
connection.session = {
    audio: true,
    video: true
};

// get access to local or remote streams
connection.onstream = function (e) {
    if (e.type === 'local') mainVideo.src = e.blobURL;
    if (e.type === 'remote') document.body.appendChild(e.mediaElement);
}

// searching/connecting pre-created session
connection.connect('session-id');

// to create/open a new session
// it should be called "only-once" by the session-initiator
[button-init-session].onclick = function() {
    connection.open('session-id');
};
```

=

##### `onstream`

```javascript
connection.onstream = function (e) {
    // e.mediaElement
    // e.stream
    // e.streamid
    // e.session
    // e.blobURL
    // e.type
    // e.extra
    // e.userid
}
```

1. `mediaElement`: `HTMLVideoElement` or `HTMLAudioElement`
2. `stream`: `MediaStream` object
3. `streamid`: stream-id can be used to mute/unmute or remove individual streams
4. `session`: session object e.g. `{audio: true, video: true}`
5. `blobURL`: blob-URL of the stream
6. `type`: either `remote` or `local`
7. `extra`: extra data passed by the user
8. `userid`: id of the user stream coming from

=

##### `onstreamended`

`onstreamended` will be fired if media streams stopped flowing between two peers. It is preferred to use `onstreamended` to remove media elements instead of using `onleave`.

```javascript
connection.onstreamended = function(e) {
    e.mediaElement.parentNode.removeChild(e.mediaElement);
};
```

=

##### Renegotiation

Cases:

1. You're sharing files in a group; or doing text chat; and suddenly want to share audio/video or screen among a few users or the entire group.
2. In video-conferencing room; you want to sharing screen.
3. In audio-conferencing room; you want to share video or screen or data.
4. In screen sharing room; you want to share audio/video or data.

You want to use same peer-connection to append dynamic streams at runtime.

```javascript
// runtime sharing of audio/video among all users
connection.addStream({
    audio: true,
    video: true
});

// runtime sharing of screen among two unique users
// one is you; and other is person whose id is give below
connection.peers['user-id'].addStream({
    screen: true,
    oneway: true
});
```

Possible renegotiation pairs

1. `{audio: true, video: true}`
2. `{audio: true, video: true, data: true}`
3. `{screen: true, oneway: true}`
4. `{audio: true, video: true, broadcast: true}`

and many others.

=

##### `session`

Possible values for the `session` object:

```javascript
audio: true
video: true
data: true
screen: true

oneway: true
broadcast: true
```

=

##### Mute/UnMute/Stop

```javascript
// mute
connection.streams['stream-id'].mute({
    audio: true,
    video: true
});

// unmute
connection.streams['stream-id'].unmute({
    audio: true
});

// stop a stream
connection.streams['stream-id'].stop();
```

=

##### Detect users presence

```javascript
connection.onleave = function(e) {
    // e.userid
    // e.extra
};
```

=

##### Eject any user or close your own session

```javascript
connection.eject(userid); // throw a user out of your room!
connection.leave();       // close your own entire session
```

=

##### Auto Close Entire Session

When room initiator leaves; you can enforce auto-closing of the entire session. By default: it is `false`:

```javascript
connection.autoCloseEntireSession = true;
```

It means that session will be `LIVE` all the time; even if initiator leaves the session.

You can call `close` method to enforce closing of the entire session:

```javascript
connection.close(); // close entire session
```

=

##### Are you want to share files/text or data?

```javascript
// to send text/data or file of any size
connection.send(file || data || 'text');
```

Same like WebSockets; `onopen` and `onmessage` methods:

```javascript
// to be alerted on data ports get open
connection.onopen = function (e) {
    // e.userid
    // e.extra
}

// to be alerted on data ports get new message
connection.onmessage = function (e) {
    // e.data
    // e.userid
    // e.extra
}
```

=

##### Direct Messages

You can share data directly between two unique users using their user-ids:

```javascript
connection.channels['user-id'].send(file || data || 'text');
```

=

##### Progress helpers when sharing files

```javascript
// show progress bar!
connection.onFileProgress = function (packets) {
    // packets.remaining
    // packets.sent
    // packets.received
    // packets.length
};

// on file successfully sent
connection.onFileSent = function (file) {
    // file.name
    // file.size
};

// on file successfully received
connection.onFileReceived = function (fileName) { };
```

=

##### Errors Handling when sharing files/data/text

```javascript
// error to open data ports
connection.onerror = function (e) {
    // e.userid
    // e.extra
}

// data ports suddenly dropped
connection.onclose = function (e) {
    // e.userid
    // e.extra
}
```

=

##### Extra Data

You can pass extra-data like username, full name, location, bandwidth, etc.

```javascript
connection.extra = {
	username: 'muazkh',
	fullname: 'Muaz Khan',
	email: 'muazkh@gmail.com'
};
```

Your `extra-data` will be passed over `onNewSession`, `onmessage`, `onopen`, `onclose`, `onerror` and `onstream` methods:

```javascript
connection.onmessage = function(e){
    // userData = e.extra
    // userData.username
    // userData.fullname
    // userData.email
	
    // console.debug(userData.username, 'sent you a message', e.data);
};

connection.onNewSession = function(session) {
    // session.extra
};

connection.onstream = function(e){
    // e.extra
};

connection.onopen = function(e){
    // e.extra
};
``` 

=

##### Custom user-id

You can use custom `user-names` as user-id:

```javascript
connection.userid = 'custom-user-id';
```

See how user-id is used:

```javascript
connection.onopen = function(e) {
    // e.userid
}

connection.onclose = function(e) {
    // e.userid
}

connection.onerror = function(e) {
    // e.userid
}

connection.onstream = function(e) {
    // e.userid
}

connection.onmessage = function(e) {
    // e.userid
}
```

=

##### `onNewSession`

`onNewSession` is fired for each new session.

```javascript
connection.onNewSession = function(session) {
    // session.extra -- extra data you passed or empty object {}
    // session.sessionid -- it is session's unique identifier
    // session.userid -- it is room owner's id
    // session.session e.g. {audio:true, video:true}
};
```

`onNewSession` is useful to show a `join` button that allows end-users to manually join any preferred session.

=

##### Other features

```javascript
// It is room transmission interval; useful for socket.io implementations only.
connection.interval = 1000;

// It is useful only for Firebase signaling gateway!
connection.transmitRoomOnce = true;

// If you prefer using Firebase; you can provide your self-created firebase id.
connection.firebase = 'chat';

// if you want to attach external stream
// this feature is useful in multi-sessions initiations
connection.dontAttachStream = true; // it means that don't try to attach NEW stream
connection.attachStream = MediaStream;
```

=

##### Broadcasting/Conferencing/etc.

Three possible scenarios are supported:

1. One-to-Many `one-way` broadcasting
2. One-to-Many `two-way` broadcasting
3. Many-to-Many `video-conferencing`

For one-way broadcasting

```javascript
connection.stream = {
    oneway: true,
    screen: true
};
```

For two-way broadcasting

```javascript
connection.stream = {
    broadcast: true,
    audio: true
};
```

For video-conferencing; don't use `oneway` or `broadcast` values:

```javascript
connection.stream = {
    audio: true,
    video: true
};
```

=

##### Bandwidth

You can set bandwidth for both outgoing audio/video streams.

```javascript
connection.bandwidth = {
    audio: 50,
    video: 256,
    data: 1638400
};

// or change them individually
connection.bandwidth.audio = 50;
connection.bandwidth.video = 256;
connection.bandwidth.data = 1638400;
```

Default audio bandwidth is `50` and default video bandwidth is `256`.

=

##### Framerate

You can set frame-rate for audio streams too:

```javascript
connection.framerate = {
    minptime: 10,
    maxptime: 60
};
```

=

##### `maxParticipantsAllowed`

A customizable way to set direction e.g. `one-to-one` etc. Its default value is `10`.

```javascript
connection.maxParticipantsAllowed = 1; // for one-to-one
```

=

##### Custom Signaling

Use your own [socket.io over node.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/socketio-over-nodejs) for signaling:

```javascript
connection.openSignalingChannel = function(config) {
   URL = 'http://domain.com:8888/';
   channel = config.channel || this.channel || 'Default-Socket';
   sender = Math.round(Math.random() * 60535) + 5000;

   io.connect(URL).emit('new-channel', {
      channel: channel,
      sender : sender
   });

   socket = io.connect(URL + channel);
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

For a `ready-made` socket.io over node.js implementation; [visit this link](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/socketio-over-nodejs).

=

##### Custom Handlers on the Server

`RTCMultiConnection` allows you set custom handlers on your server too. Set `transmitRoomOnce` to `true`:

1. Your room details will be sent once; server can store those details in the cache and continuously transmit it over rest of the socket connections.
2. Or like Firebase, you can store room details in a persistent storage

```javascript
connection.transmitRoomOnce = true;
```

The message posted is JSON-stringified. You can use `JSON.parse` and read user-id like this:

```javascript
// assuming that it is node.js code
io.sockets.on('connection', function (socket) {
    socket.on('message', function (data) {
        // JSON.parse to get the object
        data = JSON.parse(data);
		
        // data.userid
        console.log('user-id is', data.userid);
		
        // JSON.stringify again
        data = JSON.stringify(data);
		
        socket.broadcast.emit('message', data);
    });
});
```

=

##### [RTCMultiConnection Demos](https://webrtc-experiment.appspot.com/#RTCMultiConnection)

| Experiment Name        | Demo           | Source Code |
| ------------- |-------------|-------------|
| **All-in-One test** | [Demo](https://webrtc-experiment.appspot.com/RTCMultiConnection/) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/all-in-one.html) |
| **Video Conferencing** | [Demo](https://webrtc-experiment.appspot.com/RTCMultiConnection/video-conferencing/) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/videoconferencing.html) |
| **Multi-Session Establishment** | [Demo](https://webrtc-experiment.appspot.com/RTCMultiConnection/multi-session-establishment/) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/multi-session-establishment.html) |
| **RTCMultiConnection-v1.3 testing demo** | [Demo](https://webrtc-experiment.appspot.com/RTCMultiConnection-v1.3/) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/RTCMultiConnection-v1.3-demo.html) |
| **Video Broadcasting** | [Demo](https://webrtc-experiment.appspot.com/RTCMultiConnection/video-broadcasting/) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/video-broadcasting.html) |
| **File Sharing + Text Chat** | [Demo](https://webrtc-experiment.appspot.com/RTCMultiConnection/group-file-sharing-plus-text-chat/) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/group-file-sharing-plus-text-chat.html) |
| **Audio Conferencing** | [Demo](https://webrtc-experiment.appspot.com/RTCMultiConnection/audio-conferencing/) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/audioconferencing.html) |
| **Join with/without camera** | [Demo](https://webrtc-experiment.appspot.com/RTCMultiConnection/join-with-or-without-camera/) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/join-with-or-without-camera.html) |
| **Screen Sharing** | [Demo](https://webrtc-experiment.appspot.com/RTCMultiConnection/screen-sharing/) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/screen-sharing.html) |
| **One-to-One file sharing** | [Demo](https://webrtc-experiment.appspot.com/RTCMultiConnection/one-to-one-filesharing/) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/one-to-one-filesharing.html) |
| **Manual session establishment + extra data transmission** | [Demo](https://webrtc-experiment.appspot.com/RTCMultiConnection/manual-session-establishment-plus-extra-data-transmission/) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/manual-session-establishment-plus-extra-data-transmission.htmlhttps://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/manual-session-establishment-plus-extra-data-transmission.html) |
| **Manual session establishment + extra data transmission + video conferencing** | [Demo](https://webrtc-experiment.appspot.com/RTCMultiConnection/manual-session-establishment-plus-extra-data-transmission-plus-videoconferencing/) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/manual-session-establishment-plus-extra-data-transmission-plus-videoconferencing.html) |
| **Customizing Bandwidth** | [Demo](https://webrtc-experiment.appspot.com/RTCMultiConnection/bandwidth/) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/bandwidth.html) |
| **Users ejection and presence detection** | [Demo](https://webrtc-experiment.appspot.com/RTCMultiConnection/users-ejection/) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/users-ejection.html) |
| **RTCMultiConnection-v1.3 and socket.io** | ---- | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/RTCMultiConnection-v1.3-and-socket.io.html) |

=

##### Demos using [RTCMultiConnection-v1.4](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection) library

| Experiment Name        | Demo           | Source Code |
| ------------- |-------------|-------------|
| **All-in-One test** | [Demo](https://webrtc-experiment.appspot.com/RTCMultiConnection-v1.4-Demos/All-in-One.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-v1.4-Demos/All-in-One.html) |
| **Renegotiation & Mute/UnMute/Stop** | [Demo](https://webrtc-experiment.appspot.com/RTCMultiConnection-v1.4-Demos/Renegotiation.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-v1.4-Demos/Renegotiation.html) |
| **Video-Conferencing** | [Demo](https://webrtc-experiment.appspot.com/RTCMultiConnection-v1.4-Demos/Video-Conferencing.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-v1.4-Demos/Video-Conferencing.html) |

=

##### Browser Support

[RTCMultiConnection-v1.4.js](https://webrtc-experiment.appspot.com/RTCMultiConnection-v1.4.js) supports following browsers:

| Browser        | Support           |
| ------------- |:-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Android | [Chrome Beta](https://play.google.com/store/apps/details?id=com.chrome.beta&hl=en) |

=

##### License

[RTCMultiConnection-v1.4.js](https://webrtc-experiment.appspot.com/RTCMultiConnection-v1.4.js) is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
