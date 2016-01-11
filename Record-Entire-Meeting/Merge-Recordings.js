var exec = require('child_process').exec;
var fs = require('fs');
var isWindows = !!process.platform.match(/^win/);
var socket;

module.exports = exports = function(files, _socket) {
    socket = _socket;

    if(isWindows) {
        mergeForWindows(files);
        return;
    }
    mergeForLinuxOrMac(files);
};

// linux to merge WAV/WebM info single WebM
function mergeForLinuxOrMac(files, times) {
    // its probably *nix, assume ffmpeg is available

    // room-directory
    var dir = __dirname + '/uploads/' + files.roomId + '/';

    var audioFile = dir + files.audio.name; // audio file
    var videoFile = dir + files.video.name; // video file

    // resulting single WebM file
    var mergedFile = dir + files.audio.name.split('.')[0] + '-merged.webm';

    var util = require('util'),
        exec = require('child_process').exec;

    // ffmpeg command used in linux to merge WAV/WebM into WebM
    var command = "ffmpeg -i " + audioFile + " -i " + videoFile + " -map 0:0 -map 1:0 " + mergedFile;

    // invoke ffmpeg via BASH
    exec(command, function(error, stdout, stderr) {
        if (error) {
            console.log('ffmpeg-error', 'ffmpeg : An error occurred: ' + error.stack);

            // if failed to merge then try-again-and-again until 30 minutes
            times < 30 * 60 && setTimeout(function() {
                if (!times) times = 0;
                times += 1;
                mergeForLinuxOrMac(files, times);
            }, 1000);
        } else {
            // old audio file isn't needed
            fs.unlink(audioFile);

            // old video file isn't needed
            fs.unlink(videoFile);

            console.log('dev-logs', 'Successfully merged WAV/WebM files from recording interval ' + files.interval + '.');
        }
    });
}

// for windows
function mergeForWindows(files, times) {
    // directory address
    var dir = __dirname + '\\uploads\\' + files.roomId + '\\';

    // bash file
    var merger = __dirname + '\\bat-files\\merger.bat';

    var audioFile = dir + files.audio.name; // audio file
    var videoFile = dir + files.video.name; // video file

    // resulting single WebM file
    var mergedFile = dir + files.audio.name.split('.')[0] + '-merged.webm';

    // ffmpeg command used to merge WAV/WebM into single WebM
    var command = merger + ', ' + audioFile + " " + videoFile + " " + mergedFile + '';

    // invoke *.bat file via BASH
    exec(command, function(error, stdout, stderr) {
        if (error) {
            console.log('ffmpeg-error', 'ffmpeg : An error occurred: ' + error.stack);

            // if failed to merge then try-again-and-again until 30 minutes
            times < 30 * 60 && setTimeout(function() {
                if (!times) times = 0;
                times += 1;
                mergeForWindows(files, times);
            }, 1000);
        } else {
            // old audio file isn't needed
            fs.unlink(audioFile);

            // old video file isn't needed
            fs.unlink(videoFile);

            console.log('dev-logs', 'Successfully merged WAV/WebM files from recording interval ' + files.interval + '.');
        }
    });
}
