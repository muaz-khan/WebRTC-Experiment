# [Firefox Extensions](https://github.com/muaz-khan/Firefox-Extensions)

> Enable screen capturing in Firefox for both localhost/127.0.0.1 and `https://www.webrtc-experiment.com` pages.

## Install from Firefox Addons Store

* [https://addons.mozilla.org/en-US/firefox/addon/enable-screen-capturing/](https://addons.mozilla.org/en-US/firefox/addon/enable-screen-capturing/)

## How to reuse same addon for your own domains?

> Means that, you **don't need to publish your own addon**, you can reuse above link in your own domains/applications!

## `FirefoxScreenAddon.js`

`FirefoxScreenAddon.js` file exposes `FirefoxScreenAddon` function; which can be used on any webpage, as following:

```javascript
// to check if screen capturing is enabled for your domains
FirefoxScreenAddon.checkIfScreenCapturingEnabled(['yourdomain.com'], function(response) {
    if (response.isScreenCapturingEnabled) {
        alert('Yep. Screen capturing is enabled for: ' + response.domains.join(','));
    } else alert('Nope. Screen capturing is NOT enabled for: ' + response.domains.join(','));
});

// to ask addon to enable screen for your domains
FirefoxScreenAddon.enableScreenCapturing(['yourdomain.com'], function(response) {
    if (response.enabledScreenCapturing) {
        alert('Yep. Screen capturing is enabled for: ' + response.domains.join(','));
    } else alert('Failed: ' + response.reason);
});
```

If you don't want to use `FirefoxScreenAddon.js` file:

```javascript
// request addon to enable screen capturing for your domains
window.postMessage({
	enableScreenCapturing: true,
	domains: ["www.yourdomain.com", "yourdomain.com"]
}, "*");

// watch addon's response
// addon will return "enabledScreenCapturing=true" for success
// else "enabledScreenCapturing=false" for failure (i.e. user rejection)
window.addEventListener("message", function(event) {
	var addonMessage = event.data;

	if(!addonMessage || typeof addonMessage.enabledScreenCapturing === 'undefined') return;

    if(addonMessage.enabledScreenCapturing === true) {
    	alert(JSON.stringify(addonMessage.domains) + '\n are enabled for screen capturing.');
    }
    else {
    	// reason === 'user-rejected'
    	alert(addonMessage.reason);
    }
}, false);
```

**Check if screen capturing is enabled for your domains:**

```javascript
// ask addon to check if screen capturing enabled for specific domains
window.postMessage({
    checkIfScreenCapturingEnabled: true,
    domains: ["www.yourdomain.com", "yourdomain.com"]
}, "*");

// watch addon's response
// addon will return "isScreenCapturingEnabled=true|false"
window.addEventListener("message", function(event) {
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

**Insights:**

Your requests to addon:

1. `enableScreenCapturing` - ask addon to enable screen for specific domains.
2. `checkIfScreenCapturingEnabled` - ask addon to check if screen is already enabled for specific domains.
3. `domains` - pass array of domains

Addon responses:

1. `enabledScreenCapturing` - addon said: successfully enabled screen for specific domains.
2. `isScreenCapturingEnabled` - Here `true` means domain is already enabled for specific domains.
3. `reason` - if addon failed to enable screen for specific domains.
4. `domains` - list of same domains that you passed to addon.

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

It will take 2-3 hours for a Mozilla guy to review your addon. Then it will be available to public.

## License

[Firefox-Extensions](https://github.com/muaz-khan/Firefox-Extensions) are released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](http://www.MuazKhan.com/).
