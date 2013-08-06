#### [RTCMultiConnection-v1.2](https://www.webrtc-experiment.com/RTCMultiConnection-v1.3.js) Documentation

RTCMultiConnection.js a javascript library supports features like audio/video conferencing; (one-way and one-to-many) broadcasting; screen sharing; data/text/file sharing (of any size); multi-and-manual sessions establishment; users ejection, rejection and presence detection; and more. It automatically keeps session "active" all the time; even if initiator leaves.

#### Features

1. Users ejection, rejection and presence detection support
2. Multi-sessions establishment as well as manual-sessions establishment
3. Sessions will be active all the time; even if initiator leaves!
4. Data i.e. Text/File sharing (of any size)
5. Screen sharing, audio-video conferencing; file sharing and one-way broadcasting

"Users Ejection" means you can eject (i.e. throw) any user out of the room — any time!

----

#### Documentations History

1. [`RTCMultiConnection-v1.4 and v1.5`](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection)
2. [`RTCMultiConnection-v1.6`](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-v1.6.md)
3. [`RTCMultiConnection-v1.3`](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-v1.3.md)
4. [`RTCMultiConnection-v1.2 and earlier`](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-v1.2-and-earlier.md)

----

#### First Step: Link the library

```html
<script src="https://www.webrtc-experiment.com/RTCMultiConnection-v1.2.js"></script>
```

#### Second Step: Start using it!

```javascript
var connection = new RTCMultiConnection();

// to create/open a new session
connection.open('session-id');

// if someone already created a session; to join it: use "connect" method
connection.connect('session-id');
```

----

#### Detect users presence

```javascript
connection.onleave = function(userid, extra) {
    // remove user's video using his user-id
    // console.log(extra.username, 'left you sir!');
};
```

#### Eject any user or close your own session

```javascript
connection.eject(userid); // throw a user out of your room!
connection.leave();       // close your own entire session
```

#### Auto Close Entire Session

When room initiator leaves; you can enforce auto-closing of the entire session. By default: it is `false`:

```javascript
connection.autoCloseEntireSession = true;

// or 
new RTCMultiConnection('session-id', {
    autoCloseEntireSession: true
});
```

It means that session will be kept active all the time; even if initiator leaves the session.

You can set `autoCloseEntireSession` before calling `leave` method; which will enforce closing of the entire session:

```javascript
connection.autoCloseEntireSession = true;
connection.leave(); // closing entire session
```

----

#### Are you want to share files/text or data?

```javascript
// to send text/data or file
connection.send(file || data || 'text');
```

Same like WebSockets; `onopen` and `onmessage` methods:

```javascript
// to be alerted on data ports get open
connection.onopen = function () { }

// to be alerted on data ports get new message
connection.onmessage = function (message) { }
```

#### Are you trying to write audio/video/screen sharing application?

```javascript
// get access to local or remote streams
connection.onstream = function (stream) {
    if (stream.type === 'local') {
        mainVideo.src = stream.blobURL;
    }

    if (stream.type === 'remote') {
        document.body.appendChild(stream.mediaElement);
    }
}
```

| --- | --- |
| ------------- | ------------- |
| `stream.type` | `local` or `remote` |
| `stream.mediaElement` | `HTMLAudioElement` or `HTMLVideoElement` |
| `stream.stream` | `LocalMediaStream` or `MediaStream` |
| `stream.blobURL` | `src` of audio or video element. |
| `stream.session` | Using this object, you can understand what is being shared. Is it audio-only streaming or video conferencing? |
| `stream.direction` |  This object allows you track the direction of the session. |

To understand whether it is audio streaming:

```javascript
if (stream.session.isAudio()) { }
```

To check direction:

```javascript
if (stream.direction === RTCDirection.OneWay) largeVideoElement.src = stream.blobURL;
```

#### Set direction — group sharing or one-way broadcasting

