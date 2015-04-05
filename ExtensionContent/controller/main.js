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
function completeHandler(response, status) {
	var logData = createLogData(response.message);
	addFileToPreferenceFolder('.log', logData);	//Create log file.

	// If unsuccessful, return without saving the data in file.
	if (response.success) {
		analytics.trackActivation('succeeded');	
		var activationPrefs = {
			licensed : true,
			machine_id: response.machine_id,
			api_key: response.api_key
		};
		addFileToPreferenceFolder('.license', JSON.stringify(activationPrefs)); //Create license file.
		init();
	} else {
		analytics.trackActivation('failed');
		showDialog(response.message);
		return;
	}
}

/**
 * Set model values to UI components.
 */
function setModelToUIComponents() {
	
	//Set icons to the buttons.
	var iconPostString = ".png";
	var buttonIconPaths = ["../Images/Icon_object", "../Images/Icon_coordinates",
	                       "../Images/DimensionButtonIcons/WH_11", 
	                       "../Images/SpacingButtonIcons/Spacing_TL"];
	var buttonIds = ["#imgProperty", "#imgCoordinate", "#dimensionIcon", "#spacingIcon"];
	
	if(window.devicePixelRatio > 1)	//For retina display: 2 pixel ratio; 
		iconPostString = "_x2" + iconPostString;

	for (var i = 0; i < 4; i++) {
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
	                    "textTracking", "textAlpha", "useHexColor", "useScaleBy",
	                    "rgbTransformIntoPercentage"];
	
	if (hostApplication === photoshop) {
		appSpecificCheckBoxesId = ["shapeFill", "shapeStroke", 
		                           "shapeEffects", "textEffects"];
	} else {
		appSpecificCheckBoxesId = ["shapeFillColor", "shapeFillStyle", 
		                           "shapeStrokeColor", "shapeStrokeStyle", 
		                           "shapeStrokeSize", "specToEdge"];
	}

	Array.prototype.push.apply(checkBoxesId, appSpecificCheckBoxesId);
	var totalCheckBoxes = checkBoxesId.length;
	
	for (var i = 0; i < totalCheckBoxes; i++) {
		$("#"+checkBoxesId[i]).prop("checked", model[checkBoxesId[i]]);
	}
	
	//Set color for dropdown.
	$("#colObject").css("background-color", model.legendColorObject);
	$("#colType").css("background-color", model.legendColorType);
	$("#colSpacing").css("background-color", model.legendColorSpacing);
	
	//Set radio buttons values.
	var radioButtonIds = [model.legendColorMode.toLowerCase(), 
	                       model.decimalFractionValue];
	for (var i = 0; i < 2; i++) {
		$("#"+radioButtonIds[i]+"RadioButton").prop("checked", true);
	}
	
	// Enable or disable scale text according to selection of check box.
	if (model.useScaleBy)
		enableTextField(document.getElementById("txtScaleBy"));
	else
		disableTextField(document.getElementById("txtScaleBy"));
	
	//Get font list according to host application.
	var extScript = "$.specctr"+ hostApplication +"." + "getFontList()";
	evalScript(extScript, loadFontsToList);
}

/**
 * Set the values of the objects(check boxes in responsive tab) from model and
 * enable/disable the text boxes.
 */
