/*
Name: appModel.js
Description: This file keeps all the global/const variables used in all other files. 
 */

var _ = require('underscore');
var winston = require('winston');

var Specctr = {
	Version: "",
	Views: {},
	Models: {}
};

var SPECCTR_HOST = "https://cloud.specctr.com";
//var SPECCTR_HOST = "http://localhost:5000";

function getHost() {
    return SPECCTR_HOST;
}

function getApi() {
    return getHost() + "/api/v1";;
}


var BG = {};

var model = {
	shapeLayerName:		true,
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

	textLayerName:	true,
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
	legendFontFamily:		'Arial',
	legendFontSize:			12,
	legendColorObject:		'#FF0000',
	legendColorType:		'#FF0000',
	legendColorSpacing:		'#FF0000',
	legendColorMode:		'RGB',
	specToEdge:				true,
	includeStroke:			true,

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

	decimalFractionValue: 'decimal',
	pixelDpValue: 'pixel',  
	specOption: 'Bullet',
	cloudOption: 'export',		//Download.
};

var filePermission = {
	ReadOnly : 0444,
	WriteOnly : 0222,
	ReadWrite : 0666,
	ReadWriteExecute : 0777
};

var bUndoFlag = false;

var isDarkInterface = false;
var configFilePath = '';
var extensionId = '';
var hostApplication = '';
var illustrator = 'Ai';
var photoshop = 'Ps';
var indesign = 'Id';
var bgColorButton = '';
var bgColorHoverButton = '';

var imagePath = "../assets/images/";

var AICC17Version = "21.0.0";
var IdCC17Version = "12.1";

//For others i.e Indesign and AI.
var extraDarkThemeColorValue = 4737096;		//Threshold point for extra dark theme.
var lightThemeColorValue = 5395026;		//Threshold point for light theme.
var extraLightThemeColorValue = 12698049;	//Threshold point for extra light theme.

//For AI CC 2017 and later version.
var aiExtraDarkThemeColorValue = 3289651;		//Threshold point for extra dark theme.
var aiLightThemeColorValue = 5460819;		//Threshold point for light theme.
var aiExtraLightThemeColorValue = 12105912;	//Threshold point for extra light theme.

//For Id CC 2017 and later version.
var idExtraDarkThemeColorValue = 3289651;		//Threshold point for extra dark theme.
var idLightThemeColorValue = 5460819;		//Threshold point for light theme.
var idExtraLightThemeColorValue = 12105912;	//Threshold point for extra light theme.

//For photoshop CC to CC 2017
var psExtraDarkThemeColorValue = 3421237;
var psLightThemeColorValue = 5460820;
var psExtraLightThemeColorValue = 12105913;
