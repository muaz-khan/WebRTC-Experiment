* [File sharing/broadcasting/transferring using RTCDataChannel APIs](https://webrtc-experiment.appspot.com/file-broadcast/) - works fine on Chrome Canary and Firefox Nightly
* [Realtime chat using RTCDataChannel APIs: Text broadcasting privately or publicly](https://webrtc-experiment.appspot.com/chat/) - works fine on Chrome Canary and Firefox Nightly
* [Screen/Webpage sharing/broadcasting over unlimited peers](https://webrtc-experiment.appspot.com/screen-broadcast/) - works fine on Chrome Canary
* [Voice/Audio sharing/broadcasting over unlimited peers](https://webrtc-experiment.appspot.com/audio-broadcast/) - works fine on Chrome Canary
* [Audio+Video sharing/broadcasting over unlimited peers](https://webrtc-experiment.appspot.com/broadcast/) - works fine on Chrome 23 and upper all versions and releases

See list of all other WebRTC experiments [here](https://webrtc-experiment.appspot.com/).

## Are you a newbie or beginner to WebRTC?

There are [up to dozens](https://webrtc-experiment.appspot.com/) documents and snippets that allows you develop broadcasting type of experiments in minutes!

## Don't worry about node.js, PHP, Java, Python or ASP.NET MVC!!

You can do everything in JavaScript without worrying about node.js or other server side platforms. Try to focus on JavaScript. "Throw node.js out of the door!" [Sorry]

## A few documents for newbies and beginners

* [WebRTC for Beginners: A getting stared guide!](https://webrtc-experiment.appspot.com/docs/webrtc-for-beginners.html)
* [RTCDataChannel for Beginners](https://webrtc-experiment.appspot.com/docs/rtc-datachannel-for-beginners.html)
* [How to use RTCDataChannel?](https://webrtc-experiment.appspot.com/docs/how-to-use-rtcdatachannel.html) - single code for both canary and nightly
* [How to broadcast video using RTCWeb APIs?](https://webrtc-experiment.appspot.com/docs/how-to-broadcast-video-using-RTCWeb-APIs.html)
* [How to share audio-only streams?](https://webrtc-experiment.appspot.com/docs/how-to-share-audio-only-streams.html)
* [How to broadcast files using RTCDataChannel APIs?](https://webrtc-experiment.appspot.com/docs/how-file-broadcast-works.html)
* [How to use Plugin-free calls in your own site?](https://webrtc-experiment.appspot.com/docs/how-to-use-plugin-free-calls.html) - JUST 3 lines of code!

## Possibilities with RTCDataCannel APIs

* You can share huge data in minutes - For example, you can share up to 100MB file in "less than one minute" on slow internet connections (like 150KB/s i.e. 2MB DSL)
* In games, you can share coordinates over many streams in realtime
* Snap and Sync your webpage
* Screen sharing - you can take snapshot of the webpage or part of webpage and share in realtime over many streams!

Note: Currently Mozilla Firefox Nightly opens 16 streams by default. You can increase this limit by passing third argument when calling: peerConnection.connectDataConnection(5001, 5000, 40)

## Browsers Support

* Google Chrome 23 and upper all
* [Google Chrome Canary](https://www.google.com/intl/en/chrome/browser/canary.html) - for RTCDataCannel APIs (Chat and File Sharing/Broadcasting)
* [Firefox Nightly](http://nightly.mozilla.org/) - for RTCDataCannel APIs (Chat and File Sharing/Broadcasting)

## Credits

* [Muaz Khan](http://github.com/muaz-khan)!

## License
Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503) - Feel free to use it in your own site!