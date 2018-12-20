// IceServersHandler.js

var IceServersHandler = (function() {
    function getIceServers(connection) {
        // resiprocate: 3344+4433
        // pions: 7575
        var iceServers = [{
                'urls': [
                    'stun:webrtcweb.com:7788', // coTURN
                    'stun:webrtcweb.com:7788?transport=udp', // coTURN
                ],
                'username': 'muazkh',
                'credential': 'muazkh'
            },
            {
                'urls': [
                    'turn:webrtcweb.com:7788', // coTURN 7788+8877
                    'turn:webrtcweb.com:4455?transport=udp', // restund udp

                    'turn:webrtcweb.com:8877?transport=udp', // coTURN udp
                    'turn:webrtcweb.com:8877?transport=tcp', // coTURN tcp
                ],
                'username': 'muazkh',
                'credential': 'muazkh'
            },
            {
                'urls': [
                    'stun:stun.l.google.com:19302',
                    'stun:stun1.l.google.com:19302',
                    'stun:stun2.l.google.com:19302',
                    'stun:stun.l.google.com:19302?transport=udp',
                ]
            }
        ];

        if (typeof window.InstallTrigger !== 'undefined') {
            iceServers = [{
                'urls': [
                    'turn:webrtcweb.com:7788',
                    'stun:webrtcweb.com:7788',
                ],
                'username': 'muazkh',
                'credential': 'muazkh'
            }];
        }

        return iceServers;
    }

    return {
        getIceServers: getIceServers
    };
})();
