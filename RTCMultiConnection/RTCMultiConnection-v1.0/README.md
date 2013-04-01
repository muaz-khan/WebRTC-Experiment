#### Note — it is old version (v1.0) - try [latest version here](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection)

**RTCMultiConnection** highly simplifies multi-user connectivity along with multi-session establishment. 

First of all, try [all-in-one RTCMultiConnection test](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/).

#### Getting started with RTCMultiConnection / [A few examples](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/)

You should link [this library](https://bit.ly/RTCMultiConnection-v1-0) for all below examples and demos.

```html
<script src="https://bit.ly/RTCMultiConnection-v1-0"></script>
```

#### Write a `video conferencing` application using `RTCMultiConnection` / [Demo](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/videoconferencing.html)

```javascript
var rtcMultiConnection = new RTCMultiConnection({
    direction: Direction.ManyToMany,
    session: Session.AudioVideo,
    onRemoteStream: function (media) {},
    onLocalStream: function (media) {},
    openSignalingChannel: function (config) {
        throw 'use your socket.io implementation here';
    }
});
rtcMultiConnection.initSession();
```

#### Write an `audio conferencing` application using `RTCMultiConnection` / [Demo](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/audioconferencing.html)

```javascript
var rtcMultiConnection = new RTCMultiConnection({
    direction: Direction.ManyToMany,
    session: Session.Audio,
    openSignalingChannel: function (config) {
        throw 'use your socket.io implementation here';
    },
    onRemoteStream: function (media) {},
    onLocalStream: function (media) {}
});
rtcMultiConnection.initSession();
```

#### Write `audio conferencing` application along with data/file sharing / [Demo](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/audioconferencing-plus-filesharing-plus-textchat.html)

```javascript
var rtcMultiConnection = new RTCMultiConnection({
    direction: Direction.OneWay,
    session: Session.AudioData,
    openSignalingChannel: function (config) {
        throw 'use your socket.io implementation here';
    },
    onRemoteStream: function (media) {},
    onLocalStream: function (media) {},
    onopen: function (channel) {},
    onmessage: function (data) {}
});
rtcMultiConnection.initSession();

// to send a file
rtcMultiConnection.send(file);

// to send data
rtcMultiConnection.send(data);

// to send text message
rtcMultiConnection.send('text message');
```

#### Write a `group file sharing` application using `RTCMultiConnection` / [Demo](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/filesharing-plus-textchat.html)

```javascript
var rtcMultiConnection = new RTCMultiConnection({
    direction: Direction.ManyToMany,
    session: Session.Data,
    openSignalingChannel: function (config) {
        throw 'use your socket.io implementation here';
    },
    onopen: function (channel) {},
    onmessage: function (data) {},
    onFileProgress: function (packets) {},
    onFileReceived: function (fileName) {},
    onFileSent: function (file) {}
});
rtcMultiConnection.initSession();

// to send a file
rtcMultiConnection.send(file);

// to send data
rtcMultiConnection.send(data);

// to send text message
rtcMultiConnection.send('text message');
```

#### Write one-way `screen sharing` application using `RTCMultiConnection` / [Demo](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/screen-sharing.html)

```javascript
var rtcMultiConnection = new RTCMultiConnection({
    direction: Direction.OneWay,
    session: Session.Screen,
    openSignalingChannel: function (config) {
        throw 'use your socket.io implementation here';
    },
    onRemoteStream: function (media) {},
    onLocalStream: function (media) {}
});
rtcMultiConnection.initSession();
```

#### Write one-way `screen sharing` application along with data/file sharing / [Demo](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/screensharing-plus-filesharing-plus-textchat.html)

```javascript
var rtcMultiConnection = new RTCMultiConnection({
    direction: Direction.OneWay,
    session: Session.ScreenData,
    openSignalingChannel: function (config) {
        throw 'use your socket.io implementation here';
    },

    // for screen sharing
    onRemoteStream: function (media) {},
    onLocalStream: function (media) {},

    // for data/file sharing
    onopen: function (channel) {},
    onmessage: function (data) {}
});
rtcMultiConnection.initSession();

// to send a file
rtcMultiConnection.send(file);

// to send data
rtcMultiConnection.send(data);

// to send text message
rtcMultiConnection.send('text message');
```

#### Write one-way `video broadcasting` application using `RTCMultiConnection` / [Demo](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/video-broadcasting.html)

```javascript
var rtcMultiConnection = new RTCMultiConnection({
    direction: Direction.OneWay,
    session: Session.Video,
    openSignalingChannel: function (config) {
        throw 'use your socket.io implementation here';
    },
    onRemoteStream: function (media) {},
    onLocalStream: function (media) {}
});
rtcMultiConnection.initSession();
```

#### Write one-way `video broadcasting` application along with data/file sharing / [Demo](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/video-broadcasting-plus-filesharing-plus-textchat.html)

```javascript
var rtcMultiConnection = new RTCMultiConnection({
    direction: Direction.OneWay,
    session: Session.VideoData,
    openSignalingChannel: function (config) {
        throw 'use your socket.io implementation here';
    },

    // for video broadcasting
    onRemoteStream: function (media) {},
    onLocalStream: function (media) {},

    // for data sharing
    onopen: function (channel) {},
    onmessage: function (data) {},

    // for file progress
    onFileProgress: function (packets) {},
    onFileReceived: function (fileName) {},
    onFileSent: function (file) {}
});
rtcMultiConnection.initSession();

// to send a file
rtcMultiConnection.send(file);

// to send data
rtcMultiConnection.send(data);

// to send text message
rtcMultiConnection.send('text message');
```

#### Write `video conferencing` application along with data/file sharing / [Demo](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/videoconferencing-plus-filesharing-plus-textchat.html)

```javascript
var rtcMultiConnection = new RTCMultiConnection({
    direction: Direction.ManyToMany,
    session: Session.AudioVideoData,
    openSignalingChannel: function (config) {
        throw 'use your socket.io implementation here';
    },

    // for video broadcasting
    onRemoteStream: function (media) {},
    onLocalStream: function (media) {},

    // for data sharing
    onopen: function (channel) {},
    onmessage: function (data) {},

    // for file progress
    onFileProgress: function (packets) {},
    onFileReceived: function (fileName) {},
    onFileSent: function (file) {}
});
rtcMultiConnection.initSession();

// to send a file
rtcMultiConnection.send(file);

// to send data
rtcMultiConnection.send(data);

// to send text message
rtcMultiConnection.send('text message');
```

For other demos, visit [here](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/).

### Explaining RTCMultiConnection

#### initSession

This method initiates a **unique new** session. Must be called **once** by **first user** in the entire session.

Example:

```javascript
new RTCMultiConnection(configuration).initSession();
```

#### direction

`direction` object allows you set the direction of your entire media session.

| --- | --- |
| ------------- | ------------- |
| `Direction.OneToOne` | one-to-one |
| `Direction.OneToMany` | one-to-many |
| `Direction.ManyToMany` | many-to-many |
| `Direction.OneWay` | one-way |


#### session

`session` object allows you set kind of session you want to be established.

| --- | --- |
| ------------- | ------------- |
| `Session.AudioVideoData` | audio + video + data |
| `Session.AudioVideo` | audio + video |
| `Session.AudioData` | only-audio + data |
| `Session.VideoData` | only-video + data |
| `Session.Audio` | only-audio |
| `Session.Video` | only-video |
| `Session.Data` | only-data |
| `Session.ScreenData` | screen + data |
| `Session.Screen` | only-screen |

#### openSignalingChannel

`openSignalingChannel` method allows you set the signaling method you want to use in your entire media session.

```javascript
var rtcMultiConnection = new RTCMultiConnection({
    openSignalingChannel: function (config) {
        var socket = io.connect('http://your-site:8888');
        socket.channel = config.channel || 'WebRTC-RTCMultiConnection';
        socket.on('message', config.onmessage);

        socket.send = function (data) {
            socket.emit('message', data);
        };

        if (config.onopen) setTimeout(config.onopen, 1);
        return socket;
    }
});
```

You can use `firebase` too, for testing purpose only:

```html
<script src="https://cdn.firebase.com/v0/firebase.js"></script>
<script>
var rtcMultiConnection = new RTCMultiConnection({
    openSignalingChannel: function (config) {
        var channel = config.channel || 'WebRTC-RTCMultiConnection';
        var socket = new Firebase('https://chat.firebaseIO.com/' + channel);
        socket.channel = channel;
        socket.on("child_added", function (data) {
            config.onmessage && config.onmessage(data.val());
        });
        socket.send = function (data) {
            this.push(data);
        }
        config.onopen && setTimeout(config.onopen, 1);
        socket.onDisconnect().remove();
        return socket;
    }
});
</script>
```

#### onRemoteStream

`onRemoteStream` allows you get each new remote stream.

Example:

```javascript
var rtcMultiConnection = new RTCMultiConnection({
    onRemoteStream: function(media) {
        remoteMediaContainer.appendChild(media.mediaElement);
    }
});
```

| --- | --- |
| ------------- | ------------- |
| `media.mediaElement` | `HTMLAudioElement` or `HTMLVideoElement` |
| `media.stream` | Remote MediaStream |
| `media.blobURL` | `src` of audio or video element. |
| `media.session` | Using this object, you can understand what is being shared. Is it audio-only streaming or video conferencing? |
| `media.direction` |  This object allows you track the direction of the session. |

To understand whether it is audio streaming:

```javascript
if (media.session.isAudio()) {
    // it is audio streaming
}
```

To check direction:

```javascript
if (media.direction === Direction.OneWay) {
    largeVideoElement.src = media.blobURL;

    // or otherwise
    // largeVideoContainer.appendChild(media.mediaElement);
}
```

#### onLocalStream

This method returns `local media stream`.

Example:

```javascript
var rtcMultiConnection = new RTCMultiConnection({
    onLocalStream: function(media) {
        localMediaContainer.appendChild(media.mediaElement);
    }
});
```

| --- | --- |
| ------------- | ------------- |
| `media.mediaElement` | `HTMLAudioElement` or `HTMLVideoElement` |
| `media.stream` | LocalMediaStream |
| `media.blobURL` | `src` of audio or video element. |

For explanation, see previous section.

#### onopen

This method will be called as soon as RTCDataChannel ports `SCTP/RTP` get open.

Example:

```javascript
var rtcMultiConnection = new RTCMultiConnection({
    onopen: function(channel) {
        channel.send('hi, who is there?');
        chatBox.disabled = false;
    }
});
```

#### onmessage

This method will be called on each new message sent over RTCDataChannel ports.

Example:

```javascript
var rtcMultiConnection = new RTCMultiConnection({
    onmessage: function(textMessage) {
        chatBox.innerHTML = textMessage;
    }
});
```

#### send

This method allows you directly send file/data or text.

```javascript
// to send a file
rtcMultiConnection.send(file);

// to send data
rtcMultiConnection.send(data);

// to send text message
rtcMultiConnection.send('text message');
```

#### onFileProgress

During file sharing, you can track number of items sent and how many remaining.

Use `onFileProgress` like this:

```javascript
var rtcMultiConnection = new RTCMultiConnection({
    onFileProgress: function (packets) {
        if (packets.sent) console.log(packets.sent, ' packets sent.');
        if (packets.received) console.log(packets.received, ' packets received.');

        console.log(packets.remaining, ' packets remaining.');
        console.log(packets.length, ' total packets.');
    }
});
```

| --- | --- |
| ------------- | ------------- |
| `packets.remaining` | number of packets remaining |
| `packets.length` | total number of packets |
| `packets.sent` | number of packets sent |
| `packets.received` | number of packets received  |

#### onFileReceived

This method is called on successfully receiving the entire file.

```javascript
onFileReceived: function (fileName) {
    console.log(fileName, ' received successfully.');
}
```

| --- | --- |
| ------------- | ------------- |
| `fileName` | name of the file received |

#### onFileSent

This method is called on successfully sending the entire file.

```javascript
onFileSent: function (file) {
    console.log(file.name, ' sent successfully.');
    // file.name<file.size>
}
```

| --- | --- |
| ------------- | ------------- |
| `file.name` | name of the file sent |
| `file.size` | size of the file sent |

#### onerror

On WebRTC Data Channel error.

Example:

```javascript
var rtcMultiConnection = new RTCMultiConnection({
    onerror: function(event) {
        console.error(event);
    }
});
```

#### onclose

One one or more WebRTC Data Channel ports are dropped.

Example:

```javascript
var rtcMultiConnection = new RTCMultiConnection({
    onclose: function(event) {
        console.warn(event);
    }
});
```

#### iceServers

```javascript
var STUN = {
    url: 'stun:23.21.150.121'
};
var TURN = {
    url: 'turn:webrtc%40live.com@numb.viagenie.ca',
    credential: 'muazkh'
};

var rtcMultiConnection = new RTCMultiConnection({
    iceServers: [STUN, TURN]
});

// Firefox currently not supports TURN server; so skip it!
var rtcMultiConnection = new RTCMultiConnection({
    iceServers: [STUN]
});
```

#### onNewSession

It is a reality that current WebRTC implementation supports only bidirectional session establishment. You are unable to open peer connection between 3 or more users.

Behind the scene, RTCMultiConnection opens **Multi Peer Connections** to solve this issue. Though, it is not a preferred solution.

So, `onNewSession` method is called on each new session-participant because **a new peer connection** is going to be established.

To understand `onNewSession` better, consider it as `on new user` or `on new participant`.

| --- | --- |
| ------------- | ------------- |
| `session.userid` | unique id of the user  |
| `session.sessionid` | unique id of the entire session |
| `session.session` | audio, video, data or screen sharing session |
| `session.direction` | one-way, many-to-many or one-to-one |

```javascript
onNewSession: function (session) {
    // session.userid
    // session.sessionid
    // session.session
    // session.direction
}
```

#### How to manually open a session?

```javascript
onNewSession: function (session) {
    window.tempSession = session;
}

// whenever you want to open session on your friend's side, call "connectSession"
rtcMultiConnection.connectSession({
    userid: window.tempSession.userid,
    sessionid: window.tempSession.sessionid,
    session: window.tempSession.session,
    direction: window.tempSession.direction
});

// or simply
rtcMultiConnection.connectSession(window.tempSession);
```

| RTCMultiConnection [Demos](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/) / [All-in-One Demo](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/) |
| ------------- |
| [video conferencing](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/videoconferencing.html) |
| [audio conferencing](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/audioconferencing.html) |
| [video conferencing + file sharing + text chat](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/videoconferencing-plus-filesharing-plus-textchat.html) |
| [audio conferencing + file sharing + text chat](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/audioconferencing-plus-filesharing-plus-textchat.html) |
| [screen sharing](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/screen-sharing.html) |
| [screen sharing + file sharing + text chat](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/screensharing-plus-filesharing-plus-textchat.html) |
| [file sharing + text chat](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/filesharing-plus-textchat.html) |
| [one-to-one file sharing](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/one-to-one-filesharing.html) |
| [video broadcasting](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/video-broadcasting.html) |
| [video broadcasting + file sharing + text chat](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/video-broadcasting-plus-filesharing-plus-textchat.html) |


## FAQ

#### What about interoperability?

RTCMultiConnection auto-handles Firefox and Chrome interoperability.

In following sessions, chrome and firefox will be interoperable:

| --- | --- |
| ------------- | ------------- |
| `Session.AudioVideo` | audio + video |
| `Session.Audio` | only-audio |
| `Session.Video` | only-video |
| `Session.Screen` | only-screen |

Because Firefox implemented SCTP streams and chrome opens `unreliable` RTP ports for data transmission, interoperability is not possible today.

Chrome's implementation of SCTP streams coming soon under a flag. Then RTCDataChannel will also interoperable.

Until chrome release `reliable` **SCTP** version of **RTCDataChannel**, following sessions are **non-interoperable**:

| --- | --- |
| ------------- | ------------- |
| `Session.AudioVideoData` | audio + video + data |
| `Session.AudioData` | audio + data |
| `Session.VideoData` | video + data |
| `Session.ScreenData` | screen + data |
| `Session.Data` | only-data |

#### Possible screen sharing issues?

1. You're running `non-HTTPS` server
2. You can't capture **audio stream** along with **screen capturing** stream.
3. In old chrome; **Enable screen capture support in getUserMedia()** flag is not enabled via `chrome://flags`

#### Browser Support

[RTCMultiConnection.js](http://bit.ly/RTCMultiConnection-v1-0) supports following browsers:

| Browser        | Support           |
| ------------- |:-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Internet Explorer / IE | [Chrome Frame](http://www.google.com/chromeframe) |


#### License

[RTCMultiConnection.js](http://bit.ly/RTCMultiConnection-v1-1) is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).

