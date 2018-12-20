// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence
// Documentation  - github.com/muaz-khan/RTCMultiConnection

// /admin/ page
module.exports = exports = function(params, config) {
    if(!params || !params.adminUserName || !params.adminPassword) return false;
    return params.adminUserName === config.adminUserName && params.adminPassword === config.adminPassword;
};
