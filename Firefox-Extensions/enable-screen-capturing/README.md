# [Firefox Extensions](https://github.com/muaz-khan/Firefox-Extensions)

> Enable screen capturing in Firefox for both localhost/127.0.0.1 and `https://www.webrtc-experiment.com` pages.

## Install from Firefox Addons Store

* [https://addons.mozilla.org/en-US/firefox/addon/enable-screen-capturing/](https://addons.mozilla.org/en-US/firefox/addon/enable-screen-capturing/)

## Simplest Demo

Try this demo after installing above addon:

* [https://www.webrtc-experiment.com/getScreenId/](https://www.webrtc-experiment.com/getScreenId/)

## Wanna Deploy it Yourself?

1. Open [`index.js`](https://github.com/muaz-khan/Firefox-Extensions/blob/master/enable-screen-capturing/index.js)
2. Go to line 7
3. Replace `arrayOfMyOwnDomains` array with your own list of domains

```javascript
// replace your own domains with below array
var arrayOfMyOwnDomains = ['webrtc-experiment.com', 'www.webrtc-experiment.com', 'localhost', '127.0.0.1'];
```

## License

[Firefox-Extensions](https://github.com/muaz-khan/Firefox-Extensions) are released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](http://www.MuazKhan.com/).
