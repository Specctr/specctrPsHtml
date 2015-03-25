/*
File-Name: propertiesButtonHandlers.js
Description: This file includes all the handlers and methods related to properties popup button.
 */

/**
 * Closing/Opening Spacing popup button according to dropdown cell selection and call 
 * creating property spec function accordingly.
 * */
function propertiesButton_clickHandler() {
	try {
		//Close the spacing drop down, if open.
		if ($("#spacingDropDown").is(":visible")) {
			closeDropDown("#liSpacing", "#btnSpacing", "#imgSpacingDdlArrow");
		}
		if ($("#coordinateDropDown").is(":visible")) {
			closeDropDown("#liCoordinate", "#btnCoordinate", "#imgCoordinateDdlArrow");
		}
		if ($("#dimensionDropDown").is(":visible")) {
			closeDropDown("#liWh", "#btnWh", "#imgWhDdlArrow");
		}
			
		$("#liProperties .options").slideUp(100);
		$("#imgPropertiesDdlArrow").removeClass("dropdownArrowUp");
		$("#btnProperties").removeClass("buttonSelected");
		$("#liProperties").removeClass("isOpen");
		createPropertySpecs();
			
	} catch (e) {
		console.log(e);
	}
}

/**
 * Adding/Removing style classes on opening/closing of property drop-down.
 * */
function propertiesDropDown_clickHandler(event) {
	try {
		event.stopPropagation();	//Stop the click event from bubbling to parent div.
		
		//Close the spacing drop down, if open.
		if ($("#spacingDropDown").is(":visible")) {
			closeDropDown("#liSpacing", "#btnSpacing", "#imgSpacingDdlArrow");
		}
		if ($("#coordinateDropDown").is(":visible")) {
			closeDropDown("#liCoordinate", "#btnCoordinate", "#imgCoordinateDdlArrow");
		}
		if ($("#dimensionDropDown").is(":visible")) {
			closeDropDown("#liWh", "#btnWh", "#imgWhDdlArrow");
		}

		if ($("#propertiesDropDown").is(":visible")) {
			$("#liProperties").removeClass("isOpen");
			$("#btnProperties").removeClass("buttonSelected");
		} else {
			$("#liProperties").addClass("isOpen");
			$("#btnProperties").addClass("buttonSelected");
		}

		$("#liProperties .options").slideToggle(100);
		$("#imgPropertiesDdlArrow").toggleClass("dropdownArrowUp");
	} catch (e) {
		console.log(e);
	}
}

/**
 * Change the appearance of selected cell in the property dropdown.
 * @param cellId {string} The id of selected cell.
 * @param selectionClass {string} The css class that has to be toggled.
 * */
function propertiesCell_clickHandler(cellId, selectionClass, specOption) {
	var cellHandler = $("#" + cellId);
	removeSelectedPropertiesCell(cellHandler.parent());

	//Set values according to cell selection.
	model.specOption = specOption;

	cellHandler.addClass(selectionClass); //Select the cell.
//	changeDimensionButtonIcon(); //Change button icon.
}

/**
 * Remove selected cells in a given row of property dropdown.
 * @param parent {object} The parent object of the selected cell.
 * */
function removeSelectedPropertiesCell(parent) {
	var classForSelection = [ "lineOptionSelected", "bulletOptionSelected"];

	//Remove selection classes from each cell.
	for (var i = 0; i <= 1; i++)
		parent.children().eq(i).removeClass(classForSelection[i]);
}