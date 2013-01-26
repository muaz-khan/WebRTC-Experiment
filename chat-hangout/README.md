![WebRTC Experiment!](https://muazkh.appspot.com/images/WebRTC.png)

--

[This webrtc experiment](https://webrtc-experiment.appspot.com/chat-hangout/) is using socket.io as signaling gateway. It is a Group Chat experiment; using RTCDataChannel APIs for chat. You can say it many to many chat!

## Just copy HTML and enjoy many-to-many chat hangout in your own site!

```html
<style>
tr, td, th
{
  vertical-align: top;
  padding: .7em 1.4em;
  border: 1px dotted #BBA9A9;
}
table{width:100%;}
</style>

<div class="visible">
    <input type="text" id="conference-name" placeholder="Enter room name..."/>
    <button id="start-conferencing">Start Chat-Hangout</button>
</div>

<br /><br />

<input type="text" id="chat-message" style="width: 80%" placeholder="Enter your message here.." />

<table id="rooms-list" class="visible"></table>
<table id="chat-output"></table>

<div id=pubnub ssl=on></div><script src="https://bit.ly/socket-io"></script>

<script src="https://bit.ly/RTCPeerConnection-v1-3"></script>
<script src="https://webrtc-experiment.appspot.com/chat-hangout/hangout.js"> </script>
<script src="https://webrtc-experiment.appspot.com/chat-hangout/hangout-ui.js"></script>
```

##Credits

* [Muaz Khan](http://github.com/muaz-khan)!

## License
Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503) - Licensed under the MIT license.