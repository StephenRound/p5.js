
// pend tempz
var c, ctx;

var CORNER = "corner", CORNERS = "corners", RADIUS = "radius";
var RIGHT = "right", LEFT = "left", CENTER = "center";
var POINTS = "points", LINES = "lines", TRIANGLES = "triangles", TRIANGLE_FAN = "triangles_fan",
TRIANGLE_STRIP = "triangles_strip", QUADS = "quads", QUAD_STRIP = "quad_strip";
var CLOSE = "close";
var OPEN = "open", CHORD = "chord", PIE = "pie";
var SQUARE = "butt", ROUND = "round", PROJECT = "square"; // PEND: careful this is counterintuitive
var BEVEL = "bevel", MITER = "miter";


var pShapeKind = null, pShapeInited = false;;
var pBackground = false;
var pFill = false;
var pLoop = true;
var pStartTime;
var pUpdateInterval;
var pRectMode = CORNER, pImageMode = CORNER;
var pEllipseMode = CENTER;
var pMatrices = [[1,0,0,1,0,0]];
var pTextSize = 12;



////	STRUCTURE
var draw;
function noLoop() {	
	if (pLoop) {
		pLoop = false; 
	}
}

function loop() { 
	if (!pLoop) {
		pLoop = true;
	}
}
function redraw() {
	pDraw();
}
var setup;



//// ENVIRONMENT
//cursor()
//displayHeight
//displayWidth
//focused
var frameCount = 0;
var frameRate = 30;
function getFrameRate() { return frameRate; }
var height = 100;
function setFrameRate(fps) { 
	frameRate = fps; 
	clearInterval(pUpdateInterval);
	pUpdateInterval = setInterval(pUpdate, 1000/frameRate);
}
//noCursor()
function size(w, h) {
	width = w;
	height = h;
	c.setAttribute('width', width);
	c.setAttribute('height', height);
	pApplyDefaults();
}
var width = 100;



//// DATA

// String Functions
function join(list, separator) { return list.join(separator); }
function match(str, reg) { return str.match(reg); }
//function matchAll(str, reg) {}
function nf(num, digits) { 
	var str = "";
	for (var i=0; i<min(digits-num.toString().length, 0); i++) {
		str += "0";
	}
	return str+num;
}
/*
function nfc() {}
function nfp() {}
function nfs()*/
function split(str, delim) { return str.split(delim); }
//function splitTokens(str, delim) {}
function trim(str) {
	if (str instanceof Array) {
		var strps = [];
		for (var i=0; i<str.length; i++) {
			stps.push(str[i].trim());
		}
		return strps;
	} else return str.trim();
}

// Array Functions
function append(array, value) { return array.push(value); }
function arrayCopy(src, a, b, c, d) { //src, srcPosition, dst, dstPosition, length
	if (d) { 
		for (var i=a; i<min(a+d, src.length); i++) {
			b[dstPosition+i] = src[i];
		}
	} 
	else if (b) { //src, dst, length
		a = src.slice(0, min(b, src.length)); 
	}
	else { //src, dst
		a = src.slice(0);	
	}
}
function concat(list0, list1) { return list0.concat(list1); }
function reverse(list) { return list.reverse(); }
function shorten(list) { 
	list.pop();
	return list;
}
//function sort(list, count) {}
function splice(list, value, index) { return list.splice(index,0,value); }
function subset(list, start, count) {
	if (count) return list.slice(start, start+count);
	else return list.slice(start, list.length-1);
}




//// SHAPE

// 2D Primitives
function arc(a, b, c, d, start, stop, mode) {

}
function ellipse(a, b, c, d) {

	var vals = pModeAdjust(a, b, c, d, pEllipseMode);

	var kappa = .5522848,
    ox = (vals.w / 2) * kappa, // control point offset horizontal
    oy = (vals.h / 2) * kappa, // control point offset vertical
    xe = vals.x + vals.w,      // x-end
    ye = vals.y + vals.h,      // y-end
    xm = vals.x + vals.w / 2,  // x-middle
    ym = vals.y + vals.h / 2;  // y-middle

  ctx.beginPath();
  ctx.moveTo(vals.x, ym);
  ctx.bezierCurveTo(vals.x, ym - oy, xm - ox, vals.y, xm, vals.y);
  ctx.bezierCurveTo(xm + ox, vals.y, xe, ym - oy, xe, ym);
  ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
  ctx.bezierCurveTo(xm - ox, ye, vals.x, ym + oy, vals.x, ym);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}
