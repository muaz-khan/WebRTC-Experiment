// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence
// Documentation  - github.com/muaz-khan/RTCMultiConnection

// pushLogs is used to write error logs into logs.json
const pushLogs = require('./pushLogs.js');
const BASH_COLORS_HELPER = require('./BASH_COLORS_HELPER.js');

module.exports = exports = function(httpServer, config) {
    try {
        var addr = httpServer.address();

        if (addr.address === '0.0.0.0') {
            addr.address = 'localhost';
        }

        var domainURL = (config.isUseHTTPs ? 'https' : 'http') + '://' + addr.address + ':' + addr.port + '/';

        console.log('\n');

        console.log('Socket.io is listening at:');
        console.log(BASH_COLORS_HELPER.getGreenFG(), '\t' + domainURL);

        if (!config.isUseHTTPs) {
            console.log('You can use --ssl to enable HTTPs:');
            console.log(BASH_COLORS_HELPER.getYellowFG(), '\t' + 'node server --ssl');
        }

        console.log('Your web-browser (HTML file) MUST set this line:');
        console.log(BASH_COLORS_HELPER.getGreenFG(), '\tconnection.socketURL = "' + domainURL + '";');

        if (addr.address != 'localhost' && !config.isUseHTTPs) {
            console.log(BASH_COLORS_HELPER.getRedBG(), 'Warning:');
            console.log(BASH_COLORS_HELPER.getRedBG(), 'Please run on HTTPs to make sure audio,video and screen demos can work on Google Chrome as well.');
        }

        if (config.enableAdmin === true) {
            console.log('Admin page is enabled and running on: ' + domainURL + 'admin/');
            console.log('\tAdmin page username: ' + config.adminUserName);
            console.log('\tAdmin page password: ' + config.adminPassword);
        }

        console.log('For more help: ', BASH_COLORS_HELPER.getYellowFG('node server.js --help'));
        console.log('\n');
    } catch (e) {
        pushLogs(config, 'app.listen.callback', e);
    }
};
