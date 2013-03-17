**Just copy HTML/JS code in your site and that's all you need to do. Nothing to install! No requirements!**

**WebRTC Screen Sharing** using Google Chrome experimental `tabCapture APIs`.

====
## Browser Support / [Demo](https://webrtc-experiment.appspot.com/screen-viewer/)

This [WebRTC Screen Sharing Experiment](https://webrtc-experiment.appspot.com/screen-viewer/) works fine on following web-browsers:

## To Broadcast your own stream

| Browser        | Support           |
| ------------- |:-------------:|
| Google Chrome | [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) |

## To Join any broadcasted screen

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

## How Screen Broadcast Works?

Following 3 lines given access to media stream and everything else was same!

```javascript
chrome.tabCapture.capture({ audio: true, video: true }, function(stream) {
    // broadcastNow(stream);
});
```

In simple words, multi-peers and sockets are opened to make it work!

====
## License

This [WebRTC Experiment](https://webrtc-experiment.appspot.com/screen-viewer/) is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
