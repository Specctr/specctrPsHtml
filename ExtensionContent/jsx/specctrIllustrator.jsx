/*//////////////////////////////////////////////////////////////////////////////
 * File Name: specctrIllustrator.jsx
 * Description: This file includes all the functions which create specs i.e. property spec,
    width/height spec, spacing spec, coordinate spec and expand canvas feature for Illustrator.
//////////////////////////////////////////////////////////////////////////////*/

#target illustrator
#include "json2.js"

var model;
	
var heightChoice = {"Left" : 1 , "Right" : 2, "Center" : 3};
var widthChoice = {"Top" : 1 , "Bottom" : 2, "Center" : 3};
	
var armPartLength = 40;
var cssText = "";
var cssBodyText = "";
var propSpecUndo=({});

ext_ILST_setModel = setModel;
ext_ILST_expandCanvas = createCanvasBorder;
ext_ILST_createDimensionSpecs = createDimensionSpecs;
ext_ILST_createSpacingSpecs = createSpacingSpecs;
ext_ILST_createCoordinateSpecs = createCoordinateSpecs;
ext_ILST_createPropertySpecs = createPropertySpecs;
ext_ILST_exportCss = exportCss;
ext_ILST_getFonts = getFontList;

//Get the application font's name and font's family.
function getFontList()
{
    var font = app.textFonts;
    var appFontLength = font.length;
    var result = new Array();
    
	//Set the spec text properties.
	for (var i = 0; i < appFontLength; i++)
	{
        var currFont = font[i];
        if(currFont.style == "Regular")
        {
            var object = new Object();
            object.label = currFont.family;
            object.font = currFont.name;
            result.push(object);
        }
	}

    return JSON.stringify(result);
 }

//Get the updated value of UI's component from html file.
function setModel(currModel)
{
    try
    {
        model = JSON.parse(currModel);
    }
    catch(e)
    {
        alert(e);
    }
}

//Create the canvas border and expand the artboard.
function createCanvasBorder()
{
    if(!app.documents.length) 
        return;

    var doc = app.activeDocument;
    var currentArtboard = doc.artboards[doc.artboards.getActiveArtboardIndex()];
				
    var artRect = currentArtboard.artboardRect;
    var border = canvasBorder();
                
    if(!border)
    {
        var newColor = new RGBColor();
        newColor.red = 200;
        newColor.blue = 200;
        newColor.green = 200;

        var prevArtboardPath = doc.pathItems.rectangle(artRect[1], artRect[0], artRect[2] - artRect[0], artRect[1] - artRect[3]);		
        prevArtboardPath.stroked = true;
        prevArtboardPath.strokeDashes = [12];
        prevArtboardPath.strokeWidth= model.armWeight;
        prevArtboardPath.strokeColor = newColor;

        prevArtboardPath.filled = false;
        prevArtboardPath.locked = true;
        prevArtboardPath.name = "Specctr Canvas Border " + currentArtboard.name;
				
        prevArtboardPath.move(legendLayer(), ElementPlacement.INSIDE);
        prevArtboardPath.zOrder(ZOrderMethod.SENDTOBACK);
    }
               
    artRect[0] -= model.canvasExpandSize;
    artRect[1] += model.canvasExpandSize;
    artRect[2] += model.canvasExpandSize;
    artRect[3] -= model.canvasExpandSize;
				
    currentArtboard.artboardRect = artRect;
}

//Get the canvas border, if present.
function canvasBorder()
{
    var result;
		
    try
    {
        var doc = app.activeDocument;
        var currentArtboard = doc.artboards[doc.artboards.getActiveArtboardIndex()];
        result = doc.pathItems.getByName("Specctr Canvas Border " + currentArtboard.name);
    }
    catch(e)
    {}
	
    return result;		
}

//Add coordinate or width/height style text into css file.
function addSpecsStyleTextToCss(variableId, text, specsInfo)
{
    try
    {
        var styleText = text;
        var specCssText;
        var noOfSpecs = specsInfo.length;
    
        for(var i = 0; i < noOfSpecs; i++)
        {
            if(specsInfo[i].id == variableId)
            {
                specCssText = specsInfo[i].styleText;       //Get the style text of coordinate or width/height specs.
                break;
            }
        }
                
        if(specCssText)         //Add the style text at the end of css file.
            styleText = styleText.replace("}", specCssText + "\r}");
    
        return styleText;
    }
    catch(e)
    {
        return text;
    }
}

//Return css text for shape objects
function getCssForPathItems(coordinateSpecsInfo)
{
    try
    {
        var doc = app.activeDocument;
        try
        {
            var objectProperties = doc.layers.getByName("specctr").layers.getByName("Object Properties");
        }   
        catch(e)
        {
            return "";
        }

        var styleText = "";
        var text, variableId;
        var dimensionSpecsInfo = getStyleFromOtherSpecs("Dimensions", "-dimensionCss:");           //Get the array of width/height specs info. 
        var noOfDimensionSpecs = dimensionSpecsInfo.length;               //Number of width/height specs present in the document.
        var noOfGroups = objectProperties.groupItems.length;                //Number of groups present in Object Properties layer group.
        var noOfCoordinateSpecs = coordinateSpecsInfo.length;            //Number of coordinate specs present in the document.

        //Fetch the style text from the specs and return the style text. 
        while(noOfGroups) 
        {
            try
            {
                var spec = objectProperties.groupItems[noOfGroups - 1];
                text = "";
                variableId = "";
            
                for(var i = 0; i < spec.textFrames.length; i++)
                {
                    var textFrame = spec.textFrames[i];
                    text = textFrame.note;

                    if(text)        //Get the css style text from the  property specs text item.
                    {
                        var array = text.split("-css:");
                        text = array[1];
                        variableId = textFrame.visibilityVariable.name;
                    }
                }
            
                if(variableId)
                {
                    if(noOfDimensionSpecs)      //Add the dimension specs into style text, if present.
                        text = addSpecsStyleTextToCss(variableId, text, dimensionSpecsInfo);
                
                    if(noOfCoordinateSpecs)     //Add the coordinate specs into style text, if present.
                        text = addSpecsStyleTextToCss(variableId, text, coordinateSpecsInfo);
                }
            
                if(text != "")
                    styleText += text + "\r\r";
            }
            catch(e)
            {}
            
            noOfGroups = noOfGroups - 1;
        }
    }
    catch(e)
    {
        styleText = "";
    }

    return styleText;
}

//Return css style text for text objects.
function getCssForText(coordinateSpecsInfo)
{
    try
    {
        var doc = app.activeDocument;
        try
        {   
            var textProperties = doc.layers.getByName("specctr").layers.getByName("Text Properties");
        }
        catch(e)
        {
            return "";
        }
    
        var styleText = "";
        var text, variableId;
        var noOfGroups = textProperties.groupItems.length;              //Number of groups present in Text Properties layer group.
        var noOfCoordinateSpecs = coordinateSpecsInfo.length;        //Number of coordinate specs present in the document.

        //Fetch the style text from the specs and return the style text. 
        while(noOfGroups)
        {
            try
            {
                var textSpec = textProperties.groupItems[noOfGroups - 1];
                text = "";
                variableId = "";
            
                for(var i = 0; i < textSpec.textFrames.length; i++)
                {
                    var textFrame = textSpec.textFrames[i];
                    text = textFrame.note;

                    if(text)            //Get the css style text from the specs text item.
                    {
                        var array = text.split("-css:");
                        text = array[1];
                        variableId = textFrame.visibilityVariable.name;
                    }
                }
      
            if(noOfCoordinateSpecs && variableId)       //Add the coordinate specs into style text, if present.
                text = addSpecsStyleTextToCss(variableId, text, coordinateSpecsInfo);
                
                if(text != "")
                    styleText += text + "\r\r";
            }
            catch(e)
            {}
            
            noOfGroups = noOfGroups - 1;
        }
    }
    catch(e)
    {
        styleText = "";
    }
        
    return styleText;
}

//Get the coordinate or width/height spec style info.
function getStyleFromOtherSpecs(specName, styleName)
{
    var doc = app.activeDocument;
    var specsInfo = new Array();
    try
    {
        var specLayerGroup = doc.layers.getByName("specctr").layers.getByName(specName);
    }
    catch(e)
    {
        return specsInfo;
    }
    
    var noOfSpecs = specLayerGroup.groupItems.length;

    while(noOfSpecs)
    {
        try
        {
            var group = specLayerGroup.groupItems[noOfSpecs - 1];
            for(var i = 0; i < group.textFrames.length; i++)
            {
                var item = group.textFrames[i];
                var text = item.note;

                //Store the unique ids and style text associated with specs text item.
                if(text)
                {
                    var object = new Object();
                    var styleText = text.split(styleName);
                    object.styleText  = styleText[1];
                    object.id = item.visibilityVariable.name;
                }
            }
            specsInfo.push(object);
         }
         catch(e)
         {}
         noOfSpecs = noOfSpecs - 1;
    }
    
    return specsInfo;
}

//Export the specs into styles.
function exportCss()
{
    var isExportedSuccessfully = false;
    try
    {
        var coordinateSpecsInfo = getStyleFromOtherSpecs("Coordinates", "-coordinateCss:");           //Get the array of coordinate specs info.
        
        var styleText = cssBodyText;            //Add the body text at the top of css file.
        styleText += getCssForText(coordinateSpecsInfo);        //Get the style text for those Text items on which property specs is applied.
        styleText += getCssForPathItems(coordinateSpecsInfo);    //Get the style text for those Path items on which property specs is applied.    
    
        if(styleText == "")
        {
            alert("Unable to export the specs!");
            return isExportedSuccessfully;
        }
        
        //Create the file and export it.
        var cssFile = "";
        var cssFilePath = "";
        var doc = app.activeDocument;
        var documentPath = doc.path;        //Get the path of the current ai file.
        cssFilePath = "~/desktop/Styles.css";
    
        if(documentPath != "")                          //If source file's path exist then change the path of css file to the location of that file.
            cssFilePath = documentPath + "/Styles.css";
    
        cssFile = File(cssFilePath);
    
        if(cssFile.exists)
        {
            var replaceFileFlag = confirm("Styles.css already exists in this location.\rDo you want to replace it?", true, "Specctr");
            if(!replaceFileFlag)
                return isExportedSuccessfully;
        }
    
        //Create and write the css file.
        if(cssFile)
        {
            cssFile.open("w");
            cssFile.write(styleText);
            cssFile.close;
        
            if(replaceFileFlag)
                alert("Styles.css is exported.");
            else 
                alert("Styles.css is exported to " + cssFilePath);
        }
        else
        {
            alert("Unable to export the specs!");
            return isExportedSuccessfully;
        }
    
        isExportedSuccessfully = true;
    }
    catch(e)
    {
        alert(e);
    }
    
    return isExportedSuccessfully;
}

//Delete the group item of spacing specs between two items.
function removeSpacingItemsGroup(idVarForFirstItem, idVarForSecondItem, groupName)
{
     try
    {
        if(idVarForFirstItem && idVarForSecondItem)
        {
            try
            {
                var parentGroup = app.activeDocument.layers.getByName("specctr").layers.getByName(groupName);
            }
            catch(e) 
            {
                return;
            }
            
            var idVarName =  idVarForFirstItem.name + idVarForSecondItem.name;
            if(parentGroup)
            {
                var noOfIteration = parentGroup.groupItems.length;
                while(noOfIteration)
                {
                    var specGroup = parentGroup.groupItems[noOfIteration - 1];
                
                    //If unique Ids of spec's group consist the given string name then delete the group.
                    if(specGroup.note.search(idVarName) > 0)
                    {
                        specGroup.remove();
                        break; 
                    }
                    
                    noOfIteration -= 1;
                }
            }
        }
    }
    catch(e)
    {}
}

