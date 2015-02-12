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
                userName: prompt('Enter your name', 'Anonymous'),
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

        FileSender.send({
            channel: hangoutUI,
            file: file,
            onFileSent: function(file) {
                quickOutput(file.name, 'sent successfully!');
                disable(false);
                statusDiv.innerHTML = '';
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
        // https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md
        // This method "openSocket" can be defined in HTML page
        // to use any signaling gateway either XHR-Long-Polling or SIP/XMPP or WebSockets/Socket.io
        // or WebSync/SignalR or existing implementations like signalmaster/peerserver or sockjs etc.

        var channel = config.channel || location.href.replace( /\/|:|#|%|\.|\[|\]/g , '');
        var socket = new Firebase('https://webrtc.firebaseIO.com/' + channel);
        socket.channel = channel;
        socket.on("child_added", function(data) {
            config.onmessage && config.onmessage(data.val());
        });
        socket.send = function(data) {
            this.push(data);
        };
        config.onopen && setTimeout(config.onopen, 1);
        socket.onDisconnect().remove();
        return socket;
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
                userName: prompt('Enter your name', 'Anonymous')
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
            FileSaver.SaveToDisk(dataURL, data.name);

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

// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCPeerConnection
// -------------------------
// RTCPeerConnection-v1.6.js

// Last time updated at April 16, 2014, 08:32:23

// Muaz Khan     - github.com/muaz-khan
// MIT License   - www.WebRTC-Experiment.com/licence
// Documentation - github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCPeerConnection

window.moz = !!navigator.mozGetUserMedia;
var chromeVersion = !!navigator.mozGetUserMedia ? 0 : parseInt(navigator.userAgent.match( /Chrom(e|ium)\/([0-9]+)\./ )[2]);

function RTCPeerConnection(options) {
    var w = window,
        PeerConnection = w.mozRTCPeerConnection || w.webkitRTCPeerConnection,
        SessionDescription = w.mozRTCSessionDescription || w.RTCSessionDescription,
        IceCandidate = w.mozRTCIceCandidate || w.RTCIceCandidate;

    var iceServers = [];

    if (moz) {
        iceServers.push({
            url: 'stun:23.21.150.121'
        });

        iceServers.push({
            url: 'stun:stun.services.mozilla.com'
        });
    }

    if (!moz) {
        iceServers.push({
            url: 'stun:stun.l.google.com:19302'
        });

        iceServers.push({
            url: 'stun:stun.anyfirewall.com:3478'
        });
    }

    if (!moz && chromeVersion < 28) {
        iceServers.push({
            url: 'turn:homeo@turn.bistri.com:80',
            credential: 'homeo'
        });
    }

    if (!moz && chromeVersion >= 28) {
        iceServers.push({
            url: 'turn:turn.bistri.com:80',
            credential: 'homeo',
            username: 'homeo'
        });

        iceServers.push({
            url: 'turn:turn.anyfirewall.com:443?transport=tcp',
            credential: 'webrtc',
            username: 'webrtc'
        });
    }

    if (options.iceServers) iceServers = options.iceServers;

    iceServers = {
        iceServers: iceServers
    };

    console.debug('ice-servers', JSON.stringify(iceServers.iceServers, null, '\t'));

    var optional = {
        optional: []
    };

    var peer = new PeerConnection(iceServers, optional);

    openOffererChannel();

    peer.onicecandidate = function(event) {
        if (event.candidate)
            options.onICE(event.candidate);
    };

    // attachStream = MediaStream;
    if (options.attachStream) peer.addStream(options.attachStream);

    // attachStreams[0] = audio-stream;
    // attachStreams[1] = video-stream;
    // attachStreams[2] = screen-capturing-stream;
    if (options.attachStreams && options.attachStream.length) {
        var streams = options.attachStreams;
        for (var i = 0; i < streams.length; i++) {
            peer.addStream(streams[i]);
        }
    }

    peer.onaddstream = function(event) {
        var remoteMediaStream = event.stream;

        // onRemoteStreamEnded(MediaStream)
        remoteMediaStream.onended = function() {
            if (options.onRemoteStreamEnded) options.onRemoteStreamEnded(remoteMediaStream);
        };

        // onRemoteStream(MediaStream)
        if (options.onRemoteStream) options.onRemoteStream(remoteMediaStream);

        console.debug('on:add:stream', remoteMediaStream);
    };

    var constraints = options.constraints || {
        optional: [],
        mandatory: {
            OfferToReceiveAudio: true,
            OfferToReceiveVideo: true
        }
    };

    console.debug('sdp-constraints', JSON.stringify(constraints.mandatory, null, '\t'));

    // onOfferSDP(RTCSessionDescription)

    function createOffer() {
        if (!options.onOfferSDP) return;

        peer.createOffer(function(sessionDescription) {
            sessionDescription.sdp = setBandwidth(sessionDescription.sdp);
            peer.setLocalDescription(sessionDescription);
            options.onOfferSDP(sessionDescription);

            console.debug('offer-sdp', sessionDescription.sdp);
        }, onSdpError, constraints);
    }

    // onAnswerSDP(RTCSessionDescription)

    function createAnswer() {
        if (!options.onAnswerSDP) return;

        //options.offerSDP.sdp = addStereo(options.offerSDP.sdp);
        console.debug('offer-sdp', options.offerSDP.sdp);
        peer.setRemoteDescription(new SessionDescription(options.offerSDP), onSdpSuccess, onSdpError);
        peer.createAnswer(function(sessionDescription) {
            sessionDescription.sdp = setBandwidth(sessionDescription.sdp);
            peer.setLocalDescription(sessionDescription);
            options.onAnswerSDP(sessionDescription);
            console.debug('answer-sdp', sessionDescription.sdp);
        }, onSdpError, constraints);
    }

    // if Mozilla Firefox & DataChannel; offer/answer will be created later
    if ((options.onChannelMessage && !moz) || !options.onChannelMessage) {
        createOffer();
        createAnswer();
    }

    // options.bandwidth = { audio: 50, video: 256, data: 30 * 1000 * 1000 }
    var bandwidth = options.bandwidth;

    function setBandwidth(sdp) {
        if (moz || !bandwidth /* || navigator.userAgent.match( /Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i ) */) return sdp;

        // remove existing bandwidth lines
        sdp = sdp.replace( /b=AS([^\r\n]+\r\n)/g , '');

        if (bandwidth.audio) {
            sdp = sdp.replace( /a=mid:audio\r\n/g , 'a=mid:audio\r\nb=AS:' + bandwidth.audio + '\r\n');
        }

        if (bandwidth.video) {
            sdp = sdp.replace( /a=mid:video\r\n/g , 'a=mid:video\r\nb=AS:' + bandwidth.video + '\r\n');
        }

        if (bandwidth.data) {
            sdp = sdp.replace( /a=mid:data\r\n/g , 'a=mid:data\r\nb=AS:' + bandwidth.data + '\r\n');
        }

        return sdp;
    }

    // DataChannel management
    var channel;

    function openOffererChannel() {
        if (!options.onChannelMessage || !options.onOfferSDP)
            return;

        _openOffererChannel();

        if (!moz) return;
        navigator.mozGetUserMedia({
                audio: true,
                fake: true
            }, function(stream) {
                peer.addStream(stream);
                createOffer();
            }, useless);
    }

    function _openOffererChannel() {
        // protocol: 'text/chat', preset: true, stream: 16
        // maxRetransmits:0 && ordered:false
        var dataChannelDict = { };
        channel = peer.createDataChannel(options.channel || 'sctp-channel', dataChannelDict);
        setChannelEvents();
    }

    function setChannelEvents() {
        channel.onmessage = function(event) {
            if (options.onChannelMessage) options.onChannelMessage(event);
        };

        channel.onopen = function() {
            if (options.onChannelOpened) options.onChannelOpened(channel);
        };
        channel.onclose = function(event) {
            if (options.onChannelClosed) options.onChannelClosed(event);

            console.warn('WebRTC DataChannel closed', event);
        };
        channel.onerror = function(event) {
            if (options.onChannelError) options.onChannelError(event);

            console.error('WebRTC DataChannel error', event);
        };
    }

    if (options.onAnswerSDP && options.onChannelMessage) {
        openAnswererChannel();
    }

    function openAnswererChannel() {
        peer.ondatachannel = function(event) {
            channel = event.channel;
            setChannelEvents();
        };

        if (!moz) return;
        navigator.mozGetUserMedia({
                audio: true,
                fake: true
            }, function(stream) {
                peer.addStream(stream);
                createAnswer();
            }, useless);
    }

    // fake:true is also available on chrome under a flag!

    function useless() {
        console.error('Error in fake:true');
    }

    function onSdpSuccess() {
    }

    function onSdpError(e) {
        var message = JSON.stringify(e, null, '\t');

        console.error('onSdpError:', message);
    }

    return {
        addAnswerSDP: function(sdp) {
            console.debug('adding answer-sdp', sdp.sdp);
            peer.setRemoteDescription(new SessionDescription(sdp), onSdpSuccess, onSdpError);
        },
        addICE: function(candidate) {
            candidate = new IceCandidate({
                sdpMLineIndex: candidate.sdpMLineIndex,
                candidate: candidate.candidate
            });

            peer.addIceCandidate(candidate);
        },

        peer: peer,
        channel: channel,
        sendData: function(message) {
            channel && channel.send(message);
        }
    };
}

// getUserMedia
var video_constraints = {
    mandatory: { },
    optional: []
};

function getUserMedia(options) {
    var n = navigator,
        media;
    n.getMedia = n.webkitGetUserMedia || n.mozGetUserMedia;
    n.getMedia(options.constraints || {
            audio: true,
            video: video_constraints
        }, streaming, options.onerror || function(e) {
            console.error(e);
        });

    function streaming(stream) {
        var video = options.video;
        if (video) {
            video[moz ? 'mozSrcObject' : 'src'] = moz ? stream : window.webkitURL.createObjectURL(stream);
            video.play();
        }
        options.onsuccess && options.onsuccess(stream);
        media = stream;
    }

    return media;
}
