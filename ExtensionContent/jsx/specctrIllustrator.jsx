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
ext_ILST_createPropertySpecs = createPropertySpecs;
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
                var red=Math.round(color.red).toString(16);
                if (red.length==1) red="0"+red;
                var green=Math.round(color.green).toString(16);
                if (green.length==1) green="0"+green;
                var blue=Math.round(color.blue).toString(16);
                if (blue.length==1) blue="0"+blue;
            
                result = "#"+red+green+blue;
            }
            
            else	
                result="R"+Math.round(color.red)+" G"+Math.round(color.green)+" B"+Math.round(color.blue);
            }
        break;
        
        case "CMYKColor":
        result="C"+Math.round(color.cyan)+" M"+Math.round(color.magenta)+" Y"+Math.round(color.yellow)+" K"+Math.round(color.black);
        break;
        
        case "LabColor":
        result="L"+Math.round(color.l)+" a"+Math.round(color.a)+" b"+Math.round(color.b);
        break;
        
        case "GrayColor":
        result="Gray: "+Math.round(color.gray);
        break;
        
        case "SpotColor":
        result=color.spot.name+"\r"+colorAsString(color.spot.color)+" tint: "+Math.round(color.tint);
        break;
        
        case "PatternColor":
        result="Pattern: "+color.pattern.name;
        break;
        
        case "GradientColor":
        result="Gradient "+color.gradient.type.toString().slice(13).toLowerCase()+"\r";
        for(var i=0;i<color.gradient.gradientStops.length;i++)
        {
            result+=colorAsString(color.gradient.gradientStops[i].color)+" alpha: "+Math.round(color.gradient.gradientStops[i].opacity)+"%\r";
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
    
    return "H"+Math.round(h*360)+" S"+Math.round(s*100)+" L"+Math.round(l*100);
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
    
    return "H"+Math.round(h*360)+" S"+Math.round(s*100)+" B"+Math.round(v*100);
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
    return "";
}

//Getting info for path item.
function getSpecsInfoForPathItem(pageItem)
{
    return "";
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
        
    cssText = name.toLowerCase() + " {";
    infoText = name + "\r";
    
    try
    {
        var fontSize, leading;
        
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
            fontSize = Math.round(attr.size * 10) / 10 + " " + typeUnits();
            leading = Math.round(attr.leading * 10) / 10 + " " + typeUnits();
        }
        
        infoText += "Text:";
        
        if(model.textFont)
        {
            var fontFamily = attr.textFont.name;
            infoText += "\r" + fontFamily;
            cssText += "\r\tfont-family: " + fontFamily + ";";
        }
    
        if(model.textColor)
        {
            var textColor = colorAsString(attr.fillColor);
            infoText += "\r" + textColor;
            cssText += "\r\tcolor: " + textColor.toLowerCase() + ";";
        }
    
        if(model.textSize)
        {
            infoText += "\r" + fontSize;
            cssText += "\r\tfont-size: " + fontSize + ";";
        }

        if(model.textAlignment)
        {
            var s = paraAttr.justification.toString();
            s = s.substring(14, 15) + s.substring(15).toLowerCase();
            infoText += "\r" + s + " align";
            cssText += "\r\ttext-align: " + s.toLowerCase() + ";";
        }

        if(model.textLeading)
        {
            infoText += "\rLeading: " + leading;
            cssText += "\r\tline-height: " + leading + ";";
        }
    
        if(model.textTracking)
        {
            var tracking = Math.round(attr.tracking / 1000 * 100) / 100 + " em";
            infoText += "\rTracking: " + tracking;
            cssText += "\r\tletter-spacing: " + tracking + ";";
        }

        if(model.textStyle)
        {
            var styleString;

            if(attr.capitalization == FontCapsOption.ALLCAPS) 
                styleString = "All Caps";
            if(attr.capitalization == FontCapsOption.ALLSMALLCAPS) 
                styleString = "All Small Caps";
            if(attr.capitalization == FontCapsOption.SMALLCAPS) 
                styleString = "Small Caps";
            if(attr.capitalization == FontCapsOption.NORMALCAPS) 
                styleString = "Normal";

            if(attr.baselinePosition == FontBaselineOption.SUBSCRIPT) 
                styleString += "\rSubscript";
            if(attr.baselinePosition == FontBaselineOption.SUPERSCRIPT) 
                styleString += "\rSuperscript";
            if(attr.underline) 
                styleString += "\rUnderline";
            if(attr.strikeThrough) 
                styleString += "\rStrikeThrough";

            infoText += "\rStyle: " + styleString;
            cssText += "\r\tfont-style: " + styleString.toLowerCase() + ";";
        }

        if(model.textAlpha)
        {
            if(infoText != "") 
                infoText += "\r\r";
            
            var alpha = Math.round(pageItem.opacity);
            infoText += "Alpha:\r" + alpha + "%";
            cssText += "\r\topacity: " + alpha + "%;";
        }

    }catch(e){};
    
    cssText += "\r}";
    
    if(model.specInEM)
        cssBodyText = "body {\r\tfont-size: " + Math.round(10000 / 16 * rltvFontSize) / 100 + "%;\r}\r\r";
    
    return infoText;
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