function line(x1, y1, x2, y2) {
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.stroke();
}
// point
function quad(x1, y1, x2, y2, x3, y3, x4, y4) {
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.lineTo(x3, y3);
	ctx.lineTo(x4, y4);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
}

function rect(a, b, c, d) {
	var vals = pModeAdjust(a, b, c, d, pRectMode);
	ctx.beginPath();
	ctx.rect(vals.x, vals.y, vals.w, vals.h);
	ctx.fill();
	ctx.stroke();
}

function triangle(x1, y1, x2, y2, x3, y3) {
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.lineTo(x3, y3);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();
}

// Curves
function bezier(x1, y1, x2, y2, x3, y3, x4, y4) {
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.bezierCurveTo(x2, y2, x3, y3, x4, y4);
	ctx.stroke();
}
//bezierDetail()
/*bezierPoint()
bezierTangent()
curve()
curveDetail()
curvePoint()
curveTangent()
curveTightness()
*/


// Attributes
function ellipseMode(m) {
	if (m == CORNER || m == CORNERS || m == RADIUS || m == CENTER) {
		pEllipseMode = m;
	}
}
function noSmooth() {
	ctx.mozImageSmoothingEnabled = false;
	ctx.webkitImageSmoothingEnabled = false;
}
function rectMode(m) {
	if (m == CORNER || m == CORNERS || m == RADIUS || m == CENTER) {
		pRectMode = m;
	}
}
function smooth() {
	ctx.mozImageSmoothingEnabled = true;
	ctx.webkitImageSmoothingEnabled = true;
}
function strokeCap(cap) {
	if (cap == ROUND || cap == SQUARE || cap == PROJECT) {
		ctx.lineCap=cap;
	}
}
function strokeJoin(join) {
	if (join == ROUND || join == BEVEL || join == MITER) {
		ctx.lineJoin = join;
	}
}
function strokeWeight(w) {
	ctx.lineWidth = w;
	if (!w) noStroke();
}


//Vertex
//beginContour()
function beginShape(kind) {
	if (kind == POINTS || kind == LINES || kind == TRIANGLES || kind == TRIANGLE_FAN 
		|| kind == TRIANGLE_STRIP || kind == QUADS || kind == QUAD_STRIP)
		pShapeKind = kind;
	else pShapeKind = null; 
	pShapeInited = true;
	ctx.beginPath();
}
function bezierVertex(x1, y1, x2, y2, x3, y3) { ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3); }
/*curveVertex()
endContour()*/
function endShape(mode) {
	if (mode == CLOSE) {
		ctx.closePath();
		ctx.fill();
	} 
	ctx.stroke();
}
function quadraticVertex(cx, cy, x3, y3) { ctx.quadraticCurveTo(cx, cy, x3, y3); }
function vertex(x, y) {
	if (pShapeInited) {
		ctx.moveTo(x, y);
	} else {
		ctx.lineTo(x, y); // pend this is where check for kind and do other stuff
	}
	pShapeInited = false;
}


//// INPUT

// Files

//BufferedReader
//createInput()
//createReader()
//loadBytes()
function loadJSON(file) {
	var req = new XMLHttpRequest();  
	req.overrideMimeType("application/json");  
	req.open('GET', "data/"+file);  
  req.onreadystatechange = function () {
    if(req.readyState === 4) {
      if(req.status === 200 || req.status == 0) {
        return JSON.parse(req.responseText);
      }
    }
  }
	req.send(null);
}

