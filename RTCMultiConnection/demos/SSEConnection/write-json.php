<?php
// Muaz Khan     - www.MuazKhan.com 
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/muaz-khan/RTCMultiConnection

// "sender" stands for "Sender User Unique ID"
// "receiver" stands for "Receiver User Unique ID"
function writeJSON($json, $receiver, $sender)
{
    $path = './rooms/' . $receiver . '.json';
    $data = array();
    
    if (file_exists($path)) {
        // read file if already created
        $handle = fopen($path, 'r');
        $data   = fread($handle, filesize($path));
    } else {
        // create file if does NOT exist
        $handle = fopen($path, 'w');
    }
    
    $data = json_decode($data, true);
    
    // initiate JSON array for empty files
    if ($data == false) {
        $data = array();
    }
    
    // single user can receive messages from multiple participants
    // which is named as "video conferencing"
    // so each user's "UUID" is used to store their equivalent messages
    if (isset($data[$sender]) == false && empty($data[$sender]) == true) {
        $data[$sender] = array();
    }
    
    // store messsages based on "Sender Unique ID"
    $data[$sender][] = $json;
    
    fclose($handle);
    
    $handle = fopen($path, 'w');
    $fwrite = fwrite($handle, json_encode($data));
    
    if ($fwrite === false) {
        return 'fwrite failed';
    }
    
    fclose($handle);
    
    return 'success';
}

// this method resets the JSON
// to make sure that we do NOT send duplicate/similar data to the client (browser)
function removeJSON($receiver, $sender)
{
    $path = './rooms/' . $receiver . '.json';
    $data = array();
    
    if (file_exists($path)) {
        $handle = fopen($path, 'r');
        $data   = fread($handle, filesize($path));
    } else {
        $handle = fopen($path, 'w');
    }
    
    $data = json_decode($data, true);
    
    if ($data == false) {
        return true;
    }
    
    if (isset($data[$sender]) == false && empty($data[$sender]) == true) {
        return true;
    }
    
    unset($data[$sender]);
    
    fclose($handle);
    
    $handle = fopen($path, 'w');
    $fwrite = fwrite($handle, json_encode($data));
    
    if ($fwrite === false) {
        return 'fwrite failed';
    }
    
    fclose($handle);
    
    return true;
}
?>
