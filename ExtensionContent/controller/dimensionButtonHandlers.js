/*
File-Name: dimensionButtonHandlers.js
Description: This file includes all the handlers and methods related to dimension popup button.
 */

/**
 * FunctionName	: dimensionButton_clickHandler()
 * Description	: Closing/Opening Dimension popup button according to dropdown cell selection and call
 * creating dimension spec function accordingly.
 * */
function dimensionButton_clickHandler()
{
	try
	{
		if(model.widthPos != 0 || model.heightPos != 0)
		{
			$("#liWh .options").slideUp(100);
			$("#imgWhDdlArrow").removeClass("dropdownArrowUp");
			$("#btnWh").removeClass("buttonSelected");
			$("#liWh").removeClass("isOpen");
			createDimensionSpecs();
		}
		else
		{
			$("#liWh .options").slideDown(100);
			$("#imgWhDdlArrow").addClass("dropdownArrowUp");
			$("#btnWh").addClass("buttonSelected");
			$("#liWh").addClass("isOpen");
		}
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: dimensionDropDown_clickHandler()
 * Description	: Adding/Removing style classes on opening/closing of width/height drop-down.
 * */
function dimensionDropDown_clickHandler()
{
	if($("#dimensionDropDown").is(":visible"))
	{
		$("#liWh").removeClass("isOpen");
		$("#btnWh").removeClass("buttonSelected");
	}
	else
	{
		$("#liWh").addClass("isOpen");
		$("#btnWh").addClass("buttonSelected");
	}

	$("#btnSpacing").toggleClass("disableDiv");
	$("#coordinateButton").toggleClass("disableDiv");
	$("#liWh .options").slideToggle(100);
	$("#imgWhDdlArrow").toggleClass("dropdownArrowUp");
}

/**
 * FunctionName	: dimensionCell_clickHandler()
 * Description	: Change the appearance of selected cell in the dimension dropdown.
 * */
function dimensionCell_clickHandler(cellId, selectionClass)
{
	var cellHandler = $("#" + cellId);
	var selectedRow = cellHandler.attr("title");
	var selectedCellIndex = cellHandler.index() % 4;

	removeSelectedCell(selectedRow, cellHandler.parent());

	//Set values according to cell selection in dimension button.
	if(selectedRow == "width")
		model.widthPos = selectedCellIndex;
	else
		model.heightPos = selectedCellIndex;

	cellHandler.addClass(selectionClass);	//Select the cell.
	changeDimensionButtonIcon();			//Change button icon.
}

/**
 * FunctionName	: removeSelectedCell()
 * Description	: Remove selected cells in a given row of dimension dropdown.
 * */
function removeSelectedCell(selectedRow, parent)
{
	var classForSelection;

	//Remove the selected cell in the selected row.
	if(selectedRow == "width")
	{
		//Selection classes for each cell in width row.
		classForSelection = ["noSelectionSelected",
		                     "widthTopSelected",
		                     "widthBottomSelected",
		                     "widthCenterSelected"];

		//Remove selection classes from each cell.
		for(var i = 0; i <= 3; i++)
			parent.children().eq(i).removeClass(classForSelection[i]);
	}
	else
	{
		//Selection classes for each cell in height row.
		classForSelection = ["noSelectionSelected",
		                     "heightLeftSelected",
		                     "heightRightSelected",
		                     "heightCenterSelected"];

		//Remove selection classes from each cell.
		for(var i = 4; i <= 7; i++)
			parent.children().eq(i).removeClass(classForSelection[i - 4]);
	}
}

/**
 * FunctionName	: changeDimensionButtonIcon()
 * Description	: Change the dimension button icon according to the selection of cells in the grid.
 * */
function changeDimensionButtonIcon()
{
	//Handle the exceptions like no image is found..
	try
	{
		var dimensionIconHandler = document.getElementById("dimensionIcon");
		var imagePath = "../Images/DimensionButtonIcons/WH_";

		var dimensionIcons = [];
		var min = 0, max = 3;

		//Creating and initializing 2D array with dimension button icons.
		for (var i = min; i <= max; i++)
		{
			dimensionIcons.push([]);
			dimensionIcons[i].push(new Array(max));
			for(var j = min; j <= max; j++)
				dimensionIcons[i][j] = imagePath + i + "" + j + ".png";
		}

		dimensionIconHandler.src = dimensionIcons[model.widthPos][model.heightPos];
	}
	catch(e)
	{
		alert(e);
	}
}