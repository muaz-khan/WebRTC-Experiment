/* on datachannel message */
function onMessage(message) {
	if(!message.data)return;
	onMessageCallback(message.data);
}

global.channels = [];

function postMessage(obj)
{
	if (!global.channels.length) return;
    
	for(var i = 0; i< global.channels.length;i++)
	{
		global.channels[i].send(obj);
	}
}

function captureCamera(callback) {
    callback && callback();
    return;
}

function hideListsAndBoxes() {
    disable(true);
    global.isGetAvailableRoom = false;
}

hideListsAndBoxes();

function showListsAndBoxes() {
    disable(false);
    global.isGetAvailableRoom = true;
}

/* the user have not yet allowed his camera access */
global.mediaAccessAlertMessage = 'This app wants to use your camera and microphone.\n\nGrant it the access!';

/* generating a unique token for current user */
global.userToken = uniqueToken();

/* you tried to create a new room! */
var createRoom = $('#create-room');

if(createRoom) createRoom.onclick = createRoomNow;
else createRoomNow();

function createRoomNow()
{
	if(createRoom) createRoom.style.display = 'none';
	disable(true);
	
    global.roomName = uniqueToken();
    global.isGetAvailableRoom = false;
    global.roomToken = uniqueToken();
    global.offerer = true;

    spreadRoom();

    /* these 3 lines are extras! */
    socket.answer && (socket.answer = null);
}

function spreadRoom() {
    var g = global;

    socket.master && socket.master.send({
        roomToken: g.roomToken,
        ownerToken: g.userToken,
        roomName: g.roomName
    });

    /* propagate room around the globe! */
    setTimeout(spreadRoom, 3000);
}
/* if other end close the room; refreshing the UI for current user */

function refreshUI() {
    disable(false);
    global.rtc = null;

    global.isGetAvailableRoom = true;
    global.isGotRemoteStream = false;
}

/* searching public (or private) rooms */
global.isGetAvailableRoom = true;

function getAvailableRooms(response) {
    if (!global.isGetAvailableRoom || !response.ownerToken) return;
	
	if(createRoom) createRoom.style.display = 'none';
    global.isGetAvailableRoom = false;
    hideListsAndBoxes();
	global.roomToken = response.roomToken;

	captureCamera(function () {
		/* telling room owner that I'm your participant! */
		socket.answer && socket.answer.send({
			participant: global.userToken,
			userToken: global.userToken,
			forUser: response.ownerToken
		});

		socket.master && (socket.master = null);
		socket.answer && (socket.answer = null);

		answerSocket(global.userToken);
	});
}