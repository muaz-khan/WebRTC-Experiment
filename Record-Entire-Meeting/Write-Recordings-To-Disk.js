// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.webrtc-experiment.com/licence
// Documentation - github.com/streamproc/MediaStreamRecorder
var fs = require('fs');
var socket;

module.exports = exports = function(file, _socket) {
    socket = _socket;

    writeToDisk(file);
};

function writeToDisk(file) {
    file.data.roomId = file.roomId;
    writeToDiskInternal(file.data, function() {

    });
}

function writeToDiskInternal(file, callback) {
    var fileRootName = file.name.split('.').shift(),
        fileExtension = 'webm',
        filePathBase = './uploads/' + file.roomId + '/',
        fileRootNameWithBase = filePathBase + fileRootName,
        filePath = fileRootNameWithBase + '.' + fileExtension,
        fileID = 2,
        fileBuffer;

    if (fs.existsSync(filePath)) {
        fs.unlink(filePath);
    }

    file.contents = file.contents.split(',').pop();

    fileBuffer = new Buffer(file.contents, "base64");

    fs.writeFile(filePath, fileBuffer, function(error) {
        if (error) throw error;

        callback();
    });
}
