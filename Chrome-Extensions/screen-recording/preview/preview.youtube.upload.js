var youtube_privacy = 'public';

chrome.storage.sync.get(null, function(items) {
    if (items['youtube_privacy'] && items['youtube_privacy'] !== 'public') {
        youtube_privacy = items['youtube_privacy'];
    }
});

document.querySelector('#btn-youtube-upload').onclick = function() {
    if (!file) {
        fname.innerHTML = 'You did NOT record anything yet.';
        return;
    }

    this.disabled = true;

    fresolutions.innerHTML = fsize.innerHTML = fduration.innerHTML = browserCache.innerHTML = '';
    fname.innerHTML = 'Google.getAuthToken...';

    chrome.identity.getAuthToken({
        'interactive': true
    }, function(access_token) {
        if (chrome.runtime.lastError) {
            if (typeof chrome.runtime.lastError === 'object') {
                if (chrome.runtime.lastError && chrome.runtime.lastError.message) {
                    alert(chrome.runtime.lastError.message);
                } else {
                    alert(JSON.stringify(chrome.runtime.lastError));
                }
            }

            fname.innerHTML = chrome.runtime.lastError;
            return;
        }

        fname.innerHTML = 'Upload started...';

        uploadVideo = new UploadVideo();
        uploadVideo.ready(access_token);
        uploadVideo.callback = uploadVideoCallback;
        uploadVideo.uploadFile(file.name, file);
    });
};

function showYouTubeURL(videoURL) {
    DiskStorage.UpdateFileInfo(file.name, {
        youtube: videoURL
    }, function() {
        file.url = videoURL;
        if(!file.item) file.item = {};
        file.item.youtube = videoURL;
        onGettingFile(file, file.item);
    });
}

function uploadVideoCallback(response, videoURL) {
    fname.innerHTML = 'YouTube Upload Progress: ' + response + '%';
    browserCache.innerHTML = '<progress min=0 max=100 value=' + response + ' style="margin-top: 10px;"></progress>';
    document.title = response + '% uploaded';

    if (response >= 100 || videoURL) {
        browserCache.innerHTML = '';
        fname.innerHTML = 'Uploaded to YouTube. Retrieving the video URL...';
    }

    if (videoURL) {
        browserCache.innerHTML = '';
        showYouTubeURL(videoURL);
        document.title = 'Upload successful';
    }

    // etag, id, kind
    // snippet => {title, categoryId, channelId, channelTitle, description, liveBroadcastContent, publishedAt, 
    //             tags[], localized{description,title}, 
    //             thumbnails{default{height, url, width}, hiegh{}, medium{}}
    //             status{embeddable, license, privacyStatus, publicStatsViewable, uploadStatus}}
    // uploadResponse.status.uploadStatus === 'uploaded'
    // uploadResponse.snippets.title (video title)
    // uploadResponse.snippets.channelId
}

/* upload_youtube_video.js Copyright 2017 Google Inc. All Rights Reserved. */
var uploadVideo;

var STATUS_POLLING_INTERVAL_MILLIS = 60 * 1000; // One minute.

var UploadVideo = function() {
    this.tags = ['recordrtc'];
    this.categoryId = 28;
    this.videoId = '';
    this.uploadStartTime = 0;
};


UploadVideo.prototype.ready = function(accessToken) {
    this.accessToken = accessToken;
    this.gapi = gapi;
    this.authenticated = true;
    false && this.gapi.client.request({
        path: '/youtube/v3/channels',
        params: {
            part: 'snippet',
            mine: true
        },
        callback: function(response) {
            if (!response.error) {
                // response.items[0].snippet.title -- channel title
                // response.items[0].snippet.thumbnails.default.url -- channel thumbnail
            }
        }.bind(this)
    });
};

UploadVideo.prototype.uploadFile = function(fileName, file) {
    var youtube_title = fileName;
    if (file.item && file.item.display) {
        youtube_title = file.item.display;
    }

    var metadata = {
        snippet: {
            title: youtube_title,
            description: fileName + ' (via RecordRTC)',
            tags: this.tags,
            categoryId: this.categoryId
        },
        status: {
            privacyStatus: youtube_privacy
        }
    };
    var uploader = new MediaUploader({
        baseUrl: 'https://www.googleapis.com/upload/youtube/v3/videos',
        file: file,
        token: this.accessToken,
        metadata: metadata,
        params: {
            part: Object.keys(metadata).join(',')
        },
        onError: function(data) {
            var message = data;
            try {
                var errorResponse = JSON.parse(data);
                message = errorResponse.error.message;
            } finally {
                alert(message);
            }
        }.bind(this),
        onProgress: function(data) {
            var bytesUploaded = data.loaded;
            var totalBytes = parseInt(data.total);
            var percentageComplete = parseInt((bytesUploaded * 100) / totalBytes);

            uploadVideo.callback(percentageComplete);
        }.bind(this),
        onComplete: function(data) {
            var uploadResponse = JSON.parse(data);

            this.uploadResponse = uploadResponse;
            this.videoId = uploadResponse.id;
            this.videoURL = 'https://www.youtube.com/watch?v=' + this.videoId;

            uploadVideo.callback('uploaded', this.videoURL);
            setTimeout(this.pollForVideoStatus, 2000);
        }.bind(this)
    });
    this.uploadStartTime = Date.now();
    uploader.upload();
};

