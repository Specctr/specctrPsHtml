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

		if(currentTabHeader && currentTabPage && (ident >= "1" && ident <= "4"))
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
		var tab1ImagePath = "../Images/Icon_main";
		var tab2ImagePath = "../Images/Icon_settings";
		var tab3ImagePath = "../Images/Icon_responsive";
		var tab4ImagePath = "../Images/Icon_prefs";
		var activeImageEndString = "_active.png";
		var imageExtension = ".png";

		var isImageChanged = true;
		var tab1Image = document.getElementById("tabImage_1");
		var tab2Image = document.getElementById("tabImage_2");
		var tab3Image = document.getElementById("tabImage_3");
		var tab4Image = document.getElementById("tabImage_4");

		switch(selectedTab) 
		{
		case 1: 
			tab1Image.src = tab1ImagePath + activeImageEndString;
			tab2Image.src = tab2ImagePath + imageExtension;
			tab3Image.src = tab3ImagePath + imageExtension;
			tab4Image.src = tab4ImagePath + imageExtension;
			break;

		case 2: 
			tab1Image.src = tab1ImagePath + imageExtension;
			tab2Image.src = tab2ImagePath + activeImageEndString;
			tab3Image.src = tab3ImagePath + imageExtension;
			tab4Image.src = tab4ImagePath + imageExtension;
			break;

		case 3:
			tab1Image.src = tab1ImagePath + imageExtension;
			tab2Image.src = tab2ImagePath + imageExtension;
			tab3Image.src = tab3ImagePath + activeImageEndString;
			tab4Image.src = tab4ImagePath + imageExtension;
			break;

		case 4: 
			tab1Image.src = tab1ImagePath + imageExtension;
			tab2Image.src = tab2ImagePath + imageExtension;
			tab3Image.src = tab3ImagePath + imageExtension;
			tab4Image.src = tab4ImagePath + activeImageEndString;
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
 * FunctionName	: checkBox_changeHandler()
 * Description	: Set the value of checkBox model value when changed.
 * */
function checkBox_changeHandler(checkBoxId)
{
	try
	{
		model[checkBoxId] = document.getElementById(checkBoxId).checked;
	}
	catch(e)
	{
		console.log(e);	//For debugging.
	}
}

/**
 * FunctionName	: textBox_changeHandler()
 * Description	: Set the model value of text box when changed.
 * */
function textBox_changeHandler(textBoxId)
{
	try
	{
		model[textBoxId] = Number(document.getElementById(textBoxId).value);
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
			enableTextField(document.getElementById("relativeWidth"));
			enableTextField(document.getElementById("relativeHeight"));
		}
		else
		{
			disableTextField(document.getElementById("relativeWidth"));
			disableTextField(document.getElementById("relativeHeight"));
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
		var textFontSize = document.getElementById("baseFontSize");
		var textBaseLineHeight = document.getElementById("baseLineHeight");
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

		if(textFontSize.value.length == 0)
			textFontSize.value = "16";

		if(textBaseLineHeight.value.length == 0)
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
		if(!(firstChar == "x" || firstChar == "/" || firstChar == "X"))
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
 * FunctionName	: comboBox_changeHandler()
 * Description	: Set the value of font size when changed.
 * */
function comboBox_changeHandler(elementId, modelValue)
{
	try
	{
		var comboHandler = document.getElementById(elementId);
		model[modelValue] = Number(comboHandler.options[comboHandler.selectedIndex].value);
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
 * FunctionName	: setColorValueToTextBox()
 * Description	: Set color value to the color-picker dropdown's input text on hovering the color blocks.
 * */
function setColorValueToTextBox(element, colorPickerBlock)
{
	try
	{
		var inputTextName = "txt" + colorPickerBlock + "Color";
		var blockName = colorPickerBlock.toLowerCase() + "ColorBlock";

		document.getElementById(inputTextName).value = element.title;
		document.getElementById(blockName).style.backgroundColor = "#" + element.title; 
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: setColorToLabel()
 * Description	: Set color to the color picker's label on clicking any color block and close the dropdown.
 * */
function setColorToLabel(element, colorPickerBlock)
{
	try
	{
		var labelName = "col" + colorPickerBlock;
		var value = "legendColor" + colorPickerBlock;
		var color = "#" + element.title;

		document.getElementById(labelName).style.backgroundColor = color;
		$("#" + element.parentNode.id).slideUp(100);
		model[value] = color;
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: colObject_clickHandler()
 * Description	: Click handler of shape color-picker. Toggle the dropdown and set the color to 
 * the main color block in color picker.
 * */
function colorPicker_clickHandler(elementId, colorPickerBlock)
{
	try
	{
		var dropDownBlock = "#color" + colorPickerBlock + "DropDown";
		var colorBlock = colorPickerBlock.toLowerCase() + "ColorBlock";

		var color = document.getElementById(elementId).style.backgroundColor;
		color = rgbToHex(color);
		$(dropDownBlock).slideToggle(100);
		document.getElementById(colorBlock).style.backgroundColor = color;

		if(colorPickerBlock == "Shape")
		{
			model.legendColorObject = color;
			$("#colorSpaceDropDown").slideUp(100);
			$("#colorTypeDropDown").slideUp(100);
		}
		else if(colorPickerBlock == "Type")
		{
			model.legendColorType = color;
			$("#colorSpaceDropDown").slideUp(100);
		}
		else
		{
			model.legendColorSpacing = color;
		}
	}
	catch(e)
	{
		console.log(e);
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

		if(charCode == 46 && event.srcElement.value.split(".").length>1)
			return false;

		if(charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
			return false;

		return true;
	}
	catch(e)
	{
		console.log(e);
	}
}