function setModelToResponsive() {
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
 * Load the jsx and show/hide the login container 
 * according to the license value in preferences.
 */
function onLoaded() {
	// Handle exceptions of any missing components.
	try {
		alert("YO");
		createDialog();
		var isLicensed = false;
		var appPrefs;

		//Get the host application name.
		hostApplication = getHostApp();
		loadJSX(); // Load the jsx files present in \jsx folder.

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

		addApplicationEventListener(hostApplication);
		appPrefs = readAppPrefs();	//Read the config file and look for the isLicensed value.
		if (appPrefs !== "") {
			if (appPrefs.hasOwnProperty("isLicensed"))
				isLicensed = appPrefs.isLicensed;
			setModelValueFromPreferences();
		}

		//Migrating isLicensed from config file to license file, if present.
		var activationPrefs = {};
		
		var licenseFilePath = getFilePath('.license');
		activationPrefs = readFile(licenseFilePath);	//Read the licensed file.

		if (activationPrefs === "")
			return;
		else
			activationPrefs = JSON.parse(activationPrefs);

		isLicensed = activationPrefs.licensed;
		licenseCode = activationPrefs.code;
		

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

		setModelToUIComponents();
		setModelToResponsive();
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
	                    "useScaleBy","specInEM", "rgbTransformIntoPercentage"];
	
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
	
	var dropDownIds = ["legendColorObject", "legendColorType", "legendColorSpacing",
	                   "legendColorMode", "decimalFractionValue", "legendFont"];
	for (i = 0; i < 6; i++) {
		if (appPrefs.hasOwnProperty(dropDownIds[i]))
			model[dropDownIds[i]] = appPrefs[dropDownIds[i]];
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
		csInterface.evalScript('$._ext.evalFiles("' + extensionRoot + '","' + hostApplication + '")');
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
		evalScript("$.specctr" + hostApplication + "." + methodName);
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
		evalScript("$.specctr" + hostApplication + "." + "createCanvasBorder()");
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
		evalScript("$.specctr" + hostApplication + "." + "createDimensionSpecs()");
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
		evalScript("$.specctr" + hostApplication + "." + "createSpacingSpecs()");
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
		evalScript("$.specctr" + hostApplication + "." + "createCoordinateSpecs()");
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
		evalScript("$.specctr" + hostApplication + "." + "addNoteSpecs()");
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
		evalScript("$.specctr" + hostApplication + "." + "createPropertySpecs()");
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
		evalScript("$.specctr" + hostApplication + "." + "exportCss()");
	} catch (e) {
		console.log(e);
	}
}

function syncCss() {
	try{
		setModel();
		// Upload specs to Specctr.
		cssText = evalScript("$.specctrPsExportCss.getCss()", function(cssInfo){
			var css = JSON.parse(cssInfo);
			var cssJson = CSSJSON.toJSON(css.text);
			var data = JSON.stringify({
				api_key: api_key,
				machine_id: machine_id,
				document_name: css.document_name,
				css_items: cssJson.children
			});
			$.ajax({
				url: SPECCTR_API + "/css_items",
				type: "POST",
				contentType: "application/json;charset=utf-8",
				dataType: "json",
				data: data,
				success: function(response) {
					alert('success');
				},
				error: function(xhr) {
					alert('error');
				}
			});
		});
	} catch(e) {
		console.log(e);
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
		var fontPos = -1; 
		var fontListHandler = document.getElementById("lstFont");

		// Set the font list to combo-box.
		for (var i = 0; i < fontLength; i++) {
			var option = document.createElement("option");
			option.text = font[i].font;
			option.value = font[i].label;
			fontListHandler.add(option, i);
			if(option.text == model.legendFont) {
				fontPos = i;
				model.legendFontFamily = font[i].label;
			}
		}

		if(fontPos == -1) {
			// Select the font from the legendFont value and apply it.
			for (i = 0; i < fontLength; i++) {
				var fontListOption = fontListHandler.options[i];
				if (fontListOption.text.indexOf("Arial") >= 0) {
					model.legendFont = fontListOption.text;
					model.legendFontFamily = fontListOption.value;
					fontPos = i;
					break;
				}
			}
		}

		fontListHandler.options[fontPos].selected = true;
	} catch (e) {
		console.log(e);
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

/**
 * Add Ai event listener for art selection change.
 */
function addApplicationEventListener(app) { 
	if(app === illustrator) {
		try {
			AIEventAdapter.getInstance().addEventListener(AIEvent.ART_SELECTION_CHANGED, 
					selectionChangeListener);
		} catch(e) {
			alert(e);
		}
	}
}

/**
 * Calling updateConnection method on art selection change notifier for Ai.
 */
function selectionChangeListener(event) {
	try {
		AIEventAdapter.getInstance().removeEventListener(AIEvent.ART_SELECTION_CHANGED, selectionChangeListener);
	} catch(e) {}
	
	try {
		setModel();
		evalScript("$.specctr" + hostApplication + "." + "updateConnection()");
	} catch (e) {}
	
	try {
		AIEventAdapter.getInstance().addEventListener(AIEvent.ART_SELECTION_CHANGED, 
				selectionChangeListener);
	} catch(e) {}
}
