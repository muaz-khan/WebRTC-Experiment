var exec = require('child_process').exec;
var fs = require('fs');
var isWindows = !!process.platform.match(/^win/);

module.exports = exports = function(files) {
    if(isWindows) {
        concatenateInWindows(files);
        return;
    }
    concatenateInLinuxOrMac(files);
};

// concatenate-all-blobs in linux
function concatenateInLinuxOrMac(files, times, fileNotExistsTries) {
    console.log('dev-logs', 'Concatenating all WebM files from recording interval ' + files.interval + '.');

    console.log('files', files.fileName);

    // room-directory
    var uploadsFolder = __dirname + '/uploads/' + files.roomId + '/';

    // "lastIndex" is currently passed via "disconnect" event
    var lastIndex = files.lastIndex;

    // ffmpeg command (currently) only works via a TEXT file
    var mergelist = '';
    var isAnySingleFileStillInProgress = false;
    for (var i = 1; i < lastIndex; i++) {
        // if file doesn't exists & wait for it to be created
        // todo?????
        if (!fs.existsSync(uploadsFolder + files.fileName + '-' + i + "-merged.webm")) {
            isAnySingleFileStillInProgress = true;
            i = lastIndex;
            console.log('dev-logs', 'Concatenator is waiting for ' + files.fileName + '-' + i + '-merged.webm in recording interval ' + files.interval + '.');
            break;
        }

        mergelist += "file '" + uploadsFolder + files.fileName + '-' + i + "-merged.webm'\n";

        console.log('-------------------------------');
        console.log("file '" + uploadsFolder + files.fileName + '-' + i + "-merged.webm'\n");
        console.log('-------------------------------');
    }

    if (isAnySingleFileStillInProgress) {
        console.log('-------------------------------');
        console.log('isAnySingleFileStillInProgress');
        console.log('-------------------------------');
        setTimeout(function() {
            fileNotExistsTries = fileNotExistsTries || 0;
            fileNotExistsTries++;

            if (fileNotExistsTries > 5) {
                fileNotExistsTries = 0;
                files.lastIndex -= 1;
            }
            concatenateInLinuxOrMac(files, times, fileNotExistsTries);
        }, 2000);
        return;
    }

    mergelist = mergelist.substr(0, mergelist.length - 1);

    // this TEXT file is used to be invoked in ffmpeg
    // ffmpeg reads it, and merges all files accordingly
    var mergelist_file_txt = uploadsFolder + files.fileName + '-mergelist.txt';

    console.log('----------------------------');
    console.log(mergelist_file_txt);
    console.log(mergelist);
    console.log('----------------------------');

    // if TEXT file already exists, remove it.
    if (fs.existsSync(mergelist_file_txt)) {
        fs.unlink(mergelist_file_txt);
    }

    // write TEXT file and wait for success-callback
    fs.writeFile(mergelist_file_txt, mergelist, function(err) {
        if (err) {
            console.log('dev-logs', err);

            // todo?????if it fails?
            concatenateInLinuxOrMac(files, times, fileNotExistsTries);
        } else {
            var final_file = uploadsFolder + files.userId + '.webm';
            var command = 'ffmpeg -f concat -i ' + mergelist_file_txt + ' -c copy ' + final_file;

            exec(command, function(error, stdout, stderr) {
                if (error) {
                    console.log('ffmpeg-error', 'ffmpeg : An error occurred: ' + error.stack);

                    // if failed to concatenate then try-again-and-again until 30 minutes
                    times < 30 * 60 && setTimeout(function() {
                        if (!times) times = 0;
                        times += 1;
                        concatenateInLinuxOrMac(files, times);
                    }, 1000);
                } else {
                    console.log('dev-logs', 'Successfully concatenated all WebM files from recording interval ' + files.interval + '.');

                    // remove TEXT file
                    fs.unlink(mergelist_file_txt);

                    // remove all user files
                    unlink_merged_files(uploadsFolder + files.fileName, lastIndex);

                    // if requested:
                    // var ScaleRecordings = require('Scale-Recordings.js');
                    // ScaleRecordings(files, times);
                }
            });
        }
    });
}

// concatenate-all-blobs in windows
function concatenateInWindows(files, times, fileNotExistsTries) {
    console.log('dev-logs', 'Concatenating all WebM files from recording interval ' + files.interval + '.');

    // room-directory
    var uploadsFolder = __dirname + '\\uploads\\' + files.roomId + '\\';

    // "lastIndex" is currently passed via "disconnect" event
    var lastIndex = files.lastIndex;

    // ffmpeg command (currently) only works via a TEXT file
    var mergelist = '';
    var isAnySingleFileStillInProgress = false;
    for (var i = 1; i < lastIndex; i++) {
        // if file doesn't exists & wait for it to be created
        // todo?????
        if (!fs.existsSync(uploadsFolder + files.fileName + '-' + i + "-merged.webm")) {
            isAnySingleFileStillInProgress = true;
            i = lastIndex;

            console.log('dev-logs', 'Concatenator is waiting for ' + files.fileName + '-' + i + '-merged.webm in recording interval ' + files.interval + '.');
            break;
        }
        mergelist += "file '" + uploadsFolder + files.fileName + '-' + i + "-merged.webm'\n";
    }

    if (isAnySingleFileStillInProgress) {
        setTimeout(function() {
            fileNotExistsTries = fileNotExistsTries || 0;
            fileNotExistsTries++;

            if (fileNotExistsTries > 5) {
                fileNotExistsTries = 0;
                files.lastIndex -= 1;
            }
            concatenateInWindows(files, times, fileNotExistsTries);
        }, 2000);
        return;
    }

    mergelist = mergelist.substr(0, mergelist.length - 1);

    // this TEXT file is used to be invoked in ffmpeg
    // ffmpeg reads it, and merges all files accordingly
    var mergelist_file_txt = uploadsFolder + files.fileName + '-mergelist.txt';

    // if TEXT file already exists, remove it.
    if (fs.existsSync(mergelist_file_txt)) {
        fs.unlink(mergelist_file_txt);
    }

    // write TEXT file and wait for success-callback
    fs.writeFile(mergelist_file_txt, mergelist, function(err) {
        if (err) {
            // todo?????if it fails?
            console.log('dev-logs', err);

            // todo?????if it fails?
            concatenateInLinuxOrMac(files, times, fileNotExistsTries);
        } else {
            // BAT file address
            var concatenate_bat = __dirname + '\\bat-files\\concatenate.bat';

            var final_file = uploadsFolder + files.userId + '.webm';
            var command = concatenate_bat + ', ' + mergelist_file_txt + ' ' + final_file;

            // invoke BAT via BASH
            exec(command, function(error, stdout, stderr) {
                if (error) {
                    console.log('ffmpeg-error', 'ffmpeg : An error occurred: ' + error.stack);

                    // if failed to concatenate then try-again-and-again until 30 minutes
                    times < 30 * 60 && setTimeout(function() {
                        if (!times) times = 0;
                        times += 1;
                        concatenateInWindows(files, times);
                    }, 1000);
                } else {
                    console.log('dev-logs', 'Successfully concatenated all WebM files from recording interval ' + files.interval + '.');

                    // remove TEXT file
                    fs.unlink(mergelist_file_txt);

                    // remove all user files
                    unlink_merged_files(uploadsFolder + files.fileName, lastIndex);

                    /// if requested:
                    // var ScaleRecordings = require('Scale-Recordings.js');
                    // ScaleRecordings(files, times);
                }
            });
        }
    });
}
