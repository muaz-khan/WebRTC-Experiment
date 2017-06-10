exports.config = {
    specs: [
        './video-recording.js',
        './audio-recording.js',
        './video-recording-using-WhammyRecorder.js',
        './audio-recording-using-StereoAudioRecorder.js',
        './canvas-recording.js'
    ],
    seleniumAddress: 'http://hub-cloud.browserstack.com/wd/hub',
    multiCapabilities: []
};

function getDefaultBrowserInfo(browserName) {
    return {
        browserName: browserName,
        build: 'RecordRTC',
        name: 'RecordRTC_Tests',

        'browserstack.user': process.env.BROWSERSTACK_USERNAME,
        'browserstack.key': process.env.BROWSERSTACK_KEY,
        'browserstack.debug': 'true',

        'os': 'Windows',
        'os_version': '7',
        'browser_version': '58.0',
        'resolution': '1024x768',
        'chromeOptions': {
            args: [
                // '--enable-logging=stderr',
                // '--no-first-run',
                // '--no-default-browser-check',
                // '--disable-translate',
                '--use-fake-ui-for-media-stream',
                '--use-fake-device-for-media-stream',
                // '--vmodule="*media/*=3,*turn*=3"',
                // "--headless", 
                // "--disable-gpu",
                "--enable-experimental-web-platform-features",
                // "--allow-http-screen-capture",
                // "--enable-usermedia-screen-capturing"
            ]
        }
    };
}

var browserInfo = getDefaultBrowserInfo('Chrome');
exports.config.multiCapabilities.push(browserInfo);