//Delete the group item of coordinate specs, width/height specs and spacing specs for single item.
function removeSpecGroup(idVar, groupName)
{
    try
    {
        if(idVar)
        {
            try
            {
                var parentGroup = app.activeDocument.layers.getByName("specctr").layers.getByName(groupName);
            }
            catch(e) 
            {
                return;
            }
        
            if(parentGroup)
            {
                var noOfIteration = parentGroup.groupItems.length;
                while(noOfIteration)
                {
                    var specGroup = parentGroup.groupItems[noOfIteration - 1];
                    
                    try //Handled exception if no visibilityVariable is defined for the group.
                    {
                        //If unique Ids of spec's group and given id matches then delete the group.
                        if(specGroup.visibilityVariable.name == idVar.name)
                        {
                            specGroup.remove();
                            break; 
                        }
                    }
                    catch(e)
                    {}
                    
                    noOfIteration -= 1;
                }
            }
        }
    }
    catch(e)
    {}
}

//Apply scaling to the given value.
function getScaledValue(value)
{
    var scaledValue = value;
    try
    {
        if(model.useScaleBy)        //Scaling option is checked or not.
        {
            var scaling = Number(model.scaleValue.substring(1));
        
            if(!scaling)
                scaling = 1;
        
            if(model.scaleValue.charAt(0) == '/')
                scaledValue = scaledValue / scaling;
            else
                scaledValue = scaledValue * scaling;
        }
    }
    catch(e)
    {
        scaledValue = value;
    }

    return scaledValue;
}

//Set unique Id for the source item.
function setUniqueIDToItem(pageItem)
{
    try
    {
        var date = new Date();
        var id = date.getTime();
    
        //Store the unique IDs to the source item.
        var idVar = app.activeDocument.variables.add();
        idVar.kind = VariableKind.VISIBILITY;
        idVar.name = "Var_" + id;
        pageItem.visibilityVariable = idVar;
        pageItem.note = "({type:'source',varName:'" + idVar.name + "'})";
    }
    catch(e)
    {
        return null;
    }
    
    return idVar;
}

//Call the dimension specs function for each selected art on the active artboard.
function createDimensionSpecs()
{
    try
    {
		for(var i = 0; i < app.selection.length; i++)
		{
            var obj = app.selection[i];
            if(!obj.visibilityVariable || !obj.note || obj.note.indexOf("source") != -1)
                createDimensionSpecsForItem(obj);
        }

        app.redraw();
    }
    catch(e)
    {}
}

//Create the dimension spec for the selected page item.
function createDimensionSpecsForItem(pageItem)
{
    try
    {
        if(model.widthPos == 0 && model.heightPos == 0) 
            return true;
		
        var legendLayer = legendDimensionsLayer();
        var pageItemBounds = itemBounds(pageItem);

        var height = pageItemBounds[1] - pageItemBounds[3];
        var width = pageItemBounds[2] - pageItemBounds[0];
        var heightForSpec = height;
        var widthForSpec = width;
    
        //Responsive option is checked or not.
        if(!model.specInPrcntg)
        {
            //Values after applying scaling.
            widthForSpec = pointsToUnitsString(getScaledValue(widthForSpec), null);
            heightForSpec = pointsToUnitsString(getScaledValue(heightForSpec), null);
        }
        else 
        {
            //Relative distance with respect to original canvas Or the given values in the text boxes of Responsive tab.
            var relativeHeight = '', relativeWidth = '';
            var originalArtboardSize = originalArtboardRect();       //Get the original size of artboard.
            
            if(model.relativeHeight != 0)
                relativeHeight = model.relativeHeight;
            else
                relativeHeight = -originalArtboardSize[3];
                
            if(model.relativeWidth != 0)
                relativeWidth = model.relativeWidth;
            else
                relativeWidth = originalArtboardSize[2];

            widthForSpec = Math.round(widthForSpec / relativeWidth * 100) + "%";
            heightForSpec = Math.round(heightForSpec / relativeHeight * 100) + "%";
        }
    
        //Delete the width/height spec group if it is already created for the acitve source item on the basis of the visibility variable.
        var idVar = pageItem.visibilityVariable;
        removeSpecGroup(idVar, "Dimensions");
   
        var styleText = "\twidth: " + widthForSpec + ";\r\theight: " + heightForSpec +";";
        var spacing = 10 + model.armWeight;
        var newColor = legendColorSpacing();
        var itemsGroup = app.activeDocument.groupItems.add();
	
        //Create the width specs.
        if(model.widthPos > 0)
        {
            var lineY, textY;
        
            //Set the positions of the spec's component according to the width position.
            switch(model.widthPos)
            {
                case widthChoice.Bottom:
                    lineY = pageItemBounds[3] - 0.7 * spacing;
                    textY = pageItemBounds[3] - spacing - model.armWeight / 2;
                    break;
            
                case widthChoice.Center:
                    lineY = pageItemBounds[3] + height / 2;
                    textY = pageItemBounds[3] + height / 2 + 0.3 * spacing + model.armWeight / 2;
                    break;
            
                case widthChoice.Top:
                default:
                    lineY = pageItemBounds[1] + 0.7 * spacing;
                    textY = pageItemBounds[1] + spacing + model.armWeight / 2;
            }
        
            var widthText = app.activeDocument.textFrames.pointText([pageItemBounds[0] + width / 2, textY], TextOrientation.HORIZONTAL);
            widthText.contents = widthForSpec;
            widthText.textRange.paragraphAttributes.justification = Justification.CENTER;			
            widthText.textRange.characterAttributes.fillColor = newColor;			
            widthText.textRange.characterAttributes.textFont = app.textFonts.getByName(model.legendFont);
            widthText.textRange.characterAttributes.size = model.legendFontSize;
        
            if(model.widthPos == widthChoice.Bottom) 
                widthText.translate(0, -widthText.height);
        
            if(model.heightPos == heightChoice.Center && model.widthPos == widthChoice.Center)
                widthText.translate(widthText.width);
        
            widthText.move(legendLayer, ElementPlacement.INSIDE);
            widthText.note = "({type:dimensionsWidth})";
            widthText.name = "Specctr Dimension Width Mark";
			
            var widthLine = app.activeDocument.compoundPathItems.add();
        
            var widthLineMain = widthLine.pathItems.add();
            widthLineMain.setEntirePath([[pageItemBounds[0], lineY], [pageItemBounds[2], lineY]]);
			
            var widthLineLeft = widthLine.pathItems.add();
            widthLineLeft.setEntirePath([[pageItemBounds[0] + model.armWeight / 2, lineY - 0.3 * spacing],
                                                        [pageItemBounds[0] + model.armWeight / 2, lineY + 0.3 * spacing]]);
	
            var widthLineRight = widthLine.pathItems.add();
            widthLineRight.setEntirePath([[pageItemBounds[2] - model.armWeight / 2, lineY - 0.3 * spacing],
                                                        [pageItemBounds[2] - model.armWeight / 2, lineY + 0.3 * spacing]]);
			
            widthLineMain.stroked = true;
            widthLineMain.strokeDashes = [];
            widthLineMain.strokeWidth = model.armWeight;
            widthLineMain.strokeColor = newColor;
            widthLine.move(itemsGroup, ElementPlacement.INSIDE);
            widthText.move(itemsGroup, ElementPlacement.INSIDE);
        }
	
        //Create the height specs.
        if(model.heightPos > 0)
        {
            var lineX, textX;
        
            //Set the positions of the spec's component according to the height position.
            switch (model.heightPos)
            {
                case heightChoice.Right:
                    lineX = pageItemBounds[2] + 0.7 * spacing;
                    textX= pageItemBounds[2] + spacing + model.armWeight / 2; 
                    break;
            
                case heightChoice.Center:
                    lineX = pageItemBounds[0] + width / 2;
                    textX = pageItemBounds[0] + width / 2 - 0.3 * spacing - model.armWeight / 2;
                    break;
                
                case heightChoice.Left:
                default:
                    lineX = pageItemBounds[0] - 0.7 * spacing;
                    textX = pageItemBounds[0] - spacing - model.armWeight / 2;
            }
                
            var heightText = app.activeDocument.textFrames.pointText([textX, pageItemBounds[3] + height / 2], TextOrientation.HORIZONTAL);
            heightText.contents = heightForSpec;
            heightText.textRange.paragraphAttributes.justification = Justification.CENTER;
            heightText.textRange.characterAttributes.textFont = app.textFonts.getByName(model.legendFont);
            heightText.textRange.characterAttributes.size = model.legendFontSize;
            
            if(model.heightPos == heightChoice.Right) 
                heightText.translate(heightText.width / 2);
            else 
                heightText.translate(-heightText.width / 2);
            
            if(model.heightPos == heightChoice.Center && model.widthPos == widthChoice.Center)
                heightText.translate(0, heightText.height * 2);

            heightText.textRange.characterAttributes.fillColor = newColor;
            heightText.move(legendLayer, ElementPlacement.INSIDE);
            heightText.note = "({type:dimensionsHeight})";
            heightText.name = "Specctr Dimension Height Mark";
			
            var heightLine = app.activeDocument.compoundPathItems.add();
            var heightLineMain = heightLine.pathItems.add();
            heightLineMain.setEntirePath([[lineX, pageItemBounds[3]], [lineX, pageItemBounds[1]]]);

            var heightLineBottom = heightLine.pathItems.add();
            heightLineBottom.setEntirePath([[lineX + 0.3 * spacing, pageItemBounds[1] - model.armWeight / 2],
                                                            [lineX - 0.3 * spacing, pageItemBounds[1] - model.armWeight / 2]]);

            var heightLineTop = heightLine.pathItems.add();
            heightLineTop.setEntirePath([[lineX + 0.3 * spacing, pageItemBounds[3] + model.armWeight / 2],
                                                        [lineX - 0.3 * spacing, pageItemBounds[3] + model.armWeight / 2]]);
			
            heightLineMain.stroked = true;
            heightLineMain.strokeDashes = [];
            heightLineMain.strokeWidth = model.armWeight;
            heightLineMain.strokeColor = newColor;

            heightLine.move(itemsGroup, ElementPlacement.INSIDE);
            heightText.move(itemsGroup, ElementPlacement.INSIDE);
        }
 
        itemsGroup.note = "({type:dimensionsGroup})";
        itemsGroup.name = "Specctr Dimension Mark";
        itemsGroup.move(legendLayer, ElementPlacement.INSIDE);
        
        //Set the id to the page item if no id is assigned to that item.
        if(!idVar)
            idVar = setUniqueIDToItem(pageItem);

        //Store the unique IDs to the width/height spec's component.
        itemsGroup.visibilityVariable = idVar;
        heightText.visibilityVariable = idVar;
        widthText.visibilityVariable = idVar;
    
        //Add the note to the width/height spec's component which is used later to get the style text.
        itemsGroup.note = "({type:'dimensionsGroup'})";
        heightText.note = "({type:'dimensionsHeight',varName:'" + idVar.name + "'})" + "-dimensionCss:" + styleText;
        widthText.note = "({type:'dimensionsWidth',varName:'" + idVar.name + "'})" + "-dimensionCss:" + styleText;
    }
    catch(e)
    {
        alert(e);
        return false;
    }

    return true;
}

//Call the coordinate specs function for each selected art on the active artboard.
function createCoordinateSpecs()
{
    try
    {
		for(var i = 0; i < app.selection.length; i++)
		{
            var obj = app.selection[i];
            if(!obj.visibilityVariable || !obj.note || obj.note.indexOf("source") != -1)
                createCoordinateSpecsForItem(obj);
        }

        app.redraw();
    }
    catch(e)
    {}
}

