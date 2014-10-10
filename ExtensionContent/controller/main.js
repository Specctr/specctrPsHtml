/*
File-Name: main.js
Description: This file is used to communicate between extend script file and html file. It also include function to execute when panel loads
and reading and writing preferences methods.  
 */

/**
 * Callback function which is called when validation of user's license take place.
 * @param data {object} The object of the response came from the activation request.
 * @param status {string} The status of the activation request.
 */
function completeHandler(data, status) {
	var response = data;
	var arr = response.registered;

	var logData = createLogData(response.message);
	addFileToPreferenceFolder('.log', logData);	//Create log file.

	// If unsuccessful, return without saving the data in file.
	if (!arr.length) {
		analytics.trackActivation('failed');
		showDialog(response.message);
		return;
	} else {
		analytics.trackActivation('succeeded');
		var activationPrefs = {
			licensed : true,
			code : $("#license").val()
		};
		licenseCode = activationPrefs.code;
	}

	addFileToPreferenceFolder('.license', JSON.stringify(activationPrefs)); //Create license file.
	init();
}

/**
 * Set the canvas expand text value.
 */
function mainTab_creationCompleteHandler() {
	document.getElementById("canvasExpandSize").value = model.canvasExpandSize;
}

/**
 * Set the values of the objects(check boxes in setting tab) from model.
 */
function settings_creationCompleteHandler() {
	document.getElementById("shapeFill").checked = model.shapeFill;
	document.getElementById("shapeStroke").checked = model.shapeStroke;
	document.getElementById("shapeEffects").checked = model.shapeEffects;
	document.getElementById("shapeAlpha").checked = model.shapeAlpha;
	document.getElementById("shapeBorderRadius").checked = model.shapeBorderRadius;

	document.getElementById("textFont").checked = model.textFont;
	document.getElementById("textSize").checked = model.textSize;
	document.getElementById("textColor").checked = model.textColor;
	document.getElementById("textStyle").checked = model.textStyle;
	document.getElementById("textAlignment").checked = model.textAlignment;
	document.getElementById("textLeading").checked = model.textLeading;
	document.getElementById("textTracking").checked = model.textTracking;
	document.getElementById("textAlpha").checked = model.textAlpha;
	document.getElementById("textEffects").checked = model.textEffects;
}

/**
 * Set the values of the objects(check boxes in responsive tab) from model and
 * enable/disable the text boxes.
 */
function responsiveTab_creationCompleteHandler() {
	var relativeWidth = "relativeWidth";
	var relativeHeight = "relativeHeight";
	var baseFontSize = "baseFontSize";
	var baseLineHeight = "baseLineHeight";

	// Select the checkboxes depending on the model value.
	document.getElementById("chkDistanceSpec").checked = model.specInPrcntg;
	document.getElementById("chkEmSpec").checked = model.specInEM;

	// If true, enable the text boxes for width and height.
	if (model.specInPrcntg) {
		enableTextField(document.getElementById(relativeWidth));
		enableTextField(document.getElementById(relativeHeight));
	} else {
		disableTextField(document.getElementById(relativeWidth));
		disableTextField(document.getElementById(relativeHeight));
	}

	// If true, enable the text boxes for base font size and line height.
	if (model.specInEM) {
		enableTextField(document.getElementById(baseFontSize));
		enableTextField(document.getElementById(baseLineHeight));
	} else {
		disableTextField(document.getElementById(baseFontSize));
		disableTextField(document.getElementById(baseLineHeight));
	}
}

/**
 * Load the data provider values to the combo box in spec options tab.
 */
function prefs_creationCompleteHandler() {
	// Set the values for font size combobox.
	var fontSizeHandler = document.getElementById("lstSize");
	fontSizeHandler.selectedIndex = -1;
	fontSizeHandler.value = model.legendFontSize.toString();

	// Set the values for arm weight combobox.
	var armWeightHandler = document.getElementById("lstLineWeight");
	armWeightHandler.selectedIndex = -1;
	armWeightHandler.value = model.armWeight.toString();

	document.getElementById("useHexColor").checked = model.useHexColor;

	if (!model.legendColorMode)
		model.legendColorMode = "RGB";

	var radioButton = model.legendColorMode.toLowerCase() + "RadioButton";
	document.getElementById(radioButton).checked = true;

	document.getElementById("colObject").style.backgroundColor = model.legendColorObject;
	document.getElementById("colType").style.backgroundColor = model.legendColorType;
	document.getElementById("colSpacing").style.backgroundColor = model.legendColorSpacing;

	document.getElementById("chkScaleBy").checked = model.useScaleBy;

	// Enable or disable scale text according to selection of check box.
	if (model.useScaleBy)
		enableTextField(document.getElementById("txtScaleBy"));
	else
		disableTextField(document.getElementById("txtScaleBy"));

	var extScript = "ext_PHXS_getFonts()";
	evalScript(extScript, loadFontsToList);
}

