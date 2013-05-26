#### [RTCall.js](https://webrtc-experiment.appspot.com/RTCall/) — A library for Browser-to-Browser audio-only calling

Why RTCall.js?

1. In your own site; as an admin; you may want to be auto-alerted for each new visitor i.e. customer.
2. You may want to make voice-only calls between admin and customers

The entire process is browser to browser.

----

#### First Step: Link the library

```html
<script src="https://webrtc-experiment.appspot.com/RTCall.js"></script>
```

#### Second Step: Start using it!

Remember: All lines are optional!

```javascript
call = new RTCall();

// "onincomingcall" fires each time if someone calls you
call.onincomingcall = function(caller) {
   call.receive(caller.receiverid);
};

// "oncustomer" is fired only for admin
// you can set admin like this:
// call.admin = true;
call.oncustomer = function(customer) {
   call.call(customer.callerid);
};

// "onstream" returns you remote media stream
call.onstream = function(e) {
   // e.stream   ---- remote media stream object
   // e.callerid ---- id of the remote person
   
   audio = e.audio;
   audio.play(); // "e.audio" object is paused by default
   document.documentElement.appendChild(audio);
};

// initializing "RTCall" object
call.init();

// customers can call "admin" using his caller-id
call.call('admin-caller-id');
```

----

#### Demo

1. https://webrtc-experiment.appspot.com/RTCall/

----

#### Browser Support

[RTCall.js](https://webrtc-experiment.appspot.com/RTCall/) supports following browsers:

| Browser        | Support           |
| ------------- |:-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Internet Explorer / IE | [Chrome Frame](http://www.google.com/chromeframe) |
| Android | [Chrome Beta](https://play.google.com/store/apps/details?id=com.chrome.beta&hl=en) |

----

#### License

[RTCall.js](https://webrtc-experiment.appspot.com/RTCall/) is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
