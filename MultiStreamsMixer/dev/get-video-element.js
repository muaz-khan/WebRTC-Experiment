function getVideo(stream) {
    var video = document.createElement('video');

    setSrcObject(stream, video);

    video.muted = true;
    video.volume = 0;

    video.width = stream.width || self.width || 360;
    video.height = stream.height || self.height || 240;

    video.play();

    return video;
}
