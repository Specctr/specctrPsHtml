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
 * FunctionName	: chkScaleBy_clickHandler()
 * Description	: Set the value of useScaleBy when changed.
 * */
function chkScaleBy_clickHandler()
{
	try
	{
		model.useScaleBy	= document.getElementById("chkScaleBy").checked;
			
		if(model.useScaleBy)
			enableTextField(document.getElementById("txtScaleBy"));
		else
			disableTextField(document.getElementById("txtScaleBy"));
		
	 }
	 catch(e)
	 {
		 console.log(e);
	 }
	
}

 /**
 * FunctionName	: txtScaleBy_changeHandler()
 * Description	: Allow the input greater than 1 only and set the value of scaleValue when changed.
 * */
function txtScaleBy_changeHandler()
{
	try
	{
		var scaleByHandler = document.getElementById("txtScaleBy");
		var firstChar = scaleByHandler.value.charAt(0);
		
		//if first character is other than 'x', 'X' or '/' then empty the text box.
		if (!(firstChar == "x" || firstChar == "/" || firstChar == "X"))
			scaleByHandler.value = "";
		
		//Restrict the text inputs to satisfy the values like x1, x2, /1, /2 etc.
		model.scaleValue = scaleByHandler.value;
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: radioButton_clickHandler()
 * Description	: Set the value of legendColorMode when selection of radio button changed.
 * */
 function radioButton_clickHandler(event)
 {
	 try
	 {
		 var colorMode = event.target.value;
		 if(colorMode != undefined)
			 model.legendColorMode	= colorMode;
	 }
	 catch(e)
	 {
		 console.log(e);
	 }
 }
 
 /**
 * FunctionName	: chkDisplayRGBAsHex_clickHandler()
 * Description	: Set the value of useHexColor when changed.
 * */
function chkDisplayRGBAsHex_clickHandler()
{
	try
	 {
		model.useHexColor = document.getElementById("chkDisplayRGBAsHex").checked;
	 }
	 catch(e)
	 {
		 console.log(e);
	 }
}

/**
 * FunctionName	: lstSize_changeHandler()
 * Description	: Set the value of font size when changed.
 * */
function lstSize_changeHandler()
{
	try
	 {
		var fontSizeHandler = document.getElementById("lstSize");
		model.legendFontSize = Number(fontSizeHandler.options[fontSizeHandler.selectedIndex].value);
	 }
	 catch(e)
	 {
		 console.log(e);
	 }
}

/**
 * FunctionName	: lstLineWeight_changeHandler()
 * Description	: Set the value of armWeight when changed.
 * */
function lstLineWeight_changeHandler()
{
	try
	 {
		var armWeightHandler = document.getElementById("lstLineWeight");
		model.armWeight = Number(armWeightHandler.options[armWeightHandler.selectedIndex].value);
	 }
	 catch(e)
	 {
		 console.log(e);
	 }
}

/**
 * FunctionName	: lstFont_changeHandler()
 * Description	: Set the value of font when changed.
 * */
function lstFont_changeHandler()
{
	try
	{
		var fontListHandler = document.getElementById("lstFont");
		model.legenFontIndex = Number(fontListHandler.options[fontListHandler.selectedIndex].value);
		model.legendFont = fontListHandler.options[fontListHandler.selectedIndex].text;
	}
	catch(e)
	{
		alert(e);
	}
}

/**
 * FunctionName	: restrictInputToDecimal()
 * Description	: Restrict the text input to decimal value.
 * */
function restrictInputToDecimal(event)
{
	try
	{
		var charCode = (event.which) ? event.which : event.keyCode;
		
		if(charCode == 48 && !event.srcElement.value.length)
			return false;
		
		if (charCode == 46 && event.srcElement.value.split('.').length>1)
	        return false;
	    
	    if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
	        return false;
	    
	    return true;
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: setTextToShapeColor()
 * Description	: Set the color value to the textbox of the shape color-picker dropdown on hovering the color blocks.
 * */
function setTextToShapeColor(element)
{
	try
	{
		document.getElementById("txtShapeColor").value = element.title;
		document.getElementById("shapeColorBlock").style.backgroundColor = "#" + element.title; 
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: setColorToShapeColor()
 * Description	: Set the color to the shape color on clicking any color block and close the dropdown.
 * */
function setColorToShapeColor(element)
{
	try
	{
		var color = "#" + element.title;
		document.getElementById("colShape").style.backgroundColor = color;
		$('#colorShapeDropDown').slideUp(100);
		model.legendColorObject = color;
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: colShape_clickHandler()
 * Description	: Click handler of shape color-picker. Toggle the dropdown and set the color to 
 * the main color block in color picker.
 * */
function colShape_clickHandler()
{
	try
	{
		var shapeColor = document.getElementById("colShape").style.backgroundColor;
		shapeColor = rgbToHex(shapeColor);
		$('#colorShapeDropDown').slideToggle(100);
		document.getElementById("shapeColorBlock").style.backgroundColor = shapeColor;
		model.legendColorObject = shapeColor;
		$('#colorSpaceDropDown').slideUp(100);
		$('#colorTypeDropDown').slideUp(100);
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: setTextToTypeColor()
 * Description	: Set the color value to the textbox of the type color-picker dropdown on hovering the color blocks.
 * */
function setTextToTypeColor(element)
{
	try
	{
		document.getElementById("txtTypeColor").value = element.title;
		document.getElementById("typeColorBlock").style.backgroundColor = "#" + element.title; 
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: setColorToTypeColor()
 * Description	: Set the color to the type color on clicking any color block and close the dropdown.
 * */
function setColorToTypeColor(element)
{
	try
	{
		var color = "#" + element.title;
		document.getElementById("colType").style.backgroundColor = color;
		model.legendColorType = color;
		$('#colorTypeDropDown').slideUp(100);
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: colType_clickHandler()
 * Description	: Click handler of type color-picker. Toggle the dropdown and set the color to 
 * the main color block in color picker.
 * */
function colType_clickHandler()
{
	try
	{
		var typeColor = document.getElementById("colType").style.backgroundColor;
		typeColor = rgbToHex(typeColor);
		$('#colorTypeDropDown').slideToggle(100);
		document.getElementById("typeColorBlock").style.backgroundColor = typeColor;
		model.legendColorType = typeColor;
		$('#colorSpaceDropDown').slideUp(100);
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: setTextToSpacingColor()
 * Description	: Set the color value to the textbox of the spacing color-picker dropdown on hovering the color blocks.
 * */
function setTextToSpacingColor(element)
{
	try
	{
		document.getElementById("txtSpaceColor").value = element.title;
		document.getElementById("spaceColorBlock").style.backgroundColor = "#" + element.title; 
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: setColorToSpacingColor()
 * Description	: Set the color to the spacing color on clicking any color block and close the dropdown.
 * */
function setColorToSpacingColor(element)
{
	try
	{
		var color = "#" + element.title;
		document.getElementById("colSpacing").style.backgroundColor = color;
		model.legendColorSpacing = color;
		$('#colorSpaceDropDown').slideUp(100);
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: colSpacing_clickHandler()
 * Description	: Click handler of spacing color-picker. Toggle the dropdown and set the color to 
 * the main color block in color picker.
 * */
function colSpacing_clickHandler()
{
	try
	{
		var spaceColor = document.getElementById("colSpacing").style.backgroundColor;
		spaceColor = rgbToHex(spaceColor);
		$('#colorSpaceDropDown').slideToggle(100);
		document.getElementById("spaceColorBlock").style.backgroundColor = spaceColor;
		model.legendColorSpacing = spaceColor;
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
 * FunctionName	: rgbToHex()
 * Description	: Convert the rgb value into hex.
 * */
function rgbToHex(colorVal) 
{
	try
	{
		var parts = colorVal.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
	    delete(parts[0]);
		for (var i = 1; i <= 3; ++i)
		{
			parts[i] = parseInt(parts[i]).toString(16);
		    if (parts[i].length == 1) parts[i] = '0' + parts[i];
		}
		
		var color = '#' + parts.join('');
	    return color;
	}
	catch(e)
	{
		console.log(e);
	}
	
	return colorVal;
}