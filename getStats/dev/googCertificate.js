getStatsParser.googCertificate = function(result) {
    if (result.type == 'googCertificate') {
        getStatsResult.encryption = result.googFingerprintAlgorithm;
    }

    // Safari-11 or higher
    if (result.type == 'certificate') {
        // todo: is it possible to have different encryption methods for senders and receivers?
        // if yes, then we need to set:
        //    getStatsResult.encryption.local = value;
        //    getStatsResult.encryption.remote = value;
        getStatsResult.encryption = result.fingerprintAlgorithm;
    }
};
