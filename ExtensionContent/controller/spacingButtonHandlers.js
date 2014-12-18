/*
File-Name: spacingButtonHandlers.js
Description: This file includes all the handlers and methods related to spacing popup button.  
 */

/**
 * Closing/Opening Spacing popup button according to dropdown cell selection and call 
 * creating spacing spec function accordingly.
 * */
function spacingButton_clickHandler() {
	try {
		if (!model.spaceTop && !model.spaceRight && !model.spaceLeft
				&& !model.spaceBottom) {
			$("#liSpacing .options").slideDown(100);
			$("#btnSpacing").addClass("buttonSelected");
			$("#imgSpacingDdlArrow").addClass("dropdownArrowUp");
			$("#liSpacing").addClass("isOpen");
		} else {
			$("#liSpacing .options").slideUp(100);
			$("#imgSpacingDdlArrow").removeClass("dropdownArrowUp");
			$("#btnSpacing").removeClass("buttonSelected");
			$("#liSpacing").removeClass("isOpen");
			createSpacingSpecs();
		}
	} catch (e) {
		console.log(e);
	}
}

/**
 * Adding/Removing style classes on opening/closing of spacing drop-down.
 * */
function spacingDropDown_clickHandler() {
	try {
		if ($("#spacingDropDown").is(":visible")) {
			$("#liSpacing").removeClass("isOpen");
			$("#btnSpacing").removeClass("buttonSelected");
		} else {
			$("#liSpacing").addClass("isOpen");
			$("#btnSpacing").addClass("buttonSelected");
		}

		$("#liSpacing .options").slideToggle(100);
		$("#imgSpacingDdlArrow").toggleClass("dropdownArrowUp");
	} catch (e) {
		console.log(e);
	}
}

/**
 * Toggle the appearance of cells in the spacing dropdown on selection.
 * @param cellId {string} The id of selected cell.
 * @param selectionClass {string} The css class that has to be toggled.
 * @param cellName {string} The name of the spacing cell.
 * */
function spacingCell_clickHandler(cellId, selectionClass, cellName) {
	try {
		var cellHandler = $("#" + cellId);
		cellHandler.toggleClass(selectionClass);
		model[cellName] = !model[cellName];
		changeSpacingBtnIcon();
	} catch (e) {
		console.log(e);
	}
}

/**
 * Change the spacing button icon according to the selection of cells in the grid.
 * */
function changeSpacingBtnIcon() {
	try {
		var spacingIconHandler = document.getElementById("spacingIcon");
		var iconPath = "../Images/SpacingButtonIcons/Spacing_";

		//Array of spacing button icons.
		var spacingIcons = [ iconPath + "None.png", iconPath + "B.png",
		                     iconPath + "L.png", iconPath + "BL.png", iconPath + "R.png",
		                     iconPath + "BR.png", iconPath + "LR.png", iconPath + "BLR.png",
		                     iconPath + "T.png", iconPath + "BT.png", iconPath + "TL.png",
		                     iconPath + "LTB.png", iconPath + "TR.png",
		                     iconPath + "BTR.png", iconPath + "LTR.png",
		                     iconPath + "All.png" ];

		//Calculate the index of button icon.
		var indexSpacingIcon = (model.spaceTop | 0) * 8
		+ (model.spaceRight | 0) * 4 + (model.spaceLeft | 0) * 2
		+ (model.spaceBottom | 0);

		spacingIconHandler.src = spacingIcons[indexSpacingIcon];
	} catch (e) {
		console.log(e);
	}
}