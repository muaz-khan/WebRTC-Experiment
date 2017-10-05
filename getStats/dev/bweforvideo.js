getStatsParser.bweforvideo = function(result) {
    if (result.type !== 'VideoBwe') return;

    getStatsResult.bandwidth.availableSendBandwidth = result.googAvailableSendBandwidth;

    getStatsResult.bandwidth.googActualEncBitrate = result.googActualEncBitrate;
    getStatsResult.bandwidth.googAvailableSendBandwidth = result.googAvailableSendBandwidth;
    getStatsResult.bandwidth.googAvailableReceiveBandwidth = result.googAvailableReceiveBandwidth;
    getStatsResult.bandwidth.googRetransmitBitrate = result.googRetransmitBitrate;
    getStatsResult.bandwidth.googTargetEncBitrate = result.googTargetEncBitrate;
    getStatsResult.bandwidth.googBucketDelay = result.googBucketDelay;
    getStatsResult.bandwidth.googTransmitBitrate = result.googTransmitBitrate;
};
