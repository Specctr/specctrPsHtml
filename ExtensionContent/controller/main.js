/*
File-Name: main.js
Description: Include methods to initialize the panel's component according to the stored preferences.  
Include all spec button click handlers and methods to communicate between js and jsx.  
 */

var specctrInit = {};

/**
 * Load the jsx and show/hide the login container 
 * according to the license value in preferences.
 */
function onLoaded() {
	// Handle exceptions of any missing components.
	try {
		specctrDialog.createAlertDialog();
		var isLicensed = false;
		var appPrefs;

		//Get the host application name.
		hostApplication = specctrUtility.getHostApp();
		loadJSX(); // Load the jsx files present in \jsx folder.

		if (hostApplication === '') {
			specctrDialog.showAlert('Cannot load the extension.\nRequired host application not found!');
			return;
		} else if (hostApplication === photoshop) {
			$(".psElement").show();
			$(".nonPsElement").hide();
		}

		addApplicationEventListener();
		appPrefs = pref.readAppPrefs();	//Read the config file and look for the isLicensed value.
		if (appPrefs !== "") {
			if (appPrefs.hasOwnProperty("isLicensed"))
				isLicensed = appPrefs.isLicensed;
			specctrInit.setModelValueFromPreferences();
		}

		//Migrating isLicensed from config file to license file, if present.
		var activationPrefs = {};

		var licenseFilePath = pref.getFilePath('.license');
		activationPrefs = pref.readFile(licenseFilePath);	//Read the licensed file.

		if (activationPrefs === "")
			return;
		else
			activationPrefs = JSON.parse(activationPrefs);

		isLicensed = activationPrefs.licensed;
		api_key = activationPrefs.api_key;
		machine_id = activationPrefs.machine_id;

		if (isLicensed)
			specctrInit.init();

	} catch (e) {
		alert(e);
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
 * Initialize the values of the tab conatainer's components.
 */
specctrInit.init = function() {
	// Handle exceptions of missing components
	try {
		// Load tab container..
		$("#loginContainer").hide();
		$("#tabContainer").show();

		this.setModelValueFromPreferences();
		var navitem = $("#tabContainer .tabs ul li:eq(0)"); // Set current tab.

		// Store which tab we are on.
		var ident = navitem.attr("id").split("_")[1];
		navitem.parent().attr("data-current", ident);

		specctrUtility.changeImagesOfTabs(parseInt(ident)); // Set Current Tab with proper Image.

		// Set current tab with class of active tab header.
		navitem.attr("class", "tabActiveHeader");

		// Hide the tab contents we don't need.
		var noOfPages = $(".tabpage").length;
		for (var i = 1; i < noOfPages; i++)
			$("#tabpage_" + (i + 1)).css("display", "none");

		// Register click events to all tabs.
		$("#tabContainer .tabs ul li").each(function(){
			$(this).click(tabClickHandler);
		});

		this.setModelToUIComponents();
		this.setModelToResponsive();
	} catch (e) {
		alert(e);
	}
};

/**
 * Set the Specctr configuration file data to model values.
 */
specctrInit.setModelValueFromPreferences = function() {
	var appPrefs = pref.readAppPrefs();

	if (!appPrefs || !appPrefs.hasOwnProperty("shapeAlpha"))
		return;

	var i, propertyApplicationSpecific;
	var propertyName = ["shapeAlpha", "shapeBorderRadius", "textFont", "textSize",
	                    "textAlignment", "textColor", "textStyle", "textLeading", 
	                    "textTracking", "textAlpha","specInPrcntg", "useScaleBy",
	                    "specInEM"];

	if (hostApplication === photoshop) {
		propertyApplicationSpecific = ["shapeFill", "shapeStroke", "shapeEffects", "textEffects"];
	} else {
		propertyApplicationSpecific = ["shapeFillColor", "shapeFillStyle", "shapeStrokeColor", 
		                               "shapeStrokeStyle", "shapeStrokeSize", "specToEdge"];
	}

	Array.prototype.push.apply(propertyName, propertyApplicationSpecific);
	var arrayLength = propertyName.length;
	for (i = 0; i < arrayLength; i++){
		model[propertyName[i]] = appPrefs[propertyName[i]] ? true : false;
	}

	var textBoxIds = ["canvasExpandSize", "legendFontSize", "armWeight"];
	arrayLength = textBoxIds.length;
	for (i = 0; i < arrayLength; i++) {
		model[textBoxIds[i]] = Number(appPrefs[textBoxIds[i]]);
	}

	var dropDownIds = ["legendColorObject", "legendColorType", "legendColorSpacing",
	                   "legendColorMode", "decimalFractionValue", "legendFont"];
	arrayLength = dropDownIds.length;
	for (i = 0; i < arrayLength; i++) {
		if (appPrefs.hasOwnProperty(dropDownIds[i]))
			model[dropDownIds[i]] = appPrefs[dropDownIds[i]];
	}
};

/**
 * Set model values to UI components.
 */
specctrInit.setModelToUIComponents = function() {
	//Set icons to the buttons.
	var iconPostString = ".png";
	var buttonIconPaths = ["../Images/PropertiesDropDownIcons/specBullet_selected", 
	                       "../Images/CoordinateButtonIcons/Icon_coordinates", 
	                       "../Images/DimensionButtonIcons/WH_11", 
	                       "../Images/SpacingButtonIcons/Spacing_TL", 
	                       "../Images/NoteButtonIcons/Icon_note", 
	                       "../Images/ExpandButtonIcons/Icon_expand",
	                       "../Images/ExportCssButtonIcons/Icon_exportCSS"];

	var buttonIds = ["#imgProperty", "#imgCoordinate", "#dimensionIcon", "#spacingIcon", 
	                 "#imgNote", "#imgExpand", "#imgExportCss"];

	if(window.devicePixelRatio > 1)	//For retina display: 2 pixel ratio; 
		iconPostString = "_x2" + iconPostString;

	var arrayLength = buttonIds.length;
	for (var i = 0; i < arrayLength; i++) {
		$(buttonIds[i]).attr("src", buttonIconPaths[i] + iconPostString);
	}

	//Set text and combo box values.
	$("#canvasExpandSize").val(model.canvasExpandSize);
	$("#lstSize").val(model.legendFontSize);
	$("#lstLineWeight").val(model.armWeight);
	$("#lstColorMode").val(model.legendColorMode);

	//Set check boxes values.
	var appSpecificCheckBoxesId;
	var checkBoxesId = ["shapeAlpha", "shapeBorderRadius", "textFont", "textSize",
	                    "textColor", "textStyle", "textAlignment", "textLeading",
	                    "textTracking", "textAlpha", "useScaleBy"];

	if (hostApplication === photoshop) {
		appSpecificCheckBoxesId = ["shapeFill", "shapeStroke", 
		                           "shapeEffects", "textEffects"];
	} else {
		appSpecificCheckBoxesId = ["shapeFillColor", "shapeFillStyle", 
		                           "shapeStrokeColor", "shapeStrokeStyle", 
		                           "shapeStrokeSize", "specToEdge"];
	}

	Array.prototype.push.apply(checkBoxesId, appSpecificCheckBoxesId);
	arrayLength = checkBoxesId.length;

	for (var i = 0; i < arrayLength; i++) {
		var checkBox = $("#" + checkBoxesId[i]); 
		checkBox.prop("checked", model[checkBoxesId[i]]);
		var parent = checkBox.parent();
		if (parent.hasClass('tabPage2Content') && model[checkBoxesId[i]])
			parent.children().last().addClass("setBlueLabel");
	}

	//Set color for dropdown.
	specctrUtility.setColorPickerColor("#colObject", model.legendColorObject);
	specctrUtility.setColorPickerColor("#colType", model.legendColorType);
	specctrUtility.setColorPickerColor("#colSpacing", model.legendColorSpacing);
	
	//Set radio buttons values.
	var radioButtonIds = [model.decimalFractionValue];
	arrayLength = radioButtonIds.length;
	for (var i = 0; i < arrayLength; i++) {
		$("#" + radioButtonIds[i] + "RadioButton").prop("checked", true);
	}

	// Enable or disable scale text according to selection of check box.
	if (model.useScaleBy)
		specctrUtility.enableTextField("txtScaleBy");
	else
		specctrUtility.disableTextField("txtScaleBy");

	//Get font list according to host application.
	var extScript = "$.specctr"+ hostApplication +"." + "getFontList()";
	evalScript(extScript, loadFontsToList);
};

/**
 * Set the values of the objects(check boxes in responsive tab) from model and
 * enable/disable the text boxes.
 */
specctrInit.setModelToResponsive = function() {
	var textFieldIds = ["relativeWidth", "relativeHeight",
	                    "baseFontSize", "baseLineHeight"];

	var checkBoxIds = ["specInPrcntg", "specInEM"];
	var arrayLength = textFieldIds.length;

	for (var i = 0; i < arrayLength; i += 2) {
		$("#" + checkBoxIds[i/2]).prop("checked", model[checkBoxIds[i/2]]);
		if (model[checkBoxIds[i/2]]) {
			specctrUtility.enableTextField(textFieldIds[i]);
			specctrUtility.enableTextField(textFieldIds[i+1]);
		} else {
			specctrUtility.disableTextField(textFieldIds[i]);
			specctrUtility.disableTextField(textFieldIds[i+1]);
		}
	}
};

//----------------- Specctr Event Listeners -----------------//
/**
 * Dispatch event to loose the focus from photoshop html panel.
 */
function loseFocusFromPanel() {
	if(extensionId === '')
		extensionId = specctrUtility.getExtensionId();
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
