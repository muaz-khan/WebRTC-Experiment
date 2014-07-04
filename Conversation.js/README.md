## [Conversation.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Conversation.js) runs top over [RTCMultiConnection.js](http://www.RTCMultiConnection.org/)

Conversation.js is inspired by skype; and it provides simple events-like API to manage conversations, enable/disable media devices; add/download files; and do anything supported by Skype.

It allows you open data conversation between two or more users using their user-ids.

## Demos: https://www.rtcmulticonnection.org/conversationjs/demos/

> Note: It is experimental release and API may change until v1.0 gets stable.

=

## Link the library

```html
<script src="//www.rtcmulticonnection.org/latest.js"></script>
<script src="//www.rtcmulticonnection.org/conversation.js"></script>
```

=

## Open simple conversation between two users

```javascript
// you can pass any kind of custom data over 
// "User" object's constructor's first argument
var user = new User({
    email: 'awesome@google.com'
});

// invoke this method to open conversation with any user
user.openconversationwith('target-username');

// this event is fired when conversation is opened
user.on('conversation-opened', function (conversation) {
    // var staticdata = conversation.target.staticdata;
    // var username = conversation.target.username;

    // emit a message to target user
    // conversation.emit('message', 'hello there');

    conversation.on('message', function (event) {
        console.log(event.username, event.data);
    });

    // enable your microphone and tell target user about it; he can 
    // also enable his microphone or he can simply listen your voice!
    // conversation.emit('enable', 'microphone');

    conversation.on('media-enabled', function (media) {
        // media.type == 'audio' || 'video' || 'screen'
        // media.hasmicrophone == true || null
        // media.hascamera == true || null
        // media.hasscreen == true || null
        // media.sender == 'string'
        
        media.emit('join-with', 'microphone');

        // media.staticdata == custom object
    });
});
```

=

## A working example for one-to-one conversation

```html
<script src="//www.rtcmulticonnection.org/latest.js"></script>
<script src="//www.rtcmulticonnection.org/conversation.js"></script>

<h1>Conversation.js one-to-one test.</h1>

<input id="target-username" placeholder="Target UserName">
<button id="call">Call Him</button>
<button id="enable-microphone" disabled>Enable Microphone</button>

<br />

<label for="text-chat">Type message here; press Enter:</label>
<input id="text-chat" type="text" placeholder="text chat" disabled>

<script>
// you can pass any kind of custom data as 
// "User" object's constructor's first argument
var user = new User({
    email: 'awesome@google.com'
});

user.on('friend-request', function (request) {
    request.accept();
    inputTargetUserName.value = request.sender;
});

document.querySelector('h1').innerHTML = 'Your username is: <strong contenteditable>' + user.username + '</strong>';

// this event is fired when conversation is opened
user.on('conversation-opened', function (conversation) {
    textChat.disabled = btnEnableMicrophone.disabled = false;
    inputTargetUserName.disabled = true;

    // emit a message to target user
    conversation.emit('message', 'hello there');

    conversation.on('message', function (event) {
        document.querySelector('h1').innerHTML = event.username + ': ' + event.data;
    });

    conversation.on('media-enabled', function (media) {
        media.emit('join-with', 'microphone');
    });
});

var btnEnableMicrophone = document.getElementById('enable-microphone');
var btnCall = document.getElementById('call');
var inputTargetUserName = document.getElementById('target-username');
var textChat = document.getElementById('text-chat');

btnCall.onclick = function() {
    this.disabled = true;
    // invoke this method to open conversation with any user
    user.openconversationwith(inputTargetUserName.value);
};

btnEnableMicrophone.onclick = function() {
    this.disabled = true;
    user.conversations[inputTargetUserName.value].emit('enable', 'microphone');
};

textChat.onkeyup = function(e) {
    if(e.keyCode != 13) return;
    user.conversations[inputTargetUserName.value].emit('message', this.value);
    
    this.value = '';
};
</script>

<style>button[disabled], input[disabled] { background: rgba(216, 205, 205, 0.2); border: 1px solid rgb(233, 224, 224);}</style>
```

=

## A working example for one-to-many conversation

