====
# Browser Support
[Experiments](https://webrtc-experiment.appspot.com) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |:-------------:|
| Firefox | [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) |
| Firefox | [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) |
| Google Chrome | [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) |

# [Experiments](https://webrtc-experiment.appspot.com)

| Experiment        | Description       |
| ------------- |:-------------:|
| [Video Conferencing](https://webrtc-experiment.appspot.com/video-conferencing/) | A many-to-many WebRTC "video-conferencing" experiment |
| [File Sharing](https://webrtc-experiment.appspot.com/file-broadcast/) | Broadcast files over many peers |
| [File Hangout](https://webrtc-experiment.appspot.com/file-hangout/) | Group File Sharing using RTCDataCannel APIs |
| [Chat Hangout](https://webrtc-experiment.appspot.com/chat-hangout/) |  Group chat using RTCDataChannel APIs |
| [Chat Broadcast](https://webrtc-experiment.appspot.com/chat/) | Broadcast your text message over many peers using RTCDataChannel APIs  |
| [Audio Broadcast](https://webrtc-experiment.appspot.com/audio-broadcast/) | Broadcast audio stream over unlimited peers |
| [Screen Sharing](https://webrtc-experiment.appspot.com/screen-broadcast/) | Broadcast your screen over unlimited peers. Requires Chrome Canary experimental tabCapture APIs |
| [Video Broadcast](https://webrtc-experiment.appspot.com/broadcast/) | Broadcast audio/video stream over unlimited peers |

====
## Don't worry about node.js, PHP, Java, Python or ASP.NET MVC!!

You can do everything in JavaScript without worrying about node.js or other server side platforms. Try to focus on JavaScript. "Throw node.js out of the door!" [Sorry]

====
## Are you a newbie or beginner wants to learn WebRTC?

There are up to dozens [documents/snippets/demos/experiments](https://webrtc-experiment.appspot.com/) that teaches you "how to broadcast streams, audio/video, data, files, screen, etc. in minutes!"

====
## A few documents for newbies and beginners

| Document        |
| ------------- |
| [WebRTC for Beginners: A getting stared guide!](https://webrtc-experiment.appspot.com/docs/webrtc-for-beginners.html) |
| [WebRTC for Newbies ](https://webrtc-experiment.appspot.com/docs/webrtc-for-newbies.html) |
| [How to use RTCPeerConnection.js?](https://webrtc-experiment.appspot.com/docs/how-to-use-rtcpeerconnection-js-v1.1.html) |
| [RTCDataChannel for Beginners](https://webrtc-experiment.appspot.com/docs/rtc-datachannel-for-beginners.html) |
| [How to use RTCDataChannel?](https://webrtc-experiment.appspot.com/docs/how-to-use-rtcdatachannel.html) - single code for both canary and nightly |
| [How to broadcast video using RTCWeb APIs?](https://webrtc-experiment.appspot.com/docs/how-to-broadcast-video-using-RTCWeb-APIs.html) |
| [How to share audio-only streams?](https://webrtc-experiment.appspot.com/docs/how-to-share-audio-only-streams.html) |
| [How to broadcast files using RTCDataChannel APIs?](https://webrtc-experiment.appspot.com/docs/how-file-broadcast-works.html) |
| [How to use Plugin-free calls in your own site?](https://webrtc-experiment.appspot.com/docs/how-to-use-plugin-free-calls.html) - JUST 3 lines of code! |

====
## Possibilities with RTCDataCannel APIs

* You can share huge data in minutes - For example, you can share up to 100MB file in "less than one minute" on slow internet connections (like 150KB/s i.e. 2MB DSL)
* In games, you can share coordinates over many streams in realtime
* Snap and Sync your webpage
* Screen sharing - you can take snapshot of the webpage or part of webpage and share in realtime over many streams!

**Note:** *Currently Mozilla Firefox Nightly opens 16 streams by default. You can increase this limit by passing third argument when calling: peerConnection.connectDataConnection(5001, 5000, 40)*

====
## Credits

* [Muaz Khan](http://github.com/muaz-khan)!

====
## License

Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503) - Feel free to use it in your own site!
