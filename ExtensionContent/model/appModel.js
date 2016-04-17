/*
Name: appModel.js
Description: This file keeps all the global/const variables used in all other files. 
 */

var _ = require('underscore');
var winston = require('winston');

var Specctr = {
    version: "3.01.14",
	Views: {},
	Models: {}
};

var SPECCTR_HOST = "https://cloud.specctr.com";
//var SPECCTR_HOST = "http://localhost:5000";
var SPECCTR_API = SPECCTR_HOST += "/api/v1";

var BG = Bugsnag = bugsnag = require('bugsnag');
BG.register("5e2e7c4622cad658564714af7011b905", {sendCode: true});
BG.appVersion = Specctr.version;
BG.notifyReleaseStages = ["production"];

if (SPECCTR_HOST == "https://cloud.specctr.com") {
    BG.releaseStage = "production";
}else{
    BG.releaseStage = "development";
}

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
	specOption: 'Bullet',
	cloudOption: 'import',		//Download.
};

var filePermission = {
	ReadOnly : 0444,
	WriteOnly : 0222,
	ReadWrite : 0666,
	ReadWriteExecute : 0777
};

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
var lightThemeColorValue = 5395026;		//Threshold point for light theme.
var extraLightThemeColorValue = 12698049;	//Threshold point for extra light theme.
var extraDarkThemeColorValue = 4737096;		//Threshold point for extra dark theme.

var psLightThemeColorVal = 5460820;
var psExtraLightThemeColorValue = 12105913;
var psExtraDarkThemeColorValue = 3421237;
