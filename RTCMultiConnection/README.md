## [RTCMultiConnection.js](http://www.rtcmulticonnection.org/docs/) Library!

<a href="http://www.rtcmulticonnection.org/docs/">
    <img src="http://www.rtcmulticonnection.org/img/documentation.png" />
</a>

http://www.rtcmulticonnection.org/docs/

=

```html
<button id="openNewSessionButton">open New Session Button</button><br />

<script src="http://www.RTCMultiConnection.org/latest.js"> </script>
<script>
var connection = new RTCMultiConnection().connect();
document.getElementById('openNewSessionButton').onclick = function() {
    connection.open();
};
</script>
```

=

## Documentation Links

1. http://www.rtcmulticonnection.org/docs/
2. http://www.rtcmulticonnection.org/changes-log/
3. http://www.rtcmulticonnection.org/FAQ/
4. http://www.rtcmulticonnection.org/peers/

[RTCMultiConnection Getting Started Guide](http://www.rtcmulticonnection.org/docs/getting-started/)

=

For signaling; please check following page:

https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md

=

## Below documentation is old.

=

##### [RTCMultiConnection](http://www.RTCMultiConnection.org/) Documentation / [Changes Log](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/changes-log.md)

A library for cross-browser media streaming; screen sharing; data/file sharing; renegotiation; and much more. **An all-in-one solution for RTCWeb API!**

=

## Features

1. Multi-streams attachment e.g. audio+video+data+screen
2. Multi-streams renegotiation e.g. audio+video+data+screen
3. Advance streams management e.g. mute/unmute/stop/onstreamended
4. One-to-One / One-to-Many / Many-to-Many / One-Way / Broadcasting
5. Users ejection/rejection and presence detection
6. Multi-session establishment (e.g. one or conferencing and other for broadcasting)
7. Keeps session active/LIVE all the time; even if session initiator leaves
8. Advance data/file/text sharing (concurrently|longest|largest)
9. Session re-initiation (Close/Leave/Rejoin)
10. Admin/Guest calling features
11. Audio/Video Recording using [RecordRTC](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC)

and much more! See [Changes Log](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/changes-log.md)

= 

##### A Quick Demo

```html
<script src="http://www.RTCMultiConnection.org/latest.js"> </script>
<button id="init">Open New Connection</button><br />

<script>
    var connection = new RTCMultiConnection();

    connection.session = {
        audio: true,
        video: true
    };

    connection.onstream = function(e) {
        document.body.appendChild(e.mediaElement);
    };

    connection.connect();

    document.getElementById('init').onclick = function() {
        this.disabled = true;
        connection.open();
    };
</script>
```

=

##### A Quick Demo using [Socket.io](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/socketio-over-nodejs) for Signaling

```html
<script src="https://www.webrtc-experiment.com/socket.io.js"> </script>
<script src="http://www.RTCMultiConnection.org/latest.js"> </script>

<button id="init">Open New Connection</button><br />

<script>
    var connection = new RTCMultiConnection();

    connection.session = {
        audio: true,
        video: true
    };

    connection.openSignalingChannel = function(config) {
        var SIGNALING_SERVER = 'http://webrtc-signaling.jit.su:80/';
        var channel = config.channel || this.channel;
        var sender = Math.round(Math.random() * 60535) + 5000;

        io.connect(SIGNALING_SERVER).emit('new-channel', {
            channel: channel,
            sender: sender
        });

        var socket = io.connect(SIGNALING_SERVER + channel);
        socket.channel = channel;
        socket.on('connect', function() {
            if (config.callback) config.callback(socket);
        });

        socket.send = function(message) {
            socket.emit('message', {
                sender: sender,
                data: message
            });
        };

        socket.on('message', config.onmessage);
    };

    connection.onstream = function(e) {
        document.body.appendChild(e.mediaElement);
    };

    connection.connect();

    document.getElementById('init').onclick = function() {
        this.disabled = true;
        connection.open();
    };
</script>
```

=

##### Admin/Guest audio/video calling / Try this [demo](https://www.webrtc-experiment.com/RTCMultiConnection-v1.4-Demos/admin-guest.html)

=

##### First Step: Link the library

```html
<script src="http://www.RTCMultiConnection.org/latest.js"></script>
```

##### Second Step: Start using it!

```javascript
var connection = new RTCMultiConnection();

// customize username/user-id!
connection.userid = 'muazkh';

// audio / video / data / screen / oneway / broadcast
connection.session = {
    audio: true,
    video: true
};

// set direction / 'many-to-many' / 'one-to-many' / 'one-to-one' / 'one-way'
connection.direction = 'many-to-many';

// get access to local or remote media streams
connection.onstream = function (e) {
    if (e.type === 'local') mainVideo.src = e.blobURL;
    if (e.type === 'remote') document.body.appendChild(e.mediaElement);
}

// remove media element when a user leaves the session
connection.onstreamended = function(e) {
    if(e.mediaElement.parentNode) e.mediaElement.parentNode.removeChild(e.mediaElement);
};

// searching/connecting pre-created sessions
connection.connect();

// to create/open a new session
// it should be called "only-once" by the session-initiator
[button-init-session].onclick = function() {
    connection.open();
};
```

=

##### `onstream`

`onstream` is fired for both local and remote media streams.

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

`onstreamended` is fired when a user leaves the session.

```javascript
connection.onstreamended = function(e) {
    if(e.mediaElement.parentNode) e.mediaElement.parentNode.removeChild(e.mediaElement);
};
```

=

##### Renegotiation

Renegotiation means you want to use same peer-connections to append dynamic streams at runtime.

```javascript
// DTLS/SRTP must be false for renegotiation on chrome
connection.disableDtlsSrtp = true;

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

Common renegotiation pairs:

1. `{audio: true, video: true}`
2. `{audio: true, video: true, data: true}`
3. `{screen: true, oneway: true}`
4. `{audio: true, video: true, broadcast: true}`

and many others.

=

##### Remove existing media streams

When renegotiating; a common scenario is to remove existing media streams; and renegotiate new ones.

```javascript
// remove a media-stream by id
connection.removeStream('stream-id');

// it is mandatory because renegotiation process fails
// if DTLS/SRTP is enabled on chrome (a known bug)
// https://www.webrtc-experiment.com/docs/how-to-switch-streams.html
// Remember, when we disable DTLS/SRTP; Chrome/Firefox interoperability fails
connection.disableDtlsSrtp = true;

// renegotiate a new media-stream
connection.addStream({
    audio: true,
    video: true
});
```

**Demo:**

```html
<script src="https://www.webrtc-experiment.com/RTCMultiConnection-v1.4.js"> </script>

<style>video {width: 48%;vertical-align: top;}</style>
<button id="init">Open New Connection</button>
<button id="renegotiate">Renegotiate</button>
<br /><br />

<script>	
var connection = new RTCMultiConnection();
connection.disableDtlsSrtp = true;
connection.session = {
    audio: true,
    video: true
};

connection.openSignalingChannel = function (config) {
    var websocket = new WebSocket('wss://www.webrtc-experiment.com:8563');
    websocket.channel = config.channel || this.channel;
    websocket.onopen = function () {
        websocket.push(JSON.stringify({
            open: true,
            channel: websocket.channel
        }));
        if (config.callback) config.callback(websocket);
    };
    websocket.onmessage = function (event) {
        config.onmessage(JSON.parse(event.data));
    };
    websocket.push = websocket.send;
    websocket.send = function (data) {
        websocket.push(JSON.stringify({
            data: data,
            channel: websocket.channel
        }));
    };
};

// detaching only first two media streams:
// 1. first local media stream
// 2. first remote media stream
connection.onstream = function (e) {
    document.body.appendChild(e.mediaElement);
    if (loop) this.detachStreams.push(e.streamid);
    loop--;
};
var loop = 2;

connection.connect('session-id');

document.getElementById('init').onclick = function () {
    this.disabled = true;
    connection.open('session-id');
};

document.getElementById('renegotiate').onclick = function () {
    this.disabled = true;

    // connection.removeStream(1st-local-stream-streamid);
    // connection.removeStream(1st-remote-stream-streamid);
	
    // renegotiating new media-stream in one-way direction
    connection.addStream({
        video: true,
        oneway: true
    });
};

connection.onstreamended = function (e) {
    if (e.mediaElement.parentNode) e.mediaElement.parentNode.removeChild(e.mediaElement);
};
</script>
```

`detachStreams` is a publicly accessible array; allows you inject multiple stream-ids; all relevant streams will be removed on renegotiation.

=

##### `disableDtlsSrtp`

It is mandatory because renegotiation process fails if DTLS/SRTP is enabled on chrome (out of a known bug).

Remember, when we disable DTLS/SRTP; Chrome/Firefox interoperability fails.

=

##### `session`

This object lets you set the session. Possible values are:

```javascript
audio: true
video: true
data: true
screen: true

// directions
oneway: true
broadcast: true

// in admin/guest scenario; force many-to-many
'many-to-many': true
```

v1.4 and upper releases supports multi-streams attachment feature; so you can request audio and/or video along with screen too!

=

##### `direction`

Now, you can easily set directions like this:

```javascript
connection.direction = 'many-to-many';
connection.direction = 'one-to-many';
connection.direction = 'one-to-one';
connection.direction = 'one-way';
```

=

##### Mute/UnMute/Stop

You can mute/unmute/stop a single track; or both audio/video tracks.

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

You can mute all streams too:

```javascript
connection.streams.mute();
```

You can mute all "remote" or "local" media streams too:

```javascript
connection.streams.mute({
    audio: true,
    video: true,
    type: 'remote'
});
```

=

##### `onmute` and `onunmute` / [Demo](https://www.webrtc-experiment.com/RTCMultiConnection-v1.4-Demos/mute-unmute.html)

```javascript
// if local or remote stream is muted
connection.onmute = function(e) {
   e.mediaElement.setAttribute('poster', 'https://lh5.googleusercontent.com/-zFJrEARb57w/AAAAAAAAAAI/AAAAAAAABLA/UeFbuDjvVvg/s200-c/photo.jpg');
};

// if local or remote stream is unmuted
connection.onunmute = function(e) {
   e.mediaElement.removeAttribute('poster');
};
```

=

##### RecordRTC

You can record individual streams too:

```javascript
connection.streams['stream-id'].startRecording({
    audio: true,
    video: true
});
```

To stop recording:

```javascript
connection.streams['stream-id'].stopRecording(function (blob) {
    // POST "Blob" to PHP/other server using FormData/XHR2
});
```

A simple example:

```javascript
connection.onstream = function (e) {
    // e.type == 'remote' || 'local'
	
    connection.streams[e.streamid].startRecording({
        audio: true,
        video: true
    });

    // record 10 sec audio/video
    var recordingInterval = 10 * 10000;

    setTimeout(function () {
        connection.streams[e.streamid].stopRecording(function (blob) {
            var mediaElement = document.createElement(blob.recordingType);
            mediaElement.src = URL.createObjectURL(blob);
            document.documentElement.appendChild(h2);
        });
    }, recordingInterval)
}
```

You can skip arguments:

```javascript
connection.streams['stream-id'].startRecording();
connection.streams['stream-id'].stopRecording(onBlob);
```

You can [customize buffer-size and sample-rates](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC#customize-buffer-size) too:

```javascript
connection.streams['stream-id'].startRecording({
    audio: true,
    bufferSize: 16384,
    sampleRate: 96000
});
```

You can set video width/height; and canvas width/height too:

```javascript
connection.streams['stream-id'].startRecording({
   video: {
      width: 320,
      height: 240
   },
   canvas: {
      width: 320,
      height: 240
   }
});
```

Check [RecordRTC Documentation](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC).

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

It means that session will be `active` all the time; even if initiator leaves the session.

You can call `close` method to enforce closing of the entire session:

```javascript
connection.close(); // close entire session
```

=

##### Latency Detection

"Date" object is used to track latency; that's why it is not reliable yet.

```javascript
connection.onmessage = function(e) {
    console.log('latency:', e.latency, 'milliseconds');
};
```

=

##### Are you want to share files/text or data?

"send" method allows you send:

1. File of any format and any size (multiple files concurrently)
2. Any javascript object regardless of its length, size and type
3. Text message of any length (multiple text messages can be sent concurrently)

```javascript
// send file
connection.send(file);

// send data
connection.send({
    x: 10,
    y: 20,
    dimensions: [100,200],
    descriptions: 'rectangle'
});

// send text message
connection.send('text message');
```

Same like WebSockets; `onopen` and `onmessage` methods are used:

```javascript
// it is fired each time when data connection gets open
connection.onopen = function (e) {
    // e.userid
    // e.extra
}

// it is fired each time for incoming data over SCTP/RTP data ports
connection.onmessage = function (e) {
    // e.data
    // e.userid
    // e.extra
}
```

=

##### Concurrent Transmission

You can send multiple files simultaneously; you can send largest string messages too!

```javascript
connection.send(fileNumber1);
connection.send(fileNumber2);
connection.send(fileNumber3);

// or as an array
channel.send([fileNumber1, fileNumber2, fileNumber3]);

connection.send('longer string-1');
connection.send('longer string-2');
connection.send('longer string-3');
```

=

##### Direct Messages

You can share data directly between two unique users using their user-ids:

```javascript
connection.channels['user-id'].send(file || data || 'text');
```

=

##### `uuid` for files

You can get `uuid` for each file (being sent) like this:

```javascript
connection.send(file);
var uuid = file.uuid; // "file"-Dot-uuid
```

=

##### Progress helpers when sharing files

```javascript
var progressHelper = {};

// to make sure file-saver dialog is not invoked.
connection.autoSaveToDisk = false;

connection.onFileProgress = function (chunk, uuid) {
    var helper = progressHelper[chunk.uuid];
    helper.progress.value = chunk.currentPosition || chunk.maxChunks || helper.progress.max;
    updateLabel(helper.progress, helper.label);
};

connection.onFileStart = function (file) {
    var div = document.createElement('div');
    div.title = file.name;
    div.innerHTML = '<label>0%</label> <progress></progress>';
    document.body.appendChild(div);
    progressHelper[file.uuid] = {
        div: div,
        progress: div.querySelector('progress'),
        label: div.querySelector('label')
    };
    progressHelper[file.uuid].progress.max = file.maxChunks;
};

connection.onFileSent = function (file) {
    progressHelper[file.uuid].div.innerHTML = '<a href="' + file.url + '" target="_blank" download="' + file.name + '">' + file.name + '</a>';
};

connection.onFileReceived = function (fileName, file) {
    progressHelper[file.uuid].div.innerHTML = '<a href="' + file.url + '" target="_blank" download="' + file.name + '">' + file.name + '</a>';
};

function updateLabel(progress, label) {
    if (progress.position == -1) return;
    var position = +progress.position.toFixed(2).split('.')[1] || 100;
    label.innerHTML = position + '%';
}
```

=

##### Auto-Save file to Disk

By default; `autoSaveToDisk` is set to `true`. When it is `true`; it will save file to disk as soon as it is received. To prevent auto-saving feature; just set it `false`:

```javascript
connection.autoSaveToDisk = false; // prevent auto-saving!
connection.onFileReceived = function (fileName, file) {
    // file.url
    // file.uuid
	
    hyperlink.href = file.url;
};
```
=

##### `preferSCTP`

By default, SCTP data channels are preferred. You can disable SCTP like this (it will use RTP data channels instead):

```javascript
connection.preferSCTP = false;
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
    // var userData = e.extra
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

You can set custom `user-names` as user-id:

```javascript
connection.userid = 'username';
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

`onNewSession` is fired for each new session. To better understand it, consider it as `onNewRoom` because "session" is actualy a virtual room.

```javascript
connection.onNewSession = function(session) {
    // session.extra     -- extra data you passed or empty object {}
    // session.sessionid -- it is session's unique identifier
    // session.userid    -- it is room owner's id
    // session.session   -- {audio:true, video:true}
};
```

`onNewSession` is useful to show a `join` button that allows end-users to **manually join any preferred session**.

=

##### `join`

Allows you manually join a session. You may want to show list of all available sessions to user and let him choose which session to join:

```javascript
connection.onNewSession = function(session) {
    connection.join(session);
};
```

=

##### Other features

```javascript
// session-details transmission interval
connection.interval = 1000;

// It is useful only for Firebase signaling gateway!
connection.transmitRoomOnce = true;

// If you prefer using Firebase; you can provide your self-created firebase id.
connection.firebase = 'chat';

// if you want to attach external stream
// this feature is useful in multi-sessions initiations
// it is used in experiments like "join with/without camera"
connection.dontAttachStream = true; // it means that don't try to attach NEW stream
connection.attachStreams[0] = MediaStream;
```

=

##### Broadcasting/Conferencing/etc.

"session" object supports three possible directions:

1. One-to-Many **one-way** broadcasting
2. One-to-Many **two-way** broadcasting
3. Many-to-Many **video-conferencing**

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

For one-to-one session; use `maxParticipantsAllowed` object:

```javascript
connection.maxParticipantsAllowed = 1;
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
connection.bandwidth.data  = 1638400;
```

Default audio bandwidth is `50` and default video bandwidth is `256`.

You can easily disable bandwidth for any track:

```javascript
connection.bandwidth.audio = false;
connection.bandwidth.video = false;
connection.bandwidth.data  = false;
```

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

Default limit is 256. To manage number of participants in a session:

```javascript
// to allow maximum 9 participants
// 9 participants + 1 session initiator === 10
connection.maxParticipantsAllowed = 9;
```

=

##### Media Constraints

You can force constraints that should be used each time when getUserMedia API is invoked:

```javascript
// Enjoy full-hd video streaming
connection.media.min(1920,1080);
connection.media.max(1920,1080);

// Enjoy hd video streaming
connection.media.min(1280,720);
connection.media.max(1280,720);

// other possible values
connection.media.min(960,720);
connection.media.min(640,360); // -------- it is default
connection.media.min(640,480);
connection.media.min(320,240);
connection.media.min(320,180);

connection.media.minAspectRatio = 1.77;
```

If above methods causes confusion; try "mandatory" constraints directly!

```javascript
connection.mediaConstraints.mandatory = {
    minWidth: 1280,
    maxWidth: 1280,
    minHeight: 720,
    maxHeight: 720,
    minFrameRate: 30
};

// it is same like "connection.session={audio:false}"
connection.mediaConstraints.audio = false;
```

=

##### SDP Constraints

You can force constraints that should be used each time when createOffer/createAnswer API are invoked.

```javascript
connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: false,
    OfferToReceiveVideo: false,
    VoiceActivityDetection: false,
    IceRestart = true
};
```

=

##### `skipRTCMultiConnectionLogs`

You can disable all logs by setting `window.skipRTCMultiConnectionLogs` to `true`.

```javascript
// remember, it is "window" level object
window.skipRTCMultiConnectionLogs = true;
```

=

##### STUN/TURN or host candidates

You've three options:

1. You can disable "host" (i.e. local) candidates
2. You can disable "reflexive" (i.e. STUN) candidates
3. You can disable "relay" (i.e. TURN) candidates

```javascript
connection.candidates.host = false;
connection.candidates.reflexive = false;
connection.candidates.relay = false;
```

At least one option must be true.

=

##### Session Re-initiation

v1.4 supports re-initiation feature; it means that you can leave/close/join any room; without reload the page. You can open/close unlimitted rooms unlimitted times. However, the only limitation is each room must have "unique" name.

```javascript
// close the entire session
connection.close();

