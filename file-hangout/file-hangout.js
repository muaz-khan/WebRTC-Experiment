// Muaz Khan       - wwww.MuazKhan.com
// MIT License     - www.WebRTC-Experiment.com/licence
// Documentation   - github.com/muaz-khan/WebRTC-Experiment/tree/master/file-hangout
// =============
// file-hangout.js

(function selfInvoker() {
    setTimeout(function() {
        if (typeof window.RTCPeerConnection != 'undefined') setUserInterface();
        else selfInvoker();
    }, 1000);
})();

function setUserInterface() {
    hangoutUI = hangout(config);

    startConferencing = document.getElementById('start-conferencing');
    if (startConferencing)
        startConferencing.onclick = function() {
            hangoutUI.createRoom({
                userName: (document.getElementById('conference-name') || { }).value || 'Anonymous',
                roomName: (document.getElementById('conference-name') || { }).value || 'Anonymous'
            });
            hideUnnecessaryStuff();
        };
    participants = document.getElementById('participants');
    roomsList = document.getElementById('rooms-list');

    chatOutput = document.getElementById('chat-output');

    fileElement = document.getElementById('file');
    fileElement.onchange = function() {
        var file = fileElement.files[0];

        var html = getFileHTML(file);
        var div = quickOutput('Now sending:', html);

        FileSender.send({
            channel: hangoutUI,
            file: file,
            onFileSent: function(file) {
                quickOutput(file.name, 'sent successfully!');
                disable(false);
                statusDiv.innerHTML = '';
                div.parentNode.removeChild(div);
            },
            onFileProgress: function(e) {
                statusDiv.innerHTML = e.sent + ' packets sent. ' + e.remaining + ' packets remaining.';
            }
        });

        return disable(true);
    };

    outputPanel = document.getElementById('output-panel');
    statusDiv = document.getElementById('status');
    unnecessaryStuffVisible = true;

    var uniqueToken = document.getElementById('unique-token');
    if (uniqueToken)
        if (location.hash.length > 2)
            uniqueToken.parentNode.parentNode.parentNode.innerHTML = '<h2 style="text-align:center;"><a href="' + location.href + '" target="_blank">Share this Link!</a></h2>';
        else
            uniqueToken.innerHTML = uniqueToken.parentNode.parentNode.href = '#' + (Math.round(Math.random() * 999999999) + 999999999);
}

var config = {
    openSocket: function(config) {
        var SIGNALING_SERVER = 'https://socketio-over-nodejs2.herokuapp.com:443/';

        config.channel = config.channel || location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');
        var sender = Math.round(Math.random() * 999999999) + 999999999;

        io.connect(SIGNALING_SERVER).emit('new-channel', {
            channel: config.channel,
            sender: sender
        });

        var socket = io.connect(SIGNALING_SERVER + config.channel);
        socket.channel = config.channel;
        socket.on('connect', function() {
            if (config.callback) config.callback(socket);
        });

        socket.send = function(message) {
            socket.emit('message', {
                sender: sender,
                data: message
            });
        };

        socket.on('message', config.onmessage);
    },
    onRoomFound: function(room) {
        var alreadyExist = document.getElementById(room.broadcaster);
        if (alreadyExist) return;

        if (typeof roomsList === 'undefined') roomsList = document.body;

        var tr = document.createElement('tr');
        tr.setAttribute('id', room.broadcaster);
        tr.style.fontSize = '.8em';
        tr.innerHTML = '<td>' + room.roomName + '</td>' +
            '<td><button class="join" id="' + room.roomToken + '">Join</button></td>';

        roomsList.insertBefore(tr, roomsList.firstChild);

        tr.onclick = function() {
            var tr = this;
            hangoutUI.joinRoom({
                roomToken: tr.querySelector('.join').id,
                joinUser: tr.id,
                userName: (document.getElementById('conference-name') || { }).value || 'Anonymous'
            });
            hideUnnecessaryStuff();
        };
    },
    onChannelOpened: function() {
        unnecessaryStuffVisible && hideUnnecessaryStuff();
        if (fileElement) fileElement.removeAttribute('disabled');
    },
    onChannelMessage: function(data) {
        if (data.sender && participants) {
            var tr = document.createElement('tr');
            tr.innerHTML = '<td>' + data.sender + ' is ready to receive files!</td>';
            participants.insertBefore(tr, participants.firstChild);
        } else onMessageCallback(data);
    }
};

