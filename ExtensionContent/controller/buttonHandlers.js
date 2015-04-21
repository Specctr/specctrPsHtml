/*
File-Name: buttonHandlers.js
Description: Handles the functionalities of drop-down buttons in panel such as drop-down open/close feature,
changing icons of buttons on cell selection etc.
 */

var buttonFeature = {};

/**
 * Closing/Opening Spacing popup button according to dropdown cell selection and call
 * creating spec function accordingly.
 * */
function specButtonsClickHandler(specButton) {
	try {

		//Close all dropdowns.
		buttonFeature.closeAllDropDown();

		//Call the spec methods respective to the clicked button's Id.
		if(specButton.id == "btnProperties") {
			createPropertySpecs();
		} else if(specButton.id == "btnWh") {

			if (!model.widthPos && !model.heightPos) 
				buttonFeature.openDropDown(specButton.id);	//Open width/height button dropdown.
			else 
				createDimensionSpecs();

		} else if (specButton.id == "btnSpacing"){

			if (!model.spaceTop && !model.spaceRight && !model.spaceLeft
					&& !model.spaceBottom) 
				buttonFeature.openDropDown(specButton.id); //Open the spacing button dropdown.
			else 
				createSpacingSpecs();

		} else if (specButton.id == "btnCoordinate") {
			createCoordinateSpecs();
		}

	} catch (e) {
		alert(e);
	}
}

/**
 * Adding/Removing style classes on opening/closing of button's drop-down.
 * */
function buttonDropDownClickHandler(event, specButton) {
	try {
		event.stopPropagation();	//Stop the click event from bubbling to parent div.

		var buttonId = specButton.parentNode.id;
		//Close the remaining drop downs except the element in the parameters.
		buttonFeature.closeAllDropDown(buttonId);

		//Get the ids of selected dropdown elements.
		buttonId = "#" + buttonId;
		var liId = "#" + specButton.parentNode.parentNode.id;
		var dropDownId = "#" + $(liId+" div:nth-child(2)").attr("id");
		var imageDropDownArrowId = "#" + specButton.id;

		//Call the spec methods respective to the clicked button's Id.
		buttonFeature.toggleDropDown(liId, buttonId, dropDownId, imageDropDownArrowId);

	} catch (e) {
		alert(e);
	}
}

/**
 * Change the appearance of selected cell in the property dropdown.
 * @param cellId {string} The id of selected cell.
 * @param selectionClass {string} The css class that has to be toggled.
 * @param modelValue {string} The value to be changed in model object.
 * */
function dropDownCellClickHandler(cellId, selectionClass, modelValue) {
	try {
		var selectedCellIndex, classForSelection;
		var cellHandler = $("#" + cellId);

		if(cellHandler.parent().attr("id") == "dimensionDropDown") {
			var selectedRow = cellHandler.attr("title");
			selectedCellIndex = cellHandler.index() % 4;

			//Set values according to cell selection in dimension button.
			if (selectedRow == "width") {
				//Selection classes for each cell in width row.
				classForSelection = ["noSelectionSelected", "widthTopSelected",
				                     "widthBottomSelected", "widthCenterSelected"];
				buttonFeature.removeClassesOfCell(cellHandler.parent(), classForSelection, 0);
				model.widthPos = selectedCellIndex;
			} else {
				//Selection classes for each cell in height row.
				classForSelection = ["noSelectionSelected", "heightLeftSelected",
				                     "heightRightSelected", "heightCenterSelected"];
				buttonFeature.removeClassesOfCell(cellHandler.parent(), classForSelection, 4);
				model.heightPos = selectedCellIndex;
			}

			cellHandler.addClass(selectionClass);
			buttonFeature.changeDimensionButtonIcon();
		} else if (cellHandler.parent().attr("id") == "spacingDropDown") {

			cellHandler.toggleClass(selectionClass);
			model[modelValue] = !model[modelValue];
			buttonFeature.changeSpacingButtonIcon();

		} else if (cellHandler.parent().attr("id") == "coordinateDropDown") {

			selectedCellIndex = cellHandler.index();
			classForSelection = ["topLeftSelected", "topRightSelected",
			                     "bottomRightSelected", "bottomLeftSelected"];
			buttonFeature.removeClassesOfCell(cellHandler.parent(), classForSelection, 0);
			model[modelValue] = selectedCellIndex;
			cellHandler.addClass(selectionClass);

		} else {

			classForSelection = ["specBulletSelected", "specLineSelected"];
			buttonFeature.removeClassesOfCell(cellHandler.parent(), classForSelection, 0);
			model.specOption = modelValue;
			cellHandler.addClass(selectionClass);
			buttonFeature.changePropertyButtonIcon();
		}

	} catch (e) {
		alert(e);
	}
}

