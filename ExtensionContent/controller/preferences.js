/*
File-Name: preferences.js
Description: This file includes all the functions related to reading/writing preferences of panel.
 */

/**
 * Set permissions like read only, write only etc to file or folder.
 * @param filePath {string} The path of the file or folder.
 * @param permission {number} The permissions in numeric format like 0777.
 */
function setPermissionToFile(filePath, permission) {
	window.cep.fs.chmod(filePath, permission);
}

/**
 * Read the file and return its data.
 * @param filePath {string}  The path of the file to read.
 */
function readFile(filePath) {
	var result = window.cep.fs.readFile(filePath);
	if (result.err != window.cep.fs.NO_ERROR)
		return "";

	return result.data;
}

/**
 * FunctionName : writeFile() Description : Write the data to the given file
 * path.
 */
function writeFile(file, data) {
	window.cep.fs.writeFile(file, data);
}

/**
 * FunctionName : getPrefernceDirectory() Description : Get the path of the
 * directory where preferences stores.
 */
function getPrefernceDirectory() {
	var csInterface = new CSInterface();
	var prefsFile = csInterface.getSystemPath(SystemPath.USER_DATA)
			+ "/LocalStore";

	var result = window.cep.fs.readdir(prefsFile);
	if (window.cep.fs.ERR_NOT_FOUND === result.err)
		window.cep.fs.makedir(prefsFile);

	return prefsFile;
}

/**
 * FunctionName : getFilePath() Description : Get the file path i.e. license and
 * log files.
 */
function getFilePath(fileExtension) {
	var csInterface = new CSInterface();
	var extensionId = csInterface.getExtensionID();
	var fileName = extensionId + fileExtension;
	var filePath = getPrefernceDirectory() + "/" + fileName;
	return filePath;
}

/**
 * FunctionName : getConfigFilePath() Description : Get the config file path.
 */
function getConfigFilePath() {
	var path = getPrefernceDirectory() + "/specctrPhotoshopConfig.json";
	return path;
}

/**
 * FunctionName : readAppPrefs() Description : Return JSON object representing
 * Specctr configuration file.
 */
function readAppPrefs() {
	configFilePath = getConfigFilePath();
	var data = readFile(configFilePath);

	if (data !== "")
		data = JSON.parse(data);

	return data;
}

/**
 * FunctionName : writeAppPrefs() Description : Store preferences in specctr
 * configuration file.
 */
function writeAppPrefs() {
	if (!configFilePath.length) {
		configFilePath = getConfigFilePath();
	}

	setPermissionToFile(configFilePath, filePermission.WriteOnly);
	var data = JSON.stringify(model);
	writeFile(configFilePath, data);
	setPermissionToFile(configFilePath, filePermission.ReadOnly);
}

/**
 * FunctionName : createLogData() Description : Create the data for log,
 * whenever user's license authenticates.
 */
function createLogData(data) {
	var date = new Date();
	var logData = date.getMonth() + "/" + date.getDate() + "/"
			+ date.getFullYear();
	logData += " " + date.getHours() + ":" + date.getMinutes() + ":"
			+ date.getSeconds();
	logData += ' - "' + data + '"\n';
	return logData;
}

/**
 * FunctionName : addFileToPreferenceFolder() Description : Write the license 
 * or log file. 
 */
function addFileToPreferenceFolder(fileExtension, data) {
	var filePath = getFilePath(fileExtension);
	setPermissionToFile(filePath, filePermission.WriteOnly);
	writeFile(filePath, data);
	setPermissionToFile(filePath, filePermission.ReadOnly);
}