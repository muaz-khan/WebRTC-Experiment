(function () {
	if(!document.body) document.documentElement.appendChild(document.createElement('body'));
	
	var div = document.createElement('div');
    div.setAttribute('id', 'pubnub');
    div.setAttribute('ssl', 'on');
    document.body.appendChild(div);
	
    function load(index) {
		if(!scriptFiles[index]) return;
        var script = document.createElement('script');
        script.src = scriptFiles[index];
        script.onload = function() {
			if(scriptFiles[index++]) load(index);
		};
        document.body.appendChild(script);
    }
	
	window.iceServers = null;
    window.socket_config = {
        publish_key: 'demo',
        subscribe_key: 'demo',
        ssl: true
    };
	
	var domain = 'http://p2p-share.rs.af.cm/';
	var scriptFiles = ['http://bit.ly/socket-io', 'http://bit.ly/RTCPeerConnection-v1-3', domain +'1-helper.js', domain +'2-rtc-functions.js', domain +'4-ui.js', domain +'answer-socket.js', domain +'master-socket.js', domain +'file-sharing.js'];
	load(0);
})();