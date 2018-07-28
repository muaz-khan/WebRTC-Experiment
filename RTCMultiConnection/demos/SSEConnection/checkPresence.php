<?php
// Muaz Khan     - www.MuazKhan.com 
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/muaz-khan/RTCMultiConnection

require('get-param.php');
require('enableCORS.php');

if (getParam('roomid')) {
    $filename = getcwd().'/rooms/'.getParam('roomid').'.json';
    
    if (file_exists($filename)) {
        echo json_encode(array(
            'isRoomExist' => true,
            'roomid' => getParam('roomid')
        ));
    } else {
        echo json_encode(array(
            'isRoomExist' => false,
            'roomid' => getParam('roomid')
        ));
    }
}
?>