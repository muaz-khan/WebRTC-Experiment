var textHandler = {
    text: '',
    selectedFontFamily: 'Arial',
    selectedFontSize: '15',
    onShapeSelected: function() {
        tempContext.canvas.style.cursor = 'text';
        this.x = this.y = this.pageX = this.pageY = 0;
        this.text = '';
    },
    onShapeUnSelected: function() {
        this.text = '';
        this.showOrHideTextTools('hide');
        tempContext.canvas.style.cursor = 'default';

        if (typeof this.blinkCursorInterval !== 'undefined') {
            clearInterval(this.blinkCursorInterval);
        }
    },
    getFillColor: function(color) {
        color = (color || fillStyle).toLowerCase();

        if (color == 'rgba(255, 255, 255, 0)' || color == 'transparent' || color === 'white') {
            return 'black';
        }

        return color;
    },
    writeText: function(keyPressed, isBackKeyPressed) {
        if (!is.isText) return;

        if (isBackKeyPressed) {
            textHandler.text = textHandler.text.substr(0, textHandler.text.length - 1);
            textHandler.fillText(textHandler.text);
            return;
        }

        textHandler.text += keyPressed;
        textHandler.fillText(textHandler.text);
    },
    fillText: function(text) {
        if (!is.isText) return;

        tempContext.clearRect(0, 0, tempContext.canvas.width, tempContext.canvas.height);

        var options = textHandler.getOptions();
        drawHelper.handleOptions(tempContext, options);
        tempContext.fillStyle = textHandler.getFillColor(options[2]);
        tempContext.font = textHandler.selectedFontSize + 'px "' + textHandler.selectedFontFamily + '"';

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
    getOptions: function() {
        var options = {
            font: textHandler.selectedFontSize + 'px "' + textHandler.selectedFontFamily + '"',
            fillStyle: textHandler.getFillColor(),
            strokeStyle: '#6c96c8',
            globalCompositeOperation: 'source-over',
            globalAlpha: 1,
            lineJoin: 'round',
            lineCap: 'round',
            lineWidth: 2
        };
        font = options.font;
        return options;
    },
    appendPoints: function() {
        var options = textHandler.getOptions();
        points[points.length] = ['text', ['"' + textHandler.text + '"', textHandler.x, textHandler.y], drawHelper.getOptions(options)];
    },
    mousedown: function(e) {
        if (!is.isText) return;

        if (textHandler.text.length) {
            this.appendPoints();
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

        this.showTextTools();
    },
    mouseup: function(e) {},
    mousemove: function(e) {},
    showOrHideTextTools: function(show) {
        this.fontFamilyBox.style.display = show == 'show' ? 'block' : 'none';
        this.fontSizeBox.style.display = show == 'show' ? 'block' : 'none';

        this.fontSizeBox.style.left = this.x + 'px';
        this.fontFamilyBox.style.left = (this.fontSizeBox.clientWidth + this.x) + 'px';

        this.fontSizeBox.style.top = this.y + 'px';
        this.fontFamilyBox.style.top = this.y + 'px';
    },
    showTextTools: function() {
        if (!this.fontFamilyBox || !this.fontSizeBox) return;

        this.unselectAllFontFamilies();
        this.unselectAllFontSizes();

        this.showOrHideTextTools('show');

        this.eachFontFamily(function(child) {
            child.onclick = function(e) {
                e.preventDefault();

                textHandler.showOrHideTextTools('hide');

                textHandler.selectedFontFamily = this.innerHTML;
                this.className = 'font-family-selected';
            };
            child.style.fontFamily = child.innerHTML;
        });

        this.eachFontSize(function(child) {
            child.onclick = function(e) {
                e.preventDefault();

                textHandler.showOrHideTextTools('hide');

                textHandler.selectedFontSize = this.innerHTML;
                this.className = 'font-family-selected';
            };
            // child.style.fontSize = child.innerHTML + 'px';
        });
    },
    eachFontFamily: function(callback) {
        var childs = this.fontFamilyBox.querySelectorAll('li');
        for (var i = 0; i < childs.length; i++) {
            callback(childs[i]);
        }
    },
    unselectAllFontFamilies: function() {
        this.eachFontFamily(function(child) {
            child.className = '';
            if (child.innerHTML === textHandler.selectedFontFamily) {
                child.className = 'font-family-selected';
            }
        });
    },
    eachFontSize: function(callback) {
        var childs = this.fontSizeBox.querySelectorAll('li');
        for (var i = 0; i < childs.length; i++) {
            callback(childs[i]);
        }
    },
    unselectAllFontSizes: function() {
        this.eachFontSize(function(child) {
            child.className = '';
            if (child.innerHTML === textHandler.selectedFontSize) {
                child.className = 'font-size-selected';
            }
        });
    },
    onReturnKeyPressed: function() {
        if (!textHandler.text || !textHandler.text.length) return;
        var fontSize = parseInt(textHandler.selectedFontSize) || 15;
        this.mousedown({
            pageX: this.pageX,
            // pageY: parseInt(tempContext.measureText(textHandler.text).height * 2) + 10
            pageY: this.pageY + fontSize + 5
        });
        drawHelper.redraw();
    },
    fontFamilyBox: document.querySelector('.fontSelectUl'),
    fontSizeBox: document.querySelector('.fontSizeUl')
};
