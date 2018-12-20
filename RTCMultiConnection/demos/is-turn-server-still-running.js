// copyrights goes to: webrtc.github.io/samples/src/content/peerconnection/trickle-ice/
'use strict';

var IceServersHandler = (function() {
    function getIceServers(connection) {
        var iceServers = [{
                'urls': [
                    'turn:webrtcweb.com:7788' // coturn
                ],
                'username': 'muazkh',
                'credential': 'muazkh'
            },
            {
                'urls': [
                    'turn:webrtcweb.com:4455' // restund
                ],
                'username': 'muazkh',
                'credential': 'muazkh'
            }
        ];

        return iceServers;
    }

    return {
        getIceServers: getIceServers
    };
})();

IceServersHandler.getIceServers()[0] && checkIfTURNServerIsActive(IceServersHandler.getIceServers()[0], function(isActive) {
    document.querySelector('#coturn-status').innerHTML = isActive ? 'Active' : 'Offline';
    if(isActive) {
        document.querySelector('#coturn-status').style = 'color: #0e5c0e;font-weight: bold;';
    }
    else {
        document.querySelector('#coturn-status').style = 'color: red;font-weight: bold;';
    }
});

IceServersHandler.getIceServers()[1] && checkIfTURNServerIsActive(IceServersHandler.getIceServers()[1], function(isActive) {
    document.querySelector('#restund-status').innerHTML = isActive ? 'Active' : 'Offline';
    if(isActive) {
        document.querySelector('#restund-status').style = 'color: #0e5c0e;font-weight: bold;';
    }
    else {
        document.querySelector('#restund-status').style = 'color: red;font-weight: bold;';
    }
});

function checkIfTURNServerIsActive(turnServer, callback) {
    let pc;
    let candidates;
    start();

    function start() {
        const iceServers = [turnServer];
        const config = {
            iceServers: iceServers,
            iceTransportPolicy: 'relay',
            iceCandidatePoolSize: 0
        };
        const offerOptions = {
            offerToReceiveAudio: 1
        };
        pc = new RTCPeerConnection(config);
        pc.onicecandidate = iceCallback;
        pc.onicegatheringstatechange = gatheringStateChange;
        pc.createOffer(
            offerOptions
        ).then(
            gotDescription,
            noDescription
        );
    }

    function gotDescription(desc) {
        candidates = [];
        pc.setLocalDescription(desc);
    }

    function noDescription(error) {}

    function parseCandidate(text) {
        const candidateStr = 'candidate:';
        const pos = text.indexOf(candidateStr) + candidateStr.length;
        let [foundation, component, protocol, priority, address, port, , type] =
        text.substr(pos).split(' ');
        return {
            'component': component,
            'type': type,
            'foundation': foundation,
            'protocol': protocol,
            'address': address,
            'port': port,
            'priority': priority
        };
    }

    function formatPriority(priority) {
        return [
            priority >> 24,
            (priority >> 8) & 0xFFFF,
            priority & 0xFF
        ].join(' | ');
    }

    function appendCell(row, val, span) {
        const cell = document.createElement('td');
        cell.textContent = val;
        if (span) {
            cell.setAttribute('colspan', span);
        }
        row.appendChild(cell);
    }

    var number_of_relay_pairs = 0;

    function iceCallback(event) {
        if (event.candidate) {
            const c = parseCandidate(event.candidate.candidate);
            // component, type, foundation, protocol, address, port, formatPriority(c.priority)
            if (c.type === 'relay') {
                number_of_relay_pairs++;
            }
        } else {
            callback && callback(number_of_relay_pairs > 0);
            callback = null;

            if (!('onicegatheringstatechange' in RTCPeerConnection.prototype)) {
                pc.close();
                pc = null;
            }
        }
    }

    function gatheringStateChange() {
        if (pc.iceGatheringState !== 'complete') {
            return;
        }
        pc.close();
        pc = null;
    }
}