//Create coordinate specs for the selected page item.
function createCoordinateSpecsForItem(pageItem)
{
    try
    {
        var legendLayer = legendCoordinatesLayer();                        //Create the 'Coordinates' layer group.
        var pageItemBounds = itemBounds(pageItem);
        var top = -pageItemBounds[1];
        var left = pageItemBounds[0];
        var spacing = 10 + model.armWeight;
        var idVar = pageItem.visibilityVariable;
        removeSpecGroup(idVar, "Coordinates");
    
        //Responsive option is selected or not.
        if(!model.specInPrcntg)
        {
            //Absolute distance.
            top = pointsToUnitsString(top, null);
            left = pointsToUnitsString(left, null);
        }
        else 
        {
            //Relative distance with respect to original canvas Or the given values in the text boxes of Responsive tab.
            var relativeTop = '', relativeLeft = '';
            var originalArtboardSize = originalArtboardRect();       //Get the original size of artboard.
            
            if(model.relativeHeight != 0)
                relativeTop = model.relativeHeight;
            else
                relativeTop = -originalArtboardSize[3];
                
            if(model.relativeWidth != 0)
                relativeLeft = model.relativeWidth;
            else
                relativeLeft = originalArtboardSize[2];

            top = Math.round(top / relativeTop * 100) + "%";
            left = Math.round(left / relativeLeft * 100) + "%";
        }
    
        var styleText = "\tleft: " + left + ";\r\ttop: " + top + ";";
        var newColor = legendColorSpacing();
        var itemsGroup = app.activeDocument.groupItems.add();
	
        var pointX = pageItemBounds[0];
        var pointY = pageItemBounds[1];
        var horizontalLineY = pointY + model.armWeight / 2;
        var verticalLineY = pointY + spacing + model.armWeight / 2;
    
        if(pageItem.typename == "TextFrame")    //Change the position of lines if page item is a text item.
        {
            if(pageItem.kind == TextType.POINTTEXT)
            {
                pointX = pageItem.anchor[0];
                pointY = pageItem.anchor[1];
            }
            else if(pageItem.kind == TextType.PATHTEXT)
            {
                pointX = pageItemBounds[0];
                pointY = pageItem.position[1];
            }
               
            horizontalLineY = pointY - model.armWeight / 2;
            verticalLineY = pointY + spacing;
        }
    
        //Creating coordinate spec text.
        var coordinateText = app.activeDocument.textFrames.pointText([pointX - 0.5 * spacing, pointY + 0.5 * spacing], 
                                                                                                        TextOrientation.HORIZONTAL);
        coordinateText.contents = "x: " + left + " y: " + top;
        coordinateText.textRange.paragraphAttributes.justification = Justification.RIGHT;
        coordinateText.textRange.characterAttributes.fillColor = newColor;
        coordinateText.textRange.characterAttributes.textFont = app.textFonts.getByName(model.legendFont);
        coordinateText.textRange.characterAttributes.size = model.legendFontSize;
        coordinateText.move(itemsGroup, ElementPlacement.INSIDE);
    
        //Adding horizontal line.
        var horizontalLine = app.activeDocument.compoundPathItems.add();
        var horizontalLineMain = horizontalLine.pathItems.add();
        horizontalLineMain.setEntirePath([[pointX - spacing - model.armWeight / 2, horizontalLineY], 
                                                            [pointX + spacing, horizontalLineY]]);
        horizontalLineMain.stroked = true;
        horizontalLineMain.strokeDashes = [];
        horizontalLineMain.strokeWidth = model.armWeight;
        horizontalLineMain.strokeColor = newColor;
        horizontalLine.move(itemsGroup, ElementPlacement.INSIDE);
        
        var lineX = pointX - model.armWeight / 2;
    
        //Adding vertical line.
        var verticalLine = app.activeDocument.compoundPathItems.add();
        var verticalLineMain = verticalLine.pathItems.add();
        verticalLineMain.setEntirePath([[lineX, verticalLineY], [lineX, pointY - spacing]]);
        verticalLineMain.stroked = true;
        verticalLineMain.strokeDashes = [];
        verticalLineMain.strokeWidth = model.armWeight;
        verticalLineMain.strokeColor = newColor;
        verticalLine.move(itemsGroup, ElementPlacement.INSIDE);
        itemsGroup.name = "Specctr Coordinates Mark";
        itemsGroup.move(legendLayer, ElementPlacement.INSIDE);  //Moving 'Coordinates' group into 'Specctr' layer group.
    
       //Set the id to the page item if no id is assigned to that item.
        if(!idVar)
            idVar = setUniqueIDToItem(pageItem);

        //Store the unique IDs to the coordinate spec's component.
        coordinateText.visibilityVariable = idVar;
        itemsGroup.visibilityVariable = idVar;
    
        //Add the note to the coordinate spec's component which is used later to get the style text.
        horizontalLine.note = "({type:'horizontalLine'})";
        itemsGroup.note = "({type:'coordinatesGroup'})";
        verticalLine.note = "({type:'verticalLine'})";
        coordinateText.note = "({type:'coordinates'})" + "-coordinateCss:" + styleText;
    }
    catch(e)
    {
        alert(e + " what");
        return false;
    }

    return true;
}

//Create text for vertical distances for spacing specs between two objects.
function createSpacingVerticalSpec(x, y1, y2, itemsGroup)
{
    try
    {
        var legendLayer = legendSpacingLayer();
        var spacing = 10 + model.armWeight;
        var newColor = legendColorSpacing();
    
        var ySpacing = Math.abs(y2 - y1);
    
        //Responsive option is checked or not.
        if(!model.specInPrcntg)
        {
            //Value after applying scaling.
            ySpacing = pointsToUnitsString(getScaledValue(ySpacing), null);
        }
        else 
        {
            //Relative distance with respect to original canvas Or the given values in the text boxes of Responsive tab.
            var relativeHeight = '';
            var originalArtboardSize = originalArtboardRect();       //Get the original size of artboard.
            
            if(model.relativeHeight != 0)
                relativeHeight = model.relativeHeight;
            else
                relativeHeight = -originalArtboardSize[3];

            ySpacing = Math.round(ySpacing / relativeHeight * 100) + " %";
        }

        var verticalLine = app.activeDocument.compoundPathItems.add();
	
        var yLine = verticalLine.pathItems.add();
        yLine.setEntirePath([[x, y1], [x, y2]]);
	
        var bottomLine = verticalLine.pathItems.add();
        var topLine = verticalLine.pathItems.add();
        topLine.setEntirePath([[x - 0.3 * spacing, y2 + model.armWeight / 2], 
                                            [x + 0.3 * spacing, y2 + model.armWeight / 2]]);
        bottomLine.setEntirePath([[x - 0.3 * spacing, y1 - model.armWeight / 2], 
                                                [x + 0.3 * spacing, y1 - model.armWeight / 2]]);				
								
        yLine.stroked = true;
        yLine.strokeDashes = [];
        yLine.strokeWidth = model.armWeight;
        yLine.strokeColor = newColor;
				
        verticalLine.move(itemsGroup, ElementPlacement.INSIDE);
				
        var yText = app.activeDocument.textFrames.pointText([x, (y1 + y2) / 2], TextOrientation.HORIZONTAL);
        yText.contents = ySpacing;
        yText.textRange.paragraphAttributes.justification = Justification.CENTER;
        yText.textRange.characterAttributes.fillColor = newColor;
        yText.textRange.characterAttributes.textFont = app.textFonts.getByName(model.legendFont);
        yText.textRange.characterAttributes.size = model.legendFontSize;
        yText.translate(-yText.width / 2 - spacing * 0.3 - model.armWeight / 2);
        yText.move(legendLayer, ElementPlacement.INSIDE);
        yText.note = "({type:spacingVerticalText})";
        yText.name = "Specctr Spacing Vertical Text Mark";
        yText.move(itemsGroup, ElementPlacement.INSIDE);
    }
    catch(e)
    {}
}

//Create text for horizontal distances for spacing specs between two objects.
function createSpacingHorizontalSpec(y, x1, x2, itemsGroup)
{
    try
    {
        var legendLayer = legendSpacingLayer();
        var spacing = 10 + model.armWeight;
        var newColor = legendColorSpacing();                    
    
        var xSpacing = Math.abs(x2 - x1);
   
        if(!model.specInPrcntg)
        {
            //Value after applying scaling.
            xSpacing = pointsToUnitsString(getScaledValue(xSpacing), null);
        }
        else 
        {
            //Relative distance with respect to original canvas.
            var relativeWidth = '';
            var originalArtboardSize = originalArtboardRect();       //Get the original size of artboard.
            
            if(model.relativeWidth != 0)
                relativeWidth = model.relativeWidth;
            else
                relativeWidth = originalArtboardSize[2];

            xSpacing = Math.round(xSpacing / relativeWidth * 100) + " %";
        }

        var horizontalLine = app.activeDocument.compoundPathItems.add();
        var xLine = horizontalLine.pathItems.add();
        xLine.setEntirePath([[x1, y], [x2, y]]);
    
        var leftLine = horizontalLine.pathItems.add();
        leftLine.setEntirePath([[x2 + model.armWeight / 2, y - 0.3 * spacing], 
                                            [x2 + model.armWeight / 2, y + 0.3 * spacing]]);
	
        var rightLine = horizontalLine.pathItems.add();
        rightLine.setEntirePath([[x1 - model.armWeight / 2, y - 0.3 * spacing], 
                                            [x1 - model.armWeight / 2, y + 0.3 * spacing]]);
				
        xLine.stroked = true;
        xLine.strokeDashes = [];
        xLine.strokeWidth = model.armWeight;
        xLine.strokeColor = newColor;
    
        horizontalLine.move(itemsGroup, ElementPlacement.INSIDE);
	
        var xText = app.activeDocument.textFrames.pointText([(x2 + x1) / 2, y + spacing * 0.3 + model.armWeight / 2], 
                                                                                            TextOrientation.HORIZONTAL);
        xText.contents = xSpacing;
        xText.textRange.paragraphAttributes.justification = Justification.CENTER;			
        xText.textRange.characterAttributes.fillColor = newColor;	
        xText.move(legendLayer, ElementPlacement.INSIDE);
        xText.note = "({type:spacingHorizontalText})";
        xText.name = "Specctr Spacing Horizontal Text Mark";
        xText.textRange.characterAttributes.textFont = app.textFonts.getByName(model.legendFont);
        xText.textRange.characterAttributes.size = model.legendFontSize;
        xText.move(itemsGroup, ElementPlacement.INSIDE);
    }
    catch(e)
    {}
}

