var videoPlayers = [];

function initVideoPlayer(stream) {
    var videoPlayer = document.createElement('video');
    videoPlayer.muted = !enableTabCaptureAPI;
    videoPlayer.volume = !!enableTabCaptureAPI;
    videoPlayer.src = URL.createObjectURL(stream);

    videoPlayer.play();

    videoPlayers.push(videoPlayer);
}
