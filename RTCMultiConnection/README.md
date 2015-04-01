<a href="https://github.com/muaz-khan/RTCMultiConnection"><img src="https://i.imgur.com/MFfRBSM.png" /></a> / <a href="https://github.com/muaz-khan/RTCMultiConnection/wiki">Wiki Pages</a> / <a href="http://www.rtcmulticonnection.org/docs/">Documentation</a> / <a href="http://www.rtcmulticonnection.org/FAQ/">FAQ</a> / <a href="https://www.webrtc-experiment.com/RTCMultiConnection/">Demos</a> / <a href="http://www.rtcmulticonnection.org/changes-log/">Changes Log</a>

## WebRTC Library  [![npm](https://img.shields.io/npm/v/rtcmulticonnection.svg)](https://npmjs.org/package/rtcmulticonnection) [![downloads](https://img.shields.io/npm/dm/rtcmulticonnection.svg)](https://npmjs.org/package/rtcmulticonnection) [![Build Status: Linux](https://travis-ci.org/muaz-khan/RTCMultiConnection.png?branch=master)](https://travis-ci.org/muaz-khan/RTCMultiConnection)

```
# RTCMultiConnection-v3.0 is latest Beta
npm install rtcmulticonnection-v3
```

Quick-Demos for newbies: 

1. <a href="http://jsfiddle.net/zar6fg60/">http://jsfiddle.net/zar6fg60/</a> (simplest)
2. <a href="http://jsfiddle.net/c46de0L8/">http://jsfiddle.net/c46de0L8/</a> (simple)

<table style="font-size:18px; font-weight:bold; margin:0; padding:0; margin-left:auto; margin-right:auto; text-align:center;">
    <tr>
        <td>
            <a href="https://www.webrtc-experiment.com/RTCMultiConnection/" target="_blank">
                <img src="https://i.imgur.com/Fz1Pff6.png" style="display:block; width:99px; height99px;" alt="Demos">
                Demos
            </a>
        </td>
        
        <td>
            <a href="http://www.rtcmulticonnection.org/docs/getting-started/" target="_blank">
                <img src="https://i.imgur.com/v3YdSC6.png" style="display:block; width:99px; height99px;" alt="Getting-Started">
                Getting Started
            </a>
        </td>
        
        <td>
            <a href="http://www.rtcmulticonnection.org/docs/" target="_blank">
                <img src="https://i.imgur.com/mtu6091.png" style="display:block; width:99px; height99px;" alt="Documentation">
                Documentation
            </a>
        </td>
        
        <td>
            <a href="http://www.rtcmulticonnection.org/changes-log/" target="_blank">
                <img src="https://i.imgur.com/zHngv8r.png" style="display:block; width:99px; height99px;" alt="Changes Log">
                Changes Log
            </a>
        </td>
        
        <td>
            <a href="http://www.rtcmulticonnection.org/FAQ/" target="_blank">
                <img src="https://i.imgur.com/Zeqlfv2.png" style="display:block; width:99px; height99px;" alt="FAQ">
                FAQ
            </a>
        </td>
    </tr>
</table>

RTCMultiConnection is a <a href="https://www.webrtc-experiment.com/">WebRTC</a> JavaScript wrapper library runs top over RTCPeerConnection API to provide multi-session establishment scenarios. It also provides dozens of features as hybrid-less mesh networking model, a reliable presence detection and syncing system; complex renegotiation scenarios; and much more. It provides everything you've in your mind! Just understand the API and you'll enjoy using it! It is simple and its syntax is similar as WebSockets JavaScript API and RTCPeerConnection API.

It is <a href="https://www.webrtc-experiment.com/licence/">MIT Licenced</a>, which means that you can use it in any commercial/non-commercial product, free of cost.

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

```
bower install rtcmulticonnection

# or NPM!
npm install rtcmulticonnection
```

To use it:

```htm
<script src="./node_modules/rtcmulticonnection/RTCMultiConnection.js"></script>
```

There are some other NPM packages regarding RTCMultiConnection:

* https://www.npmjs.org/search?q=RTCMultiConnection

## 1. Link The Library

```
// latest file
https://cdn.webrtc-experiment.com/RTCMultiConnection-v2.2.4.js

// or a little bit more stable version: (v2.*.*)
https://cdn.webrtc-experiment.com/RTCMultiConnection.js
```

## 2. Common Code

