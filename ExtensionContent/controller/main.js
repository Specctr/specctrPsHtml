/*
File-Name: main.js
Description: This file is used to communicate between extend script file and html file. It also include function to execute when panel loads
and reading and writing preferences methods.  
 */

var photoshopId = "PHXS";
var illustratorId = "ILST";
var hostApplication;

/**
 * FunctionName	: completeHandler()
 * Description	: Callback function which is called when validation of user's license take place.
 * */
function completeHandler(data, status)
{
	var appPrefs = new Object();
	var response = data;

	alert(response.message);
	var arr = response.registered;

	//If unsuccessful, return without saving the data in config.
	if(arr.length != 0) 
	{
		appPrefs.isLicensed = true;
		model.isLicensed = true;
	}
	else
	{
		return;
	}

	setPreferencePath();
	writeAppPrefs(JSON.stringify(appPrefs));
	init();
}

/**
 * FunctionName	: mainTab_creationCompleteHandler()
 * Description	: Set the canvas expand text value.
 * */
function mainTab_creationCompleteHandler()
{
	document.getElementById("canvasExpandSize").value = model.canvasExpandSize;
}

/**
 * FunctionName	: settings_creationCompleteHandler()
 * Description	: Set the values of the objects(check boxes in setting tab) from model.
 * */
function settings_creationCompleteHandler()
{
	//Load settings from model according to the host application.
	if(hostApplication == illustratorId)
	{
		document.getElementById("shapeFillColor").checked			= model.shapeFillColor;
		document.getElementById("shapeFillStyle").checked			= model.shapeFillStyle;
		document.getElementById("shapeStrokeColor").checked			= model.shapeStrokeColor;
		document.getElementById("shapeStrokeStyle").checked			= model.shapeStrokeStyle;
		document.getElementById("shapeStrokeSize").checked			= model.shapeStrokeSize;
	}
	else
	{
		document.getElementById("shapeFill").checked			= model.shapeFill;
		document.getElementById("shapeStroke").checked			= model.shapeStroke;
		document.getElementById("shapeEffects").checked			= model.shapeEffects;
		document.getElementById("textEffects").checked			= model.textEffects;
	}

	document.getElementById("shapeAlpha").checked			= model.shapeAlpha;
	document.getElementById("shapeBorderRadius").checked	= model.shapeBorderRadius;
	document.getElementById("textFont").checked				= model.textFont;
	document.getElementById("textSize").checked				= model.textSize;
	document.getElementById("textColor").checked			= model.textColor;
	document.getElementById("textStyle").checked			= model.textStyle;
	document.getElementById("textAlignment").checked		= model.textAlignment;
	document.getElementById("textLeading").checked			= model.textLeading;
	document.getElementById("textTracking").checked			= model.textTracking;
	document.getElementById("textAlpha").checked			= model.textAlpha;
}

/**
 * FunctionName	: responsiveTab_creationCompleteHandler()
 * Description	: Set the values of the objects(check boxes in responsive tab) from model and enable/disable the text boxes.
 * */
function responsiveTab_creationCompleteHandler()
{
	var relativeWidth = "relativeWidth";
	var relativeHeight = "relativeHeight";
	var baseFontSize = "baseFontSize";
	var baseLineHeight = "baseLineHeight";

	//Select the checkboxes depending on the model value.
	document.getElementById("chkDistanceSpec").checked = model.specInPrcntg;
	document.getElementById("chkEmSpec").checked = model.specInEM;

	//If true, enable the text boxes for width and height.
	if(model.specInPrcntg)
	{
		enableTextField(document.getElementById(relativeWidth));
		enableTextField(document.getElementById(relativeHeight));
	}
	else
	{
		disableTextField(document.getElementById(relativeWidth));
		disableTextField(document.getElementById(relativeHeight));
	}

	//If true, enable the text boxes for base font size and line height.
	if(model.specInEM)
	{
		enableTextField(document.getElementById());
		enableTextField(document.getElementById(baseLineHeight));
	}
	else
	{
		disableTextField(document.getElementById(baseFontSize));
		disableTextField(document.getElementById(baseLineHeight));
	}
}

