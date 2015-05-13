/*
File-Name: buttonHandlers.js
Description: Consist all the event handlers of buttons present in panel such as click handlers.
 */


/**
 * Call the 'createCanvasBorder' method from .jsx based on host application.
 */
function expandCanvas() {
	analytics.trackFeature('expand_canvas');
	setModel();
	evalScript("$.specctr" + hostApplication + "." + "createCanvasBorder()");
	pref.writeAppPrefs();
}

/**
 * Call the 'addNoteSpecs' method from .jsx based on host application.
 */
function addNoteSpecs() {
	analytics.trackFeature('create_note_specs');
	setModel();
	evalScript("$.specctr" + hostApplication + "." + "addNoteSpecs()");
}

/**
 * Call the 'exportCss' method from .jsx based on host application.
 */
function exportCss() {
	analytics.trackFeature('export_css');
	setModel();

	// Upload specs to Specctr.
	evalScript("$.specctr" + hostApplication + "." + "exportCss()", function(cssInfo){
		var css = JSON.parse(cssInfo);
		var cssJson = CSSJSON.toJSON(css.text);
		var data = JSON.stringify({
			api_key: api_key,
			machine_id: machine_id,
			document_name: css.document_name,
			css_items: cssJson.children,
		});

		$.ajax({
			url: SPECCTR_API + "/css_items",
			type: "POST",
			contentType: "application/json;charset=utf-8",
			dataType: "json",
			data: data,
			success: function(response) {
				specctrDialog.showAlert('success');
			},
			error: function(xhr) {
				specctrDialog.showAlert('error');
			}
		});
	});
}

/**
 * Closing/Opening Spacing popup button according to dropdown cell selection and call
 * creating spec function accordingly.
 * */
function specButtonsClickHandler(specButton) {
	try {

		//Close all dropdowns.
		buttonController.closeAllDropDown();

		//Call the spec methods respective to the clicked button's Id.
		if(specButton.id == "btnProperties") {
			buttonController.createPropertySpecs();
		} else if(specButton.id == "btnWh") {

			if (!model.widthPos && !model.heightPos) 
				buttonController.openDropDown(specButton.id);	//Open width/height button dropdown.
			else 
				buttonController.createDimensionSpecs();

		} else if (specButton.id == "btnSpacing"){

			if (!model.spaceTop && !model.spaceRight && !model.spaceLeft
					&& !model.spaceBottom) 
				buttonController.openDropDown(specButton.id); //Open the spacing button dropdown.
			else 
				buttonController.createSpacingSpecs();

		} else if (specButton.id == "btnCoordinate") {
			buttonController.createCoordinateSpecs();
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
		buttonController.closeAllDropDown(buttonId);

		//Get the ids of selected dropdown elements.
		buttonId = "#" + buttonId;
		var liId = "#" + specButton.parentNode.parentNode.id;
		var dropDownId = "#" + $(liId+" div:nth-child(2)").attr("id");
		var imageDropDownArrowId = "#" + specButton.id;

		//Call the spec methods respective to the clicked button's Id.
		buttonController.toggleDropDown(liId, buttonId, dropDownId, imageDropDownArrowId);

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
				buttonController.removeClassesOfCell(cellHandler.parent(), classForSelection, 0);
				model.widthPos = selectedCellIndex;
			} else {
				//Selection classes for each cell in height row.
				classForSelection = ["noSelectionSelected", "heightLeftSelected",
				                     "heightRightSelected", "heightCenterSelected"];
				buttonController.removeClassesOfCell(cellHandler.parent(), classForSelection, 4);
				model.heightPos = selectedCellIndex;
			}

			cellHandler.addClass(selectionClass);
			buttonController.changeDimensionButtonIcon();
		} else if (cellHandler.parent().attr("id") == "spacingDropDown") {

			cellHandler.toggleClass(selectionClass);
			model[modelValue] = !model[modelValue];
			buttonController.changeSpacingButtonIcon();

		} else if (cellHandler.parent().attr("id") == "coordinateDropDown") {

			selectedCellIndex = cellHandler.index();
			classForSelection = ["topLeftSelected", "topRightSelected",
			                     "bottomRightSelected", "bottomLeftSelected"];
			buttonController.removeClassesOfCell(cellHandler.parent(), classForSelection, 0);
			model.coordinateCellNumber = selectedCellIndex;
			cellHandler.addClass(selectionClass);

		} else {

			classForSelection = ["specBulletSelected", "specLineSelected"];
			buttonController.removeClassesOfCell(cellHandler.parent(), classForSelection, 0);
			model.specOption = modelValue;
			cellHandler.addClass(selectionClass);
			buttonController.changePropertyButtonIcon();
		}

	} catch (e) {
		alert(e);
	}
}
