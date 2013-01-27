[This webrtc experiment](https://webrtc-experiment.appspot.com/file-hangout/) is using socket.io as signaling gateway. It is a Group File Sharing experiment; using RTCDataChannel APIs for sharing files in group. You can say it many to many file sharing!

## Just copy HTML and enjoy Group File Sharing in your own site!

```html
<style>
    a.join, a.start-conferencing { background: url(/images/accept.gif) no-repeat left center; padding-left: 1.5em; }
    input { font-size: 1.2em; }
    .start-conferencing { display: block; }
    .hidden { display:none;}
	table{width:100%;}
	td {border: 1px dotted #BBA9A9;}
</style>

<!-- <required> -->
<table style="width: 100%;">
    <tr>
        <td style="width: 50%">
            <blockquote>
                <input type="button" value="Start File-Hangout" id="start-conferencing">
                <input type="file" id="file" disabled>
                <div id="status" style="font-size: 2em;color: red;"></div>
				
				<table id="participants"></table>
				<table id="rooms-list" class="visible"></table>
            </blockquote>
        </td>
        <td>
			<table id="output-panel"></table>
			
            <blockquote>
                You can use hash "<strong>#</strong>" to change channel (useful to share files <strong>privately</strong>)!!! 
            </blockquote>
            <blockquote>
                After using hash "<strong>#</strong>", <strong>send that link to your friend</strong>, and he will <strong>auto connect</strong> to you! 
            </blockquote>
            <blockquote>
                Like this: <a href="https://webrtc-experiment.appspot.com/file-hangout/file-hangout/" target="_blank"><code>/file-hangout/<strong id="unique-token">#123456789</strong></code></a>
            </blockquote>
        </td>
    </tr>
</table>
<!-- </required> -->

<!-- <required> -->
<div id=pubnub ssl=on></div><script src="https://bit.ly/socket-io"></script>
<script src="https://bit.ly/RTCPeerConnection-v1-3"></script>

<script src="https://webrtc-experiment.appspot.com/file-hangout/hangout.js"> </script>
<script src="https://webrtc-experiment.appspot.com/file-hangout/hangout-ui.js"></script>
<!-- </required> -->
```

##Credits

* [Muaz Khan](http://github.com/muaz-khan)!

## License
Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503) - Licensed under the MIT license.