```javascript
// by default; connection is [many-to-many]; you can use following directions
connection.direction = 'one-to-one';
connection.direction = 'one-to-many';
connection.direction = 'many-to-many';	// --- it is default
connection.direction = 'one-way';
```

If you're interested; you can use **enums** instead of strings:

```javascript
connection.direction = RTCDirection.OneToOne;
connection.direction = RTCDirection.OneToMany;
connection.direction = RTCDirection.ManyToMany;
connection.direction = RTCDirection.OneWay;
```

It is your choice to use spaces; dashes or enumerators. You can use spaces like this:

```javascript
connection.direction = 'one to one';
connection.direction = 'one to many';
connection.direction = 'many to many';
connection.direction = 'one way';
```

You can use all capital letters; first capital letter; all lower-case letters; etc. It is your choice!

```javascript
connection.direction = 'One to One';
connection.direction = 'ONE to MANY';
connection.direction = 'MANY-TO-MANY';
connection.direction = 'oNe-wAy';
```

#### Set session — audio or video or screen or file

You can set `session` object for appropriate value.

```javascript
connection.session = 'only-audio';
connection.session = 'audio + video';
connection.session = 'screen + data';
connection.session = 'audio + video + data';
connection.session = 'only-audio and data';
connection.session = 'only video + data';
connection.session = 'only screen';
connection.session = 'only-data';
```

Feel free to use word like "only" or "and", symbols like plus, dashes or spaces because **behind-the-scene all these values are replaced with empty string**.

```javascript
var input = 'audio and-video + data';
real_value = input.toLowerCase().replace(/-|( )|\+|only|and/g, '');

// so the real value will be
real_value = 'audiovideodata';
```

That's why it is said that you can use **enums** too!!!

```javascript
connection.session = RTCSession.Audio;
connection.session = RTCSession.AudioVideo;
connection.session = RTCSession.ScreenData;
connection.session = RTCSession.AudioVideoData
connection.session = RTCSession.AudioData;
connection.session = RTCSession.VideoData;
connection.session = RTCSession.Screen;
connection.session = RTCSession.Data;
```

#### Progress helpers when sharing files

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

#### Errors Handling when sharing files/data/text

```javascript
// error to open data ports
connection.onerror = function (event) { }

// data ports suddenly dropped
connection.onclose = function (event) { }
```

#### Manual session establishment

```javascript
// Pass "session-id" only-over the constructor
var connection = new RTCMultiConnection('session-id');

// When calling "open" method; pass an argument like this
connection.open({
    // "extra" object allows you pass extra data like username, number of participants etc.
    extra: {
        boolean: true,
        integer: 0123456789,
        array: [],
        object: {}
    },

    // it is the broadcasting interval — default value is 3 seconds
    interval: 3000
});

// Use "onNewSession" method to show each new session in a list 
// so end users can manually join any session they prefer:
connection.onNewSession = function(session) {
    // use "session.extra" to access "extra" data
};

// To manually join a preferred session any time; 
// use "join" method instead of "connect" method:
connection.join(session, extra);

// "extra" data can be accessed using "connection.onstream" method
connection.onstream = function(stream){
    var video = stream.mediaElement;

    // it is extra data passed from remote peer
    if(stream.type === 'remote') {
        var extra = stream.extra;
        video.poster = extra.username;
    }
};
```

#### Use [your own](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/socketio-over-nodejs) socket.io over node.js for signaling

```javascript
openSignalingChannel: function(config) {
   var URL = '/';
   var channel = config.channel || this.channel || 'Default-Socket';
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

For a ready-made socket.io over node.js implementation; [visit this link](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/socketio-over-nodejs).

====
#### Browser Support

[RTCMultiConnection.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection) supports following browsers:

| Browser        | Support           |
| ------------- |:-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Internet Explorer / IE | [Chrome Frame](http://www.google.com/chromeframe) |
| Android | [Chrome Beta](https://play.google.com/store/apps/details?id=com.chrome.beta&hl=en) |

#### Write video-conferencing application

```javascript
var connection = new RTCMultiConnection();

