<?php
// Muaz Khan     - www.MuazKhan.com 
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC
if (isset($_POST['delete-file'])) {
    $fileName = 'uploads/'.$_POST['delete-file'];
    if(!unlink($fileName.'.webm') || !unlink($fileName.'.wav')) {
        echo(' problem deleting files.');
    }
    else {
        echo(' both wav/webm files deleted successfully.');
    }
}
?>