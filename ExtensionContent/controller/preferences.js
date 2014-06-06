/*
File-Name: preferences.js
Description: This file includes all the functions related to reading/writing preferences of panel.
 */

var preferencePath;		//path of the Specctr config file.

/**
 * FunctionName	: getConfigFileName()
 * Description	: Get the config file name according to the current host application.
 * */
function getConfigFileName()
{
	var specctrConfig = "specctrPhotoshopConfig";
	var	hostApplication = getHostApp();

	if(hostApplication == "ILST")
		specctrConfig = "specctrIllustratorConfig";

	return specctrConfig + ".json";
}

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
 * FunctionName	: createLogData()
 * Description	: Create the data for log, whenever user's license authenticates.  
 * */
function createLogData(data)
{
	var date = new Date();
	var logData = "Login time: ";
	logData += date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear();
	logData += " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
	logData += "\nStaus: " + data.name;
	logData += "\nMessage: " + data.message + "\n";

	for(var i = 0; i < 40; i++)
		logData += "-";

	logData += "\n";

	return logData;
}

/**
 * FunctionName	: createLog()
 * Description	: Create the log file in the preference folder.  
 * */
function createLog(data)
{
	var filePath = getPrefernceDirectory() + "/" + "specctr_ps.log";
	var existingData = readFile(filePath);

	var allData = existingData + createLogData(data);
	writeFile(filePath, allData);
}

/**
 * FunctionName	: getCredentials()
 * Description	: Read the .sys file to get user's registration data.  
 * */
function getCredentials()
{
	var fileName = "specctr_fingerprint.sys";
	var filePath = getPrefernceDirectory() + "/" + fileName;
	var data = readFile(filePath);
	return JSON.parse(data);
}

/**
 * FunctionName	: storeCredentials()
 * Description	: Write the user's registration data to the sys file. 
 * */
function storeCredentials()
{
	var fileName = "specctr_fingerprint.sys";
	var filePath = getPrefernceDirectory() + "/" + fileName;
	var data = readFile(filePath);

	if(data != "")
		return;

	var credential = new Object();
	credential.apiKey = document.getElementById("license").value;
	credential.machineName = "Admin";	//get the machine name from text input of registration screen.
	credential.uuid = generateUUID();

	writeFile(filePath, JSON.stringify(credential));
}

/**
 * FunctionName	: readAppPrefs()
 * Description	: Return JSON object representing Specctr configuration file.
 * */
function readAppPrefs()
{
	setPreferencePath();
	var data = readFile(preferencePath);

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
	writeFile(preferencePath, data);
}

/**
 * FunctionName	: setPreferencePath()
 * Description	: Set the preference path to the global variable.
 * */
function setPreferencePath()
{
	preferencePath = getPrefernceDirectory() + "/" + getConfigFileName();
}