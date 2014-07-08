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