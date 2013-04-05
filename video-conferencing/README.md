## WebRTC Group video sharing / [Demo](https://webrtc-experiment.appspot.com/video-conferencing/)

This is a `many-to-many` video sharing experiment.

## How `video conferencing` Works?

In simple words, `multi-peers` and `sockets` are opened to make it work!

For 10 people sharing videos in a group:

1. Creating 10 `unique` peer connections
2. Opening 10 unique `sockets` to exchange SDP/ICE

For your information; in One-to-One video session; 4 RTP streams/ports get open:

1. One RTP port for **outgoing video**
2. One RTP port for **outgoing audio**
3. One RTP port for **incoming video**
4. One RTP port for **incoming audio**

So, for 10 peers sharing video in a group; `40 RTP` ports get open. Which causes:

1. Blurry video experience
2. Unclear voice
3. Bandwidth issues / slow streaming

The best solution is to use a **middle media server** like **asterisk** or **kamailio** to broadcast your camera stream. 

To overcome burden and to deliver HD stream over thousands of peers; we need a media server that should **broadcast** stream coming from room owner's side.

Process should be like this:

1. Conferencing **initiator** opens **peer-to-server** connection
2. On successful handshake; media server starts broadcasting **remote stream** over all other thousands of peers.

It means that those peers are not connected directly with **room initiator**.

But, this is **video broadcasting**; it is not **video conferencing**.

In video-conferencing, each peer connects directly with all others.

To make a **media server** work with video-conferencing also to just open only-one peer connection for each user; I've following assumptions:

1. Room initiator opens **peer-to-server** connection
2. Server gets **remote stream** from room initiator
3. A participant opens **peer-to-server** connect
4. Server gets **remote stream** from that participant
5. Server sends **remote stream** coming from participant toward **room iniator**
6. Server also sends **remote stream** coming from room-initiator toward **participant**
7. Another participant opens **peer-to-server** connection...and process continues.

Media server should mix all video streams; and stream it over single RTP port.

If 10 room participants are sending video streams; server should mix them to generate a single media stream; then send that stream over single **incoming** RTP port opened between server and **room initiator**.

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
