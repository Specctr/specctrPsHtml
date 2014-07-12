/*
File-Name: specctrUI.js
Description: Includes all the methods related to UI component like change event handlers, click event handlers etc. 
 */

/**
 * FunctionName	: activateButton_clickHandler()
 * Description	: Validate the license of the user and move to the tab container if user's credentials valid.
 * */
function activateButton_clickHandler()
{
	var urlRequest;

	// Get Extension Id and matching productCode.
	var productCodes = {
        "SpecctrPs-Pro":"31265",
        "SpecctrPs-10":"31279",
        "SpecctrPs-20":"31280",
        "SpecctrPs-30":"31281",
        "SpecctrPs-Site":"31282"
    };

	var csInterface = new CSInterface();
	var extensionId = csInterface.getExtensionID();

	//If no installed extension is matched with productCodes values.
	if(!extensionId)
	{
		alert("Incorrect product code!");
		return;
	}

	urlRequest = "http://specctr-license.herokuapp.com";
	urlRequest += "?product=" + productCodes[extensionId];
	urlRequest += "&license=" + document.getElementById("license").value;
	urlRequest += "&email=" + document.getElementById("emailInput").value;

	$.get(urlRequest, completeHandler);		
}

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

		if(currentTabHeader && currentTabPage && (ident >= "1" && ident <= "3"))
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
		console.log(e);
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
		var tab3ImagePath = "../Images/Icon_prefs";
		var imageExtension = ".png";
		var activeImageEndString = "_active" + imageExtension;

		var isImageChanged = true;
		var tab1Image = document.getElementById("tabImage_1");
		var tab2Image = document.getElementById("tabImage_2");
		var tab3Image = document.getElementById("tabImage_3");

		switch(selectedTab) 
		{
		case 1: 
			tab1Image.src = tab1ImagePath + activeImageEndString;
			tab2Image.src = tab2ImagePath + imageExtension;
			tab3Image.src = tab3ImagePath + imageExtension;
			break;

		case 2: 
			tab1Image.src = tab1ImagePath + imageExtension;
			tab2Image.src = tab2ImagePath + activeImageEndString;
			tab3Image.src = tab3ImagePath + imageExtension;
			break;

		case 3:
			tab1Image.src = tab1ImagePath + imageExtension;
			tab2Image.src = tab2ImagePath + imageExtension;
			tab3Image.src = tab3ImagePath + activeImageEndString;
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
		console.log(e);
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
		
		if(element.title)
		{
			var color = "#" + element.title;
		}
		else
		{
			color = document.getElementById(element.id).style.backgroundColor;
			color = rgbToHex(color);
		}
			
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
		var colorBlockTextbox = "#txt" + colorPickerBlock + "Color";
		var dropDownBlock = "#color" + colorPickerBlock + "DropDown";
		var colorBlock = colorPickerBlock.toLowerCase() + "ColorBlock";
		var valueForTextBox = "";

		var color = document.getElementById(elementId).style.backgroundColor;
		color = rgbToHex(color);
		$(dropDownBlock).slideToggle(100);
		document.getElementById(colorBlock).style.backgroundColor = color;
		
		if(color[0] == "#")
			valueForTextBox = color.substring(1);
		else
			valueForTextBox = color;
		
		$(colorBlockTextbox).val(valueForTextBox.toUpperCase());

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

function colorPickerTextInput_validation(event)
{
	var charCode = (event.which) ? event.which : event.keyCode;

	if((charCode < 48 && charCode != 8) || (charCode > 57 && charCode < 65)
			|| (charCode > 70 && charCode < 97) || (charCode > 102))
	{
		return false;
	}
	else
	{
		return true;
	}
}

/**
 * FunctionName	: colorPickerTextInput_clickHandler()
 * Description	: Change the color on text input in color picker block .
 * */
function colorPickerTextInput_clickHandler(colorPickerBlock)
{
	var elementId = "txt" + colorPickerBlock + "Color";
	var textBox = document.getElementById(elementId);
	var color = textBox.value;

	for(var i = color.length; i <= 5; i++)
		color += "0";

	color = "#" + color;
	
	var colorBlock = colorPickerBlock.toLowerCase() + "ColorBlock";
	document.getElementById(colorBlock).style.backgroundColor = color;
}

/**
 * FunctionName	: text_KeyDownHandler()
 * Description	: Dispatch the click event of activeButton.
 * */
function text_KeyDownHandler(event)
{
	try
	{
		if(event.keyCode == 13) 
			document.getElementById("activateButton").click();
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