function loadStrings(file) {
  var req = new XMLHttpRequest();
  req.open("GET", "data/"+file, true);
  req.onreadystatechange = function () {
    if(req.readyState === 4) {
      if(req.status === 200 || req.status == 0) {
        return req.responseText.match(/[^\r\n]+/g);
      }
    }
  }
	req.send(null);
}
//loadTable()
/*function loadXML() {
	var req = new XMLHttpRequest();  
	req.overrideMimeType("application/json");  
	req.overrideMimeType('text/xml');
	req.open('GET', "data/"+file, false);  
  req.onreadystatechange = function () {
    if(req.readyState === 4) {
      if(req.status === 200 || req.status == 0) {
      	console.log(JSON.parse(req.responseXML));
        return JSON.parse(req.responseXML);
      }
    }
  }
	req.send(null);
}*/
//open()
//parseXML()
//saveTable()
//selectFolder()
//selectInput()*/

// Mouse
var mousePressed;
var pMouseX = 0, pMouseY = 0, mouseX = 0, mouseY = 0;

function pUpdateMouseCoords(e) {
	pMouseX = mouseX;
	pMouseY = mouseY;
	mouseX = e.clientX - c.offsetLeft;
	mouseY = e.clientY - c.offsetTop;
	//console.log('mx = '+mouseX+' my = '+mouseY);
}

// Keyboard
var key = "";
var keyCode = 0; 
var pKeyPressed = false;
function isKeyPressed() { return pKeyPressed; }

function pSetupInput() {
	c.onmousemove=function(e){
    pUpdateMouseCoords(e);
    if (typeof(mouseMoved) == "function")
    	mouseMoved(e);
	}

	c.onmousedown=function(e){
		if (typeof(mousePressed) == "function")
	    mousePressed(e);
	}

	c.onmouseup=function(e){
		if (typeof(mouseReleased) == "function")
			mouseReleased(e);
	}

	c.onmouseclick=function(e){
		if (typeof(mouseClicked) == "function")
			mouseClicked(e);
	}

	document.body.onkeydown=function(e){
		pKeyPressed = true;
		if (typeof(keyPressed) == "function")
	  	keyPressed(e);
	}

	document.body.onkeyup=function(e){
		pKeyPressed = false;
		if (typeof(keyReleased) == "function")
	  	keyReleased(e);
	}

	document.body.onkeypress=function(e){
		keyCode = e.keyCode;
		if (typeof(keyTyped) == "function")
	  	keyTyped(e);
	}
}



// Time & Date
function day() { return new Date().getDate(); }
function hour() { return new Date().getHours(); }
function millis() { return new Date().getTime() - pStartTime; }
function month() { return new Date().getMonth(); }
function second() { return new Date().getSeconds(); }
function year() { return new Date().getFullYear(); }




//// OUTPUT

// Text Area
function println(s) { console.log(s); }

// Image
function save() {
	window.open(c.toDataURL());
}

//// TRANSFORM
function applyMatrix(n00, n01, n02, n10, n11, n12) {
	ctx.transform(n00, n01, n02, n10, n11, n12);
	var m = pMatrices[pMatrices.length-1];
	m = pMultiplyMatrix(m, [n00, n01, n02, n10, n11, n12]);
}
function popMatrix() { 
	ctx.restore(); 
	pMatrices.pop();
}
function printMatrix() {
	console.log(pMatrices[pMatrices.length-1]);
}
function pushMatrix() { 
	ctx.save(); 
	pMatrices.push([1,0,0,1,0,0]);
}
function resetMatrix() { 
	ctx.setTransform();
	pMatrices[pMatrices.length-1] = [1,0,0,1,0,0]; 
}
function rotate(r) { 
	ctx.rotate(r); 
	var m = pMatrices[pMatrices.length-1];
	var c = Math.cos(r);
  var s = Math.sin(r);
  var m11 = m[0] * c + m[2] * s;
  var m12 = m[1] * c + m[3] * s;
  var m21 = m[0] * -s + m[2] * c;
  var m22 = m[1] * -s + m[3] * c;
  m[0] = m11;
  m[1] = m12;
  m[2] = m21;
  m[3] = m22;
}
function scale(x, y) { 
	ctx.scale(x, y); 
	var m = pMatrices[pMatrices.length-1];
  m[0] *= x;
  m[1] *= x;
  m[2] *= y;
  m[3] *= y;
}
function shearX(angle) {
	ctx.transform(1, 0, tan(angle), 1, 0, 0);
	var m = pMatrices[pMatrices.length-1];
	m = pMultiplyMatrix(m, [1, 0, tan(angle), 1, 0, 0]);
}
function shearY(angle) {
	ctx.transform(1, tan(angle), 0, 1, 0, 0);
	var m = pMatrices[pMatrices.length-1];
	m = pMultiplyMatrix(m, [1, tan(angle), 0, 1, 0, 0]);
}
function translate(x, y) { 
	ctx.translate(x, y); 
	var m = pMatrices[pMatrices.length-1];
  m[4] += m[0] * x + m[2] * y;
  m[5] += m[1] * x + m[3] * y;
}

