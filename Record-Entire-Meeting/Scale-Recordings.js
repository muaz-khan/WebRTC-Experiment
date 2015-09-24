var exec = require('child_process').exec;
var fs = require('fs');
var isWindows = !!process.platform.match(/^win/);

module.exports = exports = function(files) {
    if(isWindows) {
        scaleInWindows(files);
        return;
    }
    scaleInLinuxOrMac(files);
};

function scaleInLinuxOrMac(files, times, fileNotExistsTries) {
    console.log('dev-logs', 'Scaling recording interval ' + files.interval + '.');

    var uploadsFolder = __dirname + '/uploads/' + files.roomId + '/';

    var input_file = uploadsFolder + files.userId + '.webm';
    var output_file = uploadsFolder + files.userId + '-scaled.webm';
    var command = 'ffmpeg -y -i ' + input_file + ' -vf scale=640x360,setdar=16:9:max=1000 ' + output_file;

    exec(command, function(error, stdout, stderr) {
        if (error) {
            console.log('ffmpeg-error', 'ffmpeg : An error occurred: ' + error.stack);

            times < 30 * 60 && setTimeout(function() {
                if (!times) times = 0;
                times += 1;
                scaleInLinuxOrMac(files, times);
            }, 1000);
        } else {
            console.log('dev-logs', 'Successfully scaled from recording interval ' + files.interval + '.');
            fs.unlink(input_file);
        }
    });
}

function scaleInWindows(files, times, fileNotExistsTries) {
    console.log('dev-logs', 'Scaling from recording interval ' + files.interval + '.');

    var uploadsFolder = __dirname + '\\uploads\\' + files.roomId + '\\';


    var concatenate_bat = __dirname + '\\bat-files\\scale.bat';

    var input_file = uploadsFolder + files.userId + '.webm';
    var output_file = uploadsFolder + files.userId + '-scaled.webm';
    var command = concatenate_bat + ', ' + input_file + ' ' + output_file;

    exec(command, function(error, stdout, stderr) {
        if (error) {
            console.log('ffmpeg-error', 'ffmpeg : An error occurred: ' + error.stack);

            times < 30 * 60 && setTimeout(function() {
                if (!times) times = 0;
                times += 1;
                scaleInWindows(files, times);
            }, 1000);
        } else {
            console.log('dev-logs', 'Successfully scaled from recording interval ' + files.interval + '.');

            fs.unlink(input_file);
        }
    });
}
