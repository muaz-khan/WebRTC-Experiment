var server_url = 'https://your-domain.com/f/';

document.querySelector('#btn-php-upload').onclick = function() {
    if (!file) {
        fname.innerHTML = 'You did NOT record anything yet.';
        return;
    }

    this.disabled = true;

    fresolutions.innerHTML = fsize.innerHTML = fduration.innerHTML = browserCache.innerHTML = '';
    fname.innerHTML = 'Upload started...';

    uploadToPHPServer(file, function(progress, videoURL) {
        browserCache.innerHTML = '';

        if (progress === 'ended' || videoURL) {
            showPHPURL(videoURL);
            document.title = 'Upload successful';
            return;
        }

        if (progress != 'Upload started...') {
            fname.innerHTML = 'Upload Progress: ' + progress + '%';
            browserCache.innerHTML = '<progress min=0 max=100 value=' + progress + ' style="margin-top: 10px;"></progress>';
        } else {
            fname.innerHTML = progress;
        }

        document.title = progress + '% uploaded';

        if (progress >= 99 || videoURL || progress === 'progress-ended') {
            browserCache.innerHTML = '';
            fname.innerHTML = 'Uploaded to Server. Retrieving the private video URL...';
        }
    });
};

function showPHPURL(videoURL) {
    DiskStorage.UpdateFileInfo(file.name, {
        php: videoURL
    }, function() {
        file.url = videoURL;
        if(!file.item) file.item = {};
        file.item.php = videoURL;
        onGettingFile(file, file.item);
    });
}

function uploadToPHPServer(blob, callback) {
    // create FormData
    var formData = new FormData();

    var fName = blob.name;

    formData.append('video-filename', fName);
    formData.append('video-blob', blob);

    callback('Uploading recorded-file to server.');

    makeXMLHttpRequest(server_url, formData, function(progress) {
        if (progress === 'upload-faild') {
            return;
        }

        if (progress !== 'http-response-200') {
            callback(progress);
            return;
        }

        callback('ended', server_url + fName);
    });
}

function deleteFromPHPServer(fName, callback) {
    // create FormData
    var formData = new FormData();

    formData.append('delete-file', fName);

    makeXMLHttpRequest(server_url + 'delete.php', formData, function(progress) {
        if (progress === 'deleted' || progress === 'Problem deleting file.') {
            callback(progress, fName)
        }
    });
}

function makeXMLHttpRequest(url, data, callback) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            if (request.responseText && request.responseText.toString().indexOf('<h2>Upload failed.</h2>') === 0) {
                fname.innerHTML = request.responseText;
                header.style.height = 'auto';
                header.style.color = 'red';
                callback('upload-faild');
                return;
            }

            if (request.responseText && request.responseText.toString().indexOf('deleted successfully') !== -1) {
                callback('deleted')
                return;
            }

            if (request.responseText && request.responseText.toString() === 'Problem deleting file.') {
                callback(request.responseText)
                return;
            }

            callback('http-response-200');
        }
    };

    request.upload.onloadstart = function() {
        callback('Upload started...');
    };

    request.upload.onprogress = function(event) {
        callback(Math.round(event.loaded / event.total * 100));
    };

    request.upload.onload = function() {
        callback('progress-about-to-end');
    };

    request.upload.onload = function() {
        callback('progress-ended');
    };

    request.upload.onerror = function(error) {
        callback('Failed to upload to server');
    };

    request.upload.onabort = function(error) {
        callback('Upload aborted.');
    };

    request.open('POST', url);
    request.send(data);
}
