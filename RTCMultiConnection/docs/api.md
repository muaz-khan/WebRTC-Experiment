# API Reference

> RTCMultiConnection API References

You can search docs/APIs here:

* http://www.rtcmulticonnection.org/
* http://www.rtcmulticonnection.org/docs/

### `socketURL`

1. You can run nodejs on a separate domain or separate port or on a separate server
2. You can set `socketURL="ip-address"` to link nodejs server
3. Now you can run RTCMultiConnection demos on any webpage; whether it is PHP page, ASP.net page, python or ruby page or whatever framework running top over HTML.

```javascript
connection.socketURL = 'https://onlyChangingPort.com:8888/';
connection.socketURL = 'https://separateDomain.com:443/';
connection.socketURL = '/'; // same domain

// or a free signaling server:

// v3.4.7 or newer
connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

// v3.4.6 or older
connection.socketURL = 'https://webrtcweb.com:9001/';
```

### `socketCustomParameters`

You can pass your custom socket.io parameters as well:

```javascript
// starts with "&"
// &fullName=Muaz
// &meetingId=xyz
connection.socketCustomParameters = '&fullName=Muaz&country=PK&meetingId=xyz';
```

Now you can open `server.js` and access above parameters here:

```javascript
// you can find below line on "server.js" file
require('./Signaling-Server.js')(app, function(socket) {
    var params = socket.handshake.query;

    var meetingId = params.meetingId;
    var fullName = params.fullName;
    var country = params.country;
    var userid = params.userid;
    // etc.
});
```

### Update Extra-Data before Socket connects

This feature allows you reliably update-extra data on nodejs before socket.io connection opens.

```javascript
connection.extra = {
    fullName: 'Muaz Khan',
    joinedAt: (new Date).toISOString()
};s
connection.socketCustomParameters = '&extra=' + JSON.stringify(connection.extra);

connection.openOrJoin('room-id');
```

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

### `onRoomFull`

```javascript
connection.maxParticipantsAllowed = 1; // one-to-one
connection.onRoomFull = function(roomid) {
  alert('Room is full.');
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

### `socketCustomEvent`

A `string` property, allows you set custom socket.io event listener:

```javascript
connection.socketCustomEvent = 'abcdef';
connection.openOrJoin('roomid', function() {
    connection.socket.on(connection.socketCustomEvent, function(message) {
        alert(message);
    });

    connection.socket.emit(connection.socketCustomEvent, 'My userid is: ' + connection.userid);
});
```

### `setCustomSocketEvent`

This method allows you set custom socket listeners anytime, during a live session:

```javascript
connection.setCustomSocketEvent('abcdef');
connection.socket.on('abcdef', function(message) {
    alert(message);
});

connection.socket.emit('abcdef', 'My userid is: ' + connection.userid);
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

This method allows you skip Socket.io and force custom signaling implementations e.g. SIP-signaling, XHR-signaling, SignalR/WebSync signaling, Firebase/PubNub signaling etc.

Here is Firebase example:

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

Here is PubNub example:

```html
<script src="/dev/globals.js"></script>
<script src="/dev/PubNubConnection.js"></script>
<script>
var connection = new RTCMultiConnection();

// below line replaces PubNubConnection
connection.setCustomSocketHandler(PubNubConnection);
</script>
```

SIP/SignalR/WebSync/XHR signaling:

```javascript
// please don't forget linking /dev/globals.js

var connection = new RTCMultiConnection();

// SignalR (requires /dev/SignalRConnection.js)
connection.setCustomSocketHandler(SignalRConnection);

// WebSync (requires /dev/WebSyncConnection.js)
connection.setCustomSocketHandler(WebSyncConnection);

// XHR (requires /dev/XHRConnection.js)
connection.setCustomSocketHandler(XHRConnection);

// Sip (requires /dev/SipConnection.js)
connection.setCustomSocketHandler(SipConnection);
```

