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

Array.prototype.uniquePush = function (value){
    var temp = [];
    this.push(value);
    this.sort();
    var arrayLength = this.length;
    for(i=0;i<arrayLength;i++){
        if(this[i]==this[i+1]) {continue}
        temp[temp.length]=this[i];
    }
    return temp;
}

$.specctrAi = {
    //Get the application font's name and font's family.
    getFontList : function() {
        var font = app.textFonts;
        var appFontLength = font.length;
        var result = [];        
        //Set the spec text properties.
        for (var i = 0; i < appFontLength; i++) {
            var currFont = font[i];
            if (currFont.style == "Regular") {
                var object = {};
                object.label = currFont.family;
                object.font = currFont.name;
                result.push(object);
            }
        }
        return JSON.stringify(result);
    },

    //Get the updated value of UI's component from html file.
    setModel : function(currModel) {
        model = JSON.parse(currModel);
    },

    getProjectIdOfDoc : function() {
        
        if(app.documents.length == 0) {
            return "false";
        }
    
        if(ExternalObject.AdobeXMPScript == null)
            ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');

        var projectId = this.getXmpData("http://specctr.com", "PROJ_ID")+"";
         
        if(projectId == null)
                return "";
 
            return projectId;
    },

    setDocId : function(docId, projectId) {
         if(ExternalObject.AdobeXMPScript == null)
            ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
            
        this.setXmpData("http://specctr.com", "S_AI_META", "DOC_ID", docId);
        this.setXmpData("http://specctr.com", "S_AI_META", "PROJ_ID", projectId);
    },
    
    setXmpData : function (nsUri, nsPrefix, propertyName, value) {
        try {
            if(ExternalObject.AdobeXMPScript == null)
                ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');

            var xmpFile = new XMPFile(app.activeDocument.fullName.fsName, XMPConst.UNKNOWN, XMPConst.OPEN_FOR_UPDATE);
            var xmp = xmpFile.getXMP();
            var mt = new XMPMeta(xmp.serialize());
            XMPMeta.registerNamespace(nsUri, nsPrefix);
            mt.setProperty(nsUri, propertyName, value);
            
            if (xmpFile.canPutXMP(xmp)) 
                xmpFile.putXMP(mt);
            
            xmpFile.closeFile(XMPConst.CLOSE_UPDATE_SAFELY);
        } catch (e) {}
    },

    getXmpData: function (nsUri, propertyName) {
        try {
            
            if(ExternalObject.AdobeXMPScript == null)
                ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
                
            var xmpFile = new XMPFile(app.activeDocument.fullName.fsName, XMPConst.UNKNOWN, XMPConst.OPEN_FOR_READ);
            var xmpPackets = xmpFile.getXMP();
            var xmp = new XMPMeta(xmpPackets.serialize());
            return xmp.getProperty(nsUri, propertyName);
        
        } catch (e) {
            return "";
        }
    },

    //Create the canvas border and expand the artboard.
    createCanvasBorder : function() {
        app.redraw();   //Creates an 'undo' point.
        var doc = app.activeDocument;
        var currentArtboard = doc.artboards[doc.artboards.getActiveArtboardIndex()];
        var artRect = currentArtboard.artboardRect;
        var border = this.canvasBorder();
                    
        if (!border) {
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
                    
            prevArtboardPath.move(this.legendLayer(), ElementPlacement.INSIDE);
            prevArtboardPath.zOrder(ZOrderMethod.SENDTOBACK);
        }
                   
        artRect[0] -= model.canvasExpandSize;
        artRect[1] += model.canvasExpandSize;
        artRect[2] += model.canvasExpandSize;
        artRect[3] -= model.canvasExpandSize;
                    
        currentArtboard.artboardRect = artRect;
    },

    //Get the canvas border, if present.
    canvasBorder : function() {
        try {
            var doc = app.activeDocument;
            var currentArtboard = doc.artboards[doc.artboards.getActiveArtboardIndex()];
            var result = doc.pathItems.getByName("Specctr Canvas Border " + currentArtboard.name);
        } catch (e) {}
        return result;		
    },

    //Return css text for shape objects
    getCssForPathItems : function(coordinateSpecsInfo) {
        try {
            var doc = app.activeDocument;
            try {
                var objectProperties = doc.layers.getByName("specctr").layers.getByName("Object Properties");
            } catch(e) {
                return "";
            }

            var styleText = "";
            var text;
            var noOfGroups = objectProperties.groupItems.length;                //Number of groups present in Object Properties layer group.

            //Fetch the style text from the specs and return the style text. 
            while (noOfGroups) {
                try {
                    var spec = objectProperties.groupItems[noOfGroups - 1];
                    text = "";
                    
                    var textFrameLen = spec.textFrames.length;
                
                    for (var i = 0; i < textFrameLen; i++) {
                        var textFrame = spec.textFrames[i];
                        text = textFrame.note;

                        if (text) {       //Get the css style text from the  property specs text item.
                            var jsonResponse = JSON.parse(text);
                            text = jsonResponse.css;
                        }
                    }
                
                    if (text != "") styleText += text;
                    
                } catch(e) {}
                
                noOfGroups = noOfGroups - 1;
            }
        } catch(e) {
            styleText = "";
        }

        return styleText;
    },

    //Return css style text for text objects.
    getCssForText : function (coordinateSpecsInfo) {
        try {
            var doc = app.activeDocument;
            try {   
                var textProperties = doc.layers.getByName("specctr").layers.getByName("Text Properties");
            } catch(e) {
                return "";
            }

            var styleText = "";
            var text;
            var noOfGroups = textProperties.groupItems.length;              //Number of groups present in Text Properties layer group.

            //Fetch the style text from the specs and return the style text. 
            while (noOfGroups) {
                try {
                    var textSpec = textProperties.groupItems[noOfGroups - 1];
                    text = "";
                    
                    var textFrameLength = textSpec.textFrames.length;

                    for (var i = 0; i < textFrameLength; i++) {
                        var textFrame = textSpec.textFrames[i];
                        text = textFrame.note;

                        if (text) {           //Get the css style text from the specs text item.
                            var jsonResponse = JSON.parse(text);
                            text = jsonResponse.css;
                        }
                    }
                
                    if (text != "") styleText += text;
                    
                } catch(e) {}
                
                noOfGroups = noOfGroups - 1;
            }
        } catch(e) {
            styleText = "";
        }

        return styleText;
    },

    //Export the specs into styles.
    exportCss : function() {
        var isExportedSuccessfully = false;
        try {
            var styleText = cssBodyText;            //Add the body text at the top of css file.
            styleText += this.getCssForText();        //Get the style text for those Text items on which property specs is applied.
            styleText += this.getCssForPathItems();    //Get the style text for those Path items on which property specs is applied.    

            if (styleText == "") {
                alert("No spec present to export.");
                return "";
            }

            var docId = this.getXmpData("http://specctr.com", "DOC_ID") + "";
            var projId = this.getXmpData("http://specctr.com", "PROJ_ID") + "";
            var cssInfo = {
	    	document_name: app.activeDocument.name,
             document_id:  docId,
             project_id: projId,
	    	text: styleText
            };

            if(model.cloudOption == "export") {
                return JSON.stringify(cssInfo);
            } else {
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
                        return true;
                }
            
                //Create and write the css file.
                if(cssFile) {
                    cssFile.open("w");
                    cssFile.write(cssInfo.text);
                    cssFile.close;
                
                    if(replaceFileFlag)
                        alert("Styles.css is exported.");
                    else 
                        alert("Styles.css is exported to " + cssFilePath);
                        
                } else {
                    alert("Unable to export the specs!");
                    return isExportedSuccessfully;
                }
    
            }
        
        } catch(e) {
            alert(e);
        }
        
        return isExportedSuccessfully;
    },

    //Delete the group item of spacing specs between two items.
    removeSpacingItemsGroup : function(aSpecctrId, bSpecctrId, groupName) {
         try {
            if (aSpecctrId && bSpecctrId) {
                try {
                    var parentGroup = app.activeDocument.layers.getByName("specctr").layers.getByName(groupName);
                } catch(e) {
                    return;
                }
                
                var  id =  aSpecctrId + bSpecctrId;
                if (parentGroup) {
                    var noOfIteration = parentGroup.groupItems.length;
                    while (noOfIteration) {
                        var specGroup = parentGroup.groupItems[noOfIteration - 1];
                    
                        //If unique Ids of spec's group consist the given string name then delete the group.
                        if (specGroup.note == id) {
                            specGroup.remove();
                            break; 
                        }

                        noOfIteration -= 1;
                    }
                }
            }
        } catch(e) {alert(e);}
    },

    //Delete the group item of coordinate specs, width/height specs and spacing specs for single item.
    removeSpecGroup : function(specctrId, groupName) {
            try {
                var parentGroup = app.activeDocument.layers.getByName("specctr").layers.getByName(groupName);
            } catch(e) {
                return false;
            }
        
            var bIsSpecRemove = false;
            
            if (parentGroup) {
                var noOfIteration = parentGroup.groupItems.length;
                
                while (noOfIteration) {
                    var specGroup = parentGroup.groupItems[noOfIteration - 1];

                    try {
                        if (specGroup.note == specctrId) {
                            specGroup.remove();
                            bIsSpecRemove = true;
                            break; 
                        }
                    } catch(e) {}
                    noOfIteration -= 1;
                }
            }
        
            return bIsSpecRemove;
    },

    //Apply scaling to the given value.
    getScaledValue : function(value) {
        var scaledValue = value;
        try {
            if (model.useScaleBy) {       //Scaling option is checked or not.
                var scaling = Number(model.scaleValue.substring(1));
                if (!scaling)
                    scaling = 1;
            
                if (model.scaleValue.charAt(0) == '/')
                    scaledValue = scaledValue / scaling;
                else
                    scaledValue = scaledValue * scaling;
            }
        } catch(e) {
            scaledValue = value;
        }

        return scaledValue;
    },

    //Set unique Id for the source item.
    setUniqueIDToItem : function(pageItem) {
        try {
            var date = new Date();
            var id = date.getTime();
            pageItem.note = '{"type":"source","specctrId":"' + id + '"}';
        } catch(e) {
            alert(e);
            id = null;
        }
        
        return id;
    },

    //Call the dimension specs function for each selected art on the active artboard.
    createDimensionSpecs : function () {
        try {
            var selectionLength = app.selection.length;
            for (var i = 0; i < selectionLength; i++) {
                var obj = app.selection[i];
                if (!obj.note || obj.note.indexOf("source") != -1)
                    this.createDimensionSpecsForItem(obj, false);
            }
            app.redraw();
        } catch(e) {alert(e);}
    },

    //Create the dimension spec for the selected page item.
    createDimensionSpecsForItem : function(pageItem, bIsAutoUpdate) {
        try {
            if (!model.widthPos && !model.heightPos) 
                return true;
            
            var name = "Dimensions";
            
             //Delete the width/height spec group if it is already created for the acitve source item on the basis of the note.
            var specctrId = "", isSpecRemoved = false;
            var pItemNote = pageItem.note;
            
            try {
            if(pItemNote) {
                var sourceJson = JSON.parse(pItemNote);
                specctrId = sourceJson.specctrId;
                isSpecRemoved = this.removeSpecGroup(specctrId, name);
            }
        } catch (e) {pageItem.note = "";}
        
            //If spec not removed, it means no spec was present.
            if(isSpecRemoved == false && bIsAutoUpdate == true)
                return;
            
            //Get the group for width/height specs.
            var legendLayer = this.legendSpecLayer(name);

            if(model.includeStroke)
                var pageItemBounds = this.itemBounds(pageItem);
            else
                pageItemBounds = this.itemBoundsWithoutStroke(pageItem);

            var height = pageItemBounds[1] - pageItemBounds[3];
            var width = pageItemBounds[2] - pageItemBounds[0];
            var heightForSpec = height;
            var widthForSpec = width;

            //Responsive option is checked or not.
            if (!model.specInPrcntg) {
                //Values after applying scaling.
                widthForSpec = this.pointsToUnitsString(this.getScaledValue(widthForSpec), null);
                heightForSpec = this.pointsToUnitsString(this.getScaledValue(heightForSpec), null);
            } else {
                //Relative distance with respect to original canvas Or the given values in the text boxes of Responsive tab.
                var relativeHeight = '', relativeWidth = '';
                var originalArtboardSize = this.originalArtboardRect();       //Get the original size of artboard.
                
                if (model.relativeHeight != 0)
                    relativeHeight = model.relativeHeight;
                else
                    relativeHeight = -originalArtboardSize[3];
                    
                if (model.relativeWidth != 0)
                    relativeWidth = model.relativeWidth;
                else
                    relativeWidth = originalArtboardSize[2];

                widthForSpec = Math.round(1.0 * widthForSpec / relativeWidth * 10000) / 100 + "%";
                heightForSpec = Math.round(1.0 * heightForSpec / relativeHeight * 10000) / 100 + "%";
            }
        
            if(model.decimalFractionValue === "fraction") {
                widthForSpec = this.decimalToFraction(widthForSpec);
                heightForSpec = this.decimalToFraction(heightForSpec);
            }
        
            var spacing = 10 + model.armWeight;
            var newColor = this.legendColor(model.legendColorSpacing);
            var itemsGroup = app.activeDocument.groupItems.add();
        
            //Create the width specs.
            if (model.widthPos > 0) {
                var lineY, textY;
            
                //Set the positions of the spec's component according to the width position.
                switch (model.widthPos) {
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
            
                if (model.widthPos == widthChoice.Bottom) 
                    widthText.translate(0, -widthText.height);
            
                if (model.heightPos == heightChoice.Center && model.widthPos == widthChoice.Center)
                    widthText.translate(widthText.width);
            
                widthText.move(legendLayer, ElementPlacement.INSIDE);
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
            if (model.heightPos > 0) {
                var lineX, textX;
            
                //Set the positions of the spec's component according to the height position.
                switch (model.heightPos) {
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
                
                if (model.heightPos == heightChoice.Right) 
                    heightText.translate(heightText.width / 2);
                else 
                    heightText.translate(-heightText.width / 2);
                
                if (model.heightPos == heightChoice.Center && model.widthPos == widthChoice.Center)
                    heightText.translate(0, heightText.height * 2);

                heightText.textRange.characterAttributes.fillColor = newColor;
                heightText.move(legendLayer, ElementPlacement.INSIDE);
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
     
            //Set the id to the page item if no id is assigned to that item.
            if (specctrId == "")
                specctrId = this.setUniqueIDToItem(pageItem);

            itemsGroup.note = specctrId;
            itemsGroup.name = "Specctr Dimension Mark";
            itemsGroup.move(legendLayer, ElementPlacement.INSIDE);
         
        } catch(e) {
            alert(e);
            return false;
        }

        return true;
    },

    //Call the coordinate specs function for each selected art on the active artboard.
    createCoordinateSpecs : function() {
        try {
            var selectionLength = app.selection.length;
            for (var i = 0; i < selectionLength; i++) {
                var obj = app.selection[i];
                if (!obj.note || obj.note.indexOf("source") != -1)
                    this.createCoordinateSpecsForItem(obj, false);
            }
            app.redraw();   //Creates an 'undo' point.  
        } catch(e) {}
    },

    //Create coordinate specs for the selected page item.
    createCoordinateSpecsForItem : function(pageItem, bIsAutoUpdate) {
        var bResult = true;
        
        try {
             //Delete the width/height spec group if it is already created for the acitve source item on the basis of the note.
            var name = "Coordinates", specctrId = "", isSpecRemoved = false;
            var pItemNote = pageItem.note;
            if(pItemNote) {
                try {
                    var sourceJson = JSON.parse(pItemNote);
                    specctrId = sourceJson.specctrId;
                    isSpecRemoved = this.removeSpecGroup(specctrId, name);
                } catch (e) {pageItem.note = "";}
            }
        
            if(isSpecRemoved == false && bIsAutoUpdate == true)
                return;
        
            var defaultCoordSystem = app.coordinateSystem;
            app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;
            
            var legendLayer = this.legendSpecLayer(name);    //Create the 'Coordinates' layer group.
            var pageItemBounds = this.itemBounds(pageItem);
            var originalArtboardSize = this.originalArtboardRect();
            
            var left = pageItemBounds[0]-originalArtboardSize[0];
            var top = originalArtboardSize[1]-pageItemBounds[1];
            var right = pageItemBounds[2]-originalArtboardSize[0];
            var bottom = originalArtboardSize[1]-pageItemBounds[3];
            
            var spacing = 10 + model.armWeight;
            var armWeight = model.armWeight / 2;
            
            //Responsive option is selected or not.
            if (!model.specInPrcntg) {
                //Absolute distance.
                top = this.pointsToUnitsString(top, null);
                left = this.pointsToUnitsString(left, null);
                right = this.pointsToUnitsString(right, null);
                bottom = this.pointsToUnitsString(bottom, null);
            } else {
                //Relative distance with respect to original canvas Or the given values in the text boxes of Responsive tab.
                var relativeTop = '', relativeLeft = '';
                
                if (model.relativeHeight != 0)
                    relativeTop = model.relativeHeight;
                else
                    relativeTop = -originalArtboardSize[3];
                    
                if (model.relativeWidth != 0)
                    relativeLeft = model.relativeWidth;
                else
                    relativeLeft = originalArtboardSize[2];

                top = Math.round(1.0 * top / relativeTop * 10000) / 100 + "%";
                left = Math.round(1.0 * left / relativeLeft * 10000) / 100 + "%";
                right = Math.round(1.0 * right / relativeLeft * 10000) / 100 + "%";
                bottom = Math.round(1.0 * bottom / relativeTop * 10000) / 100 + "%";
            }

            var newColor = this.legendColor(model.legendColorSpacing);
            var itemsGroup = app.activeDocument.groupItems.add();
        
            var horizontalLineY, verticalLineY;
        
            var coordinateText, horizontalLine, horizontalLineMain;
            var lineX, verticalLine, verticalLineMain;
            
            switch(model.coordinateCellNumber) {
                case 0 :    //Creating coordinate spec text at left top.
                horizontalLineY = pageItemBounds[1] + armWeight;
                verticalLineY = pageItemBounds[1] + spacing + armWeight;
                
                coordinateText = app.activeDocument.textFrames.pointText([pageItemBounds[0] - 0.5 * spacing, 
                                            pageItemBounds[1] + 0.5 * spacing], TextOrientation.HORIZONTAL);
                coordinateText.contents = "x: " + left + " y: " + top;
                coordinateText.textRange.paragraphAttributes.justification = Justification.RIGHT;

                horizontalLine = app.activeDocument.compoundPathItems.add();
                horizontalLineMain = horizontalLine.pathItems.add();
                horizontalLineMain.setEntirePath([[pageItemBounds[0] - spacing - armWeight, horizontalLineY], 
                                                                [pageItemBounds[0] + spacing, horizontalLineY]]);

                lineX = pageItemBounds[0] - armWeight;
                verticalLine = app.activeDocument.compoundPathItems.add();
                verticalLineMain = verticalLine.pathItems.add();
                verticalLineMain.setEntirePath([[lineX, verticalLineY], [lineX, pageItemBounds[1] - spacing]]);
                break;
                
                case 1 :    //Creating coordinate spec text at right top.
                horizontalLineY = pageItemBounds[1] + armWeight;
                verticalLineY = pageItemBounds[1] + spacing + armWeight;
                
                coordinateText = app.activeDocument.textFrames.pointText([pageItemBounds[2] + 0.5 * spacing, 
                                            pageItemBounds[1] + 0.5 * spacing], TextOrientation.HORIZONTAL);
                coordinateText.contents = "x: " + right + " y: " + top;
                coordinateText.textRange.paragraphAttributes.justification = Justification.LEFT;
                
                horizontalLine = app.activeDocument.compoundPathItems.add();
                horizontalLineMain = horizontalLine.pathItems.add();
                horizontalLineMain.setEntirePath([[pageItemBounds[2] - spacing, horizontalLineY], 
                                                                [pageItemBounds[2] + spacing + armWeight, horizontalLineY]]);
            
                lineX = pageItemBounds[2] + armWeight;
                verticalLine = app.activeDocument.compoundPathItems.add();
                verticalLineMain = verticalLine.pathItems.add();
                verticalLineMain.setEntirePath([[lineX, verticalLineY], [lineX, pageItemBounds[1] - spacing]]);
                break;
                
                case 2 :    //Creating coordinate spec text at right bottom.
                horizontalLineY = pageItemBounds[3] - armWeight;
                verticalLineY = pageItemBounds[3] - spacing - armWeight;
                
                coordinateText = app.activeDocument.textFrames.pointText([pageItemBounds[2] + 0.5 * spacing, 
                                            pageItemBounds[3] - spacing  - armWeight], TextOrientation.HORIZONTAL);
                coordinateText.contents = "x: " + right + " y: " + bottom;
                coordinateText.textRange.paragraphAttributes.justification = Justification.LEFT;
            
                horizontalLine = app.activeDocument.compoundPathItems.add();
                horizontalLineMain = horizontalLine.pathItems.add();
                horizontalLineMain.setEntirePath([[pageItemBounds[2] - spacing, horizontalLineY], 
                                                                [pageItemBounds[2] + spacing + armWeight, horizontalLineY]]);
            
                lineX = pageItemBounds[2] + armWeight;
                verticalLine = app.activeDocument.compoundPathItems.add();
                verticalLineMain = verticalLine.pathItems.add();
                verticalLineMain.setEntirePath([[lineX, verticalLineY], [lineX, pageItemBounds[3] + spacing]]);
                break;
                
                case 3 :    //Creating coordinate spec text at left bottom.
                horizontalLineY = pageItemBounds[3] - armWeight;
                verticalLineY = pageItemBounds[3] - spacing - armWeight;
                
                coordinateText = app.activeDocument.textFrames.pointText([pageItemBounds[0] - 0.5 * spacing, 
                                            pageItemBounds[3] - spacing - armWeight], TextOrientation.HORIZONTAL);
                coordinateText.contents = "x: " + left + " y: " + bottom;
                coordinateText.textRange.paragraphAttributes.justification = Justification.RIGHT;
            
                horizontalLine = app.activeDocument.compoundPathItems.add();
                horizontalLineMain = horizontalLine.pathItems.add();
                horizontalLineMain.setEntirePath([[pageItemBounds[0] - spacing  - armWeight, horizontalLineY], 
                                                                [pageItemBounds[0] + spacing, horizontalLineY]]);
            
                lineX = pageItemBounds[0] - armWeight;
                verticalLine = app.activeDocument.compoundPathItems.add();
                verticalLineMain = verticalLine.pathItems.add();
                verticalLineMain.setEntirePath([[lineX, verticalLineY], [lineX, pageItemBounds[3] + spacing]]);
            }

            coordinateText.textRange.characterAttributes.fillColor = newColor;
            coordinateText.textRange.characterAttributes.textFont = app.textFonts.getByName(model.legendFont);
            coordinateText.textRange.characterAttributes.size = model.legendFontSize;
            coordinateText.move(itemsGroup, ElementPlacement.INSIDE);
        
            //Adding horizontal line.
            horizontalLineMain.stroked = true;
            horizontalLineMain.strokeDashes = [];
            horizontalLineMain.strokeWidth = model.armWeight;
            horizontalLineMain.strokeColor = newColor;
            horizontalLine.move(itemsGroup, ElementPlacement.INSIDE);

            //Adding vertical line.
            verticalLineMain.stroked = true;
            verticalLineMain.strokeDashes = [];
            verticalLineMain.strokeWidth = model.armWeight;
            verticalLineMain.strokeColor = newColor;
            verticalLine.move(itemsGroup, ElementPlacement.INSIDE);
            itemsGroup.name = "Specctr Coordinates Mark";
            itemsGroup.move(legendLayer, ElementPlacement.INSIDE);  //Moving 'Coordinates' group into 'Specctr' layer group.
        
           //Set the id to the page item if no id is assigned to that item.
            if (specctrId == "")
                specctrId = this.setUniqueIDToItem(pageItem);

            itemsGroup.note = specctrId;
        } catch(e) {
            bResult = false;
        }

        app.coordinateSystem = defaultCoordSystem;
        return bResult;
    },

    //Create text for vertical distances for spacing specs between two objects.
    createSpacingVerticalSpec : function(x, y1, y2, itemsGroup) {
        try {
            var legendLayer = this.legendSpecLayer("Spacing");
            var spacing = 10 + model.armWeight;
            var newColor = this.legendColor(model.legendColorSpacing);
        
            var ySpacing = Math.abs(y2 - y1);
        
            //Responsive option is checked or not.
            if (!model.specInPrcntg) {
                //Value after applying scaling.
                ySpacing = this.pointsToUnitsString(this.getScaledValue(ySpacing), null);
            } else {
                //Relative distance with respect to original canvas Or the given values in the text boxes of Responsive tab.
                var relativeHeight = '';
                var originalArtboardSize = this.originalArtboardRect();       //Get the original size of artboard.
                
                if (model.relativeHeight != 0)
                    relativeHeight = model.relativeHeight;
                else
                    relativeHeight = -originalArtboardSize[3];

                ySpacing = Math.round(1.0 *  ySpacing / relativeHeight * 10000) / 100 + " %";
            }
        
            if(model.decimalFractionValue === "fraction")
                ySpacing = this.decimalToFraction(ySpacing);

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
            yText.name = "Specctr Spacing Vertical Text Mark";
            yText.move(itemsGroup, ElementPlacement.INSIDE);
        } catch(e) {}
    },

    //Create text for horizontal distances for spacing specs between two objects.
    createSpacingHorizontalSpec : function(y, x1, x2, itemsGroup) {
        try {
            var legendLayer = this.legendSpecLayer("Spacing");
            var spacing = 10 + model.armWeight;
            var newColor = this.legendColor(model.legendColorSpacing);
        
            var xSpacing = Math.abs(x2 - x1);
       
            if (!model.specInPrcntg) {
                //Value after applying scaling.
                xSpacing = this.pointsToUnitsString(this.getScaledValue(xSpacing), null);
            } else {
                //Relative distance with respect to original canvas.
                var relativeWidth = '';
                var originalArtboardSize = this.originalArtboardRect();       //Get the original size of artboard.
                
                if (model.relativeWidth != 0)
                    relativeWidth = model.relativeWidth;
                else
                    relativeWidth = originalArtboardSize[2];

                xSpacing = Math.round(1.0 * xSpacing / relativeWidth * 10000) / 100 + " %";
            }
        
            if(model.decimalFractionValue === "fraction")
                xSpacing = this.decimalToFraction(xSpacing);

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
            xText.name = "Specctr Spacing Horizontal Text Mark";
            xText.textRange.characterAttributes.textFont = app.textFonts.getByName(model.legendFont);
            xText.textRange.characterAttributes.size = model.legendFontSize;
            xText.move(itemsGroup, ElementPlacement.INSIDE);
        } catch(e) {}
    },

    //Create the spacing spec between the selected page items.
    createSpacingSpecsForItems : function(aItem, bItem) {			
        try {
            var name = "Spacing";
            var isOverlapped = false;
            var legendLayer = this.legendSpecLayer(name);
            var spacing = 10 + model.armWeight;
            var newColor = this.legendColor(model.legendColorSpacing); 

            //Delete the width/height spec group if it is already created for the acitve source item on the basis of the note.
            var sourceJson;
            var aSpecctrId = "", bSpecctrId = "";
            var aItemNote = aItem.note;
            var bItemNote = bItem.note;
            
            try {
            if(aItemNote) {
                sourceJson = JSON.parse(aItemNote);
                aSpecctrId = sourceJson.specctrId;
            }
        } catch (e) {aItem.note = "";}
        
        try {
            if(bItemNote) {
                sourceJson = JSON.parse(bItemNote);
                bSpecctrId = sourceJson.specctrId;
            }
        } catch (e) {bItem.note = "";}
        
            this.removeSpacingItemsGroup(aSpecctrId, bSpecctrId, name);

            var itemsGroup = app.activeDocument.groupItems.add();
        
            if(model.includeStroke) {
                var aItemBounds = this.itemBounds(aItem);
                var bItemBounds = this.itemBounds(bItem);
            } else {
                aItemBounds = this.itemBoundsWithoutStroke(aItem);
                bItemBounds = this.itemBoundsWithoutStroke(bItem);
            }
            
            //check overlap
            if (aItemBounds[0] < bItemBounds[2] && aItemBounds[2] > bItemBounds[0] &&
                aItemBounds[3] < bItemBounds[1] && aItemBounds[1] > bItemBounds[3])
                    isOverlapped = true;
            
            //check if there's vertical perpendicular
            if (aItemBounds[0] < bItemBounds[2] && aItemBounds[2] > bItemBounds[0]) {
                var y1, y2;
                var x = Math.max(aItemBounds[0], bItemBounds[0]) / 2 + Math.min(aItemBounds[2], bItemBounds[2]) / 2;
            
                if (!isOverlapped) {
                    if (aItemBounds[1] > bItemBounds[1]) {
                        y1 = aItemBounds[3];
                        y2 = bItemBounds[1];
                    } else {
                        y1 = bItemBounds[3];
                        y2 = aItemBounds[1];
                    }
                    this.createSpacingVerticalSpec(x, y1, y2, itemsGroup);
                } else {            //overlap, vertical specs
                    if(model.spaceTop) {
                        if(aItemBounds[1] > bItemBounds[1]) {
                            y1 = aItemBounds[1];
                            y2 = bItemBounds[1];
                        } else {
                            y1 = bItemBounds[1];
                            y2=aItemBounds[1];
                        }
                        this.createSpacingVerticalSpec(x, y1, y2, itemsGroup);
                    }
                       
                    if (model.spaceBottom) {
                        if (aItemBounds[3] > bItemBounds[3]) {
                            y1 = aItemBounds[3];
                            y2 = bItemBounds[3];
                        } else {
                            y1 = bItemBounds[3];
                            y2 = aItemBounds[3];
                        }
                        this.createSpacingVerticalSpec(x, y1, y2, itemsGroup);
                    }
                }
            }

            //check if there's horizontal perpendicular
            if (aItemBounds[3] < bItemBounds[1] && aItemBounds[1] > bItemBounds[3]) {
                var y = Math.min(aItemBounds[1], bItemBounds[1]) / 2 + Math.max(aItemBounds[3], bItemBounds[3]) / 2;
                
                var x1, x2;
                
                if (!isOverlapped) {
                    if (aItemBounds[0] > bItemBounds[0]) {
                        x1 = aItemBounds[0];
                        x2 = bItemBounds[2]; 
                    } else {
                        x1 = bItemBounds[0];
                        x2 = aItemBounds[2]; 
                    }
                    this.createSpacingHorizontalSpec(y, x1, x2, itemsGroup);
                } else {        //overlap, horizontal specs
                    if (model.spaceLeft) {
                        if (aItemBounds[0] > bItemBounds[0]) {
                            x1 = aItemBounds[0];
                            x2 = bItemBounds[0]; 
                        } else {
                            x1 = bItemBounds[0];
                            x2 = aItemBounds[0]; 
                        }
                        this.createSpacingHorizontalSpec(y, x1, x2, itemsGroup);
                   }
                   
                    if (model.spaceRight) {
                        if (aItemBounds[2] > bItemBounds[2]) {
                            x1 = aItemBounds[2];
                            x2 = bItemBounds[2]; 
                        } else {
                            x1 = bItemBounds[2];
                            x2 = aItemBounds[2]; 
                        }
                        this.createSpacingHorizontalSpec(y, x1, x2, itemsGroup);
                    }
                }
            }
            
            //Set the id to the page item if no id is assigned to that item.
            if (aSpecctrId == "")
                aSpecctrId = this.setUniqueIDToItem(aItem);
            
            //Set the id to the page item if no id is assigned to that item.
            if (bSpecctrId == "")
                bSpecctrId = this.setUniqueIDToItem(bItem);
             
            //Store the note to the spacing spec's group.
            itemsGroup.note = aSpecctrId + bSpecctrId;
            itemsGroup.name = "Specctr Spacing Mark";
            itemsGroup.move(legendLayer, ElementPlacement.INSIDE);
            
        } catch(e) {
            return false;
        }

        return true;
    },

    //Create the spacing spec for the selected page item.
    createSpacingSpecsForItem : function(pageItem, bIsAutoUpdate) {
        try {
            if (!(model.spaceTop || model.spaceBottom || model.spaceLeft || model.spaceRight)) 
                return true;
        
            //Delete the width/height spec group if it is already created for the acitve source item on the basis of the note.
            var name = "Spacing", specctrId = "", bIsSpecRemoved = false;
            var pItemNote = pageItem.note;
            
            try {
            if(pItemNote) {
                var sourceJson = JSON.parse(pItemNote);
                specctrId = sourceJson.specctrId;
                bIsSpecRemoved = this.removeSpecGroup(specctrId, name);
            }
        } catch (e) {pageItem.note = "";}
        
            if(bIsSpecRemoved == false && bIsAutoUpdate == true)
                return;
        
            //Get the spacing specctr group layer.
            var legendLayer = this.legendSpecLayer(name);
            var spacing = 10 + model.armWeight;
            var artRect = this.originalArtboardRect();
            
            if(model.includeStroke) 
                var pageItemBounds = this.itemBounds(pageItem);
            else 
                pageItemBounds = this.itemBoundsWithoutStroke(pageItem);
            
            var toTop = -pageItemBounds[1] + artRect[1];
            var toLeft = pageItemBounds[0] - artRect[0];
            var toBottom = pageItemBounds[3] - artRect[3];
            var toRight = -pageItemBounds[2] + artRect[2];
            
            
        
            if (!model.specInPrcntg) {
                //Value after applying scaling.
                toTop = this.pointsToUnitsString(this.getScaledValue(toTop), null);
                toLeft = this.pointsToUnitsString(this.getScaledValue(toLeft), null);
                toRight = this.pointsToUnitsString(this.getScaledValue(toRight), null);
                toBottom = this.pointsToUnitsString(this.getScaledValue(toBottom), null);
            } else {
                //Relative distance with respect to original canvas.
                var relativeHeight = '', relativeWidth = '';
                var originalArtboardSize = this.originalArtboardRect();       //Get the original size of artboard.
                
                if (model.relativeHeight != 0)
                    relativeHeight = model.relativeHeight;
                else
                    relativeHeight = -originalArtboardSize[3];
                    
                if (model.relativeWidth != 0)
                    relativeWidth = model.relativeWidth;
                else
                    relativeWidth = originalArtboardSize[2];

                toLeft = Math.round(1.0 * toLeft / relativeWidth * 10000) / 100 + " %";
                toTop = Math.round(1.0 * toTop / relativeHeight * 10000) / 100 + " %";
                toRight = Math.round(1.0 * toRight / relativeWidth * 10000) / 100 + " %";
                toBottom = Math.round(1.0 * toBottom / relativeHeight * 10000) / 100 + " %";
            }
        
            if(model.decimalFractionValue === "fraction") {
                toLeft = this.decimalToFraction(toLeft);
                toTop = this.decimalToFraction(toTop);
                toRight = this.decimalToFraction(toRight);
                toBottom = this.decimalToFraction(toBottom);
            }
       
            var height = pageItemBounds[1] - pageItemBounds[3];
            var width = pageItemBounds[2] - pageItemBounds[0];
            var newColor = this.legendColor(model.legendColorSpacing);
            var itemsGroup = app.activeDocument.groupItems.add();
                
            if (model.spaceTop) {
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
                
            if (model.spaceBottom) {
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
                
            if (model.spaceLeft) {
                var leftText = app.activeDocument.textFrames.pointText([(pageItemBounds[0] + artRect[0]) / 2,
                                                                                                        pageItemBounds[3] + height / 2 + spacing * 0.3 + model.armWeight / 2],
                                                                                                            TextOrientation.HORIZONTAL);
                leftText.contents = toLeft;
                leftText.textRange.paragraphAttributes.justification = Justification.CENTER;
                leftText.textRange.characterAttributes.fillColor = newColor;
                leftText.move(legendLayer,ElementPlacement.INSIDE);
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
                
            if (model.spaceRight) {
                var rightText = app.activeDocument.textFrames.pointText([(pageItemBounds[2] + artRect[2]) / 2,
                                                                                                        pageItemBounds[3] + height / 2 + spacing * 0.3 + model.armWeight / 2],
                                                                                                            TextOrientation.HORIZONTAL);
                rightText.contents = toRight;
                rightText.textRange.paragraphAttributes.justification = Justification.CENTER;
                rightText.textRange.characterAttributes.fillColor = newColor;
                rightText.move(legendLayer, ElementPlacement.INSIDE);
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
                
            //Set the id to the page item if no id is assigned to that item.
            if (specctrId == "")
                specctrId = this.setUniqueIDToItem(pageItem);
                
            //Store the unique IDs to the spacing spec's group.
            itemsGroup.note = specctrId;
            itemsGroup.name = "Specctr Spacing Mark";
            itemsGroup.move(legendLayer, ElementPlacement.INSIDE);
            
        } catch(e) {
            return false;
        }

        return true;
    },

    //Call the spacing specs functions according to the number of selected art on the active artboard.
    createSpacingSpecs : function() {
        var result = false;

        try {
            if (app.selection.length==2) {	
                var obj1 = app.selection[0];
                var obj2 = app.selection[1];
                
                if ((!obj1.note || obj1.note.indexOf("source")!=-1) && 
                    (!obj2.note || obj2.note.indexOf("source")!=-1))
                        this.createSpacingSpecsForItems(obj1,obj2);
            } else if (app.selection.length==1) {
                var obj=app.selection[0];
                if (!obj.note || obj.note.indexOf("source")!=-1)
                    this.createSpacingSpecsForItem(obj, false);
            } else {
                alert("Please select one or two art items!");
            }
            app.redraw();   //Creates an 'undo' point.    
            
        } catch(e) {}
        
        return result;
    },

    //Update the property and note spec of the layer whose spec is already present.
    updateConnection : function(bUndoFlag) {
        try {

            //Check if the selected art item have specs or not.
            if(app.selection.length > 1 || bUndoFlag == "true")
                return false;
                
            var pageItem = app.selection[0];
            if (pageItem.note && pageItem.note.indexOf("source") >= 0) {
                //Get specctr Id.
                var specctrId = "";
                try {
                    if(pageItem.note) {
                        var sourceJson = JSON.parse(pageItem.note);
                        specctrId = sourceJson.specctrId;
                    }
                }catch(e) {}
                
                if(specctrId == "")
                    return false;
                    
                this.createPropertySpecsForItem(pageItem, true);
                this.addNoteSpecsForItem(pageItem, "", true);
                this.createDimensionSpecsForItem(pageItem, true);
                this.createCoordinateSpecsForItem(pageItem, true);
                this.createSpacingSpecsForItem(pageItem, true);
                app.redraw();
               
            } else if (pageItem.note) {
                //Check if selected art item is property spec.
                if(pageItem.note.indexOf("property") >= 0 || pageItem.note.indexOf("css") >= 0) {
                    //Get the specctrId from selected page item.
                    var groupJson = JSON.parse(pageItem.note);
                    specctrId = groupJson.specctrId;

                   //Get the source item based on the specctrId.
                   var sourceItem = this.getPageItemBasedOnSpecctrId(specctrId);

                    if(sourceItem) {
                        this.createPropertySpecsForItem(sourceItem, true);
                        app.redraw();
                    }
                } else if (pageItem.note.indexOf("note") >= 0) {
                    //Get the specctrId from selected page item.
                    var groupJson = JSON.parse(pageItem.note);
                    specctrId = groupJson.specctrId;

                     //Get the pageItem based on the specctrId.
                    var sourceItem = this.getPageItemBasedOnSpecctrId(specctrId);

                    if(sourceItem) {
                        this.addNoteSpecsForItem(sourceItem, "", true);
                        app.redraw();
                    }
                }
            }
           
        } catch(e) {
            return false;
        }
        return true;
    },

    getPageItemBasedOnSpecctrId : function (specctrId) {
        var pageItem = null;
        var pageItems = app.activeDocument.pageItems;
        var pageItemNo = pageItems.length;

        for (var i = 0; i < pageItemNo; i++) {
            try {
                 var fromLastIndex = pageItemNo - 1 - i;
                 var selPageItem = pageItems[fromLastIndex];

                 if(selPageItem.note && selPageItem.note.search("source") >= 0) {
                        var sourceJson = JSON.parse(selPageItem.note);
                        var pageItemSpecctrId = sourceJson.specctrId;

                        if (pageItemSpecctrId == specctrId)
                            return selPageItem;
                  }
                    
            } catch (e) {}
        }
    
        return null;
    },

    //Call the property specs function for each selected art on the active artboard.
    createPropertySpecs : function() {
        try {
            // Create property specs for all the selected pageItems.
            var selectionLength = app.selection.length;
            for (var i = 0; i < selectionLength; i++) {
                var obj = app.selection[i];
                if (!obj.note || obj.note.indexOf("source") != -1)
                    this.createPropertySpecsForItem(obj, false);
                else if (obj.note.indexOf("property") >= 0 || obj.note.indexOf("css") >= 0)
                    this.createPropertySpecsForItem(obj, true);
            }
            app.redraw();   //Creates an 'undo' point.    
        } catch(e) {}
    },

    //Get the property of selected layer and show it on active document.
    createPropertySpecsForItem : function(sourceItem, bIsUpdate) {
        try {
            var pageItem = sourceItem;

            //Get the specctrId associated with source item. Try catch block necessary if sourceJson become null.
            var specctrId = "";
            try {
                if(pageItem.note) {
                    var sourceJson = JSON.parse(pageItem.note);
                    specctrId = sourceJson.specctrId;
                }
            }catch(e) {pageItem.note = "";}

            // If spec is selected.
            if(bIsUpdate == true) {
                pageItem = this.getPageItemBasedOnSpecctrId(specctrId);
                sourceItem = pageItem;
                
                if(!sourceItem)
                    return;
            }

            //Get the layerIndex of pageItem, if unable to get pageItem's index  then fetch parent's index. Default index is 0.
            try{
                var layerIndex = pageItem.zOrderPosition;
            } catch (e) {
                try {
                    layerIndex = pageItem.parent.zOrderPosition;
                } catch (e) {
                    layerIndex = 0;
                }
            }

            //Get the source item bounds and default color for specs.
            var pageItemBounds = this.itemBounds(pageItem);
            var newColor = this.legendColor(model.legendColorObject);
            var legendLayer, infoText;
            
            //Get the property spec text, spec color (if text art item) and parent group of sepc's items.
            switch (sourceItem.typename) {
                case "TextFrame": 
                    infoText = this.getSpecsInfoForTextItem(sourceItem, pageItemBounds, layerIndex); 
                    newColor = this.legendColor(model.legendColorType); 
                    legendLayer = this.legendSpecLayer("Text Properties"); 
                    break;
            
                case "PathItem": 
                    infoText = this.getSpecsInfoForPathItem(sourceItem, pageItemBounds, layerIndex); 
                    legendLayer = this.legendSpecLayer("Object Properties");	
                    break;
            
                default: 
                    infoText = this.getSpecsInfoForGeneralItem(sourceItem, pageItemBounds, layerIndex);
                    legendLayer = this.legendSpecLayer("Object Properties");
            }

            if (infoText == "") 
                return;
                
            var arm, spec, group, itemCircle, firstBullet, secondBullet, noOfSpecs = "";

            // Get the spec's item in case of updating spec (either by manually or through event)
            if (legendLayer && specctrId != "") {
                var noOfIteration = legendLayer.groupItems.length;
                
                //Check if spec is already created or not based on the specctrId match stored in note of source item and property spec group.
                //Iterate through all the group items of property spec group and get all the spec items, if matched.
                while (noOfIteration) {
                    group = legendLayer.groupItems[noOfIteration - 1];
                    
                    try {
                            var groupJson = JSON.parse(group.note);
                            groupSpecctrId = groupJson.specctrId;

                            if (groupSpecctrId == specctrId) {
                                try {
                                    spec = group.pageItems.getByName("spec");
                                } catch (e) {}
                                
                                try {
                                    arm = group.pageItems.getByName("arm"); 
                                } catch(e) {}
                                
                                try {
                                itemCircle = group.pageItems.getByName("itemCircle");
                                } catch(e) {}
                                
                                try {
                                firstBullet = group.pageItems.getByName("firstBullet");
                                } catch (e) {}
                                
                                try {
                                secondBullet = group.pageItems.getByName("secondBullet");
                                } catch (e) {}
                                
                                break; 
                            }
                    }catch(e){}
                
                    --noOfIteration;
                }
            
                //In case source item already have specctrId assigned to it.
                if(noOfIteration <= 0) {
                    if(bIsUpdate == true)
                        return;
                        
                    group = null;
                } else if (!spec && bIsUpdate == true ) {
                    return;
                }
            }

            //Create spec if its not an update.
            var isSpecCreated = false;
            if (!spec) {
                isSpecCreated = true;
                spec = app.activeDocument.textFrames.add();
                spec.resize(100.1, 100.1);       //this allows to change justification from right to left later
                spec.name = "spec";
            }  else {
                //Get the bullet number assigned to the spec.
                try {
                var jsonResponse = JSON.parse(spec.note);
                noOfSpecs = jsonResponse.bulletNo;
                }catch(e){}
            }

            //Set style to property spec as per the specctr panel setting.
            spec.contents = infoText;
            spec.textRange.characterAttributes.fillColor = newColor;
            spec.textRange.characterAttributes.textFont = app.textFonts.getByName(model.legendFont);
            spec.textRange.characterAttributes.size = model.legendFontSize;

            // Make the first line of specs in bold letters if the selected font from specctr panel has any bold type.
            var storyLineLength = spec.story.lines.length;
            for (var i = 0; i < storyLineLength; i++) {
                try {
                    var currTextRange = spec.story.lines[i];
                    var content = currTextRange.contents;
                    if(content == "Text:" || content == "Stroke:" || content == "Fill:"  || 
                            content == "Opacity:" || content == "Border-radius:" || i == 0)  {
                        try {
                            var newFontName = this.getBoldStyleOfFont();
                            currTextRange.characterAttributes.textFont = app.textFonts.getByName(newFontName);
                        } catch(e){}
                    }
                } catch(e){}
            }

            //If no group, create it.
            if (!group) 
                group = app.activeDocument.groupItems.add();

            var currentArtboard = app.activeDocument.artboards[app.activeDocument.artboards.getActiveArtboardIndex()];
            var artRect = currentArtboard.artboardRect;

            //center
            var heightItem= pageItemBounds[1] - pageItemBounds[3];
            var heightInfo = spec.visibleBounds[1] - spec.visibleBounds[3];
            
            var centerY = (pageItemBounds[1] + pageItemBounds[3]) / 2;
            var centerX = (pageItemBounds[0] + pageItemBounds[2]) / 2;

            //If note spec present, create the property spec just below the note spec for the newly created spec.
            var spacing = 30, yReference = 0, noteSpec;
            if(isSpecCreated == true) {
                try {
                    var noteLegendLayer = this.legendLayer().layers.getByName("Add Notes");
                } catch (e) {}
                
                if (noteLegendLayer && specctrId != "") {
                    var count = noteLegendLayer.groupItems.length;
                    
                    //Check if spec is already created or not based on the specctrId match stored in note of source item and note spec group.
                    //Iterate through all the group items of note spec group and get all the spec items, if matched.
                    while (count) {
                        var noteGroup = noteLegendLayer.groupItems[count - 1];
                        
                        try {
                        
                            var noteGroupJson = JSON.parse(noteGroup.note);
                            var noteSpecctrId = noteGroupJson.specctrId;

                            if (noteSpecctrId == specctrId) {
                                try {
                                    noteSpec = noteGroup.pageItems.getByName("noteSpec");
                                } catch (e) {}
                                
                                break; 
                            }
                        } catch (e) {}

                        --count;
                    }
                
                    //In case source item already have specctrId assigned to it.
                    if(count == undefined || count <= 0)
                        noteSpec = null;
                }
            }

            // If noteSpec exist shift the vertical position to the bottom of note spec.
             if(noteSpec) {
                yReference = noteSpec.visibleBounds[3] - spacing;
            } else {
                yReference = pageItemBounds[1] - (heightItem - heightInfo) / 2;
            }

            //Adjust the position of property specs respective to source art item.
            this.adjustSpec(isSpecCreated, spec, artRect, pageItemBounds, yReference);
            spec.move(group, ElementPlacement.INSIDE);

            //Remove the existing the arms/bullets if any.
            if(arm) {
                arm.remove();
                arm = null;
            }

            if(itemCircle) {
                itemCircle.remove();
                itemCircle = null;
            }

            if(firstBullet) {
                firstBullet.remove();
                firstBullet = null;
            }

            if(secondBullet) {
                secondBullet.remove();
                secondBullet = null;
            }

            //Create arm if spec option is line.
            if (model.specOption == "Line") {
                try {
                this.createArmWithCircle(spec, pageItemBounds, centerX, centerY, newColor, group, pageItem);
                } catch (e) {alert("Arm Circle: "+e);}
            }

            // Create bullet if spec option is bullet.
             if(model.specOption == "Bullet") {
                var specctrLayer = this.legendLayer();
                var updatedSpecWithNoBullet = false;
                
                if(!noOfSpecs) {
                    noOfSpecs = specctrLayer.note;
                    updatedSpecWithNoBullet = true;
                }

                if(!noOfSpecs) 
                    noOfSpecs = 1;

                //Either new spec created or nothing is assigned to speectrLayer note.
                if(isSpecCreated == true || !specctrLayer.note || updatedSpecWithNoBullet == true) 
                    specctrLayer.note = noOfSpecs + 1;

                 //Create text at given font size, font value, font color.
                var textColor = new RGBColor();
                textColor.red = 255;
                textColor.green = 255;
                textColor.blue = 255;
                
                //If font has not any bold type member.
                if(!newFontName)
                    newFontName = model.legendFont;

                var number = app.activeDocument.textFrames.add();
                number.contents = noOfSpecs;
                number.textRange.characterAttributes.fillColor = textColor;
                number.textRange.characterAttributes.textFont = app.textFonts.getByName(newFontName);
                number.textRange.characterAttributes.size = model.legendFontSize;
                
                 var dia = Math.abs(number.visibleBounds[3] - number.visibleBounds[1]) + 8;
                 firstBullet = this.createBullet(newColor, number, dia,
                                           spec.visibleBounds[1], spec.visibleBounds[0]);
                                           
                 secondBullet = firstBullet.duplicate();
                 secondBullet.translate(pageItemBounds[0] - secondBullet.visibleBounds[0] - dia - 1, 
                        pageItemBounds[1] - secondBullet.visibleBounds[1]);

                 firstBullet.move(group, ElementPlacement.INSIDE);
                 secondBullet.move(group, ElementPlacement.INSIDE);
                 firstBullet.name = "firstBullet";
                 secondBullet.name = "secondBullet";
             }

            //Set the id to the page item if no id is assigned to that item.
            if (specctrId == "")
                specctrId = this.setUniqueIDToItem(pageItem);

            group.name = "Specctr Properties Mark";
            group.move(legendLayer, ElementPlacement.INSIDE);
            group.note = '{"type":"property","specctrId":"' + specctrId + '"}';
            
            spec.note = '{"bulletNo":"' + noOfSpecs + '","css":"'+cssText+'","specctrId":"'+specctrId+'"}';
            
        } catch(e) {
            alert(e);
            return false;
        }

        return true;
    },
    //Create bullet annotation for specs.
    createBullet : function (bulletColor, number, dia, specTop, specLeft) {
        try {
            var group = app.activeDocument.groupItems.add();
            var numberHeight = number.visibleBounds[3] - number.visibleBounds[1];
            var numberWidth = number.visibleBounds[2] - number.visibleBounds[0];

            //top, left should be the spec's coordinates.
            var itemCircle = app.activeDocument.pathItems.ellipse(specTop, specLeft - dia - 1, dia, dia);
            itemCircle.fillColor = bulletColor;
            itemCircle.filled = true;
            itemCircle.stroked = false;
            itemCircle.move(group, ElementPlacement.INSIDE);

            number.translate(itemCircle.visibleBounds[0] - number.visibleBounds[0] + dia / 2.0 - numberWidth/2.0, 
                                        itemCircle.visibleBounds[1] - number.visibleBounds[1] - dia / 2.0 - numberHeight/2.0);
            number.move(group, ElementPlacement.INSIDE);
            
            return group;
            
        } catch (e) {
            alert(e);
        }
    },

    //Call the add note specs function for each selected art on the active artboard.
    addNoteSpecs : function(noteText) {
        try {
            var selectionLength = app.selection.length;
            for (var i = 0; i < selectionLength; i++) {
                var obj = app.selection[i];
                if (!obj.note || obj.note.indexOf("source") != -1)
                    this.addNoteSpecsForItem(obj, noteText, false);
                else if (obj.note.indexOf("note") >= 0 || obj.note.indexOf("noteSpec") >= 0)
                    this.addNoteSpecsForItem(obj, noteText, true);
            }
            app.redraw();   //Creates an 'undo' point.
        } catch(e) {}
    },

    // Add note specs for the selected page item.
    addNoteSpecsForItem : function (sourceItem, noteText, bUpdate) {
         try {
            var pageItem = sourceItem;

            //Get the specctrId associated with source item. Try catch block necessary if sourceJson become null.
            var specctrId = "";
            try {
                if(pageItem.note) {
                    var sourceJson = JSON.parse(pageItem.note);
                    specctrId = sourceJson.specctrId;
                }
            }catch(e) {pageItem.note = "";}

            if(bUpdate == true) {
//~                 var bIsNotePresent;
//~                 try {
//~                     bIsNotePresent = this.legendLayer().layers.getByName("Add Notes");    //Already present in the 'Specctr' group layer.
//~                 } catch(e) {}
//~                 if(!bIsNotePresent)
//~                     return;
                pageItem = this.getPageItemBasedOnSpecctrId(specctrId);
                sourceItem = pageItem;
                
                if(!sourceItem)
                    return;
            }

            // Get the spec's item in case of updating spec (either by manually or through event)
            var legendLayer = this.legendSpecLayer("Add Notes");
            var arm, spec, group, itemCircle;
            if (legendLayer && specctrId != "") {
                var noOfIteration = legendLayer.groupItems.length;
                
                //Check if spec is already created or not based on the specctrId match stored in note of source item and note spec group.
                //Iterate through all the group items of note spec group and get all the spec items, if matched.
                while (noOfIteration) {
                    group = legendLayer.groupItems[noOfIteration - 1];
                    
                    try {
                        var groupJson = JSON.parse(group.note);
                        groupSpecctrId = groupJson.specctrId;

                        if (groupSpecctrId == specctrId) {
                            try {
                                spec = group.pageItems.getByName("noteSpec");
                            } catch (e) {}
                            
                            try {
                                arm = group.pageItems.getByName("arm"); 
                            } catch(e) {}
                            
                            try {
                            itemCircle = group.pageItems.getByName("itemCircle");
                            } catch(e) {}
                            
                            break; 
                        }
                    } catch (e) {}
                
                    --noOfIteration;
                }
            
                //In case source item already have specctrId assigned to it.
                if(noOfIteration <= 0) {
                    if(bUpdate == true)
                        return;
                        
                    group = null;
                } else if (!spec && bUpdate == true ) {
                    return;
                }
            }
            
            // Get the color value based on the source art item type.
            var newColor;
            if(pageItem.typename == "TextFrame")
                newColor = this.legendColor(model.legendColorType); 
            else
                newColor = this.legendColor(model.legendColorObject);
                
            //Create spec if its not an update.
            var isSpecCreated = false;
            if (!spec) {
                isSpecCreated = true;
                spec = app.activeDocument.textFrames.add();     
                spec.resize(100.1, 100.1);       //this allows to change justification from right to left later
                spec.name = "noteSpec";
            }

            if(noteText != "")
                spec.contents = noteText;

            spec.textRange.characterAttributes.fillColor = newColor;
            spec.textRange.characterAttributes.textFont = app.textFonts.getByName(model.legendFont);
            spec.textRange.characterAttributes.size = model.legendFontSize;

            //If no group, create it.
            if (!group)
                group = app.activeDocument.groupItems.add();
             
            var currentArtboard = app.activeDocument.artboards[app.activeDocument.artboards.getActiveArtboardIndex()];
            var artRect = currentArtboard.artboardRect;

            //center
            var pageItemBounds = this.itemBounds(pageItem);
            var heightItem= pageItemBounds[1] - pageItemBounds[3];
            var heightInfo = spec.visibleBounds[1] - spec.visibleBounds[3];
             
            var centerY = (pageItemBounds[1] + pageItemBounds[3]) / 2;
            var centerX = (pageItemBounds[0] + pageItemBounds[2]) / 2;

            //To get property specs in case any present for selected pageItem.
            var spacing = 30, yReference = 0, propertySpec;
            if(isSpecCreated == true) {
                var propLegendLayer;
                
                try {
                    if(pageItem.typeName == "TextFrame") {
                        propLegendLayer = this.legendLayer().layers.getByName("Text Properties");
                    } else {
                        propLegendLayer = this.legendLayer().layers.getByName("Object Properties");
                    }
                } catch(e) {}
                
                if (propLegendLayer && specctrId != "") {
                    var count = propLegendLayer.groupItems.length;
                    
                    //Check if spec is already created or not based on the specctrId match stored in note of source item and note spec group.
                    //Iterate through all the group items of note spec group and get all the spec items, if matched.
                    while (count) {
                        var propGroup = propLegendLayer.groupItems[count - 1];
                        
                        try {
                            var propGroupJson = JSON.parse(propGroup.note);
                            var propSpecctrId = propGroupJson.specctrId;

                            if (propSpecctrId == specctrId) {
                                try {
                                    propertySpec = propGroup.pageItems.getByName("spec");
                                } catch (e) {}
                                
                                break; 
                            }
                        } catch (e) {}
                    
                        --count;
                    }
                
                    //In case source item already have specctrId assigned to it.
                    if(count ==undefined || count <= 0)
                        propertySpec = null;
                }
            }
        
            // If propertySpec exist shift the vertical position to the bottom of property spec.
            if(propertySpec) {
                yReference = propertySpec.visibleBounds[3] - spacing;
            } else {
                yReference = pageItemBounds[1];
            }
        
           //Adjust the note specs position respective to source item position.
           this.adjustSpec(isSpecCreated, spec, artRect, pageItemBounds, yReference);
           spec.move(group, ElementPlacement.INSIDE);

            //Remove the existing arm (if any)
            if(arm) {
                arm.remove();
                arm = null;
            }

            if(itemCircle) {
                itemCircle.remove();
                itemCircle = null;
            }

            //Create new arm.
            try {
                this.createArmWithCircle(spec, pageItemBounds, centerX, centerY, newColor, group, pageItem);
            } catch (e) {alert("Arm Issue: "+e);}

            //Set the id to the page item if no id is assigned to that item.
            if (specctrId == "")
                specctrId = this.setUniqueIDToItem(pageItem);

            group.name = "Specctr Add Notes";
            group.note =  '{"type":"note","specctrId":"' + specctrId + '"}';
            group.move(legendLayer, ElementPlacement.INSIDE);
            
            spec.note = '{"type":"noteSpec","specctrId":"' + specctrId + '"}';
        } catch(e) {
            alert(e);
            return false;
        }

        return true;
    },

    //Set the position of specs based on the source item position.
    adjustSpec : function(isSpecCreated, spec, artRect, pageItemBounds, yReference) {

        var specX, spacing = 30;
        var artboardCenterX = (artRect[0] + artRect[2]) / 2;
        var centerX = (pageItemBounds[0] + pageItemBounds[2]) / 2;
        var widthInfo = spec.visibleBounds[2] - spec.visibleBounds[0];
        
        if(isSpecCreated == true) {
                if (centerX <= artboardCenterX) {
                    spec.textRange.paragraphAttributes.justification = Justification.LEFT;
                        
                    if (model.specToEdge)
                        specX = artRect[0] - spec.visibleBounds[0] + spacing ;
                    else
                        specX = pageItemBounds[0] - widthInfo - spacing;
                } else {
                    spec.textRange.paragraphAttributes.justification = Justification.RIGHT;
                    if (model.specToEdge && isSpecCreated == true) {
                        spec.translate(pageItemBounds[2] - pageItemBounds[0],0);
                        specX = artRect[2] - spec.visibleBounds[2] - spacing;
                    } else {
                        specX = pageItemBounds[2] + spacing;
                    }
                }
            
                spec.translate(specX, (yReference - spec.visibleBounds[1]));
            } else {
                // Right and left justification of specs based on the source item and spec position.
                // If source item's center x is smaller than spec's center x, set justification to left otherwise right.
                if(centerX < ((spec.visibleBounds[0] + spec.visibleBounds[2]) / 2))
                    spec.textRange.paragraphAttributes.justification = Justification.RIGHT;
                else
                    spec.textRange.paragraphAttributes.justification = Justification.LEFT;
            }
    },

    //Create arm of specs
    createArmWithCircle : function(spec, pageItemBounds, centerX, centerY, newColor, group, pageItem) {
        //Create line
        var arm = app.activeDocument.pathItems.add();
        var armX1, armX2;

        if (centerX > ((spec.visibleBounds[0] + spec.visibleBounds[2]) / 2)) {
            armX1 = pageItemBounds[0];
            armX2 = spec.visibleBounds[2];
        } else {
            armX1 = pageItemBounds[2];
            armX2 = spec.visibleBounds[0];
        }
             
        var armDX = Math.abs(armX1 - armX2);
        var dx = armPartLength;
        if (armX1 < armX2) 
            dx = -dx;

        if (armDX < armPartLength * 1.3)
            arm.setEntirePath([[armX2, spec.visibleBounds[1]], [armX1, centerY]]);
        else
            arm.setEntirePath([[armX2, spec.visibleBounds[1]], [armX2 + dx, spec.visibleBounds[1]], [armX1, centerY]]);

        arm.stroked = true;
        arm.strokeDashes = [];
        arm.strokeWidth = model.armWeight;
        arm.strokeColor = newColor;
        arm.filled = false;
        arm.move(group, ElementPlacement.INSIDE);
        arm.name = "arm";
            
        //Create item circle
        var circleD = this.circleDiameter(model.armWeight);
         if (centerX > ((spec.visibleBounds[0] + spec.visibleBounds[2]) / 2))
            itemCircle = app.activeDocument.pathItems.ellipse(centerY + circleD / 2, 
                                                                                        pageItemBounds[0] - circleD / 2, circleD, circleD);
        else 
            itemCircle = app.activeDocument.pathItems.ellipse(centerY + circleD / 2,
                                                                                        pageItemBounds[2] - circleD / 2, circleD, circleD);
        
        itemCircle.strokeColor = newColor;
        itemCircle.fillColor = newColor;
        
        if (pageItem.typename=="TextFrame")
            itemCircle.filled = true;
        else 
            itemCircle.filled = false;
        
        itemCircle.strokeWidth = model.armWeight;
        itemCircle.stroked = true;
        itemCircle.move(group, ElementPlacement.INSIDE);
        itemCircle.name = "itemCircle";
    },
    
    //Get bold font name of the given font family.
    getBoldStyleOfFont : function() {
        var fonts = app.textFonts;
        var boldFontName;
        var fontsLength = fonts.length;
   
        for (var j = 0; j < fontsLength; j++) {
            var currFont = fonts[j];
            if (currFont.family == model.legendFontFamily && currFont.style == "Bold") {
                boldFontName = currFont.name;
                break;
            }
        }
        return boldFontName;
    },

    
    //Return the bounds of the object without stroke excluding text frame object.
    itemBoundsWithoutStroke : function (artItem) {
        var bounds = artItem.geometricBounds;
        if (artItem.typename == "TextFrame") {
            try {
                var dup = artItem.duplicate();
                var target = dup.createOutline();
                bounds = target.visibleBounds;
                target.remove();
            } catch(e) {}
        }
        return bounds;
    },

    //Return the bounds of the object including stroke width.
    itemBounds : function(textFrame) {
        var bounds = textFrame.visibleBounds;

        if (textFrame.typename == "TextFrame") {
            try {
                var dup = textFrame.duplicate();
                var target = dup.createOutline();
                bounds = target.visibleBounds;
                target.remove();
            } catch(e) {}
        }

        return bounds;
    },

    circleDiameter : function(strokeWidth) {
        return Math.max(3, strokeWidth * 2 + 3);
    },

    positionChanged : function(item, savedCoords) {
        try{
            var newCoords = item.visibleBounds.join("|");
            if (newCoords != savedCoords) 
                return true;
        } catch(e) {}
        return false;
    },

    legendColor : function(colorValue) {
        var newColor= new RGBColor();
        newColor.red = this.rChannel(colorValue);
        newColor.blue = this.bChannel(colorValue);
        newColor.green = this.gChannel(colorValue);
        return newColor;
    },

    //Create specctr art layer group, if not present.
    legendLayer : function() {
        var newLayer;
        try{
            newLayer = app.activeDocument.layers.getByName("specctr");
        } catch(e) {
            newLayer = app.activeDocument.layers.add();
            newLayer.name = "specctr";
            newLayer.zOrder(ZOrderMethod.BRINGTOFRONT);
        }
        newLayer.locked = false;
        return newLayer;
    },

     //Create the spec group layer first time.
     legendSpecLayer : function(layerName) {
        var newLayer;
        try {
            newLayer = this.legendLayer().layers.getByName(layerName);    //Already present in the 'Specctr' group layer.
        } catch(e) {
            newLayer = this.legendLayer().layers.add();
            newLayer.name = layerName;
            newLayer.zOrder(ZOrderMethod.BRINGTOFRONT);
        }

        newLayer.locked = false;
        return newLayer;
    },

    //Get the red color value from the color hex value.
    rChannel : function(value) {
       return parseInt(value.substring(1, 3), 16);
    },

    //Get the green color value from the color hex value.
    gChannel : function(value) {
        return parseInt(value.substring(3, 5), 16);
    },

    //Get the blue color value from the color hex value.
    bChannel : function(value) {
        return parseInt(value.substring(5, 7), 16);
    },

    pointsToUnitsString : function(value, units) {
        if (units == null) 
            units = app.activeDocument.rulerUnits;
        
        var result;
        
        switch (units) {
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
    },
            
    typeUnits : function() {
        if (app.activeDocument.rulerUnits == RulerUnits.Pixels) 
            return "px"; 
        else 
            return "pt";
    },

    colorAsString : function(c) {
        var result="";

        var color = c;
        var newColor;
        
        var sourceSpace;
        var targetSpace;
        var colorComponents;
        
        switch (c.typename) {
            case "RGBColor": sourceSpace = ImageColorSpace.RGB; colorComponents=[c.red,c.green,c.blue]; break;
            case "CMYKColor": sourceSpace = ImageColorSpace.CMYK; colorComponents=[c.cyan,c.magenta,c.yellow,c.black]; break;
            case "LabColor": sourceSpace = ImageColorSpace.LAB; colorComponents=[c.l,c.a,c.b]; break;
            case "GrayColor": sourceSpace = ImageColorSpace.GrayScale; colorComponents=[c.gray]; break;
        }
        
        switch (model.legendColorMode) {
            case "LAB": targetSpace = ImageColorSpace.LAB; break;
            case "CMYK":
                targetSpace=ImageColorSpace.CMYK; break;
            case "RGB":	
            default:
                targetSpace=ImageColorSpace.RGB; break;
        }
            

        
        if (sourceSpace != null) {
            var newColorComponents = app.convertSampleColor(sourceSpace, colorComponents, targetSpace,ColorConvertPurpose.previewpurpose);
            
            switch (model.legendColorMode) {
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
        
        switch (color.typename) {
            case "RGBColor":
                switch (model.legendColorMode) {
                    case "HSB":
                        result = this.rgbToHsv(color);
                    break;
                
                    case "HSL":
                        result = this.rgbToHsl(color);
                    break;
                
                    case "HEX":
                        var red = Math.round(color.red).toString(16);
                        var green = Math.round(color.green).toString(16);
                        var blue = Math.round(color.blue).toString(16);
                        
                        if (red.length == 1) 
                            red = "0" + red;
                        
                        if (green.length == 1) 
                            green = "0" + green;
                        
                        if (blue.length == 1) 
                            blue = "0" + blue;
                    
                        result = "#" + red + green + blue;
                        break;

                    case "iOS (RGB as %)":
                        result = "rgb(" + Math.round(color.red / 255 * 100) + ", " +  
                                        Math.round(color.green / 255 * 100) + ", " + 
                                        Math.round(color.blue / 255 * 100) + ")";
                        break;
                        
                    case "RGB":
                    default:
                        result = "rgb(" + Math.round(color.red) + ", " + 
                                        Math.round(color.green) + ", " + 
                                        Math.round(color.blue) + ")";                    
                }
            break;
            
            case "CMYKColor":
            result = "cmyk(" + Math.round(color.cyan) + ", " + 
                            Math.round(color.magenta) + ", " + 
                            Math.round(color.yellow) + ", " + 
                            Math.round(color.black) + ")";
            break;
            
            case "LabColor":
            result = "lab(" + Math.round(color.l) + ", " + Math.round(color.a) + ", " + Math.round(color.b) + ")";
            break;
            
            case "GrayColor":
            result = "gray("+Math.round(color.gray) + ")";
            break;
            
            case "SpotColor":
            result = color.spot.name + " " + this.colorAsString(color.spot.color) + " tint: " + Math.round(color.tint);
            break;
            
            case "PatternColor":
            result = "pattern( " + color.pattern.name + ")";
            break;
            
            case "GradientColor":
            result = "Gradient " + color.gradient.type.toString().slice(13).toLowerCase()+"\r";
            for (var i = 0; i < color.gradient.gradientStops.length; i++) {
                result += this.colorAsString(color.gradient.gradientStops[i].color)
                        +" alpha: " + (Math.round(color.gradient.gradientStops[i].opacity) / 100) + "\r";
            }
            break;
        }

        return result;
    },

    rgbToHsl : function(rgb) {
        var r = rgb.red;
        var g = rgb.green;
        var b = rgb.blue;
        r = r / 255 , g = g / 255, b = b / 255;
        
        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;
        
        if (max == min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return "hsl(" + Math.round(h*360) + ", " + Math.round(s*100) + ", " + Math.round(l*100) + ")";
    },

    rgbToHsv : function(rgb) {
        var r = rgb.red;
        var g = rgb.green;
        var b = rgb.blue;
        r = r / 255, g = g / 255, b = b / 255;
        
        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var h, s, v = max;
        
        var d = max - min;
        s = max == 0 ? 0 : d / max;
        
        if (max == min) {
            h = 0; // achromatic
        } else {
            switch(max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return "hsb(" + Math.round(h*360) + ", " + Math.round(s*100) + ", " + Math.round(v*100) + ")";
    },

    //Get the round corner value of the path item.
    getRoundCornerValue : function(pageItem) {
        try {
            var infoText = "";
            var doc = app.activeDocument;
            var anchorPoints = new Array;
            var points = pageItem.selectedPathPoints;
            var point = "";
            
            if (points.length < 5)
                return infoText + "0 " + this.typeUnits();
            
            if (points.length != 8)
                return "";

            for (var k = 0; k < 2 ; k++) {
                point = points[k];
                anchorPoints[k] =  point.anchor[0];
            }
        
            infoText +=  Math.abs(parseInt(anchorPoints[1]) - parseInt(anchorPoints[0])) + " " + this.typeUnits();
        } catch(e) {
            infoText = "";
        }

        return infoText;
    },

    //Get spec info for items other than path item and text item.
    getSpecsInfoForGeneralItem : function(sourceItem, cssBounds, layerIndex) {
        var infoText = sourceItem.typename;
        var pageItem = sourceItem;
        
        var name = sourceItem.name;
        if (!name) name = infoText.toLowerCase();
        
        try {
            var parentOrderPosition = pageItem.parent.zOrderPosition
        } catch (e) {
            parentOrderPosition = 0;
        }
        
        var alpha = Math.round(pageItem.opacity)/100;
        var artboardIndex = app.activeDocument.artboards.getActiveArtboardIndex();
        var currentArtboard = app.activeDocument.artboards[artboardIndex];
        
        cssText = name.toLowerCase() + " {type: " + infoText.toLowerCase() + ";";
        cssText += "artboard_name: " + currentArtboard.name + ";";
        cssText += "artboard_id: " + artboardIndex + ";";
        cssText += "artboard_index: " + artboardIndex + ";";
        cssText += "parent_layer_name: " + pageItem.parent.name + ";";
        cssText += "parent_layer_id: " + parentOrderPosition + ";";
        cssText += "parent_layer_index: " + parentOrderPosition + ";";
        cssText += "layer_name: " + name.toLowerCase() + ";";
        cssText += "layer_id: " + layerIndex.toString() + ";";
        cssText += "layer_index: " + layerIndex.toString() + ";";
        cssText += "opacity: " + alpha + ";";
        cssText += "height: " + (cssBounds[1]-cssBounds[3]) + ";";
        cssText += "width: " + (cssBounds[2]-cssBounds[0]) + ";";
        cssText += "xCoord: " + cssBounds[0] + ";";
        cssText += "yCoord: " + -cssBounds[1] + ";";
        cssText += "}";
        
        if(model.shapeLayerName) infoText = name + "\r";
        if (model.shapeAlpha) {
            if (infoText != "") infoText += "\r\r";
            
            infoText += "Opacity:\r" + alpha;
        }

        return infoText;
    },

    //Getting info for path item.
    getSpecsInfoForPathItem : function(pageItem, cssBounds, layerIndex) {
        var infoText = "";
        var pathItem = pageItem;
        var fillStyle = "", color = "", strokeStyle = "", strokeWidth = "", strokeColor = "",
        opacity = "";
        
        var name = pageItem.name;
        if (!name) name = "<Path>";
        
        if(pathItem.filled) { 
            fillStyle = "Solid";
            color = this.colorAsString(pathItem.fillColor);
        } else {
            fillStyle = "None";
        }

        if (pathItem.stroked) {
            strokeStyle = pathItem.strokeDashes.length ? "Dashed" : "Solid";
            strokeWidth = this.pointsToUnitsString(pathItem.strokeWidth, null);
            strokeColor = this.colorAsString(pathItem.strokeColor);
        } else {
            strokeStyle = "None";
        }
    
        try {
            var parentOrderPosition = pageItem.parent.zOrderPosition
        } catch (e) {
            parentOrderPosition = 0;
        }
        
        opacity = Math.round(pageItem.opacity)/100;
        var roundCornerValue = this.getRoundCornerValue(pageItem); //Get corner radius of pathitem object.
        var artboardIndex = app.activeDocument.artboards.getActiveArtboardIndex();
        var currentArtboard = app.activeDocument.artboards[artboardIndex];

        //Set css for selected pathitem.
        cssText = "." + name.toLowerCase() + " {";
        cssText += "artboard_name: " + currentArtboard.name + ";";
        cssText += "artboard_id: " + artboardIndex + ";";
        cssText += "artboard_index: " + artboardIndex + ";";
        cssText += "parent_layer_name: " + pageItem.parent.name + ";";
        cssText += "parent_layer_id: " + parentOrderPosition + ";";
        cssText += "parent_layer_index: " + parentOrderPosition + ";";
        cssText += "layer_name: " + name.toLowerCase() + ";";
        cssText += "layer_id: " + layerIndex.toString() + ";";
        cssText += "layer_index: " + layerIndex.toString() + ";";
        cssText += "fill: " + fillStyle.toLowerCase() + ";";
        if(color != "") cssText += "background: " + color.toLowerCase()+";";
        cssText += "stroke-style: " + strokeStyle.toLowerCase() + ";";
        if(strokeWidth != "") cssText += "stroke-width: " + strokeWidth+ ";";
        if(strokeColor != "") cssText += "stroke-color: " + strokeColor.toLowerCase() + ";";
        cssText += "opacity: " + opacity + ";";
        if(roundCornerValue != "") cssText += "border-radius: " + roundCornerValue + ";";
        cssText += "height: " + (cssBounds[1]-cssBounds[3]) + " " + this.typeUnits() + ";";
        cssText += "width: " + (cssBounds[2]-cssBounds[0]) + " " + this.typeUnits() + ";";
        cssText += "xCoord: " + cssBounds[0] + " " + this.typeUnits() + ";";
        cssText += "yCoord: " + -cssBounds[1] + " " + this.typeUnits() + ";";
        cssText += "}";

        //Add properties which are enabled in details tab.
        if(model.shapeLayerName) infoText = name + "\r";
        if (model.shapeFillStyle || model.shapeFillColor) {
                infoText += "Fill:";
                if (model.shapeFillStyle) infoText += "\r" + fillStyle;
                if (model.shapeFillColor && color != "") infoText += "\r" + color;
        }
    
        if (model.shapeStrokeStyle || model.shapeStrokeColor || model.shapeStrokeSize) {
            if (infoText != "") infoText += "\r\r";
            
            infoText += "Stroke:";
            if (model.shapeStrokeStyle) infoText += "\r" + strokeStyle
            if (model.shapeStrokeSize  && strokeWidth != "") infoText += "\r" + strokeWidth;
            if (model.shapeStrokeColor  && strokeColor != "") infoText += "\r" + strokeColor;
        }
    
        if (model.shapeAlpha) {
            if (infoText != "") infoText += "\r\r";
            
            infoText += "Opacity:\r" + opacity;
        }
    
        if (model.shapeBorderRadius) {
            if (infoText != "") infoText += "\r\r";
            
            infoText += "Border-radius:\r" + roundCornerValue;
        }
    
        return infoText;
    },

    //Getting info for text item.
    getSpecsInfoForTextItem : function(pageItem, cssBounds, layerIndex) {
        var infoText = "";
        var textItem = pageItem;
        var fontSize = [], leading = [], fontFamily = [], tracking = [],
        textColor = [], fontStyle = [], textDecoration = [], alignment = [];
        var tempArray = [];
        
        //Get name of the selected text item.
        var name = textItem.name;
        if (!name)
            name = textItem.contents;
        
        var wordsArray = name.split(" ");
        if (wordsArray.length > 2)
            name = wordsArray[0] + " " + wordsArray[1] + " " + wordsArray[2];

        try {
            var opacity = Math.round(pageItem.opacity) / 100;
            var alpha = "";
            if (model.textAlpha) alpha = opacity;
                
            if (model.specInEM) {
                var rltvFontSize = 16, rltvLineHeight;
                
                if (model.baseFontSize != 0)
                    rltvFontSize = model.baseFontSize;
                 
                if (model.baseLineHeight != 0)
                    rltvLineHeight = model.baseLineHeight;
                else
                    rltvLineHeight = rltvFontSize * 1.4;
            } 
            
            var textRangeLength = textItem.textRanges.length;
            for (var i = 0; i < textRangeLength; i++) {
                var attr = textItem.textRanges[i].characterAttributes;
                
                //Get font size and leading.
                if(model.specInEM) {
                    fontSize = fontSize.uniquePush(Math.round(attr.size / rltvFontSize * 100) / 100 + " em");
                    leading = leading.uniquePush (Math.round(attr.leading / rltvLineHeight * 100) / 100 + " em");
                } else {
                    fontSize = fontSize.uniquePush(this.getScaledValue(Math.round(attr.size * 10) / 10) + " " + this.typeUnits());
                    leading = leading.uniquePush(Math.round(attr.leading * 10) / 10 + " " + this.typeUnits());
                }

                fontFamily = fontFamily.uniquePush(attr.textFont.name);
                tracking = tracking.uniquePush(Math.round(attr.tracking / 1000 * 100) / 100 + " em");
                textColor = textColor.uniquePush(this.colorAsString(attr.fillColor));
                
                //Get text style.
                var styleString = "normal";

                if (attr.capitalization == FontCapsOption.ALLCAPS) styleString = "all caps";
                else if (attr.capitalization == FontCapsOption.ALLSMALLCAPS) styleString = "all small caps";
                else if (attr.capitalization == FontCapsOption.SMALLCAPS) styleString = "small caps";
                
                fontStyle = fontStyle.uniquePush(styleString);
                
                //Get text decoration.
                styleString = "";
                if (attr.baselinePosition == FontBaselineOption.SUBSCRIPT) 
                    styleString = "sub-script";
                else if (attr.baselinePosition == FontBaselineOption.SUPERSCRIPT) 
                    styleString = "super-script";

                if (attr.underline) {
                    if (styleString != "") styleString += " / ";
                    styleString += "underline";
                }
            
                if (attr.strikeThrough) {
                    if(styleString != "") styleString += " / ";
                    styleString += "strike-through";
                }

                if (styleString != "") textDecoration = textDecoration.uniquePush(styleString);
            }
        
            //Store  distinct or unique color value in tempArray.
            for (i = 0; i < textColor.length; i++) {
                var value = textColor[i];
                if (alpha != "" && value.indexOf("(") >= 0) {
                    tempArray.push(this.convertColorIntoCss(value, alpha));
                    alpha = "";
                } else {
                    tempArray.push(value);
                }
            }
            
            //Get alignment.
            var paragraphLength = textItem.paragraphs.length;
            var paraAttr, s;
            for (i = 0; i < paragraphLength; i++) {
                //Handle the empty line exceptions.
                try {
                    paraAttr = textItem.paragraphs[i].paragraphAttributes;
                    s = paraAttr.justification.toString();
                    s = s.substring(14, 15) + s.substring(15).toLowerCase();
                    alignment = alignment.uniquePush(s.toLowerCase());
                } catch (e) {
                     continue;
                }
            }
        
            fontSize = fontSize.join();
            leading = leading.join();
            fontFamily = fontFamily.join();
            tracking = tracking.join();
            textColor = tempArray.join();
            fontStyle = fontStyle.join();
            if (styleString != "") textDecoration = textDecoration.join();
            alignment = alignment.join();
        
             try {
                var parentOrderPosition = pageItem.parent.zOrderPosition
            } catch (e) {
                parentOrderPosition = 0;
            }
        
            var artboardIndex = app.activeDocument.artboards.getActiveArtboardIndex();
            var currentArtboard = app.activeDocument.artboards[artboardIndex];

            //Set css for the selected text item.
            cssText = name.toLowerCase() + " {";
            cssText += "text_contents: " + textItem.contents + ";";
            cssText += "artboard_name: " + currentArtboard.name + ";";
            cssText += "artboard_id: " + artboardIndex + ";";
            cssText += "artboard_index: " + artboardIndex + ";";
            cssText += "parent_layer_name: " + pageItem.parent.name + ";";
            cssText += "parent_layer_id: " + parentOrderPosition + ";";
            cssText += "parent_layer_index: " + parentOrderPosition + ";";
            cssText += "layer_name: " + name.toLowerCase() + ";";
            cssText += "layer_id: " + layerIndex.toString() + ";";
            cssText += "layer_index: " + layerIndex.toString() + ";";
            cssText += "font-family: " + fontFamily+ ";" ;
            cssText += "font-size: " + fontSize +  ";";
            cssText += "color: " + textColor + ";";
            cssText += "font-style: " + fontStyle + ";";
            if (textDecoration != "") cssText += "text-decoration: " +  textDecoration + ";";
            cssText += "text-align: " + alignment + ";";
            cssText += "line-height: " + leading + ";";
            cssText += "letter-spacing: " + tracking + ";";
            cssText += "opacity: " + opacity + ";";
            cssText += "xCoord: " + cssBounds[0] + " " + this.typeUnits() + ";";
            cssText += "yCoord: " + -cssBounds[1] + " " + this.typeUnits() + ";";
            cssText += "}";
            
            //Add properties which are enabled in details tab.
            if(model.textLayerName) infoText = name;
            if (model.textFont) infoText += "\rFont-Family: " + fontFamily;
            if (model.textSize) infoText += "\rFont-Size: " + fontSize;
            if (model.textColor) infoText += "\rColor: " + textColor;

            if (model.textStyle) {
                infoText += "\rFont-Style: " + fontStyle;
                if (textDecoration.length) infoText += "\rText-Decoration: " + textDecoration;
            }
        
            if (model.textAlignment) infoText += "\rText-Align: " + alignment;
            if (model.textLeading) infoText += "\rLine-Height: " + leading;
            if (model.textTracking) infoText += "\rLetter-Spacing: " + tracking;
            if (alpha != "") infoText += "\rOpacity: " + opacity;

        } catch(e) {alert(e);};
        
        if (model.specInEM)
            cssBodyText = "body {font-size: " + Math.round(10000 / 16 * rltvFontSize) / 100 + "%;}";
        
        return infoText;
    },

    //Convert color into css style.
    convertColorIntoCss : function(color, alpha) {
        var index = color.indexOf("(");
        color = color.substr(0, index) + "a" + color.substr(index);
        color = color.substr(0, color.length-1)+", "+alpha+")";
        return color;
    },

    originalArtboardRect : function() {
        if (app.activeDocument) {
            var border = this.canvasBorder();

            if (!border) {
                var currentArtboard = app.activeDocument.artboards[app.activeDocument.artboards.getActiveArtboardIndex()];
                return currentArtboard.artboardRect;
            } else {
                return border.geometricBounds;
            }
        }
        return undefined;
    },

    //Convert decimal value into fraction string.
    decimalToFraction : function (decimalValue) {
        //Split decimalValue and get the digit value.
        var digitValue = decimalValue.split (" ");
        if(decimalValue.search("%") !== -1) {
            digitValue = decimalValue.split("%");
            digitValue[1] = "%";
        }

        var digitPart = digitValue[0];
        var postUnit = "";
        if(digitValue.length === 2)
            postUnit = " " + digitValue[1];

        function highestCommonFactor(a,b) {
            if (b == 0) return a;
            return highestCommonFactor(b, a % b);
        }

        var decimalArray = digitPart.split(".");
        if(decimalArray.length == 1) {
            return decimalValue;
        }

        var leftDecimalPart = decimalArray[0];
        var rightDecimalPart = decimalArray[1];

        var numerator = leftDecimalPart + rightDecimalPart;
        var denominator = Math.pow(10, rightDecimalPart.length);
        var factor = highestCommonFactor(numerator, denominator);
        denominator /= factor;
        numerator /= factor;
        return numerator + "/" + denominator + postUnit;
    }
};


		

    

