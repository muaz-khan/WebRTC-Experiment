// Muaz Khan     - https://github.com/muaz-khan
// MIT License   - https://www.WebRTC-Experiment.com/licence/
// Source Code   - https://github.com/muaz-khan/Chrome-Extensions
// Muaz Khan     - https://github.com/muaz-khan
var iframe = document.querySelector('iframe');
var btnSelectFile = document.querySelector('.btn-select-file');
btnSelectFile.onclick = function() {
    var fileSelector = new FileSelector();
    fileSelector.selectSingleFile(function(file) {
        previewFile(file);
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
    // connection.autoReDialOnFailure = false

    // to make sure, "connection-reconnect" doesn't sends files again
    connection.fileReceived = {};
    connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
    connection.socketMessageEvent = 'file-sharing';
    connection.chunkSize = chunk_size;
    connection.sdpConstraints.mandatory = {
        OfferToReceiveAudio: false,
        OfferToReceiveVideo: false
    };
    connection.enableFileSharing = true;
    if (room_id && room_id.length) {
        connection.userid = room_id;
    }

    var resultingURL = 'https://rtcmulticonnection.herokuapp.com/demos/file-sharing.html#' + connection.userid;
    if (location.href.indexOf('rtcmulticonnection.herokuapp.com') !== -1) {
        // connection.userid = (Math.random() * 100).toString().replace('.', '');
        resultingURL = location.href;
    }

    connection.channel = connection.sessionid = resultingURL.split('#').pop();
    connection.session = {
        data: true,
        oneway: true // --- to make it one-to-many
    };
    connection.filesContainer = logsDiv;
    connection.connectedWith = {};
    connection.onopen = function(e) {
        if (connection.connectedWith[e.userid]) return;
        connection.connectedWith[e.userid] = true;
        var message = '<b>' + e.userid + '</b><br>is connected.';
        appendLog(message);
        if (!lastSelectedFile) return;
        // already shared the file
        var file = lastSelectedFile;
        setTimeout(function() {
            appendLog('Sharing file<br><b>' + file.name + '</b>Size: <b>' + bytesToSize(file.size) + '<b><br>With <b>' + connection.getAllParticipants().length + '</b> users');
            connection.shareFile(file);
        }, 500);
    };
    connection.onclose = function(e) {
        if (connection.connectedWith[e.userid]) return;
        appendLog('Data connection has been closed between you and <b>' + e.userid + '</b>. Re-Connecting..');
    };
    connection.onerror = function(e) {
        if (connection.connectedWith[e.userid]) return;
        appendLog('Data connection failed. between you and <b>' + e.userid + '</b>. Retrying..');
    };
    setFileProgressBarHandlers(connection);
    connection.onUserStatusChanged = function(user) {
        incrementOrDecrementUsers(user);
    };
    connection.onleave = function(user) {
        user.status = 'offline';
        connection.onUserStatusChanged(user);
    };
    var message = 'Connecting room:<br><b>' + connection.channel + '</b>';
    appendLog(message);
    connection.open(connection.channel, function() {
        var message = 'Successfully connected to room:<br><b>' + connection.channel + '</b>';
        appendLog(message);
    });

    document.querySelector('header').innerHTML = "<a href='" + resultingURL + "' target=_blank style='font-size: 20px;'>Right-click to copy & share this private URL!</a>";
}

function setFileProgressBarHandlers(connection) {
    var progressHelper = {};
    // www.RTCMultiConnection.org/docs/onFileStart/
    connection.onFileStart = function(file) {
        if (connection.fileReceived[file.name]) return;
        if(document.getElementById('file-' + file.name.replace('.', ''))) {
            return;
        }

        var div = document.createElement('div');
        div.id = 'file-' + file.name.replace('.', '');
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
        if (connection.fileReceived[chunk.name]) return;
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
        if (connection.fileReceived[file.name]) return;
        var div = document.getElementById('file-' + file.name.replace('.', ''));
        if (div) {
            div.parentNode.removeChild(div);
        }
        if (file.remoteUserId === connection.userid) {
            previewFile(file);
            connection.fileReceived[file.name] = file;
            var message = 'Successfully received file';
            message += '<br><b>' + file.name + '</b>.';
            message += '<br>Size: <b>' + bytesToSize(file.size) + '</b>.';
            message += '<br><a href="' + file.url + '" target="_blank" download="' + file.name + '">Download</a>';
            appendLog(message);
            return;
        }
        var message = 'Successfully shared file';
        message += '<br><b>' + file.name + '</b>.';
        message += '<br>With: <b>' + file.remoteUserId + '</b>.';
        message += '<br>Size: <b>' + bytesToSize(file.size) + '</b>.';
        appendLog(message);
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
    var innerHTML = 'You selected:<br><b>' + file.name + '</b><br>Size: <b>' + bytesToSize(file.size) + '</b>';
    appendLog(innerHTML);
    lastSelectedFile = file;
    if (connection) {
        connection.shareFile(file);
    }
}
var numberOfUsers = document.getElementById('number-of-users');

function incrementOrDecrementUsers(user) {
    if (!numberOfUsers.getAttribute('data-users')) {
        numberOfUsers.setAttribute('data-users', '');
    }
    if (numberOfUsers.getAttribute('data-users').indexOf(user.userid) !== -1 && user.status === 'offline') {
        numberOfUsers.innerHTML = parseInt(numberOfUsers.innerHTML) - 1;
        if (parseInt(numberOfUsers.innerHTML) < 0) {
            numberOfUsers.innerHTML = 0;
        }
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

function previewFile(file) {
    btnSelectFile.style.left = '5px';
    btnSelectFile.style.right = 'auto';
    btnSelectFile.style.zIndex = 10;
    btnSelectFile.style.top = '5px';
    btnSelectFile.style.outline = 'none';
    document.querySelector('.overlay').style.display = 'none';
    iframe.style.display = 'block';
    if (file.type.match(/image|video|audio|pdf|txt|javascript|css|php|py/g)) {
        iframe.src = URL.createObjectURL(file);
    } else {
        iframe.src = 'https://i.imgur.com/2SUIhbf.png?1';
    }
    iframe.onload = function() {
        Array.prototype.slice.call(iframe.contentWindow.document.body.querySelectorAll('*')).forEach(function(element) {
            element.style.maxWidth = '100%';
        });

        if (file.type.match(/image|video|audio|pdf/g)) {
            iframe.contentWindow.document.body.style.textAlign = 'center';
            iframe.contentWindow.document.body.style.background = 'black';
            iframe.contentWindow.document.body.style.color = 'white';
            return;
        }
        iframe.contentWindow.document.body.style.textAlign = 'left';
        iframe.contentWindow.document.body.style.background = 'white';
        iframe.contentWindow.document.body.style.color = 'black';
    };
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
