// via: https://github.com/diafygi/webrtc-ips
function DetectLocalIPAddress(callback, stream) {
    if (!DetectRTC.isWebRTCSupported) {
        return;
    }

    getIPs(function(ip) {
        if (ip.match(/^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/)) {
            callback('Local: ' + ip);
        } else {
            callback('Public: ' + ip);
        }
    }, stream);
}

function getIPs(callback, stream) {
    if (typeof document === 'undefined' || typeof document.getElementById !== 'function') {
        return;
    }

    var ipDuplicates = {};

    var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;

    if (!RTCPeerConnection) {
        var iframe = document.getElementById('iframe');
        if (!iframe) {
            return;
        }
        var win = iframe.contentWindow;
        RTCPeerConnection = win.RTCPeerConnection || win.mozRTCPeerConnection || win.webkitRTCPeerConnection;
    }

    if (!RTCPeerConnection) {
        return;
    }

    var peerConfig = null;

    if (DetectRTC.browser === 'Chrome' && DetectRTC.browser.version < 58) {
        // todo: add support for older Opera
        peerConfig = {
            optional: [{
                RtpDataChannels: true
            }]
        };
    }

    var servers = {
        iceServers: [{
            urls: 'stun:stun.l.google.com:19302'
        }]
    };

    var pc = new RTCPeerConnection(servers, peerConfig);

    if (stream) {
        if (pc.addStream) {
            pc.addStream(stream);
        } else if (pc.addTrack && stream.getTracks()[0]) {
            pc.addTrack(stream.getTracks()[0], stream);
        }
    }

    function handleCandidate(candidate) {
        var ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
        var match = ipRegex.exec(candidate);
        if (!match) {
            return;
        }
        var ipAddress = match[1];

        if (ipDuplicates[ipAddress] === undefined) {
            callback(ipAddress);
        }

        ipDuplicates[ipAddress] = true;
    }

    // listen for candidate events
    pc.onicecandidate = function(ice) {
        if (ice.candidate) {
            handleCandidate(ice.candidate.candidate);
        }
    };

    // create data channel
    if (!stream) {
        try {
            pc.createDataChannel('sctp', {});
        } catch (e) {}
    }

    // create an offer sdp
    if (DetectRTC.isPromisesSupported) {
        pc.createOffer().then(function(result) {
            pc.setLocalDescription(result).then(afterCreateOffer);
        });
    } else {
        pc.createOffer(function(result) {
            pc.setLocalDescription(result, afterCreateOffer, function() {});
        }, function() {});
    }

    function afterCreateOffer() {
        var lines = pc.localDescription.sdp.split('\n');

        lines.forEach(function(line) {
            if (line.indexOf('a=candidate:') === 0) {
                handleCandidate(line);
            }
        });
    }
}
