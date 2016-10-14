# Getting Started guide for RTCMultiConnection

> This document explains how to getting-started with RTCMultiConnection.

# Copy any HTML demo file

Copy any demo source from this page:

* https://rtcmulticonnection.herokuapp.com/

Now search for `socket.io.js` file. You will find this:

```html
<script src="/socket.io/socket.io.js"></script>
```

Replace above line with this one:

```html
<script src="https://cdn.webrtc-experiment.com:443/socket.io.js"></script>
```

Last step is: search for `connection.socketURL`. You will find these two lines:

```javascript
connection.socketURL = '/';
// connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
```

Second line is commented. Simply remove `//` from the beginning of second line. Or in simple words: Uncomment second line:

```javascript
connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
```

Now you are DONE. Congrats!!

Now try your HTML source on any HTTPs page. Remember HTTPs is required.

You can use `jsfiddle.net` for testing purpose.


# Getting Started from Scratch

First of all, add these two lines:

```html
<script src="https://cdn.webrtc-experiment.com:443/rmc3.min.js"></script>
<script src="https://cdn.webrtc-experiment.com:443/socket.io.js"></script>
```

Now add two buttons:

```html
<button id="btn-open-room">Open Room</button>
<button id="btn-join-room">Join Room</button><hr>
```

Now add this javascript (somewhere on bottom of your page):

```javascript
var connection = new RTCMultiConnection();

// this line is VERY_important
connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

// all below lines are optional; however recommended.

connection.session = {
    audio: true,
    video: true
};

connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
};

connection.onstream = function(event) {
    document.body.appendChild( event.mediaElement );
};
```

Last step is, add click-handlers for above two buttons:

```javascript
var predefinedRoomId = 'YOUR_Name';

document.getElementById('btn-open-room').onclick = function() {
    this.disabled = true;
    connection.open( predefinedRoomId );
};

document.getElementById('btn-join-room').onclick = function() {
    this.disabled = true;
    connection.join( predefinedRoomId );
};
```

Now you are DONE. Congrats!!

Now try above codes on any HTTPs page. Remember HTTPs is required.

You can use `jsfiddle.net` for testing purpose.

# Other Documents

1. [Getting Started guide for RTCMultiConnection](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/getting-started.md)
2. [Installation Guide](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/installation-guide.md)
3. [How to Use?](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/how-to-use.md)
4. [API Reference](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/api.md)
5. [Upgrade from v2 to v3](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/upgrade.md)
6. [How to write iOS/Android applications?](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/ios-android.md)
7. [Tips & Tricks](https://github.com/muaz-khan/RTCMultiConnection/blob/master/docs/tips-tricks.md)

## Twitter

* https://twitter.com/WebRTCWeb i.e. @WebRTCWeb

## License

[RTCMultiConnection](https://github.com/muaz-khan/RTCMultiConnection) is released under [MIT licence](https://github.com/muaz-khan/RTCMultiConnection/blob/master/LICENSE.md) . Copyright (c) [Muaz Khan](http://www.MuazKhan.com/).
