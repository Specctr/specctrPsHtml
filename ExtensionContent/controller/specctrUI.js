/*
File-Name: specctrUI.js
Description: Includes all the methods related to UI component like change event handlers, click event handlers etc. 
 */

/**
 * Validate the license of the user and move to the tab container
 *  if user's credentials valid.
 */
function activateButton_clickHandler() {
	// Get Extension Id and matching productCode.
	var productCodes = {
		// Photoshop 2.0.
		"SpecctrPs-Pro" : "63221",
		"SpecctrPs-10" : "63222",
		"SpecctrPs-20" : "63223",
		"SpecctrPs-30" : "63224",
		"SpecctrPs-Site" : "63225",

		// Illustrator 2.0.
		"SpecctrPro" : "63233",
		"SpecctrBusiness10" : "63235",
		"SpecctrBusiness20" : "63236",
		"SpecctrBusiness30" : "63237",
		"SpecctrBusinessSite" : "63238",

		// Indesign 2.0.
		"Specctr-Pro-ID" : "63240",
		"Specctr-Business-10" : "63241",
		"Specctr-Business-20" : "63242",
		"Specctr-Business-30" : "63243",
		"Specctr-Business-Site" : "63244"
	};

	var csInterface = new CSInterface();
	var extensionId = csInterface.getExtensionID();
	var logData = "";

	// If no installed extension is matched with productCodes values.
	if (!productCodes[extensionId]) {
		logData = createLogData("Incorrect product code");
		addFileToPreferenceFolder('.log', logData);	//Create log file.
		return;
	}

	var urlRequest = "http://specctr-license.herokuapp.com";
	urlRequest += "?product=" + productCodes[extensionId];
	urlRequest += "&license=" + document.getElementById("license").value;
	urlRequest += "&email=" + document.getElementById("emailInput").value;

	$.get(urlRequest, completeHandler).error(function() {
		logData = createLogData("No connection available");
		addFileToPreferenceFolder('.log', logData);	//Create log file.
	});
}

/**
 * Click event handler of tabs. Modify styles to tabs and 
 * call the function to change images on tab.
 */
function tab_clickHandler() {
	try {
		var ident = this.id.split("_")[1];
		var current = this.parentNode.getAttribute("data-current");

		// Remove class of active tab header and hide old contents
		var currentTabHeader = document.getElementById("tabHeader_" + current);
		var currentTabPage = document.getElementById("tabpage_" + current);

		if (currentTabHeader && currentTabPage
				&& (ident >= "1" && ident <= "4")) {
			currentTabHeader.removeAttribute("class");
			currentTabPage.style.display = "none";
		} else {
			return false;
		}

		// Set Image of Active Tab
		changeImagesOfTabs(parseInt(ident));

		// Set class of active tab
		this.setAttribute("class", "tabActiveHeader");

		document.getElementById("tabpage_" + ident).style.display = "block";
		this.parentNode.setAttribute("data-current", ident);
	} catch (e) {
		console.log(e);
		return false;
	}

	return true;
}

/**
 * Change the images of tabs on their selection.
 * @param selectedTab {number} The position of selected tab.
 */
