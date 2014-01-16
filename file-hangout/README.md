#### WebRTC P2P Group File Sharing / [Demo](https://www.webrtc-experiment.com/file-hangout/)

This WebRTC Experiment allows you share file of any size among group of people.

It opens multiple peer connections to support group data connectivity.

In 10 users data session; 10 peer connections will be opened on each user's side.

Each peer connection will open 2 RTP data ports on chrome.

1. One **outband** RTP data port to send text messages
2. One **inband** RTP data port to receive text messages

So, `20` RTP data ports will be opened in `10` users data session. **Embarrassing...?!!**

On Firefox, by default 16 SCTP data ports will be opened for single peer. So, about 160 SCTP data ports will be opened in 10 users data session. Too awkward!

=

#### Multiple peer connections.....is it a solution?

No, not at all. It is just a **temporary** workaround.

You're strongly suggested to use **peer-to-server** model instead of opening multi-peers.

=

#### How peer-to-server model works?

In this model, server plays a role of another peer. Server receives **offer-sdp** sent from browser-oriented peer; dynamically generates **answer-sdp** and returns back to appropriate peer.

Server must be intelligent enough to generate right **answer-sdp**.

Remember, WebRTC peer object will send **DTLS/SRTP** (RTP/RTCP) packets maybe as **ByteStream**. Target media server must be able to capture/understand those packets.

Server can manipulate messages or data coming from 10 or more unique data ports and transfer over single data port!

=

A few 3rd party media servers:

1. Telepresence (MCU)
2. BigBlueButton
3. WebRTC2Sip
4. Asterisk
5. FreeSwitch
6. NGVX

You can search and find hundred of RTP/DTLS-capable third party media servers on the Web!

To install a media server:

1. You need to buy VPS hosting
2. You can ask for CentOS6-x64 installation; or otherwise, Ubuntu/etc.
3. You need to install all dependencies (extrnal modules) using command prompt (PuTTy on windows)

You can find media servers intallation documents/tutorials here: 

https://www.webrtc-experiment.com/docs/

=

#### ideas!!!

Room initiator opens a peer-to-server data connection. 10 room participants also open peer-to-server data connection in the same room.

Room initiator and participants are not connected directly with each other.

If room initiator want to send text message, data or file over all those 10 participants; it will send it to server.

Server will send that data message over all 10 participants' data ports.

So, original idea is: **user to server to all other peers**.

It is a reality that we will never be able to deny that WebRTC was formed to work entirely client side.

But dear friend! You can never deny that server is mandatory in corporate level applications.

To support thousands of peers connectivity; you need a media server.

Media servers are usually used as **transcoders**.

Transcoding plays important role to support wide devices and platforms.

You need a transcoder to integrate/interoperate VP8 and H.264 for video.

Obviously, media servers can record entire session using your preferred methods.

Sending audio RTP streams over PSTN networks is easy but receiving incoming audio isn't!

Because DTMF travels over a separate channel.

Your media server must be smart enough to capture those DTMF streams.

**Kamailio** media server is designed to capture those DTMF channels, though.

It would be really interesting if we will be able to open data session between WebRTC client and PSTN networks.

So, we maybe able to send data/text and files over majority of mobile devices.

Though, it seems not possible! Because their infrastructure is different.

=

For signaling; please check following page:

https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md

Remember, you can use any signaling implementation exists out there without modifying any single line! Just skip below code and open [above link](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md)!

=

#### Browser Support

WebRTC [Group File Sharing](https://www.webrtc-experiment.com/file-hangout/) experiment works fine on following web-browsers:

| Browser        | Support           |
| ------------- |-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Android | [Chrome Beta](https://play.google.com/store/apps/details?id=com.chrome.beta&hl=en) |

=

#### License

WebRTC [Group File Sharing](https://www.webrtc-experiment.com/file-hangout/) experiment is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
