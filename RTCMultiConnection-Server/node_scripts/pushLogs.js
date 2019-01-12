// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence
// Documentation  - github.com/muaz-khan/RTCMultiConnection

var fs = require('fs');
var getJsonFile = require('./getJsonFile.js');

function pushLogs(config, name, error, clearLogsCallback) {
    // return console.log(error.message, error.stack);
    if (!config.enableLogs) {
        try {
            console.log(name, error.message, error.stack);
        }
        catch(e) {}
        return;
    }

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

        var logs = getJsonFile(config.logs);

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

            fs.writeFileSync(config.logs, JSON.stringify(logs));

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
