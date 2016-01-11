// OnIceCandidateHandler.js

var OnIceCandidateHandler = (function() {
    function processCandidates(connection, icePair) {
        var candidate = icePair.candidate;

        var iceRestrictions = connection.candidates;
        var stun = iceRestrictions.stun;
        var turn = iceRestrictions.turn;

        if (!isNull(iceRestrictions.reflexive)) {
            stun = iceRestrictions.reflexive;
        }

        if (!isNull(iceRestrictions.relay)) {
            turn = iceRestrictions.relay;
        }

        if (!iceRestrictions.host && !!candidate.match(/typ host/g)) {
            return;
        }

        if (!turn && !!candidate.match(/typ relay/g)) {
            return;
        }

        if (!stun && !!candidate.match(/typ srflx/g)) {
            return;
        }

        var protocol = connection.iceProtocols;

        if (!protocol.udp && !!candidate.match(/ udp /g)) {
            return;
        }

        if (!protocol.tcp && !!candidate.match(/ tcp /g)) {
            return;
        }

        if (connection.enableLogs) {
            console.debug('Your candidate pairs:', candidate);
        }

        return {
            candidate: candidate,
            sdpMid: icePair.sdpMid,
            sdpMLineIndex: icePair.sdpMLineIndex
        };
    }

    return {
        processCandidates: processCandidates
    };
})();
