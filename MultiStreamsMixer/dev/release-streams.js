this.releaseStreams = function() {
    videos = [];
    isStopDrawingFrames = true;

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

    if (self.audioContext) {
        self.audioContext.close();
    }

    self.audioContext = null;

    context.clearRect(0, 0, canvas.width, canvas.height);

    if (canvas.stream) {
        canvas.stream.stop();
        canvas.stream = null;
    }
};