```html
<script src="//www.rtcmulticonnection.org/latest.js"></script>
<script src="//www.rtcmulticonnection.org/conversation.js"></script>

<h1>Conversation.js one-to-many test.</h1>

<input id="target-username" placeholder="Target UserName">
<button id="call">Call Him</button>
<button id="enable-microphone" disabled>Enable Microphone</button>

<br />

<label for="text-chat">Type message here; press Enter:</label>
<input id="text-chat" type="text" placeholder="text chat" disabled>

<script>
// you can pass any kind of custom data as 
// "User" object's constructor's first argument
var user = new User({
    email: 'awesome@google.com'
});

user.on('friend-request', function (request) {
    request.accept();
    inputTargetUserName.value = request.sender;
});

document.querySelector('h1').innerHTML = 'Your username is: <strong contenteditable>' + user.username + '</strong>';

// this event is fired when conversation is opened
user.on('conversation-opened', function (conversation) {
    btnCall.disabled = textChat.disabled = btnEnableMicrophone.disabled = false;

    // emit a message to target user
    conversation.emit('message', 'hello there');

    conversation.on('message', function (event) {
        document.querySelector('h1').innerHTML = event.username + ': ' + event.data;
    });

    conversation.on('media-enabled', function (media) {
        media.emit('join-with', 'microphone');
    });
});

var btnEnableMicrophone = document.getElementById('enable-microphone');
var btnCall = document.getElementById('call');
var inputTargetUserName = document.getElementById('target-username');
var textChat = document.getElementById('text-chat');

btnCall.onclick = function() {
    this.disabled = true;
    // invoke this method to open conversation with any user
    user.openconversationwith(inputTargetUserName.value);
};

btnEnableMicrophone.onclick = function() {
    this.disabled = true;
    user.peers.emit('enable', 'microphone');
};

textChat.onkeyup = function(e) {
    if(e.keyCode != 13) return;
    user.peers.emit('message', this.value);
    
    this.value = '';
};
</script>

<style>button[disabled], input[disabled] { background: rgba(216, 205, 205, 0.2); border: 1px solid rgb(233, 224, 224);}</style>
```

=

## How to manually start signaler?

```javascript
var user = new User();

btnManuallyStartSignaler.onclick = function () {
    user.emit('signaler', 'start');
};
```

=

## How to check if signaling channel is connected?

```javascript
user.on('signaler-connected', function () {
    // signaling channel is ready
});
```

=

## How to accept/reject friend requests?

```javascript
user.on('friend-request', function (request) {
    if (window.confirm('Do you want to accept friend-request made by ' + request.sender + '?')) {
        request.accept();
    } else {
        request.reject();
    }
});
```

=

## How to check friend-request status?

```javascript
user.on('request-status', function (request) {
    if (request.status == 'accepted') {
        alert(request.sender + ' accepted your request.');
    }
    if (request.status == 'rejected') {
        alert(request.sender + ' rejected your request.');
    }
});
```

=

## How to emit events to multiple users?

```javascript
document.querySelector('#chat-message').onchange = function (event) {
    user.peers.emit('message', this.value);
};

document.querySelector('#enable-microphone').onclick = function () {
    user.peers.emit('enable', 'microphone');
};

document.querySelector('#enable-camera').onclick = function () {
    user.peers.emit('enable', 'camera');
};

document.querySelector('#enable-screen').onclick = function () {
    user.peers.emit('enable', 'screen');
};
```

=

## How to share files?

```javascript
document.querySelector('input[type=file]').onchange = function () {
    user.peers.emit('add-file', this.files);
};
```

=

## How to check if target user added file?

```javascript
conversation.on('add-file', function (file) {
    file.download();

    // or file.cancel();
});
```

=

## How to check file-download progress?

```javascript
conversation.on('file-progress', function (progress) {
    console.log('percentage %', progress.percentage);
    // progress.file.name
    // progress.sender
});
```

=

## How to save downloaded file to disk?

```javascript
conversation.on('file-downloaded', function (file) {
    // file.sender
    file.savetodisk();
});
```

=

## How to check if file is successfully sent?

```javascript
conversation.on('file-sent', function (file) {
    // file.sender
    console.log(file.name, 'sent.');
});
```

=

## How to check if target user refused to receive your file?

```javascript
conversation.on('file-cancelled', function (file) {
    // file.sender
    console.log(file.name, 'cancelled.');
});
```

=

## License

[Conversation.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Conversation.js) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
