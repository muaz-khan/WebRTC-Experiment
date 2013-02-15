====
# Cross Browser Support (Interoperable)

This [WebRTC Experiment](https://googledrive.com/host/0B6GWd_dUUTT8dW5ycGVPT0V1bTg/chrome-to-firefox.html) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |:-------------:|
| Firefox | [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) |
| Google Chrome | [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) |

## [Demo / Preview / Test / Experiment](https://googledrive.com/host/0B6GWd_dUUTT8dW5ycGVPT0V1bTg/chrome-to-firefox.html)

Just replace old file with this one to take advantage of cross-browser audio/video streaming! 

```html
<script src="http://bit.ly/RTCPeerConnection-v1-4"></script>
```

Cross browser means one browser must be Chrome Beta/Canary and other must be Firefox Nightly.

# Use your own socket.io implementation!

```javascript
var config = {
    // JUST change code in openSocket method
    openSocket: function (config) {
        // ---------------------------- from here
        
        var socket = io.connect('your own socket.io URL');

        // set channel: 'chrome-to-firefox' is the default channel
        socket.channel = config.channel || 'chrome-to-firefox';

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

Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503) - A link back is MUST! - All rights reserved!
