/*
File-Name: buttonHandlers.js
Description: Handles the functionalities of drop-down buttons in panel such as drop-down open/close feature,
changing icons of buttons on cell selection etc.
 */

/**
 * Closing/Opening Spacing popup button according to dropdown cell selection and call 
 * creating spec function accordingly.
 * */
function specButtonsClickHandler(specButton) {
	try {
		
		//Close all dropdowns.
		closeAllDropDown();

		//Call the spec methods respective to the clicked button's Id.
		if(specButton.id == "btnProperties") {
			createPropertySpecs();
		} else if(specButton.id == "btnWh") {
			
			if (model.widthPos == 0 && model.heightPos == 0) {
				//Open the dropdown.
				$("#liWh .options").slideDown(100);
				$("#imgWhDdlArrow").addClass("dropdownArrowUp");
				$("#btnWh").addClass("buttonSelected");
				$("#liWh").addClass("isOpen");
			} else {
				createDimensionSpecs();
			}
			
		} else if (specButton.id == "btnSpacing"){
			
			if (!model.spaceTop && !model.spaceRight && !model.spaceLeft
					&& !model.spaceBottom) {
				//Open the dropdown.
				$("#liSpacing .options").slideDown(100);
				$("#btnSpacing").addClass("buttonSelected");
				$("#imgSpacingDdlArrow").addClass("dropdownArrowUp");
				$("#liSpacing").addClass("isOpen");
			} else {
				createSpacingSpecs();
			}
			
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
		
		//Close remaining drop downs.
		closeAllDropDown(specButton.parentNode.id);

		//Call the spec methods respective to the clicked button's Id.
		//Make it generic..
		if(specButton.parentNode.id == "btnProperties") {
			toggleDropDown("#liProperties", "#btnProperties",
					"#propertiesDropDown", "#imgPropertiesDdlArrow");
		} else if(specButton.parentNode.id == "btnWh") {
			toggleDropDown("#liWh", "#btnWh",
					"#dimensionDropDown", "#imgWhDdlArrow");
		} else if (specButton.parentNode.id == "btnSpacing"){
			toggleDropDown("#liSpacing", "#btnSpacing",
					"#spacingDropDown", "#imgSpacingDdlArrow");
		} else if (specButton.parentNode.id == "btnCoordinate") {
			toggleDropDown("#liCoordinate", "#btnCoordinate",
					"#coordinateDropDown", "#imgCoordinateDdlArrow");
		}
		
	} catch (e) {
		alert(e);
	}
}

/**
 * Change the appearance of selected cell in the property dropdown.
 * @param cellId {string} The id of selected cell.
 * @param selectionClass {string} The css class that has to be toggled.
 * */
function dropDownCellClickHandler(cellId, selectionClass, modelValue) {
	try {
		var selectedCellIndex;
		var cellHandler = $("#" + cellId);
		
		if(cellHandler.parent().attr("id") == "dimensionDropDown") {
			var selectedRow = cellHandler.attr("title");
			selectedCellIndex = cellHandler.index() % 4;
			removeSelectedCell(selectedRow, cellHandler.parent());

			//Set values according to cell selection in dimension button.
			if (selectedRow == "width")
				model.widthPos = selectedCellIndex;
			else
				model.heightPos = selectedCellIndex;

			cellHandler.addClass(selectionClass); //Select the cell.
			changeDimensionButtonIcon(); //Change button icon.
		} else if (cellHandler.parent().attr("id") == "spacingDropDown") {
			cellHandler.toggleClass(selectionClass);
			model[modelValue] = !model[modelValue];
			changeSpacingButtonIcon();
		} else if (cellHandler.parent().attr("id") == "coordinateDropDown") {
			selectedCellIndex = cellHandler.index();
			removeSelectedCoordinateCell(cellHandler.parent());
			model[modelValue] = selectedCellIndex;
			cellHandler.addClass(selectionClass); //Select the cell.
		} else {
			removeSelectedPropertiesCell(cellHandler.parent());
			//Set values according to cell selection.
			model[modelValue] = modelValue;
			cellHandler.addClass(selectionClass); //Select the cell.
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
function closeDropDown(id, button, dropDownId) {
	var liButton = id + " .options";
	$(liButton).slideUp(100);
	$(id).removeClass("isOpen");
	$(button).removeClass("buttonSelected");
	$(dropDownId).removeClass().addClass("dropdownArrow");
}

/**
 * Close all button's drop-down.
 * */
function closeAllDropDown(parentNode) {
	//Close all drop downs.
	if ($("#spacingDropDown").is(":visible") && parentNode != "btnSpacing") {
		closeDropDown("#liSpacing", "#btnSpacing", "#imgSpacingDdlArrow");
	}
	
	if ($("#coordinateDropDown").is(":visible") && parentNode != "btnCoordinate") {
		closeDropDown("#liCoordinate", "#btnCoordinate", "#imgCoordinateDdlArrow");
	}
	
	if ($("#dimensionDropDown").is(":visible") && parentNode != "btnWh") {
		closeDropDown("#liWh", "#btnWh", "#imgWhDdlArrow");
	}

	if ($("#propertiesDropDown").is(":visible") && parentNode != "btnProperties") {
		closeDropDown("#liProperties", "#btnProperties", "#imgPropertiesDdlArrow");
	}
}

/**
 * Toggle classes of selected button's drop-down.
 * */
function toggleDropDown(id, button, dropDownId, imgDropDown) {
	if ($(dropDownId).is(":visible")) {
		$(id).removeClass("isOpen");
		$(button).removeClass("buttonSelected");
	} else {
		$(id).addClass("isOpen");
		$(button).addClass("buttonSelected");
	}

	$(id + " .options").slideToggle(100);
	$(imgDropDown).toggleClass("dropdownArrowUp");
}
/**
 * Remove selected cells in a given row of dimension dropdown.
 * @param selectedRow {string} The row of the selected cell.
 * @param parent {object} The parent object of the selected cell.
 * */
function removeSelectedCell(selectedRow, parent) {
	var classForSelection;

	//Remove the selected cell in the selected row.
	if (selectedRow == "width") {
		//Selection classes for each cell in width row.
		classForSelection = [ "noSelectionSelected", "widthTopSelected",
				"widthBottomSelected", "widthCenterSelected" ];

		//Remove selection classes from each cell.
		for (var i = 0; i <= 3; i++)
			parent.children().eq(i).removeClass(classForSelection[i]);
	} else {
		//Selection classes for each cell in height row.
		classForSelection = [ "noSelectionSelected", "heightLeftSelected",
				"heightRightSelected", "heightCenterSelected" ];

		//Remove selection classes from each cell.
		for (var i = 4; i <= 7; i++)
			parent.children().eq(i).removeClass(classForSelection[i - 4]);
	}
}

/**
 * Remove selected cells in a given row of coordinate dropdown.
 * @param parent {object} The parent object of the selected cell.
 * */
function removeSelectedCoordinateCell(parent) {
	var classForSelection = [ "topLeftSelected", "topRightSelected",
				"bottomRightSelected", "bottomLeftSelected" ];

	//Remove selection classes from each cell.
	for (var i = 0; i <= 3; i++)
		parent.children().eq(i).removeClass(classForSelection[i]);
}

/**
 * Remove selected cells in a given row of property dropdown.
 * @param parent {object} The parent object of the selected cell.
 * */
function removeSelectedPropertiesCell(parent) {
	var classForSelection = [ "specLineSelected", "specBulletSelected"];

	//Remove selection classes from each cell.
	for (var i = 0; i <= 1; i++)
		parent.children().eq(i).removeClass(classForSelection[i]);
}

/**
 * Change the dimension button icon according to the selection of cells in the grid.
 * */
function changeDimensionButtonIcon() {
	//Handle the exceptions like no image is found..
	try {
		var dimensionIconHandler = document.getElementById("dimensionIcon");
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

		dimensionIconHandler.src = dimensionIcons[model.widthPos][model.heightPos];
	} catch (e) {
		console.log(e);
	}
}

/**
 * Change the spacing button icon according to the selection of cells in the grid.
 * */
function changeSpacingButtonIcon() {
	try {
		var spacingIconHandler = document.getElementById("spacingIcon");
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

		spacingIconHandler.src = spacingIcons[indexSpacingIcon];
	} catch (e) {
		console.log(e);
	}
}
