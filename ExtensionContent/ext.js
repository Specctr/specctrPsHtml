/*
File-Name: ext.js
Description: This file is used to communicate between extend script file and html file. It also include function to execute when panel loads
and reading and writing preferences methods.  
*/

var preferencePath;

/**
 * FunctionName	: mainTab_creationCompleteHandler()
 * Description	: Set the canvas expand text value.
 * */
function mainTab_creationCompleteHandler()
{
	try
	{
		document.getElementById("canvasExpandSize").value = model.canvasExpandSize;
	}
	catch(e)
	{
		alert(e);
	}
}

/**
 * FunctionName	: settings_creationCompleteHandler()
 * Description	: Set the values of the objects(check boxes in setting tab) from model.
 * */
function settings_creationCompleteHandler()
{
	try
	{
		//Load settings from model
		document.getElementById("shapeFill").checked			= model.shapeFill;
		document.getElementById("shapeStroke").checked			= model.shapeStroke;
		document.getElementById("shapeAlpha").checked			= model.shapeAlpha;
		document.getElementById("shapeEffects").checked			= model.shapeEffects;
		document.getElementById("shapeBorderRadius").checked	= model.shapeBorderRadius;
		document.getElementById("textFont").checked				= model.textFont;
		document.getElementById("textSize").checked				= model.textSize;
		document.getElementById("textColor").checked			= model.textColor;
		document.getElementById("textStyle").checked			= model.textStyle;
		document.getElementById("textAlignment").checked		= model.textAlignment;
		document.getElementById("textLeading").checked			= model.textLeading;
		document.getElementById("textTracking").checked			= model.textTracking;
		document.getElementById("textAlpha").checked			= model.textAlpha;
		document.getElementById("textEffects").checked			= model.textEffects;
	}
	catch(e)
	{
		alert(e);
	}
}

/**
 * FunctionName	: responsiveTab_creationCompleteHandler()
 * Description	: Set the values of the objects(check boxes in responsive tab) from model and enable/disable the text boxes.
 * */
function responsiveTab_creationCompleteHandler()
{
	try
	{
		//For spec in distance.
		document.getElementById("chkDistanceSpec").checked = model.specInPrcntg;
		if(model.specInPrcntg)
		{
			enableTextField(document.getElementById("txtWidth"));
			enableTextField(document.getElementById("txtHeight"));
		}
		else
		{
			disableTextField(document.getElementById("txtWidth"));
			disableTextField(document.getElementById("txtHeight"));
		}
		
		//For spec in EM.
		document.getElementById("chkEmSpec").checked = model.specInEM;
		if(model.specInEM)
		{
			enableTextField(document.getElementById("txtFontSize"));
			enableTextField(document.getElementById("txtBaseLineHeight"));
		}
		else
		{
			disableTextField(document.getElementById("txtFontSize"));
			disableTextField(document.getElementById("txtBaseLineHeight"));
		}
		
	}
	catch(e)
	{
		alert(e);
	}
}

/**
 * FunctionName	: prefs_creationCompleteHandler()
 * Description	: Load the data provider values to the combo box in spec options tab.
 * */
function prefs_creationCompleteHandler()
{
	//Set the values for font size combobox.
	var fontSizeHandler = document.getElementById("lstSize");
	fontSizeHandler.selectedIndex = -1;
	fontSizeHandler.value = model.legendFontSize.toString();
	
	//Set the values for arm weight combobox.
	var armWeightHandler = document.getElementById("lstLineWeight");
	armWeightHandler.selectedIndex = -1;
	armWeightHandler.value = model.armWeight.toString();
	
	document.getElementById("chkDisplayRGBAsHex").checked = model.useHexColor;
	
//	specColorObject.selectedColor	= model.legendColorObject;
//	specColorType.selectedColor		= model.legendColorType;
//	specColorSpacing.selectedColor	= model.legendColorSpacing;
	
	switch(model.legendColorMode)
	{
		case "HSB": 
			document.getElementById("hsbRadioButton").checked = true;
			break;
			
		case "CMYK": 
			document.getElementById("cmykRadioButton").checked = true;
			break;
			
		case "HSL": 
			document.getElementById("hslRadioButton").checked = true;
			break;
		
		case "RGB":
		default:
			document.getElementById("rgbRadioButton").checked = true;
			break;
		
	}
	
	document.getElementById("chkScaleBy").checked = model.useScaleBy;
	
	if(model.useScaleBy)
	{
		enableTextField(document.getElementById("txtScaleBy"));
	}
	else
	{
		disableTextField(document.getElementById("txtScaleBy"));
	}
	
	var extScript = "ext_getFonts()";
	evalScript(extScript, loadFontsToList);
}

/**
 * FunctionName	: onLoaded()
 * Description	: Update the theme with the AppSkinInfo retrieved from the host product.
 * */
