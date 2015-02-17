/*
File-Name: utility.js
Description: This file includes common utility functions used by more than one files.
 */

/**
 * Disable the text input.
 * @param textField {textInput object} Reference of the text input.
 */
function disableTextField(textField) {
	textField.disabled = true;
}

/**
 * Enable the text input and change the background color to white.
 * @param textField {textInput object} Reference of the text input.
 */
function enableTextField(textField) {
	textField.disabled = false;
	textField.style.backgroundColor = "#ffffff";
}

/**
 * Convert rgb into hex.
 * @param colorVal {string} rgb value.
 */
function rgbToHex(colorVal) {
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
}

/**
 * Get the current host application name.
 * @returns host application id.
 * */
function getHostApp() {
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
}