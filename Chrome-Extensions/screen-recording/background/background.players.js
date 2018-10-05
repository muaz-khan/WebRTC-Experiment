var videoPlayers = [];

function initVideoPlayer(stream) {
    var videoPlayer = document.createElement('video');
    videoPlayer.muted = !enableTabCaptureAPI;
    videoPlayer.volume = !!enableTabCaptureAPI;
    videoPlayer.srcObject = stream;

    videoPlayers.push(videoPlayer);
}