Please check [`FirebaseConnection`](https://github.com/muaz-khan/RTCMultiConnection/tree/master/dev/FirebaseConnection.js) or [`PubNubConnection.js`](https://github.com/muaz-khan/RTCMultiConnection/tree/master/dev/PubNubConnection.js) to understand how it works.

For more information:

* https://rtcmulticonnection.herokuapp.com/demos/Audio+Video+TextChat+FileSharing.html#comment-2670178473
* https://rtcmulticonnection.herokuapp.com/demos/Audio+Video+TextChat+FileSharing.html#comment-2670182313

## `enableLogs`

By default, logs are enabled.

```javascript
connection.enableLogs = false; // to disable logs
```

## Get Remote User Extra Data

```javascript
connection.extra = {
    joinTime: new Date()
};
connection.updateExtraData();
```

Here is how to get extra-data:

```javascript
var extra = connection.peers['remote-userid'].extra;
alert( extra.joinTime);
```

Recent commit supports this as well:

```javascript
connection.onstream = function(event) {
    if(event.type === 'remote') {
        connection.socket.emit('get-remote-user-extra-data', event.userid, function(extra) {
             alert( extra.joinTime );
        });
    }
}:
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

## `socketOptions`

Socket.io options:

```javascript
connection.socketOptions = {
	'force new connection': true, // For SocketIO version < 1.0
	'forceNew': true, // For SocketIO version >= 1.0
	'transport': 'polling' // fixing transport:unknown issues
};
```

Or:

```javascript
connection.socketOptions.resource = 'custom';
connection.socketOptions.transport = 'polling';
connection.socketOptions['try multiple transports'] = false;
connection.socketOptions.secure = true;
connection.socketOptions.port = '9001';
connection.socketOptions['max reconnection attempts'] = 100;
// etc.
```

## `connection.socket`

```javascript
connection.open('roomid', function() {
    connection.socket.emit('whatever', 'hmm');
    connection.socket.disconnect();
});
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

## `onMediaError`

If screen or video capturing fails:

```javascript
connection.onMediaError = function(error) {
	alert( 'onMediaError:\n' + JSON.stringify(error) );
};
```

## `renegotiate`

> Note on 10-02-2018: `replaceTrack` is preferred over `renegotiate`.

Recreate peers. Capture new video using `connection.captureUserMedia` and call `connection.renegotiate()` and that new video will be shared with all connected users.

```javascript
connection.renegotiate('with-single-userid');

connection.renegotiate(); // with all users
```

## `addStream`

* http://www.rtcmulticonnection.org/docs/addStream/

You can even pass `streamCallback` and check if user declined prompt to share
screen:

```javascript
connection.addStream({
	screen: true,
	oneway: true,
	streamCallback: function(screenStream) {
		// this will be fired as soon as stream is captured
		if (!screenStream) {
			alert('User did NOT select to share any stream. He clicked "Cancel" button instead.');
			return;
		}
		screenStream.onended = function() {
			document.getElementById('share-screen').disabled = false;

			// or show button
			$('#share-screen').show();
		};
	};
});
```

## `removeStream`

* http://www.rtcmulticonnection.org/docs/removeStream/

You can even pass `streamCallback`:

```javascript
connection.removeStream('streamid');
connection.renegotiate();
```

## `mediaConstraints`

* http://www.rtcmulticonnection.org/docs/mediaConstraints/

## `sdpConstraints`

* http://www.rtcmulticonnection.org/docs/sdpConstraints/

## `extra`

* http://www.rtcmulticonnection.org/docs/extra/

## `userid`

* http://www.rtcmulticonnection.org/docs/userid/

You must set userid before opening or joining a room:

```javascript
connection.userid = 'abcdef';
connection.openOrJoin('roomid');
```

## `session`

* http://www.rtcmulticonnection.org/docs/session/

To enable two-way audio however one-way screen or video:

```javascript
// video is oneway, however audio is two-way
connection.session = {
    audio: 'two-way',
    video: true,
    oneway: true
};

// screen is oneway, however audio is two-way
connection.session = {
    audio: 'two-way',
    screen: true,
    oneway: true
};
```

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

## `closeSocket`

```javascript
connection.closeSocket(); // close socket.io connections
```

## `close`

* http://www.rtcmulticonnection.org/docs/close/

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
connection.open('roomid', function(isRoomCreated, roomid, error) {
	if(error) {
        alert(error);

        // if error says that room is already created
        connection.join('room-id');
        return;
    }
});
```

## `join`

Join room:

```javascript
connection.join('roomid', function(isRoomJoined, roomid, error) {
    if(error) {
        // maybe room does not exist
        // maybe room is full
        // maybe password is invalid
        alert(error);
        return;
    }
});

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
connection.openOrJoin('roomid', function(isRoomOpened, roomid) {
	if(isRoomOpened === true) {
        alert('opened the room');
    }
	else {
        alert('joined the room');
    }
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

## `onSettingLocalDescription`

This event is fired as soon as RTCMultiConnection calls the `nativePeer.setLocalDescription` method.

This event helps you say: "incoming call" or debug peers if connection didn't establish till next 3 seconds.

This method is helpful if you switch between cameras or you add screen or add other camera or change anything:

```javascript
connection.onSettingLocalDescription = fucntion(event) {
	console.log('Trying to connect with', event.userid);

	var nativePeer = event.peer;
	var localStreams = nativePeer.getLocalStreams();
	var remoteStreams = nativePeer.getRemoteStreams();

	// make sure that you are correctly displaying all remote videos
	var tries = 0;
	(function looper() {
		if(tries > 10) return; // throw error here

		tries++;

		// make sure that each user's video.id == hisUserID
		var video = document.getElementById(event.userid);

		// skip: if user left or if user video is playing
		if(!video || video.currentTIme > 0) return;

		video.src = URL.createObjectURL ( nativePeer.getRemoteStreams()[0] );
		video.play();

		setTimeout(looper, 1000); // repeat till 10-seconds
	})();
};
```

## `beforeAddingStream`

You can skip any stream or allow RTCMultiConnection to share a stream with remote users.

`nativePeer.addStream` method will be called only if below event permits the `MediaStream` object:

```javascript
connection.beforeAddingStream = function(stream, peer) {
	if(stream.id == 'any-streamid') return; // skip
	if(stream.isScreen) return; // skip
	if(stream.inactive) return; // skip
	
	// var remoteUserId = peer.userid;
	// var remoteUserExtra = connection.peers[remoteUserId].extra;

	return stream; // otherwise allow RTCMultiConnection to share this stream with remote users
};
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

## Cross-Domain Screen Capturing

First step, install this chrome extension:

* https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk

Now use below code in any RTCMultiConnection (screen) demo:

```html
<script src="/dev/globals.js"></script>

<!-- capture screen from any HTTPs domain! -->
<script src="https://cdn.webrtc-experiment.com:443/getScreenId.js"></script>

<script>
// Using getScreenId.js to capture screen from any domain
// You do NOT need to deploy Chrome Extension YOUR-Self!!
connection.getScreenConstraints = function(callback, audioPlusTab) {
    if (isAudioPlusTab(connection, audioPlusTab)) {
        audioPlusTab = true;
    }

    getScreenConstraints(function(error, screen_constraints) {
        if (!error) {
            screen_constraints = connection.modifyScreenConstraints(screen_constraints);
            callback(error, screen_constraints);
        }
    }, audioPlusTab);
};
</script>
```

Don't want to link `/dev/globals.js` or want to simplify codes???

```html
<!-- capture screen from any HTTPs domain! -->
<script src="https://cdn.webrtc-experiment.com:443/getScreenId.js"></script>

<script>
// Using getScreenId.js to capture screen from any domain
// You do NOT need to deploy Chrome Extension YOUR-Self!!
connection.getScreenConstraints = function(callback) {
    getScreenConstraints(function(error, screen_constraints) {
        if (!error) {
            screen_constraints = connection.modifyScreenConstraints(screen_constraints);
            callback(error, screen_constraints);
        }
    });
};
</script>
```

## Scalable Broadcasting

RTCMultiConnection now supports WebRTC scalable broadcasting. Two new API are introduced: `enableScalableBroadcast` and `singleBroadcastAttendees`.

```javascript
connection.enableScalableBroadcast = true; // by default, it is false.
connection.singleBroadcastAttendees = 3;   // how many users are handled by each broadcaster
```

Live Demos:

| DemoTitle        | TestLive           | ViewSource |
| ------------- |-------------|-------------|
| Scalable Audio/Video Broadcast | [Demo](https://rtcmulticonnection.herokuapp.com/demos/Scalable-Broadcast.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/Scalable-Broadcast.html) |
| Scalable Screen Broadcast | [Demo](https://rtcmulticonnection.herokuapp.com/demos/Scalable-Screen-Broadcast.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/Scalable-Screen-Broadcast.html) |
| Scalable Video Broadcast | [Demo](https://rtcmulticonnection.herokuapp.com/demos/Video-Scalable-Broadcast.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/Video-Scalable-Broadcast.html) |
| Scalable File Sharing | [Demo](https://rtcmulticonnection.herokuapp.com/demos/Files-Scalable-Broadcast.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/Files-Scalable-Broadcast.html) |

## `onNumberOfBroadcastViewersUpdated`

This event is fired for scalable-broadcast-initiator.

```javascript
connection.onNumberOfBroadcastViewersUpdated = function(event) {
    // event.broadcastId
    // event.numberOfBroadcastViewers
    console.info('Number of broadcast (', event.broadcastId, ') viewers', event.numberOfBroadcastViewers);
};
```

## `getNumberOfBroadcastViewers`

You can manually get number-of-broadcast viewers as well:

```javascript
connection.getNumberOfBroadcastViewers('broadcast-unique-id', function(numberOfBroadcastViewers) {
    alert(numberOfBroadcastViewers);
});
```

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

## `StreamHasData`

[`StreamHasData.js`](https://github.com/muaz-khan/RTCMultiConnection/tree/master/dev/StreamHasData.js) allows you check if remote stream started flowing or if remote stream is successfully received or if remote stream has data or not.

```html
<script src="/dev/StreamHasData.js"></script>
<script>
connection.videosContainer = document.getElementById('videos-container');
connection.onstream = function(event) {
    StreamHasData.check(event.mediaElement, function(hasData) {
        if (!hasData) {
            alert('Seems stream does NOT has any data.');
        }

        // append video here
        connection.videosContainer.appendChild(event.mediaElement);
        event.mediaElement.play();
        setTimeout(function() {
            event.mediaElement.play();
        }, 5000);
    });
};
</script>
```

Demo: https://rtcmulticonnection.herokuapp.com/demos/StreamHasData.html

## File Sharing

You can share files using `connection.send(file)`. E.g.

```javascript
fileInput.onchange = function() {
    var file = this.files[0];

    if(!file) return;
    connection.send(file);
};
```

If you mistakenly shared wrong file, you can stop further sharing:

```javascript
var file;
fileInput.onchange = function() {
    file = this.files[0];

    if(!file) return;

    // First step: Set UUID for your file object
    file.uuid = connection.token();

    connection.send(file);
};

if(connection.fbr) {
    // Second Last step: remove/delete file chunks based on file UUID
    delete connection.fbr.chunks[file.uuid];
}
```

You can even set `connection.fbr=null`. **It is VERY EASY & reliable**:

```javascript
connection.fbr = null;
```

You can even try any of these (you don't need to care about file UUID):

```javascript
if(connection.fbr) {
    // clearing all file chunks
    // removing all file receivers
    connection.fbr.chunks = {};
    connection.fbr.users = {};
}
```

## `config.json`

You can set ports, logs, socket-URLs and other configuration using [`config.json`](https://github.com/muaz-khan/RTCMultiConnection/blob/master/config.json).

```json
{
  "socketURL": "/",
  "socketMessageEvent": "RTCMultiConnection-Message",
  "socketCustomEvent": "RTCMultiConnection-Custom-Message",
  "port": "9001",
  "enableLogs": "true"
}
```

Note: `config.json` is completely optional. You can set each property directly in your HTML files using `connection.property` e.g.

```javascript
connection.socketURL = '/';
connection.socketMessageEvent = 'RTCMultiConnection-Message';

// etc.
```

## Server Logs

[`config.json`](https://github.com/muaz-khan/RTCMultiConnection/blob/master/config.json) provides `enableLogs` attribute.

If `enableLogs:true` then all unexpected-server-errors are logged into [`logs.json`](https://github.com/muaz-khan/RTCMultiConnection/blob/master/logs.json) file.

So, if you're facing unexpected-server-disconnection, or if your application is NOT working properly; for example, if `userid` is NOT getting updated or if `extra-data` is NOT getting-synced; then you can look into `logs.json` to see unexpected errors.

You can either remove `enableLogs` from the `config.json` to **disable logs**; or you can use `false`:

```json
{
  "enableLogs": "false"
}
```

# Tips & Tricks

* https://github.com/muaz-khan/RTCMultiConnection/blob/master/docs/tips-tricks.md

# Other Documents

1. [Getting Started guide for RTCMultiConnection](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/getting-started.md)
2. [Installation Guide](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/installation-guide.md)
3. [How to Use?](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/how-to-use.md)
4. [API Reference](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/api.md)
5. [Upgrade from v2 to v3](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/upgrade.md)
6. [How to write iOS/Android applications?](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/ios-android.md)
7. [Tips & Tricks](https://github.com/muaz-khan/RTCMultiConnection/blob/master/docs/tips-tricks.md)

## Twitter

* https://twitter.com/WebRTCWeb i.e. @WebRTCWeb

## License

[RTCMultiConnection](https://github.com/muaz-khan/RTCMultiConnection) is released under [MIT licence](https://github.com/muaz-khan/RTCMultiConnection/blob/master/LICENSE.md) . Copyright (c) [Muaz Khan](http://www.MuazKhan.com/).
