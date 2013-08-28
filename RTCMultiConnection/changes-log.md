### [RTCMultiConnection](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection) Changes Log

This document explains RTCMultiConnection versions log.

=

##### A few points to note

1. [RTCMultiConnection](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection) is upgraded from [RTCDataConnection](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCDataConnection) at March 25, 2013
2. The main idea behind RTCMultiConnection was to support all RTCWeb API features in one place

=

##### v1.4 / released in July 06, 2013

1. Multiple concurrent files transmission / [see commit](https://github.com/muaz-khan/WebRTC-Experiment/commit/a0f9b72654b3ba7c5232968d9850e35fb770bbbb#RTCMultiConnection)
2. Advance renegotiation
3. Admin/Guest features; useful in realtime chatting rooms where direct invitation is mandatory / [see commit](https://github.com/muaz-khan/WebRTC-Experiment/commit/572ac336357b8530d779529e109197ea7b8f6f8e#RTCMultiConnection)
4. Multi-streams attachment i.e. audio+video+data+screen / [see commit](https://github.com/muaz-khan/WebRTC-Experiment/commit/075eaa978399a2309b664164e875187ec7b6444a#RTCMultiConnection)
5. Mute/UnMute/Stop of individual, all at once; all remote or all local streams
6. onstreamended added; a better method comparing "onleave"
7. maxParticipantsAllowed added
8. media/sdp constraints / [see commit](https://github.com/muaz-khan/WebRTC-Experiment/commit/8d76c0cb5be4d8df17c6603220c091b8ea2ff0f6#RTCMultiConnection)
9. Session re-initiation / [see commit](https://github.com/muaz-khan/WebRTC-Experiment/commit/a0f9b72654b3ba7c5232968d9850e35fb770bbbb#RTCMultiConnection)
10. removeStream added to allow removal of existing media streams
11. disableDtlsSrtp added to fix renegotiation process which fails on chrome when DTLS/SRTP enabled
12. autoSaveToDisk added to allow customization of file-sharing
13. file-sharing extended and fixed; no crash for large files anymore!
14. renegotiation for chrome M29 and upper
15. sctp/reliable data channels support for chrome (unreliable is still default)
16. enable/disable ice candidates (host/relfexive/relay)
17. enable/disable bandwidth sdp parameters (by default, enabled)
18. noise/echo stepped down; a simple/lazy workaround

=

##### v1.3 / released in May 19, 2013

1. Syntax changed; a few breaking changes comparing v1.2 / [see commit](https://github.com/muaz-khan/WebRTC-Experiment/commit/ac368557ce857dad1fbcf70aa58813d50cec6047#RTCMultiConnection)
2. Simple renegotiation
3. Mute/UnMute of individual streams
4. Auto-session establishment feature removed
5. Application specific bandwidth (b=AS) / [see commit](https://github.com/muaz-khan/WebRTC-Experiment/commit/6df6a5507268c84b91fe8445f0b9ef1f5781b687#RTCMultiConnection) and [commit](https://github.com/muaz-khan/WebRTC-Experiment/commit/b38a22834593cfc02893d320500dfb609f519580#RTCMultiConnection)
6. Direct Messages
7. New TURN format added / [see commit](https://github.com/muaz-khan/WebRTC-Experiment/commit/c0688f9eabfee4113150f3d362f2b3a2aa5c2895#RTCMultiConnection) / [IETF Draft](http://tools.ietf.org/html/draft-uberti-rtcweb-turn-rest-00)
8. Compatible to [socket.io over node.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/socketio-over-nodejs) / [see commit](https://github.com/muaz-khan/WebRTC-Experiment/commit/b2e7789bcb79a4248090081750e26c984a76d0b0#RTCMultiConnection)

=

##### v1.2 / released in April 20, 2013

1. Multi-session establishment
2. Auto-session establishment
3. Manual-session establishment
4. A little bit clear session/direction values e.g. `connection.session='audio + video and data'`
5. Users ejection, rejection and presence detection / [see commit](https://github.com/muaz-khan/WebRTC-Experiment/commit/305dd27af73c9219183f78120e8ebbb8443efb1e#RTCMultiConnection)
6. Keep session active all the time; event if initiator leaves / [see commit](https://github.com/muaz-khan/WebRTC-Experiment/commit/bd8ae0f5529e7a3900ef5ccac61f1364390be6b3#RTCMultiConnection)
7. Custom data i.e. extra data transmission
8. Audio-only streaming fixed / [see commit](https://github.com/muaz-khan/WebRTC-Experiment/commit/a4a6c3589e341617767213703683f1dba6c7548e#RTCMultiConnection)
9. Custom Handlers for server i.e. transmitRoomOnce

=

##### v1.1 / released in March 25, 2013

1. Multiple sessions & directions / [see commit](https://github.com/muaz-khan/WebRTC-Experiment/commit/017431280099e892744a6300ea866e7324f5e4c2#RTCMultiConnection)
2. File, data and text sharing (of any size & length)
3. Chrome/Firefox interoperability
4. Firefox's [new DataChannel syntax](https://github.com/muaz-khan/WebRTC-Experiment/wiki/WebRTC-DataChannel-and-Firefox#points) implemented / [see commit](https://github.com/muaz-khan/WebRTC-Experiment/commit/7bad719345814c7f832fad59abf31642e096b276#RTCMultiConnection)

=

##### License

[RTCMultiConnection.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