//Create the spacing spec between the selected page items.
function createSpacingSpecsForItems(aItem, bItem)
{			
    try
    {
        var legendLayer = legendSpacingLayer();
        var spacing = 10 + model.armWeight;
        var newColor = legendColorSpacing(); 
        
        var idVarForFirstItem = aItem.visibilityVariable;
        var idVarForSecondItem = bItem.visibilityVariable;
        removeSpacingItemsGroup(idVarForFirstItem, idVarForSecondItem, "Spacing");
        
        var itemsGroup = app.activeDocument.groupItems.add();
    
        var aItemBounds = itemBounds(aItem);
        var bItemBounds = itemBounds(bItem);
    
        var isOverlapped = false;
    
        //check overlap
        if(aItemBounds[0] < bItemBounds[2] && aItemBounds[2] > bItemBounds[0] &&
            aItemBounds[3] < bItemBounds[1] && aItemBounds[1] > bItemBounds[3])
        {
            isOverlapped = true;
        }
        
        //check if there's vertical perpendicular
        if(aItemBounds[0] < bItemBounds[2] && aItemBounds[2] > bItemBounds[0])
        {
            var y1;
            var y2;
            var x = Math.max(aItemBounds[0], bItemBounds[0]) / 2 + Math.min(aItemBounds[2], bItemBounds[2]) / 2;
        
            if(!isOverlapped)
            {
                if(aItemBounds[1] > bItemBounds[1])
                {
                    y1 = aItemBounds[3];
                    y2 = bItemBounds[1];
                }
                else 
                {
                    y1 = bItemBounds[3];
                    y2 = aItemBounds[1];
                }

                createSpacingVerticalSpec(x, y1, y2, itemsGroup);
            }
            else //overlap, vertical specs
            {
                if(model.spaceTop) 
               {
                    if(aItemBounds[1] > bItemBounds[1])
                    {
                        y1 = aItemBounds[1];
                        y2 = bItemBounds[1];
                    }
                    else 
                    {
                        y1 = bItemBounds[1];
                        y2=aItemBounds[1];
                    }
                        
                    createSpacingVerticalSpec(x, y1, y2, itemsGroup);
               }
                   
                if(model.spaceBottom)
                {
                            
                    if(aItemBounds[3] > bItemBounds[3])
                    {
                        y1 = aItemBounds[3];
                        y2 = bItemBounds[3];
                    }
                    else 
                    {
                        y1 = bItemBounds[3];
                        y2 = aItemBounds[3];
                    }
                        
                    createSpacingVerticalSpec(x, y1, y2, itemsGroup);
                }
            }
        }
    
        //check if there's horizontal perpendicular
        if(aItemBounds[3] < bItemBounds[1] && aItemBounds[1] > bItemBounds[3])
        {
            var y = Math.min(aItemBounds[1], bItemBounds[1]) / 2 + Math.max(aItemBounds[3], bItemBounds[3]) / 2;
            
            var x1;
            var x2;
            
            if(!isOverlapped)
            {
                if(aItemBounds[0] > bItemBounds[0])
                {
                    x1 = aItemBounds[0];
                    x2 = bItemBounds[2]; 
                }
                else
                {
                    x1 = bItemBounds[0];
                    x2 = aItemBounds[2]; 
                }
            
                createSpacingHorizontalSpec(y, x1, x2, itemsGroup);
            } 
            else //overlap, horizontal specs
            {
                if(model.spaceLeft)
               {
                    if(aItemBounds[0] > bItemBounds[0])
                    {
                        x1 = aItemBounds[0];
                        x2 = bItemBounds[0]; 
                    }
                    else
                    {
                        x1 = bItemBounds[0];
                        x2 = aItemBounds[0]; 
                    }
                    
                    createSpacingHorizontalSpec(y, x1, x2, itemsGroup);
               }
               
                if(model.spaceRight)
                {
                    if(aItemBounds[2] > bItemBounds[2])
                    {
                        x1 = aItemBounds[2];
                        x2 = bItemBounds[2]; 
                    }
                    else
                    {
                        x1 = bItemBounds[2];
                        x2 = aItemBounds[2]; 
                    }
                    
                    createSpacingHorizontalSpec(y, x1, x2, itemsGroup);
                }
            }
        }
        
        //Set the id to the page item if no id is assigned to that item.
        if(!idVarForFirstItem)
            idVarForFirstItem = setUniqueIDToItem(aItem);
        
        itemsGroup.name = "Specctr Spacing Mark";
        itemsGroup.move(legendLayer, ElementPlacement.INSIDE);
        
        //Set the id to the page item if no id is assigned to that item.
        if(!idVarForSecondItem)
            idVarForSecondItem = setUniqueIDToItem(bItem);
         
        //Store the note to the spacing spec's group.
        itemsGroup.note = "({type:spacingGroup,name:" + idVarForFirstItem.name + idVarForSecondItem.name + "})";
    }
    catch(e)
    {
        alert(e);
        return false;
    }

    return true;
}
		
//Create the spacing spec for the selected page item.
function createSpacingSpecsForItem(pageItem)
{
    try
    {
        if(!(model.spaceTop || model.spaceBottom || model.spaceLeft || model.spaceRight)) 
            return true;
    
        var legendLayer = legendSpacingLayer();
        var spacing = 10 + model.armWeight;
        var artRect = originalArtboardRect();
        
        var pageItemBounds = itemBounds(pageItem);
        var toTop = -pageItemBounds[1] + artRect[1];
        var toLeft = pageItemBounds[0] - artRect[0];
        var toBottom = pageItemBounds[3] - artRect[3];
        var toRight = -pageItemBounds[2] + artRect[2];
        
        var idVar = pageItem.visibilityVariable;
        removeSpecGroup(idVar, "Spacing");

        if(!model.specInPrcntg)
        {
            //Value after applying scaling.
            toTop = pointsToUnitsString(getScaledValue(toTop), null);
            toLeft = pointsToUnitsString(getScaledValue(toLeft), null);
            toRight = pointsToUnitsString(getScaledValue(toRight), null);
            toBottom = pointsToUnitsString(getScaledValue(toBottom), null);
        }
        else 
        {
            //Relative distance with respect to original canvas.
            var relativeHeight = '', relativeWidth = '';
            var originalArtboardSize = originalArtboardRect();       //Get the original size of artboard.
            
            if(model.relativeHeight != 0)
                relativeHeight = model.relativeHeight;
            else
                relativeHeight = -originalArtboardSize[3];
                
            if(model.relativeWidth != 0)
                relativeWidth = model.relativeWidth;
            else
                relativeWidth = originalArtboardSize[2];

            toLeft = Math.round(toLeft / relativeWidth * 100) + " %";
            toTop = Math.round(toTop / relativeHeight * 100) + " %";
            toRight = Math.round(toRight / relativeWidth * 100) + " %";
            toBottom = Math.round(toBottom / relativeHeight * 100) + " %";
        }
   
        var height = pageItemBounds[1] - pageItemBounds[3];
        var width = pageItemBounds[2] - pageItemBounds[0];
			
        var newColor = legendColorSpacing();
        var itemsGroup = app.activeDocument.groupItems.add();
			
        if(model.spaceTop)
        {
            var topText = app.activeDocument.textFrames.pointText([pageItemBounds[0] + width / 2, 
                                                                                                    (pageItemBounds[1] + artRect[1]) / 2],
                                                                                                        TextOrientation.HORIZONTAL);
            topText.contents = toTop;
            topText.textRange.paragraphAttributes.justification = Justification.CENTER;			
            topText.textRange.characterAttributes.fillColor = newColor;	
            topText.textRange.characterAttributes.textFont = app.textFonts.getByName(model.legendFont);
            topText.textRange.characterAttributes.size = model.legendFontSize;
            topText.translate(-topText.width / 2 - spacing * 0.3 - model.armWeight / 2);
            topText.move(legendLayer, ElementPlacement.INSIDE);
            topText.note = "({type:spacingVerticalText})";
            topText.name = "Specctr Spacing Vertical Text Mark";
			
            var topFullLine = app.activeDocument.compoundPathItems.add();
			
            var topLine = topFullLine.pathItems.add();
            topLine.setEntirePath([[pageItemBounds[0] + width / 2,
                                                artRect[1]],
                                                    [pageItemBounds[0] + width / 2,
                                                        pageItemBounds[1]]]);
			
            var topLineTop = topFullLine.pathItems.add();
            topLineTop.setEntirePath([[pageItemBounds[0] + width / 2 - 0.3 * spacing,
                                                    pageItemBounds[1] + model.armWeight / 2],
                                                        [pageItemBounds[0] + width / 2 + 0.3 * spacing,
                                                            pageItemBounds[1] + model.armWeight / 2]]);
			
            var topLineBottom = topFullLine.pathItems.add();
            topLineBottom.setEntirePath([[pageItemBounds[0] + width / 2 - 0.3 * spacing,
                                                            artRect[1] - model.armWeight / 2],
                                                                [pageItemBounds[0] + width / 2 + 0.3 * spacing,
                                                                    artRect[1] - model.armWeight / 2]]);

            topLine.stroked = true;
            topLine.strokeDashes = [];
            topLine.strokeWidth = model.armWeight;
            topLine.strokeColor = newColor;
			
            topFullLine.move(itemsGroup,ElementPlacement.INSIDE);
            topText.move(itemsGroup,ElementPlacement.INSIDE);
        }
			
        if(model.spaceBottom)
        {
            var bottomText = app.activeDocument.textFrames.pointText([pageItemBounds[0] + width / 2,
                                                                                                        (pageItemBounds[3] + artRect[3]) / 2],
                                                                                                            TextOrientation.HORIZONTAL);
            bottomText.contents = toBottom;
            bottomText.textRange.paragraphAttributes.justification = Justification.CENTER;			
            bottomText.textRange.characterAttributes.fillColor = newColor;	
			
            bottomText.textRange.characterAttributes.textFont = app.textFonts.getByName(model.legendFont);
            bottomText.textRange.characterAttributes.size = model.legendFontSize;
			
            bottomText.translate(-bottomText.width / 2 - spacing * 0.3 - model.armWeight / 2);
            bottomText.move(legendLayer, ElementPlacement.INSIDE);
            bottomText.note = "({type:spacingVerticalText})";
            bottomText.name = "Specctr Spacing Vertical Text Mark";

            var bottomFullLine = app.activeDocument.compoundPathItems.add();
			
            var bottomLine = bottomFullLine.pathItems.add();
            bottomLine.setEntirePath([[pageItemBounds[0] + width / 2, 
                                                    artRect[3]], 
                                                        [pageItemBounds[0] + width / 2, 
                                                            pageItemBounds[3]]]);
			
            var bottomLineTop = bottomFullLine.pathItems.add();
            bottomLineTop.setEntirePath([[pageItemBounds[0] + width / 2 - 0.3 * spacing, 
                                                            pageItemBounds[3] - model.armWeight / 2], 
                                                                [pageItemBounds[0] + width / 2 + 0.3 * spacing, 
                                                                    pageItemBounds[3] - model.armWeight / 2]]);
			
            var bottomLineBottom = bottomFullLine.pathItems.add();
            bottomLineBottom.setEntirePath([[pageItemBounds[0] + width / 2 - 0.3 * spacing, 
                                                                artRect[3] + model.armWeight / 2], 
                                                                    [pageItemBounds[0] + width / 2 + 0.3 * spacing, 
                                                                        artRect[3] + model.armWeight / 2]]);

            bottomLine.stroked = true;
            bottomLine.strokeDashes = [];
            bottomLine.strokeWidth = model.armWeight;
            bottomLine.strokeColor = newColor;
			
            bottomFullLine.move(itemsGroup, ElementPlacement.INSIDE);
            bottomText.move(itemsGroup, ElementPlacement.INSIDE);
        }	
			
        if(model.spaceLeft)
        {
            var leftText = app.activeDocument.textFrames.pointText([(pageItemBounds[0] + artRect[0]) / 2,
                                                                                                    pageItemBounds[3] + height / 2 + spacing * 0.3 + model.armWeight / 2],
                                                                                                        TextOrientation.HORIZONTAL);
            leftText.contents = toLeft;
            leftText.textRange.paragraphAttributes.justification = Justification.CENTER;
            leftText.textRange.characterAttributes.fillColor = newColor;
            leftText.move(legendLayer,ElementPlacement.INSIDE);
            leftText.note = "({type:spacingHorizontalText})";
            leftText.name = "Specctr Spacing Horizontal Text Mark";
			
            leftText.textRange.characterAttributes.textFont = app.textFonts.getByName(model.legendFont);
            leftText.textRange.characterAttributes.size = model.legendFontSize;
			
            var leftFullLine = app.activeDocument.compoundPathItems.add();
			
            var leftLine = leftFullLine.pathItems.add();
            leftLine.setEntirePath([[artRect[0],
                                                pageItemBounds[3] + height / 2],
                                                    [pageItemBounds[0], pageItemBounds[3] + height / 2]]);

            var leftLineLeft = leftFullLine.pathItems.add();
            leftLineLeft.setEntirePath([[pageItemBounds[0] - model.armWeight / 2,
                                                        pageItemBounds[3] + height / 2 - 0.3 * spacing],
                                                            [pageItemBounds[0] - model.armWeight / 2, 
                                                                pageItemBounds[3] + height / 2 + 0.3 * spacing]]);
			
            var leftLineRight = leftFullLine.pathItems.add();
            leftLineRight.setEntirePath([[artRect[0] + model.armWeight / 2,
                                                        pageItemBounds[3] + height / 2 - 0.3 * spacing],
                                                            [artRect[0] + model.armWeight / 2, 
                                                                pageItemBounds[3] + height / 2 + 0.3 * spacing]]);
                
            leftLine.stroked = true;
            leftLine.strokeDashes = [];
            leftLine.strokeWidth = model.armWeight;
            leftLine.strokeColor = newColor;

            leftFullLine.move(itemsGroup, ElementPlacement.INSIDE);
            leftText.move(itemsGroup, ElementPlacement.INSIDE);
        }
			
        if(model.spaceRight)
        {
            var rightText = app.activeDocument.textFrames.pointText([(pageItemBounds[2] + artRect[2]) / 2,
                                                                                                    pageItemBounds[3] + height / 2 + spacing * 0.3 + model.armWeight / 2],
                                                                                                        TextOrientation.HORIZONTAL);
            rightText.contents = toRight;
            rightText.textRange.paragraphAttributes.justification = Justification.CENTER;
            rightText.textRange.characterAttributes.fillColor = newColor;
            rightText.move(legendLayer, ElementPlacement.INSIDE);
            rightText.note = "({type:spacingHorizontalText})";
            rightText.name = "Specctr Spacing Horizontal Text Mark";
			
            rightText.textRange.characterAttributes.textFont = app.textFonts.getByName(model.legendFont);
            rightText.textRange.characterAttributes.size = model.legendFontSize;
			
            var rightFullLine = app.activeDocument.compoundPathItems.add();
			
            var rightLine = rightFullLine.pathItems.add();
            rightLine.setEntirePath([[artRect[2], 
                                                    pageItemBounds[3] + height / 2], 
                                                        [pageItemBounds[2], pageItemBounds[3] + height / 2]]);

            var rightLineLeft = rightFullLine.pathItems.add();
            rightLineLeft.setEntirePath([[pageItemBounds[2] + model.armWeight / 2,
                                                        pageItemBounds[3] + height / 2 - 0.3 * spacing], 
                                                            [pageItemBounds[2] + model.armWeight / 2,
                                                                pageItemBounds[3] + height / 2 + 0.3 * spacing]]);
			
            var rightLineRight = rightFullLine.pathItems.add();
            rightLineRight.setEntirePath([[artRect[2] - model.armWeight / 2,
                                                            pageItemBounds[3] + height / 2 - 0.3 * spacing],
                                                                [artRect[2] - model.armWeight / 2, 
                                                                    pageItemBounds[3] + height / 2 + 0.3 * spacing]]);
			
            rightLine.stroked = true;
            rightLine.strokeDashes = [];
            rightLine.strokeWidth = model.armWeight;
            rightLine.strokeColor = newColor;

            rightFullLine.move(itemsGroup, ElementPlacement.INSIDE);
            rightText.move(itemsGroup, ElementPlacement.INSIDE);
        }
			
        itemsGroup.note = "({type:singleSpacingGroup})";
        itemsGroup.name = "Specctr Spacing Mark";
        itemsGroup.move(legendLayer, ElementPlacement.INSIDE);
        
        //Set the id to the page item if no id is assigned to that item.
        if(!idVar)
            idVar = setUniqueIDToItem(pageItem);

        //Store the unique IDs to the spacing spec's group.
        itemsGroup.visibilityVariable = idVar;
	}
    catch(e)
    {
        alert(e);
        return false;
    }

    return true;
}

