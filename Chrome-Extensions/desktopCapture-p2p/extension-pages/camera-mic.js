document.write('<h1 style="font-family: Courier New; font-size: 30px; color:green;margin-top:200px;">The purpose of this page is to access your camera and microphone.</h1>');
document.write('<h1 style="font-family: Courier New; font-size: 25px; color:red;margin-top:20px;">You can REMOVE i.e. DELETE camera permissions anytime on these two pages:</h1>');
document.write('<pre style="font-family: Courier New; font-size: 25px; color:blue;margin-top:20px;">chrome://settings/content/camera?search=camera</pr>');
document.write('<pre style="font-family: Courier New; font-size: 25px; color:blue;margin-top:20px;">chrome://settings/content/microphone?search=microphone</pr>');

var constraints = {
    audio: true,
    video: true
};

navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    document.write('<h1 style="font-family: Courier New; font-size: 35px; color: green;"></h1><video muted volume=0 autoplay controls></video>');
    document.querySelector('h1').innerHTML = 'Now you can close this page and click extension icon again.'

    document.querySelector('video').srcObject = stream;
}).catch(function(error) {
    document.querySelector('h1').innerHTML = 'Unable to capture your camera and microphone.<br>' + error;
});
