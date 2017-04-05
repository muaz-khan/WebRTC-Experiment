<?php
// Muaz Khan     - www.MuazKhan.com 
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/muaz-khan/RTCMultiConnection

require('write-json.php');
require('get-param.php');
require('enableCORS.php');

if (getParam('data') && getParam('receiver') && getParam('sender')) {
    $response = writeJSON(getParam('data'), getParam('receiver'), getParam('sender'));
    
    if ($response != true) {
        echo $response;
    }
    
    echo $response;
    exit();
}
?>
