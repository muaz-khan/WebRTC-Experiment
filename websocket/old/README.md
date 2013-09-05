#### WebRTC One-to-One video sharing using WebSockets / [Demo](https://www.webrtc-experiment.com/websocket/)

This `WebRTC Experiment` is using `WebSockets` for signalig.

=

#### How to use your own WebSocket implementation?

There is a built-in [WebSocket over Node.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/websocket-over-nodejs) implementation that you can use in each and every WebRTC Experiment.

```javascript
var SIGNALING_SERVER = 'ws://' + document.domain + ':8888/';
openSignalingChannel: function(config) {
    config.channel = config.channel || 'default-channel';
    var websocket = new WebSocket(SIGNALING_SERVER);
    websocket.channel = config.channel;
    websocket.onopen = function() {
        websocket.push(JSON.stringify({
            open: true,
            channel: config.channel
        }));
        if (config.callback)
            config.callback(websocket);
    };
    websocket.onmessage = function(event) {
        config.onmessage(JSON.parse(event.data));
    };
    websocket.push = websocket.send;
    websocket.send = function(data) {
        websocket.push(JSON.stringify({
            data: data,
            channel: config.channel
        }));
    };
}
```

In `ui.js` files you can find `openSocket` method; or in all libraries; you can find `openSignalingChannel` method.

=

#### Browser Support

This [One-to-one WebRTC video chat using WebSocket](https://www.webrtc-experiment.com/websocket/) experiment works fine on following web-browsers:

| Browser        | Support           |
| ------------- |-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Android | [Chrome Beta](https://play.google.com/store/apps/details?id=com.chrome.beta&hl=en) |

=

#### License

[WebRTC One-to-One video sharing using WebSockets](https://www.webrtc-experiment.com/websocket/) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