// to create/open a new session
connection.open('session-id');

// if someone already created a session; to join him: use "connect" method
connection.connect('session-id');

// get access to local or remote streams
connection.onstream = function (stream) {
    if (stream.type === 'local') {
        mainVideo.src = stream.blobURL;
    }

    if (stream.type === 'remote') {
        document.body.appendChild(stream.mediaElement);
    }
}
```

#### Write an audio-conferencing application

```javascript
var connection = new RTCMultiConnection();

// set session to 'audio-only'
connection.session = 'only audio';

// to create/open a new session
connection.open('session-id');

// if someone already created a session; to join it: use "connect" method
connection.connect('session-id');

// get access to local or remote streams
connection.onstream = function (stream) {
    if (stream.type === 'local') {
        mainVideo.src = stream.blobURL;
    }

    if (stream.type === 'remote') {
        document.body.appendChild(stream.mediaElement);
    }
}
```

#### Write screen sharing application

```javascript
var connection = new RTCMultiConnection();

connection.direction = 'one-way';
connection.session = 'only screen';

// to create/open a new session
connection.open('session-id');

// if someone already created a session; to join it: use "connect" method
connection.connect('session-id');

// get access to local or remote streams
connection.onstream = function (stream) {
    if (stream.type === 'local') {
        mainVideo.src = stream.blobURL;
    }

    if (stream.type === 'remote') {
        document.body.appendChild(stream.mediaElement);
    }
}
```

#### Write group file sharing application + text chat

```javascript
var connection = new RTCMultiConnection();

// set session to 'data-only'
connection.session = 'only data';

// to create/open a new session
connection.open('session-id');

// if someone already created a session; to join it: use "connect" method
connection.connect('session-id');

// you can send anything of any length!
connection.send(file || data || 'text');

// to be alerted on data ports get open
connection.onopen = function (channel) { }

// to be alerted on data ports get new message
connection.onmessage = function (message) { }

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

Remember, **A-to-Z, everything is optional!**

#### Write video-conferencing + file sharing + text chat

```javascript
var connection = new RTCMultiConnection();

// set session to 'audio + video + data'
connection.session = 'audio + video and data';

// to create/open a new session
connection.open('session-id');

// if someone already created a session; to join it: use "connect" method
connection.connect('session-id');

// you can send anything of any length!
connection.send(file || data || 'text');

// get access to local or remote streams
connection.onstream = function (stream) {
    if (stream.type === 'local') { }
    if (stream.type === 'remote') { }
}
```

Again, the real session will be `audiovideodata`. Following all sessions points to same session:

```javascript
connection.session = 'audio + video and data';
connection.session = 'audio + video + data';
connection.session = 'audio-video-data';
connection.session = 'audio and video and data';
connection.session = RTCSession.AudioVideoData;
connection.session = 'AUDIO + VIDEO and DATA';
```

Hmm, **it is your choice!**

#### Advance usage: open multi-sessions and multi-connections

```javascript
var connection = new RTCMultiConnection();

// get access to local or remote streams
connection.onstream = function (stream) {
    if (stream.type === 'local') {
        //------------------------
        //-------------- see here!
        //------------------------
        var stream = stream.stream;
        open_audio_conferencing_session(stream);
        open_audio_video_broadcasting_session(stream);
        open_only_audio_broadcasting_session(stream);
        open_only_video_broadcasting_session(stream);
    }
}

// to create/open a new session
connection.open('session-id');

// if someone already created a session; to join it: use "connect" method
connection.connect('session-id');

function open_audio_conferencing_session(stream) {
    var new_connection = new RTCMultiConnection();

    // -------- getting only-audio stream!
    stream = new MediaStream(stream.getAudioTracks());
    new_connection.attachStream = stream;

    new_connection.session = 'only-audio';

    new_connection.open('audio conferencing session-id');
}

function open_audio_video_broadcasting_session(stream) {
    var new_connection = new RTCMultiConnection();

    // -------- attaching same stream!
    new_connection.attachStream = stream;

    // -------- setting 'one way' direction
    new_connection.direction = 'one-way';

    new_connection.open('audio-video broadcasting session-id');
}

function open_only_audio_broadcasting_session(stream) {
    var new_connection = new RTCMultiConnection();

    // -------- getting only-audio stream!
    stream = new MediaStream(stream.getAudioTracks());
    new_connection.attachStream = stream;

    new_connection.session = 'only-audio';
    new_connection.direction = 'one-way';

    new_connection.open('audio one-way broadcasting session-id');
}

function open_only_video_broadcasting_session(stream) {
    var new_connection = new RTCMultiConnection();

    // -------- getting only-video stream!
    stream = new MediaStream(stream.getVideoTracks());
    new_connection.attachStream = stream;

    new_connection.session = 'only-video';
    new_connection.direction = 'one-way';

    new_connection.open('video one-way broadcasting session-id');
}
```

