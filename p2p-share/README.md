![WebRTC Experiment!](https://muazkh.appspot.com/images/WebRTC.png)

--

[P2P sharing/broadcasting files using RTCDataChannel APIs](https://webrtc-experiment.appspot.com/file-broadcast/). Works fine both on Google Chrome Canary and Firefox Nightly.

##How to use in your own site?

```html
<!-- optional but recommended -->
<script>window.defaultChannel = '123456789';</script>

<table>
	<tr>
		<td>
			<input type="button" value="Create Room" id="create-room" disabled>
			<input type="file" id="file" disabled>
			<div id="status" style="font-size: 2em;color: red;"></div>
		</td>
		<td id="output-panel"></td>
	</tr>
</table>

<script src="http://bit.ly/p2p-share"></script>

<!-- And that's all you need to put in your HTML page!!! -->
```

##[How file broadcast works?](https://webrtc-experiment.appspot.com/docs/how-file-broadcast-works.html)

##Here is file-sharing.js (to understand how it works)

```javascript
var content = [];
var moz = !!navigator.mozGetUserMedia;
var lastFileName = ''; /* Direct file blob sharing using Firefox Nightly */

function onMessageCallback(data) {
    /* if firefox nightly & file blob shared */
    if (data.size && moz) {
        var reader = new window.FileReader();
        reader.readAsDataURL(data);
        reader.onload = function (event) {
            saveToDisk(event.target.result, lastFileName);
            quickOutput(lastFileName, 'received successfully!');
            disable(false);
        };
        return;
    }

    data = JSON.parse(data);

    /* if firefox nightly & file blob shared */
    if (data.lastFileName) {
        lastFileName = data.lastFileName;
        quickOutput(lastFileName, 'is ready to transfer.');
        disable(true);
        return;
    }

	if(data.connected) 
	{
		quickOutput('Your friend is connected to you.');
		return;
	}
	
	disable(true);
	
    if (data.packets) packets = parseInt(data.packets);
	updateStatus();
	
    content.push(data.message);
	
	if(data.last) {
		saveToDisk(content.join(''), data.name);
        quickOutput(data.name, 'received successfully!');
		disable(false);
		content = [];
    }
}

// getting file from user's system
var file, fileElement = document.getElementById('file');
fileElement.onchange = function() {
    file = fileElement.files[0];
    if (!file) return;

    /* if firefox nightly: share file blob directly */
    if (moz) {
        postMessage(JSON.stringify({ lastFileName: file.name }));
        quickOutput(file.name, 'shared successfully!');
        return postMessage(file);
    }

    var reader = new window.FileReader();
    reader.readAsDataURL(file);
    reader.onload = onReadAsDataURL;

    disable(true);
};

var packetSize = 1000, textToTransfer = '', packets = 0;
function onReadAsDataURL(evt, text) {
    var data = {};

    if (evt) {
        text = evt.target.result;
        packets = data.packets = parseInt(text.length / packetSize);
    }

    updateStatus();

    if (text.length > packetSize) {
        data.message = text.slice(0, packetSize);
    } else {
        data.message = text;
        data.last = true;
		data.name = file.name;

        quickOutput(file.name, 'shared successfully!');

        disable(false);
    }
	postMessage(JSON.stringify(data));
	
	textToTransfer = text.slice(data.message.length);

	if (textToTransfer.length) setTimeout(function () {
	    onReadAsDataURL(null, textToTransfer);
	}, 500)
}

function saveToDisk(fileUrl, fileName) {
    var save = document.createElement("a");
    save.href = fileUrl;
    save.target = "_blank";
    save.download = fileName || fileUrl;

    var evt = document.createEvent('MouseEvents');
    evt.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);

    save.dispatchEvent(evt);

    window.URL.revokeObjectURL(save.href);
}

// UI
var outputPanel = document.getElementById('output-panel');
function quickOutput(message, message2) {
    if (!outputPanel) return;
	
	if(message2) message = '<strong>' + message + '</strong> ' + message2;

    var blockquote = document.createElement('blockquote');
    blockquote.innerHTML = message;
    outputPanel.insertBefore(blockquote, outputPanel.childNodes[0]);
}

var statusDiv = document.getElementById('status');
function updateStatus() {	
	packets--;
	if(statusDiv) statusDiv.innerHTML = packets + ' items remaining.';
	if(packets <= 0) statusDiv.innerHTML = '';
}
```

* [File sharing/broadcasting/transferring using RTCDataChannel APIs](https://webrtc-experiment.appspot.com/file-broadcast/) - works fine on Chrome Canary and Firefox Nightly
* [Realtime chat using RTCDataChannel APIs: Text broadcasting privately or publicly](https://webrtc-experiment.appspot.com/chat/) - works fine on Chrome Canary and Firefox Nightly
* [Screen/Webpage sharing/broadcasting over unlimited peers](https://webrtc-experiment.appspot.com/screen-broadcast/) - works fine on Chrome Canary
* [Voice/Audio sharing/broadcasting over unlimited peers](https://webrtc-experiment.appspot.com/audio-broadcast/) - works fine on Chrome Canary
* [Audio+Video sharing/broadcasting over unlimited peers](https://webrtc-experiment.appspot.com/broadcast/) - works fine on Chrome 23 and upper all versions and releases

See list of all other WebRTC experiments [here](https://webrtc-experiment.appspot.com/).

## Are you a newbie or beginner to WebRTC?

There are [up to dozens](https://webrtc-experiment.appspot.com/) documents and snippets that allows you develop broadcasting type of experiments in minutes!

## Don't worry about node.js, PHP, Java, Python or ASP.NET MVC!!

You can do everything in JavaScript without worrying about node.js or other server side platforms. Try to focus on JavaScript. "Throw node.js out of the door!" [Sorry]

## A few documents for newbies and beginners

* [WebRTC for Beginners: A getting stared guide!](https://webrtc-experiment.appspot.com/docs/webrtc-for-beginners.html)
* [RTCDataChannel for Beginners](https://webrtc-experiment.appspot.com/docs/rtc-datachannel-for-beginners.html)
* [How to use RTCDataChannel?](https://webrtc-experiment.appspot.com/docs/how-to-use-rtcdatachannel.html) - single code for both canary and nightly
* [How to broadcast video using RTCWeb APIs?](https://webrtc-experiment.appspot.com/docs/how-to-broadcast-video-using-RTCWeb-APIs.html)
* [How to share audio-only streams?](https://webrtc-experiment.appspot.com/docs/how-to-share-audio-only-streams.html)
* [How to broadcast files using RTCDataChannel APIs?](https://webrtc-experiment.appspot.com/docs/how-file-broadcast-works.html)
* [How to use Plugin-free calls in your own site?](https://webrtc-experiment.appspot.com/docs/how-to-use-plugin-free-calls.html) - JUST 3 lines of code!

## Possibilities with RTCDataCannel APIs

* You can share huge data in minutes - For example, you can share up to 100MB file in "less than one minute" on slow internet connections (like 150KB/s i.e. 2MB DSL)
* In games, you can share coordinates over many streams in realtime
* Snap and Sync your webpage
* Screen sharing - you can take snapshot of the webpage or part of webpage and share in realtime over many streams!

Note: Currently Mozilla Firefox Nightly opens 16 streams by default. You can increase this limit by passing third argument when calling: peerConnection.connectDataConnection(5001, 5000, 40)

##Credits

* [Muaz Khan](http://github.com/muaz-khan)!

##Spec references 

* [WebRTC 1.0: Real-time Communication Between Browsers](http://dev.w3.org/2011/webrtc/editor/webrtc.html)
* [TURN Server at Wikipedia!](http://en.wikipedia.org/wiki/Traversal_Using_Relays_around_NAT)
* [STUN Server at Wikipedia!](http://en.wikipedia.org/wiki/STUN)

## License
Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503) - Licensed under the MIT license.