/**
 * Open the dialog with the passed message.
 * @param id {string} li tag id of button.
 * @param button {string} button id.
 * @param dropDownId {string} button's dropdown id.
 */
buttonFeature.closeDropDown = function(id, button, dropDownId) {
	var liButton = id + " .options";
	$(liButton).slideUp(100);
	$(id).removeClass("isOpen");
	$(button).removeClass("buttonSelected");
	$(dropDownId).removeClass().addClass("dropdownArrow");
};

/**
 * Close all button's drop-down except the button id passed in parameter.
 * @param parentId {string} parent (button) id of dropdown.
 * */
buttonFeature.closeAllDropDown = function(parentId) {
	var dropDownIds = ["#spacingDropDown", "#coordinateDropDown",
	                   "#dimensionDropDown", "#propertiesDropDown", "#expandDropDown"];

	for (var i = 0; i < 5; i++) {
		var liId = "#" + $(dropDownIds[i]).parent().attr("id");
		var buttonId = $(liId + " div:nth-child(1)").attr("id");
		var imageDropDownId = "#" + $("#" + buttonId + " div:nth-child(3)").attr("id");
		if($(dropDownIds[i]).is(":visible") && parentId != buttonId)
			this.closeDropDown(liId, "#" + buttonId, imageDropDownId);
	}
};

/**
 * Open button's drop-down.
 * @param buttonId {string} Id of spec dropdown button.
 * */
buttonFeature.openDropDown = function(buttonId) {
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
buttonFeature.toggleDropDown = function(id, button, dropDownId, imgDropDown) {
	if ($(dropDownId).is(":visible")) {
		$(id).removeClass("isOpen");
		$(button).removeClass("buttonSelected");
	} else {
		$(id).addClass("isOpen");
		$(button).addClass("buttonSelected");
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
buttonFeature.removeClassesOfCell = function(parent, classArray, startIndex) {
	var classLength = classArray.length;
	var endIndex = startIndex + classLength;

	//Remove selection classes from each cell.
	for (var i = startIndex; i < endIndex; i++)
		parent.children().eq(i).removeClass(classArray[i % classLength]);
};

/**
 * Change the dimension button icon according to the selection of cells in the grid.
 * */
buttonFeature.changeDimensionButtonIcon = function() {
	//Handle the exceptions like no image is found..
	try {
		var imagePath = "../Images/DimensionButtonIcons/WH_";
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
				dimensionIcons[i][j] = imagePath + i + "" + j + imageExtension;
		}

		$("#dimensionIcon").attr("src", dimensionIcons[model.widthPos][model.heightPos]);
	} catch (e) {
		console.log(e);
	}
};

/**
 * Change the spacing button icon according to the selection of cells in the grid.
 * */
buttonFeature.changeSpacingButtonIcon = function() {
	try {
		var iconPath = "../Images/SpacingButtonIcons/Spacing_";
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
	} catch (e) {
		console.log(e);
	}
};

/**
 * Change the property button icon according to the selection of cells in the grid.
 * */
buttonFeature.changePropertyButtonIcon = function (){
	try {
		var iconPath = "../Images/PropertiesDropDownIcons/spec";
		var imageExtension = ".png";

		//For retina display: 2 pixel ratio; 
		if(window.devicePixelRatio > 1)
			imageExtension = "_x2.png";

		iconPath = iconPath + model.specOption + "_selected" + imageExtension;
		$("#imgProperty").attr("src", iconPath);

	} catch (e) {
		console.log(e);
	}

};