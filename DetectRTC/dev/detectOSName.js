var osName = 'Unknown OS';
var osVersion = 'Unknown OS Version';

if (isMobile.any()) {
    osName = isMobile.getOsName();
} else {
    var osInfo = detectDesktopOS();
    osName = osInfo.osName;
    osVersion = osInfo.osVersion;
}