/**
 * FunctionName	: prefs_creationCompleteHandler()
 * Description	: Load the data provider values to the combo box in spec options tab.
 * */
function prefs_creationCompleteHandler()
{
	if(hostApplication == illustratorId && model.legendFont == "Arial")
		model.legendFont += "MT";

	//Set the values for font size combobox.
	var fontSizeHandler = document.getElementById("lstSize");
	fontSizeHandler.selectedIndex = -1;
	fontSizeHandler.value = model.legendFontSize.toString();

	//Set the values for arm weight combobox.
	var armWeightHandler = document.getElementById("lstLineWeight");
	armWeightHandler.selectedIndex = -1;
	armWeightHandler.value = model.armWeight.toString();

	document.getElementById("useHexColor").checked = model.useHexColor;

	//Initialize the components on the basis of host application.
	if(hostApplication == illustratorId)
	{
		document.getElementById("specToEdge").checked = model.specToEdge;

		var colorModeHandler = document.getElementById("lstColorMode");
		for(var i = 0; i < 4; i++)
		{
			if(colorModeHandler.options[i].text == model.legendColorMode)
			{
				colorModeHandler.options[i].selected = true;
				break;
			}
		}
	}
	else
	{
		if(!model.legendColorMode)
			model.legendColorMode = "RGB";

		var radioButton = model.legendColorMode.toLowerCase() + "RadioButton";
		document.getElementById(radioButton).checked = true;
	}

	document.getElementById("colObject").style.backgroundColor = model.legendColorObject;
	document.getElementById("colType").style.backgroundColor = model.legendColorType;
	document.getElementById("colSpacing").style.backgroundColor = model.legendColorSpacing;

	document.getElementById("chkScaleBy").checked = model.useScaleBy;

	//Enable or disable scale text according to selection of check box.
	if(model.useScaleBy)
		enableTextField(document.getElementById("txtScaleBy"));
	else
		disableTextField(document.getElementById("txtScaleBy"));

	var extScript = "ext_" + hostApplication + "_getFonts()";
	evalScript(extScript, loadFontsToList);
}

/**
 * FunctionName	: onLoaded()
 * Description	: Load the jsx and show/hide the login container according to the license value in preferences.
 * */
function onLoaded()
{
	//Handle the exceptions such as if any value or any component is not present.
	try
	{
		hostApplication = getHostApp();

		if(hostApplication == null)
		{
			alert("Cannot load the extension.\nRequuired adobe product not found! ");
			return;
		}

		loadJSX();		//Load the jsx files present in \jsx folder.

		//Change the UI appearance according to host application.
		if(hostApplication == illustratorId)
		{
			document.getElementById("fillForPHXS").style.display = "none";
			document.getElementById("strokeForPHXS").style.display = "none";
			document.getElementById("shapeEffectsForPHXS").style.display = "none";
			document.getElementById("textEffectsForPHXS").style.display = "none";
			document.getElementById("radioForPHXS").style.display = "none";

			document.getElementById("fillColorForILST").style.display = "block";
			document.getElementById("fillStyleForILST").style.display = "block";
			document.getElementById("strokeColorForILST").style.display = "block";
			document.getElementById("strokeStyleForILST").style.display = "block";
			document.getElementById("strokeSizeForILST").style.display = "block";
			document.getElementById("specToEdgeCheckbox").style.display = "block";
			document.getElementById("colorListForILST").style.display = "block";
		}

		var appPrefs = readAppPrefs();
		if(!appPrefs)
		{
			appPrefs = new Object();
			appPrefs.isLicensed = false;
			model.isLicensed = false;
			writeAppPrefs(JSON.stringify(appPrefs));
		}

		//Check if Specctr is licensed, if not leave registration screen.
		model.isLicensed = appPrefs.isLicensed;

		if(model.isLicensed)
			init();

	}
	catch(e)
	{
		alert(e);
	}
}