function changeImagesOfTabs(selectedTab) {
	try {
		var tab1ImagePath = "../Images/Icon_main";
		var tab2ImagePath = "../Images/Icon_settings";
		var tab3ImagePath = "../Images/Icon_responsive";
		var tab4ImagePath = "../Images/Icon_prefs";
		var imageExtension = ".png";
		var activeImageEndString = "_active" + imageExtension;

		var isImageChanged = true;
		var tab1Image = document.getElementById("tabImage_1");
		var tab2Image = document.getElementById("tabImage_2");
		var tab3Image = document.getElementById("tabImage_3");
		var tab4Image = document.getElementById("tabImage_4");

		switch (selectedTab) {
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

	} catch (e) {
		isImageChanged = false;
	}

	return isImageChanged;
}

/**
 * Set the value of checkBox model value when changed.
 * @param checkBoxId {string} The id of selected checkbox.
 */
function checkBox_changeHandler(checkBoxId) {
	model[checkBoxId] = document.getElementById(checkBoxId).checked;
	writeAppPrefs();
}

/**
 * Set the model value of text box when changed.
 * @param textBoxId {string} The id of selected text box.
 */
function textBox_changeHandler(textBoxId) {
	model[textBoxId] = Number(document.getElementById(textBoxId).value);
}

/**
 * Enable/Disable the width and height text boxes and 
 * set the value of model's specInPrcntg when changed.
 */
function chkDistanceSpec_changeHandler() {
	model.specInPrcntg = document.getElementById("chkDistanceSpec").checked;
	if (model.specInPrcntg) {
		enableTextField(document.getElementById("relativeWidth"));
		enableTextField(document.getElementById("relativeHeight"));
	} else {
		disableTextField(document.getElementById("relativeWidth"));
		disableTextField(document.getElementById("relativeHeight"));
	}
	writeAppPrefs();
}

/**
 * Enable/Disable the baseFontSize and baseLineHeight text boxes and
 * set the value of model's specInEM when changed.
 */
function chkEmSpec_changeHandler() {
	var textFontSize = document.getElementById("baseFontSize");
	var textBaseLineHeight = document.getElementById("baseLineHeight");
	model.specInEM = document.getElementById("chkEmSpec").checked;
	writeAppPrefs();

	if (model.specInEM) {
		enableTextField(textFontSize);
		enableTextField(textBaseLineHeight);
	} else {
		disableTextField(textFontSize);
		disableTextField(textBaseLineHeight);
		return;
	}

	if (textFontSize.value.length == 0)
		textFontSize.value = "16";

	if (textBaseLineHeight.value.length == 0) {
		textBaseLineHeight.value = Number(
				Math.round(Number(textFontSize.value) * 140) / 100).toString();
		model.baseLineHeight = Number(textBaseLineHeight.value);
	}
}

/**
 * Set the value of useScaleBy when changed.
 */
function chkScaleBy_clickHandler() {
	model.useScaleBy = document.getElementById("chkScaleBy").checked;

	if (model.useScaleBy)
		enableTextField(document.getElementById("txtScaleBy"));
	else
		disableTextField(document.getElementById("txtScaleBy"));

	writeAppPrefs();
}

/**
 *Allow the input greater than 1 only and set the value of scaleValue when changed.
 */
function txtScaleBy_changeHandler() {
	var scaleByHandler = document.getElementById("txtScaleBy");
	var firstChar = scaleByHandler.value.charAt(0);

	// if first character is other than 'x', 'X' or '/' then empty the text box.
	if (!(firstChar == "x" || firstChar == "/" || firstChar == "X"))
		scaleByHandler.value = "";

	// Restrict the text inputs to satisfy the values like x1, x2, /1, /2 etc.
	model.scaleValue = scaleByHandler.value;
}

/**
 * Set the value of legendColorMode when selection of radio button changed.
 * @param event {event type} The event comes after clicking radio button.
 */
function radioButton_clickHandler(event) {
	var colorMode = event.target.value;
	if (colorMode === undefined)
		return;

	model.legendColorMode = colorMode;
	writeAppPrefs();
}

/**
 * Set the value of font size when changed.
 * @param elementId {string} The id of selected combobox.
 * @param modelValue {string} The combobox name.
 */
function comboBox_changeHandler(elementId, modelValue) {
	var comboHandler = document.getElementById(elementId);
	model[modelValue] = Number(comboHandler.options[comboHandler.selectedIndex].value);
	writeAppPrefs();
}

/**
 * Set the value of font when changed.
 */
function lstFont_changeHandler() {
	var fontListHandler = document.getElementById("lstFont");
	model.legenFontIndex = Number(fontListHandler.options[fontListHandler.selectedIndex].value);
	model.legendFont = fontListHandler.options[fontListHandler.selectedIndex].text;
	writeAppPrefs();
}

/**
 * Set color value to the color-picker dropdown's input text on hovering the color blocks.
 * @param element {object} The reference of color picker.
 * @param colorPickerBlock {string} The name of color picker block.
 */
function setColorValueToTextBox(element, colorPickerBlock) {
	var inputTextName = "txt" + colorPickerBlock + "Color";
	var blockName = colorPickerBlock.toLowerCase() + "ColorBlock";

	document.getElementById(inputTextName).value = element.title;
	document.getElementById(blockName).style.backgroundColor = "#"
			+ element.title;
}

/**
 * Set color to the color picker's label on clicking any color block and 
 * close the dropdown.
 * @param element {object} The reference of color picker.
 * @param colorPickerBlock {string} The name of color picker block.
 */
function setColorToLabel(element, colorPickerBlock) {
	var labelName = "col" + colorPickerBlock;
	var value = "legendColor" + colorPickerBlock;

	if (element.title) {
		var color = "#" + element.title;
	} else {
		color = document.getElementById(element.id).style.backgroundColor;
		color = rgbToHex(color);
	}

	document.getElementById(labelName).style.backgroundColor = color;
	$("#" + element.parentNode.id).slideUp(100);
	model[value] = color;
	writeAppPrefs();
}

/**
 * Click handler of shape color-picker. Toggle the dropdown and 
 * set the color to the main color block in color picker.
 * @param elementId {string} The id of color picker.
 * @param colorPickerBlock {string} The name of color picker block.
 */
function colorPicker_clickHandler(elementId, colorPickerBlock) {
	var colorBlockTextbox = "#txt" + colorPickerBlock + "Color";
	var dropDownBlock = "#color" + colorPickerBlock + "DropDown";
	var colorBlock = colorPickerBlock.toLowerCase() + "ColorBlock";
	var valueForTextBox = "";

	var color = document.getElementById(elementId).style.backgroundColor;
	color = rgbToHex(color);
	$(dropDownBlock).slideToggle(100);
	document.getElementById(colorBlock).style.backgroundColor = color;

	if (color[0] == "#")
		valueForTextBox = color.substring(1);
	else
		valueForTextBox = color;

	$(colorBlockTextbox).val(valueForTextBox.toUpperCase());

	if (colorPickerBlock == "Shape") {
		model.legendColorObject = color;
		$("#colorSpaceDropDown").slideUp(100);
		$("#colorTypeDropDown").slideUp(100);
	} else if (colorPickerBlock == "Type") {
		model.legendColorType = color;
		$("#colorSpaceDropDown").slideUp(100);
	} else {
		model.legendColorSpacing = color;
	}
}

/**
 * Validate the input value in text input of color picker block.
 * @param event {event type} The event dispatched after clicking text input.
 */
function colorPickerTextInput_validation(event) {
	var charCode = (event.which) ? event.which : event.keyCode;

	// Allows only hex value like eeffee or #eeffee.
	/*
	 * charCode = 8 : Enter key = 37 : Left arrow key = 39 : Right arrow key =
	 * 46 : Delete key
	 */
	if ((charCode < 48 && charCode != 8 && charCode != 37 && charCode != 39 && charCode != 46)
			|| (charCode > 57 && charCode < 65)
			|| (charCode > 70 && charCode < 97)
			|| (charCode > 102)
			|| (event.shiftKey && charCode != 51)) {
		return false;
	} else {
		return true;
	}
}

/**
 * Change the color on text input in color picker block.
 * @param event {event type} The keyDown event dispatched after pressing key
 * in textbox.
 * @param colorPickerBlock {string} The name of color picker block. 
 */
function colorPickerTextInput_clickHandler(event, colorPickerBlock) {
	var elementId = "txt" + colorPickerBlock + "Color";
	var textBox = document.getElementById(elementId);
	var color = textBox.value;
	var inputSize = 7; // Length of the input hex value.

	if (color.charAt(0) == "#") {
		textBox.maxLength = inputSize;
	} else {
		textBox.maxLength = inputSize - 1;
		color = "#" + color;
	}

	for (var i = color.length; i < inputSize; i++)
		color += "0";

	var colorBlock = colorPickerBlock.toLowerCase() + "ColorBlock";
	var mainColorBlock = document.getElementById(colorBlock);
	mainColorBlock.style.backgroundColor = color;

	if (event.keyCode == 13) // Dispatch the click event if pressed key is
		// 'Enter'.
		mainColorBlock.click();
}

/**
 * Dispatch the click event of activeButton.
 * @param event {event type} The keyDown event dispatched after pressing key
 * in textbox. 
 */
function text_KeyDownHandler(event) {
	if (event.keyCode == 13)
		document.getElementById("activateButton").click();
}

/**
 * Restrict the text input to decimal value.
 * @param event {event type} The keyDown event dispatched after pressing key
 * in textbox. 
 */
function restrictInputToDecimal(event) {
	var charCode = (event.which) ? event.which : event.keyCode;

	if (charCode == 48 && !event.srcElement.value.length)
		return false;

	if (charCode == 46 && event.srcElement.value.split(".").length > 1)
		return false;

	if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
		return false;

	return true;
}
