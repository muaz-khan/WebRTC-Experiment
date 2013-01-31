![WebRTC Experiment!](https://muazkh.appspot.com/images/WebRTC.png)

--

[This webrtc experiment](https://webrtc-experiment.appspot.com/chat-hangout/) is using socket.io as signaling gateway. It is a Group Chat experiment; using RTCDataChannel APIs for chat. You can say it many to many chat!

## Just copy HTML and enjoy many-to-many chat hangout in your own site!

```html
<style>
    .center-table td { width: 40%; }
    .hidden{display:none;}
	table{width:100%;}
	#chat-table blockquote {
		border: 1px dotted gray;
		padding: 1em 2em;
		margin: 1em 5em;
	}
	#chat-table blockquote hr
	{
		margin: 1em -2em;
		border: 0;
		border-top: 1px dotted #BBA9A9;
	}
	button {
	    background: #0370ea;
		background: -moz-linear-gradient(top,#008dfd 0,#0370ea 100%);
		background: -webkit-linear-gradient(top,#008dfd 0,#0370ea 100%);
		border: 1px solid #076bd2;
		-moz-border-radius: 3px;
		border-radius: 3px;
		color: #fff !important;
		display: inline-block;
		line-height: 1.3;
		padding: 8px 25px;
		text-align: center;
		text-shadow: 1px 1px 1px #076bd2;
		-webkit-transition: none;
		-moz-transition: none;
	    font-size: 1.5em;
	}
	button:hover { background: rgb(9, 147, 240); }
	button:active { background: rgb(10, 118, 190); }
	input { font-size: 2em; }
	.join{font-size: .8em;margin-left: 2em;padding: .2em .6em;}
</style>

<table class="visible">
    <tr>
        <td style="text-align: right;">
            <input type="text" id="conference-name" placeholder="Hangout Name...">
        </td>
        <td>
            <button id="start-conferencing" href="#">Start Chat-Hangout</button>
        </td>
    </tr>
</table>

<table id="rooms-list" class="visible"></table>

<table id="chat-table" class="center-table hidden">
    <tr>
        <td style="text-align: center;">
            <input type="text" id="chat-message" style="width: 80%">
            <button id="post-chat-message">Post Message</button>
        </td>
    </tr>
</table>
<table id="chat-output" class="hidden"></table>

<script src="https://bit.ly/socket-io"></script>
<script src="https://bit.ly/RTCPeerConnection-v1-3"></script>
<script src="https://webrtc-experiment.appspot.com/chat-hangout/hangout.js"> </script>
<script src="https://webrtc-experiment.appspot.com/chat-hangout/hangout-ui.js"></script>
```

##Credits

* [Muaz Khan](http://github.com/muaz-khan)!

## License
Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503) - Licensed under the MIT license.