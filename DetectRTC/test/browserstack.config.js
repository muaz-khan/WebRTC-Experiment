exports.config = {
    specs: [
        './getBrowserInfo.js',
        './detectOSName.js',
        './CheckDeviceSupport.js',
        './DetectRTC.js'
    ],
    seleniumAddress: 'http://hub-cloud.browserstack.com/wd/hub',
    multiCapabilities: []
};

['Chrome' /*, 'Firefox'*/ ].forEach(function(browserName) {
    var browserInfo = getDefaultBrowserInfo(browserName);

    [ /*'OS X',*/ 'Windows'].forEach(function(os) {
        browserInfo.os = os;
        exports.config.multiCapabilities.push(browserInfo);
    });
});

function getDefaultBrowserInfo(browserName) {
    return {
        browserName: browserName,
        build: 'DetectRTC',
        name: 'DetectRTC_Tests',

        'browserstack.user': process.env.BROWSERSTACK_USERNAME,
        'browserstack.key': process.env.BROWSERSTACK_KEY,
        'browserstack.debug': 'true'
    };
}

// android
/*
var androidInfo = getDefaultBrowserInfo('android');
androidInfo.device = 'Samsung Galaxy S5';
androidInfo.platform = 'ANDROID';
exports.config.multiCapabilities.push(androidInfo);
*/
