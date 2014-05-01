/*
File-Name: ext.js
Description: This file is used to communicate between extend script file and html file. It also include function to execute when panel loads
and reading and writing preferences methods.  
*/

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
		var csInterface = new CSInterface();
		loadJSX();
	    updateThemeWithAppSkinInfo(csInterface.hostEnvironment.appSkinInfo);
	    
	    //Update the color of the panel when the theme color of the product changed.
	    csInterface.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, onAppThemeColorChanged);
	    
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
		alert(e);
	}
}

/**
 * FunctionName	: updateThemeWithAppSkinInfo()
 * Description	: Update the theme with the AppSkinInfo retrieved from the host product.
 * */
function updateThemeWithAppSkinInfo(appSkinInfo) 
{
	//Update the background color of the panel
    var panelBackgroundColor = appSkinInfo.panelBackgroundColor.color;
    document.body.bgColor = toHex(panelBackgroundColor);
    
    var styleId = "ppstyle";
    addRule(styleId, "button, select, input[type=button], input[type=submit]", "border-radius:3px;");
	
    var gradientBg = "background-image: -webkit-linear-gradient(top, " + 
    					toHex(panelBackgroundColor, 40) + " , " + toHex(panelBackgroundColor, 10) + ");";
    
    var gradientDisabledBg = "background-image: -webkit-linear-gradient(top, " + 
    							toHex(panelBackgroundColor, 15) + " , " + toHex(panelBackgroundColor, 5) + ");";
    
    var boxShadow = "-webkit-box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4), 0 1px 1px rgba(0, 0, 0, 0.2);";
    var boxActiveShadow = "-webkit-box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.6);";
    
    var isPanelThemeLight = panelBackgroundColor.red > 127;
    var fontColor, disabledFontColor;
    var borderColor;
    var inputBackgroundColor;
    var gradientHighlightBg;
    
    if(isPanelThemeLight) 
    {
    	fontColor = "#000000;";
    	disabledFontColor = "color:" + toHex(panelBackgroundColor, -70) + ";";
    	borderColor = "border-color: " + toHex(panelBackgroundColor, -90) + ";";
    	inputBackgroundColor = toHex(panelBackgroundColor, 54) + ";";
    	gradientHighlightBg = "background-image: -webkit-linear-gradient(top, " + 
    							toHex(panelBackgroundColor, -40) + " , " + toHex(panelBackgroundColor,-50) + ");";
    } 
    else 
    {
    	fontColor = "#ffffff;";
    	disabledFontColor = "color:" + toHex(panelBackgroundColor, 100) + ";";
    	borderColor = "border-color: " + toHex(panelBackgroundColor, -45) + ";";
    	inputBackgroundColor = toHex(panelBackgroundColor, -20) + ";";
    	gradientHighlightBg = "background-image: -webkit-linear-gradient(top, " + 
    							toHex(panelBackgroundColor, -20) + " , " + toHex(panelBackgroundColor, -30) + ");";
    }
    

    //Update the default text style with pp values
    
    addRule(styleId, ".default", "font-size:" + appSkinInfo.baseFontSize + "px" + 
				"; color:" + fontColor + "; background-color:" + toHex(panelBackgroundColor) + ";");
    
    addRule(styleId, "button, select, input[type=text], input[type=button], input[type=submit]", borderColor);    
    addRule(styleId, "button, select, input[type=button], input[type=submit]", gradientBg);    
    addRule(styleId, "button, select, input[type=button], input[type=submit]", boxShadow);
    addRule(styleId, "button:enabled:active, input[type=button]:enabled:active, input[type=submit]:enabled:active", gradientHighlightBg);
    addRule(styleId, "button:enabled:active, input[type=button]:enabled:active, input[type=submit]:enabled:active", boxActiveShadow);
    addRule(styleId, "[disabled]", gradientDisabledBg);
    addRule(styleId, "[disabled]", disabledFontColor);
    addRule(styleId, "input[type=text]", "padding:1px 3px;");
    addRule(styleId, "input[type=text]", "background-color: " + inputBackgroundColor) + ";";
    addRule(styleId, "input[type=text]:focus", "background-color: #ffffff;");
    addRule(styleId, "input[type=text]:focus", "color: #000000;");
}

/**
 * FunctionName	: addRule()
 * Description	: Apply style to the UI component passed.
 * */
function addRule(stylesheetId, selector, rule) 
{
    var stylesheet = document.getElementById(stylesheetId);
    
    if(stylesheet) 
    {
    	stylesheet = stylesheet.sheet;
    	
    	if(stylesheet.addRule)
    		stylesheet.addRule(selector, rule);
    	else if(stylesheet.insertRule )
    		stylesheet.insertRule(selector + ' { ' + rule + ' }', stylesheet.cssRules.length);
	}
}

/**
 * FunctionName	: reverseColor()
 * Description	: Reverse the value of given color.
 * */
function reverseColor(color, delta) 
{
	return toHex({red:Math.abs(255-color.red), green:Math.abs(255-color.green), blue:Math.abs(255-color.blue)}, delta);
}

/**
 * FunctionName	: toHex()
 * Description	: Convert the Color object to string in hexadecimal format.
 * */
function toHex(color, delta) 
{
    function computeValue(value, delta) 
    {
        var computedValue = !isNaN(delta) ? value + delta : value;
        if (computedValue < 0) 
        {
            computedValue = 0;
        } 
        else if (computedValue > 255) 
        {
            computedValue = 255;
        }

        computedValue = computedValue.toString(16);
        return computedValue.length == 1 ? "0" + computedValue : computedValue;
    }

    var hex = "";
    if (color) 
    {
        with (color) 
        {
             hex = computeValue(red, delta) + computeValue(green, delta) + computeValue(blue, delta);
        };
    }
    return "#" + hex;
}

/**
 * FunctionName	: onAppThemeColorChanged()
 * Description	: This function is called when host application theme changes.
 * */
function onAppThemeColorChanged(event) 
{
    // Should get a latest HostEnvironment object from application.
    var skinInfo = JSON.parse(window.__adobe_cep__.getHostEnvironment()).appSkinInfo;
    // Gets the style information such as color info from the skinInfo, 
    // and redraw all UI controls of your extension according to the style info.
    updateThemeWithAppSkinInfo(skinInfo);
} 

/**
 * FunctionName	: loadFontsToList()
 * Description	: This is a callback function which takes the font list from jsx and load the list to the font combo-box of fourth tab.
 * */
function loadFontsToList(result)
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
