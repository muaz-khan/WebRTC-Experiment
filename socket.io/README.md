#### WebRTC One-to-One video sharing using Socket.io / [Demo](https://www.webrtc-experiment.com/socket.io/)

It supports any socket.io signaling gateway. Socket.io over Node.js is preferred. You can customize socket.io events too.

=

#### How to use it in your own website?

First of all; link following library:

```javascript
http://cdn.webrtc-experiment.com/socket.io/PeerConnection.js
```

=

#### Simplest Demo

```javascript
var offerer = new PeerConnection('http://domain:port', 'message', 'offerer');
offerer.onStreamAdded = function(e) {
   document.body.appendChild(e.mediaElement);
};
var answerer = new PeerConnection('http://domain:port', 'message', 'answerer');
answerer.onStreamAdded = function(e) {
   document.body.appendChild(e.mediaElement);
};
answerer.sendParticipationRequest('offerer');
```

=

#### Explanation

Constructor takes three arguments. Last two are optional.

```javascript
var peer = new PeerConnection('socket-url', 'socket-event', 'user-id');

// you can write like this:
var peer = new PeerConnection('socket-url');
```

1. **socket-url:** it is mandatory
2. **socket-event:** default event is "message"
3. **user-id:** by default, it is auto generated

There are two ways to connect peers:

1. The easiest method of "manual" peers connection is call "sendParticipationRequest" and pass user-id of the target user.
2. otherwise, call "startBroadcasting" (behind the scene) this function will be invoked recursively until a participant found.

```javascript
peer.sendParticipationRequest(userid);

// or
peer.startBroadcasting();
```

By default peers are auto-connected; however, you can override this behavior and be alerted if a user transmitted himself using "startBroadcasting":

```javascript
// "onUserFound" allows you connect multiple peers i.e. one-to-many
peer.onUserFound = function(userid) {
   peer.sendParticipationRequest(userid);
};
```

You can access local or remote media streams using "onStreamAdded":

```javascript
offerer.onStreamAdded = function(e) {
   // e.mediaElement --- HTMLVideoElement
   // e.stream       --- MediaStream
   // e.type         --- "local" or "remote"
};
```

You may want to remove HTML video elements if a peers leaves:

```javascript
offerer.onStreamEnded = function(e) {
   // e.mediaElement --- HTMLVideoElement
   // e.stream       --- MediaStream
   // e.type         --- "local" or "remote"

   if(e.mediaElement.parentNode)
      e.mediaElement.parentNode.removeChild(e.mediaElement);
};
```

You can override user-id any time:

```javascript
peer.userid = '123';

setTimeout(function() {
   peer.userid = '890
}, 5000);
```

You can manually leave/close the room:

```javascript
peer.close();
```

You can access target user's id too:

```javascript
console.log('target user-id is', peer.participant);
```

You may want to be alerted for each participantion request; and manually allow/reject them:

```javascript
peer.onParticipationRequest = function(userid) {
   peer.acceptRequest(userid);
};
```

1. override "onParticipationRequest" to prevent auto-accept of requests
2. use "acceptRequest" method to manually allow requests

You may want to list number of users connected with you:

```javascript
var numberOfUsers = 0;
for(var user in peer.peers) {
   console.log(user, 'is connected with you.');
   numberOfUsers++;
}
console.log('total users connected with you:', numberOfUsers);
```

You can access media stream like this:

```javascript
console.log('local media stream:', peer.MediaStream);

// you can stop media strema too:
peer.MediaStream.stop();

// however, instead of "stopping" media-stream manually
// you "close" method instead:
peer.close();
```

=

#### Browser Support

This [PeerConnection.js](https://www.webrtc-experiment.com/socket.io/PeerConnection.js) supports following web-browsers:

| Browser        | Support           |
| ------------- |-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Android | [Chrome Beta](https://play.google.com/store/apps/details?id=com.chrome.beta&hl=en) |

=

#### License

[PeerConnection.js](https://www.webrtc-experiment.com/socket.io/PeerConnection.js) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
