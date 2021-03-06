/*
 * Paper.js
 *
 * This file is part of Paper.js, a JavaScript Vector Graphics Library,
 * based on Scriptographer.org and designed to be largely API compatible.
 * http://paperjs.org/
 * http://scriptographer.org/
 *
 * Copyright (c) 2011, Juerg Lehni & Jonathan Puckey
 * http://lehni.org/ & http://jonathanpuckey.com/
 *
 * Distributed under the MIT license. See LICENSE file for details.
 *
 * All rights reserved.
 */

 /**
 * @name ProxyContext
 *
 * @class The ProxyContext is a helper class that helps Canvas debugging 
 * by logging all interactions with a 2D Canvas context.
 * 
 * @private
 *
 * @classexample
 * view._context = new ProxyContext(view._context);
 */
var ProxyContext = new function() {
	var descriptions = [
		'save()', 'restore()', 'scale(x,y)', 'rotate(angle)', 'translate(x,y)',
		'transform(a,b,c,d,e,f)', 'setTransform(a,b,c,d,e,f)', 'globalAlpha',
		'globalCompositeOperation', 'strokeStyle', 'fillStyle',
		'createLinearGradient(x0,y0,x1,y1)',
		'createRadialGradient(x0,y0,r0,x1,y1,r1)',
		'createPattern(image,repetition)', 'lineWidth', 'lineCap', 'lineJoin',
		'miterLimit', 'shadowOffsetX', 'shadowOffsetY', 'shadowBlur',
		'shadowColor', 'clearRect(x,y,w,h)', 'fillRect(x,y,w,h)',
		'strokeRect(x,y,w,h)', 'beginPath()', 'closePath()', 'moveTo(x,y)',
		'lineTo(x,y)', 'quadraticCurveTo(cpx,cpy,x,y)',
		'bezierCurveTo(cp1x,cp1y,cp2x,cp2y,x,y)', 'arcTo(x1,y1,x2,y2,radius)',
		'rect(x,y,w,h)', 'arc(x,y,radius,startAngle,endAngle,anticlockwise)',
		'fill()', 'stroke()', 'drawSystemFocusRing()', 'drawCustomFocusRing()',
		'scrollPathIntoView()', 'clip()', 'isPointInPath(x,y)', 'font',
		'textAlign', 'textBaseline', 'fillText(text,x,y,maxWidth)',
		'strokeText(text,x,y,maxWidth)', 'measureText(text)',
		'drawImage(image,dx,dy)', 'drawImage(image,dx,dy,dw,dh)',
		'drawImage(image,sx,sy,sw,sh,dx,dy,dw,dh)', 'createImageData(sw,sh)',
		'createImageData(imagedata)', 'getImageData(sx,sy,sw,sh)',
		'putImageData(imagedata,dx,dy,dirtyX,dirtyY,dirtyWidth,dirtyHeight)'
	];
	var fields = /** @lends ProxyContext# */ {
		initialize: function(context) {
			this._ctx = context;
			this._indents = 0;
		},

		getIndentation: function() {
			var str = '';
			for (var i = 0; i < this._indents; i++) {
				str += '	';
			}
			return str;
		}
	};
	Base.each(descriptions, function(description) {
		var match = description.match(/^([^(]+)(\()*/),
			name = match[1],
			isFunction = !!match[2];
		if (isFunction) {
			fields[name] = function() {
				if (name == 'restore') {
					this._indents--;
				}
				var args = Array.prototype.slice.call(arguments, 0).join(', '),
					string = 'ctx.' + name + '(' + args + ');';
				console.log(this.getIndentation() + string);
				if (name == 'save') {
					this._indents++;
				}
				return this._ctx[name].apply(this._ctx, arguments);
			};
		} else {
			var capitalized = Base.capitalize(name);
			fields['set' + capitalized] = function(value) {
				var logValue = value && value.substring ? '\'' + value + '\'' : value,
					string = 'ctx.' + name + ' = ' + logValue + ';';
				console.log(this.getIndentation() + string);
				return this._ctx[name] = value;
			};
			fields['get' + capitalized] = function() {
				return this._ctx[name];
			};
		}
	});
	return Base.extend(fields);
};
