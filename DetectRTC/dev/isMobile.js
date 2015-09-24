var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    },
    getOsName: function() {
        var osName = 'Unknown OS';
        if(isMobile.Android()) {
            osName = 'Android';
        }

        if(isMobile.BlackBerry()) {
            osName = 'BlackBerry';
        }

        if(isMobile.iOS()) {
            osName = 'iOS';
        }

        if(isMobile.Opera()) {
            osName = 'Opera Mini';
        }

        if(isMobile.Windows()) {
            osName = 'Windows';
        }

        return osName;
    }
};
