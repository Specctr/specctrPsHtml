/*
File-Name: specctrUI.js
Description: Includes all the methods related to UI component like change event handlers, click event handlers etc. 
 */

/**
 * FunctionName	: activateButton_clickHandler()
 * Description	: Validate the license of the user and move to the tab container if user's credentials valid.
 * */
function activateButton_clickHandler()
{
	var urlRequest;

	// Get Extension Id and matching productCode.
	var productCodes = {
			"SpecctrPs-Pro":"31265"};

	var csInterface = new CSInterface();
	var extensionId = csInterface.getExtensionID();

	//If no installed extension is matched with productCodes values.
	if(!extensionId)
	{
		alert("Incorrect product code!");
		return;
	}

	urlRequest = "http://specctr-license.herokuapp.com";
	urlRequest += "?product=" + productCodes[extensionId];
	urlRequest += "&license=" + document.getElementById("license").value;
	urlRequest += "&email=" + document.getElementById("emailInput").value;

	$.get(urlRequest, completeHandler);		
}

/**
 * FunctionName	: tab_clickHandler()
 * Description	: Click event handler of tabs. Modify styles to tabs and call the function to change images on tab.
 * */
function tab_clickHandler() 
{
	try
	{
		var ident = this.id.split("_")[1];
		var current = this.parentNode.getAttribute("data-current");

		//Remove class of active tab header and hide old contents
		var currentTabHeader = document.getElementById("tabHeader_" + current);
		var currentTabPage = document.getElementById("tabpage_" + current);

		if(currentTabHeader && currentTabPage && (ident >= "1" && ident <= "4"))
		{
			currentTabHeader.removeAttribute("class");
			currentTabPage.style.display = "none";
		}
		else
		{
			return false;
		}

		//Set Image of Active Tab
		changeImagesOfTabs(parseInt(ident));

		//Set class of active tab
		this.setAttribute("class", "tabActiveHeader");

		document.getElementById("tabpage_" + ident).style.display = "block";
		this.parentNode.setAttribute("data-current", ident);
	}
	catch(e)
	{
		alert(e);
		return false;
	}

	return true;
}

/**
 * FunctionName	: changeImagesOfTabs()
 * Description	: Change the images of tabs on their selection.
 * */
function changeImagesOfTabs(selectedTab)
{
	try
	{
		var tab1ImagePath = "../Images/Icon_main";
		var tab2ImagePath = "../Images/Icon_settings";
		var tab3ImagePath = "../Images/Icon_responsive";
		var tab4ImagePath = "../Images/Icon_prefs";
		var imageExtension = ".png";
		var activeImageEndString = "_active" + imageExtension;

		var isImageChanged = true;
		var tab1Image = document.getElementById("tabImage_1");
		var tab2Image = document.getElementById("tabImage_2");
		var tab3Image = document.getElementById("tabImage_3");
		var tab4Image = document.getElementById("tabImage_4");

		switch(selectedTab) 
		{
		case 1: 
			tab1Image.src = tab1ImagePath + activeImageEndString;
			tab2Image.src = tab2ImagePath + imageExtension;
			tab3Image.src = tab3ImagePath + imageExtension;
			tab4Image.src = tab4ImagePath + imageExtension;
			break;

		case 2: 
			tab1Image.src = tab1ImagePath + imageExtension;
			tab2Image.src = tab2ImagePath + activeImageEndString;
			tab3Image.src = tab3ImagePath + imageExtension;
			tab4Image.src = tab4ImagePath + imageExtension;
			break;

		case 3:
			tab1Image.src = tab1ImagePath + imageExtension;
			tab2Image.src = tab2ImagePath + imageExtension;
			tab3Image.src = tab3ImagePath + activeImageEndString;
			tab4Image.src = tab4ImagePath + imageExtension;
			break;

		case 4: 
			tab1Image.src = tab1ImagePath + imageExtension;
			tab2Image.src = tab2ImagePath + imageExtension;
			tab3Image.src = tab3ImagePath + imageExtension;
			tab4Image.src = tab4ImagePath + activeImageEndString;
			break;

		default:
			isImageChanged = false;
		} 

	}
	catch(e)
	{
		isImageChanged = false;
	}

	return isImageChanged;
}

/**
 * FunctionName	: checkBox_changeHandler()
 * Description	: Set the value of checkBox model value when changed.
 * */
function checkBox_changeHandler(checkBoxId)
{
	try
	{
		model[checkBoxId] = document.getElementById(checkBoxId).checked;
	}
	catch(e)
	{
		console.log(e);	//For debugging.
	}
}

/**
 * FunctionName	: comboBox_changeHandler()
 * Description	: Set the value of font size when changed.
 * */
function comboBox_changeHandler(elementId, modelValue)
{
	try
	{
		var comboHandler = document.getElementById(elementId);
		model[modelValue] = Number(comboHandler.options[comboHandler.selectedIndex].value);
	}
	catch(e)
	{
		console.log(e);
	}
}

/**
 * FunctionName	: lstFont_changeHandler()
 * Description	: Set the value of font when changed.
 * */
function lstFont_changeHandler()
{
	try
	{
		var fontListHandler = document.getElementById("lstFont");
		model.legenFontIndex = Number(fontListHandler.options[fontListHandler.selectedIndex].value);
		model.legendFont = fontListHandler.options[fontListHandler.selectedIndex].text;
	}
	catch(e)
	{
		alert(e);
	}
}

/**
 * FunctionName	: banner_clickHandler()
 * Description	: Redirect to specctr home page.
 * */
function banner_clickHandler()
{
	window.cep.util.openURLInDefaultBrowser("http://specctr.com/?utm_source=aiPanelLite&utm_medium=banner&utm_content=bottomBuyBanner&utm_campaign=specctrProduct");
}