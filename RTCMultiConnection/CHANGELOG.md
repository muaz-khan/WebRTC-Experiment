<a name="v2.0"></a>
### 2.0 (its latest work-in-progress release)

```
// install latest package
npm install rtcmulticonnection

// use latest file (v2.*.*)
<script src="./node_modules/rtcmulticonnection/RTCMultiConnection.js"></script>

// or instead of installing NPM package,
// directly link the file:
<script src="//cdn.webrtc-experiment.com/RTCMultiConnection.js"></script>

// or
<script src="//cdn.webrtc-experiment.com/RTCMultiConnection-v2.2.1.js"></script>
```

#### Bug Fixes
* "connection.DetectRTC.screen.getChromeExtensionStatus" fixed.
    
    ```javascript
    document.getElementById('add-screen').onclick = function() {
        connection.DetectRTC.screen.extensionid = 'your-own-extension-id';
        connection.DetectRTC.screen.getChromeExtensionStatus(function(status) {
            if(status == 'installed-enabled') {
                connection.addStream({ screen: true, oneway: true });
            }
        });
    };
    
    ```
* Bug-Fixed: Now, MediaStream is removed from "attachStreams" array when stopped.
* Bug-Fixed: Now, OfferToReceiveAudio/OfferToReceiveVideo are "NOT" forced to be false even for data-only connections. Because it affects renegotiation scenarios.
* Fixed: [issue#11](https://github.com/muaz-khan/RTCMultiConnection/issues/11)
* Fixed: "**[session](http://www.rtcmulticonnection.org/docs/session/)={data:true}**" must not having audio/video media lines.
* "[onstreamended](http://www.rtcmulticonnection.org/docs/onstreamended/)" fixed. [Ref](https://github.com/muaz-khan/RTCMultiConnection/issues/7)
* Renegotiation fixed. It was a bug in 2.*.* < 2.1.7
* [stopRecording](http://www.rtcmulticonnection.org/docs/stopRecording/) "callback" fixed.
    
    ```javascript
    connection.streams['streamid'].stopRecording(function(blobs) {
        // blobs.video
    }, { video: true });
    
    ```
* Screen negotiations fixed. Screen can be renegotiated many times.
    
    ```javascript
    connection.addStream({
        screen: true,
        oneway: true
    });
    
    ```
* "connection.[candidates](http://www.rtcmulticonnection.org/docs/candidates/)" has been fixed.
* connection.[selectDevices](http://www.rtcmulticonnection.org/docs/selectDevices/) is fixed.
    
    ```javascript
    connection.selectDevices('audioinput-deviceid', 'videooutput-deviceid');
    
    ```
* Fixed [#266](https://github.com/muaz-khan/WebRTC-Experiment/issues/266) i.e. IE11 support added through [PluginRTC](https://github.com/muaz-khan/PluginRTC) (webrtc-everywhere).
* Duplicate "enumerateDevices" listing fixed.
* **connection.sharePartOfScreen** fixed for sharing screen over multi-users:
    
    ```javascript
    connection.sharePartOfScreen({
        element: 'body', // element to share
        interval: 500    // how after take screenshots
    });
    
    ```
* Fixed: TextSender is unable to send array.
    
    ```javascript
    connection.send([1, 2, 3, 4, 5]);
    
    ```
* Fixed: onStreamEvent.isAudio/onStreamEvent.isVideo seems NULL in mute/unmute cases with only {audio:true} or {video:true}
    
    ```javascript
    connection.onmute = function(event) {
        event.isAudio
        event.isVideo
        event.isScreen
    };
    
    ```
#### Features
* Latest updates: https://github.com/muaz-khan/RTCMultiConnection/commits/master
* v2.2.1 breaking updates:
    * connection.stats.sessions is removed; use connection.sessionDescriptions instead.
    * connection.stats.numberOfSessions is removed; use connection.numberOfSessions instead.
    * connection.stats.numberOfConnectedUsers is removed; use connection.numberOfConnectedUsers instead.
    * connection.getStats and connection.stats are removed.
* onStreamEndedHandler updated. "connection.onstreamended" is fired only when both "mediaElement" and "mediaElement.parentNode" are not NULL.
* connection.onopen is now having "event.channel" object.
* 2nd invocation of "createDataChannel" is disabled.
* "connection.enableFileSharing" added.
    
    ```javascript
    // to disable file sharing
    connection.enableFileSharing = false;
    
    ```
* Added: **connection.peers['target-userid'].[takeSnapshot](http://www.rtcmulticonnection.org/docs/takeSnapshot/)(callback)**;
* Added: **connection.streams['streamid'].takeSnapshot(callback)*;
* "[onleave](http://www.rtcmulticonnection.org/docs/onleave/)" is "merely" fired once for each user.
* "**sync:false**" added for "**connection.streams['streamid'].mute**" method.
    
    ```javascript
    connection.streams.selectFirst({ local:true }).mute({
        video: true,
        sync: false // mute video locally--only
    })
    
    // or
    connection.streams['streamid'].mute({
        audio: true,
        sync: false // mute audio locally--only
    })
    
    ```
* "connection.[mediaConstraints](http://www.rtcmulticonnection.org/docs/mediaConstraints/)" updated.
    
    ```javascript
    connection.mediaConstraints = {
        video: {
            mandatory: {},
            optional: []
        }, 
        audio: {
            mandatory: {},
            optional: []
        }
    };
    
    ```
* "**connection.rtcConfiguration**" added:
    
    ```javascript
    connection.rtcConfiguration = {
        iceTransports: 'relay',
        iceServers: [iceServersArray]
    }
    
    ```
* Now "[onstreamended](http://www.rtcmulticonnection.org/docs/onstreamended/)" is fired merely "once" for each stream.
* **{audio:true,video:true}** are forced for Android. All media-constraints skipped.
* Firefox screen capturing is HTTPs-only.
* "**preferJSON**" is removed. Now data is "always" sent as ArrayBuffer.
* Now, [FileBufferReader](https://github.com/muaz-khan/FileBufferReader) is used for file sharing.
* FileSender/FileReceiver/FileConveter has been removed.
* onFileStart/onFileProgress/onFileEnd: now having "userid" and "extra" objects.
* When "muted" stream is negotiated; it fires "onmute" event as soon as as remote stream is received.
    
    ```javascript
    var firstLocalStream = connection.streams.selectFirst({
        local: true
    });
    
    // you can mute a stream before joining a session
    firstLocalStream.mute({
        video: true
    });
    
    connection.open();
    
    ```
* Now, "**autoReDialOnFailure**" is "true" by default.
* "**connection.enumerateDevices**" and "**connection.getMediaDevices**" added.
    
    ```javascript
    // to iterate over all available media devices
    connection.enumerateDevices(function(devices) {
        devices.forEach(function(device) {
            // device.deviceId
            // device.kind == 'audioinput' || 'audiooutput' || 'audio'
            
            connection.selectDevices(device.deviceId);
        });
    });
    
    ```
* "connection.changeBandwidth" added.
    
    ```javascript
    connection.changeBandwidth({
        audio: 30,
        video: 64
    });
    
    ```
* "connection.streams.remove" added.
    
    ```javascript
    // fire "onstreamended" for all screen streams
    connection.streams.remove({
        isScreen: true
    });
    
    // fire "onstreamended" for all local streams
    connection.streams.remove({
        local: true
    });
    
    // fire "onstreamended" for all remote audio-only streams
    connection.streams.remove({
        isAudio: true,
        remote: true
    });
    
    ```
* "connection.streams.selectFirst" and "connection.streams.selectAll" added.
    
    ```javascript
    // first  local stream
    var firstLocalStream = connection.streams.selectFirst({
        local: true
    });
    
    // all audio-only streams
    var allAudioOnlyStreams = connection.streams.selectAll({
        isAudio: true
    });
    
    // a user's all streams
    var firstLocalScreenStream = connection.streams.selectAll({
        userid: 'remote-userid'
    });
    
    ```
* "connection.streams.stop" improved.
    
    ```javascript
    // stop a user's all screen streams
    connection.streams.stop({
        userid: 'remote-userid',
        screen: true
    });
    
    ```
* "**connection.privileges.canStopRemoteStream**" and "**connection.privileges.canMuteRemoteStream**" added:
    
    ```javascript
    // set it "true" if you want to allow user to stop/mute remote stream
    connection.privileges = {
        canStopRemoteStream: true, // user can stop remote streams
        canMuteRemoteStream: true  // user can mute remote streams
    };
    
    // otherwise, for "false" values, if user will try to programmatically invoke "stop" or "mute" method,
    // you'll be informed in the "onstatechange" event.
    connection.onstatechange = function(state) {
        if(state.name == 'stop-request-denied') {
            alert(state.reason);
        }
        
        if(state.name == 'mute-request-denied') {
            alert(state.reason);
        }
    };
    
    ```
* Breaking changes for "connection.onstatechange". Now an "object" is passed over "onstatechange"
    
    ```javascript
    connection.onstatechange = function(state) {
        // state.userid == 'target-userid' || 'browser'
        // state.extra  == 'target-user-extra-data' || {}
        // state.name  == 'short name'
        // state.reason == 'longer description'
        if(state.name == 'stop-request-denied') {
            alert(state.reason);
        }
    };
    
    ```
* "connection.[streams](http://www.rtcmulticonnection.org/docs/streams/).mute" updated:
    
    ```javascript
    // mute all remote audio-only streams.
    connection.streams.mute({
        isAudio: true,
        remote: true
    });
    
    // unmute all local screen streams.
    connection.streams.unmute({
        isScreen: true,
        local: true
    });
    
    ```
* ""connection.UA"" updated for "**is\*****":
    
    ```javascript
    connection.UA.isChrome
    connection.UA.isFirefox
    connection.UA.isIE
    connection.UA.isOpera
    connection.UA.isSafari
    connection.UA.isMobileDevice
    connection.UA.version
    
    ```
* **connection.preferJSON=true** added. You can set "**false**" to send non-Blob types i.e. **ArrayBuffer/ArrayBufferView/DataView** etc.
    
    ```javascript
    // Remember: it doesn't applies to file sharing.
    // it applies to all other kinds of data.
    connection.preferJSON = false;
    
    // send array buffer
    connection.send( new ArrayBuffer(10) );
    
    // get array buffer
    connection.onmessage =  function(event) {
        var buffer = event.data;
    };
    
    // convert string to array-buffer
    connection.send( str2ab('a string test') );
    
    // parsing array-buffer back into string
    connection.onmessage =  function(event) {
        var string = ab2str(event.data);
    };
    
    // this method converts array-buffer into string
    function ab2str(buf) {
        return String.fromCharCode.apply(null, new Uint16Array(buf));
    }
    
    // this method converts string into array-buffer
    function str2ab(str) {
        var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
        var bufView = new Uint16Array(buf);
        for (var i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }
    
    ```
* **connection.getExternalIceServers** is now "**false**" by default. If you want to use XirSys based ICE-Servers in your application, you MUST set it "**true**":
    
    ```javascript
    // if you want to use XirSys-based STUN/TURN servers
    connection.getExternalIceServers = true;
    
    ```
* Now, "**[sendCustomMessage](http://www.rtcmulticonnection.org/docs/sendCustomMessage/)**", "**[addStream](http://www.rtcmulticonnection.org/docs/addStream/)**", "**switchStream**", "**[renegotiate](http://www.rtcmulticonnection.org/docs/renegotiate/)**" and "**[removeStream](http://www.rtcmulticonnection.org/docs/removeStream/)**" can be called even if there is no user connected.
    
    ```javascript
    var connection = new RTCMultiConnection();
    
    // quickly after initializing constructor
    // call addStream to add screen
    // it will wait until a user is connected
    // and it will auto share/renegotiate your screen with first user
    connection.addStream({
        screen: true,
        oneway: true
    });
    
    // send a custom message
    // it will be sent as soon as first user connects with you
    connection.sendCustomMessage('hi, there');
    
    ```
* Added support for initial "inactive" sessions. You can setup audio/video connection however streams will be "inactive":
    
    ```javascript
    // streams are on-hold:
    connection.session = {
        inactive: true,
        audio:    true,
        video:    true
    };
    
    // to unhold streams later
    connection.unhold('both'); // both audio and video
    
    ```
* Added **connection.waitUntilRemoteStreamStartsFlowing**. It allows you override default Wait-Until-Remote-Stream-starts-flowing behaviour.
    
    ```javascript
    connection.waitUntilRemoteStreamStartsFlowing = false;
    
    ```
* Added: **connection.switchStream**. It will remove all old local streams and add new stream.
    
    ```javascript
    // remove all old streams and add screen in oneway.
    connection.switchStream({
        screen: true,
        oneway: true
    });
    
    ```
* Added **connection.disconnect**:
    
    ```javascript
    // it means that:
    // 1) close all sockets
    // 2) close all peers
    // 3) clear all data
    // 4) refresh everything
    // Note: local streams will be kept in "localStreams" object if "keepStreamsOpened" boolean is used.
    connection.disconnect();
    
    // it fires: 
    connection.ondisconnected = function(event) {
        if(event.isSocketsDisconnected == true) { }
    };
    
    ```
* Updated: connection.**[removeStream](http://www.rtcmulticonnection.org/docs/removeStream/)**:
    
    ```javascript
    // remove all screen streams.
    // you can use "remove all video streams" by passing "video"
    // or "remove all audio streams" by passing "audio"
    connection.removeStream('screen');
    
    // remove-all but multiple streams
    // i.e. remove all audio and video streams
    // or remove all audio and screen streams
    connection.removeStream({
        screen: true,
        audio: true
    });
    
    ```
* Updated: connection.**[streams](http://www.rtcmulticonnection.org/docs/streams/)**.stop:
    
    ```javascript
    // stop any single stream: audio or video or screen
    connection.streams.stop('screen');
    
    // stop multiple streams
    connection.streams.stop({
        remote: true,
        video: true,
        screen: true
    });
    
    ```
* Data-channels "send" method improved.
    
    ```javascript
    connection.send('longest-test' || big_array || blob || file);
    
    ```
* **googTemporalLayeredScreencast** and **googLeakyBucket** added for screen capturing.
* Updated **connection.candidates**:
    
    ```javascript
    connection.candidates = {
        stun: true, // NEW property since v2.0
        turn: true, // NEW property since v2.0
        host: true
    };
    
    ```
* Added **connection.localStreams**. All local streams are always kept in this object even if session is closed. Look at above section i.e. **keepStreamsOpened**.
    
    ```javascript
    var stream = connection.localStreams['streamid'];
    
    // or
    connection.onSessionClosed = function() {
        var stream = connection.localStreams['streamid'];
    };
    
    // or
    for(var streamid in connection.localStreams) {
        var stream = connection.localStreams[streamid];
    }
    
    ```
* Added **connection.log** and **connection.onlog**. It allows you display logs in UI instead of in the console.
    
    ```javascript
    // if you want to disable logs
    connection.log = false;
    
    connection.onlog = function(log) {
        var div = document.createElement('div');
        div.innerHTML = JSON.stringify(log, null, '<br>');
        document.documentElement.appendChild(div);
    };
    
    ```
* Added **connection.keepStreamsOpened**. It allows you keep MediaStream active even if entire session is closed. It is useful in session-reinitiation scenarios.
    
    ```javascript
    connection.keepStreamsOpened = true;
    
    ```
* Removed: **connection.caniuse.checkIfScreenSharingFlagEnabled**. It was redundant.
* webrtc-everywhere/temasys support added for Safari & IE11. [PluginRTC](https://github.com/muaz-khan/PluginRTC)

<a name="v1.9"></a>
### 1.9 (2014-08-10)

```
<script src="//cdn.webrtc-experiment.com/RTCMultiConnection.js"></script>

// or
<script src="//cdn.webrtc-experiment.com/RTCMultiConnection-v1.9.js"></script>

// or
<script src="//www.rtcmulticonnection.org/latest.js"></script>
```

#### Bug Fixes
* **connection.[eject](http://www.rtcmulticonnection.org/docs/eject/)** is fixed.
    
    ```javascript
    connection.eject('target-userid');
    
    // check if user is ejected
    // clear rooms-list if user is ejected
    connection.onSessionClosed = function (session) {
        if (session.isEjected) {
            warn(session.userid, 'ejected you.');
        } else warn('Session has been closed.', session);
    
        if (session.isEjected) {
            roomsList.innerHTML = '';
            roomsList.style.display = 'block';
        }
    };
    
    ```
* Fixed: **remoteEvent.streamid** and **remoteEvent.isScreen**:
    
    ```javascript
    connection.onstream = function(event) {
        if(event.isScreen) {
            // it is screen
        }
    };
    
    ```
* **[connection.session](http://www.rtcmulticonnection.org/docs/session/)={}** fixed. It allows moderator/initiator to become a listener/viewer i.e. it supports many-to-one scenarios:
    
    ```javascript
    // for initiator
    connection.session = {};
    
    // for participants
    connection.onNewSession = function(session) {
        session.join({
            audio: true,
            video: true
        });
    };
    
    ```
#### Features
* Workaround-added: [Firefox don't yet support onended for any stream](https://bugzilla.mozilla.org/show_bug.cgi?id=1045810) (remote/local)
* RTCMultiConnection is updated for **audio+screen** from single getUserMedia request for Firefox Nightly. Below snippet is sharing single video stream containing both audio/video tracks; and target browser is joining with only audio. Screen can be viewed on both chrome and Firefox. If you'll share from chrome, then it will be making multiple getUserMedia requests.
    
    ```javascript
    // audio+video+screen will become audio+screen for Firefox
    // because Firefox isn't supporting multi-streams feature
    
    // initiator from Firefox
    initiator.session = {
        screen: true,
        audio: true
    };
    
    // participant in chrome or Firefox
    participant.onNewSession = function(session) {
        session.join({ audio: true });
    };
    
    ```
* Screen capturing support for Firefox nightly added. You simply need to open "**about:config**" on Firefox nightly and set "**media.getusermedia.screensharing.enabled**" to "**true**".
    
    ```javascript
    // same for Firefox
    connection.session = {
        screen: true,
        oneway: true
    };
    
    ```
* **connection.[dontCaptureUserMedia](http://www.rtcmulticonnection.org/docs/dontCaptureUserMedia/)** added:
    
    ```javascript
    connection.dontCaptureUserMedia = true;
    
    ```
* connection.**[dontAttachStream](http://www.rtcmulticonnection.org/docs/dontAttachStream/)** updated:
    
    ```javascript
    connection.dontAttachStream = true;
    
    ```
* **connection.onstreamid** added:
    
    ```javascript
    // on getting remote stream's clue
    connection.onstreamid = function (e) {
        var mediaElement = document.createElement(e.isAudio ? 'audio' : 'video');
        mediaElement.controls = true;
        mediaElement.poster = connection.resources.muted;
        mediaElement.id = e.streamid;
        connection.body.appendChild(mediaElement);
    };
    
    ```
* **connection.peers['target-userid'].getStats** added.
    
    ```javascript
    connection.peers['target-userid'].peer.getStats(function (result) {
        // many useful statistics here
    });
    
    ```
* **connection.onconnected** added.
    
    ```javascript
    connection.onconnected = function (event) {
        log('Peer connection has been established between you and', event.userid);
        
        // event.peer.addStream || event.peer.removeStream || event.peer.changeBandwidth
        // event.peer == connection.peers[event.userid]
        
        event.peer.getStats(function (result) {
            // many useful statistics here
        });
    };
    
    ```
* **connection.onfailed** added.
    
    ```javascript
    connection.onfailed = function (event) {
        event.peer.renegotiate();
        // or event.peer.redial();
        // event.targetuser.browser == 'firefox' || 'chrome'
    };
    
    ```
* Screen capturing is improved, and [single google chrome extension](https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk) is used to support capturing from all domains!
* **connection.[processSdp](http://www.rtcmulticonnection.org/docs/processSdp/)** added.
    
    ```javascript
    connection.processSdp = function(sdp) {
        sdp = remove_vp8_codecs(sdp);
        sdp = prefer_opus (sdp);
        sdp = use_maxaveragebitrate(sdp);
        return sdp;
    };
    
    ```
* **[connection.mediaConstraints](http://www.rtcmulticonnection.org/docs/mediaConstraints/)** and **[connection.media](http://www.rtcmulticonnection.org/docs/media/)** are updated:
    
    ```javascript
    connection.mediaConstraints = {
        mandatory: {
            maxWidth: 1920,
            maxHeight: 1080,
            minAspectRatio: 1.77,
    
            minFrameRate: 3,
            maxFrameRate: 64
        },
        optional: [
            bandwidth: 256
        ]
    };
    
    ```
* **[connection.onstream](http://www.rtcmulticonnection.org/docs/onstream/)** is updated for **event.isScreen**:
    
    ```javascript
    connection.onstream = function (event) {
        if(event.isScreen) {
            // it is screen stream
        }
        
        if(event.isAudio) {
            // it is audio-only stream
        }
        
        if(event.isVideo) {
            // it is audio+video stream
        }
    };
    
    ```
* **[connection.refresh](http://www.rtcmulticonnection.org/docs/refresh/)** is updated and session re-initiation is improved.
    
    ```javascript
    // you simply need to invoke "connection.leave" to 
    // leave a session so that you can rejoin same session
    connection.onstatechange = function (state) {
        if(state == 'connected-with-initiator') {
            document.getElementById('leave-session').disabled = false;
        }
    };
    
    document.getElementById('leave-session').onclick = function() {
        connection.leave();
    };
    
    ```
* **connection.iceProtocols** added.
    
    ```javascript
    connection.iceProtocols = {
        tcp: true, // prefer using TCP-candidates
        udp: true  // prefer using UDP-candidates
    };
    
    ```
* Use custom chrome extension for screen capturing:
    
    ```javascript
    connection.DetectRTC.screen.extensionid = 'your-app-store-extensionid';
    
    ```
* STUN/TURN servers are updated; as well as ICE-servers from XirSys are used:
    
    ```javascript
    // to disable XirSys ICE-Servers
    connection.getExternalIceServers = false;
    
    ```
* **connection.preventSSLAutoAllowed** is disabled.
    
    ```javascript
    // to enable it
    connection.preventSSLAutoAllowed = true;
    
    ```

<a name="v1.8"></a>
### 1.8 (2014-06-28)

```
<script src="//cdn.webrtc-experiment.com/RTCMultiConnection-v1.8.js"></script>
```

#### Bug Fixes
* Fixed: If Chrome starts video-only session; and Firefox joins with only audio. Then both fails to connect; though sendrecv/recvonly/sendonly everything is correctly implemented.
* Fixed: "the videos are not square and they look grainy not has sharp as before". Now video is captured & streamed with better quality.
* [startRecording](http://www.rtcmulticonnection.org/docs/startRecording/)/[stopRecording](http://www.rtcmulticonnection.org/docs/stopRecording/) updated & fixed.
    
    ```javascript
    // record both audio and video
    connection.streams['stream-id'].startRecording({
        audio: true,
        video: true
    });
    
    // stop both audio and video
    connection.streams['stream-id'].stopRecording(function (blob) {
        // blob.audio  --- audio blob
        // blob.video  --- video blob
    }, {audio:true, video:true} );
    
    ```
* Fixed **connection.streams.stop()** via [issue #255](https://github.com/muaz-khan/WebRTC-Experiment/issues/225#issuecomment-46283072).
#### Features
* (to fix canary ipv6 candidates issues): disabled "googIPv6", "googDscp" and "googImprovedWifiBwe"
* "**connection.leaveOnPageUnload**" added.

    ```javascript
    // if you want to prevent/override/bypass default behaviour
    connection.leaveOnPageUnload = false;
    
    // display a notification box
    window.addEventListener('beforeunload', function () {
        return 'Are you want to leave?';
    }, false);
    
    // leave here
    window.addEventListener('unload', function () {
        connection.leave();
    }, false);
    
    ```

    * renegotiation scenarios that fails:
        * if chrome starts video-only session and firefox joins with only audio
        * if chrome starts with audio-only session and firefox joins with only video
        * if chrome starts only audio and firefox joins with audio+video
    * renegotiation scenarios that works:
        * if chrome starts audio+video and firefox joins with only audio or audio+video
        * if both browsers has similar streams

* "connection.[onstatechange](http://www.rtcmulticonnection.org/docs/onstatechange/)" added:
    
    ```javascript
    connection.onstatechange = function (state, reason) {
        // fetching-usermedia
        // usermedia-fetched
    
        // detecting-room-presence
        // room-not-available
        // room-available
    
        // connecting-with-initiator
        // connected-with-initiator
    
        // failed---has reason
    
        // request-accepted
        // request-rejected
    
        if(state == 'room-not-available') {
            // room no longer exist
        }
    };
    
    ```
Remember, older "[onstats](http://www.rtcmulticonnection.org/docs/onstats/)" event has been removed in v1.8.
* Now if you'll invoke "**[connection.sharePartOfScreen(...)](http://www.rtcmulticonnection.org/docs/sharePartOfScreen/)*" and a new user will join you; existing part of screen will be auto shared with him.

    It means that "**[sharePartOfScreen](http://www.rtcmulticonnection.org/docs/sharePartOfScreen/)**" will work with all new/old users.
* "**connection.donotJoin**" added:
    
    ```javascript
    connection.onstatechange = function (state) {
        if(state == 'room-not-available') {
            connection.donotJoin(connection.sessionid);
        }
    };
    
    ```
* You can set **connection.DetectRTC.screen.extensionid="your-chrome-extensionid**" to make sure inline (newly) installed chrome extension is quickly used for screen capturing instead of prompting user to reload page once to use it.

    It means that install the chrome extension and RTCMultiConnection will auto use it. Don't ask your users to reload the page:
    
    ```javascript
    connection.DetectRTC.screen.extensionid = 'ajhifddimkapgcifgcodmmfdlknahffk';
    
    ```
* "**connection.[DetectRTC](http://www.rtcmulticonnection.org/docs/DetectRTC/).hasSpeakers**" added.
* "connection.[resumePartOfScreenSharing()](http://www.rtcmulticonnection.org/docs/resumePartOfScreenSharing/)" added.
* "**event.blobURL**" in the [onstream](http://www.rtcmulticonnection.org/docs/onstream/) event is fixed for Firefox.
    
    ```javascript
    connection.onstream = function(e) {
        // e.blobURL -- now it is always blob:URI
    };
    
    ```
* "PreRecordedMediaStreamer" is moved to a separate javascript file.
>https:<span style="color:red">//www.rtcmulticonnection.org/PreRecordedMediaStreamer.js</span>
* function "**stopTracks**" updated.
* Now, you can easily manage external resources/URLs using "**connection.resources**":
    
    ```javascript
    connection.resources = {
        RecordRTC: 'https://www.webrtc-experiment.com/RecordRTC.js',
        PreRecordedMediaStreamer: 'https://www.rtcmulticonnection.org/PreRecordedMediaStreamer.js',
        customGetUserMediaBar: 'https://www.webrtc-experiment.com/navigator.customGetUserMediaBar.js',
        html2canvas: 'https://www.webrtc-experiment.com/screenshot.js',
        hark: 'https://www.rtcmulticonnection.org/hark.js',
        firebase: 'https://www.rtcmulticonnection.org/firebase.js',
        firebaseio: 'https://chat.firebaseIO.com/',
        muted: 'https://www.webrtc-experiment.com/images/muted.png'
    };
    
    ```
* **[connection.DetectRTC.MediaDevices](http://www.rtcmulticonnection.org/docs/DetectRTC/)** added:
    
    ```javascript
    // to iterate over all available media devices
    connection.getDevices(function() {
        connection.DetectRTC.MediaDevices.forEach(function(device) {
            // device.deviceId
            // device.kind == 'audioinput' || 'audiooutput' || 'audio'
            
            connection.selectDevices(device.deviceId);
        });
    });
    
    ```
* Now, **hark.js** is used instead of **SoundMeter.js**:
    
    ```javascript
    connection.onspeaking = function() {};
    connection.onsilence = function() {};
    
    ```
* **captureUserMediaOnDemand** added for **connection.open** method:
    
    ```javascript
    // it is "disabled" by default
    // captureUserMediaOnDemand means that "getUserMedia" API for initiator will 
    // be invoked only when required.
    // i.e. when first participant is detected.
    
    // you can enable it by setting it to "true"
    connection.open({
        captureUserMediaOnDemand: true
    });
    
    ```
* **connection.DetectRTC.screen.getChromeExtensionStatus** added.
    
    ```javascript
    var extensionid = 'ajhifddimkapgcifgcodmmfdlknahffk';
    
    connection.DetectRTC.screen.getChromeExtensionStatus(extensionid, function(status) {
        if(status == 'installed-enabled') {
            // chrome extension is installed & enabled.
        }
        
        if(status == 'installed-disabled') {
            // chrome extension is installed but disabled.
        }
        
        if(status == 'not-installed') {
            // chrome extension is not installed
        }
        
        if(status == 'not-chrome') {
            // using non-chrome browser
        }
    });
    
    ```
* **onMediaCaptured** added for **connection.open** method:
    
    ```javascript
    connection.open({
        onMediaCaptured: function() {
            // initiator enable camera/microphone
            // you can share "sessionDescription" with other users
            // and they can quickly join initiator!
        }
    });
    
    ```
* **openSignalingChannel** is moved to "**setDefaults**" private function.
* **connection.preventSSLAutoAllowed added**. Now RTCMultiConnection focuses more on end-users privacy! You can ask RTCMultiConnection to "always" display "getUserMedia-permission-bar" even if chrome is running on HTTPs i.e. SSL domain:
    
    ```javascript
    // by default "preventSSLAutoAllowed" is true only for "HTTPs" domains
    // you can force it for HTTP domains as well by setting this Boolean in your HTML page.
    connection.preventSSLAutoAllowed = true;
    
    ```
* **onScreenCapturingExtensionAvailable** is fired when RTCMultiConnection detects that chrome extension for screen capturing is installed and available:
    
    ```javascript
    connection.onScreenCapturingExtensionAvailable = function() {
        btnInlineInstallButton.disabled = true;
    };
    
    ```
* Now, **[connection.join](http://www.rtcmulticonnection.org/docs/join/)** method allows you force how to join (i.e. with or without streams etc.):
    
    ```javascript
    // it doesn't matter if incoming stream is audio+video
    // you can join it with only audio or with only video
    // or anonymously i.e. { oneway: true }
    var joinWith = {
        audio: true
    };
    
    connection.join('sessionid', joinWith); // 2nd parameter
    
    ```
* Now, [onNewSession](http://www.rtcmulticonnection.org/docs/onNewSession/) is fired once for each room. It will NEVER fire multiple times.
* **[chrome.desktopCapture.chooseDesktopMedia](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/desktop-sharing)** is now preferred for screen capturing; and if extension is not installed or disabled, then RTCMultiConnection will auto fallback to [command-line flag oriented screen-capturing API](https://www.webrtc-experiment.com/Pluginfree-Screen-Sharing/); and if both are not available then it will throw a clear "human readable" exception.

    Chrome extension is available [here](https://www.webrtc-experiment.com/store/capture-screen/).
* You can use **connection.DetectRTC** like this:
    
    ```javascript
    connection.DetectRTC.load(function() {
        if(connection.DetectRTC.hasMicrophone) { }
        if(connection.DetectRTC.hasWebcam) { }
    });
    
    connection.DetectRTC.screen.isChromeExtensionAvailable(function(available) {
        if(available) alert('Chrome screen capturing extension is installed and available.');
    }):
    
    ```
* **navigator.getUserMedia** errors handling in **onMediaError** event:
    
    ```javascript
    connection.onMediaError = function(error) {
        if(error.name == 'PermissionDeniedError') {
            alert(error.message);
        }
    };
    
    ```

<a name="v1.7"></a>
### 1.7 (2014-05-14)

```
v1.7 focused on reliable API invocation, reliable concurrent users connectivity, and more. A few other features were added in this build like part of screen streaming, pre-recorded media streaming, ice-trickling booleans, and obviously DetectRTC!
<script src="//cdn.webrtc-experiment.com/RTCMultiConnection-v1.7.js"></script>
```

#### Bug Fixes
* Session re-initiation has been fixed. You can leave/rejoin many times.
* Mute/UnMute and "onstreamended" among multiple users, issues fixed.
#### Features
* **connection.trickleIce** added. Useful if you're using XHR/SIP/XMPP for signaling. [XHR Demo](https://github.com/muaz-khan/XHR-Signaling)
    
    ```javascript
    // to ask RTCMultiConnection to wait until all ICE candidates
    // are gathered; and all ice are merged in the SDP
    // you JUST need to share that SDP "only"!
    connection.trickleIce = false;
    
    ```
* You can use "**connection.DetectRTC**" to [detect](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/DetectRTC) WebRTC features!
    
    ```javascript
    if(connection.DetectRTC.isWebRTCSupported) {}
    if(connection.DetectRTC.hasMicrophone) {}
    if(connection.DetectRTC.hasWebcam) {}
    
    ```
* Following scenarios implemented:
    * if system doesn't have any microphone attached; RTCMultiConnection will skip "**{audio:true}**" and prompt only "**{video: true}**"
    * if system doesn't have any webcam attached; RTCMultiConnection will skip "**{video:true}**" and prompt only "**{audio: true}**"
* Previously "connection.renegotiatedSessions" was an array; now it is object.
    
    ```javascript
    // sometimes you try to manually fetch media streams
    // sometimes you allow a user to enable webcam ... but don't renegotiate quickly..
    // you may want to ask other user to invoke "renegotiate" function
    // you may want to override default behaviours
    
    // below code snippet is used in MultiRTC demo in "ui-peer-connection.js" file
    
    var session = {
        audio: true // you're manually capturing audio
    };
    
    connection.captureUserMedia(function (stream) {
        // you can see that "renegotiatedSessions" is an object
        // because we wanted to prevent duplicate entries
        connection.renegotiatedSessions[ JSON.stringify(session) ] = {
            session: session,
            stream: stream
        }
    
        connection.peers[message.userid].peer.connection.addStream(stream);
    }, session);
    
    ```
* Now, using default camera resolutions instead of using minWidth/minHeight and maxWidth/maxHeight. You can [easily override](http://www.rtcmulticonnection.org/docs/mediaConstraints/) those values:
    
    ```javascript
    connection.mediaConstraints.mandatory = {
        minWidth: 1280,
        maxWidth: 1280,
        minHeight: 720,
        maxHeight: 720,
        minAspectRatio: 1.77
    };
    
    ```
* Now, auto redials while you're renegotiating and any single browser is firefox!
* Previously-renegotiated streams and new users renegotiation has been improved.
* Now, auto injecting **VoiceActivityDetection:true** for chrome to make sure **c=IN** is always present; otherwise **b=AS** will fail.
* **connection.dontOverrideSession** added:
    
    ```javascript
    // dont-override-session allows you force RTCMultiConnection
    // to not override default session of participants;
    // by default, session is always overridden and set to the session coming from initiator!
    connection.dontOverrideSession = true;
    
    ```
* connection.askToShareParticipants and connection.shareParticipants added. Useful in [multi-broadcasters and many viewers scenarios](https://www.webrtc-experiment.com/RTCMultiConnection/Multi-Broadcasters-and-Many-Viewers.html)!
    
    ```javascript
    connection.onstream = function (e) {
        if (e.type == 'remote' && role == 'Anonymous Viewer') {
            // because "viewer" joined room as "oneway:true"
            // initiator will NEVER share participants
            // to manually ask for participants;
            // call "askToShareParticipants" method.
            connection.askToShareParticipants();
        }
    
        // if you're moderator
        // if stream-type is 'remote'
        // if target user is broadcaster!
        if (connection.isInitiator && e.type == 'remote' && !e.session.oneway) {
            // call "shareParticipants" to manually share participants with all connected users!
            connection.shareParticipants({
                dontShareWith: e.userid
            });
        }
    };
    
    ```
* **connection.join('sessionid')** has been improved.
* Now you can pass "sessionid" over "join" method!
    
    ```javascript
    // make sure that room is created!
    // otherwise this "join" method will fail to join the room!
    // "join" method NEVER waits for onNewSession!!
    // it directly "joins" the room!
    connection.join('sessionid');
    
    ```
* [Admin/Guest features](http://www.rtcmulticonnection.org/docs/admin-guest/) has been removed. You should use v1.6 or earlier to use admin/guest features.
* **screen:300kbps** added in **connection.[bandwidth](http://www.rtcmulticonnection.org/docs/bandwidth/)**:
    
    ```javascript
    // by default
    connection.bandwidth = {
        screen: 300
    };
    
    // if you're using node-webkit; then you MUST set it to NULL
    // make sure that it is set both for browser-client and node-webkit!
    connection.bandwidth.screen = null;
    
    ```
* Now, you can check **connection.[stats](http://www.rtcmulticonnection.org/docs/stats/).numberOfSessions** in a specific channel:
    
    ```javascript
    alert( connection.stats.numberOfSessions );
    
    // You can even access all sessions using this object-like array:
    alert( connection.stats.sessions['sessionid'] );
    
    // or
    for(var session in connection.stats.sessions) {
        console.log(connection.stats.sessions[session]);
    }
    
    // You can get above values usnig "getStats" method as well:
    connection.getStats(function(stat) {
        console.log(stat.numberOfSessions);
        
        for(var session in stat.sessions) {
           console.log(stat.sessions[session]);
        }
    });
    
    ```
* Now, multiple users can join a room at the same time and all will be interconnected!
* Now, "streamid" is synced among all users! You can mute/unmute or stop single stream-id and it will affect among all connected users!
* **autoReDialOnFailure** added. You can force RTCMultiConnection to auto redial if peer connection is dropped unexpectedly or failed out of any exception!
    
    ```javascript
    // by default, it is "false"
    // it is false because workaround that is used to capture connections' failures
    // affects renegotiation scenarios!
    connection.autoReDialOnFailure = true;
    
    ```
* You can override [setDefaultEventsForMediaElement](http://www.rtcmulticonnection.org/docs/setDefaultEventsForMediaElement/) to prevent default mute/unmute handlers on media elements.
    
    ```javascript
    // by default it captures "onplay", "onpause" and "onvolumechange" events for all media elements
    connection.setDefaultEventsForMediaElement = false;
    
    ```
* **onpartofscreenstopped** and **onpartofscreenpaused** added:
    
    ```javascript
    // invoked when you "manually" stopped part-of-screen sharing!
    connection.onpartofscreenstopped = function() {};
    
    // invoked when you "manually" paused part-of-screen sharing!
    connection.onpartofscreenpaused = function() {};
    
    ```
* Now, you can call **sharePartOfScreen**, **pausePartOfScreenSharing** and **stopPartOfScreenSharing** for all users:
    
    ```javascript
    connection.sharePartOfScreen({
        element: '#div-id', // querySelector or HTMLElement
        interval: 1000      // milliseconds
    });
    
    connection.pausePartOfScreenSharing();
    connection.stopPartOfScreenSharing();
    
    ```
* **hold/unhold** of individual media lines implemented:
    
    ```javascript
    // hold only your audio
    connection.peers['target-userid'].hold('audio');
    connection.onhold = function(track) {
        if(track.kind == 'audio') {}
    };
    
    // hold only your video
    connection.peers['target-userid'].hold('video');
    connection.onunhold = function(track) {
        if(track.kind == 'video') {}
    };
    
    // unhold all your 'video' m-lines
    connection.unhold('video');
    
    // hold all your 'audio' m-lines
    connection.hold('audio');
    
    ```
* When you mute/unmute; video-controls are synced among all users! Volume is also synced!
* **window.skipRTCMultiConnectionLogs** is replaced with **connection.skipLogs** method:
    
    ```javascript
    connection.skipLogs();
    
    ```
* Part of screen sharing has been implemented:
    
    ```javascript
    // to share a DIV or region of screen with a specific user
    connection.peers['target-userid'].sharePartOfScreen({
        element: 'body', // querySelector or HTMLElement
        interval: 1000   // milliseconds
    });
    
    // to capture shared parts of screen
    // var image = document.querySelector('img');
    connection.onpartofscreen = function (e) {
        // image.src = e.screenshot;
    };
    
    // to pause part-of-screen sharing
    connection.peers['target-userid'].pausePartOfScreenSharing = true;
    
    // to stop part-of-screen sharing
    connection.peers['target-userid'].stopPartOfScreenSharing = true; 
    
    ```
* Now, [open](http://www.rtcmulticonnection.org/docs/open/) method returns "sessionDescription" object. "open" method also accepts an object as well!
    * [join](http://www.rtcmulticonnection.org/docs/join/) method can be used to join that "sessionDescription" anytime without connecting to signaling channel!
    * <span style="color:blue">For initiator</span>:
        
        ```javascript
        var initiator = new RTCMultiConnection();
        
        // you can pass object instead of string!
        var sessionDescription = initiator.open({
            dontTransmit: true
        });
        
        websocket.send(sessionDescription);
        
        ```
    * <span style="color:blue">For participant</span>:
        
        ```javascript
        var participant = new RTCMultiConnection();

        websocket.onmessage = function(event) {
            var sessionDescription = event.data.sessionDescription;
            participant.join( sessionDescription );
        };
        
        ```
* Now, [removeStream](http://www.rtcmulticonnection.org/docs/removeStream/) method quickly removes streams and auto renegotiates. You can also call [removeStream](http://www.rtcmulticonnection.org/docs/removeStream/) over [peers](http://www.rtcmulticonnection.org/docs/peers/) object:
    
    ```javascript
    connection.peers['target-userid'].removeStream( 'stream-id' );
    
    ```
* Now, [onRequest](http://www.rtcmulticonnection.org/docs/onRequest/) is fired only for [session-initiator](http://www.rtcmulticonnection.org/docs/session-initiator/).
* "[shareMediaFile](http://www.rtcmulticonnection.org/docs/shareMediaFile/)" and "[onMediaFile](http://www.rtcmulticonnection.org/docs/onMediaFile/)" added. (i.e. pre-recorded media support added):
    
    ```javascript
    // select WebM file to share as pre-recorded media!
    document.querySelector('input[type=file]').onchange = function() {
        connection.shareMediaFile( this.files[0] );
    };
    
    // receive WebM files
    connection.onMediaFile = function(e) {
        // e.mediaElement (it is video-element)
        // e.userid
        // e.extra
        
        yourExistingVideoElement.src = e.mediaElement.src;
        
        // or
        document.body.appendChild(e.mediaElement);
    };
    
    ```
* Now, "[getDevices](http://www.rtcmulticonnection.org/docs/getDevices/)" method skips duplicate devices and returns array of unique audio/video devices.
* Now, "[onFileStart](http://www.rtcmulticonnection.org/docs/onFileStart/)", "[onFileProgress](http://www.rtcmulticonnection.org/docs/onFileProgress/)" and "[onFileEnd](http://www.rtcmulticonnection.org/docs/onFileEnd/)" has remote user's ID, "sending" object and "[extra](http://www.rtcmulticonnection.org/docs/extra/)" object:
    
    ```javascript
    // file sending or receiving instance is started.
    connection.onFileStart = function(file) {
        // file.userid  ---- userid of the file sender
        // file.extra   ---- extra data from file sender
    	
        // file.sending ---- true or false
    };
    
    // file sending or receiving instance is ended.
    connection.onFileEnd = function(file) {
        // file.userid  ---- userid of the file sender
        // file.extra    ---- extra data from file sender
    	
        // file.sending ---- true or false
    };
    
    // file sending or receiving instance is working.
    connection.onFileProgress = function(chunk) {
        // chunk.userid  ---- userid of the file sender
        // chunk.extra    ---- extra data from file sender
    	
        // chunk.sending ---- true or false
    };
    
    ```
* "[onstream](http://www.rtcmulticonnection.org/docs/onstream/)" has two new objects:
    
    ```javascript
    connection.onstream = function(e) {
        // e.isVideo ---- if it is a  Video stream
        // e.isAudio ---- if it is an Audio stream
    };
    
    ```
* File [chunk-size](http://www.rtcmulticonnection.org/docs/chunkSize/) and [chunk-interval](http://www.rtcmulticonnection.org/docs/chunkInterval/) are fixed for Firefox.
* Now, when renegotiating media streams, v1.7 checks to verify if remote stream is delivered to end-user; if delivery fails, v1.7 auto tries renegotiation again.
* Now, "isAcceptNewSession" is shifted to root-level. Using this feature, you can allow single user to join multiple rooms from the same [channel](http://www.rtcmulticonnection.org/docs/channel-id/):
    
    ```javascript
    connection.onstream = function(event) {
        if(event.type == 'remote') {
            // set "isAcceptNewSession=true" so this user can get and join new session i.e. room
            // it means that "onNewSession" will be fired for this user as soon as other room is available!
            connection.isAcceptNewSession = true;
        }
    };
    
    ```
* Now, "[session](http://www.rtcmulticonnection.org/docs/session/)" object is always passed over "[onstreamended](http://www.rtcmulticonnection.org/docs/onstreamended/)" event; so, you can check which stream is stopped: screen or audio/video:
    
    ```javascript
    connection.onstreamended = function(event) {
        if(event.session.screen) { }                        // if screen stream is stopped.
        if(event.session.audio && !event.session.video) { } // if audio stream is stopped.
        if(event.session.audio && event.session.video) { }  // if audio+video stream is stopped.
        
        // event.type == 'local' || 'remote'
    };
    
    ```
* v1.6 and earlier releases has a bug for renegotiated streams. When you try to stop renegotiated stream; it is removed only from 1st participant; not from all participants. This issue has been fixed in v1.7.
* "**forceToStopRemoteStream**" added.
    
    ```javascript
    var forceToStopRemoteStream = true;
    connection.streams['remote-stream-id'].stop( forceToStopRemoteStream );
    
    ```
This feature was disabled since v1.4 however now enabled by passing a single boolean over "**stop**" method.
* Default session is always kept there; it was a bug in v1.6 and earlier releases. Each new renegotiated session was overriding old sessions.
* Renegotiated sessions are always stored; and always renegotiated to newcomers.
* Renegotiation of external streams along with external session added.
* Remote stream stop & removal issues fixed. Now, "**onstreamended**" is always fired for all users according to the stream stopped.
* "**[setDefaultEventsForMediaElement](http://www.rtcmulticonnection.org/docs/setDefaultEventsForMediaElement/)**" added. i.e. mute/unmute are implemented by default! When you'll click mute button from native video control; v1.7 will auto invoke "mute" among all relevant peers.


<a name="v1.6"></a>
### 1.6 (2014-01-29)

```
<script src="//cdn.webrtc-experiment.com/RTCMultiConnection-v1.6.js"></script>
```

#### Bug Fixes
* [Bug #152](https://github.com/muaz-khan/WebRTC-Experiment/issues/152) fixed.
#### Features
* Now v1.6 is capable to auto-redial if connection is dropped by any mean. (This feature is disabled because it was affecting renegotiation process).
* Now you can join as audio-only, video-only or screen-only stream both on chrome and firefox:
    
    ```javascript
    // original session is "audio-only" stream
    connection.session = { audio: true };
    connection.onNewSession = function(session) {
        // join with both audio and video!
        session.join({audio: true, video: true});
    };
    
    ```
    
    ```javascript
    // original session is "audio+video" stream
    connection.session = { audio: true, video: true };
    connection.onNewSession = function(session) {
        // join with audio-only stream!
        session.join({audio: true});
    };
    
    ```
* "[fakeDataChannels](http://www.rtcmulticonnection.org/docs/fakeDataChannels/)" added. Using "[fakeDataChannels](http://www.rtcmulticonnection.org/docs/fakeDataChannels/)" object you can setup fake data connection while you're sharing audio/video/screen. You can do text-chat; share files; etc. without using WebRTC data channels.
    
    ```javascript
    // audio+video and fake data connection
    connection.fakeDataChannels = true;
    connection.session = { audio: true, video: true };
    
    // only fake data connection; no audio; no video; no WebRTC data channel!
    connection.fakeDataChannels = true;
    connection.session = { };
    
    ```
* "[UA](http://www.rtcmulticonnection.org/docs/UA/)" object added. It returns whether browser is chrome; firefox or mobile device:
    
    ```javascript
    var isFirefox = connection.UA.Firefox;
    var isChrome = connection.UA.Chrome;
    var isMobileDevice = connection.UA.Mobile;
    
    ```
* Now you can [renegotiate](http://www.rtcmulticonnection.org/docs/renegotiation/) data-connection in your existing audio/video/screen session!
    
    ```javascript
    connection.addStream({
        data: true
    });
    
    ```
* [Pull #152](https://github.com/muaz-khan/WebRTC-Experiment/issues/152) merged for "[token](http://www.rtcmulticonnection.org/docs/token/)" method:
    
    ```javascript
    var randomString = connection.token();
    connection.userid = connection.token();
    
    ```
* "[autoTranslateText](http://www.rtcmulticonnection.org/docs/autoTranslateText/)" method added:
    
    ```javascript
    // all incoming text messages will be converted in this language
    // by default, it is "en-US"
    connection.language = 'ja'; // prefer Japanese
    
    // it is "false" by default.
    connection.autoTranslateText = true;
    
    // you can use "e.data" and "e.original"
    connection.onmessage = function(e) {
       // e.data     ---- translated text
       // e.original ---- original text
    };
    
    connection.Translator.TranslateText(textToConvert, function(convertedText) {
         console.log(convertedText);
    });
    
    ```
* "session.join" method added. Remember, it is "<span style="color:red">session</span>.join"; it isn't "<span style="color:red">connection</span>.join"!
    
    ```javascript
    connection.onNewSession = function(session) {
        session.join();                           // join session as it is!
        session.join({audio: true});              // join session while allowing only audio
        session.join({video: true});              // join session while allowing only video
        session.join({screen: true});             // join session while allowing only screen
        session.join({audio: true, video: true}); // join session while allowing both audio and video
    };
    
    ```
* Now, [MRecordRTC](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/MRecordRTC) is used for [audio/video recording](http://www.rtcmulticonnection.org/docs/startRecording/)!
* "[saveToDisk](http://www.rtcmulticonnection.org/docs/saveToDisk/)" method added. You can invoke save-as dialog like this:
    
    ```javascript
    // "fileName" is optional
    connection.saveToDisk(fileURL, fileName);
    
    // you can save recorded blob to disk like this:
    connection.streams['stream-id'].stopRecording(function (audioBlob, videoBlob) {
        connection.saveToDisk(audioBlob);
        connection.saveToDisk(videoBlob);
    }, {audio:true, video:true} );
    
    ```
* If you're recording both audio and video; then "[stopRecording](http://www.rtcmulticonnection.org/docs/stopRecording/)" will return both blobs in the single callback; where 1st parameter value will be audio-blob; and 2nd parameter value will be video-blob:
    
    ```javascript
    // stop both audio/video streams
    connection.streams['stream-id'].stopRecording(function (audioBlob, videoBlob) {
        // POST both audio/video "Blobs" to PHP/other server using single FormData/XHR2
    }, {audio:true, video:true} );
    
    ```
* "[onhold](http://www.rtcmulticonnection.org/docs/onhold/)" and "[onunhold](http://www.rtcmulticonnection.org/docs/onunhold/)" events added:
    
    ```javascript
    // to hold call; same like skype!
    connection.peers['user-id'].hold();
    connection.onhold = function(e) {
    	// e.mediaElement || e.stream || e.userid || e.streamid
    };
    
    // to unhold call; same like skype!
    connection.peers['user-id'].unhold();
    connection.onunhold = function(e) {
    	// e.mediaElement || e.stream || e.userid || e.streamid
    };
    
    ```
* Many method has been added in "[peers](http://www.rtcmulticonnection.org/docs/peers/)" object.
    
    ```javascript
    // renegotiate while adding external media streams
    connection.peers['user-id'].renegotiate(Custom_MediaStream);
    
    // renegotiate while no media stream is added
    connection.peers['user-id'].renegotiate();
    
    // change bandwidth at runtime
    connection.peers['user-id'].changeBandwidth({
        audio: 20,
        video: 30,
        data: 50
    });
    
    // send private message to target user; privacy is guaranteed!
    connection.peers['user-id'].sendCustomMessage('private-message');
    connection.peers['user-id'].onCustomMessage = function(privateMessage) {
        console.log('private custom message', privateMessage);
    };
    
    // to drop call; same like skype!
    connection.peers['user-id'].drop();
    
    // to hold call; same like skype!
    connection.peers['user-id'].hold();
    
    // to unhold call; same like skype!
    connection.peers['user-id'].unhold();
    
    ```
    * "changeBandwidth" method is useful to modify bandwidth usage at runtime!
    * "drop" method is useful to drop call between two users same like skype!
    * "sendCustomMessage" and "onCustomMessage" are useful to exchange private data between two users where your preferred signaling solution is used to send data i.e. it works all the time! Remember, there is a public version of "[sendCustomMessage](http://www.rtcmulticonnection.org/docs/sendCustomMessage/)" as well!
    * "hold" and "unhold" works same like skype!
* "[renegotiate](http://www.rtcmulticonnection.org/docs/renegotiate/)" method added.
    
    ```javascript
    // renegotiate with/without media streams!
    connection.renegotiate(Custom_MediaStream);
    
    ```
    "[renegotiate](http://www.rtcmulticonnection.org/docs/renegotiate/)" method works same like "[addStream](http://www.rtcmulticonnection.org/docs/addStream/)" however it gives you a little bit more control over renegotiation process!
    
    If connection is suddently dropped; or connection has not been established for 5 seconds; then you can use "[renegotiate](http://www.rtcmulticonnection.org/docs/renegotiate/)" method to retry/redial.
    
    In multi-user connectivity scenarios; it is suggested to try "[peers](http://www.rtcmulticonnection.org/docs/peers/)" object to renegotiate/retry/redial connections. See next section for more details.
* "[refresh](http://www.rtcmulticonnection.org/docs/refresh/)" method added.
    
    ```javascript
    connection.refresh();
    
    ```
Using "[refresh](http://www.rtcmulticonnection.org/docs/refresh/)" method; you can refresh/reload the RTCMultiConnection object!
* "[remove](http://www.rtcmulticonnection.org/docs/remove/)" method added.
    
    ```javascript
    connection.remove('user-id');
    
    ```
Using "[remove](http://www.rtcmulticonnection.org/docs/remove/)" method; you can clear all sockets, peers and streams coming from that user; so that he can reconnect to the same [session](http://www.rtcmulticonnection.org/docs/sessionid/)!
* File sharing is improved! Chrome/Firefox interoperability support added.
* "[preferSCTP](http://www.rtcmulticonnection.org/docs/preferSCTP/)" is now enabled by default.
* "[chunkSize](http://www.rtcmulticonnection.org/docs/chunkSize/)" added. You can set 64k chunk-size for chrome-to-chrome SCTP-data streaming!
    
    ```javascript
    // for chrome-to-chrome data streaming only!
    connection.chunkSize = 64 * 1000;
    
    // default value is 15k because Firefox's receiving limit is 16k!
    connection.chunkSize = 15 * 1000;
    
    ```
* All possible "complex" [renegotiation](http://www.rtcmulticonnection.org/docs/renegotiation/) scenarios are supported!
    * You can select any participant to broadcast his screen or media stream in oneway direction over all connected users!
    * There can be 5 broadcasters; and many viewers/listeners!
    * Each and every skype-like feature is possible using v1.6! You can add/remove streams many times using existing peer connections!
    

<a name="v1.5"></a>
### 1.5 (2013-12-31)

```
<script src="//cdn.webrtc-experiment.com/RTCMultiConnection-v1.5.js"></script>
```

#### Bug Fixes
* [mute](http://www.rtcmulticonnection.org/docs/mute/)/[unmute](http://www.rtcmulticonnection.org/docs/unmute/) and "[stop](http://www.rtcmulticonnection.org/docs/stop/)" fixed both for chrome and firefox.
* Echo issue; i.e. self-sound playback fixed.
#### Features
* You can get list of devices using "[getDevices](http://www.rtcmulticonnection.org/docs/getDevices/)" method and prefer any single or two audio/video devices using "[selectDevices](http://www.rtcmulticonnection.org/docs/selectDevices/)" method.
    
    ```javascript
        // get list of devices
        connection.getDevices(function(devices){
            for (var device in devices) {
                device = devices[device];
                
                // device.kind == 'audio' || 'video'
                console.log(device.id, device.label);
            }
        });
        
        // select any audio and/or video device
        connection.selectDevices(firstDeviceID, secondDeviceID);
    
    ```
* "[onspeaking](http://www.rtcmulticonnection.org/docs/onspeaking/)" and "[onsilence](http://www.rtcmulticonnection.org/docs/onsilence/)" added.
    
    ```javascript
    connection.onspeaking = function (e) {
        // e.streamid, e.userid, e.stream, etc.
        e.mediaElement.style.border = '1px solid red';
    };
    
    connection.onsilence = function (e) {
        // e.streamid, e.userid, e.stream, etc.
        e.mediaElement.style.border = '';
    };
    
    ```
* "[connection.streams.stop](http://www.rtcmulticonnection.org/docs/stop/)" added to stop all local/remote streams.
    
    ```javascript
    // stop all local media streams
    connection.streams.stop('local');
    
    // stop all remote media streams
    connection.streams.stop('remote');
    
    // stop all media streams
    connection.streams.stop();
    
    ```
* [onmute](http://www.rtcmulticonnection.org/docs/onmute/)/[onunmute](http://www.rtcmulticonnection.org/docs/onunmute/) auto displays "poster" if not overridden! (both on chrome and firefox)
    
    ```javascript
    connection.onmute = function(e) {
        e.mediaElement.setAttribute('poster', 
                                    'www.webrtc-experiment.com/images/muted.png');
    };
    
    connection.onunmute = function (e) {
        e.mediaElement.removeAttribute('poster');
    };
    
    ```
* If screen-sharing is stopped using blue button, "<span style="color:red">onstreamended</span>" will be auto fired for both users!
* "[onstream](http://www.rtcmulticonnection.org/docs/onstream/)" auto appends video to "[document.body](http://www.rtcmulticonnection.org/docs/body/)" element; if not overridden!
* Default file progress-bar implemented.
* You can manage videos and "progress-bar" container element by setting "[connection.body](http://www.rtcmulticonnection.org/docs/body/)".
    
    ```javascript
    <div class="container"></div>
    connection.body = document.querySelector('.container');
    
    ```
* Throws a clear error if users try to interop RTP-datachannels with [SCTP](http://www.rtcmulticonnection.org/docs/preferSCTP/).
* [onmute](http://www.rtcmulticonnection.org/docs/onunmute/)/[onunmute](http://www.rtcmulticonnection.org/docs/onunmute/) are fixed for both local and remote media streams. Both streams will be [auto-synced](https://github.com/muaz-khan/WebRTC-Experiment/issues/135#issuecomment-31289682)!
* Now, only [session-initiator](http://www.rtcmulticonnection.org/docs/session-initiator/) can [eject](http://www.rtcmulticonnection.org/docs/eject/) a user.
* [takeSnapshot](http://www.rtcmulticonnection.org/docs/takeSnapshot/)/[snapshots](http://www.rtcmulticonnection.org/docs/snapshots/) added:
    
    ```javascript
    // iterate over all snapshots/
    for(var snapshot in connection.snapshots) {
        snapshot = connection.snapshots[snapshot];
    }
    
    // or, to access individual snapshot later
    image.src = connection.snapshots['userid'];
    
    // to take a snapshot
    connection.takeSnapshot('userid', function(snapshot) {
        image.src = snapshot;
    });
    
    ```javascript
* [Session initiator](http://www.rtcmulticonnection.org/docs/session-initiator/) can now [stop](http://www.rtcmulticonnection.org/docs/stop/) remote media streams. It works same like [eject](http://www.rtcmulticonnection.org/docs/eject/) method:
    
    ```javascript
    connection.streams['remote-stream-id'].stop();
    
    ```
* [reject](http://www.rtcmulticonnection.org/docs/reject/) method added. Now, you can reject any request in [onRequest](http://www.rtcmulticonnection.org/docs/onRequest/) event.:
    
    ```javascript
    connection.onRequest = function (request) {
        connection.reject(request);
    };
    
    // "onstats" event can be used to know whether request is rejected or accepted
    connection.onstats = function (stats, callee) {
        // callee rejected the request
        if (stats == 'rejected') {}
    
        // callee accepted caller's request
        if (stats == 'accepted') {}
        
        // callee.userid || callee.extra
    };
    
    ```
* [getStats](http://www.rtcmulticonnection.org/docs/getStats/) and [stats](http://www.rtcmulticonnection.org/docs/stats/) added.
    
    ```javascript
    connection.getStats(function(stat) {
        // stat.numberOfConnectedUsers
    });
    
    for(var stat in connection.stats) {
        console.log(stat, connection.stats[stat]);
    }
    
    // you can directly access "numberOfConnectedUsers" later like this:
    console.log(connection.stats.numberOfConnectedUsers);
    
    ```javascript
* [caniuse](http://www.rtcmulticonnection.org/docs/caniuse/) added.

    
    ```javascript
    console.log( connection.caniuse.RTCPeerConnection );
    console.log( connection.caniuse.getUserMedia );
    console.log( connection.caniuse.AudioContext );
    console.log( connection.caniuse.ScreenSharing );
    console.log( connection.caniuse.RtpDataChannels );
    console.log( connection.caniuse.SctpDataChannels );
    
    connection.caniuse.checkIfScreenSharingFlagEnabled(function (isFlagEnabled, warning) {
        if (isFlagEnabled) {
            console.error('Multi-capturing of screen is not allowed. Capturing process is denied. Try chrome >= M31.');
        }
    
        if (warning) console.error(warning);
    
        else if (!isFlagEnabled) {
            console.error('It seems that "Enable screen capture support in getUserMedia" flag is not enabled.');
        }
    });
    
    ```
* "[drop](http://www.rtcmulticonnection.org/docs/drop/)" added. Using [drop](http://www.rtcmulticonnection.org/docs/drop/) method; you can drop the call, same like skype! This method will detach all "local" media streams from both sides.
    
    ```javascript
    connection.drop();
    
    ```
* "[ondrop](http://www.rtcmulticonnection.org/docs/ondrop/)" event added. It is fired if other user drops the call.
    
    ```javascript
    // "ondrop" is fired; if media-connection is droppped by other user
    connection.ondrop = function() { };
    
    ```
* "[sendCustomMessage](http://www.rtcmulticonnection.org/docs/sendCustomMessage/)" added. Using [sendCustomMessage](http://www.rtcmulticonnection.org/docs/sendCustomMessage/) method; you can share public messages over the default socket. E.g.
    * State of the [session-participant](http://www.rtcmulticonnection.org/docs/session-participant/) or [session-initiator](http://www.rtcmulticonnection.org/docs/session-initiator/); whether he is going to leave; or going to share a media stream.
    * Ask a [session-participant](http://www.rtcmulticonnection.org/docs/session-participant/) to broadcast screen or video in one-way [direction](http://www.rtcmulticonnection.org/docs/direction/).
    * Ask [session-participants](http://www.rtcmulticonnection.org/docs/session-participant/) to attach audio stream; even if it is oneway stream coming from [session-initiator](http://www.rtcmulticonnection.org/docs/session-initiator/).
    * There are unlimited scenarios; that can be accomplished using [sendCustomMessage](http://www.rtcmulticonnection.org/docs/sendCustomMessage/) method; just imagine and go ahead and use it!
    
    ```javascript
    connection.sendCustomMessage(any_kind_of_data |or| string_message);
    
    ```
* "[onCustomMessage](http://www.rtcmulticonnection.org/docs/onCustomMessage/)" event added. Custom messages can be received using [onCustomMessage](http://www.rtcmulticonnection.org/docs/onCustomMessage/) event.
    
    ```javascript
    connection.onCustomMessage = function(message) { };    
    
    ```
* "[stopRecording](http://www.rtcmulticonnection.org/docs/stopRecording/)" now returns both audio/video blobs in the single "callback"!
    
    ```javascript
    // stop single audio stream
    connection.streams['stream-id'].stopRecording(function (blob) {
        // POST "Blob" to PHP/other server using FormData/XHR2
    }, {audio:true});
    
    // stop single video stream
    connection.streams['stream-id'].stopRecording(function (blob) {
        // POST "Blob" to PHP/other server using FormData/XHR2
    }, {video:true});
    
    // stop both audio/video streams
    connection.streams['stream-id'].stopRecording(function (audioBlob, videoBlob) {
        // POST both audio/video "Blobs" to PHP/other server using single FormData/XHR2
    }, {audio:true, video:true} );
    
    ```

<a name="v1.4"></a>
### 1.4 (2013-06-06)

```
<script src="//cdn.webrtc-experiment.com/RTCMultiConnection-v1.4.js"></script>
```

#### Features
* Multiple concurrent files transmission / [(a0f9b72)](https://github.com/muaz-khan/WebRTC-Experiment/commit/a0f9b72654b3ba7c5232968d9850e35fb770bbbb#RTCMultiConnection)
* Advance renegotiation
* Admin/Guest features; useful in realtime chatting rooms where direct invitation is mandatory / [(572ac33)](https://github.com/muaz-khan/WebRTC-Experiment/commit/572ac336357b8530d779529e109197ea7b8f6f8e#RTCMultiConnection)
* Multi-streams attachment i.e. audio+video+data+screen / [(075eaa9)](https://github.com/muaz-khan/WebRTC-Experiment/commit/075eaa978399a2309b664164e875187ec7b6444a#RTCMultiConnection)
* Mute/UnMute/Stop of individual, all at once; all remote or all local streams
* onstreamended added; a better method comparing "onleave"
* maxParticipantsAllowed added
* media/sdp constraints / [(8d76c0c)](https://github.com/muaz-khan/WebRTC-Experiment/commit/8d76c0cb5be4d8df17c6603220c091b8ea2ff0f6#RTCMultiConnection)
* Session re-initiation / [(a0f9b72)](https://github.com/muaz-khan/WebRTC-Experiment/commit/a0f9b72654b3ba7c5232968d9850e35fb770bbbb#RTCMultiConnection)
* removeStream added to allow removal of existing media streams
* disableDtlsSrtp added to fix renegotiation process which fails on chrome when DTLS/SRTP enabled
* autoSaveToDisk added to allow customization of file-sharing
* file-sharing extended and fixed; no crash for large files anymore!
* renegotiation for chrome M29 and upper
* sctp/reliable data channels support for chrome (unreliable is still default)
* enable/disable ice candidates (host/relfexive/relay)
* enable/disable bandwidth sdp parameters (by default, enabled)
* noise/echo stepped down; a simple/lazy workaround
* audio/video recording added / using [RecordRTC](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC)
* directions simplified
* SCTP data channels are preferred / preferSCTP
* onmute/onunmute added. [Demo](https://www.webrtc-experiment.com/RTCMultiConnection-v1.4-Demos/mute-unmute.html)
* File queue support added. Previously shared files will be auto transmitted to each new peer.

<a name="v1.3"></a>
### 1.3 (2013-05-19)

```
<script src="//cdn.webrtc-experiment.com/RTCMultiConnection-v1.3.js"></script>
```

#### Features
* Syntax changed; a few breaking changes comparing v1.2 / [(ac36855)](https://github.com/muaz-khan/WebRTC-Experiment/commit/ac368557ce857dad1fbcf70aa58813d50cec6047#RTCMultiConnection)
* Simple renegotiation
* Mute/UnMute of individual streams
* Auto-session establishment feature removed
* Application specific bandwidth (b=AS) / [(6df6a55)](https://github.com/muaz-khan/WebRTC-Experiment/commit/6df6a5507268c84b91fe8445f0b9ef1f5781b687#RTCMultiConnection) and [(b38a228)](https://github.com/muaz-khan/WebRTC-Experiment/commit/b38a22834593cfc02893d320500dfb609f519580#RTCMultiConnection)
* Direct Messages
* New TURN format added / [(c0688f9)](https://github.com/muaz-khan/WebRTC-Experiment/commit/c0688f9eabfee4113150f3d362f2b3a2aa5c2895#RTCMultiConnection) / [IETF Draft](http://tools.ietf.org/html/draft-uberti-rtcweb-turn-rest-00)
* Compatible to [socket.io over node.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/socketio-over-nodejs) / [(b2e7789)](https://github.com/muaz-khan/WebRTC-Experiment/commit/b2e7789bcb79a4248090081750e26c984a76d0b0#RTCMultiConnection)

<a name="v1.2"></a>
### 1.2 (2013-04-20)

```
<script src="//cdn.webrtc-experiment.com/RTCMultiConnection-v1.2.js"></script>
```

#### Features
* Multi-session establishment
* Auto-session establishment
* Manual-session establishment
* A little bit clear session/direction values e.g. 
  > connection.session=<span style="color:red;">'audio + video and data'</span>
* Users ejection, rejection and presence detection / [(305dd27)](https://github.com/muaz-khan/WebRTC-Experiment/commit/305dd27af73c9219183f78120e8ebbb8443efb1e#RTCMultiConnection)
* Keep session active all the time; event if initiator leaves / [(bd8ae0f)](https://github.com/muaz-khan/WebRTC-Experiment/commit/bd8ae0f5529e7a3900ef5ccac61f1364390be6b3#RTCMultiConnection)
* Custom data i.e. extra data transmission
* Audio-only streaming fixed / [(a4a6c35)](https://github.com/muaz-khan/WebRTC-Experiment/commit/a4a6c3589e341617767213703683f1dba6c7548e#RTCMultiConnection)
* Custom Handlers for server i.e. <span style="color:red;">transmitRoomOnce</span> 

<a name="v1.1"></a>
### 1.1 (2013-03-25)

```
<script src="//cdn.webrtc-experiment.com/RTCMultiConnection-v1.1.js"></script>
```

#### Features
* Multiple sessions & directions / [(0174312)](https://github.com/muaz-khan/WebRTC-Experiment/commit/017431280099e892744a6300ea866e7324f5e4c2#RTCMultiConnection)
* File, data and text sharing (of any size & length)
* Chrome/Firefox interoperability
* Firefox's [new DataChannel](https://github.com/muaz-khan/WebRTC-Experiment/wiki/WebRTC-DataChannel-and-Firefox#points) syntax implemented / [(7bad719)](https://github.com/muaz-khan/WebRTC-Experiment/commit/7bad719345814c7f832fad59abf31642e096b276#RTCMultiConnection)
