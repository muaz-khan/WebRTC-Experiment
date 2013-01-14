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

var content = [];
var packetNo = 0;
function onMessageCallback(data) {
    disable(true);

    data = JSON.parse(data);
	packetNo++;
	quickOutput('Getting packet no ' + packetNo);
	
    if (data.progressInterval || data.message) {
		if(data.progressInterval)
			progressInterval = data.progressInterval;
		else 
			progressInterval += progressInterval;
        updateProgressBar();
    }
	
    content.push(data.message);
	
    if(data.last == true) {
		saveToDisk(content.join(''), data.name);

        quickOutput(data.name + ' received successfully!');

        content = [];
		packetNo = 0;
		
        hideProgressBar();
    }
}

var file, fileElement = document.getElementById('file');
fileElement.onchange = function() {
    file = fileElement.files[0];
    if (!file) return;

    var reader = new window.FileReader();
    reader.readAsDataURL(file);
    reader.onload = onReadAsText;

    disable(true);
};

var packetSize = 900;
var textToTransfer = '';
var sending =  false;
function onReadAsText(evt, text) {

    var data = {
        name: file.name,
        type: file.type,
        last: false,
        progressInterval: 0,
		message: ''
    };

    if (evt) {
		
        text = evt.target.result;
        progressInterval = parseInt(text.length / (parseInt(text.length / packetSize)  * 100));
        data.progressInterval = progressInterval;
		quickOutput('text.length: '+ text.length);
		sending = true;
    }

    updateProgressBar();

    if (text.length > packetSize) {
        data.message = text.slice(0, packetSize);
    } else {
        data.message = text;
        data.last = true;
        text = '';

        quickOutput(file.name + ' shared successfully!');

        hideProgressBar();
    }

    postMessage(JSON.stringify(data));
	
	textToTransfer = text.slice(data.message.length);
	if(textToTransfer.length)
	{
		setTimeout(function() {
			onReadAsText(null, textToTransfer);
		}, 30);
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

function quickOutput(message)
{
	if(!document.body) document.documentElement.appendChild(document.createElement('body'));
	
	var div = document.createElement('div');
	div.innerHTML = message;
	document.body.insertBefore(div, document.body.childNodes[0]);
}