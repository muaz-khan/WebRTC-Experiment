global.mediaAccessAlertMessage = 'This app wants to use your microphone.';
global.userToken = uniqueToken();

/* getting current user's geo-data */
var script = document.createElement('script');
script.src = 'https://smart-ip.net/geoip-json?callback=getInfo2';
document.body.appendChild(script);
function getInfo2(data) {
    global.country = data.countryName;
    global.city = data.city;
}

document.getElementById('call').onclick = function () {
	if(global.isGotRemoteStream) return;
	
    global.isGetAvailableRoom = false;
    global.roomToken = uniqueToken();
    global.offerer = true;
    captureCamera(function() {
		spreadRoom();
		document.getElementById('call').innerHTML = 'Calling...';
	});
};

function spreadRoom() {
    var g = global;
    socket.send({
        roomToken: g.roomToken,
        ownerToken: g.userToken,
        country: g.country,
        city: g.city
    });
    !global.participant && setTimeout(spreadRoom, 3000);
}

function refreshUI() {
    global.rtc = null;
    global.isGetAvailableRoom = true;
    global.isGotRemoteStream = false;

    document.getElementById('call').innerHTML = 'Make a test Call!';
}
global.isGetAvailableRoom = true;

var callers = document.getElementById('callers');
function getAvailableRooms(response) {
    if (!global.isGetAvailableRoom || !response.ownerToken) return;

    var alreadyExist = document.getElementById(response.ownerToken);
    if (alreadyExist) return;

    /* showing the room for current user */
    var li = document.createElement('li');
    
    li.setAttribute('id', response.ownerToken);
    li.setAttribute('accesskey', response.roomToken);
    
    li.innerHTML = '<a href="#">A person calling you from <span style="color:red">' + response.country + ', ' + response.city + '</span></a>';
    callers.insertBefore(li, callers.childNodes[0]);

    document.getElementById(response.ownerToken).onclick = function () {
		if(global.isGotRemoteStream) return;
		
        this.innerHTML = 'Joining..';
        global.ownerToken = response.ownerToken;

        global.isGetAvailableRoom = false;
        global.roomToken = this.id;

        var forUser = this.id;
        var roomToken = this.getAttribute('accesskey');

        captureCamera(function () {
            socket.send({
                participant: global.userToken,
                userToken: global.userToken,
                forUser: forUser,
                isopus: isopus
            });
            initSocket(roomToken, function() {});
        });
    };
}

function onexit() {
    socket.send({
        end: true,
        userToken: global.userToken
    });
}
window.onbeforeunload = onexit;
window.onunload = onexit;

/* Record voice call or audio stream */
var recordAudioCheckBox = document.getElementById('record-audio');
if (recordAudioCheckBox)
    recordAudioCheckBox.onchange = function () {
        if (this.checked) global.recordAudio = true;
        else global.recordAudio = false;
    };