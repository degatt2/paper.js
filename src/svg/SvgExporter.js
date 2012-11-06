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
 * 
 * The base for this code was donated by Stetson-Team-Alpha.
 */

/**
 * @name SvgExporter
 *
 * @class The SvgExporter object holds all the functionality to convert a
 * Paper.js DOM to a SVG DOM.
 */

var SvgExporter = this.SvgExporter = new function() {

	function createElement(tag) {
		return document.createElementNS('http://www.w3.org/2000/svg', tag);
	}

	function setAttributes(svg, attrs) {
		for (var key in attrs)
			svg.setAttribute(key, attrs[key]);
	}

	function exportGroup(group) {
		var svg = createElement('g'),
			children = group._children;
		for (var i = 0, l = children.length; i < l; i++)
			svg.appendChild(SvgExporter.exportItem(children[i]));
		// Override default SVG style on groups, then apply style.
		setAttributes(svg, {
			fill: 'none'
		});
		applyStyle(group, svg);
		return svg;
	}

	function exportItem(path) {
		var svg;
		//Getting all of the segments(a point, a HandleIn and a HandleOut) in the path
		var segments;
		var type;
		//finding the type of path to export
		if (path.content) {
			type = 'text';
		} else {
			//Values are only defined if the path is not text because
			// text does not have these values
			segments = path.getSegments();
			type = determineType(path, segments);
		}
		//switch statement that determines what type of SVG element to add to the SVG Object
		switch (type) {
		case 'rect':
			var width = segments[0]._point.getDistance(segments[3]._point);
			var height = segments[0]._point.getDistance(segments[1]._point);
			svg = createElement('rect');
			svg.setAttribute('x', path.bounds.topLeft.getX());
			svg.setAttribute('y', path.bounds.topLeft.getY());
			svg.setAttribute('width', width);
			svg.setAttribute('height', height);
			break;
		case 'roundrect':
			//d variables and point are used to determine the rounded corners for the rounded rectangle
			var dx1 = segments[1]._point.getDistance(segments[6]._point);
			var dx2 = segments[0]._point.getDistance(segments[7]._point);
			var dx3 = (dx1 - dx2) / 2;
			var dy1 = segments[0]._point.getDistance(segments[3]._point);
			var dy2 = segments[1]._point.getDistance(segments[2]._point);
			var dy3 = (dy1 - dy2) / 2;
			var point = new Point((segments[3]._point.getX() - dx3), (segments[2]._point.getY() - dy3)); 
			var width = Math.round(dx1);
			var height = Math.round(dy1);
			var rx = segments[3]._point.getX() - point.x;
			var ry = segments[2]._point.getY() - point.y;
			svg = createElement('rect');
			svg.setAttribute('x', path.bounds.topLeft.getX());
			svg.setAttribute('y', path.bounds.topLeft.getY());
			svg.setAttribute('rx', rx);
			svg.setAttribute('ry', ry);
			svg.setAttribute('width', width);
			svg.setAttribute('height', height);
			break;
		case'line':
			svg = createElement('line');
			svg.setAttribute('x1', segments[0]._point.getX());
			svg.setAttribute('y1', segments[0]._point.getY());
			svg.setAttribute('x2', segments[segments.length - 1]._point.getX());
			svg.setAttribute('y2', segments[segments.length - 1]._point.getY());
			break;
		case 'circle':
			svg = createElement('circle');
			var radius = (segments[0]._point.getDistance(segments[2]._point)) /2;
			svg.setAttribute('cx', path.bounds.center.x);
			svg.setAttribute('cy', path.bounds.center.y);
			svg.setAttribute('r', radius);
			break;
		case 'ellipse':
			svg = createElement('ellipse');
			var radiusX = segments[2]._point.getDistance(segments[0]._point) / 2;
			var radiusY = segments[3]._point.getDistance(segments[1]._point) /2;
			svg.setAttribute('cx', path.bounds.center.x);
			svg.setAttribute('cy', path.bounds.center.y);
			svg.setAttribute('rx', radiusX);
			svg.setAttribute('ry', radiusY);
			break;
		case 'polyline':
			svg = createElement('polyline');
			var pointString = '';
			for(var i = 0; i < segments.length; i++) {
				pointString += segments[i]._point.getX() + ','  + segments[i]._point.getY() + ' ';
			}
			svg.setAttribute('points', pointString);
			break;
		case 'polygon':
			svg = createElement('polygon');
			var pointString = '';
			for(i = 0; i < segments.length; i++) {
				pointString += segments[i]._point.getX() + ',' + segments[i]._point.getY() + ' ';
			}
			svg.setAttribute('points', pointString);
			break;
		case 'text':
			svg = createElement('text');
			svg.setAttribute('x', path.getPoint().getX());
			svg.setAttribute('y', path.getPoint().getY());
			if (path.characterStyle.font != undefined) {
				svg.setAttribute('font-family', path.characterStyle.font);
			}
			if (path.characterStyle.fontSize != undefined) {
				svg.setAttribute('font-size',path.characterStyle.fontSize);
			}
			svg.textContent = path.getContent();
			break;
		default:
			svg = pathSetup(path, segments);
			break;
		}
		//If the object is a circle, ellipse, rectangle, or rounded rectangle, it will find the angle 
		//found by the determineIfTransformed method and make a path that accommodates for the transformed object
		if (type != 'text' && type != undefined && type != 'polygon' &&  type != 'polyline' && type != 'line') {
			//TODO: Need to implement exported transforms for circle, ellipse, and rectangles instead of 
			//making them paths
			var angle = determineIfTransformed(path, segments, type) + 90;
			if (angle != 0) {
				if (type == 'rect' || type == 'roundrect') {
					svg = pathSetup(path, segments);
				} else {
					svg = pathSetup(path, segments);
				}
			} 
		}
		if (type == 'text') {
			svg.setAttribute('transform','rotate(' + path.matrix.getRotation() + ',' + path.getPoint().getX() + ',' +path.getPoint().getY() +')');
		}
		applyStyle(path, svg);
		return svg;
	}
	var exporters = {
		group: exportGroup,
		layer: exportGroup,
		path: exportItem,
		pointtext: exportItem
		// TODO:
		// raster: 
		// placedsymbol:
		// compoundpath:
	};

	// Determines whether the object has been transformed or not through finding the angle
	function determineIfTransformed(path, segments, type) {
		var topMidBoundx = (path.bounds.topRight.getX() + path.bounds.topLeft.getX() )/2;
		var topMidBoundy = (path.bounds.topRight.getY() + path.bounds.topLeft.getY() )/2;
		var topMidBound = new Point(topMidBoundx, topMidBoundy);
		var centerPoint = path.getPosition();
		var topMidPathx;
		var topMidPathy;
		var topMidPath;
		switch (type) {
		case 'rect':
			topMidPathx = (segments[1]._point.getX() + segments[2]._point.getX() )/2;
			topMidPathy = (segments[1]._point.getY() + segments[2]._point.getY() )/2;
			topMidPath = new Point(topMidPathx, topMidPathy);
			break;
		case 'ellipse':
			topMidPath = new Point(segments[1]._point.getX(), segments[1]._point.getY());
			break;
		case 'circle':
			topMidPath = new Point(segments[1]._point.getX(), segments[1]._point.getY());
			break;
		case 'roundrect':
			topMidPathx = (segments[3]._point.getX() + segments[4]._point.getX())/2;
			topMidPathy = (segments[3]._point.getY() + segments[4]._point.getY())/2;
			topMidPath = new Point(topMidPathx, topMidPathy);
			break;	
		default:
			//Nothing happens here
			break;
		}
		var deltaY = topMidPath.y - centerPoint.getY();
		var deltaX = topMidPath.x - centerPoint.getX();
		var angleInDegrees = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
		return angleInDegrees;
	}
	
	function pathSetup(path, segments) {
		var svgPath = createElement('path');
		var pointString = '';
		// pointstring is formatted in the way the SVG XML will be reading.
		// Namely, a point and the way to traverse to that point.
		pointString += 'M' + segments[0]._point.getX() + ',' + segments[0]._point.getY() + ' ';
		//Checks 2 points and the angles in between the 2 points
		for (i = 0; i < segments.length-1; i++) {
			var x1 = segments[i]._point.getX(),
				y1 = segments[i]._point.getY(),
				x2 = segments[i + 1]._point.getX(),
				y2 = segments[i + 1]._point.getY(),
				handleOut1 = segments[i]._handleOut,
				handleIn2 = segments[i+1]._handleIn;
			if (handleOut1.getX() == 0 && handleOut1.getY() == 0 && handleIn2.getX() == 0 && handleIn2.getY() == 0) {
					// L is lineto, moving to a point with drawing
					pointString+= 'L' + x2 + ',' + y2 + ' ';
			} else {
				// c is curveto, relative: handleOut, handleIn - endpoint, endpoint - startpoint
				pointString += 'c' + (handleOut1.getX())  + ',' + (handleOut1.getY()) + ' ';
				pointString += (x2 - x1 + handleIn2.getX()) + ',' + (y2 - y1 + handleIn2.getY()) + ' ';
				pointString += (x2 - x1) + ',' + (y2 - y1) +  ' ';
			}
		}
		if (!segments[segments.length - 1]._handleOut.equals([0, 0]) && !segments[0]._handleIn.equals([0, 0])) {
			var handleOut1 = segments[segments.length - 1]._handleOut,
				handleIn2 = segments[0]._handleIn,
				// Bezier curve from last point to first
				x1 = segments[segments.length - 1]._point.getX(),
				y1 = segments[segments.length - 1]._point.getY(),
				x2 = segments[0]._point.getX(),
				y2 = segments[0]._point.getY();
			pointString += 'c' + (handleOut1.getX())  + ',' + (handleOut1.getY()) + ' ';
			pointString += (x2 - x1 + handleIn2.getX()) + ',' + (y2 - y1 + handleIn2.getY()) + ' ';
			pointString += (x2 - x1) + ',' + (y2 - y1) +  ' ';
		}
		if (path._closed) {
			// z implies a closed path, connecting the first and last points
			pointString += 'z';
		}
		svgPath.setAttribute('d', pointString);
		return svgPath;
	}

	/**
	* Checks the type SVG object created by converting from Paper.js
	*/
	function determineType(path, segments) {
		var type;
		var dPoint12;
		var dPoint34;
		// See if actually have any curves in the path. Differentiate
		// between straight objects (line, polyline, rect, and  polygon) and
		// objects with curves(circle, ellipse, roundedRectangle).
		if (path.isPolygon()) {
			if (segments.length == 4) {
				// If the distance between (point0 and point1) and (point2 and
				// point3) are equal, then it is a rectangle
				dPoint12 = Math.round(segments[0]._point.getDistance(segments[1]._point));
				dPoint34 = Math.round(segments[3]._point.getDistance(segments[2]._point));
				if (dPoint12 == dPoint34) {
					type = 'rect';
				}
			} else if (segments.length >= 3) {
				//If it is an object with more than 3 segments and the path is closed, it is a polygon
				if (path.getClosed()) {
					type = 'polygon';
				} else {
					type = 'polyline';
				}
			} else {
				//if all of the handle values are == 0 and there are only 2 segments, it is a line
				type = 'line';
			}	
		} else {
			if (segments.length == 8) {
				// If the distance between (point0 and point3) and (point7 and 
				// point4) are equal then it is a roundedRectangle
				dPoint12 = Math.round(segments[0]._point.getDistance(segments[3]._point));
				dPoint34 = Math.round(segments[7]._point.getDistance(segments[4]._point));
				if (dPoint12 == dPoint34) {
					type = 'roundrect';
				}
			} else if (segments.length == 4) {
				// Check if the values of the point have values similar to 
				// circles and ellipses.
				var checkPointValues = true;
				for (i = 0; i < segments.length && checkPointValues; i++) {
					if (segments[i]._handleIn.getX() != 0 || segments[i]._handleIn.getY() != 0
							&& Math.round(Math.abs(segments[i]._handleIn.getX())) === Math.round(Math.abs(segments[i]._handleOut.getX()))
							&& Math.round(Math.abs(segments[i]._handleIn.getY())) === Math.round(Math.abs(segments[i]._handleOut.getY()))) {
						checkPointValues = true;
					} else {
						checkPointValues = false;
					}	
				}	
				if (checkPointValues) {
					// If the distance between (point0 and point2) and (point1
					// and point3) are equal, then it is a circle
					var d1 = Math.round(segments[0]._point.getDistance(segments[2]._point));
					var d2 = Math.round(segments[1]._point.getDistance(segments[3]._point));
					if (d1 == d2) {
						type = 'circle';
					} else {
						type = 'ellipse';
					}
				}
			} 
		}
		return type;
	}

	function applyStyle(item, svg) {
		var attrs = {},
			style = item._style,
			parent = item.getParent(),
			parentStyle = parent && parent._style;

		if (item._name != null)
			attrs.id = item._name;

		Base.each(SvgStyles.properties, function(entry) {
			// Get a given style only if it differs from the value on the parent
			// (A layer or group which can have style values in SVG).
			var value = style[entry.get]();
			if (value != null && (!parentStyle
					|| !Base.equals(parentStyle[entry.get](), value))) {
				attrs[entry.attribute] = entry.type === 'color'
					? value.toCssString()
					: entry.type === 'array'
						? value.join(',')
						: value;
			}
		});

		if (item._opacity != null)
			attrs.opacity = item._opacity;

		if (item._visibility != null)
			attrs._visibility = item._visibility ? 'visible' : 'hidden';

		setAttributes(svg, attrs);
	}

	return /** @Lends SvgExporter */{
		/**
		 * Takes the selected Paper.js project and parses all of its layers and
		 * groups to be placed into SVG groups, converting the project into one
		 * SVG group.
		 *
		 * @function
		 * @param {Project} project a Paper.js project
		 * @return {SVGSVGElement} the imported project converted to an SVG project
		 */
		 // TODO: Implement symbols and Gradients
		exportProject: function(project) {
			var svg = createElement('svg'),
				layers = project.layers;
			for (var i = 0, l = layers.length; i < l; i++) {
				svg.appendChild(this.exportItem(layers[i]));
			}
			return svg;
		},

		exportItem: function(item) {
			var exporter = exporters[item._type];
			// TODO: exporter == null: Not supported yet.
			var svg = exporter && exporter(item);
			return svg;
		}
	};
};
