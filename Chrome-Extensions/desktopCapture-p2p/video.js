// var src = location.href.split('?src=')[1];
// document.querySelector('video').src = src;

navigator.mediaDevices.getUserMedia({video: true}).then(function(stream) {
    document.querySelector('video').srcObject = stream;
}).catch(function() {
    alert('Unable to capture your camera.');
});
