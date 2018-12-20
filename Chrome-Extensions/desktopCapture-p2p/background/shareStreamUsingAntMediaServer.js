function shareStreamUsingAntMediaServer(stream) {
    var wrapper = new AntMediaWrapper();
    wrapper.callbacks('onopen', function() {
        var uid = room_id || (Math.random() * 100).toString().replace('.', '');
        wrapper.publish(stream, uid, function(isPublished, error) {
            if (isPublished === true) {
                var resultingURL = 'http://webrtcweb.com/screen/ant/?s=' + uid;
                var hlsURL = 'http://webrtcweb.com/screen/ant/?s=' + uid + '&hls=true';

                var html = "<title>Unique Room URL</title><link rel='icon' href='images/desktopCapture128.png'><h1 style='text-align:center'>Copy following private URL:</h1>";
                html += "<p><label style='font-weight:bold'>WebRTC URL:</label><br><input type='text' value='" + resultingURL + "' style='text-align:left;width:100%;font-size:1.2em;'></p>";
                html += "<p><label style='font-weight:bold'>HLS Live Stream URL:</label><br><input type='text' value='" + hlsURL + "' style='text-align:left;width:100%;font-size:1.2em;'></p>";

                var popup_width = 600;
                var popup_height = 230;

                chrome.windows.create({
                    url: "data:text/html," + html,
                    type: 'popup',
                    width: popup_width,
                    height: popup_height,
                    top: parseInt((screen.height / 2) - (popup_height / 2)),
                    left: parseInt((screen.width / 2) - (popup_width / 2)),
                    focused: true
                }, function(win) {
                    popup_id = win.id;
                });

                chrome.browserAction.enable();
                setBadgeText(0);
            } else {
                alert(error);
            }
        });
    });

    wrapper.callbacks('onerror', function() {
        alert('Ant-Media Server is down or not reachable in the moment. Please go to options page and try other streaming method.');
        stream.getTracks().forEach(function(track) {
            track.stop();
        });
        setDefaults();
    });
}
