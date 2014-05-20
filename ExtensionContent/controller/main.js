/*
File-Name: main.js
Description: This file is used to communicate between extend script file and html file. It also include function to execute when panel loads
and reading and writing preferences methods.  
*/

var preferencePath;		//path of the Specctr config file.
var appPrefs;			//Store the preference of UI.
var hostApplication = null;	//Store the current host application.
var photoshopId = "PHXS";
var illustratorId = "ILST";
var psConfig = "specctrPhotoshopConfig.json";
var illConfig = "specctrIllustratorConfig.json";

/**
 * FunctionName	: activateButton_clickHandler()
 * Description	: Validate the license of the user and move to the tab container if user's credentials valid.
 * */
function activateButton_clickHandler()
{
	try
	{
		// Get Extension Id and matching productCode.
		var productCodes = [ "SpecctrPs-Pro",
				"SpecctrPs-10",
				"SpecctrPs-20",
				"SpecctrPs-30",
				"SpecctrPs-Site"
			];
		
		var csInterface = new CSInterface();
		var arrayOfExtensionIds = csInterface.getExtensions(productCodes);

		if(!arrayOfExtensionIds.length)
		{
			alert("Incorrect product code!");
			return;
		}
			
		var extensionId = arrayOfExtensionIds[0].id;
		
		var urlRequest = "http://specctr-license.herokuapp.com?";
		urlRequest += "product=" + extensionId;
		urlRequest += "&license=" + document.getElementById("license").value;
		urlRequest += "&email=" + document.getElementById("emailInput").value;
				
		$.get(urlRequest, completeHandler);
		
//		var dataObject = new Object();
//		dataObject.product = extensionId;
//		dataObject.license = document.getElementById("license").value;
//		dataObject.email = document.getElementById("emailInput").value;
//		
//		$.ajax({url:"http://specctr-license.herokuapp.com",
//			 type:"Get",
//			 dataType:"json",
//			 data: dataObject,
//			 success:completeHandler
//			  });
	}
	catch(e)
	{
		alert(e);
	}

}

/**
 * FunctionName	: completeHandler()
 * Description	: Callback function which is called when validation of user's license take place.
 * */
