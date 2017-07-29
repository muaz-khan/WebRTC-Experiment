var runtimePort;

chrome.runtime.onConnect.addListener(function(port) {
    runtimePort = port;

    runtimePort.onMessage.addListener(function(message) {
        if (!message || !message.messageFromContentScript1234) {
            return;
        }

        if (message.startRecording) {
            if (!!isRecordingVOD) {
                stopVODRecording();
                return;
            }

            getUserConfigs();
            return;
        }

        if (message.stopRecording) {
            if (recorder && recorder.streams) {
                recorder.streams.forEach(function(stream, idx) {
                    stream.getTracks().forEach(function(track) {
                        track.stop();
                    });

                    if (idx == 0 && typeof stream.onended === 'function') {
                        stream.onended();
                    }
                });

                recorder.streams = null;
            }

            isRecording = false;
            setBadgeText('');
            chrome.browserAction.setIcon({
                path: 'images/main-icon.png'
            });
            return;
        }
    });
});
