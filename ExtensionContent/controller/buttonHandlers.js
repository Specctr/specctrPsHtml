/**
 * 
 */

/**
 * Closing/Opening Spacing popup button according to dropdown cell selection and call 
 * creating property spec function accordingly.
 * */
function button_clickHandler(event) {
	try {
		
		alert(event.id);

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
			closeDropDown("#liProperties", "#btnProperties", "#imgPropertiesDdlArrow");
		}

		createPropertySpecs();
			
	} catch (e) {
		console.log(e);
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
