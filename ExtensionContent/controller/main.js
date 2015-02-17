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
	var iconPostString = ".png";
	var buttonIconPaths = ["../Images/Icon_object", "../Images/Icon_coordinates",
	                       "../Images/DimensionButtonIcons/WH_11", 
	                       "../Images/SpacingButtonIcons/Spacing_TL"];
	var buttonIds = ["#imgProperty", "#imgCoordinate", "#dimensionIcon", "#spacingIcon"];
	
	//For retina display: 2 pixel ratio; 
	if(window.devicePixelRatio > 1)
		iconPostString = "_x2" + iconPostString;

	for (var i = 0; i < 4; i++) {
		$(buttonIds[i]).attr("src", buttonIconPaths[i] + iconPostString);
	}

	$("#canvasExpandSize").val(model.canvasExpandSize);
}

/**
 * Set the values of the objects(check boxes in setting tab) from model.
 */
function settings_creationCompleteHandler() {
	//Load settings from model according to the host application.
	var appSpecificCheckBoxesId;
	var checkBoxesId = ["shapeAlpha", "shapeBorderRadius", "textFont", "textSize",
	                    "textColor", "textStyle", "textAlignment", "textLeading",
	                    "textTracking", "textAlpha"];
	
	if (hostApplication === photoshop) {
		appSpecificCheckBoxesId = ["shapeFill", "shapeStroke", 
		                           "shapeEffects", "textEffects"];
	} else {
		appSpecificCheckBoxesId = ["shapeFillColor", "shapeFillStyle", 
		                           "shapeStrokeColor", "shapeStrokeStyle", 
		                           "shapeStrokeSize"];
	}

	Array.prototype.push.apply(checkBoxesId, appSpecificCheckBoxesId);
	var totalCheckBoxes = checkBoxesId.length;
	
	for (var i = 0; i < totalCheckBoxes; i++) {
		$("#"+checkBoxesId[i]).prop("checked", model[checkBoxesId[i]]);
	}
}

/**
 * Set the values of the objects(check boxes in responsive tab) from model and
 * enable/disable the text boxes.
 */
function responsiveTab_creationCompleteHandler() {
	var textFieldIds = ["relativeWidth", "relativeHeight",
	                    "baseFontSize", "baseLineHeight"];
	
	var checkBoxIds = ["specInPrcntg", "specInEM"];
	
	for (var i = 0; i < 4; i+=2) {
		document.getElementById(checkBoxIds[i/2]).checked = model[checkBoxIds[i/2]];
		if (model[checkBoxIds[i/2]]) {
			enableTextField(document.getElementById(textFieldIds[i]));
			enableTextField(document.getElementById(textFieldIds[i+1]));
		} else {
			disableTextField(document.getElementById(textFieldIds[i]));
			disableTextField(document.getElementById(textFieldIds[i+1]));
		}
	}
}

/**
 * Load the data provider values to the combo box in spec options tab.
 */
function prefs_creationCompleteHandler() {
	
	var hostPrefix = "$.specctrPsCommon.";

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

	//Initialize the components on the basis of host application.
	if (hostApplication === illustrator)	{
		hostPrefix = "$.specctrAi.";
		document.getElementById("specToEdge").checked = model.specToEdge;
		var colorModeHandler = document.getElementById("lstColorMode");
		for(var i = 0; i < 4; i++) {
			if(colorModeHandler.options[i].text == model.legendColorMode) {
				colorModeHandler.options[i].selected = true;
				break;
			}
		}
	} else {
		var radioButton = model.legendColorMode.toLowerCase() + "RadioButton";
		document.getElementById(radioButton).checked = true;
		// Set the values for spec option combobox.
		var specOptionHandler = document.getElementById("lstSpecOption");
		specOptionHandler.selectedIndex = -1;
		specOptionHandler.value = model.specOption;
	}

	document.getElementById("colObject").style.backgroundColor = model.legendColorObject;
	document.getElementById("colType").style.backgroundColor = model.legendColorType;
	document.getElementById("colSpacing").style.backgroundColor = model.legendColorSpacing;

	document.getElementById("chkScaleBy").checked = model.useScaleBy;

	// Enable or disable scale text according to selection of check box.
	if (model.useScaleBy)
		enableTextField(document.getElementById("txtScaleBy"));
	else
		disableTextField(document.getElementById("txtScaleBy"));

	document.getElementById("rgbTransformIntoPercentage").checked = model.rgbTransformIntoPercentage;
	
	radioButton = model.decimalFractionValue + "RadioButton";
	document.getElementById(radioButton).checked = true;

	var extScript = hostPrefix + "getFontList()";
	evalScript(extScript, loadFontsToList);
}

