/*
Name: appModel.js
Description: This file initialize and keep the updated value of all objects of the UI. 
*/

var model = 
{
	shapeFill:			true,
	shapeStroke:		true,
	shapeAlpha:			true,
	shapeEffects:		true,
	shapeBorderRadius: 	true,

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
	legendColorObject:		'0xFF0000',
	legendColorType:		'0xFF0000',
	legendColorSpacing:		'0xFF0000',
	useHexColor:			true,
	legendColorMode:		"RGB",
	legendBackgroundColor:	'0xFFFFFF',
	useLegendBackground:	false,

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
	widthPos:	1,

	//Responsive tab options
	specInPrcntg:	false,
	specInEM:		false,
	rltvHeight:		0,
	rltvWidth:		0,
	baseFontSize:	16,
	baseLineHeight: 22.4,

	//Scaling specs
	useScaleBy: false,
	scaleValue: "x1"
};

