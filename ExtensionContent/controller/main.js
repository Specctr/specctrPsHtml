/*
File-Name: main.js
Description: Include methods to initialize the panel's component according to the stored preferences.
 */

Specctr = Specctr || {};

/**
 * Load the jsx and show/hide the login container 
 * according to the license value in preferences.
 */
onLoaded = Specctr.Utility.tryCatchLog(function() {
	pref.log('Loading Specctr.');
	specctrDialog.createAlertDialog();
	var isLicensed = false;
	var appPrefs;

	//Get the host application name.
	hostApplication = Specctr.Utility.getHostApp();
	loadJSX(); // Load the jsx files present in \jsx folder.

	if (hostApplication === '') {
		specctrDialog.showAlert('Cannot load the extension.\nRequired host application not found!');
		return;
	} else if (hostApplication === photoshop) {
		
		$(".psElement").show();
		$(".nonPsElement").hide();
		lightThemeColorValue = psLightThemeColorVal;
		extraLightThemeColorValue = psExtraLightThemeColorValue;
		extraDarkThemeColorValue = psExtraDarkThemeColorValue;
		
	} else if (hostApplication === illustrator) {
		addApplicationEventListener();
	}
	
	appPrefs = pref.readAppPrefs();	//Read the config file and look for the isLicensed value.
	if (appPrefs !== "") {
		if (appPrefs.hasOwnProperty("isLicensed"))
			isLicensed = appPrefs.isLicensed;
		Specctr.Init.setModelValueFromPreferences();
	}

	// Adding interface event change handler..
	var csInterface = new CSInterface();
	
	//Find the OS type.
	if(csInterface.getOSInformation().indexOf("Windows") > -1) {
		$(".tabPage2PropertiesHeader").css("margin-bottom", "0");
		$(".tabPage2Content").css("margin-top", "0");
	}

	// Update the color of the panel when the theme color of the product changed.
	updateThemeWithAppSkinInfo(csInterface.hostEnvironment.appSkinInfo);
	csInterface.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, onAppThemeColorChanged);
    
	// Migrating isLicensed from config file to license file, if present.
	var licenseFilePath = pref.getFilePath('.license');
	var activationPrefs = pref.readFile(licenseFilePath);	//Read the licensed file.

	if (activationPrefs === "") {
		if(!window.location.hash) {		//reload the panel page for Ai, Ps and Id.
	        window.location = window.location + '#loaded';
	        window.location.reload();
	    }
		return;
	}
	else {
		activationPrefs = Specctr.Activation = JSON.parse(activationPrefs);
	}

	isLicensed = activationPrefs.licensed;
	api_key = activationPrefs.api_key;
	machine_id = activationPrefs.machine_id;

	if (isLicensed)
		Specctr.Init.init();
});

/**
 * Load JSX file into the scripting context of the product. 
 * All the jsx files in folder [ExtensionRoot]/jsx will be loaded.
 */
function loadJSX() {
	try {
		var csInterface = new CSInterface();
		var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION)
		+ "/jsx/";

		//Evaluating .jsx file according to host application.
		csInterface.evalScript('$._ext.evalFiles("' + extensionRoot + 
				'","' + hostApplication + '")');
	} catch (e) {
		console.log(e);
	}
}

/**
 * Evaluates the scripting method.
 * @param script {string} The function name to evaluate.
 * @param callback {function object} The function handler. 
 */
function evalScript(script, callback) {
	new CSInterface().evalScript(script, callback);
}

/**
 * Evaluates the script and pass the model object to extendscript file(.jsx).
 */
function setModel() {
	var methodName = "setModel('" + JSON.stringify(model) + "')";
	evalScript("$.specctr" + hostApplication + "." + methodName);
}

/**
 * Callback function which takes the font list from jsx and 
 * load the list to the font combo-box of fourth tab.
 * @param result {string} List of font families.
 */
function loadFontsToList(result) {
	try {
		var font = JSON.parse(result);
		var fontLength = font.length;
		var fontPos = -1; 
		var defaultPos = 0, defaultValue = {};

		// Set the font list to combo-box.
		for (var i = 0; i < fontLength; i++) {
			$("#lstFont").append($("<option>", 
					{value:font[i].label, text:font[i].font}));

			if(font[i].font == model.legendFont) {
				fontPos = i;
				model.legendFontFamily = font[i].label;
			}

			if(font[i].font.indexOf("Arial") >= 0) {
				defaultPos = i;
				defaultValue.text = font[i].font;
				defaultValue.value = font[i].label;
			}
		}

		if(fontPos == -1) {
			// Select the font from the legendFont value and apply it.
			fontPos = defaultPos;
			model.legendFont = defaultValue.text;
			model.legendFontFamily = defaultValue.value;
		}

		$('#lstFont option').eq(fontPos).prop('selected', true);
	} catch (e) {
		console.log(e);
	}
}

