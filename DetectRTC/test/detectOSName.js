describe('DetectRTC', function() {
    it('dev/detectOSName + dev/isMobile + dev/detectDesktopOS', function() {
        console.log('------------------------------');
        console.log('\x1b[31m%s\x1b[0m ', 'dev/detectOSName.js');
        console.log('\x1b[31m%s\x1b[0m ', 'dev/isMobile.js');
        console.log('\x1b[31m%s\x1b[0m ', 'dev/detectDesktopOS.js');

        browser.driver.get('https://webrtcweb.com/DetectRTC/detectOSName.html').then(function() {
            var osName = '';
            var osVersion = 0;

            browser.driver.findElement(by.id('osName')).getText().then(function(value) {
                osName = value;
            });

            browser.driver.findElement(by.id('osVersion')).getText().then(function(value) {
                osVersion = value;
            });

            browser.wait(function() {
                console.log('osName: ' + osName);
                console.log('osVersion: ' + osVersion);

                if (osName === 'Unknown OS') {
                    throw new Error('Invalid OS version: ' + osName);
                }

                if (!osVersion.toString().length || osVersion === 'Unknown OS Version') {
                    throw new Error('Invalid OS version: ' + osVersion);
                }

                return true;
            }, 1000, 'detectOSName did not return valid information.');
        });
    });
});
