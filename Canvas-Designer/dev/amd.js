var browserFakeUserAgent = 'Fake/5.0 (FakeOS) AppleWebKit/123 (KHTML, like Gecko) Fake/12.3.4567.89 Fake/123.45';

(function(that) {
    if (typeof window !== 'undefined') {
        return;
    }

    if (typeof window === 'undefined' && typeof global !== 'undefined') {
        global.navigator = {
            userAgent: browserFakeUserAgent,
            getUserMedia: function() {}
        };

        /*global window:true */
        that.window = global;
    } else if (typeof window === 'undefined') {
        // window = this;
    }

    if (typeof document === 'undefined') {
        /*global document:true */
        that.document = {};

        document.createElement = document.captureStream = document.mozCaptureStream = function() {
            return {};
        };
    }

    if (typeof location === 'undefined') {
        /*global location:true */
        that.location = {
            protocol: 'file:',
            href: '',
            hash: ''
        };
    }

    if (typeof screen === 'undefined') {
        /*global screen:true */
        that.screen = {
            width: 0,
            height: 0
        };
    }
})(typeof global !== 'undefined' ? global : window);

if (typeof CanvasDesigner !== 'undefined') {
    window.CanvasDesigner = CanvasDesigner;

    if (typeof module !== 'undefined' /* && !!module.exports*/ ) {
        module.exports = CanvasDesigner;
    }

    if (typeof define === 'function' && define.amd) {
        define('CanvasDesigner', [], function() {
            return CanvasDesigner;
        });
    }
}
