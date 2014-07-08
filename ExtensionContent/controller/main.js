/*
File-Name: main.js
Description: This file is used to communicate between extend script file and html file. It also include function to execute when panel loads
and reading and writing preferences methods.  
 */

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
	document.getElementById("textFont").checked				= model.textFont;
	document.getElementById("textSize").checked				= model.textSize;
	document.getElementById("textColor").checked			= model.textColor;
}

/**
 * FunctionName	: responsiveTab_creationCompleteHandler()
 * Description	: Set the values of the objects(check boxes in responsive tab) from model and enable/disable the text boxes.
 * */
function responsiveTab_creationCompleteHandler()
{
	disableTextField(document.getElementById("relativeWidth"));
	disableTextField(document.getElementById("relativeHeight"));
	disableTextField(document.getElementById("baseFontSize"));
	disableTextField(document.getElementById("baseLineHeight"));
}

/**
 * FunctionName	: prefs_creationCompleteHandler()
 * Description	: Load the data provider values to the combo box in spec options tab.
 * */
function prefs_creationCompleteHandler()
{
	document.getElementById("useHexColor").checked = model.useHexColor;
	disableTextField(document.getElementById("txtScaleBy"));

	var extScript = "ext_PHXS_getFonts()";
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
		loadJSX();		//Load the jsx files present in \jsx folder.
		init();
	}
	catch(e)
	{
		console.log(e);
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
		console.log(e);
	}
}

/**
 * FunctionName	: onClose()
 * Description	: Load the model value to preference on closing the panel. 
 * */
function onClose()
{
	var appPrefs = new Object();

	appPrefs.textFont			= model.textFont;
	appPrefs.textSize			= model.textSize;
	appPrefs.textColor			= model.textColor;
	appPrefs.legendFont			= model.legendFont.toString();

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
	
	if(!appPrefs || !appPrefs.hasOwnProperty("textFont"))
		return;

	model.textFont = appPrefs.textFont ? true : false;
	model.textSize = appPrefs.textSize ? true : false;
	model.textColor = appPrefs.textColor ? true : false;
	
	model.useHexColor = appPrefs.useHexColor ? true : false;
	model.specInPrcntg = appPrefs.specInPrcntg ? true : false;
	model.specInEM = appPrefs.specInEM ? true : false;
	model.useScaleBy = appPrefs.useScaleBy ? true : false;

	model.legendFont = appPrefs.legendFont ? appPrefs.legendFont : model.legendFont;
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
		console.log(e);
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
		console.log(e);
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
		var extScript = "ext_PHXS_setModel('" + JSON.stringify(model) + "')";
		evalScript(extScript);
	}
	catch(e)
	{
		console.log(e);
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
		var extScript = "ext_PHXS_expandCanvas()";
		evalScript(extScript);
	}
	catch(e)
	{
		console.log(e);
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
		var extScript = "ext_PHXS_createDimensionSpecs()";
		evalScript(extScript);
	}
	catch(e)
	{
		console.log(e);
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
		var extScript = "ext_PHXS_createPropertySpecs()";
		evalScript(extScript);
	}
	catch(e)
	{
		console.log(e);
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
