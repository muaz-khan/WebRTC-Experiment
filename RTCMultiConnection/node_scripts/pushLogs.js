// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence
// Documentation  - github.com/muaz-khan/RTCMultiConnection

var enableLogs = false;

try {
    var _enableLogs = require('../config.json').enableLogs;

    if (_enableLogs) {
        enableLogs = true;
    }
} catch (e) {
    enableLogs = false;
}

var fs = require('fs');

function pushLogs(name, error, clearLogsCallback) {
    if (!enableLogs) return;

    if (!clearLogsCallback || typeof clearLogsCallback !== 'function') {
        if (!name || !error || !error.message || !error.stack) {
            console.log('Invalid pushLogs', name, error);
            return;
        }
    }

    try {
        var utcDateString = (new Date).toISOString();
        utcDateString += (Math.random() * 100).toString();
        utcDateString = utcDateString.replace(/ |-|,|:|\./g, '');

        // uncache to fetch recent (up-to-dated)
        var uncache = require('./uncache.js');
        uncache('../logs.json');

        var logs = {};

        try {
            logs = require('../logs.json');
        } catch (e) {
            console.log('Unable to read logs.json', e);
        }

        try {
            if (!!clearLogsCallback && typeof clearLogsCallback === 'function') {
                logs = {};
            } else {
                logs[utcDateString] = {
                    name: name,
                    message: error.message,
                    stack: error.stack,
                    date: (new Date).toUTCString()
                };
            }

            fs.writeFileSync('./logs.json', JSON.stringify(logs));

            if (!!clearLogsCallback && typeof clearLogsCallback === 'function') {
                clearLogsCallback(true);
            }
        } catch (e) {
            // logs[utcDateString] = arguments.toString();
            console.log('Unable to write to logs.json.', e);

            if (!!clearLogsCallback && typeof clearLogsCallback === 'function') {
                clearLogsCallback('Unable to write to logs.json.');
            }
        }
    } catch (e) {
        console.log('Unable to write log.', e);

        if (!!clearLogsCallback && typeof clearLogsCallback === 'function') {
            clearLogsCallback('Unable to write log.');
        }
    }
}

module.exports = exports = pushLogs;