/**
 * FunctionName	: init()
 * Description	: Initialize the values of the tab conatainer's components.
 * */
function init()
{
	//Handle the exceptions such as if any value or any component is not present.
	try
	{
		//Load tab container..
		document.getElementById("loginContainer").style.display = "none";
		document.getElementById("tabContainer").style.display = "block";

		setModelValueFromPreferences();

		var container = document.getElementById("tabContainer");	//Get tab container
		var navitem = container.querySelector(".tabs ul li");	//Set current tab

		//Store which tab we are on
		var ident = navitem.id.split("_")[1];
		navitem.parentNode.setAttribute("data-current", ident);

		changeImagesOfTabs(parseInt(ident));	//Set Current Tab with proper Image
		navitem.setAttribute("class", "tabActiveHeader");	//Set current tab with class of active tab header

		//Hide two tab contents we don't need
		var pages = container.querySelectorAll(".tabpage");
		for(var i = 1; i < pages.length; i++) 
			pages[i].style.display = "none";

		//Register click events to tabs.
		var tabs = container.querySelectorAll(".tabs ul li");
		for(var i = 0; i < tabs.length; i++) 
			tabs[i].onclick = tab_clickHandler;

		mainTab_creationCompleteHandler();
		settings_creationCompleteHandler();
		responsiveTab_creationCompleteHandler();
		prefs_creationCompleteHandler();
	}
	catch(e)
	{
		alert(e);
	}
}

/**
 * FunctionName	: onClose()
 * Description	: Load the model value to preference on closing the panel. 
 * */
function onClose()
{
	var appPrefs = new Object();

	//Save the values according to host application.
	if(hostApplication == illustratorId)
	{
		appPrefs.shapeFillColor			= model.shapeFillColor;
		appPrefs.shapeFillStyle			= model.shapeFillStyle;
		appPrefs.shapeStrokeColor		= model.shapeStrokeColor;
		appPrefs.shapeStrokeStyle		= model.shapeStrokeStyle;
		appPrefs.shapeStrokeSize		= model.shapeStrokeSize;
		appPrefs.specToEdge				= model.specToEdge;
	}
	else
	{
		appPrefs.shapeFill			= model.shapeFill;
		appPrefs.shapeStroke		= model.shapeStroke;
		appPrefs.shapeEffects		= model.shapeEffects;
		appPrefs.textEffects		= model.textEffects;
		appPrefs.lastLoginDate		= model.lastLoginDate;
		appPrefs.status				= model.status;
	}

	appPrefs.shapeAlpha			= model.shapeAlpha;
	appPrefs.shapeBorderRadius	= model.shapeBorderRadius;

	appPrefs.textFont			= model.textFont;
	appPrefs.textSize			= model.textSize;
	appPrefs.textAlignment		= model.textAlignment;
	appPrefs.textColor			= model.textColor;
	appPrefs.textStyle			= model.textStyle;
	appPrefs.textLeading		= model.textLeading;
	appPrefs.textTracking		= model.textTracking;
	appPrefs.textAlpha			= model.textAlpha;
	appPrefs.isLicensed			= model.isLicensed;
	appPrefs.canvasExpandSize	= model.canvasExpandSize.toString();

	appPrefs.legendFont			= model.legendFont.toString();
	appPrefs.legendFontSize		= model.legendFontSize.toString();
	appPrefs.armWeight			= model.armWeight.toString();
	appPrefs.legendColorObject	= model.legendColorObject;
	appPrefs.legendColorType	= model.legendColorType;
	appPrefs.legendColorSpacing	= model.legendColorSpacing;
	appPrefs.legendColorMode	= model.legendColorMode;
	appPrefs.useHexColor		= model.useHexColor;
	appPrefs.specInPrcntg		= model.specInPrcntg;
	appPrefs.specInEM			= model.specInEM;
	appPrefs.useScaleBy			= model.useScaleBy;

	//If object is empty then don't write.
	if($.isEmptyObject(appPrefs))
		return;

	writeAppPrefs(JSON.stringify(appPrefs));
}

