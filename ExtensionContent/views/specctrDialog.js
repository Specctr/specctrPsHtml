/*
File-Name: specctrDialog.js
Description: Consist all modal/non-modal dialog related functions in specctr panel. 
 */

var specctrDialog = {};

/**
 * Set the style of dialog at the time of initialization of panel. 
 */
specctrDialog.createAlertDialog = function() {
	$("#dialog").dialog({
		autoOpen : false,
		resizable: false,
		width : 200,
		height : 80,
		modal : true,
		buttons : []
	});
};

/**
 * Open the dialog with the passed message.
 * @param message {string} The message that appear in the dialog.
 */
specctrDialog.showAlert = function(message) {
	var dialogRef = $("#dialog");
	dialogRef.text(message);
	dialogRef.dialog("open");
	dialogRef.dialog({position:'center'});
};

/**
 * Set the style of dialog at the time of initialization of panel. 
 */
specctrDialog.createCloudDialog = function() {
	$("#cloudUploadDialog").dialog({
		autoOpen : false,
		resizable: false,
		width : 200,
		height : 300,
		modal : true,
		buttons : []
	});
};

/**
 * Open the dialog with the passed message.
 * @param message {string} The message that appear in the dialog.
 */
specctrDialog.showCloudDialog = function(message) {
	var dialogRef = $("#cloudUploadDialog");
	dialogRef.dialog("open");
	dialogRef.dialog({position:'center'});
};