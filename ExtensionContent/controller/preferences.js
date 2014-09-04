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
	var prefsFile = csInterface.getSystemPath(SystemPath.USER_DATA) + "/LocalStore";

	var result = window.cep.fs.readdir(prefsFile);
	if(window.cep.fs.ERR_NOT_FOUND === result.err)
		window.cep.fs.makedir(prefsFile);

	return prefsFile;
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
	if(data)
		writeFile(preferencePath, data);
}

/**
 * FunctionName	: setPreferencePath()
 * Description	: Set the preference path to the global variable.
 * */
function setPreferencePath()
{
	preferencePath = getPrefernceDirectory() + "/specctrPhotoshopConfig.json";
}

/**
 * FunctionName	: createLogData()
 * Description	: Create the data for log, whenever user's license authenticates.  
 * */
function createLogData(data) {
	var date = new Date();
	var logData = date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear();
	logData += " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
	logData += ' - "'  + data + '"\n';
	return logData;
}

/**
 * FunctionName	: getFilePath()
 * Description	: Get the file path i.e. license and log files.  
 * */
function getFilePath(fileExtension) {
	var csInterface = new CSInterface();
	var extensionId = csInterface.getExtensionID();
	var fileName = extensionId + fileExtension;
	var filePath = getPrefernceDirectory() + "/" + fileName;
	return filePath;
}

/**
 * FunctionName	: setPermissionToFile()
 * Description	: Set permissions like read only, write only etc to file or folder.  
 * */
function setPermissionToFile(filePath, permission) {
	window.cep.fs.chmod(filePath, permission);
}
