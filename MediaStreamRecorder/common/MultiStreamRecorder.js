// ______________________
// MultiStreamRecorder.js

function MultiStreamRecorder(arrayOfMediaStreams) {
    if (arrayOfMediaStreams instanceof MediaStream) {
        arrayOfMediaStreams = [arrayOfMediaStreams];
    }

    var self = this;

    if (!this.mimeType) {
        this.mimeType = 'video/webm';
    }

    if (!this.frameInterval) {
        this.frameInterval = 10;
    }

    if (!this.video) {
        this.video = {};
    }

    if (!this.video.width) {
        this.video.width = 360;
    }

    if (!this.video.height) {
        this.video.height = 240;
    }

    this.start = function(timeSlice) {
        isStoppedRecording = false;
        var mixedVideoStream = getMixedVideoStream();

        var mixedAudioStream = getMixedAudioStream();
        if (mixedAudioStream) {
            mixedAudioStream.getAudioTracks().forEach(function(track) {
                mixedVideoStream.addTrack(track);
            });
        }

        if (self.previewStream && typeof self.previewStream === 'function') {
            self.previewStream(mixedVideoStream);
        }

        mediaRecorder = new MediaStreamRecorder(mixedVideoStream);

        for (var prop in self) {
            if (typeof self[prop] !== 'function') {
                mediaRecorder[prop] = self[prop];
            }
        }

        mediaRecorder.ondataavailable = function(blob) {
            self.ondataavailable(blob);
        };

        mediaRecorder.onstop = self.onstop;

        drawVideosToCanvas();

        mediaRecorder.start(timeSlice);
    };

    this.stop = function(callback) {
        isStoppedRecording = true;

        if (!mediaRecorder) {
            return;
        }

        mediaRecorder.stop(function(blob) {
            callback(blob);
        });
    };

    function getMixedAudioStream() {
        // via: @pehrsons
        if (!ObjectStore.AudioContextConstructor) {
            ObjectStore.AudioContextConstructor = new ObjectStore.AudioContext();
        }

        self.audioContext = ObjectStore.AudioContextConstructor;

        self.audioSources = [];

        self.gainNode = self.audioContext.createGain();
        self.gainNode.connect(self.audioContext.destination);
        self.gainNode.gain.value = 0; // don't hear self

        var audioTracksLength = 0;
        arrayOfMediaStreams.forEach(function(stream) {
            if (!stream.getAudioTracks().length) {
                return;
            }

            audioTracksLength++;

            var audioSource = self.audioContext.createMediaStreamSource(stream);
            audioSource.connect(self.gainNode);
            self.audioSources.push(audioSource);
        });

        if (!audioTracksLength) {
            return;
        }

        self.audioDestination = self.audioContext.createMediaStreamDestination();
        self.audioSources.forEach(function(audioSource) {
            audioSource.connect(self.audioDestination);
        });
        return self.audioDestination.stream;
    }

    var videos = [];
    var mediaRecorder;

    function getMixedVideoStream() {
        // via: @adrian-ber
        arrayOfMediaStreams.forEach(function(stream) {
            if (!stream.getVideoTracks().length) {
                return;
            }

            var video = getVideo(stream);
            video.width = self.video.width;
            video.height = self.video.height;
            videos.push(video);
        });

        var capturedStream;

        if ('captureStream' in canvas) {
            capturedStream = canvas.captureStream();
        } else if ('mozCaptureStream' in canvas) {
            capturedStream = canvas.mozCaptureStream();
        } else if (!self.disableLogs) {
            console.error('Upgrade to latest Chrome or otherwise enable this flag: chrome://flags/#enable-experimental-web-platform-features');
        }

        var videoStream = new MediaStream();

        // via #126
        capturedStream.getVideoTracks().forEach(function(track) {
            videoStream.addTrack(track);
        });

        return videoStream;
    }

    function getVideo(stream) {
        var video = document.createElement('video');
        video.src = URL.createObjectURL(stream);
        video.play();
        return video;
    }

    var isStoppedRecording = false;

    function drawVideosToCanvas() {
        if (isStoppedRecording) {
            return;
        }

        var videosLength = videos.length;

        canvas.width = videosLength > 1 ? videos[0].width * 2 : videos[0].width;
        canvas.height = videosLength > 2 ? videos[0].height * 2 : videos[0].height;

        videos.forEach(function(video, idx) {
            if (videosLength === 1) {
                context.drawImage(video, 0, 0, video.width, video.height);
                return;
            }

            if (videosLength === 2) {
                var x = 0;
                var y = 0;

                if (idx === 1) {
                    x = video.width;
                }

                context.drawImage(video, x, y, video.width, video.height);
                return;
            }

            if (videosLength === 3) {
                var x = 0;
                var y = 0;

                if (idx === 1) {
                    x = video.width;
                }

                if (idx === 2) {
                    y = video.height;
                }

                context.drawImage(video, x, y, video.width, video.height);
                return;
            }

            if (videosLength === 4) {
                var x = 0;
                var y = 0;

                if (idx === 1) {
                    x = video.width;
                }

                if (idx === 2) {
                    y = video.height;
                }

                if (idx === 3) {
                    x = video.width;
                    y = video.height;
                }

                context.drawImage(video, x, y, video.width, video.height);
                return;
            }
        });

        setTimeout(drawVideosToCanvas, self.frameInterval);
    }

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    canvas.style = 'opacity:0;position:absolute;z-index:-1;top: -100000000;left:-1000000000;';

    (document.body || document.documentElement).appendChild(canvas);

    this.pause = function() {
        if (mediaRecorder) {
            mediaRecorder.pause();
        }
    };

    this.resume = function() {
        if (mediaRecorder) {
            mediaRecorder.resume();
        }
    };

    this.clearRecordedData = function() {
        videos = [];

        isStoppedRecording = false;
        mediaRecorder = null;

        if (mediaRecorder) {
            mediaRecorder.clearRecordedData();
        }

        if (self.gainNode) {
            self.gainNode.disconnect();
            self.gainNode = null;
        }

        if (self.audioSources.length) {
            self.audioSources.forEach(function(source) {
                source.disconnect();
            });
            self.audioSources = [];
        }

        if (self.audioDestination) {
            self.audioDestination.disconnect();
            self.audioDestination = null;
        }

        // maybe "audioContext.close"?
        self.audioContext = null;

        context.clearRect(0, 0, canvas.width, canvas.height);

        if (canvas.stream) {
            canvas.stream.stop();
            canvas.stream = null;
        }
    };

    this.addStream = function(stream) {
        if (stream instanceof Array && stream.length) {
            stream.forEach(this.addStream);
            return;
        }
        arrayOfMediaStreams.push(stream);

        if (!mediaRecorder) {
            return;
        }

        if (stream.getVideoTracks().length) {
            var video = getVideo(stream);
            video.width = self.video.width;
            video.height = self.video.height;
            videos.push(video);
        }

        if (stream.getAudioTracks().length && self.audioContext) {
            var audioSource = self.audioContext.createMediaStreamSource(stream);
            audioSource.connect(self.audioDestination);
        }
    };

    this.ondataavailable = function(blob) {
        if (self.disableLogs) {
            return;
        }
        console.log('ondataavailable', blob);
    };

    this.onstop = function() {};
}

if (typeof MediaStreamRecorder !== 'undefined') {
    MediaStreamRecorder.MultiStreamRecorder = MultiStreamRecorder;
}
