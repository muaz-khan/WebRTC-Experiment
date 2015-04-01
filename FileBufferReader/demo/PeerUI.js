// Last time updated at Sep 07, 2014, 08:32:23

// Latest file can be found here: https://cdn.webrtc-experiment.com/FileBufferReader.js

// Muaz Khan    - www.MuazKhan.com
// MIT License  - www.WebRTC-Experiment.com/licence
// Source Code  - https://github.com/muaz-khan/FileBufferReader

// _________
// PeerUI.js

var setupOffer = document.getElementById('setup-offer'), innerHTML;

var SIGNALING_URI = 'wss://ws-muazkh.c9.io:443';

var channel = location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');
var websocket = new WebSocket(SIGNALING_URI);
websocket.onopen = function() {
    innerHTML = '<span>Setup</span> <span>WebRTC Connection</span>';
    setupOffer.innerHTML = innerHTML;
    setupOffer.style.color = '';
        
    console.log('websocket connection opened!');
    websocket.push(JSON.stringify({
        open: true,
        channel: channel
    }));
};
websocket.push = websocket.send;
websocket.send = function(data) {
    if (websocket.readyState != 1) {
        console.warn('websocket connection is not opened yet.');
        return setTimeout(function() {
            websocket.send(data);
        }, 1000);
    }

    websocket.push(JSON.stringify({
        data: data,
        channel: channel
    }));
};

var progressHelper = {};
var outputPanel = document.querySelector('.output-panel');

var FileHelper = {
    onBegin: function(file) {
        var li = document.createElement('li');
        li.title = file.name;
        li.innerHTML = '<label>0%</label> <progress></progress>';
        outputPanel.insertBefore(li, outputPanel.firstChild);
        progressHelper[file.uuid] = {
            li: li,
            progress: li.querySelector('progress'),
            label: li.querySelector('label')
        };
        progressHelper[file.uuid].progress.max = file.maxChunks;
    },
    onEnd: function(file) {
        progressHelper[file.uuid].li.innerHTML = '<a href="' + file.url + '" target="_blank" download="' + file.name + '">' + file.name + '</a>';
    },
    onProgress: function(chunk) {
        var helper = progressHelper[chunk.uuid];
        helper.progress.value = chunk.currentPosition || chunk.maxChunks || helper.progress.max;
        updateLabel(helper.progress, helper.label);
    }
};

// RTCPeerConection
// ----------------
var peerConnection = new PeerConnection(websocket);

peerConnection.onuserfound = function(userid) {
    setupOffer.className += ' disabled';
    setupOffer.innerHTML = 'Please wait a few seconds.';
    
    peerConnection.sendParticipationRequest(userid);
};

peerConnection.onopen = function() {
    innerHTML = '<span>PeerConnection</span> <span>is established.</span>';
    setupOffer.innerHTML = innerHTML;
    setupOffer.style.color = 'green';
    if (setupOffer.className.indexOf('disabled') != -1) setupOffer.className += ' disabled';

    btnSelectFile.disabled = false;
};

peerConnection.onclose = function() {
    onCloseOrOnError('<span>PeerConnection</span> <span>is closed.</span>');
};

peerConnection.onerror = function() {
    onCloseOrOnError('<span>Something</span> <span>went wrong.</span>');
};

// getNextChunkCallback gets next available buffer
// you need to send that buffer using WebRTC data channels
function getNextChunkCallback(nextChunk, isLastChunk) {
    if(isLastChunk) {
        // alert('File Successfully sent.');
    }
    
    // sending using WebRTC data channels
    peerConnection.send(nextChunk);
};

peerConnection.ondata = function(chunk) {
    if (chunk instanceof ArrayBuffer || chunk instanceof DataView) {
        // array buffers are passed using WebRTC data channels
        // need to convert data back into JavaScript objects
    
        fileBufferReader.convertToObject(chunk, function(object) {
            peerConnection.ondata(object);
        });
        return;
    }
    
    // if target user requested next chunk
    if(chunk.readyForNextChunk) {
        fileBufferReader.getNextChunk(chunk.uuid, getNextChunkCallback);
        return;
    }
    
    // if chunk is received
    fileBufferReader.addChunk(chunk, function(promptNextChunk) {
        // request next chunk
        peerConnection.send(promptNextChunk);
    });
};

// -------------------------
// using FileBufferReader.js

var fileSelector = new FileSelector();
var fileBufferReader = new FileBufferReader();

fileBufferReader.onBegin    = FileHelper.onBegin;
fileBufferReader.onProgress = FileHelper.onProgress;
fileBufferReader.onEnd      = FileHelper.onEnd;

var btnSelectFile = document.getElementById('select-file');
btnSelectFile.onclick = function() {
    btnSelectFile.disabled = true;
    fileSelector.selectSingleFile(function(file) {
        fileBufferReader.readAsArrayBuffer(file, function(uuid) {
            fileBufferReader.getNextChunk(uuid, getNextChunkCallback);
            btnSelectFile.disabled = false;
        });
    });
};

// --------------------------------------------------------

function updateLabel(progress, label) {
    if (progress.position == -1) return;
    var position = +progress.position.toFixed(2).split('.')[1] || 100;
    label.innerHTML = position + '%';
}

// --------------------------------------------------------
setupOffer.onclick = function() {
    if (setupOffer.className.indexOf('disabled') != -1) {
        innerHTML = setupOffer.innerHTML;
        setupOffer.innerHTML = "Don't Click!";
        setTimeout(function() {
            setupOffer.innerHTML = innerHTML;
        }, 500);
        return;
    }

    setupOffer.className += ' disabled';
    setupOffer.innerHTML = 'Please wait a few seconds.';

    // start broadcasting userid
    peerConnection.startBroadcasting();
};

function onCloseOrOnError(_innerHTML) {
    innerHTML = _innerHTML;
    setupOffer.innerHTML = innerHTML;
    setupOffer.style.color = 'red';
    setupOffer.className = 'button';

    setTimeout(function() {
        innerHTML = '<span>Setup</span> <span>WebRTC Connection</span>';
        setupOffer.innerHTML = innerHTML;
        setupOffer.style.color = '';
    }, 1000);

    document.querySelector('input[type=file]').disabled = true;
}

var uniqueToken = document.getElementById('unique-token');
if (uniqueToken)
    if (location.hash.length > 2)
        uniqueToken.parentNode.parentNode.parentNode.innerHTML = '<h2 style="text-align:center;"><a href="' + location.href + '" target="_blank">Share this Link!</a></h2>';
    else
        uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = '#' + (Math.round(Math.random() * 999999999) + 999999999);