//// COLOR

// Setting
function background(r, g, b) { pBackground = rgbToHex(r,g,b); }
function fill(r, g, b, a) { 
	if (a) ctx.fillStyle = "rgba("+r+","+g+","+b+","+(a/255.0)+")";
	else ctx.fillStyle = "rgb("+r+","+g+","+b+")";
}
function noFill() {	ctx.fillStyle = "none"; }
function noStroke() {	ctx.strokeStyle = "none"; }
function stroke(r, g, b, a) { 
	//if (a) ctx.strokeStyle = "rgba("+r+","+g+","+b+","+(a/255.0)+")";
	//else ctx.strokeStyle = rgbToHex(r,g,b); 
	ctx.strokeStyle = rgbToHex(r,g,b); 
}


//// Image

// Loading & Displaying
function image(img, a, b, c, d) { 
	if (c && d) {
		var vals = pModeAdjust(a, b, c, d, pImageMode);
		ctx.drawImage(img, vals.x, vals.y, vals.w, vals.h);
	} else {
		ctx.drawImage(img, a, b);
	}
}

function imageMode(m) {
	if (m == CORNER || m == CORNERS || m == CENTER) pImageMode = m;
}

function loadImage(path) { 
	var imgObj = new Image();
	imgObj.onload = function() {
		// loaded
	}
	imgObj.src = path;
	return imgObj;
}

// Pixels
//blend()
//copy()
//filter()
function get(x, y, w, h) {
	var pix = ctx.getImageData(0, 0, width, height).data.slice(0);
	if (w && h) {
		var region = [];
		for (var j=0; j<h; j++) {
			for (var i=0; i<w; i++) {
				region[i*w+j] = pix[(y+j)*width+(x+i)]; 
			}
		}
		return region;
	}
	else if (x && y) {
		if (x >= 0 && x < width && y >= 0 && y < height) {
			return pix[y*width+x].data;
		} else {
			return [0, 0, 0, 255];
		}
	}
	else { return pix; }
}
function loadPixels() { 
	pixels = ctx.getImageData(0, 0, width, height).data.slice(0); // pend should this be 0,0 or  c.offsetLeft,c.offsetTop?
}
var pixels = [];
//set()
function updatePixels() {
	if (pixels) {
		var imgd = ctx.getImageData(x, y, width, height);
		imgd = pixels;
		context.putImageData(imgd, 0, 0);
	}
}


//// TYPOGRAPHY

// Loading & Displaying
function text(s, x, y) {
	ctx.font=pTextSize+"px Verdana";
	ctx.fillText(s, x, y);
}

// Atributes
function textAlign(a) {
	if (a == LEFT || a == RIGHT || a == CENTER) ctx.textAlign = a;
}
function textSize(s) { pTextSize = s; }
function textWidth(s) { return ctx.measureText(s).width; }
function textHeight(s) { return ctx.measureText(s).height; }

