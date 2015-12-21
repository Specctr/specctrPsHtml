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
    
    this.setModelToButtons();
    this.setModelToUIComponents();
   // this.setModelToResponsive();
    
    Specctr.Auth.checkStatus(Specctr.Activation);
});

Specctr.Init.setModelToButtons = function() {
	//Set icon and cell selection of property button according to model value;
	Specctr.buttonHandlers.setPropertyButton(model.specOption);
	
	//Set icon and cell selection of width/height button.
	Specctr.buttonHandlers.setDimensionButton(model.heightPos, model.widthPos);
	
	//Set icon and cell selection of spacing button.
	Specctr.buttonHandlers.setSpacingButton();
	
	//Set icon and cell selection of coordinates button.
	Specctr.buttonHandlers.setCoordinateButton(model.coordinateCellNumber);
	
	//Set icon and cell selection of cloud button.
	Specctr.buttonHandlers.setCloudButton(model.cloudOption);
	
	//Set icons to the buttons.
	var iconPostString = ".png";
	var buttonIconPaths = ["NoteButtonIcons/Icon_note", 
	                       "ExpandButtonIcons/Icon_expand"];

	var buttonIds = ["#imgNote", "#imgExpand"];

	if(window.devicePixelRatio > 1)	//For retina display: 2 pixel ratio; 
		iconPostString = "_x2" + iconPostString;

	var arrayLength = buttonIds.length;
	for (var i = 0; i < arrayLength; i++) {
		$(buttonIds[i]).attr("src", imagePath + buttonIconPaths[i] + iconPostString);
	}
	
};

/**
 * Set the Specctr configuration file data to model values.
 */
Specctr.Init.setModelValueFromPreferences = function() {
	var appPrefs = pref.readAppPrefs();

	if (!appPrefs || !appPrefs.hasOwnProperty("shapeAlpha"))
		return;

	var i;
	var propertyName = [ "textFont", "textSize", "textLayerName", "textColor"];
	var arrayLength = propertyName.length;
	for (i = 0; i < arrayLength; i++){
		model[propertyName[i]] = appPrefs[propertyName[i]] ? true : false;
	}

//	var textBoxIds = ["canvasExpandSize", "legendFontSize", "armWeight"];
//	arrayLength = textBoxIds.length;
//	for (i = 0; i < arrayLength; i++) {
//		model[textBoxIds[i]] = Number(appPrefs[textBoxIds[i]]);
//	}
//
//	var dropDownIds = ["legendColorObject", "legendColorType", "legendColorSpacing",
//	                   "legendColorMode", "decimalFractionValue", "legendFont"];
//	arrayLength = dropDownIds.length;
//	for (i = 0; i < arrayLength; i++) {
//		if (appPrefs.hasOwnProperty(dropDownIds[i]))
//			model[dropDownIds[i]] = appPrefs[dropDownIds[i]];
//	}
//	
//	var buttonCellValues = ["specOption", "heightPos", "widthPos", "spaceLeft",
//	                        "spaceTop", "spaceRight", "spaceBottom", "coordinateCellNumber",
//	                        "cloudOption"];
//	arrayLength = buttonCellValues.length;
//	for (i = 0; i < arrayLength; i++) {
//		if (appPrefs.hasOwnProperty(buttonCellValues[i]))
//			model[buttonCellValues[i]] = appPrefs[buttonCellValues[i]];
//	}
};

/**
 * Set model values to UI components.
 */
Specctr.Init.setModelToUIComponents = function() {
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
		Specctr.Utility.disableTextField(textFieldIds[i]);
		Specctr.Utility.disableTextField(textFieldIds[i+1]);
	}
};
