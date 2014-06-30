/*
File-Name: preferences.js
Description: This file includes all the functions related to reading/writing preferences of panel.
 */

var preferencePath;		//path of the Specctr config file.

/**
 * FunctionName	: readFile()
 * Description	: Read the file and return its data.
 * */
function readFile(file)
{
	var result = window.cep.fs.readFile(file);
	if(result.err != window.cep.fs.NO_ERROR)
		return "";

	return result.data;
}

/**
 * FunctionName	: writeFile()
 * Description	: Write the data to the given file path.
 * */
function writeFile(file, data)
{
	if(data.length > 1)
		window.cep.fs.writeFile(file, data);
}

/**
 * FunctionName	: getPrefernceDirectory()
 * Description	: Get the path of the directory where preferences stores.
 * */
function getPrefernceDirectory()
{
	var csInterface = new CSInterface();

	try
	{
		var prefsFile = csInterface.getSystemPath(SystemPath.USER_DATA);
		prefsFile += "/LocalStore";

		var result = window.cep.fs.readdir(prefsFile);
		if(window.cep.fs.ERR_NOT_FOUND == result.err)
			window.cep.fs.makedir(prefsFile);

		return prefsFile;
	}
	catch(e)
	{
		alert(e);
		return null;
	}
}

/**
 * FunctionName	: readAppPrefs()
 * Description	: Return JSON object representing Specctr configuration file.
 * */
function readAppPrefs()
{
	var path = setPreferencePath();
	var data = readFile(path);

	if(data != "")
		data = JSON.parse(data);

	return data;
}

/**
 * FunctionName	: writeAppPrefs()
 * Description	: Store preferences in specctr configuration file.
 * */
function writeAppPrefs(data)
{
	if(data)
		writeFile(preferencePath, data);
}

/**
 * FunctionName	: setPreferencePath()
 * Description	: Set the preference path to the global variable.
 * */
function setPreferencePath()
{
	var path = getPrefernceDirectory() + "/specctrIllustratorConfig.json";
	preferencePath = path;
	return path;
}