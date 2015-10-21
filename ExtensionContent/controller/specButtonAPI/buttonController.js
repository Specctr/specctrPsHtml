/*
File-Name: buttonController.js
Description: Consist all the back end features of buttons in the panel like changing icon of spec buttons, 
calling jsx methods etc.
 */

var buttonController = {};

function CommonCallBack() {
	$("#spinnerBlock").hide();
}

/**
 * Call the 'createDimensionSpecsForItem' method from .jsx based on host application.
 */
buttonController.createDimensionSpecs = function() {
	analytics.trackFeature('create_dimension_specs');
	setModel();
	$("#spinnerBlock").show();
	evalScript("$.specctr" + hostApplication + "." + "createDimensionSpecs()", CommonCallBack);
};

/**
 * Call the 'createSpacingSpecs' method from .jsx based on host application.
 */
buttonController.createSpacingSpecs = function() {
	analytics.trackFeature('create_spacing_specs');
	setModel();
	$("#spinnerBlock").show();
	evalScript("$.specctr" + hostApplication + "." + "createSpacingSpecs()", CommonCallBack);
};

/**
 * Call the 'createCoordinateSpecs' method from .jsx based on host application.
 */
buttonController.createCoordinateSpecs = function() {
	analytics.trackFeature('create_coordinate_specs');
	setModel();
	$("#spinnerBlock").show();
	evalScript("$.specctr" + hostApplication + "." + "createCoordinateSpecs()", CommonCallBack);
};

/**
 * Call the 'createPropertySpecsForItem' method from .jsx based on host application.
 */
buttonController.createPropertySpecs = function() {
	analytics.trackFeature('create_property_specs');
	setModel();
	$("#spinnerBlock").show();
	evalScript("$.specctr" + hostApplication + "." + "createPropertySpecs()", CommonCallBack);
};

buttonController.cloudButtonHandler = function() {
	
	if(model.cloudOption == "import") {		//Download
		analytics.trackFeature('export_css');
		setModel();
		$("#spinnerBlock").show();
		evalScript("$.specctr" + hostApplication + "." + "exportCss()", CommonCallBack );
		return;
	}


	
	//Check if document is open or not and fetch the project Id associated with it.
	setModel();
	evalScript("$.specctr" + hostApplication + "." + "getProjectIdOfDoc()", function (projectId) {
		
		//$("#spinnerBlock").hide();
		if(projectId == "false")
			return;

		var data = {
			api_key: api_key,
			machine_id: machine_id,
		};
		
		//Get project list from server.
		Specctr.cloudAPI.getProjectList(data, projectId);
	});		
};

/**
 * Open the dialog with the passed message.
 * @param id {string} li tag id of button.
 * @param button {string} button id.
 * @param dropDownId {string} button's dropdown id.
 */
buttonController.closeDropDown = function(id, button, dropDownId) {
	var liButton = id + " .options";
	$(liButton).slideUp(100);
	Specctr.UI.setHover(button, bgColorHoverButton, bgColorButton);
	$(id).removeClass("isOpen");
	$(button).removeClass("buttonSelected");
	$(button).css('background-color', bgColorButton);
	$(dropDownId).removeClass().addClass("dropdownArrow");
};

/**
 * Close all button's drop-down except the button id passed in parameter.
 * @param parentId {string} parent (button) id of dropdown.
 * */
buttonController.closeAllDropDown = function(parentId) {
	var dropDownIds = ["#spacingDropDown", "#coordinateDropDown", "#noteDropDown",
	                   "#dimensionDropDown", "#propertiesDropDown", "#expandDropDown",
	                   "#cloudUploadDropDown"];
	var arrayLength = dropDownIds.length;
	
	for (var i = 0; i < arrayLength; i++) {
		var liId = "#" + $(dropDownIds[i]).parent().attr("id");
		var buttonId = $(liId + " div:nth-child(1)").attr("id");
		var imageDropDownId = "#" + $("#" + buttonId + " div:nth-child(3)").children(":first").attr("id");
		if($(dropDownIds[i]).is(":visible") && parentId != buttonId)
			this.closeDropDown(liId, "#" + buttonId, imageDropDownId);
	}
};

/**
 * Open button's drop-down.
 * @param buttonId {string} Id of spec dropdown button.
 * */
buttonController.openDropDown = function(buttonId) {
	//Open the button dropdown.
	buttonId = "#" + buttonId;
	var liId = "#" + $(buttonId).parent().attr("id");
	var imageDropDownId = "#" + $(buttonId + " div:nth-child(3)").attr("id");

	$(liId + " .options").slideDown(100);
	$(imageDropDownId).addClass("dropdownArrowUp");
	$(buttonId).addClass("buttonSelected");
	$(liId).addClass("isOpen");
};

/**
 * Toggle classes of selected button's drop-down.
 * */
