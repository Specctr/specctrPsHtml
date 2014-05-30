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

function readFile(file)
{
	var result = window.cep.fs.readFile(file);
	if(result.err != window.cep.fs.NO_ERROR)
		return "";
	
	return result.data;
}

function writeFile(file, data)
{
	window.cep.fs.writeFile(file, data);
}

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

function createLog(data)
{
	var filePath = getPrefernceDirectory() + "/" + "specctr_ps.log";
	var existingData = readFile(filePath);
	
	var allData = existingData + createLogData(data);
	writeFile(filePath, allData);
}

function getCredentials()
{
	var fileName = "specctr_fingerprint.sys";
	var filePath = getPrefernceDirectory() + "/" + fileName;
	var data = readFile(filePath);
	return JSON.parse(data);
}

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

function writeAppPrefs(data)
{
	writeFile(preferencePath, data);
	writeFile("g:\\test.txt", data);
}

function setPreferencePath()
{
	preferencePath = getPrefernceDirectory() + "/" + getConfigFileName();
}