// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.WebRTC-Experiment.com/licence
// Source Code   - github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC/RecordRTC-to-Nodejs

var config = require('./config'),
    fs = require('fs'),
    sys = require('sys'),
    path = require('path'),
    exec = require('child_process').exec;

function home(response) {
    response.writeHead(200, {
        'Content-Type': 'text/html'
    });
    response.end(fs.readFileSync('./static/index.html'));
}

// this function uploads files

function upload(response, postData) {
    var files = JSON.parse(postData);

    // writing audio file to disk
    _upload(response, files.audio);

    if (files.uploadOnlyAudio) {
        response.statusCode = 200;
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(files.audio.name);
    }

    if (!files.uploadOnlyAudio) {
        // writing video file to disk
        _upload(response, files.video);

        merge(response, files);
    }
}

// this function merges wav/webm files

function merge(response, files) {
    var FFmpeg = require('fluent-ffmpeg');

    var audioFile = path.join(__dirname, 'uploads', files.audio.name),
	videoFile = path.join(__dirname, 'uploads', files.video.name),
	mergedFile = path.join(__dirname, 'uploads', files.audio.name.split('.')[0] + '-merged.webm');

    new FFmpeg({ source: videoFile })
	.addInput(audioFile)
	.on('error', function(err) {
	    console.log('An error occurred: ' + err.message);
	    response.statusCode = 404;
	    response.end();
	})
	.on('end', function() {
	    console.log('Merging finished !');
	    response.statusCode = 200;
	    response.writeHead(200, {
		'Content-Type': 'application/json'
	    });
	    response.end(files.audio.name.split('.')[0] + '-merged.webm');

	    // removing audio/video files
	    fs.unlink(audioFile);
	    fs.unlink(videoFile);
	})
	.saveToFile(mergedFile);
}

function _upload(response, file) {
    var fileRootName = file.name.split('.').shift(),
        fileExtension = file.name.split('.').pop(),
        filePathBase = config.upload_dir + '/',
        fileRootNameWithBase = filePathBase + fileRootName,
        filePath = fileRootNameWithBase + '.' + fileExtension,
        fileID = 2,
        fileBuffer;

    while (fs.existsSync(filePath)) {
        filePath = fileRootNameWithBase + '(' + fileID + ').' + fileExtension;
        fileID += 1;
    }

    file.contents = file.contents.split(',').pop();

    fileBuffer = new Buffer(file.contents, "base64");

    fs.writeFileSync(filePath, fileBuffer);
}

function serveStatic(response, pathname) {

    var extension = pathname.split('.').pop(),
        extensionTypes = {
            'js': 'application/javascript',
            'webm': 'video/webm',
            'mp4': 'video/mp4',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
            'gif': 'image/gif'
        };

    response.writeHead(200, {
        'Content-Type': extensionTypes[extension]
    });
    if (hasMediaType(extensionTypes[extension]))
        response.end(fs.readFileSync('.' + pathname));
    else
        response.end(fs.readFileSync('./static' + pathname));
}

function hasMediaType(type) {
    var isHasMediaType = false;
    ['audio/wav', 'audio/ogg', 'video/webm', 'video/mp4'].forEach(function(t) {
      if(t== type) isHasMediaType = true;
    });

    return isHasMediaType;
}

exports.home = home;
exports.upload = upload;
exports.serveStatic = serveStatic;
