**Just copy HTML code in your site and that's all you need to do. Nothing to install! No requirements!**

====
# Browser Support

This [WebRTC Experiment](https://webrtc-experiment.appspot.com/file-hangout/) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |:-------------:|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) |
| Firefox | [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) |
| Firefox | [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) |

## How File Hangout Works?

In simple words, multi-peers and sockets are opened to make it work!

1. Group file-sharing capability
2. Private sharing rooms
3. Easily understand and interchangeable code (use it for free!)
4. Change only 3 lines to use your own socket.io implementation for signaling. Change maximum 30 lines to use your own algorithm to transfer/save files!

# Use your own socket.io implementation!

```javascript
var config = {
    // JUST change code in openSocket method
    openSocket: function (config) {
        // ---------------------------- from here
        
        var socket = io.connect('your own socket.io URL');

        // set channel: 'file-hangout' is the default channel
        socket.channel = config.channel || 'file-hangout';

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
