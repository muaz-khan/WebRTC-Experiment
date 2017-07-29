document.write('<h1 style="font-family: Courier New; font-size: 30px; color:red;margin-top:200px;">The purpose of this page is to access your camera and microphone.</h1>');
document.write('<p style="font-family: Courier New; font-size: 20px; padding:5px 10px; margin-top: 10px; background: yellow; border: 1px dotted red;">RecordRTC chrome extension will use your camera only when you manually click the startRecording buttons.<br><img src="https://lh3.googleusercontent.com/efS6_LNfsKB3vPSkOqJP01r0sn1c66ivvq8-qv34Pzz29E460iY5GnQztBtri2O4ehIhTUTePG0=s1280-h800-e365-rw"></p>');

var constraints = {
    audio: true,
    video: true
};

navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    document.write('<h1 style="font-family: Courier New; font-size: 35px; color: green;"></h1><video autoplay controls src="' + URL.createObjectURL(stream) + '"></video>');
    document.querySelector('h1').innerHTML = 'Now you can close this page and click extension icon again.'
}).catch(function() {
    document.querySelector('h1').innerHTML = 'Unable to capture your camera and microphone.';
});
