var LOCAL_candidateType = {};
var LOCAL_transport = {};
var LOCAL_ipAddress = {};
var LOCAL_networkType = {};

getStatsParser.localcandidate = function(result) {
    if (result.type !== 'localcandidate' && result.type !== 'local-candidate') return;
    if (!result.id) return;

    if (!LOCAL_candidateType[result.id]) {
        LOCAL_candidateType[result.id] = [];
    }

    if (!LOCAL_transport[result.id]) {
        LOCAL_transport[result.id] = [];
    }

    if (!LOCAL_ipAddress[result.id]) {
        LOCAL_ipAddress[result.id] = [];
    }

    if (!LOCAL_networkType[result.id]) {
        LOCAL_networkType[result.id] = [];
    }

    if (result.candidateType && LOCAL_candidateType[result.id].indexOf(result.candidateType) === -1) {
        LOCAL_candidateType[result.id].push(result.candidateType);
    }

    if (result.transport && LOCAL_transport[result.id].indexOf(result.transport) === -1) {
        LOCAL_transport[result.id].push(result.transport);
    }

    if (result.ipAddress && LOCAL_ipAddress[result.id].indexOf(result.ipAddress + ':' + result.portNumber) === -1) {
        LOCAL_ipAddress[result.id].push(result.ipAddress + ':' + result.portNumber);
    }

    if (result.networkType && LOCAL_networkType[result.id].indexOf(result.networkType) === -1) {
        LOCAL_networkType[result.id].push(result.networkType);
    }

    getStatsResult.internal.candidates[result.id] = {
        candidateType: LOCAL_candidateType[result.id],
        ipAddress: LOCAL_ipAddress[result.id],
        portNumber: result.portNumber,
        networkType: LOCAL_networkType[result.id],
        priority: result.priority,
        transport: LOCAL_transport[result.id],
        timestamp: result.timestamp,
        id: result.id,
        type: result.type
    };

    getStatsResult.connectionType.local.candidateType = LOCAL_candidateType[result.id];
    getStatsResult.connectionType.local.ipAddress = LOCAL_ipAddress[result.id];
    getStatsResult.connectionType.local.networkType = LOCAL_networkType[result.id];
    getStatsResult.connectionType.local.transport = LOCAL_transport[result.id];
};
