/*
File-Name: specctrUI.js
Description: Includes all the methods related to UI component like change event handlers, 
click event handlers etc. 
 */

//SPECCTR_HOST = "http://localhost:5000";
SPECCTR_HOST = "http://specctr-subscription.herokuapp.com";
SPECCTR_API = SPECCTR_HOST += "/api/v1";

/**
 * Validate the license of the user and move to the tab container
 *  if user's credentials valid.
 */
function activateButtonClickHandler() {
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

	if(extensionId === '')
		extensionId = getExtensionId();

	var logData = "";

	// If no installed extension is matched with productCodes values.
	if (!productCodes[extensionId]) {
		logData = "Incorrect product code";
		showDialog(logData);
		logData = createLogData(logData);
		addFileToPreferenceFolder('.log', logData);	//Create log file.
		return;
	}

	var urlRequest = SPECCTR_API += "/register_machine?";
	urlRequest += "&email=" + $("#emailInput").val();
	urlRequest += "&password=" + $("#passwordInput").val();

	$.ajax({
		url:urlRequest,
		type: 'POST',
		contentType: "application/json",
		dataType: "json",
		success: completeHandler,
		error: function(xhr) {
			var response = JSON.parse(xhr.responseText);
			showDialog(response.message);
			logData = createLogData(response.message);
			addFileToPreferenceFolder('.log', logData);	//Create log file.
		}
	});
}

/**
 * Click event handler of tabs. Modify styles to tabs and 
 * call the function to change images on tab.
 */
function tabClickHandler() {
	try {
		var ident = this.id.split("_")[1];
		var current = this.parentNode.getAttribute("data-current");

		// Remove class of active tab header and hide old contents
		var currentTabHeader = $("#tabHeader_" + current);
		var currentTabPage = $("#tabpage_" + current);

		if (currentTabHeader && currentTabPage
				&& (ident >= "1" && ident <= "4")) {
			currentTabHeader.removeAttr("class");
			currentTabPage.css("display", "none");
		} else {
			return false;
		}

		// Set Image of Active Tab
		changeImagesOfTabs(parseInt(ident));

		// Set class of active tab
		this.setAttribute("class", "tabActiveHeader");

		$("#tabpage_" + ident).css("display", "block");
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
		var isImageChanged = true, size = "";
		var iconExtension = ".png";
		var activeImageEndString = "_active";
		var tabIconPath = ["../Images/Icon_main", "../Images/Icon_settings", 
		                   "../Images/Icon_responsive", "../Images/Icon_prefs"];
		
		//For retina display: 2 pixel ratio; 
		//We have only first tab icon in x2 for that 'selectedTab === 1' check is used.
		if (window.devicePixelRatio > 1 && selectedTab === 1)
			size = "_x2";

		tabIconPath[selectedTab-1] += activeImageEndString;	//Set active icon path.
		
		//Set icons to their respective tabs.
		for (var i = 0; i < 4; i++) {
			$("#tabImage_" + (i + 1)).attr("src", 
					tabIconPath[i] + size + iconExtension);
		}
		
	} catch (e) {
		isImageChanged = false;
	}

	return isImageChanged;
}

/**
 * Stop the bubbling of click event.
 */
function itemClickHandler(event) {
	event.stopPropagation();
}

/**
 * Set the value of checkBox model value when changed.
 * @param checkBoxId {string} The id of selected checkbox.
 */
function checkBoxChangeHandler(checkBox) {
	model[checkBox.id] = checkBox.checked;
	writeAppPrefs();
}

/**
 * Set the model value of text box when changed.
 * @param textBoxId {string} The id of selected text box.
 */
function textBoxChangeHandler(textBoxId) {
	model[textBoxId] = Number($("#" + textBoxId).val());
	writeAppPrefs();
}

/**
 * Enable/Disable the width and height text boxes and 
 * set the value of model's specInPrcntg when changed.
 */
function specInPercentageChangeHandler() {
	model.specInPrcntg = $("#specInPrcntg").is(":checked");
	if (model.specInPrcntg) {
		enableTextField("relativeWidth");
		enableTextField("relativeHeight");
	} else {
		disableTextField("relativeWidth");
		disableTextField("relativeHeight");
	}
	writeAppPrefs();
}

/**
 * Enable/Disable the baseFontSize and baseLineHeight text boxes and
 * set the value of model's specInEM when changed.
 */
function specInEMChangeHandler(element) {
	var textFontSize = $("#baseFontSize");
	var textBaseLineHeight = $("#baseLineHeight");
	model.specInEM = element.checked;

	if (model.specInEM) {
		enableTextField("baseFontSize");
		enableTextField("baseLineHeight");
	} else {
		disableTextField("baseFontSize");
		disableTextField("baseLineHeight");
	}

	//Fill default values if nothing is present in specInEM's textboxes.
	if (textFontSize.val().length == 0)
		textFontSize.val("16");

	if (textBaseLineHeight.val().length == 0) {
		var value = Number(Math.round(Number(textFontSize.val()) * 140) / 100);
		textBaseLineHeight.val(value.toString());
		model.baseLineHeight = value;
	}
	writeAppPrefs();
}

/**
 * Set the value of useScaleBy when changed.
 */
