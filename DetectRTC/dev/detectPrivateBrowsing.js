// via: https://gist.github.com/cou929/7973956

function retry(isDone, next) {
    var currentTrial = 0,
        maxRetry = 50,
        interval = 10,
        isTimeout = false;
    var id = window.setInterval(
        function() {
            if (isDone()) {
                window.clearInterval(id);
                next(isTimeout);
            }
            if (currentTrial++ > maxRetry) {
                window.clearInterval(id);
                isTimeout = true;
                next(isTimeout);
            }
        },
        10
    );
}

function isIE10OrLater(userAgent) {
    var ua = userAgent.toLowerCase();
    if (ua.indexOf('msie') === 0 && ua.indexOf('trident') === 0) {
        return false;
    }
    var match = /(?:msie|rv:)\s?([\d\.]+)/.exec(ua);
    if (match && parseInt(match[1], 10) >= 10) {
        return true;
    }
    return false;
}

function detectPrivateMode(callback) {
    var isPrivate;

    if (window.webkitRequestFileSystem) {
        window.webkitRequestFileSystem(
            window.TEMPORARY, 1,
            function() {
                isPrivate = false;
            },
            function(e) {
                console.log(e);
                isPrivate = true;
            }
        );
    } else if (window.indexedDB && /Firefox/.test(window.navigator.userAgent)) {
        var db;
        try {
            db = window.indexedDB.open('test');
        } catch (e) {
            isPrivate = true;
        }

        if (typeof isPrivate === 'undefined') {
            retry(
                function isDone() {
                    return db.readyState === 'done' ? true : false;
                },
                function next(isTimeout) {
                    if (!isTimeout) {
                        isPrivate = db.result ? false : true;
                    }
                }
            );
        }
    } else if (isIE10OrLater(window.navigator.userAgent)) {
        isPrivate = false;
        try {
            if (!window.indexedDB) {
                isPrivate = true;
            }
        } catch (e) {
            isPrivate = true;
        }
    } else if (window.localStorage && /Safari/.test(window.navigator.userAgent)) {
        try {
            window.localStorage.setItem('test', 1);
        } catch (e) {
            isPrivate = true;
        }

        if (typeof isPrivate === 'undefined') {
            isPrivate = false;
            window.localStorage.removeItem('test');
        }
    }

    retry(
        function isDone() {
            return typeof isPrivate !== 'undefined' ? true : false;
        },
        function next(isTimeout) {
            callback(isPrivate);
        }
    );
}