/**
 * Event listener, listen the app theme color changed event.
 */
function onAppThemeColorChanged(event) {
    // Should get a latest HostEnvironment object from application.
    var skinInfo = JSON.parse(window.__adobe_cep__.getHostEnvironment()).appSkinInfo;
    updateThemeWithAppSkinInfo(skinInfo);
}

/**
 * Update the theme with the AppSkinInfo retrieved from the host product.
 */
function updateThemeWithAppSkinInfo(appSkinInfo) {
    //Update the background color of the panel
    var panelBackgroundColor = appSkinInfo.panelBackgroundColor.color;
    with (panelBackgroundColor) {
    	var color = "rgb("+ Math.round(red) + ", " + Math.round(green) +", " + Math.round(blue) + ")";
    };
    
    var hexValue = Specctr.Utility.rgbToHex(color);
    document.body.bgColor = hexValue;
    var decimalValue = Specctr.Utility.hexToDecimal(hexValue);
    
    if(decimalValue <= lightThemeColorValue) {		//Dark theme. 
    	$(".button label").css("color", "#ffffff");					//value to be applied on all text.
    	$('.tabTitle').css('color', "#ffffff");
    	
    	if(decimalValue < extraDarkThemeColorValue) {	//4th quadrant.
    		bgColorButton = "#5A5A5A";
    		bgColorHoverButton = "#7E7E7E";		
    	}
    	else {	//3rd quadrant.
    		bgColorButton = "#7E7E7E";
    		bgColorHoverButton = "#DBDBDB";
    	}
    	
    	isDarkInterface = true;
    	$('body').css('border', 'none');
    	$('#mainPageList').removeClass('menuSideMarginWithBorder').addClass('menuSideMarginWithOutBorder');
    
    } else {											//Light theme.
    	$(".button label").css("color", "#212121");					//value to be applied on all text.
    	$('.tabTitle').css('color', "#212121");
    	
    	if(decimalValue > extraLightThemeColorValue) {			//1st quadrant.
    		bgColorButton = "#EEEEEE";
    		bgColorHoverButton = "#FFFFFF";
    	}
    	else {
    		bgColorButton = "#DBDBDB";	//2nd quadrant.
    		bgColorHoverButton = "#EEEEEE";
    	}
    	
    	isDarkInterface = false;
    	$('body').css('border', '2px solid #C9CBCC');
    	$('#mainPageList').removeClass('menuSideMarginWithOutBorder').addClass('menuSideMarginWithBorder');
    }
    
    $('.tabTitle').css('background-color', bgColorButton);
    Specctr.UI.setHover('.button', bgColorHoverButton, bgColorButton);
   	$(".button").css("background-color", bgColorButton);
    
    //Change tab icons according to application interface.
	Specctr.Utility.changeImagesOfTabs($('#tabHeader_1')[0].parentNode.getAttribute("data-current"));
}

//----------------- Specctr Event Listeners -----------------//
/**
 * Dispatch event to loose the focus from photoshop html panel.
 */
function loseFocusFromPanel() {
	if(extensionId === '')
		extensionId = Specctr.Utility.getExtensionId();
	var csEvent = new CSEvent("com.adobe.PhotoshopLoseFocus", "APPLICATION");
	csEvent.extensionId = extensionId;
	var csInterface = new CSInterface();
	csInterface.dispatchEvent(csEvent);
}

/**
 * Add Ai event listener for art selection change.
 */
function addApplicationEventListener(response) { 
	try {
		AIEventAdapter.getInstance().addEventListener(AIEvent.ART_SELECTION_CHANGED, 
				selectionChangeListener);
	} catch(e) {
		alert(e);
	}
}

/**
 * Calling updateConnection method on art selection change notifier for Ai.
 */
function selectionChangeListener(event) {
	try {
		//Remove eventListener.
		AIEventAdapter.getInstance().removeEventListener(AIEvent.ART_SELECTION_CHANGED, 
				selectionChangeListener);

		setModel();
		evalScript("$.specctr" + hostApplication + ".updateConnection()", addApplicationEventListener);
	} catch (e) {}

}
