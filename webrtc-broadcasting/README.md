#### WebRTC One-Way video sharing/broadcasting / [Demo](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/webrtc-broadcasting/)

Participants can view your broadcasted video **anonymously**. They can also listen you without allowing access to their own microphone!

This experiment is actually a **one-way** audio/video/screen streaming.

You can:

1. Share your screen in one-way over many peers
2. Share you camera in one-way over many peers
3. Share/transmit your voice in one-way over many peers

#### How WebRTC One-Way Broadcasting Works?

It is a **one-to-many** audio/video/screen sharing experiment. However, only room initiator will be asked to allow access to camera/microphone because his media stream will be shared in one-way over all connected peers.

It means that, if 10 people are watching your one-way broadcasted video stream; on your system:

1. 10 unique peer connections are opened
2. Same **LocalMediaStream** is attached over all those **10 peers**

Behind the scene:

1. 10 unique RTP ports are opened for **outgoing local audio stream**
2. 10 unique RTP ports are opened for **outgoing local video stream**

So, total **20 RTP ports** are opened on your system to make it work!

Also, **10 unique sockets** are opened to exchange SDP/ICE!

Remember, there is **no incoming RTP port** is opened on your system! **Because it is one-way streaming**!

For users who are watching your video stream anonymously; **2 incoming RTP** ports are opened on each user's side:

1. One RTP port for **incoming remote audio stream**
2. One RTP port for **incoming remote video stream**

Again, because it is one-way streaming; **no outgoing RTP ports** will be opened on room participants' side.

#### Browser Support

This [WebRTC One-Way Broadcasting](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/webrtc-broadcasting/) experiment works fine on following web-browsers:

| Browser        | Support           |
| ------------- |:-------------:|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Internet Explorer / IE | [Chrome Frame](http://www.google.com/chromeframe) |

#### License

[WebRTC One-Way Broadcasting](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/webrtc-broadcasting/) experiment is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
