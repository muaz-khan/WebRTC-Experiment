#### WebRTC plugin free screen sharing / [Demo](https://googledrive.com/host/0B6GWd_dUUTT8WHpWSzZ5S0RqeUk/Pluginfree-Screen-Sharing.html)

Share entire screen directly without any single installation!

#### Enable screen capture support in getUserMedia()

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

There is another experiment: [WebRTC Tab Sharing using experimental tabCapture APIs](https://webrtc-experiment.appspot.com/screen-broadcast/)

#### What about Desktop Sharing?

It is a big wish to share desktop using RTCWeb peer connection APIs but unfortunately currently it is not possible.

Current experiment is using chrome screen sharing APIs which is allows end-users just **view the screen**....nothing else!

#### Browser Support

[WebRTC plugin free screen sharing](https://googledrive.com/host/0B6GWd_dUUTT8WHpWSzZ5S0RqeUk/Pluginfree-Screen-Sharing.html) experiment works fine on following web-browsers:

| Browser        | Support           |
| ------------- |:-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Internet Explorer / IE | [Chrome Frame](http://www.google.com/chromeframe) |

#### License

[WebRTC plugin free screen sharing](https://googledrive.com/host/0B6GWd_dUUTT8WHpWSzZ5S0RqeUk/Pluginfree-Screen-Sharing.html) experiment is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
