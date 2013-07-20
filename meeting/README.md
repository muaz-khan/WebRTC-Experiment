#### WebRTC Meeting i.e. Video-Conferencing / [Demo](https://www.webrtc-experiment.com/meeting/)

1. Multiple peer-connections are opened to bring multi-users connectivity experience.
2. Maximum peers limit on chrome is temporarily 10.
3. Huge bandwidth and CPU-usage out of multi-peers and number of RTP-ports

To understand 3rd option better; assume that 10 users are sharing video in a group. 40 RTP-ports i.e. streams will be created for each user. All streams are expected to be flowing concurrently; which causes blur video experience and audio lose/noise issues.

For each user:

1. 10 RTP ports are opened to send video upward i.e. for outgoing video streams
2. 10 RTP ports are opened to send audio upward i.e. for outgoing audio streams
3. 10 RTP ports are opened to receive video i.e. for incoming video streams
4. 10 RTP ports are opened to receive audio i.e. for incoming audio streams

Possible issues:

1. Blurry video experience
2. Unclear voice and audio lost
3. Bandwidth issues / slow streaming / CPU overwhelming

Solution? Obviously a media server. To overcome burden and to deliver HD stream over thousands of peers; we need a media server that should broadcast stream over number of peers.

=

#### First Step: Link the library

```html
<script src="https://www.webrtc-experiment.com/meeting/meeting.js"></script>
```

=

#### Last Step: Start using it!

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
meeting.check();

document.getElementById('setup-new-meeting').onclick = function() {
    meeting.setup('meeting room name');
};
```

=

#### Custom user-ids?

```javascript
meeting.userid = 'username';
```

=

#### Custom signaling channel?

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

=

#### Want to manually join rooms?

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

#### If someone leaves...

Participants' presence can be detected using `onuserleft`:

```javascript
// if someone leaves; just remove his video
meeting.onuserleft = function(userid) {
    var video = document.getElementById(userid);
    if(video) video.parentNode.removeChild(video);
};
```

=

#### `onaddstream`

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

#### Browser Support

This [WebRTC Meeting](https://www.webrtc-experiment.com/meeting/) experiment works fine on following web-browsers:

| Browser        | Support           |
| ------------- |-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Android | [Chrome Beta](https://play.google.com/store/apps/details?id=com.chrome.beta&hl=en) |

=

#### License

[WebRTC Meeting](https://www.webrtc-experiment.com/meeting/) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
