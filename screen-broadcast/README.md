**Just copy HTML code in your site and that's all you need to do. Nothing to install! No requirements!**

====
# Browser Support

This [WebRTC Experiment](https://webrtc-experiment.appspot.com/screen-broadcast/) works fine on following web-browsers:

# To Broadcast your own stream

| Browser        | Support           |
| ------------- |:-------------:|
| Google Chrome | [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) |

# To Join any broadcasted screen

| Browser        | Support           |
| ------------- |:-------------:|
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) |
| Google Chrome | [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) |
| Google Chrome | [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) |
| Google Chrome | [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |

## How Screen Broadcast Works?

Following 3 lines given access to media stream and everything else was same!

```javascript
chrome.tabCapture.capture({ audio: true, video: true }, function(stream) {
    // broadcastNow(stream);
});
```

In simple words, multi-peers and sockets are opened to make it work!

====
## License & Credits

MIT: https://webrtc-experiment.appspot.com/licence/ : Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