/**
 * FunctionName	: setModelValueFromPreferences()
 * Description	: Set the Specctr configuration file data to model values.
 * */
function setModelValueFromPreferences()
{
	var appPrefs = readAppPrefs();

	if(!appPrefs || !appPrefs.hasOwnProperty("shapeAlpha"))
		return;

	if(hostApplication == illustratorId)
	{
		model.shapeFillColor = appPrefs.shapeFillColor ? true : false;
		model.shapeFillStyle = appPrefs.shapeFillStyle ? true : false;
		model.shapeStrokeColor = appPrefs.shapeStrokeColor ? true : false;
		model.shapeStrokeStyle = appPrefs.shapeStrokeStyle ? true : false;
		model.shapeStrokeSize = appPrefs.shapeStrokeSize ? true : false;
		model.specToEdge = appPrefs.specToEdge ? true : false;
	}
	else
	{
		model.shapeFill = appPrefs.shapeFill ? true : false;
		model.shapeStroke = appPrefs.shapeStroke ? true : false;
		model.shapeEffects = appPrefs.shapeEffects ? true : false;
		model.textEffects = appPrefs.textEffects ? true : false;
	}

	model.shapeAlpha = appPrefs.shapeAlpha ? true : false;
	model.shapeBorderRadius = appPrefs.shapeBorderRadius ? true : false;
	model.textFont = appPrefs.textFont ? true : false;
	model.textSize = appPrefs.textSize ? true : false;
	model.textAlignment = appPrefs.textAlignment ? true : false;
	model.textColor = appPrefs.textColor ? true : false;
	model.textStyle = appPrefs.textStyle ? true : false;
	model.textLeading = appPrefs.textLeading ? true : false;
	model.textTracking = appPrefs.textTracking ? true : false;
	model.useHexColor = appPrefs.useHexColor ? true : false;
	model.specInPrcntg = appPrefs.specInPrcntg ? true : false;
	model.specInEM = appPrefs.specInEM ? true : false;
	model.useScaleBy = appPrefs.useScaleBy ? true : false;

	model.canvasExpandSize = Number(appPrefs.canvasExpandSize);

	model.legendFont = appPrefs.legendFont ? appPrefs.legendFont : model.legendFont;
	model.legendFontSize = Number(appPrefs.legendFontSize);
	model.armWeight = Number(appPrefs.armWeight);

	if(appPrefs.hasOwnProperty("legendColorObject"))
		model.legendColorObject = appPrefs.legendColorObject;

	if(appPrefs.hasOwnProperty("legendColorType"))
		model.legendColorType = appPrefs.legendColorType;

	if(appPrefs.hasOwnProperty("legendColorSpacing"))
		model.legendColorSpacing = appPrefs.legendColorSpacing;

	if(appPrefs.hasOwnProperty("legendColorMode"))
		model.legendColorMode = appPrefs.legendColorMode;
}

/**
 * FunctionName	: loadFontsToList()
 * Description	: This is a callback function which takes the font list from jsx and load the list to the font combo-box of fourth tab.
 * */
function loadFontsToList(result)
{
	try
	{
		var font = JSON.parse(result);
		var fontLength = font.length;
		var fontList = document.getElementById("lstFont");

		//Set the font list to combo-box.
		for(var i = 0; i < fontLength; i++) 
		{
			var option = document.createElement("option");
			option.text = font[i].font;
			option.value = i;
			fontList.add(option, i);
		}

		applyFontToList();
	}
	catch(e)
	{
		alert(e);
	}
}

/**
 * FunctionName	: loadJSX()
 * Description	: Load JSX file into the scripting context of the product. All the jsx files in folder [ExtensionRoot]/jsx will be loaded.
 * */
