#### WebRTC P2P Group Text Chat / [Demo](https://webrtc-experiment.appspot.com/chat-hangout/)

This WebRTC Experiment allows you share text messages among group of people.

It opens multiple peer connections to support group data connectivity.

In 10 users data session; 10 peer connections will be opened on each user's side.

Each peer connection will open 2 RTP data ports on chrome.

1. One **outband** RTP data port to send text messages
2. One **inband** RTP data port to receive text messages

So, `20` RTP data ports will be opened in `10` users data session. **Embarrassing...?!!**

On Firefox, by default 16 SCTP data ports will be opened for single peer. So, about 160 SCTP data ports will be opened in 10 users data session. Too awkward!

----

#### Multiple peer connections.....is it a solution?

No, not at all. It is just a **temporary** workaround.

You're strongly suggested to use **peer-to-server** model instead of opening multi-peers.

----

#### How peer-to-server model works?

In this model, server plays a role of another peer. Server receives **offer-sdp** sent from browser-oriented peer; dynamically generates **answer-sdp** and returns back to appropriate peer.

Server must be intelligent enough to generate right **answer-sdp**.

Remember, WebRTC peer object will send **DTLS/SRTP** packets maybe as **ByteStream**. Target media server must be able to capture/understand those packets.

Server can manipulate messages or data coming from 10 or more unique data ports and transfer over single data port!

----

#### Browser Support

WebRTC [Group Text Chat](https://webrtc-experiment.appspot.com/chat-hangout/) experiment works fine on following web-browsers:

| Browser        | Support           |
| ------------- |-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Android | [Chrome Beta](https://play.google.com/store/apps/details?id=com.chrome.beta&hl=en) |

----

#### License

WebRTC [Group Text Chat](https://webrtc-experiment.appspot.com/chat-hangout/) experiment is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
