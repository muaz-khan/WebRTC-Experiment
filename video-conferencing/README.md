## WebRTC Group video sharing / [Demo](https://webrtc-experiment.appspot.com/video-conferencing/)

This is a `many-to-many` video sharing experiment.

## How `video conferencing` Works?

In simple words, `multi-peers` and `sockets` are opened to make it work!

For 10 people sharing videos in a group:

1. Creating 10 `unique` peer connections
2. Opening 10 unique `sockets` to exchange SDP/ICE

For your information; in One-to-One video session; 4 RTP streams/ports get open:

1. One RTP port for `outgoing video`
2. One RTP port for `outgoing audio`
3. One RTP port for `incoming video`
4. One RTP port for `incoming audio`

So, for 10 peers sharing video in a group; `40 RTP` ports get open. Which causes:

1. Blurry video experience
2. Unclear voice
3. Bandwidth issues / slow streaming

The best solution is to use a `middle media server` like `asterisk` to broadcast your camera stream. 

## How to use `video conferencing` in your own site?

**Just copy HTML/JS code in your site and that's all you need to do. Nothing to install! No requirements!**

====
## Browser Support

This [WebRTC Video Conferencing](https://webrtc-experiment.appspot.com/video-conferencing/) experiment works fine on following web-browsers:

| Browser        | Support           |
| ------------- |:-------------:|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Internet Explorer / IE | [Chrome Frame](http://www.google.com/chromeframe) |

====
## License

[WebRTC Video Conferencing](https://webrtc-experiment.appspot.com/video-conferencing/) is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
