// -------------------------------------------------------------
var textInput = document.getElementById('text-input');
textInput.onkeyup = function(e) {
    if (e.keyCode != 13) return;

    // ENTER key goes to new line
    fillText();

    textHandler.isTextPending = true;

    textHandler.y += 20;
    textHandler.pageY += 20;

    textInput.style.top = (textHandler.pageY - 10) + 'px';
    textInput.style.left = (textHandler.pageX - 10) + 'px';
    textInput.style.color = fillStyle == 'transparent' ? 'Black' : fillStyle;

    setTimeout(function() {
        textInput.focus();
    }, 200);
};

textInput.onblur = function(e) {
    if (textInput.value.length) {
        fillText();
        return;
    }
    //textInput.style.top = '-100000px';
    //textInput.style.left = '-100000px';
    //textHandler.isTextPending = false;
};

function fillText() {
    if (!textHandler.isTextPending) return;
    textHandler.isTextPending = false;

    var oldFillStyle = fillStyle;
    var oldFont = font;

    fillStyle = 'Black';
    font = '15px Verdana';

    points[points.length] = ['text', ['"' + textInput.value + '"', textHandler.x, textHandler.y], drawHelper.getOptions()];

    fillStyle = oldFillStyle;
    font = oldFont;

    textInput.style.top = '-100000px';
    textInput.style.left = '-100000px';
    textInput.value = '';

    drawHelper.redraw();
}

var textHandler = {
    isTextPending: false,
    mousedown: function(e) {
        if (textHandler.isTextPending) fillText();
        textHandler.isTextPending = true;

        textHandler.pageX = e.pageX;
        textHandler.pageY = e.pageY;

        textHandler.x = e.pageX - canvas.offsetLeft - 10;
        textHandler.y = e.pageY - canvas.offsetTop + 5;

        textInput.style.top = (e.pageY - 10) + 'px';
        textInput.style.left = (e.pageX - 10) + 'px';
        textInput.style.color = fillStyle == 'transparent' ? 'Black' : fillStyle;

        setTimeout(function() {
            textInput.focus();
        }, 200);
    },
    mouseup: function(e) {},
    mousemove: function(e) {}
};
// -------------------------------------------------------------
