function captureTabUsingTabCapture(resolutions) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(arrayOfTabs) {
        var activeTab = arrayOfTabs[0];
        var activeTabId = activeTab.id; // or do whatever you need

        var constraints = {
            video: true,
            videoConstraints: {
                mandatory: {
                    chromeMediaSource: 'tab',
                    maxWidth: resolutions.maxWidth,
                    maxHeight: resolutions.maxHeight,
                    minWidth: resolutions.minWidth,
                    minHeight: resolutions.minHeight,
                    minAspectRatio: getAspectRatio(resolutions.maxWidth, resolutions.maxHeight),
                    maxAspectRatio: getAspectRatio(resolutions.maxWidth, resolutions.maxHeight),
                    minFrameRate: 64,
                    maxFrameRate: 128
                }
            }
        };

        if (!!enableSpeakers) {
            constraints.audio = true;
            constraints.audioConstraints = {
                mandatory: {
                    echoCancellation: true
                },
                optional: [{
                    googDisableLocalEcho: false // https://www.chromestatus.com/feature/5056629556903936
                }]
            };
        }

        // chrome.tabCapture.onStatusChanged.addListener(function(event) { /* event.status */ });

        chrome.tabCapture.capture(constraints, function(stream) {
            gotTabCaptureStream(stream, constraints);
        });
    });
}
