/* This function "saveToDisk" is taken from: http://muaz-khan.blogspot.com */
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

var content = [], packetNo = 0;

/* The message passed via RTCDataChannel */
function onMessageCallback(data) {
    disable(true);

    data = JSON.parse(data);
    
	packetNo++;
	quickOutput('Getting packet no ' + packetNo);
	
    /* update progress bar */
    if (data.progressInterval || data.message) {
		if(data.progressInterval)
			progressInterval = data.progressInterval;
		else 
			progressInterval += progressInterval;
        updateProgressBar();
    }
	
    /* push each message packet in an array */
    content.push(data.message);
	
    /* on last message packet */
    if (data.last == true) {
        
        /* downoad file to disk */
		saveToDisk(content.join(''), data.name);

        quickOutput(data.name + ' received successfully!');

        /* set defaults again */
        content = [];
		packetNo = 0;
        hideProgressBar();
    }
}

/* get file */
var file, fileElement = document.getElementById('file');
fileElement.onchange = function () {
    file = fileElement.files[0];
    if (!file) return;

    /* this is the heart of the code!!! */
    var reader = new window.FileReader();
    reader.readAsDataURL(file); /* reading as data-url to allow transfer of all files; also download!! */
    reader.onload = onReadAsDataURL;

    disable(true);
};

/* RTCDataChannel maximum message limit is 1100...that's why 1000 is used */
var packetSize = 1000;
var textToTransfer = '';
var sending =  false;

function onReadAsDataURL(evt, text) {
    var data = {
        name: file.name,
        last: false,
        progressInterval: 0,
		message: ''
    };

    /* on first time this function is invoked */
    if (evt) {
        text = evt.target.result;
        progressInterval = parseInt(text.length / (parseInt(text.length / packetSize)  * 100));
        data.progressInterval = progressInterval;		
		sending = true;
    }

    updateProgressBar();

    if (text.length > packetSize) {
        data.message = text.slice(0, packetSize);
    } else {
        data.message = text;
        data.last = true;

        quickOutput(file.name + ' shared successfully!');

        hideProgressBar();
    }

    postMessage(JSON.stringify(data));
	
	textToTransfer = text.slice(data.message.length);
	if(textToTransfer.length)
	{
        /* because RTCDataChannel APIs are slowest! That's why sending message packet after each 500ms */
		setTimeout(function() {
			onReadAsDataURL(null, textToTransfer);
		}, 500);
	}
}

var progressBar = document.getElementById('progress-bar');
var progressInterval = 0;

function updateProgressBar() {
	if(!progressBar) return;
    progressBar.style.display = 'block';
	if(!progressInterval) progressInterval = 100;
    progressBar.value += progressInterval;
}

function hideProgressBar() {
	if(!progressBar) return;
    progressBar.style.display = 'none';
    progressBar.value = progressInterval = 0;
    disable(false);
	sending = false;
}

/* JUST for output; what's happening! */
var outputPanel = document.getElementById('output-panel');
function quickOutput(message) {
    if (!outputPanel) return;

    var blockquote = document.createElement('blockquote');
    blockquote.innerHTML = message;
    outputPanel.insertBefore(blockquote, outputPanel.childNodes[0]);
}

(function() {
	var uniqueToken = document.getElementById('unique-token');
	if (uniqueToken)
		uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = (function () {
			return "#private-" + ("" + 1e10).replace(/[018]/g, function (a) {
				return (a ^ Math.random() * 16 >> a / 4).toString(16);
			});
		})();
})();