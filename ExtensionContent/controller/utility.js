/*
File-Name: utility.js
Description: This file includes common utility functions used by more than one files.
 */

/**
 * FunctionName	: disableTextField()
 * Description	: Disable the text input.
 * */
function disableTextField(textField)
{
	textField.disabled = true;
}

/**
 * FunctionName	: enableTextField()
 * Description	: Enable the text input and change the background color to white.
 * */
function enableTextField(textField)
{
	textField.disabled = false;
	textField.style.backgroundColor = "#ffffff";
}

/**
 * FunctionName	: rgbToHex()
 * Description	: Convert the rgb value into hex.
 * */
function rgbToHex(colorVal) 
{
	try
	{
		var parts = colorVal.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
		delete(parts[0]);
		for(var i = 1; i <= 3; ++i)
		{
			parts[i] = parseInt(parts[i]).toString(16);
			if(parts[i].length == 1) parts[i] = "0" + parts[i];
		}

		var color = "#" + parts.join("");
		return color;
	}
	catch(e)
	{
		console.log(e);
	}

	return colorVal;
}