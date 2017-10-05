getStatsParser.datachannel = function(result) {
    if (result.type !== 'datachannel') return;

    getStatsResult.datachannel = {
        state: result.state // open or connecting
    }
};
