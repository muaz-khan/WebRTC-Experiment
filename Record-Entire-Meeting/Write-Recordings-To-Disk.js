var fs = require('fs');
var isWindows = !!process.platform.match(/^win/);
var MergeRecordings = require('./Merge-Recordings.js');
var socket;

module.exports = exports = function(files, _socket) {
    socket = _socket;

    writeToDisk(files);
};

// this function is used to write files to disk
function writeToDisk(files) {
    // a separate function is used to write audio/video files
    // that's why "roomid" is included for each blob
    files.audio.roomId = files.roomId;

    // todo: Firefox can use StereoAudioRecorder.js as well
    // so it should be:   if(files.singleBlob) {}
    if (!!files.isFirefox) {
        files.audio.isFirefox = !!files.isFirefox;
    } else {
        files.video.roomId = files.roomId;
    }

    if (files.lastIndex) {
        console.log('dev-logs', 'Seems ' + files.interval + ' is last interval.');
    }

    // this function takes single blob and writes to disk
    writeToDiskInternal(files.audio, function() {
        // if it is firefox, then quickly concatenate all files
        // NO-need to merge using ffmpeg because Firefox is supporting 

        // todo: Firefox can uploaded multiple blobs.
        // use: if(files.singleBlob) {}
        if (!!files.isFirefox) {
            console.log('dev-logs', 'Seems Firefox. Thats why skipped merging from recording interval ' + files.interval + '.');

            if (!process.platform.match(/^win/)) {
                concatenateInMac(files);
            } else {
                concatenateInWindows(files);
            }
            return;
        }

        // upload video file
        writeToDiskInternal(files.video, function() {
            // merge WAV/WebM into single WebM
            // todo???? handle it in "disconnect" event instead???
            MergeRecordings(files, socket);
        });
    });
}

// this file is used to write single blob into disk
function writeToDiskInternal(file, callback) {
    var isFirefox = file.isFirefox; // todo: files.isSingleBlob

    // file info (file name, extension, directory, etc.)
    var fileRootName = file.name.split('.').shift() + (isFirefox ? '-merged' : ''),
        fileExtension = isFirefox ? 'webm' : file.name.split('.').pop(),
        filePathBase = './uploads/' + file.roomId + '/',
        fileRootNameWithBase = filePathBase + fileRootName,
        filePath = fileRootNameWithBase + '.' + fileExtension,
        fileID = 2,
        fileBuffer;

    console.log('dev-logs', 'Uploading ' + fileExtension + ' file from recording interval ' + file.interval + '.');

    // if file already exits, delete it
    if (fs.existsSync(filePath)) {
        fs.unlink(filePath);
    }

    // reformat the DataURL
    file.contents = file.contents.split(',').pop();

    // convert DataURL to ArrayBuffer
    fileBuffer = new Buffer(file.contents, "base64");

    // write ArrayBuffer to disk
    fs.writeFile(filePath, fileBuffer, function(error) {
        if (error) throw error; // todo??????

        console.log('dev-logs', 'Successfully uploaded ' + fileExtension + ' file from recording interval ' + file.interval + '.');
        callback();
    });
}