var fileReceiver = new FileReceiver();

function onMessageCallback(data) {
    if (data.connected) {
        quickOutput('Your friend is connected.');
        return;
    }

    disable(true);

    // receive file packets
    fileReceiver.receive(data, {
        onFileReceived: function(fileName) {
            quickOutput(fileName, 'received successfully!');
            disable(false);
            statusDiv.innerHTML = '';
        },
        onFileProgress: function(e) {
            statusDiv.innerHTML = e.received + ' packets received. ' + e.remaining + ' packets remaining.';
        }
    });
}

function getFileHTML(file) {
    var url = file.url || URL.createObjectURL(file);
    var attachment = '<a href="' + url + '" download="">Click To Download</a><br>';
    attachment += '<iframe src="' + url + '" style="border:0;width:100%;min-height:300px;"></iframe></a>';
    return attachment;
}

// -------------------------

function getRandomString() {
    return (Math.random() * new Date().getTime()).toString(36).toUpperCase().replace( /\./g , '-');
}

var FileSender = {
    send: function(config) {
        var channel = config.channel,
            file = config.file;

        var packetSize = 10 * 1000,
            textToTransfer = '',
            numberOfPackets = 0,
            packets = 0;

        // uuid is used to uniquely identify sending instance
        var uuid = getRandomString();

        var reader = new window.FileReader();
        reader.readAsDataURL(file);
        reader.onload = onReadAsDataURL;

        function onReadAsDataURL(event, text) {
            var data = {
                type: 'file',
                uuid: uuid
            };

            if (event) {
                text = event.target.result;
                numberOfPackets = packets = data.packets = parseInt(text.length / packetSize);
            }

            if (config.onFileProgress)
                config.onFileProgress({
                    remaining: packets--,
                    length: numberOfPackets,
                    sent: numberOfPackets - packets
                }, uuid);

            if (text.length > packetSize) data.message = text.slice(0, packetSize);
            else {
                data.message = text;
                data.last = true;
                data.name = file.name;

                if (config.onFileSent) config.onFileSent(file);
            }

            // WebRTC-DataChannels.send(data, privateDataChannel)
            channel.send(JSON.stringify(data));

            textToTransfer = text.slice(data.message.length);

            if (textToTransfer.length) {
                setTimeout(function() {
                    onReadAsDataURL(null, textToTransfer);
                }, 100);
            }
        }
    }
};

function FileReceiver() {
    var content = { },
        packets = { },
        numberOfPackets = { };

    function receive(data, config) {
        // uuid is used to uniquely identify sending instance
        var uuid = data.uuid;

        if (data.packets) numberOfPackets[uuid] = packets[uuid] = parseInt(data.packets);

        if (config.onFileProgress)
            config.onFileProgress({
                remaining: packets[uuid]--,
                length: numberOfPackets[uuid],
                received: numberOfPackets[uuid] - packets[uuid]
            }, uuid);

        if (!content[uuid]) content[uuid] = [];

        content[uuid].push(data.message);

        if (data.last) {
            var dataURL = content[uuid].join('');
            var blob = FileConverter.DataUrlToBlob(dataURL);
            var virtualURL = (window.URL || window.webkitURL).createObjectURL(blob);
            
            // todo: should we use virtual-URL or data-URL?
            // FileSaver.SaveToDisk(dataURL, data.name);
            blob.url = virtualURL;
            var html = getFileHTML(blob);
            quickOutput('Download:', html);

            if (config.onFileReceived) config.onFileReceived(data.name);
            delete content[uuid];
        }
    }

    return {
        receive: receive
    };
}

var FileSaver = {
    SaveToDisk: function(fileUrl, fileName) {
        var hyperlink = document.createElement('a');
        hyperlink.href = fileUrl;
        hyperlink.target = '_blank';
        hyperlink.download = fileName || fileUrl;

        var mouseEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });

        hyperlink.dispatchEvent(mouseEvent);
        (window.URL || window.webkitURL).revokeObjectURL(hyperlink.href);
    }
};

