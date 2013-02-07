**Just copy HTML code in your site and that's all you need to do. Nothing to install! No requirements!**

*Only one limitation: A link back to [Muaz Khan](http://github.com/muaz-khan)!*

====
# Browser Support

This [WebRTC Experiment](https://webrtc-experiment.appspot.com/chat-hangout/) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |:-------------:|
| Firefox | [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) |
| Firefox | [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) |

## How Chat Hangout Works?

In simple words, multi-peers and sockets are opened to make it work!

1. Group text-sharing capability
2. Private chat rooms
3. Easily understandable code (use it free of cost!)
4. Change maximum 10 lines to enjoy your own UI and your own socket.io implementation!

# Use your own socket.io implementation!

```javascript
var config = {
    // JUST change code in openSocket method
    openSocket: function (config) {
        // ---------------------------- from here
        
        var socket = io.connect('your own socket.io URL');

        // set channel: 'chat-hangout' is the default channel
        socket.channel = config.channel || 'chat-hangout';

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
