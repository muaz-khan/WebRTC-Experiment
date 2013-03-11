**Just copy HTML code in your site and that's all you need to do. Nothing to install! No requirements!**

*Only one limitation: A link back to [Muaz Khan](http://github.com/muaz-khan)!*

====
# Cross Browser Support

This [WebRTC Experiment](https://webrtc-experiment.appspot.com/video-conferencing/) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |:-------------:|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) |
| Firefox | [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) |
| Firefox | [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) |
| Google Chrome | [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) |
| Google Chrome | [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) |
| Google Chrome | [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Internet Explorer / IE | [Chrome Frame](http://www.google.com/chromeframe) |
| Android | [Chrome Beta](https://play.google.com/store/apps/details?id=com.chrome.beta) |

## How Video Conferencing Works?

In simple words, multi-peers and sockets are opened to make it work!

1. Video Conferencing!
2. Group video sharing capability ( many-to-many )
3. Private conferences
4. Easily understandable code (use it free of cost!)
5. Change only 3-lines to use your own socket.io implementation!

# Use your own socket.io implementation!

```javascript
var config = {
    // JUST change code in openSocket method
    openSocket: function (config) {
        // ---------------------------- from here
        
        var socket = io.connect('your own socket.io URL');

        // set channel: 'video-conferencing' is the default channel
        socket.channel = config.channel || 'video-conferencing';

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