UploadVideo.prototype.pollForVideoStatus = function() {
    this.gapi.client.request({
        path: '/youtube/v3/videos',
        params: {
            part: 'status,player',
            id: this.videoId
        },
        callback: function(response) {
            if (response.error) {
                uploadVideo.pollForVideoStatus();
            } else {
                var uploadStatus = response.items[0].status.uploadStatus;
                switch (uploadStatus) {
                    case 'uploaded':
                        uploadVideo.callback('uploaded', uploadVideo.videoURL);
                        uploadVideo.pollForVideoStatus();
                        break;
                    case 'processed':
                        uploadVideo.callback('processed', uploadVideo.videoURL);
                        break;
                    default:
                        uploadVideo.callback('failed', uploadVideo.videoURL);
                        break;
                }
            }
        }.bind(this)
    });
};

/* cors_upload.js Copyright 2015 Google Inc. All Rights Reserved. */

var DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v2/files/';

var RetryHandler = function() {
    this.interval = 1000; // Start at one second
    this.maxInterval = 60 * 1000; // Don't wait longer than a minute 
};

RetryHandler.prototype.retry = function(fn) {
    setTimeout(fn, this.interval);
    this.interval = this.nextInterval_();
};

RetryHandler.prototype.reset = function() {
    this.interval = 1000;
};

RetryHandler.prototype.nextInterval_ = function() {
    var interval = this.interval * 2 + this.getRandomInt_(0, 1000);
    return Math.min(interval, this.maxInterval);
};

RetryHandler.prototype.getRandomInt_ = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

var MediaUploader = function(options) {
    var noop = function() {};
    this.file = options.file;
    this.contentType = options.contentType || this.file.type || 'application/octet-stream';
    this.metadata = options.metadata || {
        'title': this.file.name,
        'mimeType': this.contentType
    };
    this.token = options.token;
    this.onComplete = options.onComplete || noop;
    this.onProgress = options.onProgress || noop;
    this.onError = options.onError || noop;
    this.offset = options.offset || 0;
    this.chunkSize = options.chunkSize || 0;
    this.retryHandler = new RetryHandler();

    this.url = options.url;
    if (!this.url) {
        var params = options.params || {};
        params.uploadType = 'resumable';
        this.url = this.buildUrl_(options.fileId, params, options.baseUrl);
    }
    this.httpMethod = options.fileId ? 'PUT' : 'POST';
};

MediaUploader.prototype.upload = function() {
    var self = this;
    var xhr = new XMLHttpRequest();

    xhr.open(this.httpMethod, this.url, true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + this.token);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('X-Upload-Content-Length', this.file.size);
    xhr.setRequestHeader('X-Upload-Content-Type', this.contentType);

    xhr.onload = function(e) {
        if (e.target.status < 400) {
            var location = e.target.getResponseHeader('Location');
            this.url = location;
            this.sendFile_();
        } else {
            this.onUploadError_(e);
        }
    }.bind(this);
    xhr.onerror = this.onUploadError_.bind(this);
    xhr.send(JSON.stringify(this.metadata));
};

MediaUploader.prototype.sendFile_ = function() {
    var content = this.file;
    var end = this.file.size;

    if (this.offset || this.chunkSize) {
        // Only bother to slice the file if we're either resuming or uploading in chunks
        if (this.chunkSize) {
            end = Math.min(this.offset + this.chunkSize, this.file.size);
        }
        content = content.slice(this.offset, end);
    }

    var xhr = new XMLHttpRequest();
    xhr.open('PUT', this.url, true);
    xhr.setRequestHeader('Content-Type', this.contentType);
    xhr.setRequestHeader('Content-Range', 'bytes ' + this.offset + '-' + (end - 1) + '/' + this.file.size);
    xhr.setRequestHeader('X-Upload-Content-Type', this.file.type);
    if (xhr.upload) {
        xhr.upload.addEventListener('progress', this.onProgress);
    }
    xhr.onload = this.onContentUploadSuccess_.bind(this);
    xhr.onerror = this.onContentUploadError_.bind(this);
    xhr.send(content);
};

MediaUploader.prototype.resume_ = function() {
    var xhr = new XMLHttpRequest();
    xhr.open('PUT', this.url, true);
    xhr.setRequestHeader('Content-Range', 'bytes */' + this.file.size);
    xhr.setRequestHeader('X-Upload-Content-Type', this.file.type);
    if (xhr.upload) {
        xhr.upload.addEventListener('progress', this.onProgress);
    }
    xhr.onload = this.onContentUploadSuccess_.bind(this);
    xhr.onerror = this.onContentUploadError_.bind(this);
    xhr.send();
};

MediaUploader.prototype.extractRange_ = function(xhr) {
    var range = xhr.getResponseHeader('Range');
    if (range) {
        this.offset = parseInt(range.match(/\d+/g).pop(), 10) + 1;
    }
};

MediaUploader.prototype.onContentUploadSuccess_ = function(e) {
    if (e.target.status == 200 || e.target.status == 201) {
        this.onComplete(e.target.response);
    } else if (e.target.status == 308) {
        this.extractRange_(e.target);
        this.retryHandler.reset();
        this.sendFile_();
    }
};

MediaUploader.prototype.onContentUploadError_ = function(e) {
    if (e.target.status && e.target.status < 500) {
        this.onError(e.target.response);
    } else {
        this.retryHandler.retry(this.resume_.bind(this));
    }
};

MediaUploader.prototype.onUploadError_ = function(e) {
    this.onError(e.target.response); // TODO - Retries for initial upload
};

MediaUploader.prototype.buildQuery_ = function(params) {
    params = params || {};
    return Object.keys(params).map(function(key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    }).join('&');
};

MediaUploader.prototype.buildUrl_ = function(id, params, baseUrl) {
    var url = baseUrl || DRIVE_UPLOAD_URL;
    if (id) {
        url += id;
    }
    var query = this.buildQuery_(params);
    if (query) {
        url += '?' + query;
    }
    return url;
};
