// Muaz Khan     - https://github.com/muaz-khan
// MIT License   - https://www.WebRTC-Experiment.com/licence/
// Source Code   - https://github.com/muaz-khan/Chrome-Extensions

var iframe = document.querySelector('iframe');

var btnSelectFile = document.querySelector('.btn-select-file');

btnSelectFile.onclick = function() {
    var fileSelector = new FileSelector();
    fileSelector.selectSingleFile(function(file) {
        btnSelectFile.style.left = '5px';
        btnSelectFile.style.right = 'auto';
        btnSelectFile.style.zIndex = 10;
        btnSelectFile.style.top = '5px';
        btnSelectFile.style.outline = 'none';

        document.querySelector('.overlay').style.display = 'none';
        iframe.style.display = 'block';

        if(file.type.match(/image|video|audio|pdf|txt|js|css|php|py/g)) {
            iframe.src = URL.createObjectURL(file);
        }
        else {
            iframe.src = 'images/unknown.png';
        }

        iframe.onload = function() {
            iframe.contentWindow.document.body.style.textAlign = 'center';
            iframe.contentWindow.document.body.style.background = 'black';
        };

        onFileSelected(file);
    });
};

var connection;
var lastSelectedFile;

var room_id = '';

// 60k -- assuming receiving client is chrome
var chunk_size = 60 * 1000;

function setupWebRTCConnection() {
    if (connection) {
        return;
    }

    // www.RTCMultiConnection.org/docs/
    connection = new RTCMultiConnection();

    connection.setCustomSocketHandler(PubNubConnection);
    
    connection.chunkSize = chunk_size;

    connection.sdpConstraints.mandatory = {
        OfferToReceiveAudio: false,
        OfferToReceiveVideo: false
    };

    connection.enableFileSharing = true;

    if(room_id && room_id.length) {
        connection.userid = room_id;
    }

    connection.channel = connection.sessionid = connection.userid;

    connection.session = {
        data: true,
        oneway: true
    };

    connection.filesContainer = logsDiv;

    connection.onopen = function(e) {
        appendLog('Data connection has been opened between you and <b>' + e.userid + '</b>');

        if(!lastSelectedFile) return;
        var file = lastSelectedFile;
        setTimeout(function() {
            appendLog('Sharing file <b>' + file.name + '</b> ( ' + bytesToSize(file.size) + ' ) with <b>' + e.userid + '</b>');
            connection.shareFile(file, e.userid);
        }, 300);
    };

    setFileProgressBarHandlers(connection);

    connection.onUserStatusChanged = function(user) {
        incrementOrDecrementUsers(user);
    };

    connection.onleave = function(user) {
        user.status = 'offline';
        connection.onUserStatusChanged(user);
    };

    connection.open(connection.channel);

    var resultingURL = 'https://www.webrtc-experiment.com/file-receiver/file-receiver.html?r=' + connection.channel;

    document.querySelector('header').innerHTML = "<a href='" + resultingURL + "' target=_blank style='font-size: 20px;'>Right-click to copy & share this private URL!</a>";
}

function setFileProgressBarHandlers(connection) {
    var progressHelper = {};

    // www.RTCMultiConnection.org/docs/onFileStart/
    connection.onFileStart = function(file) {
        var div = document.createElement('div');
        div.id = file.uuid;
        div.title = file.name;
        div.innerHTML = '<label>0%</label> <progress></progress>';

        if (file.remoteUserId) {
            div.innerHTML += ' (Sharing with:' + file.remoteUserId + ')';
        }

        connection.filesContainer.insertBefore(div, connection.filesContainer.firstChild);

        if (!file.remoteUserId) {
            progressHelper[file.uuid] = {
                div: div,
                progress: div.querySelector('progress'),
                label: div.querySelector('label')
            };
            progressHelper[file.uuid].progress.max = file.maxChunks;
            return;
        }

        if (!progressHelper[file.uuid]) {
            progressHelper[file.uuid] = {};
        }

        progressHelper[file.uuid][file.remoteUserId] = {
            div: div,
            progress: div.querySelector('progress'),
            label: div.querySelector('label')
        };
        progressHelper[file.uuid][file.remoteUserId].progress.max = file.maxChunks;
    };

    // www.RTCMultiConnection.org/docs/onFileProgress/
    connection.onFileProgress = function(chunk) {
        var helper = progressHelper[chunk.uuid];
        if (!helper) {
            return;
        }
        if (chunk.remoteUserId) {
            helper = progressHelper[chunk.uuid][chunk.remoteUserId];
            if (!helper) {
                return;
            }
        }

        helper.progress.value = chunk.currentPosition || chunk.maxChunks || helper.progress.max;
        updateLabel(helper.progress, helper.label);
    };

    // www.RTCMultiConnection.org/docs/onFileEnd/
    connection.onFileEnd = function(file) {
        var div = document.getElementById(file.uuid);
        if(div) {
            div.parentNode.removeChild(div);
        }

        if (file.remoteUserId === connection.userid) return;
        appendLog('Successfully shared file <b>' + file.name + '</b> ( ' + bytesToSize(file.size) + ' ) with <b>' + file.remoteUserId + '</b>');
    };

    function updateLabel(progress, label) {
        if (progress.position === -1) {
            return;
        }

        var position = +progress.position.toFixed(2).split('.')[1] || 100;
        label.innerHTML = position + '%';
    }
}

function bytesToSize(bytes) {
    var k = 1000;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
        return '0 Bytes';
    }
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}

function onFileSelected(file) {
    var innerHTML = 'You selected:<br><b>' + file.name + '</b><br><small>' + bytesToSize(file.size) + '</small>';
    appendLog(innerHTML);

    lastSelectedFile = file;

    if (connection) {
        connection.shareFile(file);
    }
}

var numberOfUsers = document.getElementById('number-of-users');
function incrementOrDecrementUsers(user) {
    if(!numberOfUsers.getAttribute('data-users')) {
        numberOfUsers.setAttribute('data-users', '');
    }
    if(numberOfUsers.getAttribute('data-users').indexOf(user.userid) !== -1 && user.status === 'offline') {
        numberOfUsers.innerHTML = parseInt(numberOfUsers.innerHTML) -1;
        return;
    }

    numberOfUsers.innerHTML = parseInt(numberOfUsers.innerHTML) + 1;
    numberOfUsers.setAttribute('data-users', numberOfUsers.getAttribute('data-users') + ',' + user.userid);
}

var logsDiv = document.getElementById('logs');

function appendLog(html) {
    var div = document.createElement('div');
    div.innerHTML = '<p>' + html + '</p>';
    logsDiv.insertBefore(div, logsDiv.firstChild);
}

chrome.storage.sync.get(null, function(items) {
    if (items['room_id']) {
        room_id = items['room_id'];
    }

    if (items['chunk_size']) {
        chunk_size = parseInt(items['chunk_size']);
    }

    setupWebRTCConnection();
});