var FileConverter = {
    DataUrlToBlob: function(dataURL) {
        var binary = atob(dataURL.substr(dataURL.indexOf(',') + 1));
        var array = [];
        for (var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }

        var type;

        try {
            type = dataURL.substr(dataURL.indexOf(':') + 1).split(';')[0];
        } catch(e) {
            type = 'text/plain';
        }

        return new Blob([new Uint8Array(array)], { type: type });
    }
};

function hideUnnecessaryStuff() {
    var visibleElements = document.getElementsByClassName('visible'),
        length = visibleElements.length;

    for (var i = 0; i < length; i++) {
        visibleElements[i].style.display = 'none';
    }
    unnecessaryStuffVisible = false;
    if (startConferencing) startConferencing.style.display = 'none';
}

function quickOutput(message, message2) {
    if (!outputPanel) return;
    if (message2) message = '<strong>' + message + '</strong> ' + message2;

    var tr = document.createElement('tr');
    tr.innerHTML = '<td style="width:80%;">' + message + '</td>';
    outputPanel.insertBefore(tr, outputPanel.firstChild);

    return tr;
}

function disable(_disable) {
    if (!fileElement) return;
    if (!_disable) fileElement.removeAttribute('disabled');
    else fileElement.setAttribute('disabled', true);
}

// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/file-hangout
// ----------
// hanogut.js

