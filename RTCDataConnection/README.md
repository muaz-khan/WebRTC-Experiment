It is strongly suggested to try [RTCMultiConnection](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection) instead.

=

#### Use [RTCDataConnection](http://bit.ly/RTCDataConnection) to share files, data, or text

Write your own **group file sharing** application in **maximum 2 minutes**!!

```html
<script src="https://bit.ly/RTCDataConnection-v1-0"></script>
```

```javascript
var rtcDataConnection = new RTCDataConnection({
    onmessage: function (data) {
        console.log(data);
    },
    openSignalingChannel: function (config) {
        var socket = io.connect('http://your-site:8888');
        socket.channel = config.channel || 'WebRTC-RTCDataConnection';
		socket.on('message', config.onmessage);
		
        socket.send = function (data) {
            socket.emit('message', data);
        };

        if (config.onopen) setTimeout(config.onopen, 1);
        return socket;
    },
	
    // 'one-to-one' || 'one-to-many' || 'many-to-many'
    // default: 'many-to-many' ------- it is optional
    direction: 'one-to-many'
});

// Only session initiator should call below line; 
// All other 10000 room participants don't need to call "initDataConnection"!
rtcDataConnection.initDataConnection();

// to send file/data /or text
rtcDataConnection.send( file || data || 'text' );
```

=

#### Features

1. Share files of any size — directly
2. Share text messages of any length
3. Share any kind of data — directly

=

#### Read [RTCDataConnection Documentation](http://bit.ly/RTCDataConnection)

=

#### Browser Support
[RTCDataConnection](http://bit.ly/RTCDataConnection) works fine on following web-browsers:

| Browser        | Support           |
| ------------- |:-------------:|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |

=

#### License

[RTCDataConnection](http://bit.ly/RTCDataConnection) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
