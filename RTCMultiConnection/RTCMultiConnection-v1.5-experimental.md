##### [RTCMultiConnection-v1.5.js](https://webrtc-experiment.appspot.com/RTCMultiConnection-v1.5.js) Documentation (Experimental Release)

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
<script src="https://webrtc-experiment.appspot.com/RTCMultiConnection-v1.5.js"></script>
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

Scenarios:

1. In group file sharing applications; dynamic/runtime invocation of audio/video/screen streams using same peer connections.
2. In audio-conferencing applications; dynamic/runtime invocation of video/data streams using pre-created peer connections.
3. In screen sharing applications; dynamic/runtime invocation of audio/data streams

Limitations:

1. Streams can be renegotiated between two unique users (in a single invocation)
2. Renegotiation can only be invoked by session initiator; participants are not allowed to invoke renegotiation

```javascript
connection.users['user-id'].addStream({
    audio: true,
    video: true
});

connection.users['user-id'].addStream({
    screen: true,
    oneway: true
});
```

`{oneway:true}` allows you force renegotiated stream to flow in one-way direction.

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
connection.onFileSent = function (e) {
    // e.file.name
    // e.file.size
    // e.userid
    // e.extra
};

// on file successfully received
connection.onFileReceived = function (e) {
    // e.fileName
    // e.userid
    // e.extra
};
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
    // session.roomid -- it is session's unique identifier
    // session.userid -- it is room owner's id
    // session.session e.g. {audio:true, video:true}
};
```

`onNewSession` is useful to show a `join` button that allows end-users to manually join any preferred session.

=

##### `interval`

Interval in milliseconds, after which repeatedly transmit room details.

```javascript
connection.interval = 1000;
```

=

##### `transmitRoomOnce`

You may prefer using it with firebase. It is `false` by default.

```javascript
connection.transmitRoomOnce = true;
```

=

##### `firebase`

Firebase instance name e.g. `https://instance.firebaseio.com/`.

```javascript
connection.firebase = 'chat';
```

=

##### `noMediaStream`

If you don't want to prompt any `getUserMedia`. It is useful in join with/without camera type of experiments.

```javascript
connection.noMediaStream = true;
```

=

##### Attach external stream

This feature is useful in multi-sessions initiations.

```javascript
connection.noMediaStream = true;
connection.stream = MediaStream;
```

=

##### `one-way`

```javascript
connection.stream = {
    oneway: true,
    screen: true
};
```

=

##### `one-to-many`

```javascript
connection.stream = {
    broadcast: true,
    audio: true
};
```

=

##### `many-to-many`

```javascript
connection.stream = {
    audio: true,
    video: true
};
```

=

##### `maxParticipantsAllowed`

A customizable way to set direction e.g. `one-to-one` etc. Its default value is `10`.

```javascript
connection.maxParticipantsAllowed = 1; // for one-to-one
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

##### Detect number of connected users

You can detect how many users are participanting using `users` object:

```javascript
var numberOfUsers = 0;
for(var user in connection.users) numberOfUsers++;

console.log('number of users:', numberOfUsers);
```

=

##### signaling using socket.io over node.js

Your server-side node.js code looks like this:

```javascript
io.sockets.on('connection', function (socket) {
    socket.on('message', function (data) {
        socket.broadcast.emit('message', data);
    });
});
```

And to override `openSignalingChannel` on the client side:

```javascript
connection.openSignalingChannel = function(callback) {
    return io.connect().on('message', callback);
};
```

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

##### Demos using [RTCMultiConnection-v1.5](https://webrtc-experiment.appspot.com/RTCMultiConnection-v1.5.js) library

| Experiment Name        | Demo           | Source Code |
| ------------- |-------------|-------------|
| **All-in-One test** | [Demo](https://webrtc-experiment.appspot.com/RTCMultiConnection-v1.5-Demos/All-in-One.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-v1.5-Demos/All-in-One.html) |
| **Renegotiation & Mute/UnMute/Stop** | [Demo](https://webrtc-experiment.appspot.com/RTCMultiConnection-v1.5-Demos/Renegotiation.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-v1.5-Demos/Renegotiation.html) |
| **Video-Conferencing** | [Demo](https://webrtc-experiment.appspot.com/RTCMultiConnection-v1.5-Demos/Video-Conferencing.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-v1.5-Demos/Video-Conferencing.html) |

=

##### Browser Support

[RTCMultiConnection-v1.5.js](https://webrtc-experiment.appspot.com/RTCMultiConnection-v1.5.js) supports following browsers:

| Browser        | Support           |
| ------------- |:-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Android | [Chrome Beta](https://play.google.com/store/apps/details?id=com.chrome.beta&hl=en) |

=

##### License

[RTCMultiConnection-v1.5.js](https://webrtc-experiment.appspot.com/RTCMultiConnection-v1.5.js) is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
