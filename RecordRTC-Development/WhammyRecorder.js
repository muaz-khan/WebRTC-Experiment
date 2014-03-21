// Muaz Khan         - www.MuazKhan.com
// MIT License       - www.WebRTC-Experiment.com/licence
// Documentation     - github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC

// _________________
// WhammyRecorder.js

function WhammyRecorder(mediaStream) {
    this.record = function() {
        if (!this.width) this.width = video.offsetWidth || 320;
        if (!this.height) this.height = video.offsetHeight || 240;

        if (!this.video) {
            this.video = {
                width: this.width,
                height: this.height
            };
        }

        if (!this.canvas) {
            this.canvas = {
                width: this.width,
                height: this.height
            };
        }

        canvas.width = this.canvas.width;
        canvas.height = this.canvas.height;

        video.width = this.video.width;
        video.height = this.video.height;

        drawFrames();
    };

    var frames = [];

    // if user want to display advertisement before recorded video!
    if (this.advertisement) {
        frames = advertisement;
    }

    function drawFrames() {
        var duration = new Date().getTime() - lastTime;
        lastTime = new Date().getTime();
        if (!duration) return setTimeout(drawFrames, 150);

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        frames.push({
            duration: duration,
            image: canvas.toDataURL('image/webp')
        });

        if (!isStopDrawing) {
            setTimeout(drawFrames, 150);
        }
    }

    var isStopDrawing = false;

    this.stop = function(callback) {
        isStopDrawing = true;
        whammy.frames = frames;
        frames = [];

        this.recordedBlob = whammy.compile();

        if (callback) callback(this.recordedBlob);
    };

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    var video = document.createElement('video');
    video.muted = true;
    video.volume = 0;
    video.autoplay = true;
    video.src = URL.createObjectURL(mediaStream);
    video.play();

    var lastTime = new Date().getTime();

    var whammy = new Whammy.Video();
}
