/*
File-Name: utility.js
Description: This file includes common utility functions used by more than one files.
 */

Specctr = Specctr || {};

Specctr.Utility = {
	/**
	 * Get the current host application name.
	 * @returns host application id.
	 * */
	getHostApp : function() {
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
	},
	
	/**
	 * Get extension id of the html panel.
	 */
	getExtensionId : function() {
		var csInterface = new CSInterface();
		var gExtensionId = csInterface.getExtensionID();
		return gExtensionId;
	},
	
	/**
	 * Disable the text input.
	 * @param textField {textInput object} Reference of the text input.
	 */
	disableTextField : function(textField) {
		$("#" + textField).attr("disabled", true);
	},
	
	/**
	 * Enable the text input and change the background color to white.
	 * @param textField {string} Id of the text input.
	 */
	enableTextField : function(textField) {
		textField = "#" + textField;
		$(textField).attr("disabled", false);
		$(textField).css("background-color", "#ffffff");
	},
	
	/**
	 * Change the label's text color to #blue of second tab's check-boxes.
	 * @param label {label object} Reference of the label.
	 */
	changeTextColor : function(label) {
		$(label).toggleClass("setBlueLabel");
	},
	
	/**
	 * Change the images of tabs on their selection.
	 * @param selectedTab {number} The position of selected tab.
	 */
	changeImagesOfTabs : function(selectedTab) {
		try {
			var isImageChanged = true, size = "";
			var iconExtension = ".png";
			var activeImageEndString = "_selected";
			var tabIconPath = ["tabs/tabs_spec", "tabs/tabs_properties", 
			                   "tabs/tabs_responsive", "tabs/tabs_cloud"];
			var arrayLength = tabIconPath.length;
			
			//For retina display: 2 pixel ratio; 
			if (window.devicePixelRatio > 1)
				size = "";
	
			tabIconPath[selectedTab-1] += activeImageEndString;	//Set active icon path.
	
			//Set icons to their respective tabs.
			for (var i = 0; i < arrayLength; i++) {
				$("#tabImage_" + (i + 1)).attr("src", 
					imagePath + tabIconPath[i] + size + iconExtension);
			}
	
		} catch (e) {
			isImageChanged = false;
		}
	
		return isImageChanged;
	},
	
	/**
	 * Convert rgb into hex.
	 * @param colorVal {string} rgb value.
	 */
	rgbToHex : function(colorVal) {
		try {
			var parts = colorVal.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
			delete (parts[0]);
			for (var i = 1; i <= 3; ++i) {
				parts[i] = parseInt(parts[i]).toString(16);
				if (parts[i].length == 1)
					parts[i] = "0" + parts[i];
			}
	
			return "#" + parts.join("");
		} catch (e) {
			console.log(e);
		}
	
		return colorVal;
	},
	
	/**
	 * Convert hex into decimal.
	 * @param colorVal {string} hex value.
	 */
	hexToDecimal : function(hexValue) {
		
		if(hexValue.length === 7)
			hexValue = hexValue.substring(1);
		
		return parseInt(hexValue, 16);
	},
	
	/**
	 * Create drop like structure to colorpicker.
	 * @param id {string} colorpicker block id.
	 * @param x {number} x coordinate.
	 * @param y {number} y coordinate.
	 * @param color {string} fill color value in hex.
	 */
	createDropForColorPicker : function(id, x, y, color) {
		var canvas = document.getElementById(id);
	    var context = canvas.getContext('2d');
	    
	    //Clear the canvas.
	    context.clearRect(0,0,canvas.width, canvas.height);

	    // begin custom shape
	    context.beginPath();
	    context.moveTo(x, y);
	    context.bezierCurveTo(x-15, y+20, x+15, y+20, x, y);
	    
	    // complete custom shape
	    context.closePath();
	    context.fillStyle = color;
	    context.fill();
	    
	    $("#"+id).parent().children().first().css("color", color);
	},
	
	/**
	 * Try catch wrapper for logging errors.
	 */
	tryCatchLog : function(func) {
        return function() {
            try{
                func.apply(this, arguments);
            }catch(e){
                pref.logError(e);
            }	
        };
	}
};