// open another session
connection.open('unique-name');

// leave a session
connection.leave();

// join another session
connection.connect('unique-name');
```

Remember, you MUST override `onNewSession` to make sure RTCMultiConnection doesn't auto-join first available session:

```javascript
var sessions = {};
connection.onNewSession = function(session) {
    if(sessions[session.sessionid]) return;
    sessions[session.sessionid] = session;
	
    // display list item or join button
    // button.setAttribute('data-sessionid', session.sessionid);
};
```

When you try to override `onNewSession`; you must use `join` method to manually join appropriate session:

```javascript
var sessionid = button.getAttribute('data-sessionid');
var session   = sessions[sessionid];

connection.join(session);
```
=

##### Admin/Guest Calling Features

Scenarios: 

1. You want to set multiple admins; you want to allow your website visitors (i.e. customers) to call you directly; you want to track customers presence too. Etc.
2. You want to be an admin; and want to be able to invite any user in chatting room via his user-id (username). Etc.

```javascript
// if you want to set "admin"
connection.userType = 'admin';

// if you want to set "guest"
connection.userType = 'guest';

// Assuming that admin's userid is "admin-007"; lets call/invite him!
connection.request("admin-007");

// Assuming that guest's userid is "guest-007"; lets receive/accept his call
connection.accept("guest-007");
```

###### `onAdmin`

It is fired when an admin gets available; using it, you can allow customers to call him.

```javascript
connection.onAdmin = function (admin) {
    // Lets call admin using his userid
    connection.request(admin.userid);
};
```

###### `onGuest`

It is fired for each new customer; using it, you can detect presence of your customers; also you can call them too:

```javascript
connection.onGuest = function (guest) {
    // Lets call guest using his userid
    connection.request(guest.userid);
};
```

###### `onRequest`

It is fired if admin or guest makes a request using `connection.request` method:

```javascript
connection.onRequest = function (userid, extra) {
    // Lets accept request; "extra" is optional
    connection.accept(userid, extra);
};
```

###### `onstats`

Stats of the caller or callee:

```javascript
connection.onstats = function (stats, userinfo) {
    // callee is busy
    if (stats == 'busy') {}

    // callee accepted caller's request
    if (stats == 'accepted') {}
};
```

###### Remember

1. One-way streaming is not supported for Admin/Guest feature; however you can ejoy all other features (listed at the top of this file)
2. Admin/Guest relationship is one-to-one; however you can force "many-to-many" too; see below section

###### Use Cases

You want to be an administrator; and you want to manage users; you may want to invite users to your room; you many want to eject one or more users; etc.

```javascript
// be an administrator!!
connection.userType = 'admin';

