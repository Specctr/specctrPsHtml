/*
File-Name: main.js
Description: Include methods to initialize the panel's component according to the stored preferences.  
Include all spec button click handlers and methods to communicate between js and jsx.  
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
	} else if (hostApplication === illustrator) {
		addApplicationEventListener();
	}
	
	appPrefs = pref.readAppPrefs();	//Read the config file and look for the isLicensed value.
	if (appPrefs !== "") {
		if (appPrefs.hasOwnProperty("isLicensed"))
			isLicensed = appPrefs.isLicensed;
		Specctr.Init.setModelValueFromPreferences();
	}

	//Migrating isLicensed from config file to license file, if present.
	var licenseFilePath = pref.getFilePath('.license');
	var activationPrefs = pref.readFile(licenseFilePath);	//Read the licensed file.

	if (activationPrefs === "") {
		if(hostApplication === illustrator && !window.location.hash) {
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
		evalScript("$.specctr" + hostApplication + "." + "updateConnection()", addApplicationEventListener);
	} catch (e) {}

}
