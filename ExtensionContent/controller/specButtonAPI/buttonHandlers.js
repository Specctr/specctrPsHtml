/*
File-Name: buttonHandlers.js
Description: Consist all the event handlers of buttons present in panel such as click handlers.
 */

Specctr = Specctr || {};

Specctr.buttonHandlers = {
	/**
	 * Call the 'createCanvasBorder' method from .jsx based on host application.
	 */
	expandCanvas : Specctr.Utility.tryCatchLog(function(){
		analytics.trackFeature('expand_canvas');
		buttonController.closeAllDropDown();
		setModel();
		evalScript("$.specctr" + hostApplication + "." + "createCanvasBorder()");
		pref.writeAppPrefs();
	}),
	
	/**
	 * Call the 'addNoteSpecs' method from .jsx based on host application.
	 */
	addNoteSpecs : Specctr.Utility.tryCatchLog(function(){
		analytics.trackFeature('create_note_specs');
		
		//Get note text from the text area of note button dropdown.
		var note = $("#noteText").val();
		if(!note.trim())
			note = "Add Note Here!";

		buttonController.closeAllDropDown();
		setModel();
		evalScript("$.specctr" + hostApplication + "." + "addNoteSpecs('" + note + "')");
	}),
	
	/**
	 * Call the 'exportCss' method from .jsx based on host application.
	 */
	exportCss : Specctr.Utility.tryCatchLog(function(){
		analytics.trackFeature('export_css');
		var selectedProjRef = $("#projectTable").find('.highlight').find('td:first'); 
		var projectName = selectedProjRef.html();
		if(!projectName) {
			specctrDialog.showAlert("Please select a project");
			return;
		}
		
		setModel();
		
		// Upload specs to Specctr.
		evalScript("$.specctr" + hostApplication + "." + "exportCss()", 
				function(cssInfo) {
			
			try {

				if(!cssInfo)
					return;

				var css = JSON.parse(cssInfo);
				
				//check if id is present.
				var IdObject = {
					project_id: selectedProjRef.attr('value'),
					document_id: css.document_id,
				};

				if(IdObject.project_id && IdObject.document_id) {
					Specctr.cloudAPI.uploadCss(cssInfo, IdObject, false);
				} else {
					Specctr.cloudAPI.getDocId(cssInfo, selectedProjRef.html());
				}
				
			}catch(e){
				alert(e);
			}
			
		});
	}),
		
	/**
	 * Closing/Opening Spacing popup button according to dropdown cell selection and call
	 * creating spec function accordingly.
	 * */
	specButtonsClickHandler : Specctr.Utility.tryCatchLog(function(specButton){
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
			
		} else if (specButton.id == "btnCloupUpload") {
			
			buttonController.cloudButtonHandler();
			
		}
	}),

	/**
	 * Adding/Removing style classes on opening/closing of button's drop-down.
	 * */
	buttonDropDownClickHandler: Specctr.Utility.tryCatchLog(function(event, specButton) {
		event.stopPropagation();	//Stop the click event from bubbling to parent div.

		var buttonId = specButton.parentNode.id;
		//Close the remaining drop downs except the element in the parameters.
		buttonController.closeAllDropDown(buttonId);

		//Get the ids of selected dropdown elements.
		buttonId = "#" + buttonId;
		var liId = "#" + specButton.parentNode.parentNode.id;
		var dropDownId = "#" + $(liId+" div:nth-child(2)").attr("id");
		var imageDropDownArrowId = "#" + specButton.getElementsByTagName('div')[0].id;

		//Call the spec methods respective to the clicked button's Id.
		buttonController.toggleDropDown(liId, buttonId, dropDownId, imageDropDownArrowId);
	}),

	/**
	 * Change the appearance of selected cell in the property dropdown.
	 * @param cellId {string} The id of selected cell.
	 * @param selectionClass {string} The css class that has to be toggled.
	 * @param modelValue {string} The value to be changed in model object.
	 * */
	dropDownCellClickHandler : Specctr.Utility.tryCatchLog(function(cellId, selectionClass, modelValue) {
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

		} else if(cellHandler.parent().attr("id") == "cloudUploadDropDown") {
			
			classForSelection = ["importCssSelected", "exportCssSelected"];
			buttonController.removeClassesOfCell(cellHandler.parent(), classForSelection, 0);
			model.cloudOption = modelValue;
			cellHandler.addClass(selectionClass);
			buttonController.changeCloudButtonIcon();
			if(selectionClass == classForSelection[0]) {
				$('#CloudBtnLbl').text("Cloud Download");
			} else {
				$('#CloudBtnLbl').text("Cloud Upload");
			}
		} else {

			classForSelection = ["specBulletSelected", "specLineSelected"];
			buttonController.removeClassesOfCell(cellHandler.parent(), classForSelection, 0);
			model.specOption = modelValue;
			cellHandler.addClass(selectionClass);
			buttonController.changePropertyButtonIcon();
		}
	})

};