// invite a user to your room
connection.request('target-userid');

// eject a user
connection.eject('target-userid');
```

If a user whose userid is `target-userid` is online; he will be alerted for invitation; he can accept your invitation or skip it!

Remember, admin/guest feature is one-to-one; you can force `many-to-many` like this:

```javascript
connection.session = {
    audio: true,
    video: true,
    'many-to-many': true  // --- see this line
};
```

=

##### How to invite users?

First of all; set `onAdmin`/`onGuest` to prevent defaults execution:

```javascript
connection.onAdmin = connection.onGuest = function() {};
```

Now, define `onRequest` to catch each invitation request:

```javascript
connection.onRequest = function (userid) {
    // accept invitation using "userid" of the 
    // the person inviting you
    connection.accept(userid);
};
```

He'll invite you using `request` method:

```javascript
// he'll use your user-id to invite you
connection.request('userid');
```

**Simplest Demo:**

```javascript
var you = new RTCMultiConnection();
var he = new RTCMultiConnection();

you.onRequest = function (his_id) {
    // you're "quickly" accepting his invitation
    // you can show a dialog-box too; to allow 
    // user accept/reject invitation
    you.accept(his_id);
};

// he is inviting you
he.request(your_id);

// following lines are necessary because we need to 
// set signaling gateways
you.connect();
he.connect();
```

=

##### Custom Signaling (v1.4 and earlier)

Use your own [socket.io over node.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/socketio-over-nodejs) for signaling:

```javascript
connection.openSignalingChannel = function(config) {
   var URL = 'http://domain.com:8888/';
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
};
```

For a `ready-made` socket.io over node.js implementation; [visit this link](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/socketio-over-nodejs).

=

##### Custom Signaling for one-page demos

```javascript
var channels = { };

