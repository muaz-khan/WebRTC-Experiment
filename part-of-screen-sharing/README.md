#### [WebRTC](https://www.webrtc-experiment.com/) [Part of Screen Sharing Demos](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/part-of-screen-sharing) / [Demos](https://www.webrtc-experiment.com/part-of-screen-sharing/)

Another realtime/p2p working demo: 

* https://www.webrtc-experiment.com/RTCMultiConnection/RTCMultiConnection.sharePartOfScreen.html

Files:

* [screenshot-dev.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/part-of-screen-sharing/screenshot-dev.js) — developers version
* [screenshot.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/part-of-screen-sharing/screenshot.js) — minified

```html
<script src="//cdn.webrtc-experiment.com/screenshot.js"></script>

<!-- or Developers version -->
<script src="//cdn.webrtc-experiment.com/screenshot-dev.js"></script>
```

Remember, `grabMouse` is used by default. You need to make it `false` to make sure your resulting screenshot has no cursor icon.

```javascript
var divToShare = document.querySelector('div');
html2canvas(divToShare, {
    grabMouse: false,  //---- if you don't want to take mouse icon
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

The script allows you to take "screenshots" of webpages or parts of it, directly on the users browser. The screenshot is based on the DOM and as such may not be 100% accurate to the real representation as it does not make an actual screenshot, but builds the screenshot based on the information available on the page.

1. [Using RTCDataChannel](https://www.webrtc-experiment.com/part-of-screen-sharing/webrtc-data-channel/)
2. [Using Firebase](https://www.webrtc-experiment.com/part-of-screen-sharing/firebase/)
3. [A realtime chat using RTCDataChannel](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/realtime-chat/)
4. [A realtime chat using Firebase](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/realtime-chat/No-WebRTC-Chat.html)
5. [RTCMultiConnection.js uses Part of Screen sharing API](http://www.rtcmulticonnection.org/docs/onpartofscreen/)

=

#### How.....why.....what.....?

1. Used `html2canvas` library to take screenshot of the entire webpage or part of webpage.
2. Sharing those screenshots using `RTCDataChannel APIs` (SCTP or RTP) or `Firebase`.

**To share your custom part of screen**:

1. Open `index.html` file
2. Find `renderMe` object that is getting an element by id: `render-me`

....and that's all you need to do!

=

#### Browser Support

via: https://github.com/niklasvh/html2canvas#browser-compatibility

* Firefox 3.5+
* Google Chrome
* Opera 12+
* IE9+
* Safari 6+

=

#### License

These WebRTC [Part of Screen Sharing](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/part-of-screen-sharing) experiments are released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
