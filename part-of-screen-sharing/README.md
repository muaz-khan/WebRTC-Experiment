#### WebRTC [Part of Screen Sharing Demos](https://webrtc-experiment.appspot.com/#part-of-screen-sharing)

1. [Using RTCDataChannel](https://webrtc-experiment.appspot.com/part-of-screen-sharing/webrtc-data-channel/)
2. [Using Firebase](https://webrtc-experiment.appspot.com/part-of-screen-sharing/)
3. [A realtime chat using RTCDataChannel](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/realtime-chat/)
4. [A realtime chat using Firebase](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/realtime-chat/No-WebRTC-Chat.html)

#### How to use in your own site?

```html
<script src="https://webrtc-experiment.appspot.com/screenshot.js"></script>
```

```javascript
var divToShare = document.querySelector('div');
html2canvas(divToShare, {
    onrendered: function (canvas) {
        var screenshot = canvas.toDataURL();
        // image.src = screenshot;
        // context.drawImage(screenshot, x, y, width, height);
        // firebase.push(screenshot);
        // pubnub.send(screenshot);
        // socketio.send(screenshot);
        // signaler.send(screenshot);
        // window.open(screenshot);
    }
});

/*
 -----Note:
 Put above code in a function; use "requestAnimationFrame" to loop the function
 and post/transmit DataURL in realtime!

 -----what above code will do?
 Above code will take screenshot of the DIV or other HTML element and return you
 and image. You can preview image to render in IMG element or draw to Canvas2D.
 */
```

#### How.....why.....what.....?

1. Used `html2canvas` library to take screenshot of the entire webpage or part of webpage.
2. Sharing those screenshots using `RTCDataChannel APIs` or `Firebase`.
3. `Firefox` is preferred because Firefox uses `reliable` 16 `SCTP` streams by default; so it is realtime and superfast on Firefox!

**To share your custom part of screen**:

1. Open `index.html` file
2. Find `renderMe` object that is getting an element by id: `render-me`

....and that's all you need to do!

**Just copy HTML/JS code in your site and that's all you need to do. Nothing to install! No requirements!**

#### Browser Support

These WebRTC **Part of Screen Sharing** experiments works fine on following web-browsers:

| Browser        | Support           |
| ------------- |:-------------:|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) |
| Firefox | [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) |
| Firefox | [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) |

#### License

These WebRTC **Part of Screen Sharing** experiments are released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
