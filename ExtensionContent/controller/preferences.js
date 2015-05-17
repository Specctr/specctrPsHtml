var fs = require('fs');

/*
File-Name: preferences.js
Description: This file includes all the functions related to reading/writing preferences of panel.
 */

var pref = {};

/**
 * Set permissions like read only, write only etc to file or folder.
 * @param filePath {string} The path of the file or folder.
 * @param permission {number} The permissions in numeric format like 0777.
 */
pref.setPermissionToFile = function(filePath, permission) {
	window.cep.fs.chmod(filePath, permission);
};

/**
 * Read the file and return its data.
 * @param filePath {string}  The path of the file to read.
 * @return An object with the data or empty string.
 */
pref.readFile = function(filePath) {
	var result = window.cep.fs.readFile(filePath);
	if (result.err != window.cep.fs.NO_ERROR)
		return "";

	return result.data;
};

/**
 * Writes data to the file
 * @param filePath {string}  The path of the file to read.
 * @param data {string} The data to write to the file.
 */
pref.writeFile = function(filePath, data) {
	window.cep.fs.writeFile(filePath, data);
};

/**
 * Create the directory where preferences stores, if not exist.
 * @return The path of the directory.
 */
pref.getPrefernceDirectory = function() {
	var csInterface = new CSInterface();
	var prefsFile = csInterface.getSystemPath(SystemPath.USER_DATA)
			+ "/LocalStore";

	var result = window.cep.fs.readdir(prefsFile);
	if (window.cep.fs.ERR_NOT_FOUND === result.err)
		window.cep.fs.makedir(prefsFile);

	return prefsFile;
};

/**
 * Get the path of license or log file.
 * @param fileExtension {string} The extension of file i.e.
 * .log or .license.
 * @return The path of the file according to the file extension input.
 */
pref.getFilePath = function(fileExtension) {
	if(extensionId === '')
		extensionId = Specctr.Utility.getExtensionId();
	var fileName = extensionId + fileExtension;
	var filePath = this.getPrefernceDirectory() + "/" + fileName;
	return filePath;
};

/**
 * Get the config file path.
 * @return The path of the config file {name: specctrPhotoshopConfig.json}.
 */
pref.getConfigFilePath = function() {
	var configFileName = "";
	if (hostApplication === photoshop)
		configFileName = "/specctrPhotoshopConfig.json";
	else if (hostApplication === illustrator)
		configFileName = "/specctrIllustratorConfig.json";
	else if (hostApplication === indesign)
		configFileName = "/specctrIndesignConfig.json";
	
	var path = this.getPrefernceDirectory() + configFileName;
	return path;
};

/**
 * Read the config file {name: specctrPhotoshopConfig.json}.
 * @return An object with the data or empty string.
 */
pref.readAppPrefs = function() {
	configFilePath = this.getConfigFilePath();
	var data = this.readFile(configFilePath);

	if (data !== "")
		data = JSON.parse(data);

	return data;
};

/**
 * Write the data to the config file.
 */
pref.writeAppPrefs = function() {
	if (!configFilePath.length) {
		configFilePath = this.getConfigFilePath();
	}

	this.setPermissionToFile(configFilePath, filePermission.WriteOnly);
	var data = JSON.stringify(model);
	this.writeFile(configFilePath, data);
	this.setPermissionToFile(configFilePath, filePermission.ReadOnly);
};

/**
 * Create the data for log file.
 * @param message {string} Successful or failure message of activation.
 */
pref.createLogData = function(message) {
	var date = new Date();
	console.log(date);
	var logData = date.getMonth() + 1 + "/" + date.getDate() + "/"
			+ date.getFullYear();
	logData += " " + date.getHours() + ":" + date.getMinutes() + ":"
			+ date.getSeconds();
	logData += ' - "' + message + '"\n';
	return logData;
};

/**
 * Create the license or log file and make them read only.
 * @param fileExtension {string} The extension of file i.e.
 * .log or .license.
 * @param data {string} The data to write to the file.
 */
pref.addFileToPreferenceFolder = function(fileExtension, data) {
	var filePath = this.getFilePath(fileExtension);
	this.setPermissionToFile(filePath, filePermission.WriteOnly);
	this.writeFile(filePath, data);
	this.setPermissionToFile(filePath, filePermission.ReadOnly);
};

pref.log = function(message) {
	var filePath = this.getFilePath('.log');
	pref.setPermissionToFile(filePath, filePermission.WriteOnly);
	message = pref.createLogData(message);
	fs.appendFile(filePath, message, function (err) {
	    if (err) throw err;
	    console.log('The "data to append" was appended to file!');
	    pref.setPermissionToFile(filePath, filePermission.ReadOnly);
	});	
};

pref.logError = function(e) {
	pref.log(e.stack);
};

pref.logResSuccess = function(xhr, response) {
	if (response === null) {
		response = JSON.parse(xhr.responseText);
	} 
	pref.log(xhr.status + " - " + response.message);
};

pref.logResError = function(xhr) {
	var response = JSON.parse(xhr.responseText);
	pref.log(xhr.status + " - " + response.message);
};