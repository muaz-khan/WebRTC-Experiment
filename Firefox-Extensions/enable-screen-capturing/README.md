# Firefox doesn't need add-ons in order to do screen sharing, since Firefox 52 already. [More info](https://wiki.mozilla.org/Screensharing)

# This repository is discontinued from September 01, 2017.

----

# [Firefox Extensions](https://github.com/muaz-khan/Firefox-Extensions)

> Enable screen capturing in Firefox for both localhost/127.0.0.1 and `https://www.webrtc-experiment.com` pages.
>
> You have to deploy this addon on Firefox addons-store, yourselves.

## Install from Firefox Addons Store

* [https://addons.mozilla.org/en-US/firefox/addon/enable-screen-capturing/](https://addons.mozilla.org/en-US/firefox/addon/enable-screen-capturing/)

### Check if screen capturing is enabled for your domains:

```javascript
// ask addon to check if screen capturing enabled for specific domains
window.postMessage({
    checkIfScreenCapturingEnabled: true
}, "*");

// watch addon's response
// addon will return "isScreenCapturingEnabled=true|false"
window.addEventListener("message", function(event) {
    if (event.source !== window) return;

    var addonMessage = event.data;

    if(!addonMessage || typeof addonMessage.isScreenCapturingEnabled === 'undefined') return;

    if(addonMessage.isScreenCapturingEnabled === true) {
        alert(JSON.stringify(addonMessage.domains) + '\n are enabled for screen capturing.');
    }
    else {
        alert(JSON.stringify(addonMessage.domains) + '\n are NOT enabled for screen capturing.');
    }
}, false);
```

### Insights:

Your requests to addon: `checkIfScreenCapturingEnabled`: ask addon to check if screen is already enabled for specific domains.

Addon responses:

1. `isScreenCapturingEnabled` - Here `true` means domain is already enabled for specific domains.
2. `domains` - list of same domains that are enabled for screen capturing.

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

## How to Deploy?

1) Signup here: 

* https://addons.mozilla.org/en-US/firefox/users/register

2) Use unique-addon-name here: 

* https://github.com/muaz-khan/Firefox-Extensions/blob/master/enable-screen-capturing/package.json#L3 

3) Add your own domains here: 

* https://github.com/muaz-khan/Firefox-Extensions/blob/master/enable-screen-capturing/index.js#L7

4) Make XPI of the directory.

```
[sudo] npm install jpm --global

jpm run -b nightly 		# test in Firefox Nightly without making the XPI

jpm xpi					# it will create xpi file
```

5) Submit the XPI here: 

* https://addons.mozilla.org/en-US/developers/addon/submit/1

Follow all steps. Read them carefully. This is hard/tough step to follow. Select valid browsers. E.g. Firefox 38 to Firefox 45. And submit your addon for "review".

It will take 2-3 hours for a Mozilla AMO reviewer to review your addon. Then it will be available to public.

## License

[Firefox-Extensions](https://github.com/muaz-khan/Firefox-Extensions) are released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](http://www.MuazKhan.com/).