function onLoaded()
{
	try
	{
		//Load the jsx files present in \jsx folder.
		loadJSX();
	    
	    //Get tab container
	    var container = document.getElementById("tabContainer");
	    
	    //Set current tab
	    var navitem = container.querySelector(".tabs ul li");
	    
	    //Store which tab we are on
	    var ident = navitem.id.split("_")[1];
	    navitem.parentNode.setAttribute("data-current", ident);
	    
	    //Set Current Tab with proper Image
	    changeImagesOfTabs(parseInt(ident));
	    
	    //Set current tab with class of active tab header
	    navitem.setAttribute("class", "tabActiveHeader");
	
	    //Hide two tab contents we don't need
	    var pages = container.querySelectorAll(".tabpage");
	    for(var i = 1; i < pages.length; i++) 
	    {
	        pages[i].style.display = "none";
	    }
	
	    //Register click events to tabs.
	    var tabs = container.querySelectorAll(".tabs ul li");
	    for(var i = 0; i < tabs.length; i++) 
	    {
	        tabs[i].onclick = tab_clickHandler;
	    }
	  
	    //Check whether config exists, if not initialize and save in file on disk.
	    var prefFileExists = readAppPrefs();
	    if(!prefFileExists)
		{
			model.isLicensed = false;
			writeAppPrefs();
		}
	    
	    model.isLicensed = true;
	    if(model.isLicensed)
    	{
	    	document.getElementById("loginContainer").style.display = "none";
	   	 	document.getElementById("tabContainer").style.display = "block";
    	}
	    
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
 * FunctionName	: readAppPrefs()
 * Description	: Return JSON object representing Specctr configuration file.
 * */
function readAppPrefs()
{
	try
	{
		var specctrConfig = 'specctrPhotoshopConfig.json';
		
		var csInterface = new CSInterface();
		var prefsFile = csInterface.getSystemPath(SystemPath.USER_DATA);
		prefsFile += "/LocalStore";
		preferencePath = prefsFile + "/" + specctrConfig;
		
		var result = cep.fs.readdir(prefsFile);
		if(cep.fs.ERR_NOT_FOUND == result.err)
		{
			cep.fs.makedir(prefsFile);
			return false;
		}
		
		result = cep.fs.readFile(preferencePath);
		if(cep.fs.ERR_NOT_FOUND == result.err)
			return false;
		
		console.log(result.data);
		var appPrefs = JSON.parse(result.data);
		
		setModelValueFromPreferences(appPrefs);
	
		return true;
	}
	catch(e)
	{
		console.log(e);
	}
}

function writeAppPrefs()
{
	try
	{
		var appPrefs = new Object();
		
		appPrefs.shapeFill			= model.shapeFill;
		appPrefs.shapeStroke		= model.shapeStroke;
		appPrefs.shapeAlpha			= model.shapeAlpha;
		appPrefs.shapeEffects		= model.shapeEffects;
		appPrefs.shapeBorderRadius	= model.shapeBorderRadius;
	
		appPrefs.textFont			= model.textFont;
		appPrefs.textSize			= model.textSize;
		appPrefs.textAlignment		= model.textAlignment;
		appPrefs.textColor			= model.textColor;
		appPrefs.textStyle			= model.textStyle;
		appPrefs.textLeading		= model.textLeading;
		appPrefs.textTracking		= model.textTracking;
		appPrefs.textAlpha			= model.textAlpha;
		appPrefs.textEffects		= model.textEffects;
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
		appPrefs.useLegendBackground = model.useLegendBackground;
		
		appPrefs.isLicensed			= model.isLicensed;
		
		cep.fs.writeFile(preferencePath, JSON.stringify(appPrefs));
	}
	catch(e)
	{
		console.log(e);
	}
}

function setModelValueFromPreferences(appPrefs)
{
	try
	{
		if (appPrefs.hasOwnProperty('shapeFill'))
			model.shapeFill = appPrefs.shapeFill;
		
		if (appPrefs.hasOwnProperty('shapeStroke'))
			model.shapeStroke = appPrefs.shapeStroke;
		
		if (appPrefs.hasOwnProperty('shapeAlpha'))
			model.shapeAlpha = appPrefs.shapeAlpha;
		
		if (appPrefs.hasOwnProperty('shapeEffects'))
			model.shapeEffects = appPrefs.shapeEffects;
		
		if (appPrefs.hasOwnProperty('shapeBorderRadius'))
			model.shapeBorderRadius = appPrefs.shapeBorderRadius;
		
		if (appPrefs.hasOwnProperty('textFont'))
			model.textFont = appPrefs.textFont;
		
		if (appPrefs.hasOwnProperty('textSize'))
			model.textSize = appPrefs.textSize;
		
		if (appPrefs.hasOwnProperty('textAlignment'))
			model.textAlignment = appPrefs.textAlignment;
		
		if (appPrefs.hasOwnProperty('textColor'))
			model.textColor = appPrefs.textColor;
		
		if (appPrefs.hasOwnProperty('textStyle'))
			model.textStyle = appPrefs.textStyle;
		
		if (appPrefs.hasOwnProperty('textLeading'))
			model.textLeading = appPrefs.textLeading;
		
		if (appPrefs.hasOwnProperty('textTracking'))
			model.textTracking = appPrefs.textTracking;
		
		if (appPrefs.hasOwnProperty('textAlpha'))
			model.textAlpha = appPrefs.textAlpha;
		
		if (appPrefs.hasOwnProperty('textEffects'))
			model.textEffects = appPrefs.textEffects;
		
		if (appPrefs.hasOwnProperty('canvasExpandSize'))
			model.canvasExpandSize = Number(appPrefs.canvasExpandSize);
		
		if (appPrefs.hasOwnProperty('legendFont'))
		{
			model.legendFont = appPrefs.legendFont;
		}
		else
		{
			model.legendFont = "Arial";
		}
		
		if (appPrefs.hasOwnProperty('legendFontSize'))
			model.legendFontSize = Number(appPrefs.legendFontSize);
		
		if (appPrefs.hasOwnProperty('armWeight'))
			model.armWeight = Number(appPrefs.armWeight);
		
		if (appPrefs.hasOwnProperty('legendColorObject'))
			model.legendColorObject = appPrefs.legendColorObject;
		
		if (appPrefs.hasOwnProperty('legendColorType'))
			model.legendColorType = appPrefs.legendColorType;
		
		if (appPrefs.hasOwnProperty('legendColorSpacing'))
			model.legendColorSpacing = appPrefs.legendColorSpacing;
		
		if (appPrefs.hasOwnProperty('legendColorMode'))
			model.legendColorMode = appPrefs.legendColorMode;
		
		if (appPrefs.hasOwnProperty('useHexColor'))
			model.useHexColor = appPrefs.useHexColor;
		
		if (appPrefs.hasOwnProperty('useLegendBackground'))
			model.useLegendBackground = appPrefs.useLegendBackground;
		
		if (appPrefs.hasOwnProperty('specInPrcntg'))
			model.specInPrcntg = appPrefs.specInPrcntg;
		
		if (appPrefs.hasOwnProperty('specInEM'))
			model.specInEM = appPrefs.specInEM;
		
		if (appPrefs.hasOwnProperty('useScaleBy'))
			model.useScaleBy = appPrefs.useScaleBy;
		
		if (appPrefs.hasOwnProperty('isLicensed'))
			model.isLicensed = appPrefs.isLicensed;
	}
	catch(e)
	{
		console.log(e);
	}
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
	    for (var i = 0; i < fontLength; i++) 
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
 * FunctionName	: disableTextField()
 * Description	: Disable the text input.
 * */
function disableTextField(textField)
{
	try
	{
		textField.disabled = true;
	}
	catch(e)
	{
		alert(e);
	}
}

/**
 * FunctionName	: enableTextField()
 * Description	: Enable the text input and change the background color to white.
 * */
function enableTextField(textField)
{
	try
	{
		textField.disabled = false;
		textField.style.backgroundColor = '#ffffff';
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
    var csInterface = new CSInterface();
    var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION) + "/jsx/";
    csInterface.evalScript('$._ext.evalFiles("' + extensionRoot + '")');
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
 * Description	: Evaluates the script and pass the model object to extendscript file(specctr.jx).
 * */
function setModel()
{
	try
	{
		var extScript = "ext_setModel('" + JSON.stringify(model) + "')";
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
		var extScript = "ext_expandCanvas()";
		evalScript(extScript);
		writeAppPrefs();
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
		var extScript = "ext_createDimensionSpecs()";
		evalScript(extScript);
		writeAppPrefs();
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
		var extScript = "ext_createSpacingSpecs()";
		evalScript(extScript);
		writeAppPrefs();
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
		var extScript = "ext_createCoordinateSpecs()";
		evalScript(extScript);
		writeAppPrefs();
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
		var extScript = "ext_createPropertySpecs()";
		evalScript(extScript);
		writeAppPrefs();
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
		var extScript = "ext_exportCss()";
		evalScript(extScript);
	}
	catch(e)
	{
		alert(e);
	}
}


//Jquery code..
jQuery().ready(function () {
    $('#liWh #imgWhDdlArrow').click(function () {

        //Rest other buttons
        $('#liSpacing .options').slideUp(100);
        $('#btnSpacing').removeClass('buttonSelected');
        $('#imgSpacingDdlArrow').removeClass().addClass('dropdownArrow');
    	$('#liWh').toggleClass('isOpen');
        $('#liWh .options').slideToggle(100);
        $('#imgWhDdlArrow').toggleClass('dropdownArrowUp');
        $('#btnWh').toggleClass('buttonSelected');
    });

    $('#liSpacing #imgSpacingDdlArrow').click(function () {
    	$('#liSpacing').toggleClass('isOpen');
    	$('#liSpacing .options').slideToggle(100);
        $('#imgSpacingDdlArrow').toggleClass('dropdownArrowUp');
        $('#btnSpacing').toggleClass('buttonSelected');
    });
});