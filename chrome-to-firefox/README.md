====
# Browser Support

This [WebRTC Experiment](https://googledrive.com/host/0B6GWd_dUUTT8dW5ycGVPT0V1bTg/chrome-to-firefox.html) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |:-------------:|
| Firefox | [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) |

## [Demo / Preview / Test / Experiment](https://googledrive.com/host/0B6GWd_dUUTT8dW5ycGVPT0V1bTg/chrome-to-firefox.html)

## Is it only chrome to firefox audio/video streaming?

Yes, it is Chrome-to-Firefox audio/video streaming (conferencing). It is a video conferencing experiment that works fine if [Google Chrome Beta](https://www.google.com/intl/en/chrome/browser/beta.html) is the 'OFFERER' and [Firefox Nightly](http://nightly.mozilla.org/) is the 'ANSWERER'. In contrast, if [Firefox Nightly](http://nightly.mozilla.org/) is the 'OFFERER' it fails.

You JUST need to link [RTCPeerConnection-v1.4.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/chrome-to-firefox/RTCPeerConnection-v1.4.js) file in your existence experiments and enjoy chrome to firefox streaming. Remember, RTCDataChannel is NOT yet interoperable with Firefox.

====
## License & Credits

Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503) - A link back is MUST! - All rights reserved!
