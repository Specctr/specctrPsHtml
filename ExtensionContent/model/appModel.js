/*
Name: appModel.js
Description: This file keeps the global variables used in all other files.
 */

var model = 
{
		shapeFill:			true,
		shapeStroke:		true,
		shapeEffects:		true,
		shapeAlpha:			true,

		textFont:		true,
		textSize:		true,
		textAlignment:	true,
		textColor:		true,
		textStyle:		true,
		textLeading:	true,
		textTracking:	true,
		textAlpha:		true,
		textEffects:	true,

		canvasExpandSize: 250,

		//legend settings
		legendFont: 			"Arial",
		legendFontIndex:		0,
		legendFontSize:			12,
		legendColorObject:		'#FF0000',
		legendColorType:		'#FF0000',
		legendColorSpacing:		'#FF0000',
		useHexColor:			true,
		legendColorMode:		"RGB",

		armWeight:		1,
		isLicensed: 	false,
		typeUnits: 		"pt",
		distanceUnits:	"px",

		//Spacing spec options
		spaceLeft:		true,
		spaceTop:		true,
		spaceRight:		false,
		spaceBottom:	false,

		//Dimension spec options
		heightPos:	1,
		widthPos:	1
};

var filePermission = {
	ReadOnly : 0444,
	WriteOnly : 0222,
	ReadWrite : 0666,
	ReadWriteExecute : 0777
};

var configFilePath = '';
var extensionId = '';
