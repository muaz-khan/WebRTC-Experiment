chrome.browserAction.onClicked.addListener(function(tab) {
	/*	
	var privateToken = prompt('Enter private token if you want to broadcast screen privately. Otherwise share publicly.', 'Public');
	if(privateToken != 'Public') global.defaultChannel = privateToken;
	*/
	toggle();
});

global.isStopBroadcasting = false;
function toggle()
{
	if(localStorage['broadcasting'] == undefined)
	{
		localStorage.setItem('broadcasting', true);
		global.isStopBroadcasting = false;
		captureScreen();
		
		chrome.contextMenus.update('000007', {
			title: 'Stop Broadcasting Screen'
		});
		console.log('broadcasting started right now!');
	}
	else
	{
		global.clientStream && global.clientStream.stop();
		localStorage.removeItem('broadcasting');
		global.isStopBroadcasting = true;
		
		chrome.browserAction.setIcon({ path: 'images/tabCapture22.png' });
		
		webkitNotifications.createHTMLNotification('extras/stopped.html').show();
		chrome.contextMenus.update('000007', {
			title: 'Broadcast Screen'
		});
		
		console.log('broadcasting stopped right now!');
		return;
	}
}

function captureScreen()
{	
	chrome.tabs.getSelected(null, function (tab) {
		chrome.tabCapture.capture({ audio: true, video: true }, function(stream) {
			broadcastNow(stream);
			
			webkitNotifications.createHTMLNotification('extras/started.html').show();
		});
	});
	chrome.browserAction.setIcon({ path: 'images/pause22.png' });
}

/* context menu item */
try{
	chrome.contextMenus.create({
		title: 'Broadcast Screen',
		id: '000007'
	});
}catch(e) {console.log('On creating new tab: error: contextMenus.create!!');}

chrome.contextMenus.onClicked.addListener(function(info, tab) {
	toggle();
});