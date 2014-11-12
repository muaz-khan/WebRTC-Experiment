#### WebRTC Screen-Sharing / [Demo](https://www.webrtc-experiment.com/screen-sharing/)

Ad-ons free; plugin-free; extension free; direct browser-to-browser screen sharing.

**Firefox?** [Install Firefox Extension](https://www.webrtc-experiment.com/store/firefox-extension/enable-screen-capturing.xpi) / [Source Code](https://github.com/muaz-khan/Firefox-Extensions/tree/master/enable-screen-capturing)

=

#### First Step: Link the library

```html
<script src="//cdn.webrtc-experiment.com/getScreenId.js"></script>
<script src="//cdn.webrtc-experiment.com/screen.js"></script>
```

=

#### Last Step: Start using it!

```javascript
var screen = new Screen('screen-unique-id'); // argument is optional

// on getting local or remote streams
screen.onaddstream = function(e) {
    document.body.appendChild(e.video);
};

// check pre-shared screens
// it is useful to auto-view
// or search pre-shared screens
screen.check();

document.getElementById('share-screen').onclick = function() {
    screen.share();
};
```

=

#### Custom user-ids?

```javascript
screen.userid = 'username';
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
screen.openSignalingChannel = function(callback) {
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
screen.firebase = 'chat';
```

=

#### Want to manually join rooms?

```javascript
screen.onscreen = function(_screen) {
    var li = document.createElement('li');
    li.setAttribute('user-id', _screen.userid);
    li.setAttribute('room-id', _screen.roomid);
    li.onclick = function() {
        var _screen = {
            userid: this.getAttribute('user-id'),
            roomid: this.getAttribute('room-id')
        };
        screen.view(_screen);
    };
};
```

`onscreen` is called for each new screen; and `view` method allows you manually view shared screens.

=

#### Stop sharing screen

```javascript
screen.leave();
```

=

#### If someone leaves...

Participants' presence can be detected using `onuserleft`:

```javascript
// if someone leaves; just remove his video
screen.onuserleft = function(userid) {
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
screen.onaddstream = function(e) {
    document.body.appendChild(e.video);
};
```

=

#### Browser Support

This [WebRTC Screen Sharing](https://www.webrtc-experiment.com/screen-sharing/) experiment works fine on following web-browsers:

| Browser        | Support           |
| ------------- |-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Android | [Chrome Beta](https://play.google.com/store/apps/details?id=com.chrome.beta&hl=en) |

=

#### Enable screen capture support in getUserMedia()

You must enable this flag via `chrome://flags`.

That flag allows web pages to request access to the screen contents via the getUserMedia() API

```javascript
var video_constraints = {
    mandatory: { chromeMediaSource: 'screen' },
    optional: []
};
navigator.webkitGetUserMedia({
    audio: false,
    video: video_constraints
}, onsuccess, onfailure);
```

=

#### Desktop Sharing?

Obviously, it is one of the most requested features; however not supported yet. Chrome WebRTC team is planning to support it in near future.

These screen sharing APIs (i.e. `{ chromeMediaSource: 'screen' }`) allows only state-less (non-interactive) screen sharing.

=

#### To use code in your own site, you must understand following limitations:

Chrome canary denies **screen capturing** request automatically if:

1. You've not used `chromeMediaSource` constraint: `mandatory: {chromeMediaSource: 'screen'}`
2. You requested audio-stream alongwith `chromeMediaSource` – it is not permitted in a **single** `getUserMedia` request.
3. You've not installed SSL certificate (i.e. testing on non-HTTPS domain)
4. **screen capturing** is requested multiple times per tab. Maximum one request is permitted per page!

=

#### Why recursive cascade images or blurred screen?

Remember, recursive cascade images or blurred screen is chrome's implementation issue. It will be solved soon.

`mandatory: {chromeMediaSource: 'tab'}` can only be useful in chrome extensions. See [Tab sharing using tabCapture APIs](https://www.webrtc-experiment.com/screen-broadcast/).

=

#### License

[WebRTC Screen Sharing](https://www.webrtc-experiment.com/screen-sharing/) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
