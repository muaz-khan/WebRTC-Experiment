// IceServersHandler.js

var IceServersHandler = (function() {
    function getIceServers(connection) {
        // resiprocate: 3344+4433
        var iceServers = [{
                'urls': [
                    'turn:webrtcweb.com:7788',
                    'turn:webrtcweb.com:8877',
                    'turn:webrtcweb.com:4455',
                    'turn:webrtcweb.com:5544',

                    'turns:webrtcweb.com:7788',
                    'turns:webrtcweb.com:8877',
                    'turns:webrtcweb.com:4455',
                    'turns:webrtcweb.com:5544'
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

        return iceServers;
    }

    return {
        getIceServers: getIceServers
    };
})();
