/*
File-Name: utility.js
Description: This file includes common utility functions used by more than one files.
 */


var specctrUtility = Specctr.Utility = {};

/**
 * Get the current host application name.
 * @returns host application id.
 * */
specctrUtility.getHostApp = function() {
	var csInterface = new CSInterface();
	var appName = csInterface.hostEnvironment.appName;
	var currentApplication = "";

	if(appName.indexOf("PHXS") >= 0) {
		currentApplication = "Ps";
	} else if (appName.indexOf("ILST") >= 0) {
		currentApplication = "Ai";
	} else if (appName.indexOf("IDSN") >= 0) {
		currentApplication = "Id";
	}

	return currentApplication;
};

/**
 * Get extension id of the html panel.
 */
specctrUtility.getExtensionId = function() {
	var csInterface = new CSInterface();
	var gExtensionId = csInterface.getExtensionID();
	return gExtensionId;
};

/**
 * Disable the text input.
 * @param textField {textInput object} Reference of the text input.
 */
specctrUtility.disableTextField = function(textField) {
	$("#" + textField).attr("disabled", true);
};

/**
 * Enable the text input and change the background color to white.
 * @param textField {string} Id of the text input.
 */
specctrUtility.enableTextField = function(textField) {
	textField = "#" + textField;
	$(textField).attr("disabled", false);
	$(textField).css("background-color", "#ffffff");
};

/**
 * Change the label's text color to #blue of second tab's check-boxes.
 * @param label {label object} Reference of the label.
 */
specctrUtility.changeTextColor = function(label) {
	$(label).toggleClass("setBlueLabel");
};

/**
 * Set the colorpicker color at the time of initialization.
 * @param element {element object} Reference of the color picker.
 */
specctrUtility.setColorPickerColor = function(elementId, color) {
	$(elementId).css("background-color", color);
	$(elementId).parent().children().first().css("color", color);
};

/**
 * Change the images of tabs on their selection.
 * @param selectedTab {number} The position of selected tab.
 */
specctrUtility.changeImagesOfTabs = function(selectedTab) {
	try {
		var isImageChanged = true, size = "";
		var iconExtension = ".png";
		var activeImageEndString = "_selected";
		var tabIconPath = ["../Images/tabs/tabs_spec", "../Images/tabs/tabs_properties", 
		                   "../Images/tabs/tabs_responsive", "../Images/tabs/tabs_cloud"];
		var arrayLength = tabIconPath.length;
		
		//For retina display: 2 pixel ratio; 
		if (window.devicePixelRatio > 1)
			size = "";

		tabIconPath[selectedTab-1] += activeImageEndString;	//Set active icon path.

		//Set icons to their respective tabs.
		for (var i = 0; i < arrayLength; i++) {
			$("#tabImage_" + (i + 1)).attr("src", 
					tabIconPath[i] + size + iconExtension);
		}

	} catch (e) {
		isImageChanged = false;
	}

	return isImageChanged;
};

/**
 * Convert rgb into hex.
 * @param colorVal {string} rgb value.
 */
specctrUtility.rgbToHex = function(colorVal) {
	try {
		var parts = colorVal.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
		delete (parts[0]);
		for (var i = 1; i <= 3; ++i) {
			parts[i] = parseInt(parts[i]).toString(16);
			if (parts[i].length == 1)
				parts[i] = "0" + parts[i];
		}

		var color = "#" + parts.join("");
		return color;
	} catch (e) {
		console.log(e);
	}

	return colorVal;
};

// Wrap passed function in a try catch block and log any errors.
Specctr.Utility.tryCatchLog = function(func) {
	return function() {
		try{
			func.apply(this, arguments);
		}catch(e){
			pref.logError(e);
		}	
	};
};

// Log the response and then wrap handler in try catch block.
Specctr.Utility.resHandler = function(func) {
	return function() {
		if (arguments[0].readyState) {
			console.log("Log response error.");
			pref.logResError(arguments[0]);
		}else if (arguments[2] && arguments[2].readyState) {
			console.log("Log response success.");
			pref.logResSuccess(arguments[2], arguments[0]);
		}
		Specctr.Utility.tryCatchLog(func);
	};
};

