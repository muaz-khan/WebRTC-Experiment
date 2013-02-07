**Just copy HTML code in your site and that's all you need to do. Nothing to install! No requirements!**

*Only one limitation: A link back to [Muaz Khan](http://github.com/muaz-khan)!*

====
# Browser Support

This [WebRTC Experiment](https://webrtc-experiment.appspot.com/socket.io/) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |:-------------:|
| Firefox | [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) |
| Firefox | [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) |
| Google Chrome | [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) |
| Google Chrome | [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) |
| Google Chrome | [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |

1. One-to-one video sharing capability
2. Easily understand and usable code
3. Change maximum 3 lines to use your own node.js specific socket.io implementation!

# Use your own socket.io implementation!

```javascript
var config = {
    // JUST change code in openSocket method
    openSocket: function (config) {
        // ---------------------------- from here
        
        var socket = io.connect('your own socket.io URL');

        // set channel: 'video-chat' is the default channel
        socket.channel: config.channel || 'video-chat';

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
