/*
File-Name: specctrUI.js
Description: Includes all the methods related to UI component like change event handlers, click event handlers etc. 
*/

/**
 * FunctionName	: tab_clickHandler()
 * Description	: Click event handler of tabs. Modify styles to tabs and call the function to change images on tab.
 * */
function tab_clickHandler() 
{
    var current = this.parentNode.getAttribute("data-current");
    
    //Remove class of active tab header and hide old contents
    document.getElementById("tabHeader_" + current).removeAttribute("class");
    document.getElementById("tabpage_" + current).style.display = "none";

    var ident = this.id.split("_")[1];

    //Set Image of Active Tab
    changeImagesOfTabs(parseInt(ident));

    //Set class of active tab
    this.setAttribute("class", "tabActiveHeader");
    
    document.getElementById("tabpage_" + ident).style.display = "block";
    this.parentNode.setAttribute("data-current", ident);
}

/**
 * FunctionName	: changeImagesOfTabs()
 * Description	: Change the images of tabs on their selection.
 * */
function changeImagesOfTabs(selectedTab)
{
	var tab1Image = document.getElementById("tabImage_1");
    var tab2Image = document.getElementById("tabImage_2");
    var tab3Image = document.getElementById("tabImage_3");
    var tab4Image = document.getElementById("tabImage_4");
    
    switch(selectedTab) 
    {
        case 1: 
        	tab1Image.src = "Images/Icon_main_active.png";
        	tab2Image.src = "Images/Icon_settings.png";
        	tab3Image.src = "Images/Icon_responsive.png";
        	tab4Image.src = "Images/Icon_prefs.png";
            break;
        
        case 2: 
        	tab1Image.src = "Images/Icon_main.png";
        	tab2Image.src = "Images/Icon_settings_active.png";
        	tab3Image.src = "Images/Icon_responsive.png";
        	tab4Image.src = "Images/Icon_prefs.png";
            break;
        
        case 3:
        	tab1Image.src = "Images/Icon_main.png";
        	tab2Image.src = "Images/Icon_settings.png";
        	tab3Image.src = "Images/Icon_responsive_active.png";
        	tab4Image.src = "Images/Icon_prefs.png";
            break;
            
        case 4: 
        	tab1Image.src = "Images/Icon_main.png";
        	tab2Image.src = "Images/Icon_settings.png";
        	tab3Image.src = "Images/Icon_responsive.png";
        	tab4Image.src = "Images/Icon_prefs_active.png";
            break;
    } 
}

/**
 * FunctionName	: shapeFill_changeHandler()
 * Description	: Set the value of shape fill when changed.
 * */
function shapeFill_changeHandler()
{
	model.shapeFill = document.getElementById("shapeFill").checked;
}
  
/**
 * FunctionName	: shapeStroke_changeHandler()
 * Description	: Set the value of stroke when changed.
 * */
function shapeStroke_changeHandler()
{
	model.shapeStroke = document.getElementById("shapeStroke").checked;
}
	
/**
 * FunctionName	: shapeAlpha_changeHandler()
 * Description	: Set the value of alpha when changed.
 * */
function shapeAlpha_changeHandler()
{
	model.shapeAlpha = document.getElementById("shapeAlpha").checked;
}

/**
 * FunctionName	: shapeEffects_changeHandler()
 * Description	: Set the value of gradient when changed.
 * */
 function shapeEffects_changeHandler()
{
	model.shapeEffects = document.getElementById("shapeEffects").checked;
}

/**
 * FunctionName	: shapeBorderRadius_changeHandler()
 * Description	: Set the value of border radius when changed.
 * */
 function shapeBorderRadius_changeHandler()
{
	model.shapeBorderRadius = document.getElementById("shapeBorderRadius").checked;
}

/**
 * FunctionName	: textFont_changeHandler()
 * Description	: Set the value of text font when changed.
 * */
 function textFont_changeHandler()
{
	model.textFont = document.getElementById("textFont").checked;
}

/**
 * FunctionName	: textSize_changeHandler()
 * Description	: Set the value of text size when changed.
 * */
 function textSize_changeHandler()
{
	model.textSize = document.getElementById("textSize").checked;
}

/**
 * FunctionName	: textColor_changeHandler()
 * Description	: Set the value of text color when changed.
 * */
 function textColor_changeHandler()
{
	model.textColor = document.getElementById("textColor").checked;
}

/**
 * FunctionName	: textStyle_changeHandler()
 * Description	: Set the value of text style when changed.
 * */
 function textStyle_changeHandler()
{
	model.textStyle = document.getElementById("textStyle").checked;
}

/**
 * FunctionName	: textAlignment_changeHandler()
 * Description	: Set the value of text alignment when changed.
 * */
 function textAlignment_changeHandler()
{
	model.textAlignment = document.getElementById("textAlignment").checked;
}

/**
 * FunctionName	: textLeading_changeHandler()
 * Description	: Set the value of text leading when changed.
 * */
 function textLeading_changeHandler()
{
	model.textLeading = document.getElementById("textLeading").checked;
}

/**
 * FunctionName	: textTracking_changeHandler()
 * Description	: Set the value of text tracking when changed.
 * */
 function textTracking_changeHandler()
{
   model.textTracking = document.getElementById("textTracking").checked;
}

/**
 * FunctionName	: shapeFillStyle_changeHandler()
 * Description	: Set the value of style when changed.
 * */
 function textAlpha_changeHandler()
{
	model.textAlpha = document.getElementById("textAlpha").checked;
}

 /**
  * FunctionName	: textEffects_changeHandler()
  * Description	: Set the value of effects when changed.
  * */
  function textEffects_changeHandler()
 {
 	model.textEffects = document.getElementById("textEffects").checked;
 }
 
 /**
 * FunctionName	: canvasExpandSize_changeHandler()
 * Description	: Set the value of canvasExpandSize when changed.
 * */
function canvasExpandSize_changeHandler()
{
	model.canvasExpandSize = Number(document.getElementById("canvasExpandSize").value);
}

/**
 * FunctionName	: canvasExpandSize_changeHandler()
 * Description	: Set the value of canvasExpandSize when changed.
 * */
function canvasExpandSize_changeHandler()
{
	model.canvasExpandSize = Number(document.getElementById("canvasExpandSize").value);
}

