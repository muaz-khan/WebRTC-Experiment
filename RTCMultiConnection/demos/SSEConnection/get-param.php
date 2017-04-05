<?php
// Muaz Khan     - www.MuazKhan.com 
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/muaz-khan/RTCMultiConnection

function getParam($id)
{
    $param = false;
    if (!empty($_POST[$id])) {
        $param = $_POST[$id];
    } else if (!empty($_GET[$id])) {
        $param = $_GET[$id];
    } else if (!empty($_REQUEST[$id])) {
        $param = $_REQUEST[$id];
    } else if (!empty($_SERVER[$id])) {
        $param = $_SERVER[$id];
    } else if (!empty($_FILES[$id])) {
        $param = $_FILES[$id];
    }
    return $param;
}
?>
