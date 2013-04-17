#### [RTCMultiConnection.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection) : A JavaScript wrapper library for RTCWeb/RTCDataChannel APIs

RTCMultiConnection's syntax is simple to use. It is useful in each and every WebRTC application.

It can help you write file sharing applications along with screen sharing and audio/video conferencing applications — in minutes.

#### Features

1. You can open multi-sessions and multi-connections — in the same page
2. You can share files of any size — directly
3. You can share text messages of any length
4. You can share one-stream in many unique ways — in the same page

Syntax of **RTCMultiConnection.js** is same like **WebSockets**.

#### First Step: Link the library

```html
<script src="https://webrtc-experiment.appspot.com/RTCMultiConnection-v1.1.js"></script>
```

#### Second Step: Start using it!

```javascript
var connection = new RTCMultiConnection();

// to create/open a new session
connection.open('session-id');

// if someone already created a session; to join it: use "connect" method
connection.connect('session-id');
```

#### Are you want to share files/text or data?

```javascript
// to send text/data or file
connection.send(file || data || 'text');
```

Same like WebSockets; `onopen` and `onmessage` methods:

```javascript
// to be alerted on data ports get open
connection.onopen = function (channel) { }

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
if (stream.direction === Direction.OneWay) largeVideoElement.src = stream.blobURL;
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
connection.direction = Direction.OneToOne;
connection.direction = Direction.OneToMany;
connection.direction = Direction.ManyToMany;
connection.direction = Direction.OneWay;
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
connection.session = Session.Audio;
connection.session = Session.AudioVideo;
connection.session = Session.ScreenData;
connection.session = Session.AudioVideoData
connection.session = Session.AudioData;
connection.session = Session.VideoData;
connection.session = Session.Screen;
connection.session = Session.Data;
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

#### Use your own socket.io for signaling

```javascript
// by default Firebase is used for signaling; you can override it
connection.openSignalingChannel = function(config) {
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

====
#### Browser Support

[RTCMultiConnection.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection) supports following browsers:

| Browser        | Support           |
| ------------- |:-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Internet Explorer / IE | [Chrome Frame](http://www.google.com/chromeframe) |

#### Write video-conferencing application

```javascript
var connection = new RTCMultiConnection();

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
connection.session = Session.AudioVideoData;
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

#### Demos / Experiments using RTCMultiConnection library

1. [Multi-Session Establishment](https://webrtc-experiment.appspot.com/RTCMultiConnection/multi-session-establishment/)
2. [File Sharing + Text Chat](https://webrtc-experiment.appspot.com/group-file-sharing-plus-text-chat/)
3. [All-in-One test](https://webrtc-experiment.appspot.com/RTCMultiConnection/)
4. [Video Conferencing](https://webrtc-experiment.appspot.com/RTCMultiConnection/video-conferencing/)
5. [Video Broadcasting](https://webrtc-experiment.appspot.com/RTCMultiConnection/video-broadcasting/)
6. [Audio Conferencing](https://webrtc-experiment.appspot.com/RTCMultiConnection/audio-conferencing/)
7. [Join with/without camera](https://webrtc-experiment.appspot.com/RTCMultiConnection/join-with-or-without-camera/)
8. [Screen Sharing](https://webrtc-experiment.appspot.com/RTCMultiConnection/screen-sharing/)
9. [One-to-One file sharing](https://webrtc-experiment.appspot.com/RTCMultiConnection/one-to-one-filesharing/)

Here is the [list of all WebRTC Experiments](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection-v1.1/) using RTCMultiConnection.js library.

#### License

[RTCMultiConnection.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection) is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
