// IceServersHandler.js

var IceServersHandler = (function() {
    function getIceServers(connection) {
        // resiprocate: 3344+4433
        var iceServers = [{
                'urls': [
                    'turn:webrtcweb.com:7788', // coTURN 7788+8877
                    'turn:webrtcweb.com:4455', // restund udp
                    'turn:webrtcweb.com:5544' // restund tcp
                ],
                'username': 'muazkh',
                'credential': 'muazkh'
            },
            {
                'urls': [
                    'stun:stun.l.google.com:19302'
                ]
            }
        ];

        if (typeof window.InstallTrigger !== 'undefined') {
            iceServers[0].urls = iceServers[0].urls.pop();
            iceServers[1].urls = iceServers[1].urls.pop();
        }

        return iceServers;
    }

    return {
        getIceServers: getIceServers
    };
})();
