**Just copy HTML code in your site and that's all you need to do. Nothing to install! No requirements!**

*Only one limitation: A link back to [Muaz Khan](http://github.com/muaz-khan)!*

====
# Browser Support

This [WebRTC Experiment](https://webrtc-experiment.appspot.com/calls/) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |:-------------:|
| Firefox | [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) |
| Firefox | [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) |
| Google Chrome | [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) |
| Google Chrome | [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) |
| Google Chrome | [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |

--

[How to share audio-only streams](https://webrtc-experiment.appspot.com/docs/how-to-share-audio-only-streams.html) ? Early workaround for Chrome Canary!

```javascript
audio.src = webkitURL.createObjectURL(event.stream);
audio.addEventListener('play', function () {
	this.muted = false;
	this.volume = 1;
}, false);

audio.play();
```

## How to use plugin-free calls in your own site?

Add an image or button and set its id to "call" ( User will click this button to call you ) :


```html
<button id="call">Make a test call!</button>
```

To see list of callers; add an <ol> or <ul> element and set its id to "callers":

```html
<ol id="callers"></ol>
```

And last task: the script you need to link:

```html
<script src="http://bit.ly/plugin-free-calls"> </script>
```

====
## License & Credits

Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503) - A link back is MUST! - All rights reserved!
