<a href="https://github.com/muaz-khan/RTCMultiConnection"><img src="https://i.imgur.com/MFfRBSM.png" /></a>

## RTCMultiConnection - WebRTC JavaScript Library

* [RTCMultiConnection v3 Live Demos](https://rtcmulticonnection.herokuapp.com/)
* [RTCMultiConnection v2.2.2 Live Demos](https://www.webrtc-experiment.com/RTCMultiConnection/)

[![npm](https://img.shields.io/npm/v/rtcmulticonnection-v3.svg)](https://npmjs.org/package/rtcmulticonnection-v3) [![downloads](https://img.shields.io/npm/dm/rtcmulticonnection-v3.svg)](https://npmjs.org/package/rtcmulticonnection-v3) [![Build Status: Linux](https://travis-ci.org/muaz-khan/RTCMultiConnection.png?branch=master)](https://travis-ci.org/muaz-khan/RTCMultiConnection)

> v3 has its own built-in socket.io server. It has pubnub/firebase demos as well; however [reliable-signaler](https://github.com/muaz-khan/Reliable-Signaler/tree/master/rtcmulticonnection-client) or [socketio-over-nodejs](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/socketio-over-nodejs) or similar codes can NOT be used with v3. Please use [`Signaling-Server.js`](https://github.com/muaz-khan/RTCMultiConnection/blob/master/Signaling-Server.js) instead.
>
> v3 can use XHR/XMPP/etc. signaling implementations as well. Please check [PubNubConnection.js](https://github.com/muaz-khan/RTCMultiConnection/blob/master/dev/PubNubConnection.js) to see how to configure it for 3rd party signaling implementations. You simply have to modify top few lines.

| DemoTitle        | TestLive           | ViewSource |
| ------------- |-------------|-------------|
| Audio+Video+File+Text | [Demo](https://rtcmulticonnection.herokuapp.com/demos/) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/Audio+Video+TextChat+FileSharing.html) |
| FileSharing | [Demo](https://rtcmulticonnection.herokuapp.com/demos/file-sharing.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/file-sharing.html) |
| Scalable Audio/Video Broadcast | [Demo](https://rtcmulticonnection.herokuapp.com/demos/Scalable-Broadcast.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/Scalable-Broadcast.html) |
| Scalable Video Broadcast | [Demo](https://rtcmulticonnection.herokuapp.com/demos/Video-Scalable-Broadcast.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/Video-Scalable-Broadcast.html) |
| Scalable File Sharing | [Demo](https://rtcmulticonnection.herokuapp.com/demos/Files-Scalable-Broadcast.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/Files-Scalable-Broadcast.html) |
| Video Conferencing | [Demo](https://rtcmulticonnection.herokuapp.com/demos/Video-Conferencing.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/Video-Conferencing.html) |
| Audio Conferencing | [Demo](https://rtcmulticonnection.herokuapp.com/demos/Audio-Conferencing.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/Audio-Conferencing.html) |
| Video Broadcasting | [Demo](https://rtcmulticonnection.herokuapp.com/demos/Video-Broadcasting.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/Video-Broadcasting.html) |
| TextChat+FileSharing | [Demo](https://rtcmulticonnection.herokuapp.com/demos/TextChat+FileSharing.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/TextChat+FileSharing.html) |
| addStream in a Chat room | [Demo](https://rtcmulticonnection.herokuapp.com/demos/addStream-in-Chat-room.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/addStream-in-Chat-room.html) |
| Part-of-Screen Sharing | [Demo](https://rtcmulticonnection.herokuapp.com/demos/share-part-of-screen.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/share-part-of-screen.html) |
| Share Audio+Screen | [Demo](https://rtcmulticonnection.herokuapp.com/demos/Audio+ScreenSharing.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/Audio+ScreenSharing.html) |
| Screen Sharing | [Demo](https://rtcmulticonnection.herokuapp.com/demos/Screen-Sharing.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/Screen-Sharing.html) |
| Disconnect/Rejoin rooms | [Demo](https://rtcmulticonnection.herokuapp.com/demos/Disconnect+Rejoin.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/Disconnect+Rejoin.html) |
| Password Protected Rooms | [Demo](https://rtcmulticonnection.herokuapp.com/demos/Password-Protected-Rooms.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/Password-Protected-Rooms.html) |
| replaceTrack in Firefox | [Demo](https://rtcmulticonnection.herokuapp.com/demos/replaceTrack.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/replaceTrack.html) |
| applyConstraints in Firefox | [Demo](https://rtcmulticonnection.herokuapp.com/demos/applyConstraints.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/applyConstraints.html) |
| Firebase-Demo | [Demo](https://rtcmulticonnection.herokuapp.com/demos/Firebase-Demo.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/Firebase-Demo.html) |
| PubNub Demo | [Demo](https://rtcmulticonnection.herokuapp.com/demos/PubNub-Demo.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/PubNub-Demo.html) |
| Socket.io Custom-Messaging | [Demo](https://rtcmulticonnection.herokuapp.com/demos/custom-socket-event.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/custom-socket-event.html) |
| Check Rooms Presence | [Demo](https://rtcmulticonnection.herokuapp.com/demos/checkPresence.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/checkPresence.html) |
| getPublicModerators | [Demo](https://rtcmulticonnection.herokuapp.com/demos/getPublicModerators.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/getPublicModerators.html) |
| Change Cameras/Microphonea | [Demo](https://rtcmulticonnection.herokuapp.com/demos/Switch-Cameras.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/Switch-Cameras.html) |
| MultiRTC: Skype-like app | [Demo](https://rtcmulticonnection.herokuapp.com/demos/MultiRTC/) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/MultiRTC/) |

Fetch latest code:

```
git clone https://github.com/muaz-khan/RTCMultiConnection.git ./RTCMultiConnection
cd RTCMultiConnection
sudo npm install --save-dev
```

Or:

**Download via Github** (as `ZIP` or `.js`): [https://github.com/muaz-khan/RTCMultiConnection/releases](https://github.com/muaz-khan/RTCMultiConnection/releases)

Or:

```
sudo npm install rtcmulticonnection-v3
cd node_modules
cd rtcmulticonnection-v3 # you MUST go to this directory
node server.js
```

Or MOST preferred one:

```
mkdir RTCMultiConnection-v3
cd RTCMultiConnection-v3
wget http://dl.webrtc-experiment.com/rtcmulticonnection-v3.tar.gz
tar -zxvf rtcmulticonnection-v3.tar.gz
ls -a
```

* [rtcmulticonnection-v3.tar.gz](http://dl.webrtc-experiment.com/rtcmulticonnection-v3.tar.gz)

Windows users can use 7Zip or WinRAR to extract the TAR file.

To TEST:

```
node server.js
```

If fails:

```
lsof -n -i4TCP:9001 | grep LISTEN
kill process-ID
```

Or kill specific port. It may require "sudo" privileges:

```
fuser -vk 9001/tcp
```

Now open: `https://localhost:9001/`

## Keep running server in background

```
nohup nodejs server.js > /dev/null 2>&1 &
```

Or:

```
nohup nodejs server.js &
```

Or use `forever`:

```
npm install forever -g
forever start server.js
```

To auto-start `server.js` on system-reboot (i.e. when Mac/Linux system shuts down or reboots):

```
npm install forever-service
forever-service start server.js
```

## Link Script Files

All files from `/dist` directory are available on CDN: `https://cdn.webrtc-experiment.com:443/`

```html
<script src="/RTCMultiConnection.min.js"></script>

<!-- or -->
<script src="/dist/rmc3.min.js"></script>

<!-- CDN non-minified or minified -->
<script src="https://cdn.webrtc-experiment.com:443/rmc3.min.js"></script>

<!-- or specific version -->
<script src="https://github.com/muaz-khan/RTCMultiConnection/releases/download/3.2.95/rmc3.min.js"></script>
```

If you're sharing files, you also need to link:

```html
<script src="/dev/FileBufferReader.js"></script>

<!-- or CDN -->
<script src="https://cdn.webrtc-experiment.com:443/rmc3.fbr.min.js"></script>

<!-- or specific version -->
<script src="https://github.com/muaz-khan/RTCMultiConnection/releases/download/3.2.95/rmc3.fbr.min.js"></script>
```

> You can link multiple files from `dev` directory. Order doesn't matters.

## Set different socket URL

By default, RTCMultiConnection uses default port of your domain.

You can use custom ports either via `config.json` file:

```json
{
  "socketURL": "http:s//yourdomain.com:9001/",
  "socketMessageEvent": "RTCMultiConnection-Message"
}
```

Or simply override in your HTML code:

```javascript
connection.socketURL = 'http:s//yourdomain.com:9001/';

// if your server is already having "message" event
// then you can use something else, unique.
connection.socketMessageEvent = 'unique-message';
```

**For testing purpose**, you can use this as well:

```json
{
  "socketURL": "https://rtcmulticonnection.herokuapp.com:443/",
  "socketMessageEvent": "RTCMultiConnection-Message"
}
```

Or:

```javascript
connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
```

Here is a demo explaining how to use above `socketURL`:

* [https://jsfiddle.net/zd9Lsdfk/](https://jsfiddle.net/zd9Lsdfk/)

## Integrate in your own applications?

```javascript
// node.js code
require('./Signaling-Server.js')(httpServerHandlerOrPort);
```

If you're using [express.js](http://stackoverflow.com/a/35985109/552182):

```javascript
var fs = require('fs');

var options = {
    key: fs.readFileSync('fake-keys/privatekey.pem'),
    cert: fs.readFileSync('fake-keys/certificate.pem')
};

var express = require("express"),
    http = require("https"), // Use HTTPs here -------------
    app = express(),
    server = http.createServer(options, app);

server.listen(3000);

require('./Signaling-Server.js')(server);
```

## Migrating from older versions?

Use `streamEvents` instead of `connection.streams`:

```javascript
var stream = connection.streamEvents['streamid'];

// or use this code:
// backward compatibility
connection.streams = connection.streamEvents;
connection.numberOfConnectedUsers = 0;

if (Object.observe) {
    Object.observe(connection.streamEvents, function() {
        // for backward compatibility
        connection.streams = connection.streamEvents;
    });

    Object.observe(connection.peers, function() {
        // for backward compatibility
        connection.numberOfConnectedUsers = connection.getAllParticipants().length;
    });
}

# you can even use "getStreamById"
var stream = connection.attachStreams.getStreamById('streamid');

# to get remote stream by id
var allRemoteStreams = connection.getRemoteStreams('remote-user-id');
var stream = allRemoteStreams.getStreamByid('streamid');
```

Wanna check `isScreen` or `isVideo` or `isAudio`?

```javascript
connection.onstream = function(event) {
	if(event.stream.isScreen) {
		// screen stream
	}

	if(event.stream.isVideo) {
		// audio+video or video-only stream
	}

	if(event.stream.isAudio) {
		// audio-only stream
	}
};
```

Wanna mute/unmute?

```javascript
var stream = connection.streamEvents['streamid'].stream;
stream.mute('audio'); // audio or video or both
```

# API

### `applyConstraints`

This method allows you change video resolutions or audio sources without making a new getUserMedia request i.e. it modifies your existing MediaStream:

```javascript
var width = 1280;
var height = 720;

var supports = navigator.mediaDevices.getSupportedConstraints();

var constraints = {};
if (supports.width && supports.height) {
    constraints = {
        width: width,
        height: height
    };
}

connection.applyConstraints({
    video: constraints
});
```

`applyConstraints` access `mediaConstraints` object, defined here:

* [http://www.rtcmulticonnection.org/docs/mediaConstraints/](http://www.rtcmulticonnection.org/docs/mediaConstraints/)

### `replaceTrack`

This method allows you replace your front-camera video with back-camera video or replace video with screen or replace older low-quality video with new high quality video.

```javascript
// here is its simpler usage
connection.replaceTrack({
	screen: true,
	oneway: true
});
```

You can even pass `MediaStreamTrack` object:

```javascript
var videoTrack = yourVideoStream.getVideoTracks()[0];
connection.replaceTrack(videoTrack);
```

You can even pass `MediaStream` object:

```javascript
connection.replaceTrack(yourVideoStream);
```

You can even force to replace tracks only with a single user:

```javascript
var remoteUserId = 'single-remote-userid';

var videoTrack = yourVideoStream.getVideoTracks()[0];
connection.replaceTrack(videoTrack, remoteUserId);
```

### `resetTrack`

If you replaced a video or audio track, RTCMultiConnection keeps record of old track, and allows you move-back-to previous track:

```javascript
connection.resetTrack(null, true);
```

It takes following arguments:

1. `[Array of user-ids]` or `"single-user-id"` or `null`
2. Is video track (boolean): Either `true` or `false`. `null` means replace all last tracks.

```javascript
// with single user
connection.resetTrack('specific-userid', true);

// with multiple users
connection.resetTrack(['first-user', 'second-user'], true);

// NULL means all users
connection.resetTrack(null, true);

// reset only audio
connection.resetTrack(null, false);

// to reset all last-tracks (both audio and video)
connection.resetTrack();
```

> Means that you can reset all tracks that are replaced recently.

### `onUserStatusChanged`

This event allows you show online/offline statuses of the user:

```javascript
connection.onUserStatusChanged = function(status) {
	document.getElementById(event.userid).src = status === 'online' ? 'online.gif' : 'offline.gif';
};
```

You can even manually call above method from `onopen`, `onstream` and similar events to get the most accurate result possible:

```javascript
connection.onopen = connection.stream = function(event) {
    connection.onUserStatusChanged({
        userid: event.userid,
        extra: event.extra,
        status: 'online'
    });
};

connection.onleave = connection.streamended = connection.onclose = function(event) {
    connection.onUserStatusChanged({
        userid: event.userid,
        extra: event.extra,
        status: 'offline'
    });
};
```

### `getSocket`

This method allows you get the `socket` object used for signaling (handshake/presence-detection/etc.):

```javascript
var socket = connection.getSocket();
socket.emit('custom-event', 'hi there');
socket.on('custom-event', function(message) {
	alert(message);
});
```

If socket isn't connected yet, then above method will auto-connect it. It is using `connectSocket` to connect socket. See below section.

### `connectSocket`

It is same like old RTCMultiConnection `connect` method:

* [http://www.rtcmulticonnection.org/docs/connect/](http://www.rtcmulticonnection.org/docs/connect/)

`connectSocket` method simply initializes socket.io server so that you can send custom-messages before creating/joining rooms:

```javascript
connection.connectSocket(function(socket) {
	socket.on('custom-message', function(message) {
		alert(message);

		// custom message
		if(message.joinMyRoom) {
			connection.join(message.roomid);
		}
	});

	socket.emit('custom-message', 'hi there');

	connection.open('room-id');
});
```

### `getUserMediaHandler`

This object allows you capture audio/video stream yourself. RTCMultiConnection will NEVER know about your stream until you add it yourself, manually:

```javascript
var options = {
	localMediaConstraints: {
		audio: true,
		video: true
	},
	onGettingLocalMedia: function(stream) {},
	onLocalMediaError: function(error) {}
};
connection.getUserMediaHandler(options);
```

Its defined here:

* [getUserMedia.js#L20](https://github.com/muaz-khan/RTCMultiConnection/tree/master/dev/getUserMedia.js#L20)

## `becomePublicModerator`

By default: all moderators are private.

This method returns list of all moderators (room owners) who declared themselves as `public` via `becomePublicModerator` method:

```javascript
# to become a public moderator
connection.open('roomid', true); // 2nd argument is "TRUE"

# or call this method later (any time)
connection.becomePublicModerator();
```

### `getPublicModerators`

You can access list of all the public rooms using this method. This works similar to old RTCMultiConnection method `onNewSession`.

Here is how to get public moderators:

```javascript
connection.getPublicModerators(function(array) {
	array.forEach(function(moderator) {
		// moderator.extra
		connection.join(moderator.userid);
	});
});
```

You can even search for specific moderators. Moderators whose userid starts with specific string:

```javascript
var moderatorIdStartsWith = 'public-moderator-';
connection.getPublicModerators(moderatorIdStartsWith, function(array) {
	// only those moderators are returned here
	// that are having userid similar to this:
	// public-moderator-xyz
	// public-moderator-abc
	// public-moderator-muaz
	// public-moderator-conference
	array.forEach(function(moderator) {
		// moderator.extra
		connection.join(moderator.userid);
	});
});
```

## `setUserPreferences`

You can force `dontAttachStream` and `dontGetRemoteStream` for any or each user in any situation:

```javascript
connection.setUserPreferences = function(userPreferences) {
    if (connection.dontAttachStream) {
    	// current user's streams will NEVER be shared with any other user
        userPreferences.dontAttachLocalStream = true;
    }

    if (connection.dontGetRemoteStream) {
    	// current user will NEVER receive any stream from any other user
        userPreferences.dontGetRemoteStream = true;
    }

    return userPreferences;
};
```

Scenarios:

1. All users in the room are having cameras
2. All users in the room can see only **self video**
3. All users in the room can text-chat or share files; but can't share videos
4. As soon as teacher or moderator or presenter enters in the room; he can ask all the participants or specific participants to share their cameras with single or multiple users.

They can enable cameras as following:

```javascritp
connection.onmessage = function(event) {
	var message = event.data;
	if(message.shareYourCameraWithMe) {
		connection.dontAttachStream = false;
		connection.renegotiate(event.userid); // share only with single user
	}

	if(message.shareYourCameraWithAllUsers) {
		connection.dontAttachStream = false;
		connection.renegotiate(); // share with all users
	}
}
```

i.e. `setUserPreferences` allows you enable camera on demand.

## `checkPresence`

This method allows you check presence of the moderators/rooms:

```javascript
connection.checkPresence('roomid', function(isRoomEists, roomid) {
	if(isRoomEists) {
		connection.join(roomid);
	}
	else {
		connection.open(roomid);
	}
});
```

## `onReadyForOffer`

This event is fired as soon as callee says "I am ready for offer. I enabled camera. Please create offer and share.".

```javascript
connection.onReadyForOffer = function(remoteUserId, userPreferences) {
	// if OfferToReceiveAudio/OfferToReceiveVideo should be enabled for specific users
	userPreferences.localPeerSdpConstraints.OfferToReceiveAudio = true;
	userPreferences.localPeerSdpConstraints.OfferToReceiveVideo = true;

	userPreferences.dontAttachStream = false; // according to situation
	userPreferences.dontGetRemoteStream = false;  // according to situation

	// below line must be included. Above all lines are optional.
	connection.multiPeersHandler.createNewPeer(remoteUserId, userPreferences);
};
```

## `onNewParticipant`

This event is fired as soon as someone tries to join you. You can either reject his request or set preferences.

```javascript
connection.onNewParticipant = function(participantId, userPreferences) {
    // if OfferToReceiveAudio/OfferToReceiveVideo should be enabled for specific users
	userPreferences.localPeerSdpConstraints.OfferToReceiveAudio = true;
	userPreferences.localPeerSdpConstraints.OfferToReceiveVideo = true;

	userPreferences.dontAttachStream = false; // according to situation
	userPreferences.dontGetRemoteStream = false;  // according to situation

	// below line must be included. Above all lines are optional.
	// if below line is NOT included; "join-request" will be considered rejected.
    connection.acceptParticipationRequest(participantId, userPreferences);
};
```

Or:

```javascript
var alreadyAllowed = {};
connection.onNewParticipant = function(participantId, userPreferences) {
	if(alreadyAllowed[participantId]) {
		connection.addParticipationRequest(participantId, userPreferences);
		return;
	}

	var message = participantId + ' is trying to join your room. Confirm to accept his request.';
	if( window.confirm(messsage ) ) {
		connection.addParticipationRequest(participantId, userPreferences);
	}
};
```

## `disconnectWith`

Disconnect with single or multiple users. This method allows you keep connected to `socket` however either leave entire room or remove single or multiple users:

```javascript
connection.disconnectWith('remoteUserId');

// to leave entire room
connection.getAllParticipants().forEach(function(participantId) {
	connection.disconnectWith(participantId);
});
```

## `getAllParticipants`

Get list of all participants that are connected with current user.

```javascript
var numberOfUsersInTheRoom = connection.getAllParticipants().length;

var remoteUserId = 'xyz';
var isUserConnectedWithYou = connection.getAllParticipants().indexOf(remoteUserId) !== -1;

connection.getAllParticipants().forEach(function(remoteUserId) {
	var user = connection.peers[remoteUserId];
	console.log(user.extra);

	user.peer.close();
	alert(user.peer === webkitRTCPeerConnection);
});
```

## `maxParticipantsAllowed`

Set number of users who can join your room.

```javascript
// to allow another single person to join your room
// it will become one-to-one (i.e. you+anotherUser)
connection.maxParticipantsAllowed = 1;
```

## `setCustomSocketHandler`

This method allows you skip Socket.io and force Firebase or PubNub or WebSockets or PHP/ASPNET whatever.

```javascript
connection.setCustomSocketHandler(FirebaseConnection);
```

Please check [`FirebaseConnection`](https://github.com/muaz-khan/RTCMultiConnection/tree/master/dev/FirebaseConnection.js) or [`PubNubConnection.js`](https://github.com/muaz-khan/RTCMultiConnection/tree/master/dev/PubNubConnection.js) to understand how it works.

## `enableLogs`

By default, logs are enabled.

```javascript
connection.enableLogs = false; // to disable logs
```

## `updateExtraData`

You can force all the extra-data to be synced among all connected users.

```javascript
connection.extra.fullName = 'New Full Name';
connection.updateExtraData(); // now above value will be auto synced among all connected users
```

## `onExtraDataUpdated`

This event is fired as soon as extra-data from any user is updated:

```javascript
connection.onExtraDataUpdated = function(event) {
	console.log('extra data updated', event.userid, event.extra);

	// make sure that <video> header is having latest fullName
	document.getElementById('video-header').innerHTML = event.extra.fullName;
};
```

## `streamEvents`

It is similar to this:

* http://www.rtcmulticonnection.org/docs/streams/

## `socketURL`

If socket.io is listening on a separate port or external URL:

```javascript
connection.socketURL = 'https://domain:port/';
```

## `socketOptions`

Socket.io options:

```javascript
connection.socketOptions = {
	'force new connection': true, // For SocketIO version < 1.0
	'forceNew': true, // For SocketIO version >= 1.0
	'transport': 'polling' // fixing transport:unknown issues
};
```

## `DetectRTC`

Wanna detect current browser?

```javascript
if(connection.DetectRTC.browser.isChrome) {
	// it is Chrome
}

// you can even set backward compatibility hack
connection.UA = connection.DetectRTC.browser;
if(connection.UA.isChrome) { }
```

Wanna detect if user is having microphone or webcam?

```javascript
connection.DetectRTC.detectMediaAvailability(function(media){
	if(media.hasWebcam) { }
	if(media.hasMicrophone) { }
	if(media.hasSpeakers) { }
});
```

## `invokeSelectFileDialog`

Get files problematically instead of using `input[type=file]`:

```javascript
connection.invokeSelectFileDialog(function(file) {
	var file = this.files[0];
	if(file){
		connection.shareFile(file);
	}
});
```

## `processSdp`

Force bandwidth, bitrates, etc.

```javascript
var BandwidthHandler = connection.BandwidthHandler;
connection.bandwidth = {
	audio: 128,
	video: 256,
	screen: 300
};
connection.processSdp = function(sdp) {
    sdp = BandwidthHandler.setApplicationSpecificBandwidth(sdp, connection.bandwidth, !!connection.session.screen);
    sdp = BandwidthHandler.setVideoBitrates(sdp, {
        min: connection.bandwidth.video,
        max: connection.bandwidth.video
    });

    sdp = BandwidthHandler.setOpusAttributes(sdp);

    sdp = BandwidthHandler.setOpusAttributes(sdp, {
        'stereo': 1,
        //'sprop-stereo': 1,
        'maxaveragebitrate': connection.bandwidth.audio * 1000 * 8,
        'maxplaybackrate': connection.bandwidth.audio * 1000 * 8,
        //'cbr': 1,
        //'useinbandfec': 1,
        // 'usedtx': 1,
        'maxptime': 3
    });

    return sdp;
};
```

* http://www.rtcmulticonnection.org/docs/processSdp/

## `shiftModerationControl`

Moderator can shift moderation control to any other user:

```javascript
connection.shiftModerationControl('remoteUserId', connection.broadcasters, false);
```

`connection.broadcasters` is the array of users that builds mesh-networking model i.e. multi-user conference.

Moderator shares `connection.broadcasters` with each new participant; so that new participants can connect with other members of the room as well.

## `onShiftedModerationControl`

This event is fired, as soon as moderator of the room shifts moderation control toward you:

```javascript
connection.onShiftedModerationControl = function(sender, existingBroadcasters) {
	connection.acceptModerationControl(sender, existingBroadcasters);
};
```

## `autoCloseEntireSession`

* http://www.rtcmulticonnection.org/docs/autoCloseEntireSession/

## `filesContainer`

A DOM-element to show progress-bars and preview files.

```javascript
connection.filesContainer = document.getElementById('files-container');
```

## `videosContainer`

A DOM-element to append videos or audios or screens:

```javascript
connection.videosContainer = document.getElementById('videos-container');
```

## `addNewBroadcaster`

In a one-way session, you can make multiple broadcasters using this method:

```javascript
if(connection.isInitiator) {
	connection.addNewBroadcaster('remoteUserId');
}
```

Now this user will also share videos/screens.

## `removeFromBroadcastersList`

Remove user from `connection.broadcasters` list.

```javascript
connection.removeFromBroadcastersList('remote-userid');
```

## `onMediaError`

If screen or video capturing fails:

```javascript
connection.onMediaError = function(error) {
	alert( 'onMediaError:\n' + JSON.stringify(error) );
};
```

## `renegotiate`

Recreate peers. Capture new video using `connection.captureUserMedia` and call `connection.renegotiate()` and that new video will be shared with all connected users.

```javascript
connection.renegotiate('with-single-userid');

connection.renegotiate(); // with all users
```

## `addStream`

* http://www.rtcmulticonnection.org/docs/addStream/

You can even pass `streamCallback`:

```javascript
connection.addStream({
	screen: true,
	oneway: true,
	streamCallback: function(screenStream) {
		// this will be fired as soon as stream is captured
		screenStream.onended = function() {
			document.getElementById('share-screen').disabled = false;

			// or show button
			$('#share-screen').show();
		}
	}
});
```

## `mediaConstraints`

* http://www.rtcmulticonnection.org/docs/mediaConstraints/

## `sdpConstraints`

* http://www.rtcmulticonnection.org/docs/sdpConstraints/

## `extra`

* http://www.rtcmulticonnection.org/docs/extra/

## `userid`

* http://www.rtcmulticonnection.org/docs/userid/

## `session`

* http://www.rtcmulticonnection.org/docs/session/

## `enableFileSharing`

To enable file sharing. By default, it is `false`:

```javascript
connection.enableFileSharing = true;
```

## `changeUserId`

Change userid and update userid among all connected peers:

```javascript
connection.changeUserId('new-userid');

// or callback to check if userid is successfully changed
connection.changeUserId('new-userid', function() {
    alert('Your userid is successfully changed to: ' + connection.userid);
});
```

## `closeBeforeUnload`

It is `true` by default. If you are handling `window.onbeforeunload` yourself, then you can set it to `false`:

```javascript
connection.closeBeforeUnload = false;
window.onbeforeunlaod = function() {
	connection.close();
};
```

## `closeEntireSession`

You can skip using `autoCloseEntireSession`. You can keep session/room opened whenever/wherever required and dynamically close the entire room using this method.

```javascript
connection.closeEntireSession();

// or callback
connection.closeEntireSession(function() {
    alert('Entire session has been closed.');
});

// or before leaving a page
connection.closeBeforeUnload = false;
window.onbeforeunlaod = function() {
    connection.closeEntireSession();
};
```

## `onUserIdAlreadyTaken`

This event is fired if two users tries to open same room.

```javascript
connection.onUserIdAlreadyTaken = function(useridAlreadyTaken, yourNewUserId) {
    if (connection.enableLogs) {
        console.warn('Userid already taken.', useridAlreadyTaken, 'Your new userid:', yourNewUserId);
    }

    connection.join(useridAlreadyTaken);
};
```

Above event gets fired out of this code:

```javascript
moderator1.open('same-roomid');
moderator2.open('same-roomid');
```

## `onEntireSessionClosed`

You can tell users that room-moderator closed entire session:

```javascript
connection.onEntireSessionClosed = function(event) {
    console.info('Entire session is closed: ', event.sessionid, event.extra);
};
```

## `captureUserMedia`

* http://www.rtcmulticonnection.org/docs/captureUserMedia/

## `open`

Open room:

```javascript
var isPublicRoom = false;
connection.open('roomid', isPublicRoom);

// or
connection.open('roomid', function() {
	// on room created
});
```

## `join`

Join room:

```javascript
connection.join('roomid');

// or pass "options"
connection.join('roomid', {
	localPeerSdpConstraints: {
		OfferToReceiveAudio: true,
		OfferToReceiveVideo: true
	},
	remotePeerSdpConstraints: {
		OfferToReceiveAudio: true,
		OfferToReceiveVideo: true
	},
	isOneWay: false,
	isDataOnly: false
});
```

## `openOrJoin`

```javascript
connection.openOrJoin('roomid');

// or
connection.openOrJoin('roomid', function(isRoomExists, roomid) {
	if(isRoomExists) alert('opened the room');
	else alert('joined the room');
});
```

## `dontCaptureUserMedia`

By default, it is `false`. Which means that RTCMultiConnection will always capture video if `connection.session.video===true`.

If you are attaching external streams, you can ask RTCMultiConnection to DO NOT capture video:

```javascript
connection.dontCaptureUserMedia = true;
```

## `dontAttachStream`

By default, it is `false`. Which means that RTCMultiConnection will always attach local streams.

```javascript
connection.dontAttachStream = true;
```

## `dontGetRemoteStream`

By default, it is `false`. Which means that RTCMultiConnection will always get remote streams.

```javascript
connection.dontGetRemoteStream = true;
```

## `getScreenConstraints`

This method allows you get full control over screen-parameters:

```javascript
connection.__getScreenConstraints = connection.getScreenConstraints;
connection.getScreenConstraints = function(callback) {
    connection.__getScreenConstraints(function(error, screen_constraints) {
        if (connection.DetectRTC.browser.name === 'Chrome') {
            delete screen_constraints.mandatory.minAspectRatio;
            delete screen_constraints.mandatory.googLeakyBucket;
            delete screen_constraints.mandatory.googTemporalLayeredScreencast;
            delete screen_constraints.mandatory.maxWidth;
            delete screen_constraints.mandatory.maxHeight;
            delete screen_constraints.mandatory.minFrameRate;
            delete screen_constraints.mandatory.maxFrameRate;
        }
        callback(error, screen_constraints);
    });
};
```

Or to more simplify it:

```javascript
connection.__getScreenConstraints = connection.getScreenConstraints;
connection.getScreenConstraints = function(callback) {
    connection.__getScreenConstraints(function(error, screen_constraints) {
        if (connection.DetectRTC.browser.name === 'Chrome') {
            screen_constraints.mandatory = {
                chromeMediaSource: screen_constraints.mandatory.chromeMediaSource,
                chromeMediaSourceId: screen_constraints.mandatory.chromeMediaSourceId
            };
        }
        callback(error, screen_constraints);
    });
};
```

You can even delete width/height for Firefox:

```javascript
connection.__getScreenConstraints = connection.getScreenConstraints;
connection.getScreenConstraints = function(callback) {
    connection.__getScreenConstraints(function(error, screen_constraints) {
        if (connection.DetectRTC.browser.name === 'Chrome') {
            delete screen_constraints.mandatory.minAspectRatio;
        }
        if (connection.DetectRTC.browser.name === 'Firefox') {
            delete screen_constraints.width;
            delete screen_constraints.height;
        }
        callback(error, screen_constraints);
    });
};
```

## Firebase?

If you are willing to use Firebase instead of Socket.io there, open [GruntFile.js](https://github.com/muaz-khan/RTCMultiConnection/blob/master/Gruntfile.js#L26) and replace `SocketConnection.js` with `FirebaseConnection.js`.

Then use `grunt` to recompile RTCMultiConnection.js.

**Otherwise** if you don't want to modify RTCMultiConnection:

```html
<script src="/dev/globals.js"></script>
<script src="/dev/FirebaseConnection.js"></script>
<script>
var connection = new RTCMultiConnection();

connection.firebase = 'your-firebase-account';

// below line replaces FirebaseConnection
connection.setCustomSocketHandler(FirebaseConnection);
</script>
```

Demo: [https://rtcmulticonnection.herokuapp.com/demos/Firebase-Demo.html](https://rtcmulticonnection.herokuapp.com/demos/Firebase-Demo.html)

## PubNub?

Follow above all "firebase" steps and use `PubNubConnection.js` instead.

Please don't forget to use your own PubNub keys.

Demo: [https://rtcmulticonnection.herokuapp.com/demos/PubNub-Demo.html](https://rtcmulticonnection.herokuapp.com/demos/PubNub-Demo.html)

## Scalable Broadcasting

v3 now supports WebRTC scalable broadcasting. Two new API are introduced: `enableScalableBroadcast` and `singleBroadcastAttendees`.

```javascript
connection.enableScalableBroadcast = true; // by default, it is false.
connection.singleBroadcastAttendees = 3;   // how many users are handled by each broadcaster
```

Live Demos:

* [All-in-One Scalable Broadcast](https://rtcmulticonnection.herokuapp.com/demos/Scalable-Broadcast.html)
* [Files-Scalable-Broadcast.html](https://rtcmulticonnection.herokuapp.com/demos/Files-Scalable-Broadcast.html)
* [Video-Scalable-Broadcast.html](https://rtcmulticonnection.herokuapp.com/demos/Video-Scalable-Broadcast.html)

## Fix Echo

```javascript
connection.onstream = function(event) {
	if(event.mediaElement) {
		event.mediaElement.muted = true;
		delete event.mediaElement;
	}

	var video = document.createElement('video');
	if(event.type === 'local') {
		video.muted = true;
	}
	video.src = URL.createObjectURL(event.stream);
	connection.videosContainer.appendChild(video);
}
```

## How to use getStats?

* https://github.com/muaz-khan/getStats

```javascript
connection.multiPeersHandler.onPeerStateChanged = function(state) {
    if (state.iceConnectionState.search(/disconnected|closed|failed/gi) === -1 && !connection.isConnected) {
        connection.isConnected = true;

        var peer = connection.peers[state.userid].peer;
        getStats(peer, function(result) {
            if (!result || !result.connectionType) return;

            // "relay" means TURN server
            // "srflx" or "prflx" means STUN server
            // "host" means neither STUN, nor TURN
            console.debug('Incoming stream is using:', result.connectionType.remote.candidateType);
            console.debug('Outgoing stream is using:', result.connectionType.local.candidateType);

            // user external ip-addresses
            console.debug('Remote user ip-address:', result.connectionType.remote.ipAddress);
            console.debug('Local user ip-address:', result.connectionType.local.ipAddress);

            // UDP is a real media port; TCP is a fallback.
            console.debug('Peers are connected on port:', result.connectionType.transport);
        }, 5000);
        return;
    }
};
```

## How to mute/unmute?

You can compare `muteType` for `onmute` event; and `unmuteType` for `onunmute` event.

```javascript
connection.onmute = function(e) {
    if (!e.mediaElement) {
        return;
    }

    if (e.muteType === 'both' || e.muteType === 'video') {
        e.mediaElement.src = null;
        e.mediaElement.pause();
        e.mediaElement.poster = e.snapshot || 'https://cdn.webrtc-experiment.com/images/muted.png';
    } else if (e.muteType === 'audio') {
        e.mediaElement.muted = true;
    }
};

connection.onunmute = function(e) {
    if (!e.mediaElement) {
        return;
    }

    if (e.unmuteType === 'both' || e.unmuteType === 'video') {
        e.mediaElement.poster = null;
        e.mediaElement.src = URL.createObjectURL(e.stream);
        e.mediaElement.play();
    } else if (e.unmuteType === 'audio') {
        e.mediaElement.muted = false;
    }
};
```

## HD Streaming

```javascript
connection.bandwidth = {
    audio: 128,
    video: 1024,
    screen: 1024
};

var videoConstraints = {
    mandatory: {
        maxWidth: 1920,
        maxHeight: 1080,
        minAspectRatio: 1.77,
        minFrameRate: 3,
        maxFrameRate: 64
    },
    optional: []
};

connection.mediaConstraints.video = videoConstraints;
```

For low-latency audio:

* https://twitter.com/WebRTCWeb/status/499102787733450753

## Default devices?

By default, RTCMultiConnection tries to use last available microphone and camera. However you can disable this behavior and ask to use default devices instead:

```javascript
// pass second parameter to force options
var connection = new RTCMultiConnection(roomId, {
    useDefaultDevices: true
});
```

## Auto open or join?

By default, you always have to call `open` or `join` or `openOrJoin` methods manually. However you can force RTCMultiConnection to auto open/join room as soon as constructor is initialized.

```javascript
// pass second parameter to force options
var connection = new RTCMultiConnection(roomId, {
    autoOpenOrJoin: true
});
```

## Wanna use H264 for video?

```javascript
connection.codecs.video = 'H264';
```

## Disable Video NACK

```html
<script src="/dev/CodecsHandler.js"></script>
<script>
// in your HTML file
connection.processSdp = function(sdp) {
    // Disable NACK to test IDR recovery
    sdp = CodecsHandler.disableNACK(sdp);
    return sdp;
};
</script>
```

## Wanna use VP8 for video?

```javascript
connection.codecs.video = 'VP8';
```

## Wanna use G722 for audio?

```javascript
connection.codecs.audio = 'G722';
```

## Prioritize Codecs

```html
<script src="/dev/CodecsHandler.js"></script>
<script>
// in your HTML file
if(connection.DetectRTC.browser.name === 'Firefox') {
    connection.getAllParticipants().forEach(function(p) {
        var peer = connection.peers[p].peer;

        CodecsHandler.prioritize('audio/opus', peer);
    });
}
</script>
```

## Tips & Tricks

`Object.observe` has been removed since `v3.2.95`. So you've to manually update-extra-data or set stream-end-handlers:

```javascript
connection.extra.something = 'something';
connection.updateExtraData();
```

When attaching external streams:

```javascript
connection.attachStreams.push(yourExternalStrea);
connection.setStreamEndHandler(yourExternalStrea);
```

Change userid using this method:

```javascript
connection.changeUserId('your-new-userid');
```

## iOS/Android

RTCMultiConnection-v3 supports `cordova` based iOS/android apps.

Copy/paste entire [`rmc3.min.js`](https://github.com/muaz-khan/RTCMultiConnection/tree/master/dist/rmc3.min.js) file inside `deviceready` callback:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>CordovaApp using RTCMultiConnection-v3</title>
    <link rel="stylesheet" href="css/index.css">
</head>
<body>
    <!-- your UI code -->

    <!-- scripts are placed on footer -->
    <script src="cordova.js"></script>

    <!-- NEVER link rmc3.min.js here -->
    <!-- instead copy/paste code from rmc3.min.js into below "index.js" file -->
    <script src="js/index.js"></script>
</body>
</html>
```

`www/js/index.js`:


```javascript
// please read below comments:
document.addEventListener('deviceready', function() {
    // copy/paste entire/all code from "rmc3.min.js" file
    // here --- exact here
    // paste inside this callback
    // if you will NOT do this, RTCMultiConnection will fail on cordova-based apps
    // again, you MUST NOT link rmc3.min.js
    // instead copy/paste all the codes here

    // you can put your custom-ui-codes here
    // e.g.
    // var connection = new RTCMultiConnection();
}, false);
```

Installations:

```
sudo npm install cordova -g
sudo npm install xcode -g

cordova create ./mobileApp org.mobileApp mobileApp
cd mobileApp

cordova plugin add cordova-plugin-iosrtc
cd hooks
wget https://raw.githubusercontent.com/eface2face/cordova-plugin-iosrtc/master/extra/hooks/iosrtc-swift-support.js

sudo chmod +x iosrtc-swift-support.js

cd ..
```

Now modify `config.xml` for this section:

```xml
<platform name="ios">
    <hook type="after_platform_add" src="hooks/iosrtc-swift-support.js" />
</platform>
```

Further commands:

```
cordova platform add ios@3.9.2

cordova build ios
cordova build android
```

Prerequisites:

1. xcode `7.2.1` (required)
2. cordova android plugin `5.1.0` (suggested)
3. cordova ios plugin `3.9.2` --- note: MUST be this version (don't use newer ones)

Check xcode-build-version: `xcodebuild -version`

Make sure that terminal is using latest xcode:

```
xcode-select --print-path

sudo xcode-select -switch /Applications/Xcode5.1.1/Xcode.app
```

`config.xml` hints:

Modify `platform/android/AndroidManifest.xml` for `<uses-permission android:name="android.permission.CAMERA"/>`. Now getUserMedia API will work in Android.

An example `AndroidManifest.xml` file:

```xml
<?xml version='1.0' encoding='utf-8'?>
<manifest android:hardwareAccelerated="true" android:versionCode="1" android:versionName="0.0.1" package="com.yourApp" xmlns:android="http://schemas.android.com/apk/res/android">
    <supports-screens android:anyDensity="true" android:largeScreens="true" android:normalScreens="true" android:resizeable="true" android:smallScreens="true" android:xlargeScreens="true" />
    <application android:hardwareAccelerated="true" android:icon="@drawable/icon" android:label="@string/app_name" android:supportsRtl="true">
        <activity android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale" android:label="@string/activity_name" android:launchMode="singleTop" android:name="MainActivity" android:theme="@android:style/Theme.DeviceDefault.NoActionBar" android:windowSoftInputMode="adjustResize">
            <intent-filter android:label="@string/launcher_name">
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
    <uses-sdk android:minSdkVersion="14" android:targetSdkVersion="23" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.CAMERA" />
</manifest>
```

An example `config.xml` file (make sure that `icon.png` has valid path):

```xml
<?xml version='1.0' encoding='utf-8'?>
<widget id="com.yourApp" version="0.0.1" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
    <name>yourApp</name>
    <icon src="www/icon.png" />
    <description>yourApp</description>
    <author email="yourApp@gmail.com" href="http://www.yourApp.com">You</author>
    <content src="index.html" />
    <plugin name="cordova-plugin-whitelist" spec="1" />
    <access uri="*" subdomains="true" origin="*" />
    <allow-intent href="http://*/*" />
    <allow-intent href="https://*/*" />
    <allow-intent href="tel:*" />
    <allow-intent href="sms:*" />
    <allow-intent href="mailto:*" />
    <allow-intent href="geo:*" />
    <allow-navigation href="https://*/*" />
    <platform name="android">
        <allow-intent href="market:*" />
    </platform>
    <platform name="ios">
        <allow-intent href="itms:*" />
        <allow-intent href="itms-apps:*" />
        <hook type="after_platform_add" src="hooks/iosrtc-swift-support.js" />
        <config-file target="*-Info.plist" parent="CFBundleURLTypes">
            <array>
                <key>NSAppTransportSecurity</key>
                <dict><key>NSAllowsArbitraryLoads</key><true/></dict>
            </array>
        </config-file>
    </platform>
    <preference name="xwalkVersion" value="16+" />
    <preference name="xwalkCommandLine" value="--disable-pull-to-refresh-effect --allow-file-access-from-files --disable-web-security" />
    <preference name="xwalkMode" value="embedded" />
    <preference name="xwalkMultipleApk" value="true" />
    <preference name="BackgroundColor" value="0xFFFF0000" />
    <preference name="xwalkUserAgent" value="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36" />
    <preference name="AndroidPersistentFileLocation" value="Internal" />
</widget>
```

## RTCMultiConnection v2.2.2 Demos

| Experiment Name        | Demo           | Source Code |
| ------------- |-------------|-------------|
| AppRTC like RTCMultiConnection demo! | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/AppRTC-Look.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/AppRTC-Look.html) |
| MultiRTC! RTCMultiConnection all-in-one demo! | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/MultiRTC/) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/MultiRTC-simple) |
| Collaborative Canvas Designer | [Demo](https://www.webrtc-experiment.com/Canvas-Designer/) | [Source](https://github.com/muaz-khan/Canvas-Designer) |
| Conversation.js - Skype like library | [Demo](https://www.webrtc-experiment.com/Conversationjs/) | [Source](https://github.com/muaz-khan/Conversation.js) |
| All-in-One test | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/all-in-one.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/all-in-one.html) |
| Multi-Broadcasters and Many Viewers | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/Multi-Broadcasters-and-Many-Viewers.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/Multi-Broadcasters-and-Many-Viewers.html) |
| Select Broadcaster at runtime | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/select-broadcaster-at-runtime.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/select-broadcaster-at-runtime.html) |
| OneWay Screen & Two-Way Audio | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/OneWay-Screen-TwoWay-Audio.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/OneWay-Screen-TwoWay-Audio.html) |
| Stream Mp3 Live | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/stream-mp3-live.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/stream-mp3-live.html) |
| Socket.io auto Open/Join rooms | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/socketio-auto-open-join-room.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/socketio-auto-open-join-room.html) |
| Screen Sharing & Cropping | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/cropped-screen-sharing.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/cropped-screen-sharing.html) |
| Share Part of Screen without cropping it | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/RTCMultiConnection.sharePartOfScreen.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/RTCMultiConnection.sharePartOfScreen.html) |
| getMediaDevices/enumerateDevices | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/getMediaDevices.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/getMediaDevices.html) |
| Renegotiation & Mute/UnMute/Stop | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/Renegotiation.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/Renegotiation.html) |
| Video-Conferencing | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/videoconferencing.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/videoconferencing.html) |
| Video Broadcasting | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/video-broadcasting.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/video-broadcasting.html) |
| Many-to-One Broadcast | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/many-to-one-broadcast.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/many-to-one-broadcast.html) |
| Audio Conferencing | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/audioconferencing.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/audioconferencing.html) |
| Multi-streams attachment | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/multi-streams-attachment.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/multi-streams-attachment.html) |
| Admin/Guest audio/video calling | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/admin-guest.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/admin-guest.html) |
| Session Re-initiation Test | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/session-reinitiation.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/session-reinitiation.html) |
| Preview Screenshot of the room | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/rooms-screenshots.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/rooms-screenshots.html) |
| RecordRTC & RTCMultiConnection | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/RecordRTC-and-RTCMultiConnection.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/RecordRTC-and-RTCMultiConnection.html) |
| Explains how to customize ice servers; and resolutions | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/features.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/features.html) |
| Mute/Unmute and onmute/onunmute | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/mute-unmute.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/mute-unmute.html) |
| One-page demo: Explains how to skip external signalling gateways | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/one-page-demo.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/one-page-demo.html) |
| Password Protect Rooms: Explains how to authenticate users | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/password-protect-rooms.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/password-protect-rooms.html) |
| Session Management: Explains difference between "leave" and "close" methods | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/session-management.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/session-management.html) |
| Multi-Sessions Management | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/multi-sessions-management.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/multi-sessions-management.html) |
| Customizing Bandwidth | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/bandwidth.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/bandwidth.html) |
| Users ejection and presence detection | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/users-ejection.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/users-ejection.html) |
| Multi-Session Establishment | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/multi-session-establishment.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/multi-session-establishment.html) |
| Group File Sharing + Text Chat | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/group-file-sharing-plus-text-chat.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/group-file-sharing-plus-text-chat.html) |
| Audio Conferencing + File Sharing + Text Chat | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/audio-conferencing-data-sharing.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/audio-conferencing-data-sharing.html) |
| Join with/without camera | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/join-with-or-without-camera.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/join-with-or-without-camera.html) |
| Screen Sharing | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/screen-sharing.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/screen-sharing.html) |
| One-to-One file sharing | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/one-to-one-filesharing.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/one-to-one-filesharing.html) |
| Manual session establishment + extra data transmission | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/manual-session-establishment-plus-extra-data-transmission.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/manual-session-establishment-plus-extra-data-transmission.html) |
| Manual session establishment + extra data transmission + video conferencing | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/manual-session-establishment-plus-extra-data-transmission-plus-videoconferencing.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/manual-session-establishment-plus-extra-data-transmission-plus-videoconferencing.html) |
| takeSnapshot i.e. Take Snapshot of Local/Remote streams | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/takeSnapshot.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/takeSnapshot.html) |
| Audio/Video/Screen sharing and recording | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/audio-video-screen-sharing-recording.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/audio-video-screen-sharing-recording.html) |
| Broadcast Multiple-Cameras | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/Broadcast-Multiple-Cameras.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/Broadcast-Multiple-Cameras.html) |
| Remote Stream Forwarding | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/remote-stream-forwarding.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2/demos/remote-stream-forwarding.html) |
| WebRTC Scalable Broadcast | Socketio/Nodejs | [Source](https://github.com/muaz-khan/WebRTC-Scalable-Broadcast) |

v2.2.2 is available here:

* https://github.com/muaz-khan/RTCMultiConnection/tree/master/v2.2.2

# [Wiki Pages](https://github.com/muaz-khan/RTCMultiConnection/wiki)

* [List of Breaking Changes](https://github.com/muaz-khan/RTCMultiConnection/wiki/Breaking-Changes)
* [Coding Tricks](https://github.com/muaz-khan/RTCMultiConnection/wiki/Coding-Tricks)
* [Switch Between Cameras](https://github.com/muaz-khan/RTCMultiConnection/wiki/Switch-between-cameras)
* [Bandwidth Management](https://github.com/muaz-khan/RTCMultiConnection/wiki/Bandwidth-Management)
* [Channels and Sessions Management](https://github.com/muaz-khan/RTCMultiConnection/wiki/Channels-and-Sessions)
* [How to send Custom/Private messages?](https://github.com/muaz-khan/RTCMultiConnection/wiki/Custom-Messages)
* [Custom Private Servers](https://github.com/muaz-khan/RTCMultiConnection/wiki/Custom-Private-Servers)
* [How to link RTCMultiConnection.js?](https://github.com/muaz-khan/RTCMultiConnection/wiki/How-to-link-RTCMultiConnection.js%3F)
* [How to fix echo?](https://github.com/muaz-khan/RTCMultiConnection/wiki/How-to-fix-echo%3F)
* [How to share Part-of-Screen?](https://github.com/muaz-khan/RTCMultiConnection/wiki/Part-of-Screen-Sharing)
* [How to detect Presence of the users & sessions?](https://github.com/muaz-khan/RTCMultiConnection/wiki/Presence-Detection)
* [How to share screen?](https://github.com/muaz-khan/RTCMultiConnection/wiki/Screen-Sharing)
* [How to secure your RTCMultiConnection codes?](https://github.com/muaz-khan/RTCMultiConnection/wiki/Security)
* [Use WebSync Signaling Server in any RTCMultiConnection demo](https://github.com/muaz-khan/RTCMultiConnection/wiki/WebSync-Signaling-Server)

## Twitter

* https://twitter.com/WebRTCWeb i.e. @WebRTCWeb

## License

[RTCMultiConnection](https://github.com/muaz-khan/RTCMultiConnection) is released under [MIT licence](https://github.com/muaz-khan/RTCMultiConnection/blob/master/LICENSE.md) . Copyright (c) [Muaz Khan](http://www.MuazKhan.com/).
