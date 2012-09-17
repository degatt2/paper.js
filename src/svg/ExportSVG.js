/**
 *  Exports items, layers or whole projects as a svg
 *  Stetson Alpha - Paper.js
 *  
 *  var NS="http://www.w3.org/2000/svg";
 *  var svg=document.createElementNS(NS,"svg");
 */

 


var ExportSVG = function()
{
	var svgObj = null; // xml dom object (svg typed)
	//var blarg = this;
	
	//initialize the svgObj and what ever else.
	/*function initialize()
	{
		var NS = "http://www.w3.org/2000/svg";
		svgObj = document.createElementNS(NS,"svg");
		
		console.log(svgObj);

	};*/
	
	/**
	 * 
	 * Takes the whole project and parses
	 * all the layers to be put into svg groups and 
	 * groups into svg groups making all the projects 
	 * items into one svg.
	 * 
	 * takes in a Paper.js Project
	 * returns svg object (xml dom)
	 */
    this.exportProject = function(project)
    {
    	return svgObj;
    };
	
    
	/**
	 * 
	 * Takes the layer and then parses all groups
	 * and items into one svg
	 * 
	 * takes in a Paper.js Layer
	 * returns svg object (xml dom)
	 */
    this.exportLayer = function(layer)
    {
    	return svgObj;
    };
	
    
	/**
	 * 
	 * Takes the group and puts it's items 
	 * in a svg file.
	 * 
	 * takes in a Paper.js Group
	 * returns svg object (xml dom)
	 */
    this.exportGroup = function(group)
    {
    	return svgObj;
    };
	
	/**
	 * 
	 * Takes the item and puts it in
	 * a svg file.
	 * 
	 * takes in a Paper.js Item
	 * returns svg object (xml dom)
	 */
    this.exportItem = function(item)
    {
    	return svgObj;
    };
    
	/**
	 * 
	 * Takes the path and puts it in
	 * a svg file.
	 * 
	 * takes in a Paper.js Path
	 * returns svg object (xml dom)
	 */
    this.exportPath = function(path)
    {
    	//this.initialize();
    	//console.log(blarg.svgObj);
	var pathClone = path.clone();
	var NS = "http://www.w3.org/2000/svg";
	svgObj = document.createElementNS(NS,"svg");
	svgPath = document.createElementNS(NS, "path");
	
	var segArray = pathClone.getSegments();

	var pointArray = new Array();
	var handleInArray = new Array();
	var handleOutArray = new Array();
	for(i = 0; i < segArray.length; i++)
	{	
		console.log(segArray[i].toString());
		pointArray[i] = segArray[i].getPoint();
		handleInArray[i] = segArray[i].getHandleIn();
		handleOutArray[i] = segArray[i].getHandleOut();
	}
	var pointString = "";
	for(i = 0; i < pointArray.length; i++)
	{
		var x = pointArray[i].getX();
		//x = x - (x % 1);
		var y = pointArray[i].getY();
		//y = y - (x % 1);
		if(i === 0)
		{
			pointString+= "M " + x + " " + y + " ";
		}
		else
		{
			pointString+= "L " + x + " " + y + " ";
		}
	}
	if(pathClone.getClosed())
	{
		pointString += "z";
	}
	
	svgPath.setAttribute("d",pointString);

	if(pathClone.strokeColor != undefined)
	{
		var strokeRed = pathClone.strokeColor.red;
		var strokeGreen = pathClone.strokeColor.green;
		var strokeBlue = pathClone.strokeColor.blue;
		var strokeRGB = RGBtoHex(strokeRed, strokeGreen, strokeBlue);
		svgPath.setAttribute("stroke", strokeRGB);
	}
	
	if(pathClone.fillColor != undefined)
	{
		var fillRed = pathClone.fillColor.red;
		var fillGreen = pathClone.fillColor.green;
		var fillBlue = pathClone.fillColor.blue;
		var fillRGB = RGBtoHex(fillRed, fillGreen, fillBlue);
		svgPath.setAttribute("fill", fillRGB);
	}
	svgPath.setAttribute("stroke-width",pathClone.strokeWidth);
	svgObj.appendChild(svgPath);
	return svgObj;
    };

    function RGBConverter(deciColor)
    {
	var decColor = Math.round(deciColor * 255);
	var hexColor = decColor.toString(16);
	hexColor = hexColor.length > 1? hexColor : "0" + hexColor;
	return hexColor;
    };

    function RGBtoHex(red, green, blue)
    {
    	var redVal = RGBConverter(red);
	var greenVal = RGBConverter(green);
	var blueVal = RGBConverter(blue);
	return "#" + redVal + greenVal + blueVal;
    }


    //initialize(); // calls the init function after class is loaded
};
