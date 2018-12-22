# Tips & Tricks

> RTCMultiConnection tips and tricks for advance users!

## How to secure your socket.io usage?

Modify [`Signaling-Server.js`](https://github.com/muaz-khan/RTCMultiConnection-Server/blob/master/node_scripts/Signaling-Server.js) and add this line:

```javascript
io.on('connection', onConnection);

// add this line,
// quickly after above line
io.set('origins', 'https://domain.com');
```

Otherwise:

```javascript
// Seach & modify this function on Signaling-Server.js

function onConnection(socket) {
    if (socket.handshake.headers.origin == 'https://domain.com') {
        console.log(socket.handshake.headers.origin + ' Allowed.');
    } else {
        console.log(socket.handshake.he aders.origin + ' Not Allowed.');
        socket.disconnect();
        return;
    }

    // rest of the code from Signaling-Server.js
}
```

Now you've restricted the usage of socket.io only on domain `https://domain.com:9001`.

## How to arrange videos?

It happens all insidde the [`onstream`](https://www.rtcmulticonnection.org/docs/onstream/) event.

```javascript
connection.onstream = function(event) {
    if (event.type == 'local') {
        showLocalVideo(event);
        return;
    }

    if (event.type == 'remote') {
        var numberOfUsers = connection.getAllParticipants().length;
        if (numberOfUsers == 1) {
            showFirstUserVideoOnFullScreen(event);
        } else {
            showSecondAndUpcomingVideosInSmallDiv(event);
        }
    }
};

function showLocalVideo(event) {}

function showFirstUserVideoOnFullScreen(event) {}

function showSecondAndUpcomingVideosInSmallDiv(event) {}
```

#### Points to be noted:

1. We are comparing `even.type == local or remote` to detect video's  type.
2. We can differentiate between audio, video and screen using `event.stream.isScreen` or `event.stream.isAudio` or `event.stream.isVideo`.
3. Unique `event.streamid` to set unique `IDs` for each video element.

E.g.

```javascript
connection.onstream = function(event) {
    var videoElement = event.mediaElement;

    // "streamid" uniquely identifies each video
    videoElement.id = event.streamid;

    // single user can share multiple videos (+multiple screens)
    videoElement.setAttribute('data-userid', event.userid);

    videoElement.onclick = function() {
        // get the unique stream-id
        var streamid = this.id;

        // get user-id
        var userid = this.getAttribute('data-userid');

        // you can access native RTCPeerConnection object
        var allVideosComingFromThisUser = connection.peers[userid].peer.getRemoteStreams();

        // you can access the MediaStream data
        var streamEvent = connection.streamEvents[streamid];

        console.log(streamEvent.type, streamEvent.stream.isScreen, streamEvent.stream, streamEvent.mediaElement);
    };
};
```

As you can see in the above snippet, we are setting two HTML attributes:

1. `id` which is `event.streamid`
2. `data-userid` which is `event.userid`

`id` helps us access `MediaStream` object. We can detect type of stream, active tracks, etc.

`data-userid` helps us detect who is sending the video stream.

You can always reset the `video.src`:

```javascript
videoElement.onclick = function() {
    // get the unique stream-id
    var streamid = this.id;

    // you can access the MediaStream data
    var streamEvent = connection.streamEvents[streamid];

    // access native MediaStreamObject
    var mediaStream = streamEvent.stream;

    // reset the URL
    videoElement.src = URL.createObjectURL(mediaStream);
    videoElement.play();
};
```

You can merge or stop tracks:

```javascript
videoElement.onclick = function() {
    // get the unique stream-id
    var streamid = this.id;

    // you can access the MediaStream data
    var streamEvent = connection.streamEvents[streamid];

    // access native MediaStreamObject
    var mediaStream = streamEvent.stream;

    // add new track
    mediaStream.addTrack(newTrack);

    // remove existing track
    var videoTrack = mediaStream.getVideoTracks()[0];
    mediaStream.removeTrack(videoTrack);
};
```

You can renegotiate peers to share new tracks:

```javascript
videoElement.onclick = function() {
    // get user-id
    var userid = this.getAttribute('data-userid');

    // renegotiate to update RTCPeerConnection
    // it will reset ports; access all fresh tracks; etc.
    connection.renegotiate(userid);
};
```

## If WebRTC fails

```html
<script>
// add this script before loading "RTCMultiConnection.min.js"
window.getExternalIceServers = true;
</script>
<script src="https://rtcmulticonnection.herokuapp.com/dist/RTCMultiConnection.min.js"></script>
```

Now you will get maximum WebRTC success across all devices.

> `window.getExternalIceServers` boolean variable tries to load STUN+TURN servers from xirsys.com. It is `disabled` by default.

## `Object.observe`

`Object.observe` has been removed since `v3.2.95`. So you've to manually update-extra-data or set stream-end-handlers:

```javascript
connection.extra.something = 'something';
connection.updateExtraData();
```

## Attach External Stream

When attaching external streams:

```javascript
connection.attachStreams.push(yourExternalStrea);
connection.setStreamEndHandler(yourExternalStrea);
```

## Change User ID

Change userid using this method:

```javascript
connection.changeUserId('your-new-userid');
```

## ReUse Socket.io

* https://github.com/muaz-khan/RTCMultiConnection/issues/170#issuecomment-223758688

## Record Videos

```html
<script src="https://cdn.WebRTC-Experiment.com/RecordRTC.js"></script>
<script>
var listOfRecorders = {};
connection.onstream = function(event) {
    var recorder = RecordRTC(event.stream, {
        type: 'video',
        recorderType: MediaStreamRecorder
    });

    recorder.startRecording();

    listOfRecorders[event.streamid] = recorder;
};

btnStopRecording.onclick = function() {
    var streamid = prompt('Enter stream-id');

    if(!listOfRecorders[streamid]) throw 'Wrong stream-id';

    var recorder = listOfRecorders[streamid];
    recorder.stopRecording(function() {
        var blob = recorder.getBlob();

        window.open( URL.createObjectURL(blob) );

        // or upload to server
        var formData = new FormData();
        formData.append('file', blob);
        $.post('/server-address', formData, serverCallback);
    });
};
</script>
```

## Record All Videos In Single File

Wanna try a hack? **You will be able to record entire tab + all audios**.

First of all, install this Google Chrome extension:

* https://chrome.google.com/webstore/detail/recordrtc/ndcljioonkecdnaaihodjgiliohngojp

Now, install **last Google Chrome Canary**. Remember, chrome version 53+.

Now open options page `chrome://extensions/?options=ndcljioonkecdnaaihodjgiliohngojp` and enable this check-box:

```
Enable audio+tab recording?
```

Now click "R" icon to record any tab. Above chrome-extension **will record entire tab activity along with all audios at once!!!**

To repeat, `audio+tab` recording option allows you record entire tab activity; all videos on tab, all audios on the tab, dashboards or any activity!

Again, above chrome extension requires Google Chrome version greater than or equal to 53.

## Record Audio along with Screen

```javascript
connection.session = {
    audio: true,
    screen: true
};

connection.onstream = function(event) {
    if(connection.attachStreams.length <= 1) return;

    var screenStream, audioStream;
    connection.attachStreams.forEach(function(stream) {
        if(stream.isScreen) screenStream = true;
        if(stream.isAudio) audioSTream = true;
    });

    if(!screenStream || !audioStream) return;

    var audioPlusScreenStream = new MediaStream();
    audioPlusScreenStream.addTrack( screenStream.getVideoTracks()[0] );
    audioPlusScreenStream.addTrack( audioStream.getAudioTracks()[0] );

    var recorder = RecordRTC(audioPlusScreenStream, {
        type: 'video',
        recorderType: MediaStreamRecorder
    });

    recorder.startRecording();
};
```

## Share RoomID in the URL

There are two possible methods:

1. Share room-id as URL-hash
2. Share room-id as URL-query-parameters

```javascript
var roomid = 'xyz';
connection.open(roomid, function() {
    var urlToShare = 'https://yourDomain.com/room.html#' + roomid;

    // or second technique
    var urlToShare = 'https://yourDomain.com/room.html?roomid=' + roomid;

    window.open(urlToShare);
});
```

Now target users can read room-id as following:

```javascript
if(location.hash.length > 1) {
    var roomid = location.hash.replace('#', '');

    // auto join room
    connection.join(roomid);
}
```

Or read URL-query-parameters:

```javascript
(function() {
    var params = {},
        r = /([^&=]+)=?([^&]*)/g;

    function d(s) {
        return decodeURIComponent(s.replace(/\+/g, ' '));
    }
    var match, search = window.location.search;
    while (match = r.exec(search.substring(1)))
        params[d(match[1])] = d(match[2]);
    window.params = params;
})();

if(params.roomid) {
    // auto join room
    connection.join(params.roomid);
}
```

If you want to hide HTML for non-moderators or for users that are MERELY expected to join a room:

```javascript
if(params.roomid || location.hash.length > 1) { // whatever condition suits you
    $('.moderators-sections').hide();

    // or simple javascript
    Array.prototype.slice.call(document.querySelectorAll('.moderators-sections')).forEach(function(div) {
        div.style.display = 'none';

        // or
        div.parentNode.removeChild(div);
    });
}
```

PHP/ASPNET-MVC/Ruby developers can easily omit or remove those "redundant" HTML parts before serving the HTML to the browser.

Remember, both `open, join, or openOrJoin` all these methods supports second-callback-parameter, which means that either you joined or opened the room. E.g. `connection.open('roomid', successCallback);`

## Detect Presence

RTCMultiConnection v2 users should check this wiki-page: https://github.com/muaz-khan/RTCMultiConnection/wiki/Presence-Detection

v3 users should check this API (`connection.checkPresence`):

* https://github.com/muaz-khan/RTCMultiConnection/blob/master/docs/api.md#checkpresence

v3 users can get list of existing public-rooms using this API (`connection.getPublicModerators`):

* https://github.com/muaz-khan/RTCMultiConnection/blob/master/docs/api.md#getpublicmoderators

However v2 users can use `connection.onNewSession` event: https://www.rtcmulticonnection.org/docs/onNewSession/

# Other Documents

1. [Getting Started guide for RTCMultiConnection](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/getting-started.md)
2. [Installation Guide](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/installation-guide.md)
3. [How to Use?](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/how-to-use.md)
4. [API Reference](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/api.md)
5. [Upgrade from v2 to v3](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/upgrade.md)
6. [How to write iOS/Android applications?](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/ios-android.md)
7. [Tips & Tricks](https://github.com/muaz-khan/RTCMultiConnection/blob/master/docs/tips-tricks.md)

## License

[RTCMultiConnection](https://github.com/muaz-khan/RTCMultiConnection) is released under [MIT licence](https://github.com/muaz-khan/RTCMultiConnection/blob/master/LICENSE.md) . Copyright (c) [Muaz Khan](http://www.MuazKhan.com/).
