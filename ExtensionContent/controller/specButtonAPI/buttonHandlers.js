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
		
		//Pop up a dialog message showing message and open the dropdown for input.
		if ($("#canvasExpandSize").val() <= 0) {
			specctrDialog.showAlert(" <br> <br>VALUE SHOULD BE GREATER THAN 0.");
			buttonController.openDropDown("btnExpand");
		}
		
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
		else
			note = Specctr.Utility.addEscapeChars(note);	//Add backslash char to support single quotes in spec note.

		buttonController.closeAllDropDown();
		setModel();
		$("#spinnerBlock").hide();
		evalScript("$.specctr" + hostApplication + "." + "addNoteSpecs('" + note + "')", CommonCallBack);
	}),
	
	/**
	 * Call the 'exportCss' method from .jsx based on host application.
	 */
	exportCss : Specctr.Utility.tryCatchLog(function(ev){
        if ($(ev.currentTarget).hasClass('disabled')) {
		    analytics.trackFeature('cloud.upload_css_disabled');
            return;
        }

		analytics.trackFeature('cloud.upload_css');
		var selectedProjRef = $("#projectTable").find('.highlight').find('td:first'); 
		var projectName = selectedProjRef.html();
		if(!projectName) {
			specctrDialog.showAlert("Please select a project");
			return;
		}
		
		setModel();
		//$("#spinnerBlock").show();
		$("#uploadBtnLabel").html("Uploading...");
		$("#uploadingGif").show();
		
		// Upload specs to Specctr.
		evalScript("$.specctr" + hostApplication + "." + "exportCss()", function(cssInfo) {
			
			try {
				
				
				if(!cssInfo) {
//					$("#spinnerBlock").hide();
					$("#uploadBtnLabel").html("Upload");
					$("#uploadingGif").hide();
					return;
				}
				
				var css = JSON.parse(cssInfo);
				if(css.text == "") {
//					$("#spinnerBlock").hide();
					$("#uploadBtnLabel").html("Upload");
					$("#uploadingGif").hide();
					return;
				}
				
				//check if id is present.
				var IdObject = {
					project_id: selectedProjRef.attr('value'),
					document_id: css.document_id,
				};

				if(IdObject.project_id != css.project_id)
					IdObject.project_id = '';
				
				if(IdObject.project_id && IdObject.document_id) {
					Specctr.cloudAPI.uploadCss(cssInfo, IdObject, false);
				} else {
					Specctr.cloudAPI.getDocId(cssInfo, selectedProjRef.html());
				}
				
			} catch(e){
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
		var selectedCellIndex;
		var cellHandler = $("#" + cellId);

		if(cellHandler.parent().attr("id") == "dimensionDropDown") {
			var selectedRow = cellHandler.attr("title");
			selectedCellIndex = cellHandler.index() % 4;

			//Set values according to cell selection in dimension button.
			if (selectedRow == "width") {
				model.widthPos = selectedCellIndex;
			} else {
				model.heightPos = selectedCellIndex;
			}
			
			this.setDimensionButton(model.heightPos, model.widthPos);
		} else if (cellHandler.parent().attr("id") == "spacingDropDown") {

			cellHandler.toggleClass(selectionClass);
			model[modelValue] = !model[modelValue];
			buttonController.changeSpacingButtonIcon();

		} else if (cellHandler.parent().attr("id") == "coordinateDropDown") {
			selectedCellIndex = cellHandler.index();
			model.coordinateCellNumber = selectedCellIndex;
			this.setCoordinateButton(selectedCellIndex);

		} else if(cellHandler.parent().attr("id") == "cloudUploadDropDown") {
			model.cloudOption = modelValue;
			this.setCloudButton(modelValue);
			
		} else {
			model.specOption = modelValue;
			this.setPropertyButton(modelValue);
		}
		
		pref.writeAppPrefs();
	}),
	
	/**
	 * Change the appearance of selected cell in the property button's dropdown and its icon.
	 * @param cellId {string} The id of selected cell.
	 * @param selectionClass {string} The css class that has to be toggled.
	 * */
	setPropertyButton : function(modelValue) {
		var cellHandler, selectedClass;	
		var classForSelection = ["specBulletSelected", "specLineSelected"];
		if(modelValue == "Bullet") {
			selectedClass = classForSelection[0];
			cellHandler = $("#imgPropertiesBullet");
		} else {
			selectedClass = classForSelection[1];
			cellHandler = $("#imgPropertiesLine");
		}

		buttonController.removeClassesOfCell(cellHandler.parent(), classForSelection, 0);
		cellHandler.addClass(selectedClass);
		buttonController.changePropertyButtonIcon();
	},
	
	 setCoordinateButton : function(modelValue) {
		 var cellHandler;
		 switch(modelValue) {
			 case 1:
				 cellHandler = $("#imgTopRight");
				 break;
			 case 2:
				 cellHandler = $("#imgBottomRight");
				 break;
			 case 3: 
				 cellHandler = $("#imgBottomLeft");
				 break;
			 default: 
				 cellHandler = $("#imgTopLeft");
		 }
		 
		 var classForSelection = ["topLeftSelected", "topRightSelected",
		                     "bottomRightSelected", "bottomLeftSelected"];
		 
		 var selectedClass = classForSelection[modelValue];
		 buttonController.removeClassesOfCell(cellHandler.parent(), classForSelection, 0);
		 cellHandler.addClass(selectedClass);
		 
		 //Add code to change coordinate button icon.
		 buttonController.changeCoordinateButtonIcon();
	 },
	 
	 setCloudButton : function(modelValue) {
			var cellHandler, selectedClass;	
			var classForSelection = ["importCssSelected", "exportCssSelected"];
			if(modelValue == "import") {
				selectedClass = classForSelection[0];
				cellHandler = $("#imgCloudUploadImportCSS");
				$('#CloudBtnLbl').text("Download CSS");
			} else {
				selectedClass = classForSelection[1];
				cellHandler = $("#imgCloudUploadExportCSS");
				$('#CloudBtnLbl').text("Upload Beta");
			}

			buttonController.removeClassesOfCell(cellHandler.parent(), classForSelection, 0);
			cellHandler.addClass(selectedClass);
			buttonController.changeCloudButtonIcon();
		},
	
	setDimensionButton : function (modelValHeight, modelValWidth) {
		//Selection classes for each cell in height row.
		var classForHeightCells = ["noSelectionSelected", "heightLeftSelected",
		                     "heightRightSelected", "heightCenterSelected"];
		
		var heightImgIds = ["#imgNoSelectionHeight", "#imgHeightLeft", 
		                    "#imgHeightRight", "#imgHeightCenter"];
		var cellHandler = $(heightImgIds[modelValHeight]);
		var selectedClass = classForHeightCells[modelValHeight];
		
		buttonController.removeClassesOfCell(cellHandler.parent(), classForHeightCells, 4);
		cellHandler.addClass(selectedClass);
		
		//Selection classes for each cell in width row.
		var classForSelection = ["noSelectionSelected", "widthTopSelected", 
		                         "widthBottomSelected", "widthCenterSelected"];
		var widthImgIds = ["#imgNoSelectionWidth", "#imgWidthTop",
		                   "#imgWidthBottom", "#imgWidthCenter"];
		
		cellHandler = $(widthImgIds[modelValWidth]);
		selectedClass = classForSelection[modelValWidth];
		buttonController.removeClassesOfCell(cellHandler.parent(), classForSelection, 0);
		cellHandler.addClass(selectedClass);
		
		buttonController.changeDimensionButtonIcon();
	},
	
	setSpacingButton : function() {
		if(model.spaceTop)
			$("#imgSpaceTop").addClass("topSelected");
		
		if (model.spaceRight)
			$("#imgSpaceRight").addClass("rightSelected");
		
		if (model.spaceBottom) 
			$("#imgSpaceBottom").addClass("bottomSelected");
		
		if (model.spaceLeft) 
			$("#imgSpaceLeft").addClass("leftSelected");

		buttonController.changeSpacingButtonIcon();
	}
};
