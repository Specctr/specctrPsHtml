/*
File-Name: utility.js
Description: This file includes common utility functions used by more than one files.
 */

var specctrUtility = {};

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
 * Change the label's text color to #blue.
 * @param label {label object} Reference of the label.
 */
specctrUtility.changeTextColor = function(label) {
	$(label).toggleClass("setBlueLabel");
};

/**
 * Change the images of tabs on their selection.
 * @param selectedTab {number} The position of selected tab.
 */
specctrUtility.changeImagesOfTabs = function(selectedTab) {
	try {
		var isImageChanged = true, size = "";
		var iconExtension = ".png";
		var activeImageEndString = "_active";
		var tabIconPath = ["../Images/Icon_main", "../Images/Icon_settings", 
		                   "../Images/Icon_responsive", "../Images/Icon_cloud"];
		
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

