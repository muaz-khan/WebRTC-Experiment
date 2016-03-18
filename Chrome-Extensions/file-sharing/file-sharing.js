// Muaz Khan     - https://github.com/muaz-khan
// MIT License   - https://www.WebRTC-Experiment.com/licence/
// Source Code   - https://github.com/muaz-khan/RTCMultiConnection
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

    // to make sure, "connection-reconnect" doesn't sends files again
    connection.fileReceived = {};

    // by default, socket.io server is assumed to be deployed on your own URL
    // connection.socketURL = '/';

    // comment-out below line if you do not have your own socket.io server
    connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';

    connection.socketMessageEvent = 'file-sharing-demo';

    connection.chunkSize = chunk_size;

    connection.sdpConstraints.mandatory = {
        OfferToReceiveAudio: false,
        OfferToReceiveVideo: false
    };

    connection.enableFileSharing = true;

    if (room_id && room_id.length) {
        connection.userid = room_id;
    }

    if(!room_id) {
        room_id = connection.token();
    }

    connection.channel = connection.sessionid = room_id;

    connection.session = {
        data: true,
        // oneway: true --- to make it one-to-many
    };

    connection.filesContainer = logsDiv;

    connection.connectedWith = {};

    connection.onmessage = function(event) {
        if (event.data.doYouWannaReceiveThisFile) {
            if (!connection.fileReceived[event.data.fileName]) {
                connection.send({
                    yesIWannaReceive: true,
                    fileName: event.data.fileName
                });
            }
        }

        if (event.data.yesIWannaReceive && !!lastSelectedFile) {
            connection.shareFile(lastSelectedFile, event.userid);
        }
    };

    connection.onopen = function(e) {
        try {
            chrome.power.requestKeepAwake('display');
        } catch (e) {}

        if (connection.connectedWith[e.userid]) return;
        connection.connectedWith[e.userid] = true;

        var message = '<b>' + e.userid + '</b><br>is connected.';
        appendLog(message);

        if (!lastSelectedFile) return;

        // already shared the file

        var file = lastSelectedFile;
        setTimeout(function() {
            appendLog('Sharing file<br><b>' + file.name + '</b><br>Size: <b>' + bytesToSize(file.size) + '<b><br>With <b>' + connection.getAllParticipants().length + '</b> users');

            connection.send({
                doYouWannaReceiveThisFile: true,
                fileName: file.name
            });
        }, 500);
    };

    connection.onclose = function(e) {
        incrementOrDecrementUsers();

        if (connection.connectedWith[e.userid]) return;

        appendLog('Data connection has been closed between you and <b>' + e.userid + '</b>. Re-Connecting..');
        connection.join(room_id);
    };

    connection.onerror = function(e) {
        if (connection.connectedWith[e.userid]) return;

        appendLog('Data connection failed. between you and <b>' + e.userid + '</b>. Retrying..');
    };

    setFileProgressBarHandlers(connection);

    connection.onUserStatusChanged = function(user) {
        incrementOrDecrementUsers();
    };

    connection.onleave = function(user) {
        user.status = 'offline';
        connection.onUserStatusChanged(user);
        incrementOrDecrementUsers();
    };

    var message = 'Connecting room:<br><b>' + connection.channel + '</b>';
    appendLog(message);

    connection.openOrJoin(connection.channel, function(isRoomExists) {
        var message = 'Successfully connected to room:<br><b>' + room_id + '</b>';
        // if (isRoomEists) { }
        appendLog(message);

        document.querySelector('h1').innerHTML = '<a href="https://rtcxp.com/fs#' + room_id + '" target="_blank">Private Room URL: #' + room_id + '</a>';
    });

    window.connection = connection;
}

function setFileProgressBarHandlers(connection) {
    var progressHelper = {};

    // www.RTCMultiConnection.org/docs/onFileStart/
    connection.onFileStart = function(file) {
        if (connection.fileReceived[file.name]) return;

        var div = document.createElement('div');
        div.style.borderBottom = '1px solid black';
        div.style.padding = '2px 4px';
        div.id = file.uuid;

        var message = '';
        if (file.userid == connection.userid) {
            message += 'Sharing with:' + file.remoteUserId;
        } else {
            message += 'Receiving from:' + file.userid;
        }

        message += '<br><b>' + file.name + '</b>.';
        message += '<br>Size: <b>' + bytesToSize(file.size) + '</b>';
        message += '<br><label>0%</label> <progress></progress>';

        div.innerHTML = message;

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

        var div = document.getElementById(file.uuid);
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
            var div = appendLog(message);
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
        connection.send({
            doYouWannaReceiveThisFile: true,
            fileName: file.name
        });
    }
}

var numberOfUsers = document.getElementById('number-of-users');

function incrementOrDecrementUsers() {
    numberOfUsers.innerHTML = connection ? connection.getAllParticipants().length : 0;
}

var logsDiv = document.getElementById('logs');

function appendLog(html) {
    var div = document.createElement('div');
    div.innerHTML = '<p>' + html + '</p>';
    logsDiv.insertBefore(div, logsDiv.firstChild);

    return div;
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
        iframe.src = 'https://cdn.webrtc-experiment.com/images/folder-icon.png';
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
