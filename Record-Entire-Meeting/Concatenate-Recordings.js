// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.webrtc-experiment.com/licence
// Documentation - github.com/streamproc/MediaStreamRecorder
var exec = require('child_process').exec;
var fs = require('fs');
var socket;

module.exports = exports = function(files, _socket) {
    socket = _socket;

    console.log('concatenating files in room:', files.roomId, ' for user:', files.userId, ' at interval:', files.interval);

    concatenateInLinuxOrMac(files);
};

var ffmpeg = require('fluent-ffmpeg');

function concatenateInLinuxOrMac(files) {
    var uploadsFolder = __dirname + '/uploads/' + files.roomId + '/';

    var lastIndex = files.lastIndex;

    var allFiles = [];
    var isAnySingleFileStillInProgress = false;
    for (var i = 1; i < lastIndex; i++) {
        if (!fs.existsSync(uploadsFolder + files.fileName + '-' + i + ".webm")) {
            isAnySingleFileStillInProgress = true;
            i = lastIndex;
            break;
        }

        allFiles.push(uploadsFolder + files.fileName + '-' + i + '.webm');
    }

    if (isAnySingleFileStillInProgress) {
        console.log('isAnySingleFileStillInProgress');
        setTimeout(function() {
            concatenateInLinuxOrMac(files);
        }, 2000);
        return;
    }

    // ffmpeg -y -i video.webm -i screen.webm -filter_complex "[0:v]setpts=PTS-STARTPTS, pad=iw:ih[bg]; [1:v]scale=320:240,setpts=PTS-STARTPTS[fg]; [bg][fg]overlay=main_w-overlay_w-10:main_h-overlay_h-10" fullRecording.webm
    // ffmpeg -y -i 6354797637490482-1.webm -i 6354797637490482-2.webm fullRecording.webm

    console.log('executing ffmpeg command');

    var ffmpegCommand = ffmpeg(allFiles[0]);
    allFiles.forEach(function(filePath, idx) {
        if (idx !== 0) {
            ffmpegCommand = ffmpegCommand.input(filePath);
        }
    });

    ffmpegCommand.on('progress', function(progress) {
        socket.emit('ffmpeg-progress', {
            userId: files.userId,
            roomId: files.roomId,
            progress: progress
        });
    });

    ffmpegCommand.on('error', function(err) {
        console.log(err.message);
    });

    ffmpegCommand.on('end', function() {
        console.log('Successfully concatenated all WebM files from recording interval ' + files.interval + '.');
        socket.emit('complete', files.userId + '.webm');

        unlink_merged_files(uploadsFolder + files.fileName, lastIndex);
    });

    var final_file = uploadsFolder + files.userId + '.webm';
    ffmpegCommand.mergeToFile(final_file, __dirname + '/temp-uploads/');
}

// delete all files from specific user
function unlink_merged_files(fileName, lastIndex, index) {
    console.log('unlinking redundant files');

    function unlink_file(_index) {
        fs.unlink(fileName + '-' + _index + ".webm", function(error) {
            if (error) {
                setTimeout(function() {
                    unlink_merged_files(fileName, lastIndex, _index);
                }, 5000);
            }
        });
    }

    if (index) {
        unlink_file(index);
        return;
    }

    for (var i = 1; i < lastIndex; i++) {
        unlink_file(i);
    }
}
