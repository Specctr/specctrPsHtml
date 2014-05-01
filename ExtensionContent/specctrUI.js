/*
File-Name: specctrUI.js
Description: Includes all the methods related to UI component like change event handlers, click event handlers etc. 
*/

/**
 * FunctionName	: tab_clickHandler()
 * Description	: Click event handler of tabs. Modify styles to tabs and call the function to change images on tab.
 * */
function tab_clickHandler() 
{
	try
	{
		var ident = this.id.split("_")[1];
	    var current = this.parentNode.getAttribute("data-current");
	    
	    //Remove class of active tab header and hide old contents
	    var currentTabHeader = document.getElementById("tabHeader_" + current);
	    var currentTabPage = document.getElementById("tabpage_" + current);
	    
	    if(currentTabHeader && currentTabPage && (ident >= '1' && ident <= '4'))
    	{
	    	currentTabHeader.removeAttribute("class");
	    	currentTabPage.style.display = "none";
    	}
	    else
		{
	    	return false;
    	}
	
	    //Set Image of Active Tab
	    changeImagesOfTabs(parseInt(ident));
	
	    //Set class of active tab
	    this.setAttribute("class", "tabActiveHeader");
	    
	    document.getElementById("tabpage_" + ident).style.display = "block";
	    this.parentNode.setAttribute("data-current", ident);
	}
	catch(e)
	{
		alert(e);
		return false;
	}
	
	return true;
}

/**
 * FunctionName	: changeImagesOfTabs()
 * Description	: Change the images of tabs on their selection.
 * */
function changeImagesOfTabs(selectedTab)
{
	try
	{
		var isImageChanged = true;
		
		var tab1Image = document.getElementById("tabImage_1");
	    var tab2Image = document.getElementById("tabImage_2");
	    var tab3Image = document.getElementById("tabImage_3");
	    var tab4Image = document.getElementById("tabImage_4");
	    
	    switch(selectedTab) 
	    {
	        case 1: 
	        	tab1Image.src = "Images/Icon_main_active.png";
	        	tab2Image.src = "Images/Icon_settings.png";
	        	tab3Image.src = "Images/Icon_responsive.png";
	        	tab4Image.src = "Images/Icon_prefs.png";
	            break;
	        
	        case 2: 
	        	tab1Image.src = "Images/Icon_main.png";
	        	tab2Image.src = "Images/Icon_settings_active.png";
	        	tab3Image.src = "Images/Icon_responsive.png";
	        	tab4Image.src = "Images/Icon_prefs.png";
	            break;
	        
	        case 3:
	        	tab1Image.src = "Images/Icon_main.png";
	        	tab2Image.src = "Images/Icon_settings.png";
	        	tab3Image.src = "Images/Icon_responsive_active.png";
	        	tab4Image.src = "Images/Icon_prefs.png";
	            break;
	            
	        case 4: 
	        	tab1Image.src = "Images/Icon_main.png";
	        	tab2Image.src = "Images/Icon_settings.png";
	        	tab3Image.src = "Images/Icon_responsive.png";
	        	tab4Image.src = "Images/Icon_prefs_active.png";
	        	break;
	        	
        	default:
        		isImageChanged = false;
	    } 
	    
	}
	catch(e)
	{
		isImageChanged = false;
	}
	
	return isImageChanged;
}

/**
 * FunctionName	: shapeFill_changeHandler()
 * Description	: Set the value of shape fill when changed.
 * */
function shapeFill_changeHandler()
{
	try
	{
		model.shapeFill = document.getElementById("shapeFill").checked;
	}
	catch(e)
	{
		console.log(e);	//For debugging.
	}
}
  
/**
 * FunctionName	: shapeStroke_changeHandler()
 * Description	: Set the value of stroke when changed.
 * */
function shapeStroke_changeHandler()
{
	try
	{
	model.shapeStroke = document.getElementById("shapeStroke").checked;
	}
	catch(e)
	{
		console.log(e);	//For debugging.
	}
}
	
/**
 * FunctionName	: shapeAlpha_changeHandler()
 * Description	: Set the value of alpha when changed.
 * */
function shapeAlpha_changeHandler()
{
	try
	{
	model.shapeAlpha = document.getElementById("shapeAlpha").checked;
	}
	catch(e)
	{
		console.log(e);	//For debugging.
	}
}

/**
 * FunctionName	: shapeEffects_changeHandler()
 * Description	: Set the value of gradient when changed.
 * */
function shapeEffects_changeHandler()
{
	try
	{
		model.shapeEffects = document.getElementById("shapeEffects").checked;
	}
	catch(e)
	{
		console.log(e);	//For debugging.
	}
}

/**
 * FunctionName	: shapeBorderRadius_changeHandler()
 * Description	: Set the value of border radius when changed.
 * */
