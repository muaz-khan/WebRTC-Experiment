var REMOTE_candidateType = {};
var REMOTE_transport = {};
var REMOTE_ipAddress = {};
var REMOTE_networkType = {};

getStatsParser.remotecandidate = function(result) {
    if (result.type !== 'remotecandidate' && result.type !== 'remote-candidate') return;
    if (!result.id) return;

    if (!REMOTE_candidateType[result.id]) {
        REMOTE_candidateType[result.id] = [];
    }

    if (!REMOTE_transport[result.id]) {
        REMOTE_transport[result.id] = [];
    }

    if (!REMOTE_ipAddress[result.id]) {
        REMOTE_ipAddress[result.id] = [];
    }

    if (!REMOTE_networkType[result.id]) {
        REMOTE_networkType[result.id] = [];
    }

    if (result.candidateType && REMOTE_candidateType[result.id].indexOf(result.candidateType) === -1) {
        REMOTE_candidateType[result.id].push(result.candidateType);
    }

    if (result.transport && REMOTE_transport[result.id].indexOf(result.transport) === -1) {
        REMOTE_transport[result.id].push(result.transport);
    }

    if (result.ipAddress && REMOTE_ipAddress[result.id].indexOf(result.ipAddress + ':' + result.portNumber) === -1) {
        REMOTE_ipAddress[result.id].push(result.ipAddress + ':' + result.portNumber);
    }

    if (result.networkType && REMOTE_networkType[result.id].indexOf(result.networkType) === -1) {
        REMOTE_networkType[result.id].push(result.networkType);
    }

    getStatsResult.internal.candidates[result.id] = {
        candidateType: REMOTE_candidateType[result.id],
        ipAddress: REMOTE_ipAddress[result.id],
        portNumber: result.portNumber,
        networkType: REMOTE_networkType[result.id],
        priority: result.priority,
        transport: REMOTE_transport[result.id],
        timestamp: result.timestamp,
        id: result.id,
        type: result.type
    };

    getStatsResult.connectionType.remote.candidateType = REMOTE_candidateType[result.id];
    getStatsResult.connectionType.remote.ipAddress = REMOTE_ipAddress[result.id];
    getStatsResult.connectionType.remote.networkType = REMOTE_networkType[result.id];
    getStatsResult.connectionType.remote.transport = REMOTE_transport[result.id];
};
