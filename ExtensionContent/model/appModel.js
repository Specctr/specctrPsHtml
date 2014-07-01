/*
Name: appModel.js
Description: This file initialize and keep the updated value of all objects of the UI. 
 */

var model = 
{
		shapeFillColor:		false,
		shapeFillStyle:		false,
		shapeStrokeColor:	false,
		shapeStrokeStyle:	false,
		shapeStrokeSize:	false,
		shapeAlpha:			false,
		shapeBorderRadius: 	false,

		textFont:		true,
		textSize:		true,
		textAlignment:	false,
		textColor:		true,
		textStyle:		false,
		textLeading:	false,
		textTracking:	false,
		textAlpha:		false,

		canvasExpandSize: 250,

		//legend settings
		legendFont: 			"ArialMT",
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
		scaleValue: "x1"
};

