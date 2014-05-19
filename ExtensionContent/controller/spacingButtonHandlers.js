/*
File-Name: spacingButtonHandlers.js
Description: This file includes all the handlers and methods related to spacing popup button.  
*/

/**
 * FunctionName	: spacingButton_clickHandler()
 * Description	: Closing/Opening Spacing popup button according to dropdown cell selection and call 
 * creating spacing spec function accordingly.
 * */
function spacingButton_clickHandler()
{
	try
	{
		if (!model.spaceTop && !model.spaceRight && !model.spaceLeft && !model.spaceBottom)
		{
			$('#liSpacing .options').slideDown(100);
			$('#btnSpacing').addClass('buttonSelected');
			$('#imgSpacingDdlArrow').addClass('dropdownArrowUp');
			$('#liSpacing').addClass('isOpen');
		}
		else
		{
			$('#liSpacing .options').slideUp(100);
			$('#imgSpacingDdlArrow').removeClass('dropdownArrowUp');
			$('#btnSpacing').removeClass('buttonSelected');
			$('#liSpacing').removeClass('isOpen');
			createSpacingSpecs();
		}
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: spacingDropDown_clickHandler()
 * Description	: Adding/Removing style classes on opening/closing of spacing drop-down.
 * */
function spacingDropDown_clickHandler()
{
	try
	{
		if($("#spacingDropDown").is(":visible"))
		{
    		$('#liSpacing').removeClass('isOpen');
    		$('#btnSpacing').removeClass('buttonSelected');
		}
    	else
		{
    		$('#liSpacing').addClass('isOpen');
    		$('#btnSpacing').addClass('buttonSelected');
		}
    	
    	$('#liSpacing .options').slideToggle(100);
        $('#imgSpacingDdlArrow').toggleClass('dropdownArrowUp');
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: imgSpaceTop_clickHandler()
 * Description	: Select/unselect the spacing top option cell in the spacing dropdown.
 * */
function imgSpaceTop_clickHandler()
{
	try
	{
		$('#imgSpaceTop').toggleClass('topSelected');
		model.spaceTop = !model.spaceTop;
		changeSpacingBtnIcon();
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: imgSpaceRight_clickHandler()
 * Description	: Select/unselect the spacing right option cell in the spacing dropdown.
 * */
function imgSpaceRight_clickHandler()
{
	try
	{
		$('#imgSpaceRight').toggleClass('rightSelected');
		model.spaceRight = !model.spaceRight;
		changeSpacingBtnIcon();
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: imgSpaceBottom_clickHandler()
 * Description	: Select/unselect the spacing bottom option cell in the spacing dropdown.
 * */
function imgSpaceBottom_clickHandler()
{
	try
	{
		$('#imgSpaceBottom').toggleClass('bottomSelected');
		model.spaceBottom = !model.spaceBottom;
		changeSpacingBtnIcon();
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: imgSpaceLeft_clickHandler()
 * Description	: Select/unselect the spacing left option cell in the spacing dropdown.
 * */
function imgSpaceLeft_clickHandler()
{
	try
	{
		$('#imgSpaceLeft').toggleClass('leftSelected');
		model.spaceLeft = !model.spaceLeft;
		changeSpacingBtnIcon();
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: changeSpacingBtnIcon()
 * Description	: Change the spacing button icon according to the selection of cells in the grid.
 * */
function changeSpacingBtnIcon()
{
	try
	{
		var spacingIcon = document.getElementById("spacingIcon");
		if (model.spaceTop)
		{
			if (model.spaceRight)
			{
				if (model.spaceLeft)
				{
					if (model.spaceBottom)
						spacingIcon.src = "Images/SpacingButtonIcons/Spacing_All.png";		//Apply all 4 selected cell icon.
					else
						spacingIcon.src = "Images/SpacingButtonIcons/Spacing_LTR.png";		//Apply top, left, right selected cell icon.
				}
				else
				{
					if (model.spaceBottom)
						spacingIcon.src = "Images/SpacingButtonIcons/Spacing_BTR.png";		//Apply top, right, bottom selected cell icon.
					else
						spacingIcon.src = "Images/SpacingButtonIcons/Spacing_TR.png";			//Apply top, right selected cell icon.
				}
			}
			else
			{
				if (model.spaceLeft)
				{
					if (model.spaceBottom)
						spacingIcon.src = "Images/SpacingButtonIcons/Spacing_LTB.png";	//Apply top, left, bottom selected cell icon.
					else
						spacingIcon.src = "Images/SpacingButtonIcons/Spacing_TL.png";	//Apply top, left selected cell icon.
				}
				else
				{
					if (model.spaceBottom)
						spacingIcon.src = "Images/SpacingButtonIcons/Spacing_BT.png";			//Apply top, bottom selected cell icon.
					else
						spacingIcon.src = "Images/SpacingButtonIcons/Spacing_T.png";				//Apply top selected cell icon.
				}
			}
		}
		else
		{
			if (model.spaceRight)
			{
				if (model.spaceLeft)
				{
					if (model.spaceBottom)
						spacingIcon.src = "Images/SpacingButtonIcons/Spacing_BLR.png";	//Apply right, bottom, left selected cell icon.
					else
						spacingIcon.src = "Images/SpacingButtonIcons/Spacing_LR.png";	//Apply left, right selected cell icon.
				}
				else
				{
					if (model.spaceBottom)
						spacingIcon.src = "Images/SpacingButtonIcons/Spacing_BR.png";		//Apply right, bottom selected cell icon.
					else
						spacingIcon.src = "Images/SpacingButtonIcons/Spacing_R.png";		//Apply right selected cell icon.
				}
			}
			else
			{
				if (model.spaceLeft)
				{
					if (model.spaceBottom)
						spacingIcon.src = "Images/SpacingButtonIcons/Spacing_BL.png"; 		//Apply left, bottom selected cell icon.
					else
						spacingIcon.src = "Images/SpacingButtonIcons/Spacing_L.png";		//Apply left selected cell icon.
				}
				else
				{
					if (model.spaceBottom)
						spacingIcon.src = "Images/SpacingButtonIcons/Spacing_B.png";	//Apply bottom selected cell icon.
					else
						spacingIcon.src = "Images/SpacingButtonIcons/Spacing_None.png";	//Apply no selected cell icon.
				}
			}
		}
	}
	catch(e)
	{
		console.log(e);
	}
}