/*
File-Name: coordinateButtonHandlers.js
Description: This file includes all the handlers and methods related to coordinate popup button.
 */

/**
 * Closing/Opening coordinate popup button according to dropdown cell selection and call 
 * creating coordinate spec function accordingly.
 * */
function coordinateButton_clickHandler() {
	try {
		$("#liCoordinate .options").slideUp(100);
		$("#imgCoordinateDdlArrow").removeClass("dropdownArrowUp");
		$("#btnCoordinate").removeClass("buttonSelected");
		$("#liCoordinate").removeClass("isOpen");
		createCoordinateSpecs();
	} catch (e) {
		console.log(e);
	}
}

/**
 * Adding/Removing style classes on opening/closing of coordinate drop-down.
 * */
function coordinateDropDown_clickHandler(event) {
	try {
		event.stopPropagation();	//Stop the click event from bubbling to parent div.

		if ($("#coordinateDropDown").is(":visible")) {
			$("#liCoordinate").removeClass("isOpen");
			$("#btnCoordinate").removeClass("buttonSelected");
		} else {
			$("#liCoordinate").addClass("isOpen");
			$("#btnCoordinate").addClass("buttonSelected");
		}

		$("#liCoordinate .options").slideToggle(100);
		$("#imgCoordinateDdlArrow").toggleClass("dropdownArrowUp");
	} catch (e) {
		console.log(e);
	}
}

/**
 * Toggle the appearance of cells in the coordinate dropdown on selection.
 * @param cellId {string} The id of selected cell.
 * @param selectionClass {string} The css class that has to be toggled.
 * */
function coordinateCell_clickHandler(cellId, selectionClass) {
	try {
		var cellHandler = $("#" + cellId);
		var selectedCellIndex = cellHandler.index();
		removeSelectedCoordinateCell(cellHandler.parent());
		model.coordinateCellNumber = selectedCellIndex;
		cellHandler.addClass(selectionClass); //Select the cell.
	} catch (e) {
		console.log(e);
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