function shapeBorderRadius_changeHandler()
{
	try
	{
		model.shapeBorderRadius = document.getElementById("shapeBorderRadius").checked;
	}
	catch(e)
	{
		console.log(e);	//For debugging.
	}
}

/**
 * FunctionName	: textFont_changeHandler()
 * Description	: Set the value of text font when changed.
 * */
function textFont_changeHandler()
{
	try
	{
		model.textFont = document.getElementById("textFont").checked;
	}
	catch(e)
	{
		console.log(e);	//For debugging.
	}
}

/**
 * FunctionName	: textSize_changeHandler()
 * Description	: Set the value of text size when changed.
 * */
function textSize_changeHandler()
{
	try
	{
		model.textSize = document.getElementById("textSize").checked;
	}
	catch(e)
	{
		console.log(e);	//For debugging.
	}
}

/**
 * FunctionName	: textColor_changeHandler()
 * Description	: Set the value of text color when changed.
 * */
function textColor_changeHandler()
{
	try
	{
		model.textColor = document.getElementById("textColor").checked;
	}
	catch(e)
	{
		console.log(e);	//For debugging.
	}
}

/**
 * FunctionName	: textStyle_changeHandler()
 * Description	: Set the value of text style when changed.
 * */
function textStyle_changeHandler()
{
	try
	{
		model.textStyle = document.getElementById("textStyle").checked;
	}
	catch(e)
	{
		console.log(e);	//For debugging.
	}
}

/**
 * FunctionName	: textAlignment_changeHandler()
 * Description	: Set the value of text alignment when changed.
 * */
function textAlignment_changeHandler()
{
	try
	{
		model.textAlignment = document.getElementById("textAlignment").checked;
	}
	catch(e)
	{
		console.log(e);	//For debugging.
	}
}

/**
 * FunctionName	: textLeading_changeHandler()
 * Description	: Set the value of text leading when changed.
 * */
function textLeading_changeHandler()
{
	try
	{
		model.textLeading = document.getElementById("textLeading").checked;
	}
	catch(e)
	{
		console.log(e);	//For debugging.
	}
}

/**
 * FunctionName	: textTracking_changeHandler()
 * Description	: Set the value of text tracking when changed.
 * */
function textTracking_changeHandler()
{
	try
	{
		model.textTracking = document.getElementById("textTracking").checked;
	}
	catch(e)
	{
		console.log(e);	//For debugging.
	}
}

/**
 * FunctionName	: shapeFillStyle_changeHandler()
 * Description	: Set the value of style when changed.
 * */
function textAlpha_changeHandler()
{
	try
	{
		model.textAlpha = document.getElementById("textAlpha").checked;
	}
	catch(e)
	{
		console.log(e);	//For debugging.
	}
}

 /**
  * FunctionName	: textEffects_changeHandler()
  * Description	: Set the value of effects when changed.
  * */
function textEffects_changeHandler()
{
	try
	{
		model.textEffects = document.getElementById("textEffects").checked;
	}
	catch(e)
	{
		console.log(e);	//For debugging.
	}
}
 
 /**
 * FunctionName	: canvasExpandSize_changeHandler()
 * Description	: Set the value of canvasExpandSize when changed.
 * */
function canvasExpandSize_changeHandler()
{
	try
	{
		model.canvasExpandSize = Number(document.getElementById("canvasExpandSize").value);
	}
	catch(e)
	{
		console.log(e);	//For debugging.
	}
}

/**
 * FunctionName	: chkDistanceSpec_changeHandler()
 * Description	: Enable/Disable the width and height text boxes and set the value of model's specInPrcntg when changed.
 * */
function chkDistanceSpec_changeHandler()
{
	try
	{
		model.specInPrcntg = document.getElementById("chkDistanceSpec").checked;
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
	}
	catch(e)
	{
		alert(e);
	}
}

/**
 * FunctionName	: chkEmSpec_changeHandler()
 * Description	: Enable/Disable the baseFontSize and baseLineHeight text boxes and set the value of model's specInEM when changed.
 * */
function chkEmSpec_changeHandler()
{
	try
	{
		var textFontSize = document.getElementById("txtFontSize");
		var textBaseLineHeight = document.getElementById("txtBaseLineHeight");
		model.specInEM = document.getElementById("chkEmSpec").checked;
		
		if(model.specInEM)
		{
			enableTextField(textFontSize);
			enableTextField(textBaseLineHeight);
		}
		else
		{
			disableTextField(textFontSize);
			disableTextField(textBaseLineHeight);
			return;
		}
		
		if (textFontSize.value.length == 0)
			textFontSize.value = "16";
		
		if (textBaseLineHeight.value.length == 0)
		{
			textBaseLineHeight.value = Number(Math.round(Number(textFontSize.value) * 140) / 100).toString();
			model.baseLineHeight = Number(textBaseLineHeight.value);
		}
	}
	catch(e)
	{
		alert(e);
	}
}

