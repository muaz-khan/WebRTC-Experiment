// IceServersHandler.js
// note: "urls" doesn't works in old-firefox.

var IceServersHandler = (function(connection) {
    function getIceServers(iceServers) {
        iceServers = iceServers || [];

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
        return iceServers;
    }

    return {
        getIceServers: getIceServers
    };
})();
