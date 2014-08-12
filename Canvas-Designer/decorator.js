// -------------------------------------------------------------

function setSelection(element, prop) {
	
	
	endLastPath();
	hideContainers();
	
	is.set(prop);

	var selected = document.getElementsByClassName('selected-shape')[0];
	if (selected) selected.className = selected.className.replace(/selected-shape/g, '');

	element.className += ' selected-shape';
}

// -------------------------------------------------------------

(function () {

	// -------------------------------------------------------------

	function getContext(id) {
		var context = find(id).getContext('2d');
		context.lineWidth = 2;
		context.strokeStyle = '#6c96c8';
		return context;
	}

	// -------------------------------------------------------------

	function bindEvent(context, shape) {
		addEvent(context.canvas, 'click', function () {
		    dragHelper.global.startingIndex = 0;
		    
			setSelection(this, shape);
			
			if(this.id === 'drag-last-path') {
				find('copy-last').checked = true;
				find('copy-all').checked = false;
			}
			else if(this.id === 'drag-all-paths') {
				find('copy-all').checked = true;
				find('copy-last').checked = false;
			}
		});
	}

	// -------------------------------------------------------------

	var toolBox = find('tool-box');
	toolBox.style.height = (innerHeight - toolBox.offsetTop - 77) + 'px';

	// -------------------------------------------------------------

	function decorateDragLastPath() {
		var context = getContext('drag-last-path');

		var x = 10, y = 6, line = "line", points = [[line, x, y, x + 5, y + 27], [line, x, y, x + 18, y + 19], [line, x + 17, y + 19, x + 9, y + 20], [line, x + 9, y + 20, x + 5, y + 27], [line, x + 16, y + 22, x + 16, y + 31], [line, x + 12, y + 27, x + 20, y + 27]], length = points.length, point, i;

		for (i = 0; i < length; i++) {
			point = points[i];

			if (point[0] === "line") {
				context.beginPath();
				context.moveTo(point[1], point[2]);
				context.lineTo(point[3], point[4]);
				context.closePath();
				context.stroke();
			}
		}
		
		context.fillStyle = 'Gray';
		context.font = '9px Verdana';
		context.fillText('Last', 18, 12);

		bindEvent(context, 'DragLastPath');
	}

	decorateDragLastPath();

	// -------------------------------------------------------------

	function decorateDragAllPaths() {
		var context = getContext('drag-all-paths');

		var x = 10, y = 6, line = "line", points = [[line, x, y, x + 5, y + 27], [line, x, y, x + 18, y + 19], [line, x + 17, y + 19, x + 9, y + 20], [line, x + 9, y + 20, x + 5, y + 27], [line, x + 16, y + 22, x + 16, y + 31], [line, x + 12, y + 27, x + 20, y + 27]], length = points.length, point, i;

		for (i = 0; i < length; i++) {
			point = points[i];

			if (point[0] === "line") {
				context.beginPath();
				context.moveTo(point[1], point[2]);
				context.lineTo(point[3], point[4]);
				context.closePath();
				context.stroke();
			}
		}

		context.fillStyle = 'Gray';
		context.font = '10px Verdana';
		context.fillText('All', 20, 12);

		bindEvent(context, 'DragAllPaths');
	}
	decorateDragAllPaths();

	// -------------------------------------------------------------

	function decorateLine() {
		var context = getContext('line');

		context.moveTo(0, 0);
		context.lineTo(40, 40);
		context.stroke();
		
		context.fillStyle = 'Gray';
		context.font = '9px Verdana';
		context.fillText('Line', 16, 12);

		bindEvent(context, 'Line');

		/* Default: setting line as default selected shape!! */
		is.set('Line');
	}
	decorateLine();

	// -------------------------------------------------------------

	function decorateArc() {
		var context = getContext('arc');

		context.arc(20, 20, 16.3, Math.PI * 2, 0, 1);
		context.stroke();
		
		context.fillStyle = 'Gray';
		context.font = '9px Verdana';
		context.fillText('Arc', 10, 24);

		bindEvent(context, 'Arc');
	}
	decorateArc();

	// -------------------------------------------------------------

	function decorateRect() {
		var context = getContext('rectangle');

		context.strokeRect(5, 5, 30, 30);
		
		context.fillStyle = 'Gray';
		context.font = '9px Verdana';
		context.fillText('Rect', 8, 24);

		bindEvent(context, 'Rectangle');
	}
	decorateRect();

	// -------------------------------------------------------------

	function decorateQuadratic() {
		var context = getContext('quadratic-curve');

		context.moveTo(0, 0);
		context.quadraticCurveTo(50, 10, 30, 40);
		context.stroke();
		
		context.fillStyle = 'Gray';
		context.font = '9px Verdana';
		context.fillText('quad..', 2, 24);

		bindEvent(context, 'QuadraticCurve');
	}
	decorateQuadratic();
	
	// -------------------------------------------------------------

	function decorateBezier() {
		var context = getContext('bezier-curve');

		var x = 0, y = 4;

		context.moveTo(x, y);
		context.bezierCurveTo(x + 86, y + 16, x - 45, y + 24, x + 48, y + 34);

		context.stroke();
		
		context.fillStyle = 'Gray';
		context.font = '9px Verdana';
		context.fillText('Bezier', 10, 8);

		bindEvent(context, 'BezierCurve');
	}
	decorateBezier();
	
	// -------------------------------------------------------------

	function tempStrokeTheLine(context, width, mx, my, lx, ly) {
		context.beginPath();
		context.lineWidth = width;
		context.moveTo(mx, my);
		context.lineTo(lx, ly);
		context.stroke();
	}

	function decorateLineWidth() {
		var context = getContext('line-width');

		tempStrokeTheLine(context, 2, 5, 15, 35, 15);
		tempStrokeTheLine(context, 3, 5, 20, 35, 20);
		tempStrokeTheLine(context, 4, 5, 26, 35, 26);
		
		context.fillStyle = 'Gray';
		context.font = '9px Verdana';
		context.fillText('Line', 8, 12);
		context.fillText('Width', 6, 38);

		var lineWidthContainer = find('line-width-container'),
			lineWidthText = find('line-width-text'),
			btnLineWidthDone = find('line-width-done'),
			h1 = document.getElementsByTagName('h1')[0],
			canvas = context.canvas;

		addEvent(canvas, 'click', function () {
			hideContainers();
			
			lineWidthContainer.style.display = 'block';
			lineWidthContainer.style.top = (canvas.offsetTop + h1.clientHeight + 1) + 'px';
			lineWidthContainer.style.left = (canvas.offsetLeft + canvas.clientWidth) + 'px';

			lineWidthText.focus();
		});

		addEvent(btnLineWidthDone, 'click', function () {
			lineWidthContainer.style.display = 'none';
			lineWidth = lineWidthText.value;
		});
	}

	decorateLineWidth();

	// -------------------------------------------------------------
	function decorateColors() {
		var context = getContext('colors');

		context.fillStyle = 'red';
		context.fillRect(5, 3, 30, 10);
		
		context.fillStyle = 'green';
		context.fillRect(5, 15, 30, 10);
		
		context.fillStyle = 'blue';
		context.fillRect(5, 27, 30, 10);

		var colorsContainer = find('colors-container'),
			strokeStyleText = find('stroke-style'),
			fillStyleText = find('fill-style'),
			btnColorsDone = find('colors-done'),
			h1 = document.getElementsByTagName('h1')[0],
			canvas = context.canvas;

		addEvent(canvas, 'click', function () {
			hideContainers();
			
			colorsContainer.style.display = 'block';
			colorsContainer.style.top = (canvas.offsetTop + h1.clientHeight + 1) + 'px';
			colorsContainer.style.left = (canvas.offsetLeft + canvas.clientWidth) + 'px';

			strokeStyleText.focus();
		});

		addEvent(btnColorsDone, 'click', function () {
			colorsContainer.style.display = 'none';
			strokeStyle = strokeStyleText.value;
			fillStyle = fillStyleText.value;
		});
	}

	decorateColors();

	// -------------------------------------------------------------
	function decorateAdditionalOptions() {
		var context = getContext('additional');
		
		context.fillStyle = '#6c96c8';
		context.font = '35px Verdana';
		context.fillText('»', 10, 27);
		
		context.fillStyle = 'Gray';
		context.font = '9px Verdana';
		context.fillText('Extras!', 2, 38);

		var additionalContainer = find('additional-container'),
			btnAdditionalClose = find('additional-close'),
			h1 = document.getElementsByTagName('h1')[0],
			canvas = context.canvas,
			globalAlphaSelect = find('globalAlpha-select'),
			globalCompositeOperationSelect = find('globalCompositeOperation-select'),
			lineCapSelect = find('lineCap-select'),
			lineJoinSelect = find('lineJoin-select');

		addEvent(canvas, 'click', function () {
			hideContainers();
			
			additionalContainer.style.display = 'block';
			additionalContainer.style.top = (canvas.offsetTop + h1.clientHeight + 1) + 'px';
			additionalContainer.style.left = (canvas.offsetLeft + canvas.clientWidth) + 'px';
		});

		addEvent(btnAdditionalClose, 'click', function () {
			additionalContainer.style.display = 'none';

			globalAlpha = globalAlphaSelect.value;
			globalCompositeOperation = globalCompositeOperationSelect.value;
			lineCap = lineCapSelect.value;
			lineJoin = lineJoinSelect.value;
		});
	}

	decorateAdditionalOptions();

	// -------------------------------------------------------------

	var designPreview = find('design-preview'),
		codePreview = find('code-preview');

	// -------------------------------------------------------------
    
    // this function is used in share-drawings.js as well
    // to sync buttons' states
    window.selectBtn = function (btn, isSkipWebRTCMessage) {
        codePreview.className = designPreview.className = '';
		
        if(btn == designPreview) designPreview.className = 'preview-selected';
        else codePreview.className = 'preview-selected';
        
        if(!isSkipWebRTCMessage && window.connection && connection.stats.numberOfConnectedUsers >= 1) {
            connection.send({
                btnSelected: btn.id
            });
        }
        else {
            // to sync buttons' UI-states
            if(btn == designPreview) btnDesignerPreviewClicked();
            else btnCodePreviewClicked();
        }
    };
    
    // -------------------------------------------------------------

	addEvent(designPreview, 'click', function () {
		selectBtn(designPreview);
        btnDesignerPreviewClicked();
	});
    
    function btnDesignerPreviewClicked() {
		codeText.parentNode.style.display = 'none';
		optionsContainer.style.display = 'none';
		
		hideContainers();
		endLastPath();
    }

	// -------------------------------------------------------------

	addEvent(codePreview, 'click', function () {
		selectBtn(codePreview);
        btnCodePreviewClicked();
	});
    
    function btnCodePreviewClicked() {
        codeText.parentNode.style.display = 'block';
		optionsContainer.style.display = 'block';

		codeText.focus();
		common.updateTextArea();

		setHeightForCodeAndOptionsContainer();
		
		hideContainers();
		endLastPath();
    }

	// -------------------------------------------------------------

	var codeText = find('code-text'),
		optionsContainer = find('options-container');

	// -------------------------------------------------------------

	function setHeightForCodeAndOptionsContainer() {
		codeText.style.width = (innerWidth - optionsContainer.clientWidth - 30) + 'px';
		codeText.style.height = (innerHeight - codeText.offsetTop - 180) + 'px';

		codeText.style.marginLeft = (optionsContainer.clientWidth) + 'px';
		optionsContainer.style.height = (innerHeight - codeText.offsetTop - 150) + 'px';
	}

	// -------------------------------------------------------------

	var isAbsolute = find('is-absolute-points'),
		isShorten = find('is-shorten-code');

	addEvent(isShorten, 'change', common.updateTextArea);
	addEvent(isAbsolute, 'change', common.updateTextArea);

	// -------------------------------------------------------------

})();

// -------------------------------------------------------------
	
function hideContainers() {
	var additionalContainer = find('additional-container'),
		colorsContainer = find('colors-container'),
		lineWidthContainer = find('line-width-container');

	additionalContainer.style.display = colorsContainer.style.display = lineWidthContainer.style.display = 'none';
}

// -------------------------------------------------------------