```javascript
var MODERATOR_CHANNEL_ID = 'ABCDEF'; // channel-id
var MODERATOR_SESSION_ID = 'XYZ';    // room-id
var MODERATOR_ID         = 'JKL';    // user-id
var MODERATOR_SESSION    = {         // media-type
    audio: true,
    video: true
};
var MODERATOR_EXTRA      = {};       // empty extra-data
```

## 3. Code for Room Moderator (i.e. Initiator)

```javascript
var moderator     = new RTCMultiConnection(MODERATOR_CHANNEL_ID);
moderator.session = MODERATOR_SESSION;
moderator.userid  = MODERATOR_ID;
moderator.extra   = MODERATOR_EXTRA;
moderator.open({
    dontTransmit: true,
    sessionid   : MODERATOR_SESSION_ID
});
```

## 4. Code for Room Participants

```javascript
var participants = new RTCMultiConnection(MODERATOR_CHANNEL_ID);
participants.join({
    sessionid: MODERATOR_SESSION_ID,
    userid   : MODERATOR_ID,
    extra    : MODERATOR_EXTRA,
    session  : MODERATOR_SESSION
});
```

## 5. (optional) Handle how to get streams

```javascript
// same code can be used for participants
// (it is optional) 
moderator.onstreamid = function(event) {
    // got a clue of incoming remote stream
    // didn't get remote stream yet
    
    var incoming_stream_id = event.streamid;
    
    YOUR_PREVIEW_IMAGE.show();
    
    // or
    YOUR_PREVIEW_VIDEO.show();
};

// same code can be used for participants
// it is useful
moderator.onstream = function(event) {
    // got local or remote stream
    // if(event.type == 'local')  {}
    // if(event.type == 'remote') {}
    
    document.body.appendChild(event.mediaElement);
    
    // or YOUR_VIDEO.src = event.blobURL;
    // or YOUR_VIDEO.src = URL.createObjectURL(event.stream);
};

// same code can be used for participants
// it is useful but optional
moderator.onstreamended = function(event) {
    event.mediaElement.parentNode.removeChild(event.mediaElement);
};
```

## [Simplest Demo](http://jsfiddle.net/zar6fg60/)

```html
<hr /><button id="openRoom">Open Room</button>
      <button id="joinRoom">Join Room</button><hr />
<script src="https://cdn.webrtc-experiment.com/RTCMultiConnection.js"> </script>
<script>
document.getElementById('openRoom').onclick = function() {
    (new RTCMultiConnection).open();
};
document.getElementById('joinRoom').onclick = function() {
    (new RTCMultiConnection).connect();
};
</script>
```

## Demos using [RTCMultiConnection](http://www.RTCMultiConnection.org/)

