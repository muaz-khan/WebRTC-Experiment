# Chrome extension for WebRTC Screen Sharing

<a target="_blank" href="https://chrome.google.com/webstore/detail/webrtc-desktop-sharing/nkemblooioekjnpfekmjhpgkackcajhg"><img alt="WebRTC Screen Sharing" src="https://lh3.googleusercontent.com/Jpi56T9fBfBXJGsDJchpAvW-PvZrysL99GLibfUKMVon8mk0KnBZtZU3W08IbkeYIAgyRvz9Lg=w640-h400-e365" title="WebRTC Screen Sharing"></img></a>

## How to install?

<a target="_blank" href="https://chrome.google.com/webstore/detail/webrtc-desktop-sharing/nkemblooioekjnpfekmjhpgkackcajhg"><img alt="Install Dessktop Sharing Extension" src="https://raw.github.com/GoogleChrome/chrome-app-samples/master/tryitnowbutton_small.png" title="Click here to install this sample from the Chrome Web Store"></img></a>

* https://chrome.google.com/webstore/detail/webrtc-desktop-sharing/nkemblooioekjnpfekmjhpgkackcajhg

## How to view screen?

Try any of the below URL. Replace `your_room_id` with real room-id:

```
https://webrtcweb.com/screen?s=your_room_id
https://cdn.rawgit.com/muaz-khan/Chrome-Extensions/master/desktopCapture-p2p/index.html
```

## Developer Notes

1. Chrome extension can share your screen, tab, any application's window, camera, microphone and speakers.
2. Clicking extension icon will generate a unique random room URL. You can share that URL with multiple users and all of them can view your screen.
3. [RTCMultiConnection](https://github.com/muaz-khan/RTCMultiConnection) is a WebRTC library that is used for peer-to-peer WebRTC streaming.
4. PubNub is used as a signaling method for handshake. However you can use [any WebRTC signaing option](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md).
5. You can replace or include your own STUN+TURN servers in the [IceServersHandler.js](https://github.com/muaz-khan/Chrome-Extensions/blob/master/desktopCapture-p2p/IceServersHandler.js) file.
6. VP8 is currently default video codecs. However VP9 is recommended. You can always change codecs using options page.
7. [getStats](https://github.com/muaz-khan/getStats) is a WebRTC library that is used for bandwidth & codecs detection. This library is optional. You can always remove it.

## Before publishing it for your own business

> This step is optional. You can keep using `webrtcweb.com` URL as a screen viewer.

Open [desktop-capturing.js](https://github.com/muaz-khan/Chrome-Extensions/blob/master/desktopCapture-p2p/desktop-capturing.js) and find following line:

```javascript
var resultingURL = 'https://webrtcweb.com/screen?s=' + connection.sessionid;
```

Replace above line with your own server/website:

```javascript
var resultingURL = 'https://yourWebSite.com/index.html?s=' + connection.sessionid;
```

You can find `index.html` here:

* [desktopCapture-p2p/index.html](https://github.com/muaz-khan/Chrome-Extensions/blob/master/desktopCapture-p2p/index.html)

## How to publish it for your own business?

Make ZIP of the directory. Then navigate to [Chrome WebStore Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard) and click **Add New Item** blue button.

To learn more about how to publish a chrome extension in Google App Store:

* https://developer.chrome.com/webstore/publish

## For more information

For additional information, click [this link](https://github.com/muaz-khan/WebRTC-Experiment/blob/7cd04a81b30cdca2db159eb746e2714307640767/Chrome-Extensions/desktopCapture/README.md).

## It is Open-Sourced!

* https://github.com/muaz-khan/Chrome-Extensions/tree/master/desktopCapture-p2p

## License

[Chrome-Extensions](https://github.com/muaz-khan/Chrome-Extensions) are released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