function hangout(config) {
    var self = {
        userToken: uniqueToken(),
        userName: 'Anonymous'
    },
        channels = '--',
        isbroadcaster,
        sockets = [],
        isGetNewRoom = true;

    var defaultSocket = { }, RTCDataChannels = [];

    function openDefaultSocket() {
        defaultSocket = config.openSocket({
            onmessage: onDefaultSocketResponse,
            callback: function(socket) {
                defaultSocket = socket;
            }
        });
    }

    function onDefaultSocketResponse(response) {
        if (response.userToken == self.userToken) return;

        if (isGetNewRoom && response.roomToken && response.broadcaster) config.onRoomFound(response);

        if (response.newParticipant && self.joinedARoom && self.broadcasterid == response.userToken) onNewParticipant(response.newParticipant);

        if (response.userToken && response.joinUser == self.userToken && response.participant && channels.indexOf(response.userToken) == -1) {
            channels += response.userToken + '--';
            openSubSocket({
                isofferer: true,
                channel: response.channel || response.userToken,
                closeSocket: true
            });
        }
    }

    function openSubSocket(_config) {
        if (!_config.channel) return;
        var socketConfig = {
            channel: _config.channel,
            onmessage: socketResponse,
            onopen: function() {
                if (isofferer && !peer) initPeer();
                sockets.push(socket);
            }
        };

        socketConfig.callback = function(_socket) {
            socket = _socket;
            this.onopen();
        };

        var socket = config.openSocket(socketConfig),
            isofferer = _config.isofferer,
            gotstream,
            inner = { },
            peer;

        var peerConfig = {
            onICE: function(candidate) {
                socket.send({
                    userToken: self.userToken,
                    candidate: {
                        sdpMLineIndex: candidate.sdpMLineIndex,
                        candidate: JSON.stringify(candidate.candidate)
                    }
                });
            },
            onChannelOpened: onChannelOpened,
            onChannelMessage: function(event) {
                config.onChannelMessage(event.data.size ? event.data : JSON.parse(event.data));
            }
        };

        function initPeer(offerSDP) {
            if (!offerSDP) {
                peerConfig.onOfferSDP = sendsdp;
            } else {
                peerConfig.offerSDP = offerSDP;
                peerConfig.onAnswerSDP = sendsdp;
            }

            peer = RTCPeerConnection(peerConfig);
        }

        function onChannelOpened(channel) {
            RTCDataChannels.push(channel);
            channel.send(JSON.stringify({
                sender: self.userName
            }));

            if (config.onChannelOpened) config.onChannelOpened(channel);

            if (isbroadcaster && channels.split('--').length > 3) {
                /* broadcasting newly connected participant for video-conferencing! */
                defaultSocket.send({
                    newParticipant: socket.channel,
                    userToken: self.userToken
                });
            }

            /* closing subsocket here on the offerer side */
            if (_config.closeSocket) socket = null;

            gotstream = true;
        }

        function sendsdp(sdp) {
            sdp = JSON.stringify(sdp);
            var part = parseInt(sdp.length / 3);

            var firstPart = sdp.slice(0, part),
                secondPart = sdp.slice(part, sdp.length - 1),
                thirdPart = '';

            if (sdp.length > part + part) {
                secondPart = sdp.slice(part, part + part);
                thirdPart = sdp.slice(part + part, sdp.length);
            }

            socket.send({
                userToken: self.userToken,
                firstPart: firstPart
            });

            socket.send({
                userToken: self.userToken,
                secondPart: secondPart
            });

            socket.send({
                userToken: self.userToken,
                thirdPart: thirdPart
            });
        }

        function socketResponse(response) {
            if (response.userToken == self.userToken) return;

            if (response.firstPart || response.secondPart || response.thirdPart) {
                if (response.firstPart) {
                    inner.firstPart = response.firstPart;
                    if (inner.secondPart && inner.thirdPart) selfInvoker();
                }
                if (response.secondPart) {
                    inner.secondPart = response.secondPart;
                    if (inner.firstPart && inner.thirdPart) selfInvoker();
                }

                if (response.thirdPart) {
                    inner.thirdPart = response.thirdPart;
                    if (inner.firstPart && inner.secondPart) selfInvoker();
                }
            }

            if (response.candidate && !gotstream) {
                peer && peer.addICE({
                    sdpMLineIndex: response.candidate.sdpMLineIndex,
                    candidate: JSON.parse(response.candidate.candidate)
                });
            }

            if (response.left) {
                if (peer && peer.peer) {
                    peer.peer.close();
                    peer.peer = null;
                }
            }
        }

        var invokedOnce = false;

        function selfInvoker() {
            if (invokedOnce) return;

            invokedOnce = true;

            inner.sdp = JSON.parse(inner.firstPart + inner.secondPart + inner.thirdPart);

            if (isofferer) peer.addAnswerSDP(inner.sdp);
            else initPeer(inner.sdp);
        }
    }

    function leave() {
        var length = sockets.length;
        for (var i = 0; i < length; i++) {
            var socket = sockets[i];
            if (socket) {
                socket.send({
                    left: true,
                    userToken: self.userToken
                });
                delete sockets[i];
            }
        }
    }

    window.onunload = function() {
        leave();
    };

    window.onkeyup = function(e) {
        if (e.keyCode == 116) leave();
    };

    function startBroadcasting() {
        defaultSocket && defaultSocket.send({
            roomToken: self.roomToken,
            roomName: self.roomName,
            broadcaster: self.userToken
        });
        setTimeout(startBroadcasting, 3000);
    }

    function onNewParticipant(channel) {
        if (!channel || channels.indexOf(channel) != -1 || channel == self.userToken) return;
        channels += channel + '--';

        var new_channel = uniqueToken();
        openSubSocket({
            channel: new_channel,
            closeSocket: true
        });

        defaultSocket.send({
            participant: true,
            userToken: self.userToken,
            joinUser: channel,
            channel: new_channel
        });
    }

    function uniqueToken() {
        var s4 = function() {
            return Math.floor(Math.random() * 0x10000).toString(16);
        };
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
    }

    openDefaultSocket();
    return {
        createRoom: function(_config) {
            self.roomName = _config.roomName || 'Anonymous';
            self.roomToken = uniqueToken();
            if (_config.userName) self.userName = _config.userName;

            isbroadcaster = true;
            isGetNewRoom = false;
            startBroadcasting();
        },
        joinRoom: function(_config) {
            self.roomToken = _config.roomToken;
            if (_config.userName) self.userName = _config.userName;
            isGetNewRoom = false;

            self.joinedARoom = true;
            self.broadcasterid = _config.joinUser;

            openSubSocket({
                channel: self.userToken
            });

            defaultSocket.send({
                participant: true,
                userToken: self.userToken,
                joinUser: _config.joinUser
            });
        },
        send: function(data) {
            var length = RTCDataChannels.length;
            if (!length) return;
            for (var i = 0; i < length; i++) {
                if (RTCDataChannels[i].readyState == 'open') {
                    RTCDataChannels[i].send(data);
                }
            }
        }
    };
}
