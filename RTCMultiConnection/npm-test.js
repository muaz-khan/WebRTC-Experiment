// https://tonicdev.com/npm/rtcmulticonnection

var RTCMultiConnection;

try {
    RTCMultiConnection = require('rtcmulticonnection');
}
catch(e) {
    RTCMultiConnection = require('./dist/RTCMultiConnection.js');
}

var connection = new RTCMultiConnection();

connection.enableLogs = true;

// test only data channels
connection.session = {
    data: true
};

connection.dontCaptureUserMedia = true;

console.log('\n------\n');

connection.open('room-id', function(isRoomOpened, roomid, error) {
    if(isRoomOpened === true) {
        console.log('Room opened: ' + roomid)
    }

    if(error) {
        console.log('Unable to open room: ' + error);
    }
});

console.log('\n------\n');

console.log(connection);

process.exit()