/**
 * Load the jsx and show/hide the login container 
 * according to the license value in preferences.
 */
function onLoaded() {
	// Handle exceptions of any missing components.
	try {
		createDialog();
		var isLicensed = false;
		var appPrefs;
		
		loadJSX(); // Load the jsx files present in \jsx folder.

		//Get the host application name.
		hostApplication = getHostApp();

		if (hostApplication === '') {
			showDialog('Cannot load the extension.\nRequired host application not found!');
			return;
		} else if (hostApplication === photoshop) {
			$(".psElement").show();
			$(".nonPsElement").hide();
		} else if (hostApplication === indesign) {
			$(".nonIdElement").hide();
			$("#imgCoordinateDdlArrow").remove();
		}

		appPrefs = readAppPrefs();	//Read the config file and look for the isLicensed value.
		if (appPrefs !== "") {
			if (appPrefs.hasOwnProperty("isLicensed"))
				isLicensed = appPrefs.isLicensed;
			setModelValueFromPreferences();
		}

		//Migrating isLicensed from config file to license file, if present.
		var activationPrefs = {};
		if (!isLicensed) {
			var licenseFilePath = getFilePath('.license');
			activationPrefs = readFile(licenseFilePath);	//Read the licensed file.

			if (activationPrefs === "")
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
	// Handle exceptions of missing components
	try {
		// Load tab container..
		$("#loginContainer").hide();
		$("#tabContainer").show();

		setModelValueFromPreferences();

		var container = document.getElementById("tabContainer"); // Get tab container.
		var navitem = container.querySelector(".tabs ul li"); // Set current tab.

		// Store which tab we are on.
		var ident = navitem.id.split("_")[1];
		navitem.parentNode.setAttribute("data-current", ident);

		changeImagesOfTabs(parseInt(ident)); // Set Current Tab with proper Image.
		
		 // Set current tab with class of active tab header.
		navitem.setAttribute("class", "tabActiveHeader");

		// Hide two tab contents we don't need.
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
	
	var i, propertyApplicationSpecific;
	var propertyName = ["shapeAlpha", "shapeBorderRadius", "textFont", "textSize",
	                    "textAlignment", "textColor", "textStyle", "textLeading", 
	                    "textTracking", "textAlpha", "useHexColor", "specInPrcntg", 
	                    "specInEM", "rgbTransformIntoPercentage"];
	
	if (hostApplication === photoshop) {
		propertyApplicationSpecific = ["shapeFill", "shapeStroke", "shapeEffects", "textEffects"];
	} else {
		propertyApplicationSpecific = ["shapeFillColor", "shapeFillStyle", "shapeStrokeColor", 
		                               "shapeStrokeStyle", "shapeStrokeSize", "specToEdge"];
	}
	
	Array.prototype.push.apply(propertyName, propertyApplicationSpecific);
	var noOfPropertyItem = propertyName.length;
	for (i = 0; i < noOfPropertyItem; i++){
		model[propertyName[i]] = appPrefs[propertyName[i]] ? true : false;
	}
	
	var textBoxIds = ["canvasExpandSize", "legendFontSize", "armWeight"];
	for (i = 0; i < 3; i++) {
		model[textBoxIds[i]] = Number(appPrefs[textBoxIds[i]]);
	}
	
	var dropDownIds = ["specOption", "legendColorObject", "legendColorType",
	                   "legendColorSpacing", "legendColorMode", "decimalFractionValue",
	                   "legendFont"];
	for (i = 0; i < 7; i++) {
		if (appPrefs.hasOwnProperty(dropDownIds[i]))
			model[dropDownIds[i]] = appPrefs[dropDownIds[i]];
	}
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
		var methodName = "setModel('" + JSON.stringify(model) + "')";
		if (hostApplication === illustrator)
			evalScript("$.specctrAi." + methodName);
		else
			evalScript("$.specctrPsCommon." + methodName);		
	} catch (e) {
		console.log(e);
	}
}

/**
 * Call the 'createCanvasBorder' method from .jsx based on host application.
 */
function expandCanvas() {
	analytics.trackFeature('expand_canvas');

	try {
		setModel();
		var methodName = "createCanvasBorder()";

		if (hostApplication === illustrator)
			evalScript("$.specctrAi." + methodName);
		else
			evalScript("$.specctrPsExpandCanvas." + methodName);
	
		writeAppPrefs();
	} catch (e) {
		console.log(e);
	}
}

/**
 * Call the 'createDimensionSpecsForItem' method from .jsx based on host application.
 */
function createDimensionSpecs() {
	analytics.trackFeature('create_dimension_specs');
	try {
		setModel();
		if (hostApplication === illustrator)
			evalScript("$.specctrAi.createDimensionSpecs()");
		else
			evalScript("$.specctrPsDimension.createDimensionSpecsForItem()");
		
	} catch (e) {
		console.log(e);
	}
}

/**
 * Call the 'createSpacingSpecs' method from .jsx based on host application.
 */
function createSpacingSpecs() {
	analytics.trackFeature('create_spacing_specs');

	try {
		setModel();
		if (hostApplication === illustrator)
			evalScript("$.specctrAi.createSpacingSpecs()");
		else
			evalScript("$.specctrPsSpacing.createSpacingSpecs()");

	} catch (e) {
		console.log(e);
	}
}

/**
 * Call the 'createCoordinateSpecs' method from .jsx based on host application.
 */
function createCoordinateSpecs() {
	analytics.trackFeature('create_coordinate_specs');

	try {
		setModel();
		if (hostApplication === illustrator)
			evalScript("$.specctrAi.createCoordinateSpecs()");
		else
			evalScript("$.specctrPsCoordinates.createCoordinateSpecs()");

	} catch (e) {
		console.log(e);
	}
}

/**
 * Call the 'addNoteSpecs' method from .jsx based on host application.
 */
function addNoteSpecs() {
	analytics.trackFeature('create_note_specs');

	try {
		setModel();
		if (hostApplication === illustrator)
			evalScript("$.specctrAi.addNoteSpecs()");
		else
			evalScript("$.specctrPsAddNote.addNoteSpecs()");

	} catch (e) {
		console.log(e);
	}
}
/**
 * Call the 'createPropertySpecsForItem' method from .jsx based on host application.
 */
function createPropertySpecs() {
	analytics.trackFeature('create_property_specs');

	try {
		setModel();
		if (hostApplication === illustrator)
			evalScript("$.specctrAi.createPropertySpecs()");
		else
			evalScript("$.specctrPsProperties.createPropertySpecsForItem()");

	} catch (e) {
		console.log(e);
	}
}

/**
 * Call the 'exportCss' method from .jsx based on host application.
 */
function exportCss() {
	analytics.trackFeature('export_css');

	try {
		setModel();
		if (hostApplication === illustrator)
			evalScript("$.specctrAi.exportCss()");
		else
			evalScript("$.specctrPsExportCss.exportCss()");

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
 * Dispatch event to loose the focus from photoshop html panel.
 */
function loseFocusFromPanel() { 
		if(extensionId === '')
			extensionId = getExtensionId();
		var csEvent = new CSEvent("com.adobe.PhotoshopLoseFocus", "APPLICATION");  
		csEvent.extensionId = extensionId;
		var csInterface = new CSInterface();
		csInterface.dispatchEvent(csEvent);
}