//Call the spacing specs functions according to the number of selected art on the active artboard.
function createSpacingSpecs()
{
    var result = false;
    
    try{

        if (app.selection.length==2)
        {	
            var obj1 = app.selection[0];
            var obj2 = app.selection[1];
            
            if((!obj1.visibilityVariable || !obj1.note || obj1.note.indexOf("source")!=-1) && 
                (!obj2.visibilityVariable || !obj2.note || obj2.note.indexOf("source")!=-1))
                    createSpacingSpecsForItems(obj1,obj2);
        }
        else if(app.selection.length==1)
        {
            var obj=app.selection[0];
            if(!obj.visibilityVariable || !obj.note || obj.note.indexOf("source")!=-1)
                createSpacingSpecsForItem(obj);
        }
        else
        {
            alert("Please select one or two art items!");
        }
    
        app.redraw();
        
    }
    catch(e)
    {}
    
    return result;
}
    
//Update the property spec of the layer whose spec is already present.
function updateConnection(buttonInvoked)
{
    try
    {
        if(!app.selection.length)             //  logTime("start");
            return;

        try
        {
            var source;
            var arm;
            var spec;
            var group;
            var itemCircle;

            if(!app.selection.length && currentIdVar)               //check for orphan elements and delete them if necessary - DISABLED for now
            {
                return;
                /*var currPageItems = currentIdVar.pageItems;for(var i = 0;i<currPageItems.length;i++){try{ if(currPageItems[i]){
                    var dataString=currPageItems[i].note;  var data = this.deserialize(dataString);switch(data.type){case "spec": spec=currPageItems[i]; break;
                    case "source": source=currPageItems[i]; break;case "arm": arm=currPageItems[i]; break;case "itemCircle": itemCircle=currPageItems[i]; break;
                    }}}catch(e){}}if(!source){ if(spec) spec.remove(); if(arm) arm.remove(); if(itemCircle) itemCircle.remove(); currentIdVar.remove(); app.redraw();}
                    else if(!spec){ source.visibilityVariable = undefined; if(arm) arm.remove(); if(itemCircle) itemCircle.remove(); currentIdVar.remove(); app.redraw();}	
                    return;*/
            }
        
            var newColor = legendColorObject();
            var ids = [];       //collect ids of selected objects
            var selectedItems = app.selection;
            var allVariables = app.activeDocument.variables;
               
            for(var s = 0; s < selectedItems.length; s++)
            try
            {
                var dataString = selectedItems[s].note;
            
                if(dataString.search("-css:") > 0)
                {
                    if(!buttonInvoked)
                        cssText = separateNoteAndStyleText(selectedItems[s].note, "style");
                
                    dataString = separateNoteAndStyleText(selectedItems[s].note);
                    selectedItems[s].note = dataString;
                }
            
                var data;
            
                try
                {
                    data = eval(dataString);
                }
                catch(e)
                {
                    data = deserialize(dataString);
                }
        
                if((data.type != "source" || buttonInvoked) && data.varName)           // && !ids.contains(data.varName)
                {
                    ids.push(data.varName);
                    break;
                }
            }
            catch(e){}

            for(var j = 0; j < ids.length; j++)
            {
                var idVar = allVariables.getByName(ids[j]);
                var currPageItems = idVar.pageItems;
            
                var noteData = ({});
                for(var i = 0; i < currPageItems.length; i++)
                {
                    try
                    {
                        var dataString = currPageItems[i].note;
                    
                        if(dataString.search("-css:") > 0)
                        {
                            if(!buttonInvoked)
                                cssText = separateNoteAndStyleText(currPageItems[i].note, "style");
                        
                            dataString = separateNoteAndStyleText(currPageItems[i].note);
                            currPageItems[i].note = dataString;
                        }
                    
                        var data;
                        try
                        {    
                            data = eval(dataString);
                        }
                        catch(e)
                        {
                            data = deserialize(dataString);
                        }
							
                        switch(data.type)
                        {
                            case "group": 
                                group = currPageItems[i]; 
                                break;
                        
                            case "spec": 
                                spec = currPageItems[i]; 
                                break;
                        
                            case "source": 
                                source = currPageItems[i]; 
                                break;
                        
                            case "arm": 
                                arm = currPageItems[i]; 
                                break;
                    
                            case "itemCircle": 
                                itemCircle = currPageItems[i]; 
                                break;
                    
                            default:
                        }
                        
                        noteData[data.type] = data;
                    }
                    catch(e){}
                }
            
                if(source && spec) 
                {
                    try
                    {
                        //check if it's generated by undo                                                                                                                           
                        var data = noteData["spec"];
                        if(!buttonInvoked && propSpecUndo[idVar.name] && propSpecUndo[idVar.name].updated 
                            && data.updated && data.updated != propSpecUndo[idVar.name].updated)
                        { 
                            spec.note = spec.note + "-css:" + cssText;
                            propSpecUndo[idVar.name].updated = data.updated;
                            return;
                        }
                    }
                    catch(e) 
                    {
                        log(e)
                    }

/*var lastUpdateIndex = propSpecUndo[idVar.name].updated.length-1;
alert(data.updated+" "+propSpecUndo[idVar.name].undoCounter+" "+propSpecUndo[idVar.name].updated[lastUpdateIndex+propSpecUndo[idVar.name].undoCounter]);
if(data.updated<propSpecUndo[idVar.name].updated[lastUpdateIndex+propSpecUndo[idVar.name].undoCounter]){propSpecUndo[idVar.name].undoCounter--; 
return;}else if(data.updated>propSpecUndo[idVar.name].updated[lastUpdateIndex+propSpecUndo[idVar.name].undoCounter]){
propSpecUndo[idVar.name].undoCounter++; //this is Redo return;}*/
                    
                    if(arm && !positionChanged(source, noteData["source"].position) && 
                            !positionChanged(spec, noteData["spec"].position)) //&& (!currentIdVar || currentIdVar.name==idVar.name)  //&& !this.positionChanged(arm,currentArm)
                    {
                        spec.note = spec.note + "-css:" + cssText;
                        break;
                    }

                    var aItem = source;
                    var bItem = spec;
					
                    var aBounds = itemBounds(aItem);
                    var bBounds = bItem.visibleBounds;
					
                    var bX = bBounds[2];
                    var bY = bBounds[1] - model.armWeight / 2;
					
                    var centerX = bBounds[0] / 2 + bBounds[2] / 2;
                    var sourceCenterX = aBounds[0] / 2 + aBounds[2] / 2;
					
                    var currentArtboard = app.activeDocument.artboards[app.activeDocument.artboards.getActiveArtboardIndex()];
                    var artRect = currentArtboard.artboardRect;
                    var artboardCenterX= artRect[0] / 2 + artRect[2] / 2;
					
                    if(bBounds[2] <= sourceCenterX  && spec.textRange.paragraphAttributes.justification != Justification.LEFT)
                    {      						
                        spec.textRange.paragraphAttributes.justification = Justification.LEFT;
                        spec.translate(-(bBounds[2] - bBounds[0]), 0);
                    }
                    else if(bBounds[0] >= sourceCenterX  && spec.textRange.paragraphAttributes.justification != Justification.RIGHT)
                    {   					
                        spec.textRange.paragraphAttributes.justification = Justification.RIGHT;
                        spec.translate(bBounds[2] - bBounds[0], 0); 
                    }
					
                    if(spec.textRange.paragraphAttributes.justification == Justification.RIGHT) 
                        bX=bBounds[0];
                        
                    //centers
                    var aX = aBounds[0];
                    var aY = aBounds[1] / 2 + aBounds[3] / 2;
                    var aXC= aBounds[0] / 2 + aBounds[2] / 2;
							
                    if(bX > aBounds[0] && bX < aBounds[2]) 
                    {
                        aX = aXC;
                        if(bY > aBounds[3]) 
                            aY = aBounds[1]; 
                        else 
                            aY = aBounds[3];
                    }
                    else if(bX > aBounds[2])
                    {
                        aX = aBounds[2];
                    }
					
                    var dX = aX - bX;
                    var dY = aY - bY;
                    var originalBX;
					
                    if(dX > armPartLength) 
                    {
                        originalBX = bX;
                        bX += armPartLength;
                        dX += armPartLength;
                    }
                    else if(dX <- armPartLength)
                    {
                        originalBX = bX;
                        bX -= armPartLength;
                        dX -= armPartLength;
                    }
					
                    if(dX==0) 
                        dX=1;
                    if(dY==0) 
                        dY=1;
					
                    var aTg = dY / dX;
                    var aCtg = dX / dY;
                    var gipotenuzaLen  = Math.sqrt(dX * dX + dY * dY);
                    var aCos = dX / gipotenuzaLen;
                    var aSin = dY / gipotenuzaLen;
					
                    var yLine;
	
                    if(arm)
                    {
                        yLine = arm;						
                    }
                    else
                    {               
                        yLine = app.activeDocument.pathItems.add();
                        yLine.note = "({type:'arm',varName:'" + idVar.name + "'})";
                        yLine.visibilityVariable = idVar;
						
                        yLine.stroked = true;
                        yLine.strokeDashes = [];
                        yLine.strokeWidth = model.armWeight;
                        yLine.strokeColor = newColor;
                    }
					
                    var circleD = circleDiameter(model.armWeight);
					
                    if(itemCircle)
                    {
                        itemCircle.position = [aX - circleD / 2, aY + circleD / 2];
                    }
                    else
                    {
                        itemCircle = app.activeDocument.pathItems.ellipse(aY + circleD / 2, aX - circleD / 2, circleD, circleD);
                    
                        itemCircle.strokeColor = newColor;
                        itemCircle.fillColor = newColor;

                        var legendLayer;
                        if(source.typename == "TextFrame")
                        {
                            itemCircle.filled = true;
                            legendLayer = legendTextPropertiesLayer();
                        }
                        else 
                        {
                            itemCircle.filled = false;
                            legendLayer = legendObjectPropertiesLayer();
                        }
        
                        itemCircle.strokeWidth = model.armWeight;
                        itemCircle.stroked = true;	
                        itemCircle.note = "({type:'itemCircle',varName:'" + idVar.name + "'})";
                        itemCircle.visibilityVariable = idVar;
                    
                        if(group) 
                            itemCircle.move(group, ElementPlacement.INSIDE);
                    }
					
                    var aX1 = circleD / 2 * aCos;
                    var aY1 = circleD / 2 * aSin;
	
                    if(originalBX != undefined)
                    {
                        yLine.setEntirePath([[aX - aX1, aY - aY1], [bX, bY], [originalBX, bY]]);
                        yLine.filled = false;
                    }
                    else
                        yLine.setEntirePath([[aX - aX1, aY - aY1], [bX, bY]]);
		
                    if(!arm)
                    {
                        yLine.move(legendLayer, ElementPlacement.INSIDE);
                        arm = yLine;
                        if(group) 
                            yLine.move(group, ElementPlacement.INSIDE);
                    }
                }
            
                if(idVar && source && spec && arm)
                {
                    //currentIdVar = idVar; currentSource=source.visibleBounds.join("|"); currentSpec=spec.visibleBounds.join("|"); currentArm=arm.visibleBounds.join("|");
                    var date = new Date();
                    var updated = date.getTime();
                
                    if(!propSpecUndo[idVar.name]) 
                        propSpecUndo[idVar.name] = ({});
                    
                    /* propSpecUndo[idVar.name].undoCounter = 0; if(!propSpecUndo[idVar.name].updated) propSpecUndo[idVar.name].updated=[];*/ 
                    propSpecUndo[idVar.name].updated = updated;
                
                    spec.note = "({type:'spec',updated:'" + updated + "',varName:'" + idVar.name + 
                                            "',position:'" + spec.visibleBounds.join("|") + "'})" + "-css:" + cssText;
                
                    source.note = "({type:'source',updated:'" + updated + "',varName:'" + idVar.name +
                                            "',position:'" + source.visibleBounds.join("|") + "'})";
                 
                    app.redraw();
                }
            }
        }
        catch(e)
        {
            log(e)
        }
    }
    catch(e)
    {
        alert(e);
        return false;
    }

    return true;
}

