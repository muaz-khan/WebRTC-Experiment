var textHandler = {
    text: '',
    writeText: function(keyPressed, isBackKeyPressed) {
        if (isBackKeyPressed) {
            textHandler.text = textHandler.text.substr(0, textHandler.text.length - 1);
            textHandler.fillText(textHandler.text);
            return;
        }

        textHandler.text += keyPressed;
        textHandler.fillText(textHandler.text);
    },
    fillText: function(text) {
        tempContext.clearRect(0, 0, tempContext.canvas.width, tempContext.canvas.height);

        tempContext.fillStyle = 'black';
        tempContext.font = font;
        tempContext.fillText(text, textHandler.x, textHandler.y);
    },
    blinkCursorInterval: null,
    index: 0,
    blinkCursor: function() {
        textHandler.index++;
        if (textHandler.index % 2 == 0) {
            textHandler.fillText(textHandler.text + '|');
        } else {
            textHandler.fillText(textHandler.text);
        }
    },
    mousedown: function(e) {
        if (textHandler.text.length) {
            points[points.length] = ['text', ['"' + textHandler.text + '"', textHandler.x, textHandler.y], drawHelper.getOptions()];
        }

        textHandler.x = textHandler.y = 0;
        textHandler.text = '';

        textHandler.pageX = e.pageX;
        textHandler.pageY = e.pageY;

        textHandler.x = e.pageX - canvas.offsetLeft - 5;
        textHandler.y = e.pageY - canvas.offsetTop + 10;

        if (typeof textHandler.blinkCursorInterval !== 'undefined') {
            clearInterval(textHandler.blinkCursorInterval);
        }

        textHandler.blinkCursor();
        textHandler.blinkCursorInterval = setInterval(textHandler.blinkCursor, 700);
    },
    mouseup: function(e) {},
    mousemove: function(e) {}
};
