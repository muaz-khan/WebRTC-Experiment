#### WebRTC One-to-One video sharing using Socket.io / [Demo](https://www.webrtc-experiment.com/socket.io/)

This `WebRTC Experiment` is using [socket.io over node.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/socketio-over-nodejs) for signalig.

=

#### Use your own socket.io implementation!

There is a built-in [Socket.io over Node.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/socketio-over-nodejs) implementation that can be used in each and every WebRTC Experiment.

```javascript
// openSignalingChannel or openSocket!
openSignalingChannel: function(config) {
   var SIGNALING_SERVER = 'http://webrtc-signaling.jit.su:80/';
   var channel = config.channel || this.channel || 'default-channel';
   var sender = Math.round(Math.random() * 60535) + 5000;
   
   io.connect(SIGNALING_SERVER).emit('new-channel', {
      channel: channel,
      sender : sender
   });
   
   var socket = io.connect(SIGNALING_SERVER + channel);
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
}
```

=

#### Browser Support

This [One-to-one WebRTC video chat using socket.io](https://www.webrtc-experiment.com/socket.io/) experiment works fine on following web-browsers:

| Browser        | Support           |
| ------------- |-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Android | [Chrome Beta](https://play.google.com/store/apps/details?id=com.chrome.beta&hl=en) |

=

#### License

[WebRTC one-to-one video sharing using socket.io](https://www.webrtc-experiment.com/socket.io/) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
