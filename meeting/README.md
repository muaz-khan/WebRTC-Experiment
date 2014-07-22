## [WebRTC Meeting](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/meeting) i.e. Video-Conferencing / [Demo](https://www.webrtc-experiment.com/meeting/)

1. Mesh networking model is implemented to open 1:1 multiple peer connections i.e. interconnected peer connections
2. Maximum peer connections limit in mesh-networking is 256 (on chrome)

1:1 multiple is explained here: [WebRTC RTP Usage](https://www.webrtc-experiment.com/docs/RTP-usage.html)

=

## First Step: Link the library

```html
<script src="//cdn.webrtc-experiment.com/meeting.js"></script>
```

=

## Last Step: Start using it!

```javascript
var meeting = new Meeting('meeting-unique-id');

// on getting local or remote streams
meeting.onaddstream = function(e) {
    // e.type == 'local' ---- it is local media stream
    // e.type == 'remote' --- it is remote media stream
    document.body.appendChild(e.video);
};

// check pre-created meeting rooms
// it is useful to auto-join
// or search pre-created sessions
meeting.check('meeting room name');

document.getElementById('setup-new-meeting').onclick = function() {
    meeting.setup('meeting room name');
};
```

You can use `check` method like this:

```javascript
document.getElementById('join-meeting').onclick = function() {
    meeting.check('meeting room name');
};
```

=

## Custom user-ids?

```javascript
meeting.userid = 'username';
```

=

## Custom signaling channel?

You can use each and every signaling channel:

1. SIP-over-WebSockets
2. WebSocket over Node.js/PHP/etc.
3. Socket.io over Node.js/etc.
4. XMPP/etc.
5. XHR-POST-ing

```javascript
meeting.openSignalingChannel = function(callback) {
    return io.connect().on('message', callback);
};
```

If you want to write `socket.io over node.js`; here is the server code:

```javascript
io.sockets.on('connection', function (socket) {
    socket.on('message', function (data) {
        socket.broadcast.emit('message', data);
    });
});
```

That's it! Isn't it easiest method ever!

Want to use `Firebase` for signaling?

```javascript
// "chat" is your firebase id
meeting.firebase = 'chat';
```

More details here: https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md

=

## Want to manually join rooms?

```javascript
meeting.onmeeting = function(room) {
    var li = document.createElement('li');
    li.setAttribute('user-id', room.userid);
    li.setAttribute('room-id', room.roomid);
    li.onclick = function() {
        var room = {
            userid: this.getAttribute('user-id'),
            roomid: this.getAttribute('room-id')
        };
        meeting.meet(room);
    };
};
```

`onmeeting` is called for each new meeting; and `meet` method allows you manually join a meeting room.

=

## Leave a meeting room

```javascript
meeting.leave();
```

=

## If someone leaves...

Participants' presence can be detected using `onuserleft`:

```javascript
// if someone leaves; just remove his video
meeting.onuserleft = function(userid) {
    var video = document.getElementById(userid);
    if(video) video.parentNode.removeChild(video);
};
```

=

## `onaddstream`

It is called both for `local` and `remote` media streams. It returns:

1. `video`: i.e. `HTMLVideoElement` object
2. `stream`: i.e. `MediaStream` object
3. `userid`: i.e. id of the user stream coming from
4. `type`: i.e. type of the stream e.g. `local` or `remote`

```javascript
meeting.onaddstream = function(e) {
    // e.type == 'local' ---- it is local media stream
    // e.type == 'remote' --- it is remote media stream
    document.body.appendChild(e.video);
};
```

=

## Browser Support

This [WebRTC Meeting](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/meeting) experiment works fine on following web-browsers:

| Browser        | Support           |
| ------------- |-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Android | [Chrome Beta](https://play.google.com/store/apps/details?id=com.chrome.beta&hl=en) |

=

## License

[WebRTC Meeting](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/meeting) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