function openSignalingChannel(config) {
    var channel = config.channel || this.channel;
    var socket = {
        send: function(data) {
            channels[channel].send(data);
        },
        onmessage: function(data) {
            config.onmessage(data);
        }
    };
    if (!channels[channel])
        channels[channel] = {
            send: function(data) {
                for (var i = 0; i < this.onmessages.length; i++) {
                    var onmessage = this.onmessages[i];
                    onmessage(data);
                }
            },
            onmessages: [socket.onmessage]
        };
    else channels[channel].onmessages.push(socket.onmessage);

    if (config.onopen) setTimeout(config.onopen, 1);
    return socket;
}

// use above method as custom signaling gateway!
connection.openSignalingChannel = openSignalingChannel;
```

Try [one-page demo](https://www.webrtc-experiment.com/RTCMultiConnection-v1.4-Demos/one-page-demo.html).

=

##### Room screenshots / snapshots

You can easily share snapshots/screenshots as extra-data:

```javascript
document.getElementById('setup-connection').onclick = function () {
    connection.extra = {
        screenshot: 'screenshot.png'
    };
    connection.open();
};

connection.onNewSession = function(session) {
    image.src = session.extra.screenshot;
};
```

Try [room-screenshots demo](https://www.webrtc-experiment.com/RTCMultiConnection-v1.4-Demos/rooms-screenshots.html).

=

##### `connection.sessionid`

You may want to open multiple rooms in a single session:

```javascript
connection.sessionid = (Math.random() * 100000).toString().replace('.', '');
connection.open();
```

Now, `onNewSession` will be fired for each room. Try [this demo](https://www.webrtc-experiment.com/RTCMultiConnection-v1.4-Demos/rooms-screenshots.html).

**Note:**

1. Each RTCMultiConnection instance has session-id (i.e. channel) that uniquely identifies each session. This identifier is usually passed using constructor or open/connect methods.
2. "connection.sessionid" is not "channel"; it is actually "room-id". Multiple rooms can be opened in a single session; i.e. multiple nested sessions.

"connection.sessionid" is useful to allow **multiple-nested-sessions**.

```javascript
// following are unique session identifier (global-level)
new RTCMultiConnection('session-id');
connection.open('session-id');
connection.connect('session-id');

