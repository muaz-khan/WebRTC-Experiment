// IceServersHandler.js
// note: "urls" doesn't works in old-firefox.

var iceFrame, loadedIceFrame;

function loadIceFrame(callback, skip) {
    if (loadedIceFrame) return;
    if (!skip) return loadIceFrame(callback, true);

    loadedIceFrame = true;

    var iframe = document.createElement('iframe');
    iframe.onload = function() {
        iframe.isLoaded = true;

        listenEventHandler('message', iFrameLoaderCallback);

        function iFrameLoaderCallback(event) {
            if (!event.data || !event.data.iceServers) return;
            callback(event.data.iceServers);

            // this event listener is no more needed
            window.removeEventListener('message', iFrameLoaderCallback);
        }

        iframe.contentWindow.postMessage('get-ice-servers', '*');
    };
    iframe.src = 'https://cdn.webrtc-experiment.com/getIceServers/';
    iframe.style.display = 'none';
    (document.body || document.documentElement).appendChild(iframe);
}

if (typeof window.getExternalIceServers === 'undefined' || window.getExternalIceServers == true) {
    loadIceFrame(function(externalIceServers) {
        if (!externalIceServers || !externalIceServers.length) return;
        window.RMCExternalIceServers = externalIceServers;

        if (window.iceServersLoadCallback && typeof window.iceServersLoadCallback === 'function') {
            window.iceServersLoadCallback(externalIceServers);
        }
    });
}

var IceServersHandler = (function() {
    function getIceServers(connection) {
        var iceServers = [];

        // Firefox <= 37 doesn't understands "urls"

        iceServers.push({
            urls: 'stun:stun.l.google.com:19302'
        });

        iceServers.push({
            urls: 'stun:stun.anyfirewall.com:3478'
        });

        iceServers.push({
            urls: 'turn:turn.bistri.com:80',
            credential: 'homeo',
            username: 'homeo'
        });

        iceServers.push({
            urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
            credential: 'webrtc',
            username: 'webrtc'
        });

        if (window.RMCExternalIceServers) {
            iceServers = window.RMCExternalIceServers.concat(iceServers);
            connection.iceServers = iceServers;
        } else if (typeof window.getExternalIceServers === 'undefined' || window.getExternalIceServers == true) {
            window.iceServersLoadCallback = function() {
                iceServers = window.RMCExternalIceServers.concat(iceServers);
                connection.iceServers = iceServers;
            };
        } else {
            iceServers.push({
                urls: 'turn:turn.anyfirewall.com:443?transport=udp',
                credential: 'webrtc',
                username: 'webrtc'
            });
        }

        return iceServers;
    }

    return {
        getIceServers: getIceServers
    };
})();
