// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence
// Documentation  - github.com/muaz-khan/RTCMultiConnection

// basic-auth and tsscmp are used for /admin/ page
var adminAuthorization = require('basic-auth');
var compareAdminCredentials = require('tsscmp');

module.exports = exports = function(request, config) {
    var credentials = adminAuthorization(request);
    if (!credentials || !isAdminAuthorized(credentials.name, credentials.pass, config)) {
        return false;
    }
    return true;
}

function isAdminAuthorized(name, pass, config) {
    var valid = true
    valid = compareAdminCredentials(name, config.adminUserName) && valid;
    valid = compareAdminCredentials(pass, config.adminPassword) && valid;
    return valid
}
