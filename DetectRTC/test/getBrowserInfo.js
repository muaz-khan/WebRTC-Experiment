function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

describe('DetectRTC', function() {
    it('dev/getBrowserInfo + dev/detectPrivateBrowsing', function() {
        console.log('------------------------------');
        console.log('\x1b[31m%s\x1b[0m ', 'dev/getBrowserInfo.js');
        console.log('\x1b[31m%s\x1b[0m ', 'dev/detectPrivateBrowsing.js');

        browser.driver.get('https://webrtcweb.com/DetectRTC/getBrowserInfo.html').then(function() {
            var browserName = '';
            var browserVersion = 0;
            var browserFullVersion = 0;
            var isPrivateBrowsing = 0;

            var failed = {};

            browser.driver.findElement(by.id('browserName')).getText().then(function(value) {
                if (!value.toString().length) {
                    failed['browserName'] = true;
                    return;
                }

                browserName = value;
            });

            browser.driver.findElement(by.id('browserVersion')).getText().then(function(value) {
                if (!value.toString().length) {
                    failed['browserVersion'] = true;
                    return;
                }

                browserVersion = value;
            });

            browser.driver.findElement(by.id('browserFullVersion')).getText().then(function(value) {
                if (!value.toString().length) {
                    failed['browserFullVersion'] = true;
                    return;
                }

                browserFullVersion = value;
            });

            browser.driver.findElement(by.id('isPrivateBrowsing')).getText().then(function(value) {
                if (!value.toString().length) {
                    failed['isPrivateBrowsing'] = true;
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

                isPrivateBrowsing = value;
            });

            browser.wait(function() {
                console.log('browserName: ' + browserName);
                console.log('browserVersion: ' + browserVersion);
                console.log('browserFullVersion: ' + browserFullVersion);
                console.log('isPrivateBrowsing: ' + isPrivateBrowsing);

                if (Object.keys(failed).length) {
                    Object.keys(failed).forEach(function(key) {
                        console.error(key + ': test failed.');
                    });

                    throw new Error(Object.keys(failed).length + ' tests failed.');
                }

                // a few manual validations

                var browserNameLooksGood = false;

                var expectedNames = ['Chrome', 'Firefox', 'Opera', 'Edge', 'IE', 'Safari'];
                for (var i = 0; i < expectedNames.length; i++) {
                    if (browserName === expectedNames[i]) {
                        browserNameLooksGood = true;
                    }
                }

                if (browserNameLooksGood === false) {
                    throw new Error('Invalid browser name: ' + browserName);
                }

                if (!browserVersion.toString().length || isNumeric(browserVersion) === false) {
                    throw new Error('Invalid browser version: ' + browserVersion);
                }

                if (!browserFullVersion.toString().length) {
                    throw new Error('Invalid browser full version: ' + browserFullVersion);
                }

                if (typeof isPrivateBrowsing !== 'boolean') {
                    throw new Error('Invalid "isPrivateBrowsing" value: ' + isPrivateBrowsing);
                }

                return true;
            }, 1000, 'dev/getBrowserInfo.js did not return valid information.');
        });
    });
});