| Experiment Name        | Demo           | Source Code |
| ------------- |-------------|-------------|
| AppRTC like RTCMultiConnection demo! | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/AppRTC-Look.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/AppRTC-Look.html) |
| MultiRTC! RTCMultiConnection all-in-one demo! | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/MultiRTC/) | [Source](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/MultiRTC-simple) |
| Collaborative Canvas Designer | [Demo](https://www.webrtc-experiment.com/Canvas-Designer/) | [Source](https://github.com/muaz-khan/Canvas-Designer) |
| Conversation.js - Skype like library | [Demo](https://www.webrtc-experiment.com/Conversationjs/) | [Source](https://github.com/muaz-khan/Conversation.js) |
| All-in-One test | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/all-in-one.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/all-in-one.html) |
| Multi-Broadcasters and Many Viewers | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/Multi-Broadcasters-and-Many-Viewers.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/Multi-Broadcasters-and-Many-Viewers.html) |
| Select Broadcaster at runtime | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/select-broadcaster-at-runtime.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/select-broadcaster-at-runtime.html) |
| OneWay Screen & Two-Way Audio | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/OneWay-Screen-TwoWay-Audio.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/OneWay-Screen-TwoWay-Audio.html) |
| Stream Mp3 Live | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/stream-mp3-live.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/stream-mp3-live.html) |
| Socket.io auto Open/Join rooms | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/socketio-auto-open-join-room.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/socketio-auto-open-join-room.html) |
| Screen Sharing & Cropping | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/cropped-screen-sharing.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/cropped-screen-sharing.html) |
| Share Part of Screen without cropping it | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/RTCMultiConnection.sharePartOfScreen.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/RTCMultiConnection.sharePartOfScreen.html) |
| getMediaDevices/enumerateDevices | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/getMediaDevices.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/getMediaDevices.html) |
| Renegotiation & Mute/UnMute/Stop | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/Renegotiation.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/Renegotiation.html) |
| Video-Conferencing | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/videoconferencing.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/videoconferencing.html) |
| Video Broadcasting | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/video-broadcasting.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/video-broadcasting.html) |
| Audio Conferencing | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/audioconferencing.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/audioconferencing.html) |
| Multi-streams attachment | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/multi-streams-attachment.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/multi-streams-attachment.html) |
| Admin/Guest audio/video calling | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/admin-guest.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/admin-guest.html) |
| Session Re-initiation Test | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/session-reinitiation.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/session-reinitiation.html) |
| Preview Screenshot of the room | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/rooms-screenshots.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/rooms-screenshots.html) |
| RecordRTC & RTCMultiConnection | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/RecordRTC-and-RTCMultiConnection.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/RecordRTC-and-RTCMultiConnection.html) |
| Explains how to customize ice servers; and resolutions | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/features.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/features.html) |
| Mute/Unmute and onmute/onunmute | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/mute-unmute.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/mute-unmute.html) |
| One-page demo: Explains how to skip external signalling gateways | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/one-page-demo.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/one-page-demo.html) |
| Password Protect Rooms: Explains how to authenticate users | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/password-protect-rooms.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/password-protect-rooms.html) |
| Session Management: Explains difference between "leave" and "close" methods | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/session-management.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/session-management.html) |
| Multi-Sessions Management | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/multi-sessions-management.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/multi-sessions-management.html) |
| Customizing Bandwidth | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/bandwidth.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/bandwidth.html) |
| Users ejection and presence detection | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/users-ejection.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/users-ejection.html) |
| Multi-Session Establishment | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/multi-session-establishment.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/multi-session-establishment.html) |
| Group File Sharing + Text Chat | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/group-file-sharing-plus-text-chat.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/group-file-sharing-plus-text-chat.html) |
| Audio Conferencing + File Sharing + Text Chat | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/audio-conferencing-data-sharing.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/audio-conferencing-data-sharing.html) |
| Join with/without camera | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/join-with-or-without-camera.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/join-with-or-without-camera.html) |
| Screen Sharing | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/screen-sharing.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/screen-sharing.html) |
| One-to-One file sharing | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/one-to-one-filesharing.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/one-to-one-filesharing.html) |
| Manual session establishment + extra data transmission | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/manual-session-establishment-plus-extra-data-transmission.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/manual-session-establishment-plus-extra-data-transmission.html) |
| Manual session establishment + extra data transmission + video conferencing | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/manual-session-establishment-plus-extra-data-transmission-plus-videoconferencing.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/manual-session-establishment-plus-extra-data-transmission-plus-videoconferencing.html) |
| takeSnapshot i.e. Take Snapshot of Local/Remote streams | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/takeSnapshot.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/takeSnapshot.html) |
| Audio/Video/Screen sharing and recording | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/audio-video-screen-sharing-recording.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/audio-video-screen-sharing-recording.html) |
| Broadcast Multiple-Cameras | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/Broadcast-Multiple-Cameras.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/Broadcast-Multiple-Cameras.html) |
| Remote Stream Forwarding | [Demo](https://www.webrtc-experiment.com/RTCMultiConnection/remote-stream-forwarding.html) | [Source](https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/remote-stream-forwarding.html) |
| WebRTC Scalable Broadcast | Socketio/Nodejs | [Source](https://github.com/muaz-khan/WebRTC-Scalable-Broadcast) |

## Credits & Contributors

* [CONTRIBUTING.md](https://github.com/muaz-khan/RTCMultiConnection/blob/master/CONTRIBUTING.md)

## Related Projects

* [Moodle Plugin](https://moodle.org/plugins/view/mod_webrtcexperiments) / [Source code](https://github.com/danielneis/moodle-mod_webrtcexperiments)
* [MultiRTC](https://www.npmjs.com/package/multirtc)
* [Meteo Plugin](https://atmospherejs.com/mrt/rtcmulticonnection) / [Source code](https://github.com/fishdude/meteor-RTCMultiConnection)

If you've additional plugins, you can update this list.

## License

[RTCMultiConnection](https://github.com/muaz-khan/RTCMultiConnection) is released under [MIT licence](https://github.com/muaz-khan/RTCMultiConnection/blob/master/LICENSE.md) . Copyright (c) [Muaz Khan](http://www.MuazKhan.com/).
