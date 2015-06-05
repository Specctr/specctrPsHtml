/*
File-Name: specctrInit.js
Description: Initialize the specctr panel and load the components value according to preferences.
 */

Specctr = Specctr || {};
Specctr.Init = {};

/**
 * Initialize the values of the tab conatainer's components.
 */
Specctr.Init.init = Specctr.Utility.tryCatchLog(function() {
	pref.log("Initializing Specctr.");
	// Load tab container..
	$("#loginContainer").hide();
	$("#tabContainer").show();

	this.setModelValueFromPreferences();
	var navitem = $("#tabContainer .tabs ul li:eq(0)"); // Set current tab.

	// Store which tab we are on.
	var ident = navitem.attr("id").split("_")[1];
	navitem.parent().attr("data-current", ident);

    Specctr.Utility.changeImagesOfTabs(parseInt(ident)); // Set Current Tab with proper Image.

	// Set current tab with class of active tab header.
	navitem.attr("class", "tabActiveHeader");

	// Hide the tab contents we don't need.
	var noOfPages = $(".tabpage").length;
	for (var i = 1; i < noOfPages; i++)
		$("#tabpage_" + (i + 1)).css("display", "none");

    // Register click events to all tabs.
    $("#tabContainer .tabs ul li").each(function(){
        $(this).click(Specctr.UI.tabClickHandler);
    });

    // Register click and mouseover events to colorpicker color blocks.
    $("#colorShapeDropDown .colorBlock").each(function(){
        $(this).click(function(){
            Specctr.UI.setColorToLabel(this, 'Object');
        });
        $(this).mouseover(function(){
            Specctr.UI.setColorValueToTextBox(this, 'Shape');
        });
    });
    
    $("#colorTypeDropDown .colorBlock").each(function(){
        $(this).click(function(){
            Specctr.UI.setColorToLabel(this, 'Type');
        });
        $(this).mouseover(function(){
            Specctr.UI.setColorValueToTextBox(this, 'Type');
        });
    });
    
    $("#colorSpaceDropDown .colorBlock").each(function(){
        $(this).click(function(){
            Specctr.UI.setColorToLabel(this, 'Spacing');
        });
        $(this).mouseover(function(){
            Specctr.UI.setColorValueToTextBox(this, 'Space');
        });
    });
    
    this.setModelToUIComponents();
    this.setModelToResponsive();
    
    Specctr.Auth.checkStatus(Specctr.Activation);
});

/**
 * Set the Specctr configuration file data to model values.
 */
Specctr.Init.setModelValueFromPreferences = function() {
	var appPrefs = pref.readAppPrefs();

	if (!appPrefs || !appPrefs.hasOwnProperty("shapeAlpha"))
		return;

	var i, propertyApplicationSpecific;
	var propertyName = ["shapeLayerName", "shapeAlpha", "shapeBorderRadius", "textFont", "textSize",
	                    "textLayerName", "textAlignment", "textColor", "textStyle", "textLeading", 
	                    "textTracking", "textAlpha","specInPrcntg", "useScaleBy",
	                    "specInEM", "specToEdge", "includeStroke"];

	if (hostApplication === photoshop) {
		propertyApplicationSpecific = ["shapeFill", "shapeStroke", "shapeEffects", "textEffects"];
	} else {
		propertyApplicationSpecific = ["shapeFillColor", "shapeFillStyle", "shapeStrokeColor", 
		                               "shapeStrokeStyle", "shapeStrokeSize"];
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
Specctr.Init.setModelToUIComponents = function() {
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
	var checkBoxesId = ["shapeLayerName", "shapeAlpha", "shapeBorderRadius", "textFont", "textSize",
	                    "textLayerName", "textColor", "textStyle", "textAlignment", "textLeading",
	                    "textTracking", "textAlpha", "useScaleBy", "specToEdge", "includeStroke"];

	if (hostApplication === photoshop) {
		appSpecificCheckBoxesId = ["shapeFill", "shapeStroke", 
		                           "shapeEffects", "textEffects"];
	} else {
		appSpecificCheckBoxesId = ["shapeFillColor", "shapeFillStyle", 
		                           "shapeStrokeColor", "shapeStrokeStyle", 
		                           "shapeStrokeSize"];
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
	Specctr.Utility.createDropForColorPicker("colObject", 5, 0, model.legendColorObject);
	Specctr.Utility.createDropForColorPicker("colType", 5, 0, model.legendColorType);
	Specctr.Utility.createDropForColorPicker("colSpacing", 5, 0, model.legendColorSpacing);

	//Set radio buttons values.
	var radioButtonIds = [model.decimalFractionValue];
	arrayLength = radioButtonIds.length;
	for (var i = 0; i < arrayLength; i++) {
		$("#" + radioButtonIds[i] + "RadioButton").prop("checked", true);
	}

	// Enable or disable scale text according to selection of check box.
	if (model.useScaleBy)
		Specctr.Utility.enableTextField("txtScaleBy");
	else
		Specctr.Utility.disableTextField("txtScaleBy");

	//Get font list according to host application.
	var extScript = "$.specctr"+ hostApplication +"." + "getFontList()";
	evalScript(extScript, loadFontsToList);
};

/**
 * Set the values of the objects(check boxes in responsive tab) from model and
 * enable/disable the text boxes.
 */
Specctr.Init.setModelToResponsive = function() {
	var textFieldIds = ["relativeWidth", "relativeHeight",
	                    "baseFontSize", "baseLineHeight"];

	var checkBoxIds = ["specInPrcntg", "specInEM"];
	var arrayLength = textFieldIds.length;

	for (var i = 0; i < arrayLength; i += 2) {
		$("#" + checkBoxIds[i/2]).prop("checked", model[checkBoxIds[i/2]]);
		if (model[checkBoxIds[i/2]]) {
			Specctr.Utility.enableTextField(textFieldIds[i]);
			Specctr.Utility.enableTextField(textFieldIds[i+1]);
		} else {
			Specctr.Utility.disableTextField(textFieldIds[i]);
			Specctr.Utility.disableTextField(textFieldIds[i+1]);
		}
	}
};
