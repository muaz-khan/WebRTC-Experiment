## WebRTC One-to-One video sharing using Socket.io / [Demo](https://webrtc-experiment.appspot.com/socket.io/)

This `WebRTC Experiment` is using `socket.io` for signalig.

## Use your own socket.io implementation!

You must link `socket.io.js` file before using below code:

```javascript
var config = {
    openSocket: function (config) {
        var socket = io.connect('http://your-site:8888');
        socket.channel = config.channel || 'WebRTC-Experiment';
		socket.on('message', config.onmessage);
		
        socket.send = function (data) {
            socket.emit('message', data);
        };

        if (config.onopen) setTimeout(config.onopen, 1);
        return socket;
    }
};
```

1. One-to-one video sharing capability
2. Easily understand and usable code
3. Change maximum 3 lines to use your own node.js specific socket.io implementation!

## How to use this experiment in your own site?

**Just copy HTML/JS code in your site and that's all you need to do. Nothing to install! No requirements!**

====
## Browser Support

This [One-to-one WebRTC video chat using socket.io](https://webrtc-experiment.appspot.com/socket.io/) experiment works fine on following web-browsers:

| Browser        | Support           |
| ------------- |:-------------:|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Internet Explorer / IE | [Chrome Frame](http://www.google.com/chromeframe) |

====
## License

[WebRTC one-to-one video sharing using socket.io](https://webrtc-experiment.appspot.com/socket.io/) is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