buttonController.toggleDropDown = function(id, button, dropDownId, imgDropDown) {
	if ($(dropDownId).is(":visible")) {
		Specctr.UI.setHover(button, bgColorHoverButton, bgColorButton);
		$(id).removeClass("isOpen");
		$(button).removeClass("buttonSelected");
	} else {
		$(id).addClass("isOpen");
		$(button).addClass("buttonSelected");
		$(button).css("background-color", bgColorHoverButton);
		$(button).off( "mouseenter mouseleave" );
	}

	$(id + " .options").slideToggle(100);
	$(imgDropDown).toggleClass("dropdownArrowUp");
};

/**
 * Remove selected cells in a given row of dropdown.
 * @param parent {object} The parent object of the selected cell.
 * @param classArray {array} Array of classes applied on cells.
 * @param startIndex {int} Index of selected cell.
 * */
buttonController.removeClassesOfCell = function(parent, classArray, startIndex) {
	var classLength = classArray.length;
	var endIndex = startIndex + classLength;

	//Remove selection classes from each cell.
	for (var i = startIndex; i < endIndex; i++)
		parent.children().eq(i).removeClass(classArray[i % classLength]);
};

/**
 * Change the dimension button icon according to the selection of cells in the grid.
 * */
buttonController.changeDimensionButtonIcon = function() {
	var dimensionIcon = imagePath + "DimensionButtonIcons/WH_";
	var imageExtension = ".png";

	//For retina display: 2 pixel ratio; 
	if(window.devicePixelRatio > 1)
		imageExtension = "_x2.png";

	var dimensionIcons = [];
	var min = 0, max = 3;

	//Creating and initializing 2D array with dimension button icons.
	for (var i = min; i <= max; i++) {
		dimensionIcons.push([]);
		dimensionIcons[i].push(new Array(max));
		for (var j = min; j <= max; j++)
			dimensionIcons[i][j] = dimensionIcon + i + "" + j + imageExtension;
	}

	$("#dimensionIcon").attr("src", dimensionIcons[model.widthPos][model.heightPos]);
};

/**
 * Change the spacing button icon according to the selection of cells in the grid.
 * */
buttonController.changeSpacingButtonIcon = function() {
	var iconPath = imagePath + "SpacingButtonIcons/Spacing_";
	var imageExtension = ".png";

	//For retina display: 2 pixel ratio; 
	if(window.devicePixelRatio > 1)
		imageExtension = "_x2.png";

	//Array of spacing button icons.
	var spacingIcons = [ iconPath + "None" + imageExtension, iconPath + "B" + imageExtension,
	                     iconPath + "L" + imageExtension, iconPath + "BL" + imageExtension, 
	                     iconPath + "R" + imageExtension, iconPath + "BR" + imageExtension, 
	                     iconPath + "LR" + imageExtension, iconPath + "BLR" + imageExtension,
	                     iconPath + "T" + imageExtension, iconPath + "BT" + imageExtension, 
	                     iconPath + "TL" + imageExtension, iconPath + "LTB" + imageExtension, 
	                     iconPath + "TR" + imageExtension, iconPath + "BTR" + imageExtension, 
	                     iconPath + "LTR" + imageExtension, iconPath + "All" + imageExtension];

	//Calculate the index of button icon.
	var indexSpacingIcon = (model.spaceTop | 0) * 8
	+ (model.spaceRight | 0) * 4 + (model.spaceLeft | 0) * 2
	+ (model.spaceBottom | 0);

	$("#spacingIcon").attr("src", spacingIcons[indexSpacingIcon]);
};

/**
 * Change the property button icon according to the selection of cells in the grid.
 * */
buttonController.changePropertyButtonIcon = function (){
	var iconPath = imagePath + "PropertiesDropDownIcons/spec";
	var imageExtension = ".png";

	//For retina display: 2 pixel ratio; 
	if(window.devicePixelRatio > 1)
		imageExtension = "_x2.png";

	iconPath = iconPath + model.specOption + "_selected" + imageExtension;
	$("#imgProperty").attr("src", iconPath);
};

buttonController.changeCloudButtonIcon = function(){
	var iconPath = imagePath + "CloudUploadDropDownIcons/";
	var imageExtension = ".png";

	//For retina display: 2 pixel ratio; 
	if(window.devicePixelRatio > 1)
		imageExtension = "_x2.png";

	iconPath = iconPath + model.cloudOption + "CSS_selected" + imageExtension;
	$("#imgExportCss").attr("src", iconPath);
};

buttonController.changeCoordinateButtonIcon = function () {
	var iconPath = imagePath + "CoordinateButtonIcons/Icon_coordinates";
	var imageExtension = ".png";

	//For retina display: 2 pixel ratio; 
	if(window.devicePixelRatio > 1)
		imageExtension = "_x2.png";

	iconPath = iconPath + imageExtension;
	$("#imgCoordinate").attr("src", iconPath);
};