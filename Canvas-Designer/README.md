## [Canvas Designer](https://github.com/muaz-khan/Canvas-Designer) / [Demo](https://www.webrtc-experiment.com/Canvas-Designer/)

Note: Original Canvas-Drawing tool is hosted here: https://canvas-designer.appspot.com/

"Collaborative" [Canvas Designer](https://github.com/muaz-khan/Canvas-Designer) i.e. Canvas-Drawing tool allows you draw bezier/quadratic curves, rectangles, circles and lines. You can also set strokes, back/forth colors and much more.

This speciality of this drawing-tool is that, it generates Canvas2D code for you; so simply draw and get the code!

Also, you can collaborate your drawing with up to 15 users; and everything is synced from all users. So, if you draw a line and your friend-A draws quadratic curve and friend-B draws rectangle then everythign will be synced among all users!

## [Click to view Gif Presentation](https://cdn.webrtc-experiment.com/images/Canvas-Designer.gif)

## WebRTC?

[Canvas Designer](https://github.com/muaz-khan/Canvas-Designer) is using [RTCMultiConnection.js](http://www.RTCMultiConnection.org/) to setup realtime data connection. This allows adding realtime media connection features in less than 2-minutes!

E.g.

```javascript
// whilst doing collaboration, you can add any kind of media stream
// single or multiple, it doesn't matters who shares and how!!!
connection.addStream({ audio: true, video: true });
```

Read more here: http://www.rtcmulticonnection.org/docs/

## Links

1. https://www.webrtc-experiment.com/Canvas-Designer/
2. https://github.com/muaz-khan/Canvas-Designer
3. https://canvas-designer.appspot.com/

Original source-code was shared 2-years back, here: https://github.com/muaz-khan/Everything/tree/gh-pages/Canvas/Tools/Designer

There is a similar "tinny" tool, however it isn't yet supporting collaboration: https://canvature.appspot.com/

And WebRTC-Experiments! https://github.com/muaz-khan/WebRTC-Experiment

## How to use my own library or code?

Do two things:

1. Edit `share-drawings.js` to add your own WebRTC code.
2. Open `decorator.js` and scroll to line 338. This line is using `connection.send`. You simply need to replace it with your own code e.g. `webrtc_connection.sendData(..)`.

Now the tool is using your own WebRTC implementation!

## License

[Canvas Designer](https://github.com/muaz-khan/Canvas-Designer) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
