![WebRTC Experiment!](https://muazkh.appspot.com/images/WebRTC.png)

--

[This webrtc experiment](https://webrtc-experiment.appspot.com/websocket/) is using WebSocket as signaling gateway.

## Just copy HTML and enjoy one-to-one video chat in your own site!

```html
<style>
    .center-table td { width: 40%; }
    #participants video { width: 10em; }
    .hidden { display:none; }
	table{width:100%;}
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
			<input type="text" id="room-name" placeholder="Room Name">
		</td>
		<td>
			<button id="start-conferencing">Start One-to-One video chat!</button>
		</td>
	</tr>
</table>

<table class="visible">
    <tr>
        <td>
            <div id="rooms-list"></div>
        </td>
    </tr>
</table>

<table>
	<tr>
		<td>
			<div id="participants"></div>
		</td>
	</tr>
</table>
<script src="https://webrtc-experiment.appspot.com/dependencies/websocket.js"></script>
<script src="https://bit.ly/RTCPeerConnection-v1-3"></script>
<script src="https://webrtc-experiment.appspot.com/websocket/rtclib.js"> </script>
<script src="https://webrtc-experiment.appspot.com/websocket/ui.js"></script>
```

##Credits

* [Muaz Khan](http://github.com/muaz-khan)!

## License
Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503) - Licensed under the MIT license.