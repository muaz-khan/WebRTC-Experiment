# [DataChannel.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/DataChannel) : A JavaScript wrapper library for RTCDataChannel APIs / [Demos](https://www.webrtc-experiment.com/#DataChannel)

DataChannel.js is a JavaScript library useful to write many-to-many i.e. group file/data sharing or text chat applications. Its syntax is easier to use and understand. It highly simplifies complex tasks like any or all user rejection/ejection; direct messages delivery; and more.

If you want all DataChannel.js functionalities along with media streaming and runtime additions/deletions then [RTCMultiConnection.js](http://www.rtcmulticonnection.org/) is a good chose with similar APIs/syntax.

* [DataChanel.js and Reliable Signaling](https://github.com/muaz-khan/Reliable-Signaler/tree/master/datachannel-client)

## Features

1. Direct messages — to any user using his `user-id`
2. Eject/Reject any user — using his `user-id`
3. Leave any room (i.e. data session) or close entire session using `leave` method
4. File size is limitless!
5. Text message length is limitless!
6. Size of data is also limitless!
7. Fallback to firebase/socket.io/websockets/etc.
8. Users' presence detection using `onleave`
9. Latency detection
10. Multi-longest strings/files concurrent 
11. File queue support added. Previously shared files will be auto transmitted to each new peer.

## [Demos using DataChannel.js](https://www.webrtc-experiment.com/#DataChannel)

1. [DataChannel basic demo](https://www.webrtc-experiment.com/DataChannel/)
2. [Auto Session Establishment and Users presence detection](https://www.webrtc-experiment.com/DataChannel/auto-session-establishment.html)
3. [Text Chat using Pusher and DataChannel.js](http://webrtc-chat-demo.pusher.io/)

## Try a Quick Demo (Text Chat)

```html
<script src="//cdn.webrtc-experiment.com/DataChannel.js"> </script>
<button id="setup-datachannel" style="width:30%;">Open NEW DataChannel</button>
<input type="text" id="chat-input" disabled style="font-size: 2em; width: 65%;"><br />
<div id="chat-output"></div>

<script>
var chatOutput = document.getElementById('chat-output');
var chatInput = document.getElementById('chat-input');
chatInput.onkeypress = function (e) {
    if (e.keyCode != 13) return;
    channel.send(this.value);
    chatOutput.innerHTML = 'Me: ' + this.value + '<hr />' + chatOutput.innerHTML;
    this.value = '';
};

var channel = new DataChannel();

channel.onopen = function (userid) {
    chatInput.disabled = false;
    chatInput.value = 'Hi, ' + userid;
    chatInput.focus();
};

channel.onmessage = function (message, userid) {
    chatOutput.innerHTML = userid + ': ' + message + '<hr />' + chatOutput.innerHTML;
};

channel.onleave = function (userid) {
    chatOutput.innerHTML = userid + ' Left.<hr />' + chatOutput.innerHTML;
};

// search for existing data channels
channel.connect();

document.querySelector('button#setup-datachannel').onclick = function () {
    // setup new data channel
    channel.open();
};
</script>
```

## First Step: Link the library

```html
<script src="//cdn.webrtc-experiment.com/DataChannel.js"></script>
```

## Last Step: Start using it!

```javascript
var channel = new DataChannel('[optional] channel-name');
channel.send(file || data || 'text-message');
```

## open/connect data channels

```javascript
// to create/open a new channel
channel.open('channel-name');

// if someone already created a channel; to join it: use "connect" method
channel.connect('channel-name');
```

## `onopen` and `onmessage`

If you're familiar with WebSockets; these two methods works in the exact same way:

```javascript
channel.onopen = function(userid) { }
channel.onmessage = function(message, userid, latency) { }
```

`user-ids` can be used to send **direct messages** or to **eject/leave** any user:

## `ondatachannel`

Allows you show list of all available data channels to the user; and let him choose which one to join:

```javascript
channel.ondatachannel = function(data_channel) {
    channel.join(data_channel);
	
    // or
    channel.join({
        id:    data_channel.id,
        owner: data_channel.owner
    });
	
    // id:    unique identifier for the session
    // owner: unique identifier for the session initiator
};
```

## Use custom user-ids

```javascript
channel.userid = 'predefined-userid';
```

Remember; custom defined `user-id` must be unique username.

## Direct messages

```javascript
channel.channels[userid].send(file || data || 'text message');
```

## Eject/Reject users using their `user-ids`

```javascript
channel.eject(userid);  // throw a user out of your room!
```

## Close/Leave the entire room

```javascript
channel.leave();        // close your own entire data session
```

## Detect users' presence

```javascript
channel.onleave = function(userid) { };
```

## Auto Close Entire Session

When room initiator leaves; you can enforce auto-closing of the entire session. By default: it is `false`:

```javascript
channel.autoCloseEntireSession = true;
```

It means that session will be kept active all the time; even if initiator leaves the session.

You can set `autoCloseEntireSession` before calling `leave` method; which will enforce closing of the entire session:

```javascript
channel.autoCloseEntireSession = true;
channel.leave(); // closing entire session
```

## `uuid` for files

You can get `uuid` for each file (being sent) like this:

```javascript
channel.send(file);
var uuid = file.uuid; // "file"-Dot-uuid
```

## To Share files

```javascript
var progressHelper = {};

// to make sure file-saver dialog is not invoked.
channel.autoSaveToDisk = false;

channel.onFileProgress = function (chunk, uuid) {
    var helper = progressHelper[chunk.uuid];
    helper.progress.value = chunk.currentPosition || chunk.maxChunks || helper.progress.max;
    updateLabel(helper.progress, helper.label);
};

channel.onFileStart = function (file) {
    var div = document.createElement('div');
    div.title = file.name;
    div.innerHTML = '<label>0%</label> <progress></progress>';
    appendDIV(div, fileProgress);
    progressHelper[file.uuid] = {
        div: div,
        progress: div.querySelector('progress'),
        label: div.querySelector('label')
    };
    progressHelper[file.uuid].progress.max = file.maxChunks;
};

channel.onFileSent = function (file) {
    progressHelper[file.uuid].div.innerHTML = '<a href="' + file.url + '" target="_blank" download="' + file.name + '">' + file.name + '</a>';
};

channel.onFileReceived = function (fileName, file) {
    progressHelper[file.uuid].div.innerHTML = '<a href="' + file.url + '" target="_blank" download="' + file.name + '">' + file.name + '</a>';
};

function updateLabel(progress, label) {
    if (progress.position == -1) return;
    var position = +progress.position.toFixed(2).split('.')[1] || 100;
    label.innerHTML = position + '%';
}
```

## File Queue

File Queue support added to make sure newly connected users gets all previously shared files.

You can see list of previously shared files:

```javascript
console.log( channel.fileQueue );
```

## Auto-Save file to Disk

By default; `autoSaveToDisk` is set to `true`. When it is `true`; it will save file to disk as soon as it is received. To prevent auto-saving feature; just set it `false`:

```javascript
channel.autoSaveToDisk = false; // prevent auto-saving!
channel.onFileReceived = function (fileName, file) {
    // file.url
    // file.uuid
	
    hyperlink.href = file.url;
};
```

## Latency Detection

```javascript
channel.onmessage = function(message, userid, latency) {
    console.log('latency:', latency, 'milliseconds');
};
```

## Concurrent Transmission

You can send multiple files concurrently; or multiple longer text messages:

```javascript
// individually
channel.send(fileNumber1);
channel.send(fileNumber2);
channel.send(fileNumber3);

// or as an array
channel.send([fileNumber1, fileNumber2, fileNumber3]);

channel.send('longer string-1');
channel.send('longer string-2');
channel.send('longer string-3');
```

## Errors Handling

```javascript
// error to open data ports
channel.onerror = function(event) {}

// data ports suddenly dropped
channel.onclose = function(event) {}
```

## Data session direction

Default direction is `many-to-many`.

```javascript
channel.direction = 'one-to-one';
channel.direction = 'one-to-many';
channel.direction = 'many-to-many';
```

=

For signaling; please check following page:

https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md

Remember, you can use any signaling implementation that exists out there without modifying any single line! Just skip below code and open [above link](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md)!

## Resources

1. Video Presentation for `openSignalingChannel`: https://vimeo.com/91780227
2. Documentation for `openSignalingChannel`: http://www.rtcmulticonnection.org/docs/openSignalingChannel/

## Use [your own socket.io for signaling](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/socketio-over-nodejs)

```javascript
dataChannel.openSignalingChannel = function(config) {
   var channel = config.channel || this.channel || 'default-channel';
   
   var socket = io.connect('/?channel=' + channel);
   socket.channel = channel;
   
   socket.on('connect', function () {
      if (config.callback) config.callback(socket);
   });
   
   socket.send = function (message) {
        socket.emit('message', {
            sender: dataChannel.userid,
            data  : message
        });
    };
   
   socket.on('message', config.onmessage);
};
```

## Use Pusher for signaling

A demo & tutorial available here: http://pusher.com/tutorials/webrtc_chat

Another link: http://www.rtcmulticonnection.org/docs/openSignalingChannel/#pusher-signaling

## Use [firebase for signaling](http://www.rtcmulticonnection.org/docs/openSignalingChannel/#firebase-signaling)

```javascript
// firebase stores data on their servers
// that's why transmitting room once
// unlike other signalling gateways; that
// doesn't stores data on servers.
channel.transmitRoomOnce = true;

channel.openSignalingChannel = function (config) {
    channel = config.channel || this.channel || 'default-channel';
    var socket = new window.Firebase('https://chat.firebaseIO.com/' + channel);
    socket.channel = channel;
    socket.on('child_added', function (data) {
        var value = data.val();
        if (value == 'joking') config.onopen && config.onopen();
        else config.onmessage(value);
    });
    socket.send = function (data) {
        this.push(data);
    };
    socket.push('joking');
    this.socket = socket;
    return socket;
};
```

## Other Signaling resources

* [DataChanel.js and Reliable Signaling](https://github.com/muaz-khan/Reliable-Signaler/tree/master/datachannel-client)

1. [XHR for Signaling](http://www.rtcmulticonnection.org/docs/openSignalingChannel/#xhr-signaling)
2. [WebSync for Signaling](http://www.rtcmulticonnection.org/docs/openSignalingChannel/#websync-signaling)
3. [SignalR for Signaling](http://www.rtcmulticonnection.org/docs/openSignalingChannel/#signalr-signaling)
4. [Pusher for Signaling](http://www.rtcmulticonnection.org/docs/openSignalingChannel/#pusher-signaling)
5. [Firebase for Signaling](http://www.rtcmulticonnection.org/docs/openSignalingChannel/#firebase-signaling)
6. [PubNub for Signaling](http://www.rtcmulticonnection.org/docs/openSignalingChannel/#pubnub-signaling)

## `transmitRoomOnce`

`transmitRoomOnce` is preferred when using Firebase for signaling. It saves bandwidth and asks DataChannel.js library to not repeatedly transmit room details.

```javascript
channel.transmitRoomOnce = true;
```

## Browser Support

[DataChannel.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/DataChannel) works fine on following browsers:

| Browser        | Support           |
| ------------- |:-------------|
| Firefox | [Stable](http://www.mozilla.org/en-US/firefox/new/) / [Aurora](http://www.mozilla.org/en-US/firefox/aurora/) / [Nightly](http://nightly.mozilla.org/) |
| Google Chrome | [Stable](https://www.google.com/intl/en_uk/chrome/browser/) / [Canary](https://www.google.com/intl/en/chrome/browser/canary.html) / [Beta](https://www.google.com/intl/en/chrome/browser/beta.html) / [Dev](https://www.google.com/intl/en/chrome/browser/index.html?extra=devchannel#eula) |
| Android | [Chrome Beta](https://play.google.com/store/apps/details?id=com.chrome.beta&hl=en) |

## License

[DataChannel.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/DataChannel) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