function useScaleByClickHandler() {
	model.useScaleBy = $("#useScaleBy").is(":checked");

	if (model.useScaleBy)
		enableTextField("txtScaleBy");
	else
		disableTextField("txtScaleBy");

	writeAppPrefs();
}

/**
 *Allow the input greater than 1 only and set the value of scaleValue when changed.
 */
function txtScaleByChangeHandler() {
	var scaleByHandler = $("#txtScaleBy");
	var firstChar = scaleByHandler.val().charAt(0);

	// if first character is other than 'x', 'X' or '/' then empty the text box.
	if (!(firstChar == "x" || firstChar == "/" || firstChar == "X"))
		scaleByHandler.val("");

	// Restrict the text inputs to satisfy the values like x1, x2, /1, /2 etc.
	model.scaleValue = scaleByHandler.val();
}

/**
 * Set the value of legendColorMode when selection of radio button changed.
 * @param event {event type} The event comes after clicking radio button.
 */
function radioButtonClickHandler(event, value) {
	var selectedValue = event.target.value;
	if (selectedValue === undefined)
		return;

	model[value] = selectedValue;
	writeAppPrefs();
}

/**
 * Set the value of font size when changed.
 * @param element {object} Reference of selected combo-box.
 * @param modelValue {string} Combo-box name.
 */
function comboBoxChangeHandler(element, modelValue) {
	var value = element.options[element.selectedIndex].value;
	if(!isNaN(Number(value)))
		value = Number(value);
	model[modelValue] = value;
	writeAppPrefs();
}

/**
 * Set the value of font when changed.
 */
function listFontChangeHandler(element) {
	var selectedFont = element.options[element.selectedIndex];
	model.legendFontFamily = selectedFont.value;
	model.legendFont = selectedFont.text;
	writeAppPrefs();
}

/**
 * Set color value to the color-picker dropdown's input text on hovering the color blocks.
 * @param element {object} The reference of color picker.
 * @param colorPickerBlock {string} The name of color picker block.
 */
function setColorValueToTextBox(element, colorPickerBlock) {
	var inputTextName = "#txt" + colorPickerBlock + "Color";
	var blockName = "#" + colorPickerBlock.toLowerCase() + "ColorBlock";
	$(inputTextName).val(element.title);
	$(blockName).css("background-color", "#" + element.title);
}

/**
 * Set color to the color picker's label on clicking any color block and 
 * close the dropdown.
 * @param element {object} The reference of color picker.
 * @param colorPickerBlock {string} The name of color picker block.
 */
function setColorToLabel(element, colorPickerBlock) {
	var value = "legendColor" + colorPickerBlock;

	if (element.title) {
		var color = "#" + element.title;
	} else {
		color = element.style.backgroundColor;
		color = rgbToHex(color);
	}

	$("#col" + colorPickerBlock).css("background-color", color);
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
function colorPickerClickHandler(element, colorPickerBlock) {
	var colorBlockTextbox = "#txt" + colorPickerBlock + "Color";
	var dropDownBlock = "#color" + colorPickerBlock + "DropDown";
	var colorBlock = "#" + colorPickerBlock.toLowerCase() + "ColorBlock";
	var valueForTextBox = "";

	var color = element.style.backgroundColor;
	color = rgbToHex(color);
	$(dropDownBlock).slideToggle(100);
	$(colorBlock).css("background-color", color);

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
function colorPickerTextInputValidation(event) {
	var charCode = (event.which) ? event.which : event.keyCode;

	/* Allows only hex value like eeffee or #eeffee.
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
function colorPickerTextInputClickHandler(event, colorPickerBlock) {
	var elementId = "#txt" + colorPickerBlock + "Color";
	var textBox = $(elementId);
	var color = textBox.val();
	var inputSize = 7; // Length of the input hex value.

	if (color.charAt(0) == "#") {
		textBox.attr("maxlength", inputSize);
	} else {
		textBox.attr("maxlength", inputSize - 1);
		color = "#" + color;
	}

	for (var i = color.length; i < inputSize; i++)
		color += "0";

	var colorBlock = "#" + colorPickerBlock.toLowerCase() + "ColorBlock";
	$(colorBlock).css("background-color", color);

	if (event.keyCode == 13) // Dispatch the click event if pressed key is 'Enter'.
		$(colorBlock).trigger("click");
}

/**
 * Dispatch the click event of activeButton.
 * @param event {event type} The keyDown event dispatched after pressing key
 * in textbox. 
 */
function textKeyDownHandler(event) {
	if (event.keyCode == 13)
		$("#activateButton").trigger("click");
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

/**
 * Set the style of dialog at the time of initialization of panel. 
 */
function createDialog() {
	$("#dialog").dialog({
		autoOpen : false,
		resizable: false,
		width : 200,
		height : 80,
		modal : true,
		buttons : []
	});
}

/**
 * Open the dialog with the passed message.
 * @param message {string} The message that appear in the dialog.
 */
function showDialog(message) {
	var dialogRef = $("#dialog");
	dialogRef.text(message);
	dialogRef.dialog("open");
	dialogRef.dialog({position:'center'});
}

/**
 * Close the dialog.
 */
function hideDialog() {
	$("#dialog").dialog("close");
}