You can see that `attachStream` object is used to attach **same stream** in absolute unique sessions.

#### Why multi-sessions?

1. Sometimes you want to one-way broadcast your video for users who have no-camera or no-microphone
2. You may want to allow audio-conferencing along with video-conferencing in the same session / same stream!
3. You may want to open one-to-one ports between main-peer and the server to record speaker's speech or to further broadcast the stream
4. You may want to allow end-users to anonymously join/view main-video session or chatting room
5. You may want to open one-to-one private session between chairperson and CEO! — in the same session; same page!

There are **many other** use-cases of multi-sessions.

----

#### [RTCMultiConnection Demos](https://www.webrtc-experiment.com/#RTCMultiConnection)

| Experiment Name        | Demo           | Source Code |
| ------------- |-------------|-------------|
| **All-in-One test** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/all-in-one.html) |
| **Video Conferencing** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/videoconferencing.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/videoconferencing.html) |
| **Multi-Session Establishment** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/multi-session-establishment.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/multi-session-establishment.html) |
| **RTCMultiConnection-v1.3 testing demo** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/RTCMultiConnection-v1.3-demo.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/RTCMultiConnection-v1.3-demo.html) |
| **Video Broadcasting** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/video-broadcasting.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/video-broadcasting.html) |
| **File Sharing + Text Chat** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/group-file-sharing-plus-text-chat.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/group-file-sharing-plus-text-chat.html) |
| **Audio Conferencing** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/audioconferencing.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/audioconferencing.html) |
| **Join with/without camera** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/join-with-or-without-camera.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/join-with-or-without-camera.html) |
| **Screen Sharing** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/screen-sharing.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/screen-sharing.html) |
| **One-to-One file sharing** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/one-to-one-filesharing.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/one-to-one-filesharing.html) |
| **Manual session establishment + extra data transmission** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/manual-session-establishment-plus-extra-data-transmission.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/manual-session-establishment-plus-extra-data-transmission.html](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/manual-session-establishment-plus-extra-data-transmission.html) |
| **Manual session establishment + extra data transmission + video conferencing** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/manual-session-establishment-plus-extra-data-transmission-plus-videoconferencing.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/manual-session-establishment-plus-extra-data-transmission-plus-videoconferencing.html) |
| **Customizing Bandwidth** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/bandwidth.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/bandwidth.html) |
| **Users ejection and presence detection** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/users-ejection.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/users-ejection.html) |
| **RTCMultiConnection-v1.3 and socket.io** | ---- | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-Demos/RTCMultiConnection-v1.3-and-socket.io.html) |

----

#### Broken Changes

Previously RTCMultiConnection used `Direction` and `Session` objects.

Out of high-level confliction; now it is using `RTCDirection` and `RTCSession` objects instead.

So, you can compare directions or sessions like this:

```javascript
if(stream.session === RTCSession.AuidoVideo) {}

if(stream.direction === RTCDirection.OneWay) {}
```

#### License

[RTCMultiConnection.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
