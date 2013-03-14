====
# Cross Browser Support (Interoperable)

| Browser        | Support           |
| ------------- |:-------------:|
| Firefox | [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) |
| Firefox | [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) |
| Google Chrome | [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) |
| Google Chrome | [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) |
| Google Chrome | [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |


## [Demo / Preview / Test / Experiment](https://googledrive.com/host/0B6GWd_dUUTT8YUJaMkZ2d0NzQmc/WebRTC-Screen-Viewer.html)

You can esily use your own socket.io implementation.

## [How to install Google Chrome tabCapture Extension?](https://webrtc-experiment.appspot.com/screen-broadcast/how-to-install/)

# Download Extension

https://muazkh.googlecode.com/files/Chrome-to-Firefox-Screen-Sharing.zip

# Use your own socket.io implementation!

```javascript
var config = {
    // JUST change code in openSocket method
    openSocket: function (config) {
        // ---------------------------- from here
        
        var socket = io.connect('your own socket.io URL');

        // set channel: 'screen-sharing' is the default channel
        socket.channel = config.channel || 'screen-sharing';

        // when socket opens: call 'config.onopen'
        config.onopen && socket.on('connect', config.onopen);

        // when socket gets message: call 'config.onmessage'
        socket.on('message', config.onmessage);

        // return socket object; because it will be used later
        return socket;

        // ---------------------------- to here --- and that's all you need to do!
    }
};
```

====
## License & Credits

MIT: https://webrtc-experiment.appspot.com/licence/ : Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
