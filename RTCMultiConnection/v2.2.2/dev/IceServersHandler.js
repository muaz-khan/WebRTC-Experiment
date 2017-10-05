// IceServersHandler.js

var IceServersHandler = (function() {
    function getIceServers(connection) {
        var iceServers = [];

        iceServers.push(getSTUNObj('stun:stun.l.google.com:19302'));

        iceServers.push(getTURNObj('stun:webrtcweb.com:7788', 'muazkh', 'muazkh')); // coTURN
        iceServers.push(getTURNObj('turn:webrtcweb.com:7788', 'muazkh', 'muazkh')); // coTURN
        iceServers.push(getTURNObj('turn:webrtcweb.com:8877', 'muazkh', 'muazkh')); // coTURN

        iceServers.push(getTURNObj('turns:webrtcweb.com:7788', 'muazkh', 'muazkh')); // coTURN
        iceServers.push(getTURNObj('turns:webrtcweb.com:8877', 'muazkh', 'muazkh')); // coTURN

        // iceServers.push(getTURNObj('turn:webrtcweb.com:3344', 'muazkh', 'muazkh')); // resiprocate
        // iceServers.push(getTURNObj('turn:webrtcweb.com:4433', 'muazkh', 'muazkh')); // resiprocate

        // check if restund is still active: http://webrtcweb.com:4050/
        iceServers.push(getTURNObj('stun:webrtcweb.com:4455', 'muazkh', 'muazkh')); // restund
        iceServers.push(getTURNObj('turn:webrtcweb.com:4455', 'muazkh', 'muazkh')); // restund
        iceServers.push(getTURNObj('turn:webrtcweb.com:5544?transport=tcp', 'muazkh', 'muazkh')); // restund

        return iceServers;
    }

    function getSTUNObj(stunStr) {
        var urlsParam = 'urls';
        if (typeof isPluginRTC !== 'undefined') {
            urlsParam = 'url';
        }

        var obj = {};
        obj[urlsParam] = stunStr;
        return obj;
    }

    function getTURNObj(turnStr, username, credential) {
        var urlsParam = 'urls';
        if (typeof isPluginRTC !== 'undefined') {
            urlsParam = 'url';
        }

        var obj = {
            username: username,
            credential: credential
        };
        obj[urlsParam] = turnStr;
        return obj;
    }

    return {
        getIceServers: getIceServers
    };
})();
