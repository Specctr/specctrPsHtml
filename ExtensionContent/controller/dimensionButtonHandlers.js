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
			//Close the spacing drop down, if open.
			if($("#spacingDropDown").is(":visible"))
			{
				$("#liSpacing .options").slideUp(100);
				$("#liSpacing").removeClass("isOpen");
				$("#btnSpacing").removeClass("buttonSelected");
				$("#imgSpacingDdlArrow").removeClass().addClass("dropdownArrow");
			}

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
	//Close the spacing drop down, if open.
	if($("#spacingDropDown").is(":visible"))
	{
		$("#liSpacing .options").slideUp(100);
		$("#liSpacing").removeClass("isOpen");
		$("#btnSpacing").removeClass("buttonSelected");
		$("#imgSpacingDdlArrow").removeClass().addClass("dropdownArrow");
	}

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

	$("#liWh .options").slideToggle(100);
	$("#imgWhDdlArrow").toggleClass("dropdownArrowUp");
}

/**
 * FunctionName	: imgNoSelectionWidth_clickHandler()
 * Description	: Select the "no width" spec option cell in the dimension dropdown.
 * */
function imgNoSelectionWidth_clickHandler()
{
	try
	{
		//Remove all other selection classes for width row.
		removeSelectionClassesForWidth();
		$("#imgNoSelectionWidth").addClass("noSelectionSelected");
		model.widthPos = 0;
		changeDimensionButtonnIcon();
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: imgWidthTop_clickHandler()
 * Description	: Select the top width spec option cell in the dimension dropdown.
 * */
function imgWidthTop_clickHandler()
{
	try
	{
		//Remove all other selection classes for width row.
		removeSelectionClassesForWidth();
		$("#imgWidthTop").addClass("widthTopSelected");
		model.widthPos = 1;
		changeDimensionButtonnIcon();
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: imgWidthBottom_clickHandler()
 * Description	: Select the bottom width spec option cell in the dimension dropdown.
 * */
function imgWidthBottom_clickHandler()
{
	try
	{
		//Remove all other selection classes for width row.
		removeSelectionClassesForWidth();
		$("#imgWidthBottom").addClass("widthBottomSelected");
		model.widthPos = 2;
		changeDimensionButtonnIcon();
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: imgWidthCenter_clickHandler()
 * Description	: Select the center width spec option cell in the dimension dropdown.
 * */
function imgWidthCenter_clickHandler()
{
	try
	{
		//Remove all other selection classes for width row.
		removeSelectionClassesForWidth();
		$("#imgWidthCenter").addClass("widthCenterSelected");
		model.widthPos = 3;
		changeDimensionButtonnIcon();
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: imgNoSelectionHeight_clickHandler()
 * Description	: Select the "no height" spec option cell in the dimension dropdown.
 * */
function imgNoSelectionHeight_clickHandler()
{
	try
	{
		//Remove all other selection classes for height row.
		removeSelectionClassesForHeight();
		$("#imgNoSelectionHeight").addClass("noSelectionSelected");
		model.heightPos = 0;
		changeDimensionButtonnIcon();
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: imgHeightLeft_clickHandler()
 * Description	: Select the left height spec option cell in the dimension dropdown.
 * */
function imgHeightLeft_clickHandler()
{
	try
	{
		//Remove all other selection classes for height row.
		removeSelectionClassesForHeight();
		$("#imgHeightLeft").addClass("heightLeftSelected");
		model.heightPos = 1;
		changeDimensionButtonnIcon();
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: imgHeightRight_clickHandler()
 * Description	: Select the right height spec option cell in the dimension dropdown.
 * */
function imgHeightRight_clickHandler()
{
	try
	{
		//Remove all other selection classes for height row.
		removeSelectionClassesForHeight();
		$("#imgHeightRight").addClass("heightRightSelected");
		model.heightPos = 2;
		changeDimensionButtonnIcon();
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: imgHeightCenter_clickHandler()
 * Description	: Select the center height spec option cell in the dimension dropdown.
 * */
function imgHeightCenter_clickHandler()
{
	try
	{
		//Remove all other selection classes for height row.
		removeSelectionClassesForHeight();
		$("#imgHeightCenter").addClass("heightCenterSelected");
		model.heightPos = 3;
		changeDimensionButtonnIcon();
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: removeSelectionClassesForWidth()
 * Description	: Remove all the selected cells of width row in dimension dropdown.
 * */
function removeSelectionClassesForWidth()
{
	try
	{
		$("#imgNoSelectionWidth").removeClass("noSelectionSelected");
		$("#imgWidthTop").removeClass("widthTopSelected");
		$("#imgWidthBottom").removeClass("widthBottomSelected");
		$("#imgWidthCenter").removeClass("widthCenterSelected");
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: removeSelectionClassesForHeight()
 * Description	: Remove all the selected cells of height row in dimension dropdown.
 * */
function removeSelectionClassesForHeight()
{
	try
	{
		$("#imgNoSelectionHeight").removeClass("noSelectionSelected");
		$("#imgHeightLeft").removeClass("heightLeftSelected");
		$("#imgHeightRight").removeClass("heightRightSelected");
		$("#imgHeightCenter").removeClass("heightCenterSelected");
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: changeDimensionButtonnIcon()
 * Description	: Change the dimension button icon according to the selection of cells in the grid.
 * */
function changeDimensionButtonnIcon()
{
	try
	{
		var dimensionIcon = document.getElementById("dimensionIcon");
		switch (model.widthPos)
		{
		case 0:												//No width option.
		{
			switch (model.heightPos)
			{
			case 0:									//No height option.
			{
				dimensionIcon.src = "../Images/DimensionButtonIcons/WH_00.png";
				break;
			}

			case 1:									//Left height option.
			{
				dimensionIcon.src = "../Images/DimensionButtonIcons/WH_01.png";
				break;
			}

			case 2:									//Right height option.
			{
				dimensionIcon.src = "../Images/DimensionButtonIcons/WH_02.png";
				break;
			}

			case 3:									//Center height option.
			{
				dimensionIcon.src = "../Images/DimensionButtonIcons/WH_03.png";
			}
			}

			break;
		}

		case 1:												//Top width option.
		{
			switch (model.heightPos)
			{
			case 0:									//No height option.
			{
				dimensionIcon.src = "../Images/DimensionButtonIcons/WH_10.png";
				break;
			}

			case 1:									//Left height option.
			{
				dimensionIcon.src = "../Images/DimensionButtonIcons/WH_11.png";
				break;
			}

			case 2:									//Right height option.
			{
				dimensionIcon.src = "../Images/DimensionButtonIcons/WH_12.png";
				break;
			}

			case 3:									//Center height option.
			{
				dimensionIcon.src = "../Images/DimensionButtonIcons/WH_13.png";
			}
			}

			break;
		}

		case 2:												//Bottom width option.
		{
			switch (model.heightPos)
			{
			case 0:									//No height option.
			{
				dimensionIcon.src = "../Images/DimensionButtonIcons/WH_20.png";
				break;
			}

			case 1:									//Left height option.
			{
				dimensionIcon.src = "../Images/DimensionButtonIcons/WH_21.png";
				break;
			}

			case 2:									//Right height option.
			{
				dimensionIcon.src = "../Images/DimensionButtonIcons/WH_22.png";
				break;
			}

			case 3:									//Center height option.
			{
				dimensionIcon.src = "../Images/DimensionButtonIcons/WH_23.png";
			}
			}

			break;
		}

		case 3:												//Center width option.
		{
			switch (model.heightPos)
			{
			case 0:									//No height option.
			{
				dimensionIcon.src = "../Images/DimensionButtonIcons/WH_30.png";
				break;
			}

			case 1:									//Left height option.
			{
				dimensionIcon.src = "../Images/DimensionButtonIcons/WH_31.png";
				break;
			}


			case 2:									//Right height option.
			{
				dimensionIcon.src = "../Images/DimensionButtonIcons/WH_32.png";
				break;
			}

			case 3:									//Center height option.
			{
				dimensionIcon.src = "../Images/DimensionButtonIcons/WH_33.png";
			}
			}
		}
		}
	}
	catch(e)
	{
		console.log(e);
	}

}