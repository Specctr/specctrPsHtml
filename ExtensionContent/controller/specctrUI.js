/*
File-Name: specctrUI.js
Description: Includes all the methods related to UI components (checkboxes, textBoxes, comboBoxes etc) 
like change event handlers, click event handlers etc. 
 */

Specctr = Specctr || {};
Specctr.UI = {
	
	/**
	 * Description	: Redirect to specctr home page.
	 */
	bannerClickHandler : function(){
		analytics.trackFeature('cloud.banner_link');
		window.cep.util.openURLInDefaultBrowser("http://specctr.com/?utm_source=aiPanelLite&utm_medium=banner&utm_content=bottomBuyBanner&utm_campaign=specctrProduct");
	},
	
	closeCloudPage: Specctr.Utility.tryCatchLog(function(){
		$("#dvCloudContainer").hide();
		$("#tabContainer").show();
	}),
		
	/**
	 * Show/hide the setting tab page.
	 */
	toggleSettingPage : Specctr.Utility.tryCatchLog(function(){
		Specctr.Utility.changeSettingFooterColor($("#footerLabel"));

		if($("#tabBlock").is(":visible")) {
			$("#settingIcon").attr("src", imagePath + "Icon_prefs_active.png");
			$("#tabBlock").css("display", "none");
			$("#settingPage").css("display", "block");
			$("#settingBlock").addClass("settingFooter");
			$("#settingBlokChildDiv").addClass("setFooterLayOut");
		} else {
			$("#settingIcon").attr("src", imagePath + "Icon_prefs.png");
			$("#settingPage").css("display", "none");
			$("#tabBlock").css("display", "block");
			$("#settingBlock").removeClass("settingFooter");
			$("#settingBlokChildDiv").removeClass("setFooterLayOut");
		}
	}),
	
	/**
	 * Open url in default browser.
	 */
	loginLinkClickHandler : Specctr.Utility.tryCatchLog(function(){
		var csInterface = new CSInterface();
		csInterface.openURLInDefaultBrowser("https://cloud.specctr.com");
	}),
	
	/**
	 * Click event handler of tabs. Modify styles to tabs and 
	 * call the function to change images on tab.
	 */
	tabClickHandler : Specctr.Utility.tryCatchLog(function(){
		if ($(this).hasClass('disabled')) {
			return;
		};
		var ident = this.id.split("_")[1];
		Specctr.UI.showTab(ident);
	}),
	
	// Show tab.
	showTab: Specctr.Utility.tryCatchLog(function(ident) {
		analytics.trackFeature('tabs.open_' + ident);
		
		var tabElement = $('#tabHeader_' + ident)[0].parentNode;
		var current = tabElement.getAttribute("data-current");

		// Remove class of active tab header and hide old contents
		var currentTabHeader = $("#tabHeader_" + current);
		var currentTabPage = $("#tabpage_" + current);

		if (currentTabHeader && currentTabPage
				&& (ident >= "1" && ident <= "4")) {
			currentTabHeader.removeAttr("class");
			currentTabPage.css("display", "none");
		} else {
			return false;
		}

		// Set Image of Active Tab
		Specctr.Utility.changeImagesOfTabs(parseInt(ident));

		$("#tabpage_" + ident).css("display", "block");
		tabElement.setAttribute("data-current", ident);
	}),
	
	enableAllTabs: Specctr.Utility.tryCatchLog(function() {
		for(var i = 1; i <= 4; i++) {
			$('#tabHeader_' + i).removeClass('disabled');
		}		
	}),
	
	disableNonCloudTabs: Specctr.Utility.tryCatchLog(function() {
		for(var i = 1; i <= 3; i++) {
			$('#tabHeader_' + i).addClass('disabled');
		}		
	}),
	
	/**
	 * Stop the bubbling of click event.
	 */
	itemClickHandler : Specctr.Utility.tryCatchLog(function(event){
		event.stopPropagation();
	}),
	
	/**
	 * Set the value of checkBox model value when changed.
	 * @param checkBoxId {string} The id of selected checkbox.
	 */
	checkBoxChangeHandler : Specctr.Utility.tryCatchLog(function(checkBox){
		model[checkBox.id] = checkBox.checked;

		//Change the checkbox label color to blue.
		var parent = $(checkBox).parent();
		if ($(parent).hasClass('tabPage2Content'))
			Specctr.Utility.changeTextColor($(parent).children().last());

		pref.writeAppPrefs();
	}),
	
	/**
	 * Set the model value of text box when changed.
	 * @param textBoxId {string} The id of selected text box.
	 */
	textBoxChangeHandler : Specctr.Utility.tryCatchLog(function(textBoxId){
		model[textBoxId] = Number($("#" + textBoxId).val());
		pref.writeAppPrefs();
	}),
	
	/**
	 * Enable/Disable the width and height text boxes and 
	 * set the value of model's specInPrcntg when changed.
	 */
	specInPercentageChangeHandler : Specctr.Utility.tryCatchLog(function(){
		model.specInPrcntg = $("#specInPrcntg").is(":checked");
		if (model.specInPrcntg) {
			Specctr.Utility.enableTextField("relativeWidth");
			Specctr.Utility.enableTextField("relativeHeight");
		} else {
			Specctr.Utility.disableTextField("relativeWidth");
			Specctr.Utility.disableTextField("relativeHeight");
		}
		pref.writeAppPrefs();
	}),

	/**
	 * Enable/Disable the baseFontSize and baseLineHeight text boxes and
	 * set the value of model's specInEM when changed.
	 */
	specInEMChangeHandler : Specctr.Utility.tryCatchLog(function(element){
		var textFontSize = $("#baseFontSize");
		var textBaseLineHeight = $("#baseLineHeight");
		model.specInEM = element.checked;

		if (model.specInEM) {
			Specctr.Utility.enableTextField("baseFontSize");
			Specctr.Utility.enableTextField("baseLineHeight");
		} else {
			Specctr.Utility.disableTextField("baseFontSize");
			Specctr.Utility.disableTextField("baseLineHeight");
		}

		//Fill default values if nothing is present in specInEM's textboxes.
		if (textFontSize.val().length == 0)
			textFontSize.val("16");

		if (textBaseLineHeight.val().length == 0) {
			var value = Number(Math.round(Number(textFontSize.val()) * 140) / 100);
			textBaseLineHeight.val(value.toString());
			model.baseLineHeight = value;
		}
		pref.writeAppPrefs();
	}),

	/**
	 * Set the value of useScaleBy when changed.
	 */
	useScaleByClickHandler : Specctr.Utility.tryCatchLog(function(){
		model.useScaleBy = $("#useScaleBy").is(":checked");

		if (model.useScaleBy)
			Specctr.Utility.enableTextField("txtScaleBy");
		else
			Specctr.Utility.disableTextField("txtScaleBy");

		pref.writeAppPrefs();
	}),

	/**
	 *Allow the input greater than 1 only and set the value of scaleValue when changed.
	 */
	txtScaleByChangeHandler : Specctr.Utility.tryCatchLog(function(){
		var scaleByHandler = $("#txtScaleBy");
		var firstChar = scaleByHandler.val().charAt(0);

		// if first character is other than 'x', 'X' or '/' then empty the text box.
		if (!(firstChar == "x" || firstChar == "/" || firstChar == "X"))
			scaleByHandler.val("");

		// Restrict the text inputs to satisfy the values like x1, x2, /1, /2 etc.
		model.scaleValue = scaleByHandler.val();
	}),

	/**
	 * Set the value of legendColorMode when selection of radio button changed.
	 * @param event {event type} The event comes after clicking radio button.
	 */
	radioButtonClickHandler : Specctr.Utility.tryCatchLog(function(event, value){
		var selectedValue = event.target.value;
		if (selectedValue === undefined)
			return;

		model[value] = selectedValue;
		pref.writeAppPrefs();
	}),

	/**
	 * Set the value of font size when changed.
	 * @param element {object} Reference of selected combo-box.
	 * @param modelValue {string} Combo-box name.
	 */
	comboBoxChangeHandler : Specctr.Utility.tryCatchLog(function(element, modelValue){
		var value = element.options[element.selectedIndex].value;
		if(!isNaN(Number(value)))
			value = Number(value);
		model[modelValue] = value;
		pref.writeAppPrefs();
	}),

	/**
	 * Set the value of font when changed.
	 */
	listFontChangeHandler : Specctr.Utility.tryCatchLog(function(element){
		var selectedFont = element.options[element.selectedIndex];
		model.legendFontFamily = selectedFont.value;
		model.legendFont = selectedFont.text;
		pref.writeAppPrefs();
	}),

	/**
	 * Set color value to the color-picker dropdown's input text on hovering the color blocks.
	 * @param element {object} The reference of color picker.
	 * @param colorPickerBlock {string} The name of color picker block.
	 */
	setColorValueToTextBox : Specctr.Utility.tryCatchLog(function(element, colorPickerBlock){
		var inputTextName = "#txt" + colorPickerBlock + "Color";
		var blockName = "#" + colorPickerBlock.toLowerCase() + "ColorBlock";
		$(inputTextName).val(element.title);
		$(blockName).css("background-color", "#" + element.title);
	}),

	/**
	 * Set color to the color picker's label on clicking any color block and 
	 * close the dropdown.
	 * @param element {object} The reference of color picker.
	 * @param colorPickerBlock {string} The name of color picker block.
	 */
	setColorToLabel : Specctr.Utility.tryCatchLog(function(element, colorPickerBlock){
		var value = "legendColor" + colorPickerBlock;

		if (element.title) {
			var color = "#" + element.title;
		} else {
			color = element.style.backgroundColor;
			color = Specctr.Utility.rgbToHex(color);
		}

		var colorBlock = "col"+colorPickerBlock;
		Specctr.Utility.createDropForColorPicker(colorBlock,5, 0, color);
		$("#" + element.parentNode.id).slideUp(100);
		model[value] = color;
		pref.writeAppPrefs();
	}),
	
	/**
	 * Set hover property to the selector.
	 * @param selector {string} The selector string of UI component.
	 * @param hoverColor {string} Color at mouse-in to the component.
	 * @param bgColor {string} Color at mouse-out to the component.
	 */
	setHover : Specctr.Utility.tryCatchLog(function(selector, hoverColor, bgColor){
		$(selector).hover( function() {
	        $(this).css('background-color', hoverColor);
	    },
	    function(){
	        $(this).css('background-color', bgColor);
	    });
	}),
	
	/**
	 * Click handler of shape color-picker. Toggle the dropdown and 
	 * set the color to the main color block in color picker.
	 * @param elementId {string} The id of color picker.
	 * @param colorPickerBlock {string} The name of color picker block.
	 */
	colorPickerClickHandler : Specctr.Utility.tryCatchLog(function(element, colorPickerBlock){
		var colorBlockTextbox = "#txt" + colorPickerBlock + "Color";
		var dropDownBlock = "#color" + colorPickerBlock + "DropDown";
		var colorBlock = "#" + colorPickerBlock.toLowerCase() + "ColorBlock";
		var valueForTextBox = "";

		$(dropDownBlock).slideToggle(100);
		if (colorPickerBlock == "Shape") {
			valueForTextBox = model.legendColorObject;
			$("#colorSpaceDropDown").slideUp(100);
			$("#colorTypeDropDown").slideUp(100);
		} else if (colorPickerBlock == "Type") {
			valueForTextBox = model.legendColorType;
			$("#colorSpaceDropDown").slideUp(100);
		} else {
			valueForTextBox = model.legendColorSpacing;
		}
		
		$(colorBlock).css("background-color", valueForTextBox);
		$(colorBlockTextbox).val(valueForTextBox.substring(1).toUpperCase());
	}),

	/**
	 * Validate the input value in text input of color picker block.
	 * @param event {event type} The event dispatched after clicking text input.
	 */
	colorPickerTextInputValidation : Specctr.Utility.tryCatchLog(function(event){
		var charCode = (event.which) ? event.which : event.keyCode;

		/* Allows only hex value like eeffee or #eeffee.
		 * charCode = 8 : Enter key = 37 : Left arrow key = 39 : Right arrow key =
		 * 46 : Delete key
		 */
		if ((charCode < 48 && charCode != 8 && charCode != 37 && charCode != 39 && charCode != 46)
				|| (charCode > 57 && charCode < 65)
				|| (charCode > 70 && charCode < 97)
				|| (charCode > 102)
				|| (event.shiftKey && charCode != 51)) {
			return false;
		} else {
			return true;
		}
	}),

	/**
	 * Change the color on text input in color picker block.
	 * @param event {event type} The keyDown event dispatched after pressing key
	 * in textbox.
	 * @param colorPickerBlock {string} The name of color picker block. 
	 */
	colorPickerTextInputClickHandler : Specctr.Utility.tryCatchLog(function(event, colorPickerBlock){
		var elementId = "#txt" + colorPickerBlock + "Color";
		var textBox = $(elementId);
		var color = textBox.val();
		var inputSize = 7; // Length of the input hex value.

		if (color.charAt(0) == "#") {
			textBox.attr("maxlength", inputSize);
		} else {
			textBox.attr("maxlength", inputSize - 1);
			color = "#" + color;
		}

		for (var i = color.length; i < inputSize; i++)
			color += "0";

		var colorBlock = "#" + colorPickerBlock.toLowerCase() + "ColorBlock";
		$(colorBlock).css("background-color", color);

		if (event.keyCode == 13) // Dispatch the click event if pressed key is 'Enter'.
			$(colorBlock).trigger("click");
	}),

	/**
	 * Dispatch the click event of activeButton.
	 * @param event {event type} The keyDown event dispatched after pressing key
	 * in textbox. 
	 */
	textKeyDownHandler : Specctr.Utility.tryCatchLog(function(event, buttonId){
		if (event.keyCode == 13)
			$(buttonId).trigger("click");
	}),
	
	cloudTextHandler : Specctr.Utility.tryCatchLog(function(event) {
		if (event.keyCode == 13) {
			analytics.trackFeature('cloud.add_project');
			
			var text = $("#cloudText").val();
			//trim text;
			try{
			text = text.trim();
			}catch(e){}
			if(text == "")
				return;
			
			//Check if it already exist or not..
			if($("#projectTable tr:contains('"+text+"')").length > 0) {
				$("#projectTable tr:contains('"+text+"')").addClass('highlight').siblings().removeClass('highlight');
				return;
			}
			
			//Add data to table.
			var table = document.getElementById("projectTable");
			var row = table.insertRow(-1);
			var name = row.insertCell(0);
			name.innerHTML = text;
			$("#cloudText").val("");
			
			$("#projectTable tr").on("click",function() {
				try {
					$(this).addClass('highlight').siblings().removeClass('highlight');
				} catch(e) {
					alert(e);
				}
			});
		}
	}),

	/**
	 * Restrict the text input to decimal value.
	 * @param event {event type} The keyDown event dispatched after pressing key
	 * in textbox. 
	 */
	restrictInputToDecimal : Specctr.Utility.tryCatchLog(function(event){
		var charCode = (event.which) ? event.which : event.keyCode;

		if (charCode == 48 && !event.srcElement.value.length)
			return false;

		if (charCode == 46 && event.srcElement.value.split(".").length > 1)
			return false;

		if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57))
			return false;

		return true;
	})
};