function completeHandler(data, status)
{
	try
    {
    	var response = data;
    	alert(response["message"]);
        var arr = response["registered"];
        if(arr.length != 0) 
    	{
        	appPrefs.isLicensed = true;
    		model.isLicensed = true;
    		
    		var specctrConfig = getConfigFileName();			
    		var csInterface = new CSInterface();
    		var prefsFile = csInterface.getSystemPath(SystemPath.USER_DATA);
    		prefsFile += "/LocalStore";
    		preferencePath = prefsFile + "/" + specctrConfig;
    		
    		writeAppPrefs(appPrefs);
    		init();
    	}
    }
    catch(e)
    {
    	console.log(e);
    }
}

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
	try
	{
		if(hostApplication == null)
			hostApplication = getHostApp();
		
		//Set the values for font size combobox.
		var fontSizeHandler = document.getElementById("lstSize");
		fontSizeHandler.selectedIndex = -1;
		fontSizeHandler.value = model.legendFontSize.toString();
		
		//Set the values for arm weight combobox.
		var armWeightHandler = document.getElementById("lstLineWeight");
		armWeightHandler.selectedIndex = -1;
		armWeightHandler.value = model.armWeight.toString();
		
		document.getElementById("chkDisplayRGBAsHex").checked = model.useHexColor;
		
		if(hostApplication == illustratorId)
		{
			document.getElementById("chkCanvasEdge").checked = model.specToEdge;
			
			var colorModeHandler = document.getElementById("lstColorMode");
			for (var i = 0; i < 4; i++)
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
		}
		
		document.getElementById("colShape").style.backgroundColor = model.legendColorObject;
		document.getElementById("colType").style.backgroundColor = model.legendColorType;
		document.getElementById("colSpacing").style.backgroundColor = model.legendColorSpacing;
		
		document.getElementById("chkScaleBy").checked = model.useScaleBy;
		
		if(model.useScaleBy)
			enableTextField(document.getElementById("txtScaleBy"));
		else
			disableTextField(document.getElementById("txtScaleBy"));
		
		var extScript = "ext_" + hostApplication + "_getFonts()";
		evalScript(extScript, loadFontsToList);
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: onLoaded()
 * Description	: Load the jsx and show/hide the login container according to the license value in preferences.
 * */
function onLoaded()
{
	try
	{
		var appName = getHostApp();
		hostApplication = appName;

		if(hostApplication == null)
		{
			alert("Cannot load the extension.\nRequuired adobe product not found! ");
			return;
		}
		
		//Load the jsx files present in \jsx folder.
		loadJSX();
		
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
		
		//Check whether config exists, if not initialize and save in file on disk.
	    appPrefs = readAppPrefs(hostApplication);
	    if(appPrefs == null)
		{
	    	appPrefs = new Object();
			appPrefs.isLicensed = false;
			model.isLicensed = false;
			writeAppPrefs(appPrefs);
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
	try
	{
		//Load tab container..
		document.getElementById("loginContainer").style.display = "none";
   	 	document.getElementById("tabContainer").style.display = "block";
   	 	
   	 	setModelValueFromPreferences();
   	 
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
 * FunctionName	: readAppPrefs()
 * Description	: Return JSON object representing Specctr configuration file.
 * */
function readAppPrefs(id)
{
	try
	{
		var specctrConfig = psConfig;
		
		if(id == illustratorId)
			specctrConfig = illConfig;
		
		var csInterface = new CSInterface();
		var prefsFile = csInterface.getSystemPath(SystemPath.USER_DATA);
		prefsFile += "/LocalStore";
		preferencePath = prefsFile + "/" + specctrConfig;
		
		var result = window.cep.fs.readdir(prefsFile);
		if(window.cep.fs.ERR_NOT_FOUND == result.err)
		{
			window.cep.fs.makedir(prefsFile);
			return null;
		}
		
		result = window.cep.fs.readFile(preferencePath);
		if(window.cep.fs.ERR_NOT_FOUND == result.err)
			return null;
		
		appPrefs = JSON.parse(result.data);
		return appPrefs;
	}
	catch(e)
	{
		console.log(e);
		return null;
	}
}

/**
 * FunctionName	: onClose()
 * Description	: Load the model value to preference on closing the panel. 
 * */
function onClose()
{
	try
	{
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
		
		writeAppPrefs(appPrefs);
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: writeAppPrefs()
 * Description	: Write Specctr configuration to file.
 * */
function writeAppPrefs(appPrefs)
{
	try
	{
		if(!preferencePath.length)
		{
			var specctrConfig = getConfigFileName();
			var csInterface = new CSInterface();
			var prefsFile = csInterface.getSystemPath(SystemPath.USER_DATA);
			prefsFile += "/LocalStore";
			preferencePath = prefsFile + "/" + specctrConfig;
		}
		
		window.cep.fs.writeFile(preferencePath, JSON.stringify(appPrefs));
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: setModelValueFromPreferences()
 * Description	: Set the Specctr configuration file data to model values.
 * */
function setModelValueFromPreferences()
{
	try
	{
		if(hostApplication == illustratorId)
		{
			if (appPrefs.hasOwnProperty('shapeFillColor'))
				model.shapeFillColor = appPrefs.shapeFillColor;
			
			if (appPrefs.hasOwnProperty('shapeFillStyle'))
				model.shapeFillStyle = appPrefs.shapeFillStyle;
			
			if (appPrefs.hasOwnProperty('shapeStrokeColor'))
				model.shapeStrokeColor = appPrefs.shapeStrokeColor;
			
			if (appPrefs.hasOwnProperty('shapeStrokeStyle'))
				model.shapeStrokeStyle = appPrefs.shapeStrokeStyle;
			
			if (appPrefs.hasOwnProperty('shapeStrokeSize'))
				model.shapeStrokeSize = appPrefs.shapeStrokeSize;
			
			if (appPrefs.hasOwnProperty('specToEdge'))
				model.specToEdge = appPrefs.specToEdge;
		}
		else
		{
			if (appPrefs.hasOwnProperty('shapeFill'))
				model.shapeFill = appPrefs.shapeFill;
			
			if (appPrefs.hasOwnProperty('shapeStroke'))
				model.shapeStroke = appPrefs.shapeStroke;
			
			if (appPrefs.hasOwnProperty('shapeEffects'))
				model.shapeEffects = appPrefs.shapeEffects;
			
			if (appPrefs.hasOwnProperty('textEffects'))
				model.textEffects = appPrefs.textEffects;
		}
		
		if (appPrefs.hasOwnProperty('shapeAlpha'))
			model.shapeAlpha = appPrefs.shapeAlpha;
		
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
		
		if (appPrefs.hasOwnProperty('canvasExpandSize'))
			model.canvasExpandSize = Number(appPrefs.canvasExpandSize);
		
		if (appPrefs.hasOwnProperty('legendFont'))
			model.legendFont = appPrefs.legendFont;
		else
			model.legendFont = "Aparajita";
		
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
		
		if (appPrefs.hasOwnProperty('specInPrcntg'))
			model.specInPrcntg = appPrefs.specInPrcntg;
		
		if (appPrefs.hasOwnProperty('specInEM'))
			model.specInEM = appPrefs.specInEM;
		
		if (appPrefs.hasOwnProperty('useScaleBy'))
			model.useScaleBy = appPrefs.useScaleBy;
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
 * FunctionName	: getHostApp()
 * Description	: Get the current host application name.
 * */
function getHostApp()
{
	try
	{
		var csInterface = new CSInterface();
		var appName = csInterface.hostEnvironment.appName;
	    var appNames = ["PHXS","ILST"];
	    var currentApplication = "";
	    
	    for(var i = 0; i < appNames.length; i++) 
	    {
	    	var name = appNames[i];
	        if(appName.indexOf(name) >= 0) 
	        {
	        	currentApplication = name;
	        	break;
	        }
	    }
	    
	    return currentApplication;
	}
	catch(e)
	{
		console.log(e);
		return null;
	}
	
}

/**
 * FunctionName	: evalScript()
 * Description	: Evaluates the scripting method.
 * */
function evalScript(script, callback) 
{
	try
	{
	    new CSInterface().evalScript(script, callback);
	}
	catch(e)
	{
		consol.log(e);
	}
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
		onClose();
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
		onClose();
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
		onClose();
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
		onClose();
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
		onClose();
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
	try
	{
		var fontListHandler = document.getElementById("lstFont");		//Get font combo-box handler.
		
		//Select the font if the index text value matches with the legendFont.
		if(fontListHandler.options[model.legendFontIndex].text == model.legendFont)
		{
			fontListHandler.options[model.legendFontIndex].selected = true;
			return;
		}
		
		//Select the font from the legendFont value and apply it.
		var listLength = fontListHandler.options.length;
		for (var i = 0; i < listLength; i++)
		{
			if(fontListHandler.options[i].text == model.legendFont)
			{
				model.legendFontIndex = i;
				fontListHandler.options[i].selected = true;
				break;
			}
		}
	}
	catch(e)
	{
		alert(e);
	}
}

/**
 * FunctionName	: getConfigFileName()
 * Description	: Get the config file name according to the current host application.
 * */
function getConfigFileName()
{
	try
	{
		var specctrConfig = psConfig;
		
		if(hostApplication == null)
			hostApplication = getHostApp();
		
		if(hostApplication == illustratorId)
			specctrConfig = illConfig;
		
		return specctrConfig;
	}
	catch(e)
	{
		console.log(e);
		return "";
	}
}