describe('DetectRTC', function() {
    it('dev/CheckDeviceSupport', function() {
        console.log('------------------------------');
        console.log('\x1b[31m%s\x1b[0m ', 'dev/CheckDeviceSupport.js');

        browser.driver.get('https://webrtcweb.com/DetectRTC/CheckDeviceSupport.html').then(function() {
            var audioInputDevices = 0;
            var audioOutputDevices = 0;
            var videoInputDevices = 0;

            browser.driver.findElement(by.id('audioInputDevices')).getText().then(function(value) {
                audioInputDevices = value;
            });

            browser.driver.findElement(by.id('audioOutputDevices')).getText().then(function(value) {
                audioOutputDevices = value;
            });

            browser.driver.findElement(by.id('videoInputDevices')).getText().then(function(value) {
                videoInputDevices = value;
            });

            browser.wait(function() {
                console.log('audioInputDevices: ' + audioInputDevices);
                console.log('audioOutputDevices: ' + audioOutputDevices);
                console.log('videoInputDevices: ' + videoInputDevices);

                return true;
            }, 1000, 'CheckDeviceSupport did not return valid information.');
        });
    });
});
