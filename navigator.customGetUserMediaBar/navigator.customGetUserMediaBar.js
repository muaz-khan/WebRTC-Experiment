// Last time updated at June 01, 2014, 08:32:23

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

    var styles = [
        'border:0;position: fixed;left:0;top: 0;z-index: 10000;font-size: 16px;font-family: Arial;font-weight: normal;padding: 4px 18px;text-decoration: none;background: -webkit-gradient( linear, left top, left bottom, color-stop(5%, #ededed), color-stop(100%, #dfdfdf) );color: #290D0D;display: inline-block;text-shadow: 1px 1px 0px #ffffff;box-shadow: inset 1px 1px 0px 0px #ffffff;width: 100%;border-bottom: 1px solid rgb(175, 172, 172);-webkit-user-select:none;cursor:default;transition: all .1s ease;height:0;overflow:hidden;opacity:0;'
    ];

    var notification_bar = document.createElement('iframe');
    body.appendChild(notification_bar);
    var iframe = notification_bar;

    notification_bar.setAttribute('style', styles.join(''));

    notification_bar = notification_bar.contentDocument || notification_bar.contentWindow.document;
    notification_bar = notification_bar.body;
    notification_bar.setAttribute('style', 'margin:0;padding:0;font-family: Arial;font-size: 16px;');

    notification_bar.innerHTML = '<div style="position: fixed;margin: 0;top: 7px;right: 40px;"><a style="margin-right: 36px;text-decoration: underline;color: #2844FA;" href="https://support.google.com/chrome/answer/2693767?p=ib_access_cam_mic&rd=1" target="_blank" >Learn more</a><button style="background: none;padding: 4px;height: auto;margin: 0;line-height: .5;color: black;text-shadow: none;box-shadow: none;border: 1px solid black;border-radius: 2px;cursor: pointer;" id="close-notification-bar">x</button></div>';

    if (session.audio && session.video) {
        notification_bar.innerHTML += location.href.replace('://', '-----').split('/')[0].replace('-----', '://') + '/ wants to use your microphone and webcam.';
    } else if (session.audio && !session.video) {
        notification_bar.innerHTML += location.href.replace('://', '-----').split('/')[0].replace('-----', '://') + '/ wants to use your microphone.';
    } else if (!session.audio && session.video) {
        notification_bar.innerHTML += location.href.replace('://', '-----').split('/')[0].replace('-----', '://') + '/ wants to use your webcam.';
    }

    var buttonSyles = 'font-size: 14px;font-family: Arial;font-weight: normal;border-radius: 3px;border: 1px solid #7C7777;padding: 4px 12px;text-decoration: none;background: -webkit-gradient( linear, left top, left bottom, color-stop(5%, #D6D3D3), color-stop(100%, #FFFFFF) );background-color: #ededed;color: #1B1A1A;display: inline-block;box-shadow: inset 1px 1px 0px 0px #ffffff;text-shadow: none;';

    notification_bar.innerHTML += '<button id="allow-notification-bar">Allow</button>';
    notification_bar.innerHTML += '<button id="deny-notification-bar">Deny</button>';

    notification_bar.querySelector('#allow-notification-bar').setAttribute('style', buttonSyles);
    notification_bar.querySelector('#deny-notification-bar').setAttribute('style', buttonSyles);
    notification_bar.querySelector('#deny-notification-bar').style.background = '-webkit-gradient( linear, left top, left bottom, color-stop(5%, #F1F1F1), color-stop(100%, #E6E6E6) )';

    function hideBar() {
        iframe.style.opacity = 0;
        iframe.style.height = 0;
        document.documentElement.style.marginTop = 0;

        setTimeout(function () {
            body.removeChild(iframe);
        }, 100);
    }

    notification_bar.querySelector('#close-notification-bar').onclick = function () {
        notification_bar.querySelector('#deny-notification-bar').onclick();
    };

    notification_bar.querySelector('#allow-notification-bar').onclick = function () {
        success_callback();
        hideBar();
    };
    notification_bar.querySelector('#allow-notification-bar').focus();

    notification_bar.querySelector('#deny-notification-bar').onclick = function () {
        failure_callback();
        hideBar();
    };

    iframe.style.opacity = 1;
    iframe.style.height = '32px';
    document.documentElement.style.marginTop = '32px';
};
