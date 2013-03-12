====
## WebRTC Part of Screen Sharing / [Demo](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/part-of-screen-sharing/)

====
## How to use in your own site?

```html
<script src="screenshot.js"></script>
<script>
var divToShare = document.getElementById('div-to-share');
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
</script>
```

Share part of screen; not the entire screen!

1. Sharing part of the screen using RTCDataChannel APIs!
2. Everything is synchronized in realtime.
3. It is a realtime text chat with a realtime preview!
4. You can see what your fellow is typing...in realtime!
5. Firefox [nightly](http://nightly.mozilla.org/) / [aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [stable](http://www.mozilla.org/en-US/firefox/new/) is preferred/recommended.
6. Works fine on Chrome [canary](https://www.google.com/intl/en/chrome/browser/canary.html) too.

====
## How realtime chat works?

1. Tick "Is Sync in Realtime" checkbox if you want to share text in realtime.
2. Otherwise, type number of milliseconds after to synchronize your state.
3. Tick "Is Pause Syncing" if you want to take rest.
4. Tick "Is Code" button if you want to share "code". So, coding fonts will be used in the output panel.

====
## How.....why.....what.....?

1. Used "html2canvas" library to take screenshot of the entire webpage or part of webpage.
2. Sharing those screenshots using RTCDataChannel APIs.
3. Firefox is preferred because Firefox uses 16 streams by default; so it is realtime and superfast on Firefox!
4. To share your custom part of screen; open "index.html" file; and find "renderMe" object that is getting an element by id: "render-me"....and that's all you need to do!

====
## Demos (for Part of Screen Sharing)

1. [Part of Screen Sharing](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/part-of-screen-sharing/)
2. [Realtime Chat](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/realtime-chat/)
3. [NowWebRTC Realtime Chat](https://googledrive.com/host/0B6GWd_dUUTT8RzVSRVU2MlIxcm8/realtime-chat/No-WebRTC-Chat.html)

**Just copy HTML code in your site and that's all you need to do. Nothing to install! No requirements!**

*Only one limitation: A link back to [Muaz Khan](http://github.com/muaz-khan)!*

====
## Cross Browser Support
[WebRTC Experiments](https://webrtc-experiment.appspot.com) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |:-------------:|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) |
| Firefox | [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) |
| Firefox | [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) |

====
## License & Credits

Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503) - A link back is MUST! - All rights reserved!
