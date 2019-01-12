var regexIpv4Local = /^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/,
    regexIpv4 = /([0-9]{1,3}(\.[0-9]{1,3}){3})/,
    regexIpv6 = /[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7}/;

// via: https://github.com/diafygi/webrtc-ips
function DetectLocalIPAddress(callback, stream) {
    if (!DetectRTC.isWebRTCSupported) {
        return;
    }

    var isPublic = true,
        isIpv4 = true;
    getIPs(function(ip) {
        if (!ip) {
            callback(); // Pass nothing to tell that ICE-gathering-ended
        } else if (ip.match(regexIpv4Local)) {
            isPublic = false;
            callback('Local: ' + ip, isPublic, isIpv4);
        } else if (ip.match(regexIpv6)) { //via https://ourcodeworld.com/articles/read/257/how-to-get-the-client-ip-address-with-javascript-only
            isIpv4 = false;
            callback('Public: ' + ip, isPublic, isIpv4);
        } else {
            callback('Public: ' + ip, isPublic, isIpv4);
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
        if (!candidate) {
            callback(); // Pass nothing to tell that ICE-gathering-ended
            return;
        }

        var match = regexIpv4.exec(candidate);
        if (!match) {
            return;
        }
        var ipAddress = match[1];
        var isPublic = (candidate.match(regexIpv4Local)),
            isIpv4 = true;

        if (ipDuplicates[ipAddress] === undefined) {
            callback(ipAddress, isPublic, isIpv4);
        }

        ipDuplicates[ipAddress] = true;
    }

    // listen for candidate events
    pc.onicecandidate = function(event) {
        if (event.candidate && event.candidate.candidate) {
            handleCandidate(event.candidate.candidate);
        } else {
            handleCandidate(); // Pass nothing to tell that ICE-gathering-ended
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
            if (line && line.indexOf('a=candidate:') === 0) {
                handleCandidate(line);
            }
        });
    }
}