//Call the property specs function for each selected art on the active artboard.
function createPropertySpecs()
{
    try
    {
		for(var i = 0; i < app.selection.length; i++)
		{
            var obj = app.selection[i];
            if(!obj.visibilityVariable || !obj.note || obj.note.indexOf("source") != -1)
                createPropertySpecsForItem(obj);
        }

        app.redraw();
    }
    catch(e)
    {}
}

//Get the property of selected layer and show it on active document.
function createPropertySpecsForItem(sourceItem)
{
    try
    {
        var spacing = 10;
        var legendLayer;

        var newColor = legendColorObject();
			
        var arm, spec, group, itemCircle, infoText;
        var pageItem = sourceItem;
        var pageItemBounds = itemBounds(pageItem);
        var idVar = pageItem.visibilityVariable;

        switch(sourceItem.typename)
        {
            case "TextFrame": 
                infoText = getSpecsInfoForTextItem(sourceItem); 
                newColor = legendColorType(); 
                legendLayer = legendTextPropertiesLayer(); 
                break;
        
            case "PathItem": 
                infoText = getSpecsInfoForPathItem(sourceItem); 
                legendLayer = legendObjectPropertiesLayer();	
                break;
        
            default: 
                infoText = getSpecsInfoForGeneralItem(sourceItem);
                legendLayer = legendObjectPropertiesLayer();
        }

        if(infoText == "") 
            return;

        if(idVar)       //find spec components
        {
            var allPageItems = idVar.pageItems;
		
            for(var i = 0; i < allPageItems.length; i++)
            {
                try
                {
                    var dataString = separateNoteAndStyleText(allPageItems[i].note);
                    allPageItems[i].note = dataString;
                    var data;
                    try
                    {    
                        data = eval(dataString);
                    }
                    catch(e)
                    {
                        data = deserialize(dataString);
                    }
               
                    switch(data.type)
                    {
                        case "spec": spec = allPageItems[i]; break;
                        case "arm": arm = allPageItems[i]; break;
                        case "group": group = allPageItems[i]; break;
                        case "itemCircle": itemCircle = allPageItems[i]; break;
                        default:
                    }
                }
                catch(e){}
            }
        }

        if(!spec)
        {
            spec = app.activeDocument.textFrames.add();
           
            spec.resize(100.1, 100.1);       //this allows to change justification from right to left later
            /*spec.note = "type:spec";if(idVar) {spec.visibilityVariable = idVar;spec.note = "type:spec,varName:"+idVar.name;}*/
        }

        spec.contents = infoText;
        spec.textRange.characterAttributes.fillColor = newColor;
        spec.textRange.characterAttributes.textFont = app.textFonts.getByName(model.legendFont);
        spec.textRange.characterAttributes.size = model.legendFontSize;
	
        for(var i = 0; i < spec.story.lines.length; i++)
        {
            try
            {
                var currTextRange = spec.story.lines[i];
                var content = currTextRange.contents;
                if(content == "Text:" || content == "Stroke:" || content == "Fill:"  || 
                        content == "Alpha:" || content == "Border-radius:" || i == 0)
                {
                    try
                    {
                        var newFontName = getBoldStyleOfFont();
                        currTextRange.characterAttributes.textFont = app.textFonts.getByName(newFontName);
                    }
                    catch(e){}
                }
            }
            catch(e){}
        }
			
        if(idVar && spec && arm && itemCircle) 
        {
            updateConnection(true);
            return;
        }

        if(!group)  //positioning
            group = app.activeDocument.groupItems.add();
         
        var currentArtboard = app.activeDocument.artboards[app.activeDocument.artboards.getActiveArtboardIndex()];
        var artRect = currentArtboard.artboardRect;

        //center
        var heightItem= pageItemBounds[1] - pageItemBounds[3];
        var heightInfo = spec.visibleBounds[1] - spec.visibleBounds[3];
        var widthInfo = spec.visibleBounds[2] - spec.visibleBounds[0];
            
        var centerY = pageItemBounds[1] / 2 + pageItemBounds[3] / 2;
        var centerX = pageItemBounds[0] / 2 + pageItemBounds[2] / 2;
        var artboardCenterX = artRect[0] / 2 + artRect[2] / 2;
        var specX;
        var specEdge;

        if(centerX <= artboardCenterX)
        {
            spec.textRange.paragraphAttributes.justification = Justification.LEFT;
                
            if(model.specToEdge)
                specX = artRect[0] - spec.visibleBounds[0] + spacing;
            else
                specX = pageItemBounds[0] - widthInfo - spacing;
        }
        else
        {
            spec.textRange.paragraphAttributes.justification = Justification.RIGHT;
            if(model.specToEdge)
            {
                spec.translate(pageItemBounds[2] - pageItemBounds[0],0);
                specX = artRect[2] - spec.visibleBounds[2] - spacing;
            }
            else
                specX = pageItemBounds[2] + spacing;
        }
			
       spec.translate(specX, (pageItemBounds[1] - spec.visibleBounds[1] - (heightItem - heightInfo) / 2));			
       spec.move(group, ElementPlacement.INSIDE);
		
        if(!arm)
        {
            arm = app.activeDocument.pathItems.add();

            var armX1;
            var armX2;
                 
            if(centerX <= artboardCenterX)
            {
                armX1 = pageItemBounds[0];
                armX2 = spec.visibleBounds[2];
            }  
            else
            {
                armX1 = pageItemBounds[2];
                armX2 = spec.visibleBounds[0];
            }
             
            var armDX = Math.abs(armX1 - armX2);
            var dx = armPartLength;
            if(armX1 < armX2) 
                dx = -dx;
                
            if(armDX < armPartLength * 1.3)
                arm.setEntirePath([[armX2, spec.visibleBounds[1]], [armX1, centerY]]);
            else
                arm.setEntirePath([[armX2, spec.visibleBounds[1]], [armX2 + dx, spec.visibleBounds[1]], [armX1, centerY]]);

            arm.stroked = true;
            arm.strokeDashes = [];
            arm.strokeWidth = model.armWeight;
            arm.strokeColor = newColor;
            arm.filled = false;
            arm.move(group, ElementPlacement.INSIDE);
        }
        
        var circleD = circleDiameter(model.armWeight);
			
        if(!itemCircle) 
        {
            if(centerX <= artboardCenterX)
                itemCircle = app.activeDocument.pathItems.ellipse(centerY + circleD / 2, 
                                                                                            pageItemBounds[0] - circleD / 2, circleD, circleD);
            else 
                itemCircle = app.activeDocument.pathItems.ellipse(centerY + circleD / 2,
                                                                                            pageItemBounds[2] - circleD / 2, circleD, circleD);
        
            itemCircle.strokeColor = newColor;
            itemCircle.fillColor = newColor;
            
            if(sourceItem.typename=="TextFrame")
                itemCircle.filled = true;
            else 
                itemCircle.filled = false;
			
            itemCircle.strokeWidth = model.armWeight;
            itemCircle.stroked = true;
            itemCircle.move(group, ElementPlacement.INSIDE);
        }
         
        var date = new Date();
        var id = date.getTime();
            
        if(!idVar)
        {
            idVar = app.activeDocument.variables.add();
            idVar.kind = VariableKind.VISIBILITY;
            idVar.name = "Var_" + id;
            pageItem.visibilityVariable = idVar;
        }
     
        try
        {
            arm.visibilityVariable = idVar;
        }
        catch(e){}
        try
        {
            group.visibilityVariable = idVar;
        }
        catch(e){}
        try
        {
            spec.visibilityVariable = idVar;
        }
        catch(e){}
        try
        {
            itemCircle.visibilityVariable = idVar;
        }
        catch(e){}
    
        arm.note = "({type:'arm',varName:'" + idVar.name + "'})";
        pageItem.note = "({type:'source',updated:'" + id + "',varName:'" + idVar.name + "',position:'" + 
                                        pageItem.visibleBounds.join("|") + "'})";
    
        group.note = "({type:'group',varName:'" + idVar.name + "'})";
        itemCircle.note = "({type:'itemCircle',varName:'" + idVar.name + "'})";
			
        if(!propSpecUndo[idVar.name]) 
            propSpecUndo[idVar.name] = ({});

        propSpecUndo[idVar.name].updated = id;

        spec.note = "({type:'spec',updated:'" + id + "',varName:'" + idVar.name + "',position:'" + 
                                spec.visibleBounds.join("|") + "'})" + "-css:" + cssText ;
    
        group.name = "Specctr Properties Mark";
        group.move(legendLayer, ElementPlacement.INSIDE);
    }
    catch(e)
    {
        alert(e);
        return false;
    }

    return true;
}

