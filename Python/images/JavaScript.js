(function () {
    var lastTime = 0, vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'RequestCancelAnimationFrame'];
    }
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function (callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function () {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
}());

/*≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡*/
(function() {
    
    var context = document.getElementById('rocket').getContext('2d'), 
        filedContext = document.getElementById('backward').getContext('2d');

    /*≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡*/
    
    function first() {
        context.lineWidth = 5;
        context.strokeStyle = 'green';

		var canv = context.canvas;
		canv.style.left = filedContext.canvas.offsetLeft + 'px';
        var x = 200, y = 138, x1 = x + 30, y1 = y - 8, x2 = x - 42, y2 = y - 33, x3 = x, y3 = y;

        /*≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡*/
        function drawBird() {
            context.clearRect(0, 0, innerWidth, innerHeight);

            /*≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡  #6c96c8 */
            var points = [["quadratic", [x, y, x + 30, y - 8, x + 42, y - 33]], ["quadratic", [x + 86, y - 49, x + 54, y - 70, x + 42, y - 33]], ["quadratic", [x + 86, y - 49, x + 142, y + 4, x + 192, y]], ["quadratic", [x + 295, y - 12, x + 256, y - 1, x + 192, y]], ["quadratic", [x + 295, y - 12, x + 342, y - 20, x + 378, y - 71]], ["quadratic", [x + 437, y - 28, x + 402, y - 36, x + 378, y - 71]], ["quadratic", [x + 437, y - 28, x + 411, y - 7, x + 375, y + 21]], ["quadratic", [x + 310, y + 109, x + 343, y + 45, x + 375, y + 21]], ["quadratic", [x + 310, y + 109, x + 273, y + 161, x + 174, y + 145]], ["quadratic", [x + 79, y + 73, x + 113, y + 133, x + 174, y + 145]], ["quadratic", [x + 79, y + 73, x + 60, y + 27, x + 48, y + 11]], ["quadratic", [x + 2, y, x + 28, y - 8, x + 48, y + 11]], ["quadratic", [x + 70, y - 32, x + 58, y - 22, x + 66, y - 14]], ["quadratic", [x + 66, y - 14, x + 79, y - 14, x + 70, y - 32]], ["quadratic", [x + 245, y + 146, x + 270, y + 166, x + 283, y + 166]], ["quadratic", [x + 239, y + 148, x + 264, y + 168, x + 281, y + 170]], ["quadratic", [x + 264, y + 143, x + 289, y + 163, x + 306, y + 165]], ["quadratic", [x + 270, y + 141, x + 295, y + 161, x + 310, y + 160]], ["line", [x + 313, y + 156, x + 300, y + 171]], ["line", [x + 286, y + 163, x + 275, y + 175]], ["quadratic", [x + 301, y - 14, x + 295, y + 35, x + 345, y + 51]], ["quadratic", [x + 380, y - 66, x + 355, y - 22, x + 301, y - 8]], ["quadratic", [x + 386, y - 63, x + 361, y - 19, x + 301, y - 2]], ["quadratic", [x + 391, y - 56, x + 366, y - 12, x + 301, y + 4]], ["quadratic", [x + 397, y - 51, x + 372, y - 7, x + 302, y + 13]], ["quadratic", [x + 403, y - 45, x + 378, y - 1, x + 305, y + 19]], ["quadratic", [x + 409, y - 41, x + 384, y + 3, x + 308, y + 25]], ["quadratic", [x + 416, y - 37, x + 391, y + 7, x + 313, y + 32]], ["quadratic", [x + 421, y - 32, x + 396, y + 12, x + 318, y + 37]], ["quadratic", [x + 430, y - 30, x + 375, y + 29, x + 331, y + 46]], ["bezier", [x + 137, y - 13, x1 + 58, y1 + 53, x2 + 89, y2 + 73, x3 + 187, y3 + 146]], ["bezier", [x + 141, y - 10, x1 + 65, y1 + 53, x2 + 96, y2 + 73, x3 + 195, y3 + 148]], ["bezier", [x + 147, y - 8, x1 + 72, y1 + 53, x2 + 103, y2 + 73, x3 + 202, y3 + 148]], ["bezier", [x + 153, y - 5, x1 + 81, y1 + 55, x2 + 112, y2 + 75, x3 + 211, y3 + 150]], ["bezier", [x + 161, y - 4, x1 + 89, y1 + 56, x2 + 120, y2 + 76, x3 + 218, y3 + 149]], ["bezier", [x + 171, y - 1, x1 + 99, y1 + 56, x2 + 130, y2 + 76, x3 + 228, y3 + 149]], ["bezier", [x + 182, y, x1 + 110, y1 + 57, x2 + 141, y2 + 77, x3 + 238, y3 + 148]], ["bezier", [x + 193, y, x1 + 121, y1 + 57, x2 + 152, y2 + 77, x3 + 248, y3 + 145]], ["bezier", [x + 207, y, x1 + 135, y1 + 57, x2 + 166, y2 + 77, x3 + 259, y3 + 143]], ["bezier", [x + 218, y - 1, x1 + 146, y1 + 56, x2 + 177, y2 + 76, x3 + 269, y3 + 142]], ["bezier", [x + 233, y - 2, x1 + 161, y1 + 55, x2 + 192, y2 + 75, x3 + 281, y3 + 136]], ["bezier", [x + 245, y - 2, x1 + 173, y1 + 55, x2 + 204, y2 + 75, x3 + 291, y3 + 131]], ["bezier", [x + 256, y - 4, x1 + 184, y1 + 53, x2 + 215, y2 + 73, x3 + 296, y3 + 124]], ["bezier", [x + 266, y - 6, x1 + 194, y1 + 51, x2 + 225, y2 + 71, x3 + 304, y3 + 117]], ["bezier", [x + 280, y - 8, x1 + 208, y1 + 49, x2 + 239, y2 + 69, x3 + 312, y3 + 105]], ["bezier", [x + 293, y - 11, x1 + 221, y1 + 46, x2 + 252, y2 + 66, x3 + 321, y3 + 90]], ["quadratic", [x + 98, y - 40, x + 89, y + 6, x + 58, y + 25]], ["quadratic", [x + 104, y - 34, x + 95, y + 12, x + 62, y + 33]], ["quadratic", [x + 98, y - 38, x + 99, y - 28, x + 103, y - 32]], ["quadratic", [x + 95, y - 30, x + 96, y - 20, x + 100, y - 24]], ["quadratic", [x + 93, y - 22, x + 94, y - 12, x + 98, y - 16]], ["quadratic", [x + 91, y - 15, x + 92, y - 5, x + 96, y - 9]], ["quadratic", [x + 88, y - 8, x + 89, y + 2, x + 93, y - 2]], ["quadratic", [x + 83, y - 2, x + 84, y + 8, x + 88, y + 4]], ["quadratic", [x + 81, y + 3, x + 82, y + 13, x + 86, y + 9]], ["quadratic", [x + 76, y + 8, x + 77, y + 18, x + 81, y + 14]], ["quadratic", [x + 70, y + 15, x + 71, y + 25, x + 75, y + 21]], ["quadratic", [x + 63, y + 22, x + 64, y + 32, x + 68, y + 28]], ["quadratic", [x + 63, y - 20, x + 74, y - 21, x + 66, y - 27]]], length = points.length, point, p, i = 0;
            
            context.beginPath();
            
            for (i; i < length; i++) {
                p = points[i];
                point = p[1];
                
                if (p[0] === "line") {
                    context.moveTo(point[0], point[1]);
                    context.lineTo(point[2], point[3]);
                }                
                
                if (p[0] === "quadratic") {
                    context.moveTo(point[0], point[1]);
                    context.quadraticCurveTo(point[2], point[3], point[4], point[5]);
                }
                
                if (p[0] === "bezier") {
                    context.moveTo(point[0], point[1]);
                    context.bezierCurveTo(point[2], point[3], point[4], point[5], point[6], point[7]);
                }
                
                                
            }
            
            context.stroke();
            
            
            /*≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡*/
            if (y1 < 150 && !reverse) {
                y1 += 5;
                y2 += 5;
            } 
            else
                reverse = true;
            
            if (reverse) {
                y1 -= 5;
                y2 -= 5;
                if (y1 < 100)
                    reverse = false;
            }
            
            requestAnimationFrame(drawBird);
        }

        /*≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡*/
        
        var reverse = false;
        
        drawBird();
    }     

    /*≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡*/
    
    function second() {
        var iWidth = innerWidth, x = -iWidth, y = 0, x1 = 0, y1 = 0;
        function renderImage() {
            
            filedContext.drawImage(image, x, y, iWidth, 400);
            filedContext.drawImage(image, x1, y1, iWidth, 400);
            
            x += 15;
            x1 += 10;
            
            if (x1 > iWidth - 70)
                x1 = -iWidth;
            if (x > iWidth - 70)
                x = -iWidth;
            
            requestAnimationFrame(renderImage);
        }
        
        /*≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡*/
        
        var image = new Image();        
        image.src = '/images/background.jpg';
        /*≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡*/
        
        context.fillStyle = 'white';
        context.font = '30px Verdana';
        context.fillText('Please wait...', 300, 200);
        
        /*≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡*/
        image.onload = function() {
            first();
            renderImage();            
        };
    }
    
    second();
})();