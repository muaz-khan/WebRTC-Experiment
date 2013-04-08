#### WebRTC P2P Text Chat / [Demo](https://webrtc-experiment.appspot.com/chat-hangout/)

This WebRTC Experiment allows you share text messages among many peers.

It opens multiple peer connections to support group data broadcasting.

#### On room initiator's side

1. 10 peer connections will be opened
2. 10 sockets will be opened to exchange SDP/ICE

#### On chrome, how many RTP data ports will be opened

In 10 users data session; about 20 RTP data ports will be opened:

1. 10 RTP data ports for outband i.e. for outgoing data messages
2. 10 RTP data ports for inband i.e. for incoming data messages

Firefox opens 16 SCTP data ports for single data session.

It means that about 160 SCTP data ports will be opened on room initiator's side in 10 users data session.

#### On participants' side

Only 2 RTP data ports will be opened because participants are not connected with each other. They're connected directly with room initiator.

#### License

[WebRTC Experiments](https://webrtc-experiment.appspot.com/) are released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