/**
 * FunctionName	: chkEmSpec_changeHandler()
 * Description	: Set the value of model's rltvWidth when changed.
 * */
function txtWidth_changeHandler()
{
	try
	{
		model.rltvWidth = Number(document.getElementById("txtWidth").value);
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: txtHeight_changeHandler()
 * Description	: Set the value of model's rltvHeight when changed.
 * */
function txtHeight_changeHandler() 
{
	try
	{
		model.rltvHeight = Number(document.getElementById("txtHeight").value);
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: txtFontSize_changeHandler()
 * Description	: Set the value of model's baseFontSize when changed.
 * */
function txtFontSize_changeHandler()
{
	try
	{
		model.baseFontSize = Number(document.getElementById("txtFontSize").value);
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: txtBaseLineHeight_changeHandler()
 * Description	: Set the value of model's baseLineHeight when changed.
 * */
function txtBaseLineHeight_changeHandler() 
{
	try
	{
		model.baseLineHeight = Number(document.getElementById("txtBaseLineHeight").value);
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: chkScaleBy_changeHandler()
 * Description	: Set the value of useScaleBy when changed.
 * */
 function chkScaleBy_changeHandler()
{
	model.useScaleBy	= document.getElementById("chkScaleBy").checked;
	
	if(model.useScaleBy)
	{
		enableTextField(document.getElementById("txtScaleBy"));
	}
	else
	{
		disableTextField(document.getElementById("txtScaleBy"));
	}
}

 /**
 * FunctionName	: txtScaleBy_changeHandler()
 * Description	: Allow the input greater than 1 only and set the value of scaleValue when changed.
 * */
function txtScaleBy_changeHandler()
{
	var scaleByHandler = document.getElementById("txtScaleBy");
	var firstChar = scaleByHandler.value.charAt(0);
	
	//if first character is other than 'x', 'X' or '/' then empty the text box.
	if (!(firstChar == "x" || firstChar == "/" || firstChar == "X"))
		scaleByHandler.value = "";
	
	//Restrict the text inputs to satisfy the values like x1, x2, /1, /2 etc.
						
	model.scaleValue = scaleByHandler.value;
}

/**
 * FunctionName	: rgbRadioButton_clickHandler()
 * Description	: Set the value of legendColorMode when selection of radio button changed.
 * */
 function rgbRadioButton_clickHandler()
 {
	 model.legendColorMode	= document.getElementById("rgbRadioButton").value;
 }
 
 /**
  * FunctionName	: hsbRadioButton_clickHandler()
  * Description	: Set the value of legendColorMode when selection of radio button changed.
  * */
 function hsbRadioButton_clickHandler()
 {
	 model.legendColorMode	= document.getElementById("hsbRadioButton").value;
 }
 
 /**
  * FunctionName	: cmykRadioButton_clickHandler()
  * Description	: Set the value of legendColorMode when selection of radio button changed.
  * */
 function cmykRadioButton_clickHandler()
 {
	 model.legendColorMode	= document.getElementById("cmykRadioButton").value;
 }

 /**
  * FunctionName	: hslRadioButton_clickHandler()
  * Description	: Set the value of legendColorMode when selection of radio button changed.
  * */
 function hslRadioButton_clickHandler()
 {
	 model.legendColorMode	= document.getElementById("hslRadioButton").value;
 }
 
 /**
 * FunctionName	: chkDisplayRGBAsHex_changeHandler()
 * Description	: Set the value of useHexColor when changed.
 * */
function chkDisplayRGBAsHex_changeHandler()
{
	model.useHexColor = document.getElementById("chkDisplayRGBAsHex").checked;
}

/**
 * FunctionName	: lstSize_changeHandler()
 * Description	: Set the value of font size when changed.
 * */
function lstSize_changeHandler()
{
	var fontSizeHandler = document.getElementById("lstSize");
	model.legendFontSize = Number(fontSizeHandler.options[fontSizeHandler.selectedIndex].value);
}

/**
 * FunctionName	: lstLineWeight_changeHandler()
 * Description	: Set the value of armWeight when changed.
 * */
function lstLineWeight_changeHandler()
{
	var armWeightHandler = document.getElementById("lstLineWeight");
	model.armWeight = Number(armWeightHandler.options[armWeightHandler.selectedIndex].value);
}

/**
 * FunctionName	: lstFont_changeHandler()
 * Description	: Set the value of font when changed.
 * */
function lstFont_changeHandler()
{
	var fontListHandler = document.getElementById("lstFont");
	model.legenFontIndex = Number(fontListHandler.options[fontListHandler.selectedIndex].value);
	mdoel.legendFont = fontListHandler.options[fontListHandler.selectedIndex].text;
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
	
	//Select the font from the legendFont value and apply it.
	var listLength = fontListHandler.option.length;
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