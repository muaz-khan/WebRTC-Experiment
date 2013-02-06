**Just copy HTML code in your site and that's all you need to do. Nothing to install! No requirements!**

*Only one limitation: A link back to [Muaz Khan](http://github.com/muaz-khan)!*

====
# Browser Support

This [WebRTC Experiment](https://webrtc-experiment.appspot.com/audio-broadcast/) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |:-------------:|
| Firefox | [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) |
| Firefox | [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) |

--

[How to share audio-only streams](https://webrtc-experiment.appspot.com/docs/how-to-share-audio-only-streams.html) ? Early workaround for Chrome Canary!

```javascript
audio.src = webkitURL.createObjectURL(event.stream);
audio.addEventListener('play', function () {
	this.muted = false;
	this.volume = 1;
}, false);

audio.play();
```

## How Audio Broadcast Works?

In simple words, multi-peers and sockets are opened to make it work!

1. Audio broadcasting capability (one-to-many)
2. Private broadcasting rooms

====
## License & Credits

Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503) - A link back is MUST! - All rights reserved!
