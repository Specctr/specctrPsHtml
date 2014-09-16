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
 * @return An object with the data or empty string.
 */
function readFile(filePath) {
	var result = window.cep.fs.readFile(filePath);
	if (result.err != window.cep.fs.NO_ERROR)
		return "";

	return result.data;
}

/**
 * Writes data to the file
 * @param filePath {string}  The path of the file to read.
 * @param data {string} The data to write to the file.
 */
function writeFile(filePath, data) {
	window.cep.fs.writeFile(filePath, data);
}

/**
 * Create the directory where preferences stores, if not exist.
 * @return The path of the directory.
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
 * Get the path of license or log file.
 * @param fileExtension {string} The extension of file i.e.
 * .log or .license.
 * @return The path of the file according to the file extension input.
 */
function getFilePath(fileExtension) {
	var csInterface = new CSInterface();
	var extensionId = csInterface.getExtensionID();
	var fileName = extensionId + fileExtension;
	var filePath = getPrefernceDirectory() + "/" + fileName;
	return filePath;
}

/**
 * Get the config file path.
 * @return The path of the config file {name: specctrPhotoshopConfig.json}.
 */
function getConfigFilePath() {
	var path = getPrefernceDirectory() + "/specctrPhotoshopConfig.json";
	return path;
}

/**
 * Read the config file {name: specctrPhotoshopConfig.json}.
 * @return An object with the data or empty string.
 */
function readAppPrefs() {
	configFilePath = getConfigFilePath();
	var data = readFile(configFilePath);

	if (data !== "")
		data = JSON.parse(data);

	return data;
}

/**
 * Write the data to the config file.
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
 * Create the data for log file.
 * @param message {string} Successful or failure message of activation.
 */
function createLogData(message) {
	var date = new Date();
	var logData = date.getMonth() + "/" + date.getDate() + "/"
			+ date.getFullYear();
	logData += " " + date.getHours() + ":" + date.getMinutes() + ":"
			+ date.getSeconds();
	logData += ' - "' + message + '"\n';
	return logData;
}

/**
 * Create the license or log file and make them read only.
 * @param fileExtension {string} The extension of file i.e.
 * .log or .license.
 * @param data {string} The data to write to the file.
 */
function addFileToPreferenceFolder(fileExtension, data) {
	var filePath = getFilePath(fileExtension);
	setPermissionToFile(filePath, filePermission.WriteOnly);
	writeFile(filePath, data);
	setPermissionToFile(filePath, filePermission.ReadOnly);
}