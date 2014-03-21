// Muaz Khan         - www.MuazKhan.com
// MIT License       - www.WebRTC-Experiment.com/licence
// Documentation     - github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC

// _________________
// CanvasRecorder.js

function CanvasRecorder(htmlElement) {
    if (!window.html2canvas) throw 'Please link: //www.webrtc-experiment.com/screenshot.js';

    var isRecording;
    this.record = function() {
        isRecording = true;
        drawCanvasFrame();
    };

    this.stop = function() {
        isRecording = false;
        this.recordedBlob = whammy.compile();
        whammy.frames = [];
    };

    function drawCanvasFrame() {
        html2canvas(htmlElement, {
            onrendered: function(canvas) {
                whammy.add(canvas);
                if (isRecording) requestAnimationFrame(drawCanvasFrame);
            }
        });
    }

    var whammy = new Whammy.Video(100);
}
