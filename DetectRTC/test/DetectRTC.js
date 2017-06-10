describe('DetectRTC', function() {
    it('DetectRTC compiled using grunt', function() {
        console.log('------------------------------');
        console.log('\x1b[31m%s\x1b[0m ', 'DetectRTC.js');

        browser.driver.get('https://webrtcweb.com/DetectRTC/DetectRTC.html').then(function() {
            var booleans = {};
            var failed = {};

            ['hasWebcam', 'hasMicrophone', 'hasSpeakers', 'isApplyConstraintsSupported',
                'isAudioContextSupported', 'isCanvasSupportsStreamCapturing',
                'isCreateMediaStreamSourceSupported', 'isGetUserMediaSupported',
                'isMobileDevice', 'isMultiMonitorScreenCapturingSupported', 'isORTCSupported',
                'isPromisesSupported', 'isRTPSenderReplaceTracksSupported', 'isRemoteStreamProcessingSupported',
                'isRtpDataChannelsSupported', 'isScreenCapturingSupported', 'isSctpDataChannelsSupported',
                'isSetSinkIdSupported', 'isVideoSupportsStreamCapturing', 'isWebRTCSupported',
                'isWebSocketsBlocked', 'isWebSocketsSupported', 'isWebsiteHasMicrophonePermissions', 'isWebsiteHasWebcamPermissions'
            ].forEach(function(prop) {
                browser.driver.findElement(by.id(prop)).getText().then(function(value) {
                    if (!value.toString().length) {
                        failed[prop] = true;
                        return;
                    }

                    if (typeof value !== 'boolean') {
                        if (value === 'true') {
                            value = true;
                        } else if (value === 'false') {
                            value = false;
                        } else {
                            value = value;
                        }
                    }

                    booleans[prop] = value;
                });
            });

            browser.wait(function() {
                Object.keys(booleans).forEach(function(key) {
                    console.log(key + ': ' + booleans[key]);
                });

                if (Object.keys(failed).length) {
                    Object.keys(failed).forEach(function(key) {
                        console.error(key + ': test failed.');
                    });

                    throw new Error(Object.keys(failed).length + ' tests failed.');
                }

                return true;
            }, 1000, 'DetectRTC did not return valid information.');
        });
    });
});
