[RTCMultiConnection](http://bit.ly/RTCMultiConnection) highly simplifies multi-user connectivity along with multi-session establishment. 

#### Write a `video conferencing` application using `RTCMultiConnection` / [Demo](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/videoconferencing.html)

```html
<script src="https://bit.ly/RTCMultiConnection-v1-0"></script>
```

```javascript
var rtcMultiConnection = new RTCMultiConnection({
    direction: Direction.ManyToMany,
    session: Session.AudioVideo,
    openSignalingChannel: function (config) {
        throw 'use your socket.io implementation here';
    },
    onRemoteStream: function (media) {},
    onLocalStream: function (media) {}
});
rtcMultiConnection.initSession();
```
For further demos and information; read [RTCMultiConnection Documentation](http://bit.ly/RTCMultiConnection).

#### Features

1. Share files of any size — directly
2. Share text messages of any length
3. Share any kind of data — directly
4. Open multi-streams in single session like audio/video + file sharing + text chat

#### RTCMultiConnection [Demos](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/) / [All-in-One Demo](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/)

1. [video conferencing](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/videoconferencing.html)
2. [audio conferencing](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/audioconferencing.html)
3. [video conferencing + file sharing + text chat](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/videoconferencing-plus-filesharing-plus-textchat.html)
4. [audio conferencing + file sharing + text chat](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/audioconferencing-plus-filesharing-plus-textchat.html)
5. [screen sharing](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/screen-sharing.html)
6. [screen sharing + file sharing + text chat](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/screensharing-plus-filesharing-plus-textchat.html)
7. [file sharing + text chat](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/filesharing-plus-textchat.html)
8. [one-to-one file sharing](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/one-to-one-filesharing.html)
9. [video broadcasting](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/video-broadcasting.html)
10. [video broadcasting + file sharing + text chat](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/video-broadcasting-plus-filesharing-plus-textchat.html)
11. [Manual Session Establishment](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/Manual-Session-Establishment.html)
12. [Join with/without camera](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/RTCMultiConnection/demos/join-with-or-without-camera.html)

#### Browser Support

| Browser        | Support           |
| ------------- |:-------------:|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Internet Explorer / IE | [Chrome Frame](http://www.google.com/chromeframe) |


#### License

[RTCMultiConnection](http://bit.ly/RTCMultiConnection) is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
