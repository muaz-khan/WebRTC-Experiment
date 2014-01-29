<title>Simple Text-Chat using Socket.io over Node.js ® Muaz Khan</title>

<h1 style="text-align: center;display: block;border-bottom: 1px solid #CCCCCC;margin-bottom: 0em;padding: .6em 0;font-size: 2em;">Simple Text-Chat using <a href="https://github.com/muaz-khan/WebRTC-Experiment/tree/master/socketio-over-nodejs" target="_blank">Socket.io over Node.js</a></h1>

<style>
    * {
        -webkit-user-select: none;
        font-family: Calibri;
        font-family:'Segoe UI Light', 'Segoe UI';
        font-size: 1.1em;
        font-weight: normal;
    }
    html {
        background: #eee;
    }
    body {
        font-size: 1.2em;
        line-height: 1.2em;
        margin: 0;
    }
    input[type=text] {
        -webkit-user-select: initial;
        background: none repeat scroll 0 0 #F9F9F9;
        border: 1px solid #CCCCCC;
        border-radius: 0 0 5px 5px;
        border-top: 0;
        font: 300 18px/40px'light', inherit;
        height: 40px;
        letter-spacing: 1px;
        margin-bottom: 4px;
        padding: 5px 10px;
        width: 100%;
    }
    #output {
        background: none repeat scroll 0 0 #F9F9F9;
        border: 1px solid #CCCCCC;
        border-radius: 5px 5px 0 0;
        font: 300 18px/40px'light', 'Helvetica Neue', Arial, Helvetica, sans-serif;
        height: 400px;
        letter-spacing: 1px;
        margin-bottom: 0;
        overflow: scroll;
        padding: 5px 10px;
    }
    #output div {
        border-bottom: 1px solid #CCCCCC;
    }
    section.name {
        float: left;
        overflow: hidden;
        padding-left: 2em;
        padding-right: 1em;
        text-align: right;
        width: 7em;
    }
    section.message {
        border-left: 1px solid #CCCCCC;
        margin-left: 10em;
        overflow: hidden;
        padding-left: 1em;
    }
</style>
<script src="socketio.js"></script>
<input type="text" disabled>
<div id="output"></div>
<script>
    var SIGNALING_SERVER = '/';
    var channel = 'channel-name';
    var sender = Math.round(Math.random() * 999999999) + 9995000;

    io.connect(SIGNALING_SERVER).emit('new-channel', {
        channel: channel,
        sender: sender
    });

    var socket = io.connect(SIGNALING_SERVER + channel);
    socket.on('connect', function () {
        if (!window.username) window.username = prompt('Please enter your full name') || 'Anonymous';

        socket.send('is ready to share text messages with you.');
        input.disabled = false;
    });

    socket.send = function (message) {
        socket.emit('message', {
            sender: sender,
            data: {
                sender: window.username,
                message: message
            }
        });
    };

    socket.on('message', function (message) {
        appendDIV(message);
    });
</script>
<script>
    input = document.querySelector('input[type=text]');
    input.onkeypress = function (e) {
        if (e.keyCode !== 13 || !this.value.length) return;
        socket.send(this.value);

        /* self preview! */
        appendDIV({
            sender: window.username,
            message: this.value
        });

        this.value = '';
    };

    output = document.querySelector('#output');
    function appendDIV(data) {
        div = document.createElement('div');
        div.innerHTML = '<section class="name">' + data.sender + '</section><section class="message">' + data.message + '</section>';
        output.insertBefore(div, output.firstChild);

        div.tabIndex = 0;
        div.focus();

        input.focus();
    }
</script>
<footer style="font-size: .8em; text-align: center;"> <a href="https://www.webrtc-experiment.com/" target="_blank">WebRTC Experiments!</a> © <a href="https://plus.google.com/100325991024054712503" rel="author" target="_blank">Muaz Khan</a>, <span>2013 </span>» <a href="mailto:muazkh@gmail.com" target="_blank">Email</a> »
    <a
    href="http://twitter.com/muazkh" target="_blank">@muazkh</a>» <a href="https://github.com/muaz-khan" target="_blank">Github</a> »	<a href="/">Video Conferencing : HOME</a>

</footer>