// however, following are unique identifiers for nested sessions i.e. rooms
connection.sessionid = 'room-number-1';
connection.sessionid = 'room-number-2';
connection.sessionid = 'room-number-3';
connection.sessionid = 'room-number-4';
```

=

##### Custom Handlers for server

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

##### Want password protected rooms? [Demo](https://www.webrtc-experiment.com/RTCMultiConnection-v1.4-Demos/password-protect-rooms.html)

```javascript
document.querySelector('#setup').onclick = function () {
    // room password has been set before calling "open" method
    connection.extra.password = prompt('Setup password for your room!');
    connection.open();
};

connection.onNewSession = function (session) {
    // set password for person who is trying to join the room
    connection.extra.password = prompt('Enter password to join this room.');
    connection.join(session);
};

connection.onRequest = function (userid, extra) {
    // validating password in "onRequest"
    if (extra.password != connection.extra.password)
        return alert('password: ' + extra.password + ' !== ' + connection.extra.password);

    connection.accept(userid, extra);
};
```

=

##### [RTCMultiConnection Demos](https://www.webrtc-experiment.com/#RTCMultiConnection)

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

=

##### Demos using [RTCMultiConnection-v1.4](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection) library

| Experiment Name        | Demo           | Source Code |
| ------------- |-------------|-------------|
| **All-in-One test** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection-v1.4-Demos/All-in-One.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-v1.4-Demos/All-in-One.html) |
| **Renegotiation & Mute/UnMute/Stop** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection-v1.4-Demos/Renegotiation.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-v1.4-Demos/Renegotiation.html) |
| **Video-Conferencing** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection-v1.4-Demos/Video-Conferencing.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-v1.4-Demos/Video-Conferencing.html) |
| **Multi-streams attachment** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection-v1.4-Demos/multi-streams-attachment.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-v1.4-Demos/multi-streams-attachment.html) |
| **Admin/Guest audio/video calling** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection-v1.4-Demos/admin-guest.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-v1.4-Demos/admin-guest.html) |
| **Session-Reinitiation** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection-v1.4-Demos/session-reinitiation.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-v1.4-Demos/session-reinitiation.html) |
| **Audio/Video Recording** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection-v1.4-Demos/RecordRTC-and-RTCMultiConnection.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-v1.4-Demos/RecordRTC-and-RTCMultiConnection.html) |
| **Mute/UnMute** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection-v1.4-Demos/mute-unmute.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-v1.4-Demos/mute-unmute.html) |
| **Password Protected Rooms** | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection-v1.4-Demos/password-protect-rooms.html) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-v1.4-Demos/password-protect-rooms.html) |

=

##### Documentations History / [Changes Log](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/changes-log.md)

1. [`RTCMultiConnection-v1.4](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection)
2. [`RTCMultiConnection-v1.3`](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-v1.3.md)
3. [`RTCMultiConnection-v1.2 and earlier`](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection/RTCMultiConnection-v1.2-and-earlier.md)

=

### Browser Support

[RTCMultiConnection.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection) supports following browsers:

| Browser        | Support           |
| ------------- |:-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Android | [Chrome Beta](https://play.google.com/store/apps/details?id=com.chrome.beta&hl=en) |

=

#### Apps/Libraries using RTCMultiConnection

1. `http://imomin.aws.af.cm/`

If you're using RTCMultiConnection; please send your webpage link at muazkh@gmail.com.

=

## License

[RTCMultiConnection.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
