# Record Screen - Chrome Extension

[RecordRTC](https://github.com/muaz-khan/RecordRTC) is used to record entire screen or record any application screen.

### Features

1. Record Entire Screen
2. Record Your Microphone along with Entire Screen
3. Record all microphones on a tab, along with tab's screen (this feature allows you record entire WebRTC-conference, all videos, all audios, dashboard, etc.)
4. You can record any video from any HTML5 webiste. For example, you can record `youtube.com` video,s `dailymotion.com` videos, you can record `video.js` HSL/DASH live streaming videos, etc.
5. You can record any HTML5 Canvas 2D `<canvas>` from any webpage. `<iframe>` is NOT allowed, though.

Version `2.7` and newer supports `right-click` context-menus as well.

You can right click on any HTML5 video and record it (both audio and video tracks).

10 minutes should be considered max-recording limit. However this chrome-extension supports more!

YouTube videos:

1. https://www.youtube.com/watch?v=30Be3gmYHw4 (record any HTML5 video)
2. https://www.youtube.com/watch?v=4oEDT6U1E8o (record screen)
3. https://www.youtube.com/watch?v=vFYZ4EICMrc (record microphone+screen)

| Extension Name        | Source Code           | Google App Store |
| ------------- |-------------|-------------|
| Screen Recording | [ github/screen-recording ](https://github.com/muaz-khan/Chrome-Extensions/tree/master/screen-recording) | [![Install Chrome Extension](https://raw.github.com/GoogleChrome/chrome-app-samples/master/tryitnowbutton_small.png)](https://chrome.google.com/webstore/detail/recordrtc/ndcljioonkecdnaaihodjgiliohngojp) |

* https://chrome.google.com/webstore/detail/recordrtc/ndcljioonkecdnaaihodjgiliohngojp

1.  Audio+Tab recording means voice or audio that is being played on selected tab. It can be a youtube page, an `<audio>` player or whatever. So it is NOT microphone audio; it is your tab's audio.
2. "Enable Microphone" feature works for any screen. You can enable microphone and record your own voice along with full screen or screen of any application.

#### Note

"Enable Microphone" feature requires an HTTPs page where you can click the extension icon.

You simply need to open `https://google.com` or `https://rtcxp.com` or any HTTPs page, and then click the chrome extension icon.

You need to keep above page opened during recording. You can minimize or hide above page however it MUST kept opened during recording.

## Resolutions

Currently this chrome extension supports following resolutions:

| Resolution Name   | Resolution Width/Height   | Aspect-Ratio  |
| -------------     |-------------              |-------------  |
| Default           | 29999  x 8640             | 1.77 (16:9)   |
| 4K UHD            | 3840   x 2160             | 1.77 (16:9)   |
| WQXGA             | 2560   x 1600             | 1.6  (16:10)  |
| WQHD              | 2560   x 1440             | 1.77 (16:9)   |
| WUXGA             | 1920   x 1200             | 1.77 (16:9)   |
| Full HD           | 1920   x 1080             | 1.77 (16:9)   |
| WSXGA+            | 1680   x 1050             | 1.6  (16:10)  |
| UXGA              | 1600   x 1200             | 1.3  (4:3)    |
| HD+               | 1600   x 900              | 1.77 (16:9)   |
| WGGA+             | 1440   x 900              | 1.6  (16:10)  |
| HD                | 1360   x 768              | 1.77 (~16:9)  |
| SXGA              | 1280   x 1024             | 1.25 (5:4)    |
| XGA+              | 1152   x 864              | 1.77 (16:9)   |
| XGA               | 1024   x 768              | 1.3  (4:3)    |
| SVGA              | 800    x 600              | 1.3  (4:3)    |
| 720p              | 1280   x 720              | 1.77 (16:9)   |
| 360p              | 640    x 360              | 1.77 (16:9)   |

## License

[Chrome-Extensions](https://github.com/muaz-khan/Chrome-Extensions) are released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](http://www.MuazKhan.com/).
