// 2013, @muazkh - github.com/muaz-khan
// MIT License - https://webrtc-experiment.appspot.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection

// FileSaver.SaveToDisk({fileName,fileURL});

var FileSaver = {
    SaveToDisk: function(e) {
        var save = document.createElement('a');
        save.href = e.fileURL;
        save.target = '_blank';
        save.download = e.fileName || e.fileURL;

        var evt = document.createEvent('MouseEvents');
        evt.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);

        save.dispatchEvent(evt);
        (window.URL || window.webkitURL).revokeObjectURL(save.href);
    }
};
