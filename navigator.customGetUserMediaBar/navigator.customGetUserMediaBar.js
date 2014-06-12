// Last time updated at June 12, 2014, 08:32:23

// Muaz Khan         - http://www.MuazKhan.com
// MIT License       - https://www.WebRTC-Experiment.com/licence
// Documentation     - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/navigator.customGetUserMediaBar
// Demo              - https://www.WebRTC-Experiment.com/navigator.customGetUserMediaBar/

// __________________________________
// navigator.customGetUserMediaBar.js

/*
 *. https => displaying custom prompt-bar for HTTPs domains!
 *. Keep users privacy as much as possible!
 */

 // navigator.customGetUserMediaBar(mediaConstraints, success_callback, failure_callback);
// arg1==mediaConstraints::: {audio:true, video:true}
// arg2==success_callback::: user accepted the request
// arg3==failure_callback::: user denied   the request

navigator.customGetUserMediaBar = function (session, success_callback, failure_callback) {
    // this feature is useful only for chrome over HTTPs
    if (!!navigator.mozGetUserMedia || location.protocol !== 'https:') return success_callback();

    // it seems screen capturing request; simply skip custom notification-bar
    if (session.video && session.video.mandatory && session.video.mandatory.chromeMediaSource) {
        return success_callback();
    }

    var body = document.body || document.documentElement;

    var parentFontFamily = getCSSPropertyValue(body, 'font-family');

    var overlay = document.createElement('vide');
    overlay.setAttribute('style', getStyles('overlay'));
    body.appendChild(overlay);

    var notification_bar = document.createElement('iframe');
    body.appendChild(notification_bar);
    var iframe = notification_bar;

    notification_bar.setAttribute('style', getStyles('body'));

    notification_bar = notification_bar.contentDocument || notification_bar.contentWindow.document;
    notification_bar = notification_bar.body;
    notification_bar.setAttribute('style', 'margin:0;padding:0;font-family: ' + parentFontFamily + ';font-size: 16px;-webkit-user-select:none;');

    notification_bar.innerHTML = '<div style="position: fixed;margin: 0;top: 7px;right: 40px;"><a style="margin-right: 36px;text-decoration: underline;color: #2844FA;" href="https://support.google.com/chrome/answer/2693767?p=ib_access_cam_mic&rd=1" target="_blank" >Learn more</a><button style="' + getStyles('x') + '" id="close-notification-bar">x</button></div>';

    var domain = '<p style="letter-spacing: 1.5;display: inline;"><img src="' + navigator.customGetUserMediaBar.styles.icon + '" style="width: 20px;height: 19px;vertical-align: middle;margin-right: 6px;"><span style="vertical-align: middle;">' + location.href.replace('://', '-----').split('/')[0].replace('-----', '://') + '/</span></p>';

    if (location.protocol == 'https:') {
        domain = domain.replace('https:', '<span style="color:rgb(0, 206, 74);vertical-align: middle;">https:</span>');
    }

    if (session.audio && session.video) {
        notification_bar.innerHTML += domain + '<span style="vertical-align: middle;"> wants to use your microphone and webcam.</span>';
    } else if (session.audio && !session.video) {
        notification_bar.innerHTML += domain + '<span style="vertical-align: middle;"> wants to use your microphone.</span>';
    } else if (!session.audio && session.video) {
        notification_bar.innerHTML += domain + '<span style="vertical-align: middle;"> wants to use your webcam.</span>';
    }

    notification_bar.innerHTML += '<button id="allow-notification-bar">Allow</button>';
    notification_bar.innerHTML += '<button id="deny-notification-bar">Deny</button>';

    notification_bar.querySelector('#allow-notification-bar').setAttribute('style', getStyles('button-allow'));
    notification_bar.querySelector('#deny-notification-bar').setAttribute('style', getStyles('button-deny'));

    function hideBar() {
        iframe.style.opacity = 0;
        iframe.style.height = 0;
        document.documentElement.style.marginTop = 0;

        setTimeout(function () {
            body.removeChild(iframe);
            body.removeChild(overlay);
        }, 100);
    }

    notification_bar.querySelector('#close-notification-bar').onclick = function () {
        this.disabled = true;
        notification_bar.querySelector('#deny-notification-bar').onclick();
    };

    notification_bar.querySelector('#allow-notification-bar').onclick = function () {
        this.disabled = true;
        success_callback();
        hideBar();
    };
    notification_bar.querySelector('#allow-notification-bar').focus();

    notification_bar.querySelector('#deny-notification-bar').onclick = function () {
        this.disabled = true;
        failure_callback();
        hideBar();
    };

    iframe.style.opacity = 1;
    iframe.style.height = '32px';
    document.documentElement.style.marginTop = '32px';
};

function getStyles(property) {
    property = navigator.customGetUserMediaBar.styles[property];

    var css = '';
    for (var style in property) {
        css += style + ':' + property[style] + '; ';
    }
    return css;
}

function getCSSPropertyValue(element, property) {
    return window.getComputedStyle(element, null).getPropertyValue(property);
}

// you can easily customize bar-styles

var fontFamily = getCSSPropertyValue(document.body || document.documentElement, 'font-family') || 'Arial';

navigator.customGetUserMediaBar.styles = {
    body: {
        border: 0,
        position: 'fixed',
        left: 0,
        top: 0,
        'z-index': 10000,
        'font-size': '16px',
        'font-family': fontFamily,
        'font-weight': 'normal',
        padding: '4px 18px',
        'text-decoration': 'none',
        background: '-webkit-gradient( linear, left top, left bottom, color-stop(5%, #ededed), color-stop(100%, #dfdfdf) )',
        color: '#290D0D',
        display: 'inline-block',
        'text-shadow': '1px 1px 0px #ffffff',
        'box-shadow': 'inset 1px 1px 0px 0px #ffffff',
        width: '100%',
        'border-bottom': '1px solid rgb(175, 172, 172)',
        '-webkit-user-select': 'none',
        cursor: 'default',
        transition: 'all .2s ease',
        height: 0,
        opacity: 0,
        overflow: 'hidden'
    },
    overlay: {
        background: 'rgba(255, 255, 255, 0.66)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
    },
    icon: 'data:image/png;base64,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',
    x: {
        background: 'none',
        padding: '4px',
        height: 'auto',
        margin: 0,
        'line-height': '.5',
        color: 'black',
        'text-shadow': 'none',
        'box-shadow': 'none',
        border: '1px solid black',
        'border-radius': '2px',
        cursor: 'pointer'
    }
};

var buttonStyles = {
    'font-size': '14px',
    'font-family': fontFamily,
    'font-weight': 'normal',
    'border-radius': '3px',
    border: '1px solid #7C7777',
    padding: '4px 12px',
    'text-decoration': 'none',
    background: '-webkit-gradient(linear, 0% 0%, 0% 100%, color-stop(0.05, rgb(241, 241, 241)), to(rgb(230, 230, 230)))',
    'background-color': '#ededed',
    color: '#1B1A1A',
    display: 'inline-block',
    'box-shadow': 'inset 1px 1px 0px 0px #ffffff',
    'text-shadow': 'none'
};

navigator.customGetUserMediaBar.styles['button-allow'] = 
navigator.customGetUserMediaBar.styles['button-deny']  = buttonStyles;
