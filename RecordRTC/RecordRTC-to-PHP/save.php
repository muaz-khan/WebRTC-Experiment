<?php
// Muaz Khan     - www.MuazKhan.com 
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/muaz-khan/RecordRTC

header("Access-Control-Allow-Origin: *");

function selfInvoker()
{
    if (!isset($_POST['audio-filename']) && !isset($_POST['video-filename'])) {
        echo 'PermissionDeniedError';
        return;
    }
    
    $fileName = '';
    $tempName = '';
    
    if (isset($_POST['audio-filename'])) {
        $fileName = $_POST['audio-filename'];
        $tempName = $_FILES['audio-blob']['tmp_name'];
    } else {
        $fileName = $_POST['video-filename'];
        $tempName = $_FILES['video-blob']['tmp_name'];
    }
    
    if (empty($fileName) || empty($tempName)) {
        echo 'PermissionDeniedError';
        return;
    }

    $filePath = 'uploads/' . $fileName;
    
    // make sure that one can upload only allowed audio/video files
    $allowed = array(
        'webm',
        'wav',
        'mp4',
        'mp3',
        'ogg'
    );
    $extension = pathinfo($filePath, PATHINFO_EXTENSION);
    if (!$extension || empty($extension) || !in_array($extension, $allowed)) {
        echo 'PermissionDeniedError';
        continue;
    }
    
    if (!move_uploaded_file($tempName, $filePath)) {
        echo ('Problem saving file.');
        return;
    }
    
    echo ($filePath);
}

selfInvoker();
?>
