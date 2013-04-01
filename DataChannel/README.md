#### [DataChannel.js](http://bit.ly/DataChannel) : A JavaScript wrapper library for RTCDataChannel APIs / [Demo](http:/bit.ly/DataChannel-Demo)

DataChannel library highly simplifies coding. It allows you:

1. Share files of any size — directly
2. Share text messages of any length
3. Share any kind of data — directly

Syntax of **DataChannel.js** is same like **WebSockets**.

#### First Step: Link the library

```html
<script src="http://bit.ly/DataChannel"></script>
```

#### Second Step: Start using it!

```html
<script>
    var channel = new DataChannel();

    // to create/open a new channel
    channel.open('channel-name');

    // to send text/data or file
    channel.send(file || data || 'text');
	
    // if someone already created a channel; to join it: use "connect" method
    channel.connect('channel-name');
</script>
```

Remember, A-to-Z, everything is optional! You can set `channel-name` in constructor or in `open`/`connect` methods. It is your choice! 

#### Additional 

```html
<script>
    // to be alerted on data ports get open
    channel.onopen = function(channel) {}
	
    // to be alerted on data ports get new message
    channel.onmessage = function(message) {}
</script>
```

#### Set direction — Group data sharing or One-to-One

```html
<script>
    // by default; connection is [many-to-many]; you can use following directions
    channel.direction = 'one-to-one';
    channel.direction = 'one-to-many';
    channel.direction = 'many-to-many';	// --- it is default
</script>
```

#### Progress helpers when sharing files

```html
<script>
    // show progress bar!
    channel.onFileProgress = function (packets) {
        // packets.remaining
        // packets.sent
        // packets.received
        // packets.length
    };

    // on file successfully sent
    channel.onFileSent = function (file) {
        // file.name
        // file.size
    };

    // on file successfully received
    channel.onFileReceived = function (fileName) {};
</script>
```

#### Errors Handling

```html
<script>
    // error to open data ports
    channel.onerror = function(event) {}
	
    // data ports suddenly dropped
    channel.onclose = function(event) {}
</script>
```

#### Use your own socket.io for signaling

```html
<script>
    // by default Firebase is used for signaling; you can override it
    channel.openSignalingChannel = function(config) {
        var socket = io.connect('http://your-site:8888');
        socket.channel = config.channel || this.channel || 'default-channel';
        socket.on('message', config.onmessage);

        socket.send = function (data) {
            socket.emit('message', data);
        };

        if (config.onopen) setTimeout(config.onopen, 1);
        return socket;
    }
</script>
```

====
#### Browser Support

[DataChannel.js](http://bit.ly/DataChannel) works fine on following browsers:

| Browser        | Support           |
| ------------- |:-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Internet Explorer / IE | [Chrome Frame](http://www.google.com/chromeframe) |


#### License

[DataChannel.js](http://bit.ly/DataChannel) is released under [MIT licence](https://webrtc-experiment.appspot.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
