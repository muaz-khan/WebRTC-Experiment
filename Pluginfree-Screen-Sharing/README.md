## WebRTC plugin free screen sharing / [Demo](https://googledrive.com/host/0B6GWd_dUUTT8WHpWSzZ5S0RqeUk/Pluginfree-Screen-Sharing.html)

No `tabCapture APIs`, No chrome extension, No firefox add-ons. Share the entire screen direclty from within a browser.

## Enable screen capture support in getUserMedia()

1. Open `chrome://flags` in the latest chrome (canary/beta). 
2. Scroll to the bottom of the page. 
3. Enable flag `Enable screen capture support in getUserMedia()` 

That flag allows web pages to request access to the screen contents via the `getUserMedia() API`.

```javascript
var video_constraints = {
    mandatory: { chromeMediaSource: 'screen' },
    optional: []
};
navigator.webkitGetUserMedia({
    audio: false,
    video: video_constraints
}, onstreaming, onfailure);
```

====
# Browser Support

[WebRTC plugin free screen sharing](https://googledrive.com/host/0B6GWd_dUUTT8WHpWSzZ5S0RqeUk/Pluginfree-Screen-Sharing.html) experiment works fine on following web-browsers:

| Browser        | Support           |
| ------------- |:-------------:|
| Firefox | [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) |
| Firefox | [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) |
| Google Chrome | [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) |
| Google Chrome | [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) |
| Google Chrome | [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |

====
## License

[WebRTC plugin free screen sharing](https://googledrive.com/host/0B6GWd_dUUTT8WHpWSzZ5S0RqeUk/Pluginfree-Screen-Sharing.html) experiment is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
