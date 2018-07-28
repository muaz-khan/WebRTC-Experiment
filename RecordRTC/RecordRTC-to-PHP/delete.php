<?php
// Muaz Khan     - www.MuazKhan.com 
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/muaz-khan/RecordRTC

header("Access-Control-Allow-Origin: *");

function selfInvoker()
{
    if (!isset($_POST['delete-file'])) {
        echo 'PermissionDeniedError';
        return;
    }
    
    $fileName = $_POST['delete-file'];
    $filePath = 'uploads/' . $fileName;
    
    // make sure that one can delete only allowed audio/video files
    $allowed = array(
        'webm',
        'wav',
        'mp4',
        "mkv",
        'mp3',
        'ogg'
    );
    $extension = pathinfo($filePath, PATHINFO_EXTENSION);
    if (!$extension || empty($extension) || !in_array($extension, $allowed)) {
        echo 'PermissionDeniedError';
        return;
    }
    
    if (!unlink($filePath)) {
        echo ('Problem deleting file.');
    } else {
        echo ($fileName . ' deleted successfully.');
    }
}

selfInvoker();
?>
