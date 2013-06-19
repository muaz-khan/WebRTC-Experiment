#### WebRTC One-to-Many audio sharing/broadcasting / [Demo](https://webrtc-experiment.appspot.com/audio-broadcast/)

It is old one-to-many WebRTC audio-broadcasting Experiment. 

Try latest [one-to-many audio broadcasting](https://webrtc-experiment.appspot.com/one-to-many-audio-broadcasting/) experiment.

If 10 users join your broadcasted room, **20 RTP ports** will be opened on your browser:

1. 10 RTP ports for **outgoing** audio stream
2. 10 RTP ports for **incoming** audio stream

----

#### Difference between one-way broadcasting and simple broadcasting

For 10 users session, maximum 10 RTP ports for outgoing audio stream will be opened.

On each participant's side; only one **incoming** RTP port will be opened.

Unlike one-way broadcasting; simple broadcasting experiment opens both outgoing as well as incoming RTP ports for each participant.

----

#### Browser Support 

This [WebRTC Audio Broadcasting Experiment](https://webrtc-experiment.appspot.com/audio-broadcast/) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Android | [Chrome Beta](https://play.google.com/store/apps/details?id=com.chrome.beta&hl=en) |

----

#### License

WebRTC [Audio Broadcasting Experiment](https://webrtc-experiment.appspot.com/audio-broadcast/) is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
