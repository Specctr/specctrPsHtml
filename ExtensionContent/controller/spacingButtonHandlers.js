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
			
			if ($("#coordinateDropDown").is(":visible")) {
				closeDropDown("#liCoordinate", "#btnCoordinate", "#imgCoordinateDdlArrow");
			}
			
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
function spacingDropDown_clickHandler(event) {
	try {
		event.stopPropagation();	//Stop the click event from bubbling to parent div.
		
		if ($("#coordinateDropDown").is(":visible")) {
			closeDropDown("#liCoordinate", "#btnCoordinate", "#imgCoordinateDdlArrow");
		}

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