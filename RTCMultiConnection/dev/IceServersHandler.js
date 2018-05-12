// IceServersHandler.js

var IceServersHandler = (function() {
    function getIceServers(connection) {
        // resiprocate: 3344+4433
        var iceServers = [{
                'urls': [
                    'turn:webrtcweb.com:7788', // coTURN 7788+8877
                    'turn:webrtcweb.com:4455', // restund udp

                    'turn:webrtcweb.com:7788?transport=udp', // coTURN udp
                    'turn:webrtcweb.com:7788?transport=tcp', // coTURN tcp

                    'turn:webrtcweb.com:4455?transport=udp', // restund udp
                    'turn:webrtcweb.com:5544?transport=tcp', // restund tcp

                    'turn:webrtcweb.com:7575?transport=udp', // pions/turn
                ],
                'username': 'muazkh',
                'credential': 'muazkh'
            },
            {
                'urls': [
                    'stun:stun.l.google.com:19302',
                    'stun:stun.l.google.com:19302?transport=udp'
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
