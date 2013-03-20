## WebRTC P2P Group File Sharing

It is a WebRTC **many-to-many** file sharing experiment.

This **WebRTC File Hangout** experiment allows you:

1. Share files in a group (many-to-many)
2. Unlimited data connections on Firefox

### How WebRTC group file sharing experiment works?

1. It shares the file directly over all connected data ports
2. By default **16 SCTP** ports/streams are opened/used by Firefox!

### Is this a P2P file distributing system?

Sure, it is a P2P file distribution using `RTCDataChannel` APIs.

### Is this a torrent like file distributing/sharing system?

This P2P group file sharing experiment works like this:

1. Multi-peers are opened to support multi-users
2. Multi data ports are opened in multi-directions
3. If `UserA` share file...file will be transferred asynchronously over all connected data ports.
4. All other users are connected directly to each other; like a hexagon or other many directional shape.

### Chrome and unreliable data connection...how it works?

In a simple one-to-one data session: chrome opens two **RTP** ports:

1. One RTP data port of outband
2. One RTP data port of inband

So many limitations in the moment; to resolve all those limitations; data/files are splitted in small chunks; and those chunks are transferred **step-by-step** after predefined time interval to make distribution consistent and reliable.

### How to use `Group File Sharing` in your own site?

**Just copy HTML/JS code in your site and that's all you need to do. Nothing to install! No requirements!**

### Browser Support

WebRTC [Group File Sharing](https://webrtc-experiment.appspot.com/file-hangout/) experiment works fine on following web-browsers:

| Browser        | Support           |
| ------------- |:-------------:|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Internet Explorer / IE | [Chrome Frame](http://www.google.com/chromeframe) |

### License

WebRTC [Group File Sharing](https://webrtc-experiment.appspot.com/file-hangout/) experiment is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
