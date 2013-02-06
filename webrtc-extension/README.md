**Just copy HTML code in your site and that's all you need to do. Nothing to install! No requirements!**

*Only one limitation: A link back to [Muaz Khan](http://github.com/muaz-khan)!*

====
# Browser Support

This [WebRTC Experiment](https://webrtc-experiment.appspot.com/screen-broadcast/) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |:-------------:|
| Google Chrome | [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) |

## How Screen Broadcast Extension Works?

In simple words, multi-peers and sockets are opened to make it work!

[This webrtc experiment](https://webrtc-experiment.appspot.com/screen-broadcast/) uses socket.io as signaling gateway.

Stream is captured using Google Chrome experimental tabCapture APIs and transmitted over socket.

It has the ability to handle unlimited peers. So unlimited peers can get access to broadcasted screen.

The following function is used to capture tab/screen:

```javascript
chrome.tabCapture.capture({ audio: true, video: true }, function(stream) {
    // broadcastNow(stream);
});
```

====
## License & Credits

Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503) - A link back is MUST! - All rights reserved!