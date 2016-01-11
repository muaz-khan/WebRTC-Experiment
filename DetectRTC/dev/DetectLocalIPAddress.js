// via: https://github.com/diafygi/webrtc-ips
function DetectLocalIPAddress(callback) {
    if (!DetectRTC.isWebRTCSupported) {
        return;
    }

    if (DetectRTC.isORTCSupported) {
        return;
    }

    getIPs(function(ip) {
        //local IPs
        if (ip.match(/^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/)) {
            callback('Local: ' + ip);
        }

        //assume the rest are public IPs
        else {
            callback('Public: ' + ip);
        }
    });
}

//get the IP addresses associated with an account
function getIPs(callback) {
    var ipDuplicates = {};

    //compatibility for firefox and chrome
    var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    var useWebKit = !!window.webkitRTCPeerConnection;

    // bypass naive webrtc blocking using an iframe
    if (!RTCPeerConnection) {
        var iframe = document.getElementById('iframe');
        if (!iframe) {
            //<iframe id="iframe" sandbox="allow-same-origin" style="display: none"></iframe>
            throw 'NOTE: you need to have an iframe in the page right above the script tag.';
        }
        var win = iframe.contentWindow;
        RTCPeerConnection = win.RTCPeerConnection || win.mozRTCPeerConnection || win.webkitRTCPeerConnection;
        useWebKit = !!win.webkitRTCPeerConnection;
    }

    // if still no RTCPeerConnection then it is not supported by the browser so just return
    if (!RTCPeerConnection) {
        return;
    }

    //minimal requirements for data connection
    var mediaConstraints = {
        optional: [{
            RtpDataChannels: true
        }]
    };

    //firefox already has a default stun server in about:config
    //    media.peerconnection.default_iceservers =
    //    [{"url": "stun:stun.services.mozilla.com"}]
    var servers;

    //add same stun server for chrome
    if (useWebKit) {
        servers = {
            iceServers: [{
                urls: 'stun:stun.services.mozilla.com'
            }]
        };

        if (typeof DetectRTC !== 'undefined' && DetectRTC.browser.isFirefox && DetectRTC.browser.version <= 38) {
            servers[0] = {
                url: servers[0].urls
            };
        }
    }

    //construct a new RTCPeerConnection
    var pc = new RTCPeerConnection(servers, mediaConstraints);

    function handleCandidate(candidate) {
        //match just the IP address
        var ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
        var match = ipRegex.exec(candidate);
        if (!match) {
            console.warn('Could not match IP address in', candidate);
            return;
        }
        var ipAddress = match[1];

        //remove duplicates
        if (ipDuplicates[ipAddress] === undefined) {
            callback(ipAddress);
        }

        ipDuplicates[ipAddress] = true;
    }

    //listen for candidate events
    pc.onicecandidate = function(ice) {
        //skip non-candidate events
        if (ice.candidate) {
            handleCandidate(ice.candidate.candidate);
        }
    };

    //create a bogus data channel
    pc.createDataChannel('');

    //create an offer sdp
    pc.createOffer(function(result) {

        //trigger the stun server request
        pc.setLocalDescription(result, function() {}, function() {});

    }, function() {});

    //wait for a while to let everything done
    setTimeout(function() {
        //read candidate info from local description
        var lines = pc.localDescription.sdp.split('\n');

        lines.forEach(function(line) {
            if (line.indexOf('a=candidate:') === 0) {
                handleCandidate(line);
            }
        });
    }, 1000);
}