function deserialize(dataString)
{
	var object = ({});
    try
    {
        var props = dataString.split(",");
        for(var i = 0; i < props.length; i++)
        {
            try
            {
                var prop = props[i].split(":");
                if(prop.length == 2)
                    object[prop[0]] = prop[1];
            }
            catch(e) {}
		}
	}
    catch(e) {}
    
    return object;
}

//Get bold font name of the given font family.
function getBoldStyleOfFont()
{
    var fonts = app.textFonts;
    var boldFontName; 

    for(var j = 0; j < fonts.length; j++)
    {
        var currFont = fonts[j];
        if(currFont.family == model.legendFontFamily && currFont.style == "Bold")
        {
            boldFontName = currFont.name;
            break;
        }
    }
    
    return boldFontName;
}

//Get note without css style text.
function separateNoteAndStyleText(dataString, separateStringValue)
{
    var arr = dataString.split("-css:");
    
    if(separateStringValue == "style")
        return arr[1];
    
    return arr[0];
}

//Return the bounds of the object including stroke width.
function itemBounds(textFrame)
{
    var bounds = textFrame.visibleBounds;

    if(textFrame.typename == "TextFrame")
    {
        try
        {
            var dup = textFrame.duplicate();
            var target = dup.createOutline();
            bounds = target.visibleBounds;
            target.remove();
        }
        catch(e){}
    }
			
    return bounds;
}

function circleDiameter(strokeWidth)
{
    return Math.max(3,strokeWidth*2+3);
}

function positionChanged(item,savedCoords)
{
    try{
        var newCoords=item.visibleBounds.join("|");
        if(newCoords!=savedCoords) return true;
    }catch(e){}
    return false;
}
    
function legendColorObject()
{
    var newColor = new RGBColor();
    newColor.red = rChannel(model.legendColorObject);
    newColor.blue = bChannel(model.legendColorObject);
    newColor.green = gChannel(model.legendColorObject);
    return newColor;
}
		
function legendColorType()
{
    var newColor= new RGBColor();
    newColor.red = rChannel(model.legendColorType);
    newColor.blue = bChannel(model.legendColorType);
    newColor.green = gChannel(model.legendColorType);
    return newColor;
}
		
function legendColorSpacing()
{
    var newColor= new RGBColor();
    newColor.red = rChannel(model.legendColorSpacing);
    newColor.blue = bChannel(model.legendColorSpacing);
    newColor.green = gChannel(model.legendColorSpacing);
    return newColor;
}    

//Create specctr art layer group, if not present.
function legendLayer()
{		
    var newLayer;
    
    try{
        newLayer = app.activeDocument.layers.getByName("specctr");
    }
    catch(e)
    {
        newLayer = app.activeDocument.layers.add();
        newLayer.name = "specctr";
        newLayer.zOrder(ZOrderMethod.BRINGTOFRONT);
    }
    newLayer.locked = false;
    return newLayer;
}

//Create the 'Text Properties' group layer first time.
function legendTextPropertiesLayer()
{
    var newLayer;
    
    try
    {
        newLayer = legendLayer().layers.getByName("Text Properties");
    }
    catch(e)
    {
        newLayer = legendLayer().layers.add();
        newLayer.name = "Text Properties";
        newLayer.zOrder(ZOrderMethod.BRINGTOFRONT);
    }

    newLayer.locked = false;
    return newLayer;	
}

//Create the 'Object Properties' group layer first time.
function legendObjectPropertiesLayer()
{
    var newLayer;
    
    try
    {
        newLayer = legendLayer().layers.getByName("Object Properties");
    }
    catch(e)
    {
        newLayer = legendLayer().layers.add();
        newLayer.name = "Object Properties";
        newLayer.zOrder(ZOrderMethod.BRINGTOFRONT);
    }

    newLayer.locked = false;
    return newLayer;	
    
}

//Create the 'Spacing' group layer first time.
function legendSpacingLayer()
{
    var newLayer;

    try
    {
        newLayer = legendLayer().layers.getByName("Spacing");
    }
    catch(e)
    {
        newLayer = legendLayer().layers.add();
        newLayer.name = "Spacing";
        newLayer.zOrder(ZOrderMethod.BRINGTOFRONT);
    }

    newLayer.locked = false;
    return newLayer;
}		

//Create the 'Dimension' group layer first time.
function legendDimensionsLayer()
{
    var newLayer;

    try
    {
        newLayer = legendLayer().layers.getByName("Dimensions");
    }
    catch(e)
    {
        newLayer = legendLayer().layers.add();
        newLayer.name = "Dimensions";
        newLayer.zOrder(ZOrderMethod.BRINGTOFRONT);
    }

    newLayer.locked = false;
    return newLayer;
}

//Create the 'Coordinates' group layer first time.
function legendCoordinatesLayer()
{
    var newLayer;
	try
    {
		newLayer = legendLayer().layers.getByName("Coordinates");    //Already present in the 'Specctr' group layer.
	}
	catch(e)
    {
		newLayer = legendLayer().layers.add();
		newLayer.name = "Coordinates";
		newLayer.zOrder(ZOrderMethod.BRINGTOFRONT);
	}

	newLayer.locked = false;
	return newLayer;
}

//Get the red color value from the color hex value.
function rChannel(value) 
{
   return parseInt(value.substring(1, 3), 16);
}

//Get the green color value from the color hex value.
function gChannel(value)
{
    return parseInt(value.substring(3, 5), 16);
}

//Get the blue color value from the color hex value.
function bChannel(value)
{
    return parseInt(value.substring(5, 7), 16);
}    

function pointsToUnitsString(value,units)
{
    if(units == null) 
        units = app.activeDocument.rulerUnits;
    
    var result;
    
    switch (units)
    {
        case RulerUnits.Points:
             result = Math.round(value) + " pt";
             break;
             
        case RulerUnits.Inches:
            result = Math.round(value / 72 * 10000) / 10000 + " in";
            break;
            
        case RulerUnits.Picas:
            result = Math.round(value / 12 * 100) / 100 + " pc";
            break;
            
        case RulerUnits.Qs:
            result = Math.round(value / 2.8346 / 0.23 * 100) / 100 + " Q";
            break;
            
        case RulerUnits.Centimeters:
            result = Math.round(value / 28.346 * 100) / 100 + " cm";
            break;
            
        case RulerUnits.Millimeters:
            result = Math.round(value / 2.8346 * 100) / 100 + " mm";
            break;
            
        case RulerUnits.Pixels:
        default:
            result = Math.round(value) + " px";
            break;
    }

    return result;
}
		
function typeUnits()
{
    if(app.activeDocument.rulerUnits == RulerUnits.Pixels) 
        return "px"; 
    else 
        return "pt";
}

function colorAsString(c)
{
    var result="";
                
    var color = c;
    var newColor;
    
    var sourceSpace;
    var targetSpace;
    var colorComponents;
    
    switch(c.typename)
    {
        case "RGBColor": sourceSpace = ImageColorSpace.RGB; colorComponents=[c.red,c.green,c.blue]; break;
        case "CMYKColor": sourceSpace = ImageColorSpace.CMYK; colorComponents=[c.cyan,c.magenta,c.yellow,c.black]; break;
        case "LabColor": sourceSpace = ImageColorSpace.LAB; colorComponents=[c.l,c.a,c.b]; break;
        case "GrayColor": sourceSpace = ImageColorSpace.GrayScale; colorComponents=[c.gray]; break;
    }
    
        
    switch(model.legendColorMode)
        {
            case "LAB": targetSpace = ImageColorSpace.LAB; break;
            case "CMYK":
                targetSpace=ImageColorSpace.CMYK; break;
            case "RGB":	
            default:
                targetSpace=ImageColorSpace.RGB; break;
        }
        

    
    if(sourceSpace!=null)
    {
        var newColorComponents = app.convertSampleColor(sourceSpace, colorComponents, targetSpace,ColorConvertPurpose.previewpurpose);
        
        switch(model.legendColorMode)
        {
            case "LAB": 
                newColor = new LabColor(); 
                newColor.l = newColorComponents[0]; 
                newColor.a = newColorComponents[1];
                newColor.b = newColorComponents[2]; 
                break;
            case "CMYK":
                newColor = new CMYKColor(); 
                newColor.cyan = newColorComponents[0]; 
                newColor.magenta = newColorComponents[1];
                newColor.yellow = newColorComponents[2];
                newColor.black = newColorComponents[3];
                break;
            case "RGB":	
            default:
                newColor = new RGBColor(); 
                newColor.red = newColorComponents[0]; 
                newColor.green = newColorComponents[1];
                newColor.blue = newColorComponents[2];
                break;
        }
    
        color = newColor;
    }
    
    switch(color.typename)
    {
        case "RGBColor":
            switch(model.legendColorMode)
            {
            case "HSB":
                result = rgbToHsv(color);
            break;
        
            case "HSL":
                result = rgbToHsl(color);
            break;
        
            case "RGB":
            default:
                if(model.useHexColor)
                {
                    var red = Math.round(color.red).toString(16);
                    
                    if(red.length == 1) 
                        red = "0" + red;
                        
                    var green = Math.round(color.green).toString(16);
                    
                    if(green.length == 1) 
                        green = "0" + green;
                        
                    var blue = Math.round(color.blue).toString(16);
                    
                    if(blue.length == 1) 
                        blue = "0" + blue;
                
                    result = "#" + red + green + blue;
                }
                else
                {
                    result = "rgb(" + Math.round(color.red) + ", " + Math.round(color.green) + ", " + Math.round(color.blue) + ")";
                }
            }
        break;
        
        case "CMYKColor":
        result="cmyk(" + Math.round(color.cyan) + ", " + Math.round(color.magenta) + ", " + Math.round(color.yellow) + ", " + Math.round(color.black) + ")";
        break;
        
        case "LabColor":
        result="lab(" + Math.round(color.l) + ", " + Math.round(color.a) + ", " + Math.round(color.b) + ")";
        break;
        
        case "GrayColor":
        result="gray("+Math.round(color.gray) + ")";
        break;
        
        case "SpotColor":
        result=color.spot.name+" "+colorAsString(color.spot.color)+" tint: "+Math.round(color.tint);
        break;
        
        case "PatternColor":
        result="pattern( "+color.pattern.name + ")";
        break;
        
        case "GradientColor":
        result="Gradient "+color.gradient.type.toString().slice(13).toLowerCase()+"\r";
        for(var i=0;i<color.gradient.gradientStops.length;i++)
        {
            result+=colorAsString(color.gradient.gradientStops[i].color)+" alpha: " + (Math.round(color.gradient.gradientStops[i].opacity) / 100)+"\r";
        }
        break;
    }

    return result;
}

