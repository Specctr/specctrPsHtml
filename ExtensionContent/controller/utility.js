/*
File-Name: utility.js
Description: This file includes common utility functions used by more than one files.
 */

/**
 * FunctionName	: generateUUID()
 * Description	: Generate the UUID.
 * */
function generateUUID()
{
	//reference from http://www.ietf.org/rfc/rfc4122.txt
	var s = [];
	var hexDigits = "0123456789abcdef";
	for(var i = 0; i < 36; i++) 
	{
		s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	}

	s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
	s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
	s[8] = s[13] = s[18] = s[23] = "-";

	var uuid = s.join("");
	return uuid;
}

/**
 * FunctionName	: getHostApp()
 * Description	: Get the current host application name.
 * */
function getHostApp()
{
	try
	{
		var csInterface = new CSInterface();
		var appName = csInterface.hostEnvironment.appName;
		var appNames = ["PHXS", "ILST"];
		var currentApplication = "";

		for(var i = 0; i < appNames.length; i++) 
		{
			var name = appNames[i];
			if(appName.indexOf(name) >= 0) 
			{
				currentApplication = name;
				break;
			}
		}

		return currentApplication;
	}
	catch(e)
	{
		return null;
	}
}

/**
 * FunctionName	: disableTextField()
 * Description	: Disable the text input.
 * */
function disableTextField(textField)
{
	try
	{
		textField.disabled = true;
	}
	catch(e)
	{
		alert(e);
	}
}

/**
 * FunctionName	: enableTextField()
 * Description	: Enable the text input and change the background color to white.
 * */
function enableTextField(textField)
{
	try
	{
		textField.disabled = false;
		textField.style.backgroundColor = "#ffffff";
	}
	catch(e)
	{
		alert(e);
	}
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