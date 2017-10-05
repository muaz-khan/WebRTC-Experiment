getStatsParser.googCertificate = function(result) {
    if (result.type == 'googCertificate') {
        getStatsResult.encryption = result.googFingerprintAlgorithm;
    }
};