/**
 * Load the jsx and show/hide the login container 
 * according to the license value in preferences.
 */
function onLoaded() {
	// Handle the exceptions such as if any value or any component is not
	// present.
	try {
		loadJSX(); // Load the jsx files present in \jsx folder.
		createDialog();

		var isLicensed = false;
		var appPrefs = readAppPrefs();	//Read the config file and look for the isLicensed value.
		if (appPrefs !== "") {
			if(appPrefs.hasOwnProperty("isLicensed"))
				isLicensed = appPrefs.isLicensed;
			setModelValueFromPreferences();
		}

		//Migrating license from config file to license file, if present.
		var activationPrefs = {};
		if(!isLicensed) {
			var licenseFilePath = getFilePath('.license');
			activationPrefs = readFile(licenseFilePath);	//Read the licensed file.

			if(activationPrefs === "")
				return;
			else
				activationPrefs = JSON.parse(activationPrefs);

			isLicensed = activationPrefs.licensed;
			licenseCode = activationPrefs.code;
		} else {
			activationPrefs.licensed = true;
			addFileToPreferenceFolder('.license', JSON.stringify(activationPrefs));
			writeAppPrefs();
		}

		if (isLicensed)
			init();

	} catch (e) {
		console.log(e);
	}
}

/**
 * Initialize the values of the tab conatainer's components.
 */
function init() {
	// Handle the exceptions such as if any value or any component is not
	// present.
	try {
		// Load tab container..
		document.getElementById("loginContainer").style.display = "none";
		document.getElementById("tabContainer").style.display = "block";

		setModelValueFromPreferences();

		var container = document.getElementById("tabContainer"); // Get tab
		// container
		var navitem = container.querySelector(".tabs ul li"); // Set current
		// tab

		// Store which tab we are on
		var ident = navitem.id.split("_")[1];
		navitem.parentNode.setAttribute("data-current", ident);

		changeImagesOfTabs(parseInt(ident)); // Set Current Tab with proper
		// Image
		navitem.setAttribute("class", "tabActiveHeader"); // Set current tab
		// with class of
		// active tab header

		// Hide two tab contents we don't need
		var pages = container.querySelectorAll(".tabpage");
		for (var i = 1; i < pages.length; i++)
			pages[i].style.display = "none";

		// Register click events to tabs.
		var tabs = container.querySelectorAll(".tabs ul li");
		for (var i = 0; i < tabs.length; i++)
			tabs[i].onclick = tab_clickHandler;

		mainTab_creationCompleteHandler();
		settings_creationCompleteHandler();
		responsiveTab_creationCompleteHandler();
		prefs_creationCompleteHandler();
	} catch (e) {
		console.log(e);
	}
}

/**
 * Set the Specctr configuration file data to model values.
 */
function setModelValueFromPreferences() {
	var appPrefs = readAppPrefs();

	if (!appPrefs || !appPrefs.hasOwnProperty("shapeAlpha"))
		return;

	model.shapeFill = appPrefs.shapeFill ? true : false;
	model.shapeStroke = appPrefs.shapeStroke ? true : false;
	model.shapeEffects = appPrefs.shapeEffects ? true : false;
	model.shapeAlpha = appPrefs.shapeAlpha ? true : false;
	model.shapeBorderRadius = appPrefs.shapeBorderRadius ? true : false;

	model.textFont = appPrefs.textFont ? true : false;
	model.textSize = appPrefs.textSize ? true : false;
	model.textAlignment = appPrefs.textAlignment ? true : false;
	model.textColor = appPrefs.textColor ? true : false;
	model.textStyle = appPrefs.textStyle ? true : false;
	model.textLeading = appPrefs.textLeading ? true : false;
	model.textTracking = appPrefs.textTracking ? true : false;
	model.textAlpha = appPrefs.textAlpha ? true : false;
	model.textEffects = appPrefs.textEffects ? true : false;

	model.useHexColor = appPrefs.useHexColor ? true : false;
	model.specInPrcntg = appPrefs.specInPrcntg ? true : false;
	model.specInEM = appPrefs.specInEM ? true : false;
	model.useScaleBy = appPrefs.useScaleBy ? true : false;

	model.canvasExpandSize = Number(appPrefs.canvasExpandSize);

	model.legendFont = appPrefs.legendFont ? appPrefs.legendFont
			: model.legendFont;
	model.legendFontSize = Number(appPrefs.legendFontSize);
	model.armWeight = Number(appPrefs.armWeight);

	if (appPrefs.hasOwnProperty("legendColorObject"))
		model.legendColorObject = appPrefs.legendColorObject;

	if (appPrefs.hasOwnProperty("legendColorType"))
		model.legendColorType = appPrefs.legendColorType;

	if (appPrefs.hasOwnProperty("legendColorSpacing"))
		model.legendColorSpacing = appPrefs.legendColorSpacing;

	if (appPrefs.hasOwnProperty("legendColorMode"))
		model.legendColorMode = appPrefs.legendColorMode;
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
		var fontList = document.getElementById("lstFont");

		// Set the font list to combo-box.
		for (var i = 0; i < fontLength; i++) {
			var option = document.createElement("option");
			option.text = font[i].font;
			option.value = i;
			fontList.add(option, i);
		}

		applyFontToList();
	} catch (e) {
		console.log(e);
	}
}