//// MATH
/** @module Math */
/** returns abs value */
function abs(n) { return Math.abs(n); }
function ceil(n) { return Math.ceil(n); }
function constrain(n, l, h) { return max(min(n, h), l); }
function dist(x1, y1, x2, y2) { return Math.dist(x1, y1, x2, y2); }
function exp(n) { return Math.exp(n); }
function floor(n) { return Math.floor(n); }
function lerp(start, stop, amt) { return amt*(stop-start)+start; }
function log(n) { return Math.log(n); }
function mag(x, y) { return Math.sqrt(x*x+y*y); }
function map(n, start1, stop1, start2, stop2) { return ((n-start1)/(stop1-start1))*(stop2-start2)+start2; }
function max(a, b) { return Math.max(a, b); }
function min(a, b) { return Math.min(a, b); }
function norm(n, start, stop) { return map(n, start, stop, 0, 1); }
function pow(n, e) { return Math.pow(n, e); }
function sq(n) { return n*n; }
function sqrt(n) { return Math.sqrt(n); }

// Trigonometry
function acos(x) { return Math.acos(x); }
function asin(x) { return Math.asin(x); }
function atan(x) { return Math.atan(x); }
function atan2(y, x) { return Math.atan2(y, x); }
function cos(x) { return Math.cos(x); }
function degrees(x) { return 360.0*x/(2*Math.PI); }
function radians(x) { return 2*Math.PI*x/360.0; }
function sin(x) { return Math.sin(x); }
function tan(x) { return Math.tan(x); }

// Random
function random(x, y) { 
	if (y) return (y-x)*Math.random()+x;
	else if (x) return x*Math.random();
	else return Math.random();
}

// Constants
var HALF_PI = Math.PI*0.5;
var PI = Math.PI;
var QUARTER_PI = Math.PI*0.25;
var TAU = Math.PI*2.0;
var TWO_PI = Math.PI*2.0;



//// INTERNALS

function pCreateCanvas() {
	console.log('create canvas');
	pStartTime = new Date().getTime();
	c = document.createElement('canvas');
	c.setAttribute('id', 'processing');
	c.setAttribute('width', width);
	c.setAttribute('height', height);
	document.body.appendChild(c);
	ctx = c.getContext("2d");
	pApplyDefaults();

	pSetupInput();

	if (typeof(setup) == "function") setup();
	
	pUpdateInterval = setInterval(pUpdate, 1000/frameRate);

	pDraw();
}


function pApplyDefaults() {
	ctx.fillStyle = "#FFFFFF";
	ctx.strokeStyle = "none";
	ctx.lineCap=ROUND;
}

function pUpdate() {
	frameCount++;
}

function pDraw() {
  if (pLoop) {
   	setTimeout(function() {
        requestAnimationFrame(pDraw);
    }, 1000 / frameRate);
	}
	// draw bg
	if (pBackground) {
		// save out the fill
		var curFill = ctx.fillStyle;
		// create background rect
		ctx.fillStyle = pBackground;
		ctx.fillRect(0, 0, width, height);
		// reset fill
		ctx.fillStyle = curFill;
	}

	// call draw
	if (typeof(draw) == "function") draw();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
}


function pModeAdjust(a, b, c, d, mode) {
	if (mode == CORNER) {
		return { x: a, y: b, w: c, h: d };
	} else if (mode == CORNERS) {
		return { x: a, y: b, w: c-a, h: d-b };
	} else if (mode == RADIUS) {
		return { x: a-c, y: b-d, w: 2*c, h: 2*d };
	} else if (mode == CENTER) {
		return { x: a-c*0.5, y: b-d*0.5, w: c, h: d };
	}
}

function pMultiplyMatrix(m1, m2) {
  var result = [];
  for(var j = 0; j < m2.length; j++) {
    result[j] = [];
    for(var k = 0; k < m1[0].length; k++) {
      var sum = 0;
      for(var i = 0; i < m1.length; i++) {
        sum += m1[i][k] * m2[j][i];
      }
      result[j].push(sum);
    }
  }
  return result;
}

function rgbToHex(r,g,b) {return toHex(r)+toHex(g)+toHex(b)}
function toHex(n) {
	n = parseInt(n,10);
	if (isNaN(n)) return "00";
	n = Math.max(0,Math.min(n,255));
	return "0123456789ABCDEF".charAt((n-n%16)/16) + "0123456789ABCDEF".charAt(n%16);
}




// PEND: still needed?
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 
// requestAnimationFrame polyfill by Erik Möller
// fixes from Paul Irish and Tino Zijdel
 
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());