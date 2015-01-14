/*
Name: appModel.js
Description: This file keeps the global variables used in all other files. 
 */

var model = {
	shapeFill:			true,
	shapeStroke:		true,
	shapeEffects:		true,
	
	shapeFillColor:		true,
	shapeFillStyle:		true,
	shapeStrokeColor:	true,
	shapeStrokeStyle:	true,
	shapeStrokeSize:	true,
	
	shapeAlpha:			false,
	shapeBorderRadius: 	false,

	textFont:		true,
	textSize:		true,
	textAlignment:	true,
	textColor:		true,
	textStyle:		true,
	textLeading:	true,
	textTracking:	true,
	textAlpha:		false,
	textEffects:	true,

	canvasExpandSize: 250,

	//legend settings
	legendFont: 			'ArialMT',
	legendFontIndex:		0,
	legendFontSize:			12,
	legendColorObject:		'#FF0000',
	legendColorType:		'#FF0000',
	legendColorSpacing:		'#FF0000',
	useHexColor:			true,
	legendColorMode:		'RGB',
	specToEdge:				true,

	armWeight:		1,
	typeUnits: 		'pt',
	distanceUnits:	'px',
	
	//Coordinate spec options
	coordinateCellNumber:	0,
	
	//Spacing spec options
	spaceLeft:		true,
	spaceTop:		true,
	spaceRight:		false,
	spaceBottom:	false,

	//Dimension spec options
	heightPos:	1,
	widthPos:	1,

	//Responsive tab options
	specInPrcntg:	false,
	specInEM:		false,
	relativeHeight:		0,
	relativeWidth:		0,
	baseFontSize:	16,
	baseLineHeight: 22.4,

	//Scaling specs
	useScaleBy: false,
	scaleValue: 'x1',
	
	rgbTransformIntoPercentage: false,
	decimalFractionValue: 'decimal'
};

var filePermission = {
	ReadOnly : 0444,
	WriteOnly : 0222,
	ReadWrite : 0666,
	ReadWriteExecute : 0777
};

var configFilePath = '';
var extensionId = '';
var hostApplication = '';
var illustrator = 'Ai';
var photoshop = 'Ps';
