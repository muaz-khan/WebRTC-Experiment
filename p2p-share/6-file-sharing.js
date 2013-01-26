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

	if (textToTransfer.length)
	    setTimeout(function() {
	        onReadAsDataURL(null, textToTransfer);
	    }, 500);
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

(function() {
	var uniqueToken = document.getElementById('unique-token');
	if (uniqueToken)
		uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = (function () {
			return "#private-" + ("" + 1e10).replace(/[018]/g, function (a) {
				return (a ^ Math.random() * 16 >> a / 4).toString(16);
			});
		})();
})();