function rgbToHsl(rgb)
{
    var r = rgb.red;
    var g = rgb.green;
    var b = rgb.blue;
    r = r/255, g = g/255, b = b/255;
    
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    
    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    return "hsl(" + Math.round(h*360) + ", " + Math.round(s*100) + ", " + Math.round(l*100) + ")";
}

function rgbToHsv(rgb)
{
    var r = rgb.red;
    var g = rgb.green;
    var b = rgb.blue;
    r = r/255, g = g/255, b = b/255;
    
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var h, s, v = max;
    
    var d = max - min;
    s = max == 0 ? 0 : d / max;
    
    if(max == min){
        h = 0; // achromatic
    }else{
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    return "hsb(" + Math.round(h*360) + ", " + Math.round(s*100) + ", " + Math.round(v*100) + ")";
}

//Get the round corner value of the path item.
function getRoundCornerValue(pageItem)
{
    try
    {
        var infoText = "";
        var doc = app.activeDocument;
        var anchorPoints = new Array;
        var points = pageItem.selectedPathPoints;
        var point = "";
        
        if(points.length < 5)
            return infoText + "0";
        
        if(points.length != 8)
            return "";

        for (var k = 0; k < 2 ; k++)
        {
            point = points[k];
            anchorPoints[k] =  point.anchor[0];
        }
    
        infoText +=  Math.abs(parseInt(anchorPoints[1]) - parseInt(anchorPoints[0]));
    }
    catch(e)
    {
        infoText = "";
    }

    return infoText;
}

//Get spec info for items other than path item and text item.
function getSpecsInfoForGeneralItem(sourceItem)
{
    var infoText = sourceItem.typename;
    var pageItem = sourceItem;
    var name = sourceItem.name;
    
    if(!name)
        name = infoText.toLowerCase();
        
    cssText = "." + name.toLowerCase() + " {\r\t" + infoText.toLowerCase() + ";";        
    infoText = name + "\r";
    
    try
    {
        if(model.textAlpha)
        {
            var alpha = Math.round(pageItem.opacity) + "%";
            infoText += "\r\rAlpha:\r" +  alpha;
            cssText += "\r\topacity: " + alpha + ";";
        }
    }
    catch(e){}
    
    cssText += "\r}";
    return infoText;
}

//Getting info for path item.
function getSpecsInfoForPathItem(pageItem)
{
    var infoText = "";
    var pathItem = pageItem;
    
    var name = pageItem.name;
    
    if(!name)
        name = "<Path>";
        
    cssText = "." + name.toLowerCase() + " {\r";
    infoText = name + "\r";
    
    if(model.shapeFillStyle || model.shapeFillColor) 
    {    
        try
        {
            infoText += "Fill:";
            cssText += "\tfill: ";
            if(model.shapeFillStyle)
            {
                if(pathItem.filled)
                {
                    infoText += "\rSolid";
                    cssText += "solid;";
                }
                else
                {
                    infoText += "\rNone";
                    cssText += "none;";
                }
            }

            if(model.shapeFillColor && pathItem.filled)
            {
                var color = colorAsString(pathItem.fillColor);
                infoText+="\r"+color;
                cssText += "\r\tcolor: "+color.toLowerCase()+";";
            }
        }
        catch(e){}
    }

    if(model.shapeStrokeStyle || model.shapeStrokeColor || model.shapeStrokeSize)
    try
    {
            if(infoText != "") 
                infoText += "\r\r";
            
            infoText += "Stroke:";
           
            if(model.shapeStrokeStyle)
            {
                cssText += "\r\tstroke-style: ";
                if(pathItem.stroked)
                {
                    if(pathItem.strokeDashes.length)
                    {
                        infoText += "\r" + "Dashed ";
                        cssText += "dashed;";
                    }
                    else
                    {
                        infoText += "\r" + "Solid ";
                        cssText += "solid;";
                    }
                }
                else
                {
                    infoText += "\rNone";
                    cssText += "none;";
                }
            }

            if(model.shapeStrokeSize  && pathItem.stroked)
            {
                var strokeWidth = pointsToUnitsString(pathItem.strokeWidth, null);
                infoText += "\r" + strokeWidth;
                cssText += "\r\tstroke-width: " + strokeWidth + ";";
            }

            if(model.shapeStrokeColor  && pathItem.stroked)
            {
                var strokeColor = colorAsString(pathItem.strokeColor);
                infoText += "\r" + strokeColor;
                cssText += "\r\tstroke-color: " + strokeColor.toLowerCase() + ";";
            }

        }catch(e){};

    if(model.shapeAlpha)
    {
        if(infoText != "") 
        {
            infoText += "\r\r";
            cssText += "\r";
        }
    
        infoText += "Alpha:\r" + Math.round(pageItem.opacity) + "%";
        cssText += "\topacity: " + Math.round(pageItem.opacity) + "%" + ";";
    }

     if(model.shapeBorderRadius)         //Get the corner radius of the shape object.
    {
             if(infoText != "") 
                infoText += "\r\r";

            var roundCornerValue = getRoundCornerValue(pageItem);

            if(roundCornerValue != "")
            {
                infoText += "Border-radius:\r" + roundCornerValue;
                cssText += "\r\tborder-radius: " + roundCornerValue + ";";
            }
        }

    cssText += "\r}";
    
    return infoText;
}

//Getting info for text item.
function getSpecsInfoForTextItem(pageItem)
{
    var infoText = "";
    var textItem = pageItem;
    
    var attr = textItem.textRanges[0].characterAttributes;
    var paraAttr = textItem.paragraphs[0].paragraphAttributes;
    
     var name = textItem.name;
    
    if(!name)
        name = textItem.contents;
    
    var wordsArray = name.split(" ");
    if(wordsArray.length > 2)
        name = wordsArray[0] + " " + wordsArray[1] + " " + wordsArray[2];
                
    cssText = name.toLowerCase() + " {";
    infoText = name;
    
    try
    {
        var fontSize, leading, alpha = "";
        
        if(model.specInEM)
        {
            var rltvFontSize = 16, rltvLineHeight;
            
            if(model.baseFontSize != 0)
                rltvFontSize = model.baseFontSize;
             
            if(model.baseLineHeight != 0)
                rltvLineHeight = model.baseLineHeight;
            else
                rltvLineHeight = rltvFontSize * 1.4;
            
            fontSize = Math.round(attr.size / rltvFontSize * 100) / 100 + " em";
            leading = Math.round(attr.leading / rltvLineHeight * 100) / 100 + " em";
        }
        else 
        {
            fontSize = Math.round(attr.size * 10) / 10;
            fontSize = getScaledValue(fontSize) + " " + typeUnits();
            leading = Math.round(attr.leading * 10) / 10 + " " + typeUnits();
        }
        
         if(model.textAlpha)
            alpha = Math.round(pageItem.opacity) / 100;
        
        if(model.textFont)
        {
            var fontFamily = attr.textFont.name;
            infoText += "\rFont-Family: " + fontFamily;
            cssText += "\r\tfont-family: " + fontFamily + ";";
        }
    
        if(model.textSize)
        {
            infoText += "\rFont-Size: " + fontSize;
            cssText += "\r\tfont-size: " + fontSize + ";";
        }
    
        if(model.textColor)
        {
            var textColor = colorAsString(attr.fillColor);
            if(alpha != "" && textColor.indexOf("(") >= 0)
            {
                textColor = convertColorIntoCss(textColor, alpha);
                alpha = "";
            }
            infoText += "\rColor: " + textColor;
            cssText += "\r\tcolor: " + textColor + ";";
        }
    
        if(model.textStyle)
        {
            var styleString = "normal";

            if(attr.capitalization == FontCapsOption.ALLCAPS) 
                styleString = "all caps";
            if(attr.capitalization == FontCapsOption.ALLSMALLCAPS) 
                styleString = "all small caps";
            if(attr.capitalization == FontCapsOption.SMALLCAPS) 
                styleString = "small caps";

            infoText += "\rFont-Style: " + styleString;
            cssText += "\r\tfont-style: " + styleString + ";";
            
            styleString = "";
            if(attr.baselinePosition == FontBaselineOption.SUBSCRIPT) 
                styleString = "sub-script";
            else if(attr.baselinePosition == FontBaselineOption.SUPERSCRIPT) 
                styleString = "super-script";

            if(attr.underline)
            {
                if(styleString != "")
                    styleString += " / ";
                    
                styleString += "underline";
            }
        
            if(attr.strikeThrough) 
            {
                if(styleString != "")
                    styleString += " / ";
                
                styleString += "strike-through";
            }

            if(styleString != "")
            {
                infoText += "\rText-Decoration: " + styleString;
                cssText += "\r\ttext-decoration: " + styleString + ";";
            }
        }
    
        if(model.textAlignment)
        {
            var s = paraAttr.justification.toString();
            s = s.substring(14, 15) + s.substring(15).toLowerCase();
            s = s.toLowerCase();
            infoText += "\rText-Align: " + s ;
            cssText += "\r\ttext-align: " + s + ";";
        }

        if(model.textLeading)
        {
            infoText += "\rLine-Height: " + leading;
            cssText += "\r\tline-height: " + leading + ";";
        }
    
        if(model.textTracking)
        {
            var tracking = Math.round(attr.tracking / 1000 * 100) / 100 + " em";
            infoText += "\rLetter-Spacing: " + tracking;
            cssText += "\r\tletter-spacing: " + tracking + ";";
        }

        if(alpha != "")
        {
            infoText += "\rOpacity: " + alpha;
            cssText += "\r\topacity: " + alpha;
        }

    }catch(e){};
    
    cssText += "\r}";
    
    if(model.specInEM)
        cssBodyText = "body {\r\tfont-size: " + Math.round(10000 / 16 * rltvFontSize) / 100 + "%;\r}\r\r";
    
    return infoText;
}

//Convert color into css style.
function convertColorIntoCss(color, alpha)
{
    var index = color.indexOf("(");
    color = color.substr(0, index)+"a"+color.substr(index)
    color = color.substr(0, color.length-1)+", "+alpha+")";
    return color;
}

function originalArtboardRect()
{		
    if(app.activeDocument)
    {
        var border = canvasBorder();

        if(!border) 
        {
            var currentArtboard = app.activeDocument.artboards[app.activeDocument.artboards.getActiveArtboardIndex()];
            return currentArtboard.artboardRect;
        }
        else 
        {
            return border.geometricBounds;
        }
    }
    return undefined;
}

function redColor()
{
    var newColor = new RGBColor();
    newColor.red = 255;
    newColor.blue = 0;
    newColor.green = 0;
    return newColor;
}