/**
 * Load JSX file into the scripting context of the product. 
 * All the jsx files in folder [ExtensionRoot]/jsx will be loaded.
 */
function loadJSX() {
	try {
		var csInterface = new CSInterface();
		var extensionRoot = csInterface.getSystemPath(SystemPath.EXTENSION)
				+ "/jsx/";
		csInterface.evalScript('$._ext.evalFiles("' + extensionRoot + '")');
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
	try {
		var extScript = "ext_PHXS_setModel('" + JSON.stringify(model) + "')";
		evalScript(extScript);
	} catch (e) {
		console.log(e);
	}
}

/**
 * Call the 'createCanvasBorder' method from ./jsx/specctr.jsx.
 */
function expandCanvas() {
	analytics.trackFeature('expand_canvas');

	try {
		setModel();
		var extScript = "ext_PHXS_expandCanvas()";
		evalScript(extScript);
		writeAppPrefs();
	} catch (e) {
		console.log(e);
	}
}

/**
 * Call the 'createDimensionSpecsForItem' method from ./jsx/specctr.jsx.
 */
function createDimensionSpecs() {
	analytics.trackFeature('create_dimension_specs');
	try {
		setModel();
		var extScript = "ext_PHXS_createDimensionSpecs()";
		evalScript(extScript);
	} catch (e) {
		console.log(e);
	}
}

/**
 * Call the 'createSpacingSpecs' method from ./jsx/specctr.jsx.
 */
function createSpacingSpecs() {
	analytics.trackFeature('create_spacing_specs');

	try {
		setModel();
		var extScript = "ext_PHXS_createSpacingSpecs()";
		evalScript(extScript);
	} catch (e) {
		console.log(e);
	}
}

/**
 * Call the 'createCoordinateSpecs' method from ./jsx/specctr.jsx.
 */
function createCoordinateSpecs() {
	analytics.trackFeature('create_coordinate_specs');

	try {
		setModel();
		var extScript = "ext_PHXS_createCoordinateSpecs()";
		evalScript(extScript);
	} catch (e) {
		console.log(e);
	}
}

/**
 * Call the 'createPropertySpecsForItem' method from ./jsx/specctr.jsx.
 */
function createPropertySpecs() {
	analytics.trackFeature('create_property_specs');

	try {
		setModel();
		var extScript = "ext_PHXS_createPropertySpecs()";
		evalScript(extScript);
	} catch (e) {
		console.log(e);
	}
}

/**
 * Call the 'exportCss' method from ./jsx/specctr.jsx.
 */
function exportCss() {
	analytics.trackFeature('export_css');

	try {
		setModel();
		var extScript = "ext_PHXS_exportCss()";
		evalScript(extScript);
	} catch (e) {
		console.log(e);
	}
}

/**
 * Apply the model's font value to the font list of fourth tab.
 */
function applyFontToList() {
	// Get font combo-box handler.
	var fontListHandler = document.getElementById("lstFont"); 

	// Select the font if the index text value matches with the legendFont.
	if (fontListHandler.options[model.legendFontIndex].text == model.legendFont) {
		fontListHandler.options[model.legendFontIndex].selected = true;
		return;
	}

	var listLength = fontListHandler.options.length;

	// Select the font from the legendFont value and apply it.
	for (var i = 0; i < listLength; i++) {
		if (fontListHandler.options[i].text == model.legendFont) {
			model.legendFontIndex = i;
			fontListHandler.options[i].selected = true;
			break;
		}
	}
}

/**
 * Dispatch event to loose the focus from html panel.
 */
function loseFocusFromPanel() { 
		if(extensionId === '')
			extensionId = getExtensionId();
		var csEvent = new CSEvent("com.adobe.PhotoshopLoseFocus", "APPLICATION");  
		csEvent.extensionId = extensionId;
		var csInterface = new CSInterface();
		csInterface.dispatchEvent(csEvent);
}
