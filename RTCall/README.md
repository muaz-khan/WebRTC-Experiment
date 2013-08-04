#### [RTCall.js](https://www.webrtc-experiment.com/RTCall/) — A library for Browser-to-Browser audio-only calling

Now, **RTCMultiConnection-v1.4** and upper releases supports admin/guest features; so [`RTCMultiConnection.js`](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection) is preferred.

Why RTCall.js?

1. In your own site; as an admin; you may want to be auto-alerted for each new visitor i.e. customer.
2. You may want to make voice-only calls between admin and customers

The entire process is browser to browser.

=

#### First Step: Link the library

```html
<script src="https://www.webrtc-experiment.com/RTCall.js"></script>
```

=

#### Second Step: Start using it!

Remember: All lines are optional!

```javascript
call = new RTCall();
```

=

#### `onincomingcall`

`onincomingcall` fires each time if someone calls you:

```javascript
call.onincomingcall = function(caller) {
   call.receive(caller.receiverid);
};
```

=

#### `oncustomer`

`oncustomer` is fired only for `admin`:

```javascript
call.oncustomer = function(customer) {
   call.call(customer.callerid);
};
```

=

#### `onstream`

`onstream` returns remote media stream:

```javascript
call.onstream = function(e) {
   // e.stream   ---- remote media stream object
   // e.callerid ---- id of the remote person
   
   audio = e.audio;
   audio.play(); // "e.audio" object is paused by default
   document.documentElement.appendChild(audio);
};
```

=

#### `init`

initializing `RTCall` object:

```javascript
call.init();
```

=

#### call

Admin can call customers using their caller-ids. Remeber, customers caller-ids are always passed over `oncustomer` method:

```javascript
call.oncustomer = function(customer) {
   call.call(customer.callerid);
};
```

Customers can call the admin too; using admin's `caller-id`:

```javascript
call.call('admin-caller-id');
```

=

#### `receive`

`receiver-id` is always passed over `onincomingcall`:

```javascript
call.onincomingcall = function(caller) {
   call.receive(caller.receiverid);
};
```

=

#### `admin`

By default: `admin` is `false`:

```javascript
call.admin = true;
```

=

#### Demo

1. https://www.webrtc-experiment.com/RTCall/

=

#### Browser Support

[RTCall.js](https://www.webrtc-experiment.com/RTCall/) supports following browsers:

| Browser        | Support           |
| ------------- |:-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Android | [Chrome Beta](https://play.google.com/store/apps/details?id=com.chrome.beta&hl=en) |

=

#### License

[RTCall.js](https://www.webrtc-experiment.com/RTCall/) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