function loadJSX() 
{
	try
	{
		var csInterface = new CSInterface();
		var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) + "/jsx/";
		csInterface.evalScript('$._ext.evalFiles("' + extensionRoot + '")');
	}
	catch(e)
	{
		alert(e);
	}

}

/**
 * FunctionName	: evalScript()
 * Description	: Evaluates the scripting method.
 * */
function evalScript(script, callback) 
{
	new CSInterface().evalScript(script, callback);
}

/**
 * FunctionName	: setModel()
 * Description	: Evaluates the script and pass the model object to extendscript file(.jsx).
 * */
function setModel()
{
	try
	{
		var extScript = "ext_" + hostApplication + "_setModel('" + JSON.stringify(model) + "')";
		evalScript(extScript);
	}
	catch(e)
	{
		alert(e);
	}
}

/**
 * FunctionName	: expandCanvas()
 * Description	: Call the 'createCanvasBorder' method from ./jsx/specctr.jsx.
 * */
function expandCanvas()
{
	try
	{
		setModel();
		var extScript = "ext_" + hostApplication + "_expandCanvas()";
		evalScript(extScript);
	}
	catch(e)
	{
		alert(e);
	}
}

/**
 * FunctionName	: createDimensionSpecs()
 * Description	: Call the 'createDimensionSpecsForItem' method from ./jsx/specctr.jsx.
 * */
function createDimensionSpecs()
{
	try
	{
		setModel();
		var extScript = "ext_" + hostApplication + "_createDimensionSpecs()";
		evalScript(extScript);
	}
	catch(e)
	{
		alert(e);
	}
}

/**
 * FunctionName	: createSpacingSpecs()
 * Description	: Call the 'createSpacingSpecs' method from ./jsx/specctr.jsx.
 * */
function createSpacingSpecs()
{
	try
	{
		setModel();
		var extScript = "ext_" + hostApplication + "_createSpacingSpecs()";
		evalScript(extScript);
	}
	catch(e)
	{
		alert(e);
	}
}

/**
 * FunctionName	: createCoordinateSpecs()
 * Description	: Call the 'createCoordinateSpecs' method from ./jsx/specctr.jsx.
 * */
function createCoordinateSpecs()
{
	try
	{
		setModel();
		var extScript = "ext_" + hostApplication + "_createCoordinateSpecs()";
		evalScript(extScript);
	}
	catch(e)
	{
		alert(e);
	}
}

/**
 * FunctionName	: createPropertySpecs()
 * Description	: Call the 'createPropertySpecsForItem' method from ./jsx/specctr.jsx.
 * */
function createPropertySpecs()
{
	try
	{
		setModel();
		var extScript = "ext_" + hostApplication + "_createPropertySpecs()";
		evalScript(extScript);
	}
	catch(e)
	{
		alert(e);
	}
}

/**
 * FunctionName	: exportCss()
 * Description	: Call the 'exportCss' method from ./jsx/specctr.jsx.
 * */
function exportCss()
{
	try
	{
		setModel();
		var extScript = "ext_" + hostApplication + "_exportCss()";
		evalScript(extScript);
	}
	catch(e)
	{
		alert(e);
	}
}

/**
 * FunctionName	: applyFontToList()
 * Description	: Apply the model's font value to the font list of fourth tab.
 * */
function applyFontToList()
{
	var fontListHandler = document.getElementById("lstFont");		//Get font combo-box handler.

	//Select the font if the index text value matches with the legendFont.
	if(fontListHandler.options[model.legendFontIndex].text == model.legendFont)
	{
		fontListHandler.options[model.legendFontIndex].selected = true;
		return;
	}

	var listLength = fontListHandler.options.length;

	//Select the font from the legendFont value and apply it.
	for(var i = 0; i < listLength; i++)
	{
		if(fontListHandler.options[i].text == model.legendFont)
		{
			model.legendFontIndex = i;
			fontListHandler.options[i].selected = true;
			break;
		}
	}
}
