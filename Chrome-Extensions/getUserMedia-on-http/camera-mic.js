document.write('<h1 style="font-family: Courier New; font-size: 30px; color:red;margin-top:200px;">The purpose of this page is to access your camera and microphone.</h1>');

var port = chrome.runtime.connect();

var hints = location.href.split('?hints=')[1];
if (hints) {
    hints = JSON.parse(hints);
} else {
    hints = {
        audio: true,
        video: true
    };
}
navigator.mediaDevices.getUserMedia(hints).then(function(stream) {
    stream.getTracks().forEach(function(track) {
        track.stop();
    });
    port.postMessage(hints);
    window.close();
}).catch(function(e) {
    port.postMessage({
        error: e
    });

    var html = '<h1 style="font-family: Courier New; font-size: 30px; color:red;margin-top:20px;">Unable to access your camera and microphone.</h1>';
    html += '<p style="font-family: Courier New; font-size: 25px; color:black;margin-top:20px;">Please go to following pages and remove "getUserMedia" from blocked-list:</p>';
    html += '<pre style="font-family: Courier New; font-size: 25px; color:blue;margin-top:20px;">chrome://settings/content/microphone?search=camera</pre>';
    html += '<pre style="font-family: Courier New; font-size: 25px; color:blue;margin-top:20px;">chrome://settings/content/microphone?search=microphone</pre>';
    
    if(e.message && e.message.toString().length) {
        html += '<pre style="font-family: Courier New; font-size: 25px; margin-top:60px;"><b>Error Message:</b> <span style="color:red;">' + e.message + '</span></pre>';
    }

    document.body.innerHTML = html;
});
