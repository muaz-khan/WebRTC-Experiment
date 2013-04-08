chrome.browserAction.onClicked.addListener(toggle);
function toggle()
{
	if(localStorage['broadcasting'] == undefined)
	{
		localStorage.setItem('broadcasting', true);
		isStopBroadcasting = false;
		captureScreen();
		
		chrome.contextMenus.update('000007', {
			title: 'Stop Broadcasting Screen'
		});
		console.log('broadcasting started right now!');
	}
	else
	{
		localStorage.removeItem('broadcasting');
		isStopBroadcasting = true;
		
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
	chrome.tabs.getSelected(null, function(tab) {
        var video_constraints = {
            mandatory: {
                chromeMediaSource: 'tab'
            }
        };
        var constraints = {
            audio: false,
            video: true,
            videoConstraints: video_constraints
        };
        chrome.tabCapture.capture(constraints, function(stream) {
            broadcastScreen(stream);			
			webkitNotifications.createHTMLNotification('extras/started.html').show();
        });
    });
    chrome.browserAction.setIcon({ path: 'images/pause22.png' });
}

chrome.contextMenus.create({
		title: 'Broadcast Screen',
		id: '000007'
	});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
	toggle();
});