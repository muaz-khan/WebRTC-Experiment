<?php
    // Muaz Khan         - www.MuazKhan.com
    // MIT License       - www.WebRTC-Experiment.com/licence
    // Documentation     - github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC
    
    // make sure that you're using newest ffmpeg version!

    // because we've different ffmpeg commands for windows & linux
    // that's why following script is used to fetch target OS
    $OSList = array
    (
    'Windows 3.11' => 'Win16',
    'Windows 95' => '(Windows 95)|(Win95)|(Windows_95)',
    'Windows 98' => '(Windows 98)|(Win98)',
    'Windows 2000' => '(Windows NT 5.0)|(Windows 2000)',
    'Windows XP' => '(Windows NT 5.1)|(Windows XP)',
    'Windows Server 2003' => '(Windows NT 5.2)',
    'Windows Vista' => '(Windows NT 6.0)',
    'Windows 7' => '(Windows NT 7.0)',
    'Windows NT 4.0' => '(Windows NT 4.0)|(WinNT4.0)|(WinNT)|(Windows NT)',
    'Windows ME' => 'Windows ME',
    'Open BSD' => 'OpenBSD',
    'Sun OS' => 'SunOS',
    'Linux' => '(Linux)|(X11)',
    'Mac OS' => '(Mac_PowerPC)|(Macintosh)',
    'QNX' => 'QNX',
    'BeOS' => 'BeOS',
    'OS/2' => 'OS/2',
    'Search Bot'=>'(nuhk)|(Googlebot)|(Yammybot)|(Openbot)|(Slurp)|(MSNBot)|(Ask Jeeves/Teoma)|(ia_archiver)'
    );
    // Loop through the array of user agents and matching operating systems
    foreach($OSList as $CurrOS=>$Match)
    {
        // Find a match
        if (eregi($Match, $_SERVER['HTTP_USER_AGENT']))
        {
            // We found the correct match
            break;
        }
    }

    // if it is audio-blob
    if (isset($_FILES["audio-blob"])) {
        $uploadDirectory = 'uploads/'.$_POST["filename"].'.wav';
        if (!move_uploaded_file($_FILES["audio-blob"]["tmp_name"], $uploadDirectory)) {
            echo("Problem writing audio file to disk!");
        }
        else {
            // if it is video-blob
            if (isset($_FILES["video-blob"])) {
                $uploadDirectory = 'uploads/'.$_POST["filename"].'.webm';
                if (!move_uploaded_file($_FILES["video-blob"]["tmp_name"], $uploadDirectory)) {
                    echo("Problem writing video file to disk!");
                }
                else {
                    $audioFile = 'uploads/'.$_POST["filename"].'.wav';
                    $videoFile = 'uploads/'.$_POST["filename"].'.webm';
                    
                    $mergedFile = 'uploads/'.$_POST["filename"].'-merged.webm';
                    
                    // ffmpeg depends on yasm
                    // libvpx depends on libvorbis
                    // libvorbis depends on libogg
                    // make sure that you're using newest ffmpeg version!
                    
                    if(!strrpos($CurrOS, "Windows")) {
                        $cmd = '-i '.$audioFile.' -i '.$videoFile.' -map 0:0 -map 1:0 '.$mergedFile;
                    }
                    else {
                        $cmd = ' -i '.$audioFile.' -i '.$videoFile.' -c:v mpeg4 -c:a vorbis -b:v 64k -b:a 12k -strict experimental '.$mergedFile;
                    }
                    
                    exec('ffmpeg '.$cmd.' 2>&1', $out, $ret);
                    if ($ret){
                        echo "There was a problem!\n";
                        print_r($cmd.'\n');
                        print_r($out);
                    } else {
                        echo "Ffmpeg successfully merged audi/video files into single WebM container!\n";
                        
                        unlink($audioFile);
                        unlink($videoFile);
                    }
                }
            }
        }
    }
?>
