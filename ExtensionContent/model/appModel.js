/*
Name: appModel.js
Description: This file initialize and keep the updated value of all objects of the UI. 
 */

var model = 
{
		shapeFill:			true,
		shapeStroke:		true,
		shapeEffects:		true,

		shapeFillColor:		true,
		shapeFillStyle:		true,
		shapeStrokeColor:	true,
		shapeStrokeStyle:	true,
		shapeStrokeSize:	true,

		shapeAlpha:			true,
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
		legendFont: 			"Aparajita",
		legendFontIndex:		0,
		legendFontSize:			12,
		legendColorObject:		'#FF0000',
		legendColorType:		'#FF0000',
		legendColorSpacing:		'#FF0000',
		useHexColor:			true,
		legendColorMode:		"RGB",
		specToEdge:				true,

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
		relativeHeight:		0,
		relativeWidth:		0,
		baseFontSize:	16,
		baseLineHeight: 22.4,

		//Scaling specs
		useScaleBy: false,
		scaleValue: "x1",

		//For api subscription
		status: '',
		lastLoginDate: 0
};

