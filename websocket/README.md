## WebRTC One-to-One video sharing using WebSockets / [Demo](https://webrtc-experiment.appspot.com/websocket/)

This `WebRTC Experiment` is using `WebSockets` for signalig.

## How to use your own WebSocket implementation?

You must link `websocket.js` file before using below code:

```javascript
var config = {
    openSocket: function (config) {
        "use strict";
        var socket = new WebSocket('ws://your-websocket-url/');
		socket.channel = config.channel || location.hash.replace('#', '') || 'webrtc-websocket';
		socket.onmessage = function (evt) {
			config.onmessage(evt.data);
		};
		if(config.onopen) socket.onopen = config.onopen;
		return socket;
        
    }
};
```

1. One-to-one video sharing capability
2. Easily understand and usable code
3. Change maximum 3 lines to use your own WebSocket implementation!

## How to use this experiment in your own site?

**Just copy HTML/JS code in your site and that's all you need to do. Nothing to install! No requirements!**

====
## Browser Support

This [One-to-one WebRTC video chat using WebSocket](https://webrtc-experiment.appspot.com/websocket/) experiment works fine on following web-browsers:

| Browser        | Support           |
| ------------- |:-------------:|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Internet Explorer / IE | [Chrome Frame](http://www.google.com/chromeframe) |

====
## License

[WebRTC One-to-One video sharing using WebSockets](https://webrtc-experiment.appspot.com/websocket/) is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
