﻿#target indesign

#include "json2.js"
#include "specctrUtility.jsx"

var debug = false;
var prevTime;
var _specctr;

Application.prototype.doUndoableScript = function(theFunction,undoName) {
	 app.doScript(theFunction,ScriptLanguage.javascript,
     undefined,
     UndoModes.AUTO_UNDO,undoName);
}

Paragraph.prototype.lineWidth = function() {
    return (this.characters.lastItem().horizontalOffset - this.characters.firstItem().horizontalOffset);
}

MasterSpread.prototype.findItemByID = function(id) {
    var result = undefined;
    try{
          result = this.pageItems.itemByID(Number(id));
            result.id;
        }catch(e){result=undefined;}
    return result;
}

Spread.prototype.findItemByID = function(id) {
    var result = undefined;
    try{
          result = this.pageItems.itemByID(Number(id));
            result.id;
        }catch(e){result=undefined;}
    return result;
}

MasterSpread.prototype.findByTypeAndSourceId = function(type, id) {
    //maintain cache
    var allPI = this.allPageItems;
    
    for(var i=0;i<allPI.length;i++)
    try{
        var currItem = allPI[i];
            if(currItem.extractLabel("specctrType")==type.toString() && currItem.extractLabel("specctrSourceId")==id.toString()) return currItem;
    }catch(e){}
    
    return false;
}

Spread.prototype.findByTypeAndSourceId = function(type,id) {
    //maintain cache
    var allPI = this.allPageItems;
    
    for(var i=0;i<allPI.length;i++)
    try{
        var currItem = allPI[i];
        if(currItem.extractLabel("specctrType")==type.toString() && currItem.extractLabel("specctrSourceId")==id.toString()) return currItem;
    }catch(e){}
    
     return false;
}

MasterSpread.prototype.removeBySourceIdAndTypes=function(id,types) {
    var allPI = this.allPageItems;
    for(var i=allPI.length-1;i>=0;i--)
    try{
        var currItem = allPI[i];
            if(currItem.extractLabel("specctrSourceId")==id.toString() && types[currItem.extractLabel("specctrType")]) currItem.remove(); 
    }catch(e){}
      return false;
}

Spread.prototype.removeBySourceIdAndTypes=function(id,types) {
    var allPI = this.allPageItems;
    for(var i=allPI.length-1;i>=0;i--)
    try{
        var currItem = allPI[i];
            if(currItem.extractLabel("specctrSourceId")==id.toString() && types[currItem.extractLabel("specctrType")]) currItem.remove(); 
    }catch(e){}
      return false;
}

MasterSpread.prototype.removeDoubleSpacingSpecBySourceIdsAndTypes=function(idA,idB,types) {
    var allPI = this.allPageItems;
    
    for(var i=allPI.length-1;i>=0;i--)
    try{
        var currItem = allPI[i];
            if(types[currItem.extractLabel("specctrType")]) {
                var sourceIds = eval(currItem.extractLabel("specctrSourceIds"));

                if(sourceIds.contains(idA) && sourceIds.contains(idB)) 
                    currItem.remove();
            }
             
    }catch(e){}
    
    return false;
}

Spread.prototype.removeDoubleSpacingSpecBySourceIdsAndTypes=function(idA,idB,types) {
    var allPI = this.allPageItems;
    
    for(var i=allPI.length-1;i>=0;i--)
    try{
        var currItem = allPI[i];
            if(types[currItem.extractLabel("specctrType")])  {
                var sourceIds = eval(currItem.extractLabel("specctrSourceIds"));

                if(sourceIds.contains(idA) && sourceIds.contains(idB)) 
                        currItem.remove();
            }
             
    }catch(e){}
    
    return false;
}

MasterSpread.prototype.findRelatedBySourceId = function(id) {
    var allPI = this.allPageItems;
    var result = ({});
    
    for(var i=allPI.length-1;i>=0;i--)
    try{
        var currItem = allPI[i];
            if(currItem.extractLabel("specctrSourceId")==id.toString()) result[currItem.extractLabel("specctrType")]=currItem;
    }catch(e){}
    
    return result;
}

Spread.prototype.findRelatedBySourceId = function(id) {
    var allPI = this.allPageItems;
    var result = ({});
    
    for(var i=allPI.length-1;i>=0;i--)
    try{
        var currItem = allPI[i];
            if(currItem.extractLabel("specctrSourceId")==id.toString()) result[currItem.extractLabel("specctrType")]=currItem;
    }catch(e){}
    
    return result;
}

MasterSpread.prototype.existsBySourceIdAndTypes=function(id,types) {
    var allPI = this.allPageItems;

    for(var i=allPI.length-1;i>=0;i--)
    try{
        var currItem = allPI[i];
        if(currItem.extractLabel("specctrSourceId")==id.toString() && types[currItem.extractLabel("specctrType")]) 
            return true; 
    }catch(e){}
    
    return false;
}

Spread.prototype.existsBySourceIdAndTypes=function(id,types) {
    var allPI = this.allPageItems;

    for(var i=allPI.length-1;i>=0;i--)
    try{
        var currItem = allPI[i];
        if(currItem.extractLabel("specctrSourceId")==id.toString() && types[currItem.extractLabel("specctrType")]) 
            return true; 
    }catch(e){}
    
    return false;
}

MasterSpread.prototype.existDoubleSpacingSpecBySourceIdAndTypes=function(id,types) {
    var allPI = this.allPageItems;
    var resultIds = [];
    for(var i=allPI.length-1;i>=0;i--)
    try{
        var currItem = allPI[i];
        if(types[currItem.extractLabel("specctrType")])  {
            var sourceIds = eval(currItem.extractLabel("specctrSourceIds"));
            
            if(sourceIds.contains(id.toString())) {
                for(var s=0;s<sourceIds.length;s++) {
                    if(sourceIds[s]!=id.toString()) 
                        resultIds.pushOnce(this.findItemByID(sourceIds[s]));
                }
            }
        }
    }catch(e){}

    return resultIds;
}

Spread.prototype.existDoubleSpacingSpecBySourceIdAndTypes=function(id,types) {
    var allPI = this.allPageItems;
    var resultIds = [];
    
    for(var i=allPI.length-1;i>=0;i--)
    try{
        var currItem = allPI[i];
        if(types[currItem.extractLabel("specctrType")]) {
            var sourceIds = eval(currItem.extractLabel("specctrSourceIds"));
            if(sourceIds.contains(id.toString()))
                for(var s=0;s<sourceIds.length;s++) {
                    if(sourceIds[s]!=id.toString())
                     resultIds.pushOnce(this.findItemByID(sourceIds[s]));
                }
            }
             
    }catch(e){}

      return resultIds;
}

Page.prototype.getCoords=function() {
    var result=new Object();
    result.x1=this.bounds[1];
    result.y1=this.bounds[0];
    result.x2=this.bounds[3];
    result.y2=this.bounds[2];
    result.centerX=result.x2/2+result.x1/2;
    result.centerY=result.y2/2+result.y1/2;
    result.width = result.x2 - result.x1;
    result.height = result.y2 - result.y1;
    
    return result;
}

Array.prototype.joinNames=function() {
	return "|"+this.join("|")+"|";
}            

Array.prototype.contains=function(obj) {
    if(this.joinNames("|").indexOf("|"+obj.toString()+"|")!=-1)
        return true;

    return false;
}

Array.prototype.pushOnce = function(obj) {
    for(var i=0;i<this.length;i++)
        if(this[i]==obj) return;
    
    this.push(obj);    
}

	var model;
    var armPartLength=40;
    var cssText = "";
    var cssBodyText = "";
    var cssTags = ["h1","h2","h3","h4","h5","h6","body"];
    var cssTagsObj = ({});
    for(var i=0;i<cssTags.length;i++)
    {
        cssTagsObj[cssTags[i]] = true;
    }

     var spacingSingleSpecsObj = ({
                    specctrSpacingSingleTopText:true,
                    specctrSpacingSingleTopLine:true,
                   specctrSpacingSingleBottomText:true,
                    specctrSpacingSingleBottomLine:true,
                     specctrSpacingSingleLeftText:true,
                    specctrSpacingSingleLeftLine:true,
                    specctrSpacingSingleRightText:true,
                    specctrSpacingSingleRightLine:true,
                   specctrSpacingSingleGroup:true,
                });
            
      var spacingDoubleSpecsObj = ({
                    specctrSpacingDoubleText:true,
                    specctrSpacingDoubleLine:true,
                   specctrSpacingDoubleGroup:true,
                });
            
      var dimSpecsObj = ({
                    specctrDimensionsWidthText:true,
                    specctrDimensionsWidthLine:true,
                  specctrDimensionsGroup:true,
                     specctrDimensionsHeightText:true,
                    specctrDimensionsHeightLine:true,
                });
            
       var coordSpecsObj = ({
                    specctrCoordsText:true,
                    specctrCoordsXline:true,
                    specctrCoordsYline:true,
                  specctrCoordsGroup:true,
                });     

    var heightChoice = {"Left" : 1 , "Right" : 2, "Center" : 3};
	var widthChoice = {"Top" : 1 , "Bottom" : 2, "Center" : 3};
	
    //illustrator measurements are always in pt
    //in indesign this needs to be set or use UnitValue(x,"pt") / "px"

//~ try{app.eventListeners.itemByName("_specctrAttrChanged").remove(); }catch(e){}
//~     app.eventListeners.add("afterSelectionAttributeChanged", $.specctrId.myEventHandlerWrapper,undefined,{name:"_specctrAttrChanged"});
   
$.specctrId = {
    //Get the application font's name and font's family and add event listener for indesign.
    getFontList : function() {
        //Add event listener for indesign.
        app.addEventListener("afterSelectionAttributeChanged", $.specctrId.myEventHandlerWrapper, false);

        // Set Indesign default units.
        with(app.scriptPreferences) {
            measurementUnit = MeasurementUnits.POINTS;
        }

        //Get application font info.
        var font = app.fonts.everyItem().getElements().slice(0);
        var appFontLength = font.length;
        var result = [];

        //Set the spec text properties.
        for (var i = 0; i < appFontLength; i++) {
            var currFont = font[i];
            if (currFont.fontStyleName == "Regular") {
                var object = {};
                object.label = currFont.fontFamily;
                object.font = currFont.fullName;
                result.push(object);
            }
        }

        return JSON.stringify(result); 
    },

    //Get the updated value of UI's component from html file.
    setModel : function(currModel) {
        model = JSON.parse(currModel);
    },

    createCanvasBorder : function(){
        app.doUndoableScript (this.createCanvas(), "Create Canvas Border");
    },

    //Export  the document as jpg.
    exportToJPEG : function (filePath) {
        if ( app.documents.length > 0 ) {
            var fileSpec = new File(filePath);
            app.activeDocument.exportFile(ExportFormat.jpg, fileSpec);
        }
    },

    //Get the details of each page and export each one as jpeg.
    SetDocumentImgDetails : function (docImageArray, filePath) {
        try {
            var doc = app.activeDocument;
            var abLength = doc.pages.length;
            
            for (i = 0; i < abLength; i++) {
                var obj = {};
                this.setImageDataIntoObject(obj, doc, doc.pages[i], i);
                docImageArray.push(obj);
           }
        
            //Exports each page individually by default.
           this.exportToJPEG(filePath +"/"+doc.name.toLowerCase().replace(".indd",'')+"."+obj.ext);

        } catch (e) {
            alert(e);
        }
    },
    
    //Create object of the page info.
    setImageDataIntoObject : function (obj, doc, page, index) {
        var abName = page.name;
        
        if(index == 0)
            abName = doc.name.toLowerCase().replace(".indd",'');
        else 
            abName = doc.name.toLowerCase().replace(".indd",'')+ page.name;

        var bounds = page.bounds;
        obj.image_data = "";
        obj.name = abName;
        obj.width = (bounds[2]-bounds[0]) + "";
        obj.height = (bounds[3]-bounds[1]) + "";
        obj.is_artboard = true;
        obj.layer_id = index+1;
        obj.ext = "jpg";
    },

    //Export the specs into styles.
    exportCss : function(filePath) {
        //css specs easily get unsynced, it would be better to create them on exporting
        var isExportedSuccessfully = false;
        var rltvFontSize = 16;
        if(model.baseFontSize != 0)
            rltvFontSize = model.baseFontSize;
        
        if(model.specInEM)
            cssBodyText = "body {\r\tfont-size: " + Math.round(10000 / 16 * rltvFontSize) / 100 + "%;\r}\r\r";
        
        /*The reason that some aren’t exported with a “.” is that we figured that most of the text elements should be global <html> tags not classes. For example <h1> <h2> or <body> tags. (http://www.w3schools.com/tags/tag_hn.asp)
            Maybe you can help us write the logic for a system that works like this: if the title of the layer is : h1, h2, h3, h4, h5, h6 , or body then don’t add the  “.” to make it into a global tag. All other layer titles should be exported as classes with a “.” */
        
        try {
            var styleText = cssBodyText;            //Add the body text at the top of css file.
            var docRef = app.activeDocument;
            var allItems =  docRef.allPageItems;
            var cssItems = ({textItems:[],shapeItems:[],otherItems:[]});
            
            for(var i=0;i<allItems.length;i++) {
                var currItem = allItems[i];
                if(!(currItem.extractLabel("css_ranges") || 
                currItem.extractLabel("css_coords") ||
                currItem.extractLabel("css_dimensions") ||
                currItem.extractLabel("css_main")))
                continue;
                
                try{
                    currItem.parentStory; 
                    cssItems.textItems.push(currItem);
                }catch(e){cssItems.shapeItems.push(currItem);}
            }

            allItems = cssItems.textItems.concat(cssItems.shapeItems);
        
            for(var i=0;i<allItems.length;i++) {
                var currItem = allItems[i];
                var currName = currItem.name;
                if(!currName) currName = currItem.constructor.name.toLowerCase();
                
                styleText+="\r";
                if(!cssTagsObj[currName.toLowerCase()]) styleText+=".";
                
                styleText+=currName+"{\r";
                
                var cssMain = currItem.extractLabel("css_main");
                var cssDims = currItem.extractLabel("css_dimensions");
                var cssCoords = currItem.extractLabel("css_coords");
                var cssRanges = currItem.extractLabel("css_ranges");
                
                try{
                    if(cssRanges) cssRanges = eval(cssRanges)[0];
                    styleText+=cssRanges+"\r";
                }catch(e){}
                
                if(cssMain) styleText+=cssMain+"\r";
                if(cssDims) styleText+=cssDims+"\r";
                if(cssCoords) styleText+=cssCoords+"\r";
                styleText+="}\r";
            }
        
            if(styleText == "") {
                alert("Unable to export the specs!");
                return isExportedSuccessfully;
            }
        
            var docId = this.getStoredIdInDoc("DOC_ID");
            var projId = this.getStoredIdInDoc("PROJ_ID");
            var cssInfo = {
                document_name: docRef.name,
                document_id:  docId,
                project_id: projId,
                text: styleText
            };
            
            if(model.cloudOption == "export") {
                 //Set data for each artboard and export each artboard individually otherwise eport the doc.
                var docImageArray = [];
                this.SetDocumentImgDetails(docImageArray, filePath);
                cssInfo.document_images = docImageArray;
                return JSON.stringify(cssInfo);
            } else {
                //Create the file and export it.
                var cssFile = "";
                var cssFilePath = "";
                
                var documentPath = "";
                try{documentPath = docRef.filePath;}catch(e){}        //Get the path of the current ai file.
                cssFilePath = Folder.desktop+"/Styles.css";
            
                if(documentPath != "")                          //If source file's path exist then change the path of css file to the location of that file.
                    cssFilePath = documentPath + "/Styles.css";
            
                cssFile = File(cssFilePath);
            
                if(cssFile.exists) {
                    var replaceFileFlag = confirm("Styles.css already exists in this location.\rDo you want to replace it?", true, "Specctr");
                    if(!replaceFileFlag)
                        return isExportedSuccessfully;
                }
            
                //Create and write the css file.
                if(cssFile) {
                    cssFile.open("w");
                    cssFile.write(styleText);
                    cssFile.close;
                
                    if(replaceFileFlag)
                        alert("Styles.css is exported.");
                    else 
                        alert("Styles.css is exported to " + cssFilePath);
                } else {
                    alert("Unable to export the specs!");
                    return isExportedSuccessfully;
                }
            
                isExportedSuccessfully = true;
            }
        } catch(e) {
            alert(e);
        }
        
        return isExportedSuccessfully;
    },

    getProjectIdOfDoc : function() {
        if(app.documents.length == 0)
            return "false";
    
        var projectId = this.getStoredIdInDoc("PROJ_ID");
        if(projectId == null)
            return "";
 
        return projectId;
    },
    
    setDocId : function(docId, projectId) {
        var docRef = app.activeDocument;
        docRef.insertLabel("DOC_ID", docId);
        docRef.insertLabel("PROJ_ID", projectId);
    },

    getStoredIdInDoc : function(idString) {
        return  app.activeDocument.extractLabel(idString);
    },

    createCanvas : function(){
        try {
            if(!app.documents.length)  return;
            var activeLayer = app.activeDocument.activeLayer;
            var currPage  = this.getCurrentPage();
            var border = this.canvasBorder();

            if(!border) {
                var targetLayer = this.legendLayer();
                targetLayer.locked = false;
                currPage.rectangles.add(targetLayer,LocationOptions.AT_END,undefined,{
                geometricBounds: currPage.bounds,
                strokeTint: 100,
                strokeColor: this.addIfNotExists([200,200,200]),
                strokeType: "$ID/Dashed",
                strokeDashAndGap: [12,12],
                locked: true,
                strokeWeight: model.armWeight,
                fillColor: "None",
                name: "Specctr Canvas Border " + currPage.name,
                });
                targetLayer.locked = true;
            }

            //expand 
            currPage.resize(CoordinateSpaces.INNER_COORDINATES,AnchorPoint.CENTER_ANCHOR, 
                                        ResizeMethods.ADDING_CURRENT_DIMENSIONS_TO,
                                            [model.canvasExpandSize*2,model.canvasExpandSize*2]);

            app.activeDocument.activeLayer = activeLayer;
        } catch (e) {
            alert(e);
        }
     },

    canvasBorder : function() {
        var result=undefined;

        try {
            var currPage  = this.getCurrentPage();
            result = currPage.rectangles.itemByName("Specctr Canvas Border " + currPage.name);
            result.id;
        } catch(e) {
            result=undefined;
        }

        return result;
    },

    canvasBounds : function() {
        var result = ({});
        var border = this.canvasBorder();
        if(border)  {
            var bounds = border.geometricBounds;
            result.x1 = bounds[1];
            result.x2 = bounds[3];
            result.y1 = bounds[0];
            result.y2 = bounds[2]; 
            return result;
        }
        
        var currPage  = this.getCurrentPage();
        var bounds = currPage.bounds;
        result.x1 = bounds[1];
        result.x2 = bounds[3];
        result.y1 = bounds[0];
        result.y2 = bounds[2];

        return result;		
    },

    createCoordinateSpecs : function() {
        try {
        if(!app.selection.length) return;
        this.removeListener();
        app.doUndoableScript (function(){
            var myItems = app.selection;
            for(var i = 0; i < myItems.length; i++)
                $.specctrId.createCoordinateSpecsForItem(myItems[i]);
            }, "Create Coordinate Specs");
        }catch(e) {
            alert(e);
        }
    },

    createCoordinateSpecsForItem : function(pageItem,codeInvoked,existingSpecs) {
        var activeLayer = app.activeDocument.activeLayer;
        var currPage = this.getCurrentPage();
        var currSpread = currPage.parent;
        
        //remove old specs
        if(!existingSpecs)
            currSpread.removeBySourceIdAndTypes(pageItem.id,coordSpecsObj);
        else   
            for(var prop in coordSpecsObj)
                try {
                    existingSpecs[prop].remove();
                } catch(e) {}

        var settings = ({coordinateCellNumber : model.coordinateCellNumber, specInPrcntg : model.specInPrcntg});

        if(codeInvoked)
         try{
             settings = eval(pageItem.extractLabel("specctrCoordsSpecSettings"));
         }catch(e){}

        try {

        var legendLayer = this.legendCoordinatesLayer();                    //Create the 'Coordinates' layer group.
        var itemCoordsObj = this.itemCoords(pageItem);
        var spacing = 10 + model.armWeight;
        var relHeight = parseFloat(model.rltvHeight);
        var relWidth = parseFloat(model.rltvWidth);

        if(settings.specInPrcntg) {
            if(!relHeight || isNaN(relHeight) || !relWidth || isNaN(relWidth)) {
                var pageCoords = currPage.getCoords ();
                relHeight = pageCoords.height;
                relWidth = pageCoords.width;
            }
        }

        var top = this.pointsToUnitsString(itemCoordsObj.y1, null, settings.specInPrcntg, relHeight);
        var left = this.pointsToUnitsString(itemCoordsObj.x1, null, settings.specInPrcntg, relWidth);
        var bottom = this.pointsToUnitsString(itemCoordsObj.y2, null, settings.specInPrcntg, relHeight);
        var right = this.pointsToUnitsString(itemCoordsObj.x2, null, settings.specInPrcntg, relWidth);
           
        var styleText = "\tleft: " + left + ";\r\ttop: " + top + ";" + ";\r\tright: " + right + ";" + ";\r\tbottom: " + bottom + ";";
        pageItem.insertLabel("css_coords", styleText);
        var newColor = this.legendColorSpacing();
        
        if(settings.coordinateCellNumber == 0) {    //left top.

            var horizontalLineY = itemCoordsObj.y1 - model.armWeight / 2;
            var xLine = currPage.graphicLines.add(legendLayer, undefined, undefined,
                                    {strokeWeight:model.armWeight, fillColor:"None", strokeColor:newColor , 
                                        geometricBounds:[horizontalLineY,itemCoordsObj.x1 - spacing - model.armWeight / 2,
                                                horizontalLineY,itemCoordsObj.x1 + spacing + model.armWeight / 2]});
            
            var yLine = currPage.graphicLines.add(legendLayer, undefined, undefined,
                                    {strokeWeight:model.armWeight, fillColor:"None", strokeColor:newColor , 
                                        geometricBounds:[itemCoordsObj.y1 - spacing - model.armWeight / 2,
                                            itemCoordsObj.x1 - model.armWeight / 2,itemCoordsObj.y1 + spacing + model.armWeight / 2,
                                                itemCoordsObj.x1 - model.armWeight / 2]});

            var gb = [itemCoordsObj.y1 - 0.5*spacing,itemCoordsObj.x1 - 0.5*spacing,
                                itemCoordsObj.y1 + spacing +model.legendFontSize*2,itemCoordsObj.x1 +100];
                                
            var xValue = left, yValue = top;
            var xTextPos = itemCoordsObj.x1 - 100 + spacing + 2 * model.armWeight;
            var yTextPos = itemCoordsObj.y1 - model.legendFontSize - model.armWeight;
                            
        } else if (settings.coordinateCellNumber == 1) {   // right top
            
            horizontalLineY = itemCoordsObj.y1 - model.armWeight / 2;
            xLine = currPage.graphicLines.add(legendLayer, undefined, undefined,
                                    {strokeWeight:model.armWeight, fillColor:"None", strokeColor:newColor , 
                                        geometricBounds:[horizontalLineY,itemCoordsObj.x2 - spacing - model.armWeight / 2,
                                                horizontalLineY,itemCoordsObj.x2 + spacing + model.armWeight / 2]});
            
            yLine = currPage.graphicLines.add(legendLayer, undefined, undefined,
                                    {strokeWeight:model.armWeight, fillColor:"None", strokeColor:newColor , 
                                        geometricBounds:[itemCoordsObj.y1 - spacing - model.armWeight / 2,
                                            itemCoordsObj.x2 - model.armWeight / 2,itemCoordsObj.y1 + spacing + model.armWeight / 2,
                                                itemCoordsObj.x2 - model.armWeight / 2]});

            gb = [itemCoordsObj.y1 - 0.5*spacing,itemCoordsObj.x2 - 0.5*spacing,
                                itemCoordsObj.y1 + spacing +model.legendFontSize*2,itemCoordsObj.x2 +100];
                                
            xValue = right, yValue = top;
            xTextPos = itemCoordsObj.x2 + spacing;
            yTextPos = itemCoordsObj.y1 - model.legendFontSize - model.armWeight;
            
        }  else if (settings.coordinateCellNumber == 2) {   // right bottom
            
            horizontalLineY = itemCoordsObj.y2 - model.armWeight / 2;
            xLine = currPage.graphicLines.add(legendLayer, undefined, undefined,
                                    {strokeWeight:model.armWeight, fillColor:"None", strokeColor:newColor , 
                                        geometricBounds:[horizontalLineY,itemCoordsObj.x2 - spacing - model.armWeight / 2,
                                                horizontalLineY,itemCoordsObj.x2 + spacing + model.armWeight / 2]});
            
            yLine = currPage.graphicLines.add(legendLayer, undefined, undefined,
                                    {strokeWeight:model.armWeight, fillColor:"None", strokeColor:newColor , 
                                        geometricBounds:[itemCoordsObj.y2 - spacing - model.armWeight / 2,
                                            itemCoordsObj.x2 - model.armWeight / 2,itemCoordsObj.y2 + spacing + model.armWeight / 2,
                                                itemCoordsObj.x2 - model.armWeight / 2]});

            gb = [itemCoordsObj.y2 - 0.5*spacing,itemCoordsObj.x2 - 0.5*spacing,
                                itemCoordsObj.y2 + spacing +model.legendFontSize*2,itemCoordsObj.x2 +100];
                                
            xValue = right, yValue = bottom;
            xTextPos = itemCoordsObj.x2 + spacing;
            yTextPos = itemCoordsObj.y2 + spacing;
            
        } else if (settings.coordinateCellNumber == 3) {   // left bottom
            
            horizontalLineY = itemCoordsObj.y2 - model.armWeight / 2;
            xLine = currPage.graphicLines.add(legendLayer, undefined, undefined,
                                    {strokeWeight:model.armWeight, fillColor:"None", strokeColor:newColor , 
                                        geometricBounds:[horizontalLineY,itemCoordsObj.x1 - spacing - model.armWeight / 2,
                                                horizontalLineY,itemCoordsObj.x1 + spacing + model.armWeight / 2]});
            
            yLine = currPage.graphicLines.add(legendLayer, undefined, undefined,
                                    {strokeWeight:model.armWeight, fillColor:"None", strokeColor:newColor , 
                                        geometricBounds:[itemCoordsObj.y2 - spacing - model.armWeight / 2,
                                            itemCoordsObj.x1 - model.armWeight / 2,itemCoordsObj.y2 + spacing + model.armWeight / 2,
                                                itemCoordsObj.x1 - model.armWeight / 2]});

            gb = [itemCoordsObj.y2 - 0.5*spacing,itemCoordsObj.x1 - 0.5*spacing,
                                itemCoordsObj.y2 + spacing +model.legendFontSize*2,itemCoordsObj.x1 +100];
                                
            xValue = left, yValue = bottom;  
            xTextPos = itemCoordsObj.x1 - 100 + spacing + 2 * model.armWeight;
            yTextPos = itemCoordsObj.y2 + spacing;
        }

        var xText = currPage.textFrames.add(legendLayer,undefined,undefined, {geometricBounds:gb});
        xText.contents = "x: " + xValue.unitPreference(model.pixelDpValue) + " y: " + yValue.unitPreference(model.pixelDpValue);
        xText.parentStory.fillColor = newColor;
        xText.parentStory.appliedFont = model.legendFont;
        xText.parentStory.pointSize = model.legendFontSize;
        xText.parentStory.alignToBaseline = false;
        xText.fit(FitOptions.FRAME_TO_CONTENT);
        xText.fit(FitOptions.FRAME_TO_CONTENT);
        xText.name="Specctr Coordinates Text Mark";

        var xTextCoords = this.itemCoords(xText);
        xText.move([xTextPos, yTextPos],undefined);
            
        var itemsGroup = currPage.groups.add([xText,yLine,xLine],legendLayer);
        itemsGroup.name="SPEC_crd_" + this.getLayerName(pageItem);
                
        xText.insertLabel("specctrSourceId",pageItem.id.toString());
        xText.insertLabel("specctrType","specctrCoordsText");

        yLine.insertLabel("specctrSourceId",pageItem.id.toString());
        yLine.insertLabel("specctrType","specctrCoordsYline");

        xLine.insertLabel("specctrSourceId",pageItem.id.toString());
        xLine.insertLabel("specctrType","specctrCoordsXline");

        itemsGroup.insertLabel("specctrSourceId",pageItem.id.toString());
        itemsGroup.insertLabel("specctrType","specctrCoordsGroup");

        pageItem.insertLabel("specctrType","specctrSpecSource");
        pageItem.insertLabel("specctrCoords",pageItem.geometricBounds.join("|"));
        pageItem.insertLabel("specctrCoordsSpecSettings",settings.toSource());
            
        } catch(e) { alert(e); }

        app.activeDocument.activeLayer = activeLayer;
        return true;
    },

    
    createDimensionSpecs : function() {
        if(!app.selection.length) return;

        app.doUndoableScript (function(){
            var myItems = app.selection;
            for(var i = 0; i < myItems.length; i++)
                $.specctrId.createDimensionSpecsForItem(myItems[i]);
            }, "Create Dimension Specs");
    },

    createDimensionSpecsForItem : function(pageItem,codeInvoked,existingSpecs) {
        try {
        var currPage = this.getCurrentPage ();
        var currSpread = currPage.parent;
         
         //remove old specs
         if(!existingSpecs)
            currSpread.removeBySourceIdAndTypes(pageItem.id,dimSpecsObj);
        else   
            for(var prop in dimSpecsObj)
                try{
                    existingSpecs[prop].remove();
                }catch(e){}

        //if it's button invoked - we recreate spec according to current prefs
        //if it's code invoked - recreate spec as it was
        //for this keep model copy on each source
        //save model.widthPos and model.heightPos
        var settings = ({widthPos:model.widthPos, heightPos:model.heightPos,
                                    specInPrcntg:model.specInPrcntg});

        if(codeInvoked)
         try {
             settings = eval(pageItem.extractLabel("specctrDimensionsSpecSettings"));
         }catch(e){}
                
        
		if(settings.widthPos == 0 && settings.heightPos == 0) return true;
        
        //delete specs in this case
        var activeLayer = app.activeDocument.activeLayer;
        var legendLayer = this.legendDimensionsLayer();
        var itemCoordsObj= this.itemCoords(pageItem);
        var relHeight = parseFloat(model.rltvHeight);
        var relWidth = parseFloat(model.rltvWidth);
        
        if(settings.specInPrcntg) {
            if(!relHeight || isNaN(relHeight) || !relWidth || isNaN(relWidth)) {     
                var pageCoords = currPage.getCoords ();
                relHeight = pageCoords.height;
                relWidth = pageCoords.width;
            }
        }

        var widthForSpec = this.pointsToUnitsString(this.getScaledValue(itemCoordsObj.width),null, settings.specInPrcntg, relWidth);
        var heightForSpec = this.pointsToUnitsString(this.getScaledValue(itemCoordsObj.height),null, settings.specInPrcntg, relHeight);
        var styleText = "\twidth: " + widthForSpec + ";\r\theight: " + heightForSpec +";";
        pageItem.insertLabel("css_dimensions",styleText);
        
         if(model.decimalFractionValue === "fraction") {
            widthForSpec = this.decimalToFraction(widthForSpec);
            heightForSpec = this.decimalToFraction(heightForSpec);
        }
        
        var spacing = 10 + model.armWeight;
        var newColor = this.legendColorSpacing();

        var itemsGroup;
        var items = [];

        do {
            if(settings.widthPos > 0) {
                if(codeInvoked && !(existingSpecs["specctrDimensionsWidthText"] || existingSpecs["specctrDimensionsWidthLine"])) 
                    break;
                
                var lineY,textY;
                switch (settings.widthPos) {
                       case widthChoice.Bottom:
                        lineY = itemCoordsObj.y2+0.7*spacing;
                       textY = itemCoordsObj.y2+spacing+model.armWeight/2; //-textHeight
                       break;
                       case widthChoice.Center:
                       lineY = itemCoordsObj.center.y;
                       textY = itemCoordsObj.center.y+0.3*spacing+model.armWeight/2;
                       break;
                       case widthChoice.Top:
                       default:
                       lineY = itemCoordsObj.y1-0.7*spacing;
                       textY = itemCoordsObj.y1-spacing-model.armWeight/2;
                }
            	var gb = [textY,itemCoordsObj.center.x,textY+model.legendFontSize*2,itemCoordsObj.center.x+100];
                var widthText = currPage.textFrames.add(undefined,undefined,undefined, {geometricBounds:gb,itemLayer:legendLayer});
                widthText.contents = widthForSpec.unitPreference(model.pixelDpValue);
                widthText.parentStory.fillColor = newColor;
            			
                widthText.parentStory.appliedFont = model.legendFont;
                widthText.parentStory.pointSize = model.legendFontSize;
                widthText.parentStory.alignToBaseline = false;
                widthText.fit(FitOptions.FRAME_TO_CONTENT);
                widthText.recompose();
                widthText.fit(FitOptions.FRAME_TO_CONTENT);

                switch (settings.widthPos) {
                       case widthChoice.Bottom:
                       widthText.move(undefined,[-(widthText.geometricBounds[3]-widthText.geometricBounds[1])/2,textY-widthText.geometricBounds[0]])
                       break;
                       case widthChoice.Center:
                       if(settings.heightPos==heightChoice.Center)
                      widthText.move(undefined,[(widthText.geometricBounds[3]-widthText.geometricBounds[1])/2,textY-widthText.geometricBounds[0]]);
                      else widthText.move(undefined,[-(widthText.geometricBounds[3]-widthText.geometricBounds[1])/2,textY-widthText.geometricBounds[0]]);
                       break;
                       case widthChoice.Top:
                       default:
                       widthText.move(undefined,[-(widthText.geometricBounds[3]-widthText.geometricBounds[1])/2,textY-widthText.geometricBounds[2]])
                }
                widthText.name="Specctr Dimension Width Mark";
                var widthLineMain = currPage.graphicLines.add(legendLayer, undefined, undefined,{strokeWeight:model.armWeight, fillColor:"None", strokeColor:newColor , geometricBounds:[lineY,itemCoordsObj.x1,lineY,itemCoordsObj.x2]});
                var widthLineLeft = widthLineMain.paths.add({entirePath:[[itemCoordsObj.x1+model.armWeight/2,lineY-0.3*spacing],[itemCoordsObj.x1+model.armWeight/2,lineY+0.3*spacing]]});
                var widthLineRight = widthLineMain.paths.add({entirePath:[[itemCoordsObj.x2-model.armWeight/2,lineY-0.3*spacing],[itemCoordsObj.x2-model.armWeight/2,lineY+0.3*spacing]]});
                items.push(widthLineMain,widthText);
			
                widthText.insertLabel("specctrSourceId",pageItem.id.toString());
                widthText.insertLabel("specctrType","specctrDimensionWidthText");
           
                widthLineMain.insertLabel("specctrSourceId",pageItem.id.toString());
                widthLineMain.insertLabel("specctrType","specctrDimensionsWidthLine");
            }
        }while(false);
           
        do{
            if(settings.heightPos > 0) {
                if(codeInvoked && !(existingSpecs["specctrDimensionsHeightText"] || existingSpecs["specctrDimensionsHeightLine"])) 
                    break;

                var lineX,textX;
                switch (settings.heightPos) {
                       case heightChoice.Right:
                        lineX =  itemCoordsObj.x2+0.7*spacing;
                       textX= itemCoordsObj.x2+spacing+model.armWeight/2; 
                       break;
                       case heightChoice.Center:
                       lineX = itemCoordsObj.center.x;
                       textX = itemCoordsObj.center.x-0.3*spacing-model.armWeight/2;
                       break;
                       case heightChoice.Left:
                       default:
                       lineX = itemCoordsObj.x1-0.7*spacing;
                       textX = itemCoordsObj.x1-spacing-model.armWeight/2;
                }
                var gb = [itemCoordsObj.center.y,textX,itemCoordsObj.center.y+model.legendFontSize*2,textX+100];
                var heightText = currPage.textFrames.add(undefined,undefined,undefined, {geometricBounds:gb,itemLayer:legendLayer});
                heightText.contents = heightForSpec.unitPreference(model.pixelDpValue);
                heightText.parentStory.fillColor = newColor;
                heightText.parentStory.appliedFont = model.legendFont;
                heightText.parentStory.pointSize = model.legendFontSize;
                heightText.parentStory.alignToBaseline = false;
                heightText.fit(FitOptions.FRAME_TO_CONTENT);
                heightText.fit(FitOptions.FRAME_TO_CONTENT);
          
                //shift
                switch (settings.heightPos) {
                       case heightChoice.Right:
                       heightText.move(undefined,[textX-heightText.geometricBounds[1],-(heightText.geometricBounds[2]-heightText.geometricBounds[0])/2])
                       break;
                       case heightChoice.Center:
                         if(settings.widthPos==widthChoice.Center)
                        heightText.move(undefined,[textX-heightText.geometricBounds[3],-(model.legendFontSize*4+heightText.geometricBounds[2]-heightText.geometricBounds[0])/2]);
                        else
                        heightText.move(undefined,[textX-heightText.geometricBounds[3],-(heightText.geometricBounds[2]-heightText.geometricBounds[0])/2])
                       break;
                       case heightChoice.Left:
                       default:
                        heightText.move(undefined,[textX-heightText.geometricBounds[3],-(heightText.geometricBounds[2]-heightText.geometricBounds[0])/2]);
                }
                
                heightText.name="Specctr Dimension Height Mark";
                var heightLineMain = currPage.graphicLines.add(legendLayer, undefined, undefined,{strokeWeight:model.armWeight, fillColor:"None", strokeColor:newColor , geometricBounds:[itemCoordsObj.y1,lineX,itemCoordsObj.y2,lineX]});
                var heightLineLeft = heightLineMain.paths.add({entirePath:[[lineX-0.3*spacing,itemCoordsObj.y1+model.armWeight/2],[lineX+0.3*spacing,itemCoordsObj.y1+model.armWeight/2]]});
                var heightLineRight = heightLineMain.paths.add({entirePath:[[lineX-0.3*spacing,itemCoordsObj.y2-model.armWeight/2],[lineX+0.3*spacing,itemCoordsObj.y2-model.armWeight/2]]});
                items.push(heightLineMain,heightText);
                
                heightText.insertLabel("specctrSourceId",pageItem.id.toString());
                heightText.insertLabel("specctrType","specctrDimensionHeightText");
           
                heightLineMain.insertLabel("specctrSourceId",pageItem.id.toString());
                heightLineMain.insertLabel("specctrType","specctrDimensionsHeightLine");
            }
        }while(false);
    
        if(items.length) {
            itemsGroup = currPage.groups.add(items,legendLayer);
            itemsGroup.name="SPEC_wh_" + this.getLayerName(pageItem);
            itemsGroup.insertLabel("specctrSourceId",pageItem.id.toString());
            itemsGroup.insertLabel("specctrType","specctrDimensionsGroup");
           
           pageItem.insertLabel("specctrType","specctrSpecSource");
           pageItem.insertLabel("specctrCoords",pageItem.geometricBounds.join("|"));
           pageItem.insertLabel("specctrDimensionsSpecSettings",settings.toSource())
        }
        app.activeDocument.activeLayer = activeLayer;
        return true; 
        } catch (e) {
            alert(e);
        }
    },

    createSpacingVerticalSpec : function(x,y1,y2,settings) {
        //check max/min y
        var legendLayer = this.legendSpacingLayer();
        var spacing = 10 + model.armWeight;
        var currPage = this.getCurrentPage ();
        var newColor = this.legendColorSpacing();
        
        if(!settings) settings = ({specInPrcntg:model.specInPrcntg});

        var relHeight = parseFloat(model.rltvHeight);
        if(settings.specInPrcntg) {
            if(!relHeight || isNaN(relHeight)) {     
                var pageCoords = currPage.getCoords ();
                relHeight = pageCoords.height;
                }
        }

       var yLine = currPage.graphicLines.add(legendLayer, undefined, undefined,{strokeWeight:model.armWeight, fillColor:"None", strokeColor:newColor , geometricBounds:[y1,x,y2,x]});
       var topLine = yLine.paths.add({entirePath:[[x-0.3*spacing,y1+model.armWeight/2],[x+0.3*spacing,y1+model.armWeight/2]]});
       var bottomLine = yLine.paths.add({entirePath:[[x-0.3*spacing,y2-model.armWeight/2],[x+0.3*spacing,y2-model.armWeight/2]]});
       var gb = [y1/2+y2/2,x,y1/2+y2/2+model.legendFontSize+100,x+100];

        var ySpacing = this.pointsToUnitsString(this.getScaledValue(Math.abs(y2-y1)),null, settings.specInPrcntg, relHeight);

        if(model.decimalFractionValue === "fraction")
                ySpacing = this.decimalToFraction(ySpacing);
                
        var yText = currPage.textFrames.add(undefined,undefined,undefined,{geometricBounds:gb});
        yText.contents = ySpacing.unitPreference(model.pixelDpValue);
        yText.parentStory.fillColor = newColor;
        yText.parentStory.appliedFont = model.legendFont;
        yText.parentStory.pointSize = model.legendFontSize;
        yText.parentStory.alignToBaseline = false;
        yText.fit(FitOptions.FRAME_TO_CONTENT);
        yText.fit(FitOptions.FRAME_TO_CONTENT);
          
        //we shift it by width and by whole height
        yText.move(undefined,[-(yText.geometricBounds[3]-yText.geometricBounds[1]+0.3*spacing),-(yText.geometricBounds[2]-yText.geometricBounds[0])/2])
        yText.name="Specctr Spacing Vertical Text Mark";

        return [yText,yLine];
    },

    createSpacingHorizontalSpec : function(y,x1,x2,settings) {
        //check max/min x
        var legendLayer = this.legendSpacingLayer();
        var spacing = 10 + model.armWeight;
        var currPage = this.getCurrentPage ();
        var newColor = this.legendColorSpacing();

        if(!settings) settings = ({specInPrcntg:model.specInPrcntg});
        var relWidth = parseFloat(model.rltvWidth);

        if(settings.specInPrcntg) {
            if(!relWidth || isNaN(relWidth)) {     
                var pageCoords = currPage.getCoords ();
                relWidth = pageCoords.width;
            }
        }

        var xLine = currPage.graphicLines.add(legendLayer, undefined, undefined,{strokeWeight:model.armWeight, fillColor:"None", strokeColor:newColor , geometricBounds:[y,x1,y,x2]});
        var leftLine = xLine.paths.add({entirePath:[[x1+model.armWeight/2,y+0.3*spacing],[x1+model.armWeight/2,y-0.3*spacing]]});
        var rightLine = xLine.paths.add({entirePath:[[x2-model.armWeight/2,y+0.3*spacing],[x2-model.armWeight/2,y-0.3*spacing]]});
        
        var gb = [y,x1/2+x2/2,y+model.legendFontSize*2,x1/2+x2/2+100];
        
        var xSpacing = this.pointsToUnitsString(this.getScaledValue(Math.abs(x2-x1)),null, settings.specInPrcntg, relWidth)
        if(model.decimalFractionValue === "fraction")
                xSpacing = this.decimalToFraction(xSpacing);
        
        var xText = currPage.textFrames.add(undefined,undefined,undefined,{geometricBounds:gb});
        xText.contents = xSpacing.unitPreference(model.pixelDpValue);
        xText.parentStory.fillColor = newColor;
        xText.parentStory.appliedFont = model.legendFont;
        xText.parentStory.pointSize = model.legendFontSize;
        xText.parentStory.alignToBaseline = false;
        xText.fit(FitOptions.FRAME_TO_CONTENT);
        xText.fit(FitOptions.FRAME_TO_CONTENT);
        
        //we shift it by half of width and by whole height
        xText.move(undefined,[-(xText.geometricBounds[3]-xText.geometricBounds[1])/2,-(xText.geometricBounds[2]-xText.geometricBounds[0]+0.3*spacing)])
        xText.name="Specctr Spacing Horizontal Text Mark";

        return [xText,xLine];
    },

    createSpacingSpecs : function() {
        if(!app.selection.length || app.selection.length>2) return;
        if(app.selection.length == 1) {
            app.doUndoableScript (function(){ 
                $.specctrId.createSpacingSpecsForItem(app.selection[0]);
                }, "Create Spacing Specs"); 
            return;
        }
        if(app.selection.length == 2) {
            app.doUndoableScript (function(){
                $.specctrId.createSpacingSpecsForItems(app.selection[0],app.selection[1]);
                }, "Create Spacing Specs"); 
        }
    },

    createSpacingSpecsForItems : function(aItem,bItem,codeInvoked,existingSpecs) {		
        try {
        var currPage = this.getCurrentPage ();
        var currSpread = currPage.parent;

        //this spec is between 2 items
        //i.e. 2 sources
        //here - save if we found spec or not
        //if not found and it's code invoked - we can return
        //source ids saved only to spec itself. delete spec and this link is lost
        //tmp - rework it
        currSpread.removeDoubleSpacingSpecBySourceIdsAndTypes(aItem.id,bItem.id,spacingDoubleSpecsObj);
        var activeLayer =  app.activeDocument.activeLayer;               
        var legendLayer = this.legendSpacingLayer();
        var spacing = 10 + model.armWeight;
        var newColor = this.legendColorSpacing(); 

        var itemsGroup;
        var items = [];

        var aItemBounds = this.itemCoords(aItem);
        var bItemBounds = this.itemCoords(bItem);

        var isOverlapped = false;
        //check overlap
        //(RectA.X1 < RectB.X2 && RectA.X2 > RectB.X1 &&
        //    RectA.Y1 < RectB.Y2 && RectA.Y2 > RectB.Y1)

        if (aItemBounds.x1<bItemBounds.x2 && aItemBounds.x2>bItemBounds.x1 &&
        aItemBounds.y1<bItemBounds.y2 && aItemBounds.y2>bItemBounds.y1) {
            isOverlapped = true;
        }
        
        //check if there's vertical perpendicular
        if (aItemBounds.x1<bItemBounds.x2 && aItemBounds.x2>bItemBounds.x1) {
            var y1;
            var y2;
            var x= Math.max(aItemBounds.x1,bItemBounds.x1)/2+Math.min(aItemBounds.x2,bItemBounds.x2)/2;

            if(!isOverlapped) {
                if(aItemBounds.y1<bItemBounds.y1) { //? <
                    y1=aItemBounds.y2;
                    y2=bItemBounds.y1;
                } else {
                    y1=bItemBounds.y2;
                    y2=aItemBounds.y1;
                }
                items = items.concat(this.createSpacingVerticalSpec(x,y1,y2) );
            } else { //overlap, vertical specs
                if(model.spaceTop) {
                    if(aItemBounds.y1<bItemBounds.y1) //? <
                        {y1=aItemBounds.y1;y2=bItemBounds.y1}
                    else 
                        {y1=bItemBounds.y1;y2=aItemBounds.y1}
                    items = items.concat(this.createSpacingVerticalSpec(x,y1,y2) );
                }
                
                if(model.spaceBottom) {
                     if(aItemBounds.y2<bItemBounds.y2) //? <
                        {y1=aItemBounds.y2;y2=bItemBounds.y2}
                    else 
                        {y1=bItemBounds.y2;y2=aItemBounds.y2}
                    items = items.concat(this.createSpacingVerticalSpec(x,y1,y2) );
                }
            }
        }

        //check if there's horizontal perpendicular
        if (aItemBounds.y2>bItemBounds.y1 && aItemBounds.y1<bItemBounds.y2) {
            var y= Math.max(aItemBounds.y1,bItemBounds.y1)/2+Math.min(aItemBounds.y2,bItemBounds.y2)/2;
            var x1;
            var x2;

            if(!isOverlapped) {
                if(aItemBounds.x1>bItemBounds.x1) {
                    x2=aItemBounds.x1;x1=bItemBounds.x2; 
                } else {
                    x2=bItemBounds.x1;x1=aItemBounds.x2; 
                }
                items = items.concat(this.createSpacingHorizontalSpec(y,x1,x2) );
            } else { //overlap, horizontal specs
                
                if(model.spaceLeft) {
                    if(aItemBounds.x1>bItemBounds.x1) {
                    x1=aItemBounds.x1;x2=bItemBounds.x1; 
                    } else {
                    x1=bItemBounds.x1;x2=aItemBounds.x1; 
                    }
                    items = items.concat(this.createSpacingHorizontalSpec(y,x1,x2) );
                }
           
                if(model.spaceRight) {
                    if(aItemBounds.x2>bItemBounds.x2) {
                        x1=aItemBounds.x2;x2=bItemBounds.x2; 
                    } else {
                        x1=bItemBounds.x2;x2=aItemBounds.x2; 
                    }
                    items = items.concat(this.createSpacingHorizontalSpec(y,x1,x2) );
                }
            }
        }
        
        //items have one spec always
        //it's [text,line]
        if(items.length) {
            var sourceIds = [aItem.id.toString(),bItem.id.toString()].toSource();
            items[0].insertLabel("specctrSourceIds",sourceIds);
            items[0].insertLabel("specctrType","specctrSpacingDoubleText");
            items[1].insertLabel("specctrSourceIds",sourceIds);
            items[1].insertLabel("specctrType","specctrSpacingDoubleLine");

            itemsGroup = currPage.groups.add(items,legendLayer);
            
            var aName = this.getLayerName(aItem).substring(0,10);
            var bName = this.getLayerName(bItem).substring(0,10);
            itemsGroup.name="SPEC_spc_"+aName+"_"+bName;

            itemsGroup.insertLabel("specctrSourceIds",sourceIds);

            itemsGroup.insertLabel("specctrType","specctrSpacingDoubleGroup");

            aItem.insertLabel("specctrType","specctrSpecSource");
            aItem.insertLabel("specctrCoords",aItem.geometricBounds.join("|"));  

            bItem.insertLabel("specctrType","specctrSpecSource");
            bItem.insertLabel("specctrCoords",bItem.geometricBounds.join("|")); 
        }
        app.activeDocument.activeLayer = activeLayer;
        return true; } catch (e) {
            alert(e);
        }
    },
		
    createSpacingSpecsForItem : function(pageItem,codeInvoked,existingSpecs) {		
        try {
            var currPage = this.getCurrentPage ();
            var currSpread = currPage.parent;
        
            //remove old specs
            if(!existingSpecs)
                currSpread.removeBySourceIdAndTypes(pageItem.id,spacingSingleSpecsObj);
            else   
                for(var prop in spacingSingleSpecsObj)
                try{
                    existingSpecs[prop].remove();
                }catch(e){}
                      
            //if it's button invoked - we recreate spec according to current prefs
            //if it's code invoked - recreate spec as it was
            //for this keep model copy on each source
            //save model.widthPos and model.heightPos
            var settings = ({
                spaceTop:model.spaceTop,
                spaceBottom:model.spaceBottom,
                spaceLeft:model.spaceLeft,
                spaceRight:model.spaceRight,
                specInPrcntg:model.specInPrcntg
            });
            
            if(codeInvoked) {
                try{
                    settings = eval(pageItem.extractLabel("specctrSpacingSingleSpecSettings"));
                }catch(e){}
            }
              
            if(!(settings.spaceTop || settings.spaceBottom || settings.spaceLeft || settings.spaceRight)) 
                return true;
            
            var activeLayer  = app.activeDocument.activeLayer;
             try{
                var pageItemBounds = this.itemCoords(pageItem);
                var artRect = this.canvasBounds();
                var spacing = 10 + model.armWeight;
                var newColor = this.legendColorSpacing();
                var itemsGroup;
                var items = [];
                var legendLayer=this.legendSpacingLayer();
                if(settings.spaceTop)
                do{
                    if(codeInvoked && !(existingSpecs["specctrSpacingSingleTopText"] || existingSpecs["specctrSpacingSingleTopLine"] )) 
                        break;
                        
                    var currSpecs = this.createSpacingVerticalSpec(pageItemBounds.center.x,artRect.y1,pageItemBounds.y1,settings);
                    currSpecs[0].insertLabel("specctrSourceId",pageItem.id.toString());
                    currSpecs[0].insertLabel("specctrType","specctrSpacingSingleTopText");
                    currSpecs[1].insertLabel("specctrSourceId",pageItem.id.toString());
                    currSpecs[1].insertLabel("specctrType","specctrSpacingSingleTopLine");
                    items = items.concat(currSpecs);
                    
                }while(false);
			
                if(settings.spaceBottom)
                do{
                    if(codeInvoked && !(existingSpecs["specctrSpacingSingleBottomText"] || existingSpecs["specctrSpacingSingleBottomLine"] )) 
                        break;
                 
                    var currSpecs = this.createSpacingVerticalSpec(pageItemBounds.center.x,pageItemBounds.y2,artRect.y2,settings);
                    currSpecs[0].insertLabel("specctrSourceId",pageItem.id.toString());
                    currSpecs[0].insertLabel("specctrType","specctrSpacingSingleBottomText");
                    currSpecs[1].insertLabel("specctrSourceId",pageItem.id.toString());
                    currSpecs[1].insertLabel("specctrType","specctrSpacingSingleBottomLine");
                    items = items.concat(currSpecs);
                    
                }while(false);	
			
                if(settings.spaceLeft)
                do{
                    if(codeInvoked && !(existingSpecs["specctrSpacingSingleLeftText"] || existingSpecs["specctrSpacingSingleLeftLine"] )) 
                        break;
                        
                    var currSpecs = this.createSpacingHorizontalSpec(pageItemBounds.center.y,artRect.x1,pageItemBounds.x1,settings) ;
                    currSpecs[0].insertLabel("specctrSourceId",pageItem.id.toString());
                    currSpecs[0].insertLabel("specctrType","specctrSpacingSingleLeftText");
                    currSpecs[1].insertLabel("specctrSourceId",pageItem.id.toString());
                    currSpecs[1].insertLabel("specctrType","specctrSpacingSingleLeftLine");
                    items = items.concat(currSpecs);
                }while(false);
			
                if(settings.spaceRight)
                do{
                    if(codeInvoked && !(existingSpecs["specctrSpacingSingleRightText"] || existingSpecs["specctrSpacingSingleRightLine"] )) 
                        break;
                    
                    var currSpecs = this.createSpacingHorizontalSpec(pageItemBounds.center.y,pageItemBounds.x2,artRect.x2,settings) ;
                    currSpecs[0].insertLabel("specctrSourceId",pageItem.id.toString());
                    currSpecs[0].insertLabel("specctrType","specctrSpacingSingleRightText");
                    currSpecs[1].insertLabel("specctrSourceId",pageItem.id.toString());
                    currSpecs[1].insertLabel("specctrType","specctrSpacingSingleRightLine");
                    items = items.concat(currSpecs);
                }while(false);
			
                if(items.length) {
                    itemsGroup = currPage.groups.add(items,legendLayer);
                    itemsGroup.name="SPEC_spc_" + this.getLayerName(pageItem);;

                    itemsGroup.insertLabel("specctrSourceId",pageItem.id.toString());
                    itemsGroup.insertLabel("specctrType","specctrSpacingSingleGroup");

                    pageItem.insertLabel("specctrType","specctrSpecSource");
                    pageItem.insertLabel("specctrCoords",pageItem.geometricBounds.join("|"));       
                    pageItem.insertLabel("specctrSpacingSingleSpecSettings",settings.toSource()); 
                }
                
            }catch(e){}
            
            app.activeDocument.activeLayer = activeLayer ;
            return true; 
            } catch(e) {
                alert(e);
            }
    },

    //Call the add note specs function for each selected art on the active artboard.
    addNoteSpecs : function(noteText) {
        if(!app.selection.length) return;
        app.doUndoableScript (function(){
            var myItems = app.selection;
            for(var i=0;i<myItems.length;i++)
                $.specctrId.addNoteSpecsForItem(myItems[i], noteText);
            }, "Create Note Specs");
    },

    addNoteSpecsForItem : function(pageItem, noteText) {
        try{
            if(noteText=="") return;
            
            var type = pageItem.extractLabel("specctrType");
            if(type=="noteItemCircle" || type=="noteArm" || type=="noteSpec" || type=="noteGroup") return false;
            
            var activeLayer  = app.activeDocument.activeLayer;
            var spacing = 10;
            var itemType = this.pageItemType(pageItem);
            var legendLayer;
            var newColor;
            
            if(itemType=="text") {
                newColor = this.legendColorType();
             } else {
                newColor = this.legendColorObject();
            }
            
            legendLayer = this.legendNoteLayer();
            var infoText = $.specctrUtility.breakStringAtLength(noteText, 30);;
            var pageItemBounds = this.itemCoords(pageItem);
            var currPage = this.getCurrentPage ();
            var currSpread = this.getCurrentSpread();
            
            var specShift = 0;
            var propertySpec =  currSpread.findByTypeAndSourceId("specctrInfoSpec",pageItem.id);
            if(propertySpec) {
                var propSGBound = propertySpec.geometricBounds;
                specShift = propSGBound[3] - propSGBound[1];
            }
            
            var specGroup = currSpread.findByTypeAndSourceId("noteGroup",pageItem.id);
            if(specGroup) specGroup.ungroup();
            
            var spec = currSpread.findByTypeAndSourceId("noteSpec",pageItem.id);
            var arm = currSpread.findByTypeAndSourceId("noteArm",pageItem.id);
            var itemCircle = currSpread.findByTypeAndSourceId("noteItemCircle",pageItem.id);

            var gb = pageItem.visibleBounds;
            gb[1] = gb[3]+spacing;
            gb[3] = gb[1]+100;

            var specExisted = true;
            if(!spec) {
                spec = currPage.textFrames.add(legendLayer,undefined,undefined,{geometricBounds:gb});
                specExisted = false;
            }
            
            spec.parentStory.contents = infoText;
            spec.parentStory.alignToBaseline = false;
            spec.parentStory.fillColor = newColor;
            spec.parentStory.appliedFont = model.legendFont;
            spec.parentStory.pointSize = model.legendFontSize;
             /*
             try{
                 app.findGrepPreferences = NothingEnum.nothing;
                app.changeGrepPreferences = NothingEnum.nothing;

                app.findGrepPreferences.findWhat = "^.+:$";
                app.changeGrepPreferences.fontStyle="Bold";
                spec.parentStory.changeGrep();
                 app.findGrepPreferences = NothingEnum.nothing;
                app.changeGrepPreferences = NothingEnum.nothing;
                 }catch(e){}
             */
            spec.fit(FitOptions.FRAME_TO_CONTENT);
            spec.recompose();
            spec.fit(FitOptions.FRAME_TO_CONTENT);
            var allParas = spec.paragraphs;

            //make all paras 1 line
            for(var i=0;i<allParas.length;i++) {
                var currPara = allParas[i];
                if (currPara.lines.length>1) {
                    var gb = spec.geometricBounds;
                    gb[3]+= gb[3]-gb[1];
                    spec.geometricBounds=gb;
                    spec.recompose();
                    i=-1;
                }
            }

            spec.fit(FitOptions.FRAME_TO_CONTENT);
            spec.recompose();
            spec.fit(FitOptions.FRAME_TO_CONTENT);

            var maxWidth = allParas[0].lineWidth();
            
            for(var i=1;i<allParas.length;i++) {
            maxWidth = Math.max(maxWidth,allParas[i].lineWidth());
            }

            var gb = spec.geometricBounds;
            gb[3]= gb[1]+maxWidth;
            spec.geometricBounds=gb;
            spec.fit(FitOptions.FRAME_TO_CONTENT);
            spec.recompose();
            spec.fit(FitOptions.FRAME_TO_CONTENT);

            spec.name="Specctr Add Notes";
            spec.insertLabel("specctrSourceId",pageItem.id.toString());
            spec.insertLabel("specctrType","noteSpec");
            pageItem.insertLabel("specctrType","specctrSpecSource");
            //pageItem.insertLabel("specctrInfoSpec",spec.id.toString());
            //positioning
            var specBounds = this.itemCoords(spec);
            var heightItem= pageItemBounds.height;
            var heightInfo = specBounds.height;
            var widthInfo = specBounds.width;

            var centerY = pageItemBounds.center.y;
            var centerX = pageItemBounds.center.x;

            var artRect = currPage.bounds;
            var artboardCenterX = artRect[1]/2+artRect[3]/2;

            if(!specExisted) {
                //center
                var specX;
                var specEdge;
                if(centerX<=artboardCenterX) {
                    spec.parentStory.justification = Justification.LEFT_ALIGN;
                    if(model.specToEdge)
                        specX=artRect[1]+spacing;
                    else
                      specX=pageItemBounds.x1-widthInfo-spacing;
                } else {
                    spec.parentStory.justification = Justification.RIGHT_ALIGN;
                    if(model.specToEdge) {
                        //spec.translate(pageItemBounds[2]-pageItemBounds[0],0);
                        specX=artRect[3]-widthInfo-spacing;
                    } else
                    specX=pageItemBounds.x2+spacing;
                }
                
                spec.move([specX,(pageItemBounds.y1+(heightItem-heightInfo)/2) + specShift/2]);	
                specBounds = this.itemCoords(spec);
            }//end if spec existed

            if(!arm) {
                var armX1;
                var armX2;
                if(centerX <= artboardCenterX) {
                    armX1 = pageItemBounds.x1;
                    armX2 = specBounds.x2;
                } else {
                      armX1 = pageItemBounds.x2;
                      armX2 = specBounds.x1;
                }
             
                var armDX = Math.abs(armX1-armX2);
                var dx = armPartLength;
                if(armX1<armX2) dx=-dx;

                if (armDX<armPartLength*1.3) {
                     arm = currPage.graphicLines.add(legendLayer, undefined, undefined,{strokeWeight:model.armWeight, fillColor:"None", strokeColor:newColor , geometricBounds:[specBounds.y1,armX2,centerY,armX1]});
                     arm.paths[0].entirePath = [[armX2,specBounds.y1],[armX1,centerY]];
                 } else {
                    arm = currPage.graphicLines.add(legendLayer, undefined, undefined,{strokeWeight:model.armWeight, fillColor:"None", strokeColor:newColor , geometricBounds:[specBounds.y1,armX2,centerY,armX1]});
                    arm.paths[0].entirePath =[[armX2,specBounds.y1],[armX2+dx,specBounds.y1],[armX1,centerY]];
                }
                
               arm.insertLabel("specctrSourceId",pageItem.id.toString());
               arm.insertLabel("specctrType","noteArm");
                //arm.locked = true;  //  pageItem.insertLabel("specctrInfoArm",arm.id.toString());
            }

            var circleD = this.circleDiameter(model.armWeight);
            if (!itemCircle) {
                
                if(centerX<=artboardCenterX) {
                    itemCircle = currPage.ovals.add(legendLayer, undefined, undefined,{strokeWeight:model.armWeight, fillColor:"Paper", strokeColor:newColor , geometricBounds:[centerY-circleD/2,pageItemBounds.x1-circleD/2,centerY+circleD/2,pageItemBounds.x1+circleD/2]});
                } else {
                    itemCircle = currPage.ovals.add(legendLayer, undefined, undefined,{strokeWeight:model.armWeight, fillColor:"Paper", strokeColor:newColor , geometricBounds:[centerY-circleD/2,pageItemBounds.x2-circleD/2,centerY+circleD/2,pageItemBounds.x2+circleD/2]});
                }
            
               itemCircle.insertLabel("specctrSourceId",pageItem.id.toString());
               itemCircle.insertLabel("specctrType","noteItemCircle");
              /*itemCircle.locked = true; pageItem.insertLabel("specctrInfoCircle",itemCircle.id.toString());
                    if(sourceItem.typename=="TextFrame")    itemCircle.filled = true; else itemCircle.filled = false; */
            }

            if(itemType=="text")  
                itemCircle.fillColor = newColor;
            else 
                itemCircle.fillColor = "Paper"; //change to none?

            arm.insertLabel("specctrCoords",arm.geometricBounds.join("|"));
            itemCircle.insertLabel("specctrCoords",itemCircle.geometricBounds.join("|"));
            spec.insertLabel("specctrCoords",spec.geometricBounds.join("|"));
            pageItem.insertLabel("specctrCoords",pageItem.geometricBounds.join("|"));
            specGroup = currPage.groups.add([spec,itemCircle,arm],legendLayer,undefined,undefined,{name: "SPEC_note_"+this.getLayerName(pageItem)});
            specGroup.insertLabel("specctrSourceId",pageItem.id.toString());
            specGroup.insertLabel("specctrType","noteGroup");

            specGroup.insertLabel("specctrCoords",specGroup.geometricBounds.join("|"));
            app.activeDocument.activeLayer = activeLayer;
            return true;
            
        } catch (e) {}
    },

    createPropertySpecs : function() {
        if(!app.selection.length) return;
        app.doUndoableScript (function(){
            var myItems = app.selection;
            for(var i=0;i<myItems.length;i++)
                $.specctrId.createPropertySpecsForItem(myItems[i]);
            }, "Create Property Specs");
    },

    createPropertySpecsForItem : function(pageItem) {
        try {
            //avoid speccing the spec
            var type = pageItem.extractLabel("specctrType");
            if(type=="specctrInfoCircle" || type=="specctrInfoArm" || type=="specctrInfoSpec" || type=="specctrInfoGroup") return false;
            
            var activeLayer  = app.activeDocument.activeLayer;
            var spacing = 10;
            var itemType = this.pageItemType(pageItem);
            var legendLayer;
            var newColor, specGroupName = "";
            
            //Check if property layers present or not.
            var bIsPropertyLayerPresent = this.IsLayerPresent("Specctr Text Properties");
            if(!bIsPropertyLayerPresent) 
                bIsPropertyLayerPresent = this.IsLayerPresent("Specctr Object Properties");
                        
            if(itemType=="text") {
                newColor = this.legendColorType();
                legendLayer = this.legendTextPropertiesLayer();
                specGroupName = "SPEC_txt_";
             } else {
                newColor = this.legendColorObject();
                legendLayer = this.legendObjectPropertiesLayer();
                specGroupName = "SPEC_shp_";
            }
            
            specGroupName += this.getLayerName(pageItem);
            var infoText = "";
            var pageItemBounds = this.itemCoords(pageItem);
            var currPage = this.getCurrentPage ();
            var currSpread = this.getCurrentSpread();
            infoText=this.getSpecsInfoForItem(pageItem,itemType);   
            
            if(infoText=="") return;
            
            var specShift = 0;
            var noteSpec =  currSpread.findByTypeAndSourceId("noteSpec",pageItem.id);
            if(noteSpec) {
                var noteSGBound = noteSpec.geometricBounds;
                specShift = noteSGBound[3] - noteSGBound[1];
            }
        
            var specGroup = currSpread.findByTypeAndSourceId("specctrInfoGroup",pageItem.id);
            var num, bIsUpdate = false;
            if(specGroup) {
                num = specGroup.extractLabel("specNumber");
                specGroup.ungroup();
                
                if(num)
                    bIsUpdate = true;
            }

            var spec = currSpread.findByTypeAndSourceId("specctrInfoSpec",pageItem.id);
            var arm = currSpread.findByTypeAndSourceId("specctrInfoArm",pageItem.id);
            var itemCircle = currSpread.findByTypeAndSourceId("specctrInfoCircle",pageItem.id);
            
            var firstBullet = currSpread.findByTypeAndSourceId("specctrFirstBullet",pageItem.id);
            var secondBullet = currSpread.findByTypeAndSourceId("specctrSecondBullet",pageItem.id);
            
            if(!num)
             num = app.activeDocument.extractLabel("specNumber");

            if(!num || !bIsPropertyLayerPresent)
                num = 1;

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

            var gb = pageItem.visibleBounds;
            gb[1] = gb[3]+spacing;
            gb[3] = gb[1]+500;

            var specExisted = true;
            if(!spec) {
                spec = currPage.textFrames.add(legendLayer,undefined,undefined,{geometricBounds:gb});
                specExisted = false;
            }
        
            spec.parentStory.contents = infoText;
            spec.parentStory.alignToBaseline = false;
            spec.parentStory.fillColor = newColor;
            spec.parentStory.appliedFont = model.legendFont;
            spec.parentStory.pointSize = model.legendFontSize;
            spec.fit(FitOptions.FRAME_TO_CONTENT);
            spec.recompose();
            spec.fit(FitOptions.FRAME_TO_CONTENT);

            var allParas = spec.paragraphs;

            //make all paras 1 line
            for(var i=0;i<allParas.length;i++) {
                var currPara = allParas[i];
                if (currPara.lines.length>1) {
                    var gb = spec.geometricBounds;
                    gb[3]+= gb[3]-gb[1];
                    spec.geometricBounds=gb;
                    spec.recompose();
                    i=-1;
                }
            }

            spec.fit(FitOptions.FRAME_TO_CONTENT);
            spec.recompose();
            spec.fit(FitOptions.FRAME_TO_CONTENT);

            var maxWidth = allParas[0].lineWidth();
            for(var i=1;i<allParas.length;i++) {
            maxWidth = Math.max(maxWidth,allParas[i].lineWidth());
            }

            var gb = spec.geometricBounds;
            gb[3]= gb[1]+maxWidth;
            spec.geometricBounds=gb;
            spec.fit(FitOptions.FRAME_TO_CONTENT);
            spec.recompose();
            spec.fit(FitOptions.FRAME_TO_CONTENT);

            spec.name="Specctr Properties Mark";
            spec.insertLabel("specctrSourceId",pageItem.id.toString());
            spec.insertLabel("specctrType","specctrInfoSpec");
            pageItem.insertLabel("specctrType","specctrSpecSource");
            //pageItem.insertLabel("specctrInfoSpec",spec.id.toString());
            //positioning
            var specBounds = this.itemCoords(spec);
            var heightItem= pageItemBounds.height;
            var heightInfo = specBounds.height;
            var widthInfo = specBounds.width;

            var centerY = pageItemBounds.center.y;
            var centerX = pageItemBounds.center.x;

            var artRect = currPage.bounds;
            var artboardCenterX = artRect[1]/2+artRect[3]/2;

            if(!specExisted) {
                //center
                var specX;
                var specEdge;
                if(centerX<=artboardCenterX) {
                    spec.parentStory.justification = Justification.LEFT_ALIGN;
                    if(model.specToEdge)
                        specX=artRect[1]+spacing;
                    else
                      specX=pageItemBounds.x1-widthInfo-spacing;
                } else {
                    spec.parentStory.justification = Justification.RIGHT_ALIGN;
                    if(model.specToEdge) {
                        specX=artRect[3]-widthInfo-spacing;
                    } else
                    specX=pageItemBounds.x2+spacing;
                }
                
                spec.move([specX,(pageItemBounds.y1+(heightItem-heightInfo)/2)+specShift/2]);	
            }//end if spec existed
            
            specBounds = this.itemCoords(spec);

            if(!arm && model.specOption == "Line") {
                var armX1;
                var armX2;                

                if(centerX >= specBounds.center.x) {
                    armX1 = pageItemBounds.x1;
                    armX2 = specBounds.x2;
                } else {
                      armX1 = pageItemBounds.x2;
                      armX2 = specBounds.x1;
                }

                var armDX = Math.abs(armX1-armX2);
                var dx = armPartLength;
                if(armX1<armX2) dx=-dx;

                if (armDX<armPartLength*1.3) {
                     arm = currPage.graphicLines.add(legendLayer, undefined, undefined,{strokeWeight:model.armWeight, fillColor:"None", strokeColor:newColor , geometricBounds:[specBounds.y1,armX2,centerY,armX1]});
                     arm.paths[0].entirePath = [[armX2,specBounds.y1],[armX1,centerY]];
                 } else {
                    arm = currPage.graphicLines.add(legendLayer, undefined, undefined,{strokeWeight:model.armWeight, fillColor:"None", strokeColor:newColor , geometricBounds:[specBounds.y1,armX2,centerY,armX1]});
                    arm.paths[0].entirePath =[[armX2,specBounds.y1],[armX2+dx,specBounds.y1],[armX1,centerY]];
                }
                arm.insertLabel("specctrSourceId",pageItem.id.toString());
               arm.insertLabel("specctrType","specctrInfoArm");
            }

            var circleD = this.circleDiameter(model.armWeight);
            if (!itemCircle && model.specOption == "Line") {
                
                if(centerX>= specBounds.center.x) {
                    itemCircle = currPage.ovals.add(legendLayer, undefined, undefined,{strokeWeight:model.armWeight, fillColor:"Paper", strokeColor:newColor , geometricBounds:[centerY-circleD/2,pageItemBounds.x1-circleD/2,centerY+circleD/2,pageItemBounds.x1+circleD/2]});
                } else {
                    itemCircle = currPage.ovals.add(legendLayer, undefined, undefined,{strokeWeight:model.armWeight, fillColor:"Paper", strokeColor:newColor , geometricBounds:[centerY-circleD/2,pageItemBounds.x2-circleD/2,centerY+circleD/2,pageItemBounds.x2+circleD/2]});
                }
            
                itemCircle.insertLabel("specctrSourceId",pageItem.id.toString());
                itemCircle.insertLabel("specctrType","specctrInfoCircle");
                
                if(itemType=="text")  
                    itemCircle.fillColor = newColor;
                else 
                    itemCircle.fillColor = "Paper"; //change to none?
           }

            if(model.specOption == "Bullet") {
                var dia =  model.legendFontSize;
                
                //create a text with number.
                var firstbullet = currPage.textFrames.add(legendLayer,undefined,undefined);
                firstbullet.parentStory.contents = num.toString();
                firstbullet.parentStory.alignToBaseline = false;
                firstbullet.parentStory.fillColor = this.addIfNotExists ([255,255,255]);
                firstbullet.parentStory.appliedFont = model.legendFont;
                firstbullet.parentStory.pointSize = model.legendFontSize;
                firstbullet.parentStory.baselineShift = 0;
                firstbullet.convertShape(ConvertShapeOptions.CONVERT_TO_OVAL);
                firstbullet.fit(FitOptions.CENTER_CONTENT);
                firstbullet.fillColor = newColor;
                firstbullet.visibleBounds = [pageItemBounds.y1, pageItemBounds.x1-dia, pageItemBounds.y1 + dia, pageItemBounds.x1];
                firstbullet.parentStory.justification = Justification.CENTER_ALIGN;
                firstbullet.move([pageItemBounds.x1-dia, pageItemBounds.y1]);
                firstbullet.fit(FitOptions.CENTER_CONTENT);
            
                var secbullet = firstbullet.duplicate();
                secbullet.move([specBounds.x1-dia, specBounds.y1]);
                
                firstbullet.insertLabel("specctrSourceId",pageItem.id.toString());
                firstbullet.insertLabel("specctrType","specctrFirstBullet");
               
                secbullet.insertLabel("specctrSourceId",pageItem.id.toString());
                secbullet.insertLabel("specctrType","specctrSecondBullet");
            }

            if(model.specOption == "Line") {
                arm.insertLabel("specctrCoords",arm.geometricBounds.join("|"));
                itemCircle.insertLabel("specctrCoords",itemCircle.geometricBounds.join("|"));
                specGroup = currPage.groups.add([spec,itemCircle,arm],legendLayer,undefined,undefined,{name:specGroupName});
            } else {
                firstbullet.insertLabel("specctrFirstBullet", firstbullet.geometricBounds.join("|"));
                secbullet.insertLabel("specctrSecondBullet", secbullet.geometricBounds.join("|"));
                specGroup = currPage.groups.add([spec,secbullet,firstbullet],legendLayer,undefined,undefined,{name:specGroupName});
            }

            spec.insertLabel("specctrCoords",spec.geometricBounds.join("|"));
            pageItem.insertLabel("specctrCoords",pageItem.geometricBounds.join("|"));
            specGroup.insertLabel("specctrSourceId",pageItem.id.toString());
            specGroup.insertLabel("specctrType","specctrInfoGroup");
            
            if(model.specOption == "Bullet") {
                specGroup.insertLabel("specNumber", num.toString());
                if(!bIsUpdate) {
                    var specNumber = parseInt(num) + 1;
                    app.activeDocument.insertLabel("specNumber", specNumber.toString());
                }
            }
             
            specGroup.insertLabel("specctrCoords",specGroup.geometricBounds.join("|"));
            app.activeDocument.activeLayer = activeLayer;
            return true;
        } catch (e) {alert(e);}
    },

    itemBounds : function(textFrame) {
        return textFrame.visibleBounds;
        //illustrator code
        var bounds=textFrame.visibleBounds;
        if(textFrame.typename=="TextFrame") {
            try{
                var dup=textFrame.duplicate();
                var target=dup.createOutline();
                bounds=target.visibleBounds;
                target.remove();
            }catch(e){}
        }

        return bounds;
    },

    itemGeometricBounds : function(textFrame) {            //for now
        return textFrame.geometricBounds;
        //illustrator code
        //TODO later convert to outlines and measure... or somehow else
        var bounds=textFrame.geometricBounds;
        if(textFrame.typename=="TextFrame") {
            try{
                var dup=textFrame.duplicate();
                var target=dup.createOutline();
                bounds=target.geometricBounds;
                target.remove();
            }catch(e){}
        }

        try{
            if (textFrame.stroked) {
                var strokeWidth=textFrame.strokeWidth/2;
                bounds[0]-=strokeWidth;
                bounds[1]+=strokeWidth;
                bounds[2]+=strokeWidth;
                bounds[3]-=strokeWidth;
            }
        }catch(e){}

        return bounds;
    },

    legendLayer : function() {		
        var newLayer;

        try {
            newLayer = app.activeDocument.layers.itemByName("Specctr Border");
            newLayer.id;
        } catch(e) {
            newLayer = app.activeDocument.layers.add({name:"Specctr Border"});
            newLayer.move(LocationOptions.AT_BEGINNING);
        }

        return newLayer;
    },

    legendTextPropertiesLayer : function() {
        var newLayer;

        try {
            newLayer = app.activeDocument.layers.itemByName("Specctr Text Properties");
            newLayer.id;
        } catch(e) {
            newLayer = app.activeDocument.layers.add({name:"Specctr Text Properties"});
            newLayer.move(LocationOptions.AT_BEGINNING);
        }
        //newLayer.locked=false;
        return newLayer;		
    },
    
    legendObjectPropertiesLayer : function() {
        var newLayer;

        try {
            newLayer = app.activeDocument.layers.itemByName("Specctr Object Properties");
            newLayer.id;
        } catch(e) {
            newLayer=app.activeDocument.layers.add({name:"Specctr Object Properties"});
            newLayer.move(LocationOptions.AT_BEGINNING);
        }
        //newLayer.locked=false;
        return newLayer;
    },

    legendNoteLayer : function() {
        var newLayer;

        try {
            newLayer = app.activeDocument.layers.itemByName("Specctr Notes");
            newLayer.id;
        } catch(e) {
            newLayer=app.activeDocument.layers.add({name:"Specctr Notes"});
            newLayer.move(LocationOptions.AT_BEGINNING);
        }
        //newLayer.locked=false;
        return newLayer;
    },

    legendCoordinatesLayer : function() {
        var newLayer;

        try{
            newLayer = app.activeDocument.layers.itemByName("Specctr Coordinates");
            newLayer.id;
        } catch(e) {
            newLayer = app.activeDocument.layers.add({name:"Specctr Coordinates"});
            newLayer.move(LocationOptions.AT_BEGINNING);
        }
        //newLayer.locked=false;
        return newLayer;
    },

    legendSpacingLayer : function() {
        var newLayer;

        try{
            newLayer = app.activeDocument.layers.itemByName("Specctr Spacing");
            newLayer.id;
        } catch(e) {
            newLayer = app.activeDocument.layers.add({name:"Specctr Spacing"});
            newLayer.move(LocationOptions.AT_BEGINNING);
        }
        //newLayer.locked=false;
        return newLayer;
    },
		
    legendDimensionsLayer : function() {
        var newLayer;

        try {
            newLayer = app.activeDocument.layers.itemByName("Specctr Dimensions");
            newLayer.id;
        } catch(e) {
            newLayer = app.activeDocument.layers.add({name:"Specctr Dimensions"});
            newLayer.move(LocationOptions.AT_BEGINNING);
        }
        //newLayer.locked=false;
        return newLayer;		
    },

    pointsToUnitsString : function(value,units,responsive,relativeTo) {

        if (units == null) 
            units=app.activeDocument.viewPreferences.horizontalMeasurementUnits;
                
        var result;
        if (responsive && relativeTo) {
            result = Math.round(value/relativeTo*100)+"%";
            return result;
        }

        switch (units) {
            case MeasurementUnits.POINTS:
                 result = Math.round(value)+" pt";
                 break;
            case MeasurementUnits.INCHES:
                result = Math.round(value/72*10000)/10000+" in";
                break;
                
            case MeasurementUnits.PICAS:
                result = Math.round(value/12*100)/100+" pc";
                break;
            case MeasurementUnits.Q:
                result = Math.round(value/2.8346/0.23*100)/100+" Q";
                break;
            case MeasurementUnits.CENTIMETERS:
                result = Math.round(value/28.346*100)/100+" cm";
                break;
            case MeasurementUnits.MILLIMETERS:
                result = Math.round(value/2.8346*100)/100+" mm";
                break;
            case MeasurementUnits.PIXELS:
            default:
                result = Math.round(value)+" px";
                break;
            }
            
        return result;
    },

    typeUnits : function() {
        if (app.activeDocument.viewPreferences.horizontalMeasurementUnits == MeasurementUnits.PIXELS) 
            return "px"; 
        else 
            return "pt";
    },

    colorAsString : function(c,tint) {
        if(tint==-1 || tint==undefined) 
            tint = 100;
    
        var result="";
        var color = c;
        
        if(c.constructor.name=="Gradient") {
            result="Gradient ";
            
            if(c.type==GradientType.LINEAR) 
                result+="linear";
            else 
                result+="radial";
            
            for(var i=0;i<c.gradientStops.length;i++)
            try{
                result+="\r"+this.colorAsString(c.gradientStops[i].stopColor,tint);   
             }catch(e){}
             
             return result;
        }
        
        var newColor;
        var sourceSpace = c.space;
        var targetSpace;
        var colorComponents = c.colorValue;
				
        switch(model.legendColorMode) {
            case "LAB": targetSpace = ColorSpace.LAB; break;
            case "CMYK":
                targetSpace=ColorSpace.CMYK; break;
            case "RGB":	
            default:
                targetSpace=ColorSpace.RGB; break;
        }

        if(targetSpace!=sourceSpace) {	
            newColor = c.duplicate();
            newColor.space = targetSpace;
        } else {
            newColor = c;
        }
		  	
        color = newColor;
            
        switch(color.space) {
            case ColorSpace.CMYK:
                result="C"+Math.round(color.colorValue[0]*tint/100)+" M"+Math.round(color.colorValue[1]*tint/100)+" Y"+Math.round(color.colorValue[2]*tint/100)+" K"+Math.round(color.colorValue[3]*tint/100);
                break;
				
            case ColorSpace.LAB:
                result="L"+this.lightnessTint(color.colorValue[0],tint)+" a"+Math.round(color.colorValue[1])+" b"+Math.round(color.colorValue[2]);
                break;
                
            case ColorSpace.RGB:
            default:
                switch(model.legendColorMode) {
                    case "HSB":
                        result = this.rgbToHsv(color.colorValue,tint);
                        break;
				
                    case "HSL":
                        result = this.rgbToHsl(color.colorValue,tint);
                        break;
				
                    case "RGB":
                    default:
                        if(model.useHexColor) {
                            var red=this.rgbTint(color.colorValue[0],tint).toString(16);
                            if (red.length==1) red="0"+red;
                            var green=this.rgbTint(color.colorValue[1],tint).toString(16);
                            if (green.length==1) green="0"+green;
                            var blue=this.rgbTint(color.colorValue[2],tint).toString(16);
                            if (blue.length==1) blue="0"+blue;
                        
                            result = "#"+red+green+blue;
                        } else {
                            result="R"+this.rgbTint(color.colorValue[0],tint)+" G"+this.rgbTint(color.colorValue[1],tint)+" B"+this.rgbTint(color.colorValue[2],tint);
                        }
                }
                break;
			}
			
			if (c.model == ColorModel.SPOT || c.name.toLowerCase().indexOf("pantone")!=-1)
				result+="\r"+c.name;
                
             //remove duplicate swatch   
			if(targetSpace!=sourceSpace)
                    newColor.remove();
			return result;
		},
		
    rgbToHsl : function(rgb,tint) {
        if(tint==-1) tint =100;
        var r = rgb[0];
        var g = rgb[1];
        var b = rgb[2];
        r = rgbTint(r,tint)/255, g = rgbTint(g,tint)/255, b = rgbTint(b,tint)/255;
        
         //recalc with tint
        
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
    },
		
    rgbToHsv : function(rgb,tint) {
        if(tint==-1) 
            tint =100;
            
        var r = rgb[0];
        var g = rgb[1];
        var b = rgb[2];
        r = rgbTint(r,tint)/255, g = rgbTint(g,tint)/255, b = rgbTint(b,tint)/255;
        
        //recalc with tint
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
    },

    rgbTint : function(val,tint) {
        tint = 100-tint;
        return Math.round(Math.min(255,Math.max(0,val+(255-val)*tint/100)));
    },

    lightnessTint : function(val,tint) {
        tint = 100-tint;
        return Math.round(Math.min(100,Math.max(0,val+(100-val)*tint/100)));
    },

    getSpecsInfoForItem : function(pageItem,itemType) {
        var infoText="";
        
        if(pageItem.name) 
            infoText=pageItem.name+"\r"; 
            
        var cssText = "";
        /*if(pageItem.name) cssText+=pageItem.name.toLowerCase();
                else cssText+=pageItem.constructor.name.toLowerCase();
              cssText+= " {\r\t" + pageItem.constructor.name.toLowerCase() + ";";   //? */

        //shape properties
        if(itemType=="shape" || itemType=="mixed") {

            //Shape fill and color style.
            if(model.shapeFillStyle || model.shapeFillColor) 
            try{
                infoText+="Background: ";
                cssText += "\tfill: ";
                              
                if(model.shapeFillStyle) {
                    if(pageItem.fillColor.name=="None") {
                        infoText+="None";
                        cssText += "none;";
                    } else {
                        cssText += "solid;";
                    }
                }

                if(model.shapeFillColor && pageItem.fillColor.name!="None") {
                    var color = this.colorAsString(pageItem.fillColor,pageItem.fillTint);
                    infoText+=color;
                    cssText += "\r\tcolor: "+color.toLowerCase()+";";
                }
                infoText+="\r";
            
            }catch(e){};

            //Shape stroke properties.
            if(model.shapeStrokeStyle || model.shapeStrokeColor || model.shapeStrokeSize) 
            try{
                if(pageItem.strokeWeight!=0) infoText+="Border: ";
                            
                if(model.shapeStrokeSize && pageItem.strokeWeight!=0) {
                    var strokeWidth = this.pointsToUnitsString(pageItem.strokeWeight,null);
                    infoText+=  strokeWidth.unitPreference(model.pixelDpValue);
                    cssText += "\r\tstroke-width: " + strokeWidth + ";";
                }
                          
                if(model.shapeStrokeColor && pageItem.strokeWeight!=0) {
                    var strokeColor = this.colorAsString(pageItem.strokeColor,pageItem.strokeTint);
                    infoText+=", "+strokeColor; 
                    cssText += "\r\tstroke-color: " + strokeColor.toLowerCase() + ";";
                }  

                if(model.shapeStrokeStyle) {
                    cssText += "\r\tstroke-style: ";
                    if(pageItem.strokeWeight!=0) {
                        infoText+=", "+pageItem.strokeType.name.toLowerCase();
                        cssText += pageItem.strokeType.name.toLowerCase()+";";
                    } else { 
                        cssText += "none;";
                    }
                }   
                
                if (pageItem.strokeWeight!=0) infoText+="\r";

            }catch(e){};
                        
            if(model.shapeBorderRadius)
            try{
                //check if we have radius on any corner
                if(pageItem.topRightCornerOption!=CornerOptions.NONE || pageItem.topLeftCornerOption!=CornerOptions.NONE || 
                    pageItem.bottomRightCornerOption!=CornerOptions.NONE || pageItem.bottomLeftCornerOption!=CornerOptions.NONE) {

                    var myRadius = Math.max(pageItem.topRightCornerRadius,pageItem.topLeftCornerRadius,
                    pageItem.bottomRightCornerRadius,pageItem.bottomLeftCornerRadius);
                            
                    if(myRadius!=0) {
                        infoText+="Border radius: ";
                        var roundCornerValue = this.pointsToUnitsString(myRadius,null);
                        infoText+= roundCornerValue.unitPreference(model.pixelDpValue);
                        infoText+="\r";
                        cssText += "\r\tborder-radius: " + roundCornerValue + ";";
                    }
                }
            }catch(e){}
                        
            if(model.shapeAlpha) {
                var alpha = Math.round(pageItem.transparencySettings.blendingSettings.opacity)+"%"; 
                infoText+="Opacity: "+  alpha + "\r";      
                cssText += "\r\topacity: " + alpha + ";";
            }
        }
        
        //text properties.
        if(itemType=="text" || itemType=="mixed") {
            var fontSize, leading;
            if(model.specInEM) {
                var rltvFontSize = 16, rltvLineHeight = undefined;
                
                if(model.baseFontSize != 0 && !isNaN(model.baseFontSize))
                    rltvFontSize = parseFloat(model.baseFontSize);
             
                if(model.baseLineHeight != 0 && !isNaN(model.baseLineHeight))
                    rltvLineHeight = parseFloat(model.baseLineHeight);
                else
                    rltvLineHeight = rltvFontSize * 1.4;
            }
    
            var styleRanges = pageItem.texts[0].textStyleRanges.everyItem().getElements().slice(0);
            var prevStyleRangeSpec = "";
            var cssRanges = [];
                         
            for(var i=0;i<styleRanges.length;i++)
            try{
                var textItem = styleRanges[i].characters[0];
                var currStyleRangeSpec = "";
                var currCssRange = "";
                if(model.textFont)
                try{
                    currStyleRangeSpec+="Font-Family: "+textItem.appliedFont.fullName;
                    currStyleRangeSpec+="\r";
                    currCssRange += "\r\tfont-family: " + textItem.appliedFont.fullName + ";";
                }catch(e){}

                if(model.textSize)
                try{
                    var fontSize;
                    if(model.specInEM)
                        fontSize = Math.round(textItem.pointSize / rltvFontSize *100)/100+" em";
                    else
                        fontSize = Math.round(textItem.pointSize*10)/10+" "+this.typeUnits();
                             
                    currStyleRangeSpec+="Font-Size: "+ fontSize.unitPreference(model.pixelDpValue);
                    currStyleRangeSpec+="\r";
                    currCssRange += "\r\tfont-size: " + fontSize + ";";
                }catch(e){}
                            
                if(model.textColor)
                try{
                    var textColor = this.colorAsString(textItem.fillColor,textItem.fillTint);
                    currStyleRangeSpec+="Color: "+textColor;
                    currStyleRangeSpec+="\r";
                    currCssRange += "\r\tcolor: " + textColor.toLowerCase() + ";";
                 }catch(e){}

                if(model.textAlignment)
                try{
                    currStyleRangeSpec+="Text-Align: ";
                    var s = textItem.justification;	
                    var currAlign;
                    if(s==Justification.CENTER_ALIGN || s==Justification.CENTER_JUSTIFIED)
                        currAlign="center";
                    if(s==Justification.LEFT_ALIGN || s==Justification.LEFT_JUSTIFIED)      
                        currAlign="left";
                    if(s==Justification.RIGHT_ALIGN || s==Justification.RIGHT_JUSTIFIED)      
                        currAlign = "right";
                    currStyleRangeSpec+=currAlign+" align";
                    currStyleRangeSpec+="\r";
                    currCssRange+= "\r\ttext-align: " + currAlign + ";";
                }catch(e){}
    
                if(model.textLeading)
                try{
                    var leading = textItem.leading;
                    if(leading==Leading.AUTO) 
                        leading = textItem.autoLeading/100*textItem.pointSize;
                          
                    if(model.specInEM)
                        leading=Math.round(leading / rltvLineHeight*100)/100+" em";
                   else
                        leading = Math.round(leading*10)/10+" "+this.typeUnits();
                          
                    currStyleRangeSpec+="Line-Height: "+leading.unitPreference(model.pixelDpValue);
                    currStyleRangeSpec+="\r";
                    currCssRange+= "\r\tline-height: " + leading + ";";
                }catch(e){}

                if(model.textTracking)
                try{
                    var tracking = Math.round(textItem.tracking/1000*100)/100+" em";
                    currStyleRangeSpec+="Letter-Spacing: "+ tracking;
                    currStyleRangeSpec+="\r";
                    currCssRange+= "\r\tletter-spacing: " + tracking + ";";
                }catch(e){}

                if(model.textStyle)
                try{
                    var styleString;

                    if (textItem.capitalization==Capitalization.ALL_CAPS) styleString="All Caps";
                    if (textItem.capitalization==Capitalization.CAP_TO_SMALL_CAP) styleString="OpenType Small Caps";
                    if (textItem.capitalization==Capitalization.SMALL_CAPS) styleString="Small Caps";
                    if (textItem.capitalization==Capitalization.NORMAL) styleString="Normal";

                    if(textItem.position==Position.SUBSCRIPT) styleString+=" subscript";
                    if(textItem.position==Position.SUPERSCRIPT) styleString+=" superscript";
                    if (textItem.underline) styleString+=" underline";
                    if (textItem.strikeThru) styleString+=" strikethrough";

                    currStyleRangeSpec+="Font-Style: "+styleString;
                    currStyleRangeSpec+="\r";
                    currCssRange += "\r\tfont-style: " + styleString.toLowerCase() + ";";
                }catch(e){}

                if(currStyleRangeSpec!=prevStyleRangeSpec) {
                    infoText+=currStyleRangeSpec + "\r";
                    prevStyleRangeSpec = currStyleRangeSpec;
                    cssRanges.push(currCssRange);
                }

            }catch(e){}//end for
                
            if(cssRanges.length)
                pageItem.insertLabel("css_ranges",cssRanges.toSource());
                
            if(itemType=="text" && model.shapeAlpha)
            try{
                var alpha = Math.round(pageItem.transparencySettings.blendingSettings.opacity)+"%"; 
                infoText+="Opacity: "+  alpha;
                cssText += "\r\topacity: " + alpha + ";";
            }catch(e){}
                            
        }//end text
	
        pageItem.insertLabel("css_main",cssText);
        return infoText;
    },

    addIfNotExists : function(colorArray) {                
        var result;
        for (var i=0;i<app.activeDocument.colors.length;i++) {
            var currentValue = app.activeDocument.colors[i].colorValue;
            if (currentValue.toString() == colorArray.toString()) {                 
                result=app.activeDocument.colors[i];
                break;
            }	
        } 
        if (result == undefined) {
            //create new color                                                                           
            var colorName = "R=" + colorArray[0] + " G=" + colorArray[1] + " B=" + colorArray[2];
            result = app.activeDocument.colors.add({colorValue:colorArray,
                            model:ColorModel.PROCESS, space:ColorSpace.RGB, name:colorName});
        }
        return result;
    },

    itemCoords : function(obj) {
        var result=new Object();
        //var currentUnits=getCurrentUnits();
        result.x1 = obj.visibleBounds[1];
        result.y1 = obj.visibleBounds[0];
        result.x2 = obj.visibleBounds[3];
        result.y2 = obj.visibleBounds[2];
        result.center = new Object();
        result.center.x = obj.visibleBounds[3]/2+obj.visibleBounds[1]/2;
        result.center.y = obj.visibleBounds[2]/2+obj.visibleBounds[0]/2;
        result.width = obj.visibleBounds[3]-obj.visibleBounds[1];
        result.height = obj.visibleBounds[2]-obj.visibleBounds[0];
        return result;
    },

    getCurrentSpread : function() {   
        var result;
        if (app.selection.length)
            result = this.getParentSpread(app.selection[0]);
        else 
            result = app.activeWindow.activePage.parent;
        return result;	
    },

    getCurrentPage : function() {   
        var result;
        if (app.selection.length)
            result = this.getParentPage(app.selection[0]);
        else 
            result = app.activeWindow.activePage;
        return result;	
    },

    getParentPage : function(obj) {
        var result;
        try {
            result=obj.parentPage; result.id;
        } catch(e) {
            result = this.getCurrentSpread().pages[0];
        }
        return result;
    },

    getParentSpread : function(obj) {
        var result = undefined;
        try {
            result=obj.parentPage.parent;
        } catch(e) {
            result=obj.parent;
        }

        return result;
    },

    myEventHandlerWrapper : function(myEvent) {
        if(!app.selection.length) 
            return;
                
        //check if there's no need to update and return
        var selectedItems = app.selection;
        var needsUpdate = false;
        for (var s=0; s < selectedItems.length; s++)
            try{
                var type = selectedItems[s].extractLabel("specctrType");
                if(type=="specctrSpecSource" || type=="specctrInfoCircle" || type=="specctrInfoArm" 
                    || type=="specctrInfoSpec" || type == "specctrInfoGroup" || type == "noteItemCircle" || type == "noteArm"
                    || type == "noteSpec" || type == "noteGroup") {
                        var prevCoords =  selectedItems[s].extractLabel("specctrCoords");
                        var currCoords = selectedItems[s].geometricBounds;
                if(prevCoords != currCoords.join("|")) {
                    needsUpdate = true; 
                    break;
                }
            }
        } catch(e) {}

        if(needsUpdate) {
            app.doUndoableScript ($.specctrId.myEventHandler, "Update Specs");
        }
        
    },

    addListener : function() {
        //alert("added");
        //  try{app.eventListeners.add("afterSelectionAttributeChanged", myEventHandlerWrapper,undefined,{name:"_specctrAttrChanged"});}catch(e){}
    },

    removeListener : function() {
        //alert("removed");
        //  try{app.eventListeners.itemByName("_specctrAttrChanged").remove(); }catch(e){}
    },

    myEventHandler : function() {
        //NB for live update: 
        //1 - recreate specs according to saved model settings
        //2 - recreate spec only if it exists, i.e. if height spec is missing don't redraw it
        //3 optimize search for items - do it in one run and think about cache
        //if update is from button - recreate specs according to current model settings, no need to check which ones exist or not

        try {
            var currSpread = $.specctrId.getCurrentSpread();
            
            
            //collect ids of selected objects
            var ids = [];
            var selectedItems = app.selection;

            for (var s=0; s<selectedItems.length; s++)
                try{
                    var type = selectedItems[s].extractLabel("specctrType");
                    if(type=="specctrSpecSource") {ids.pushOnce(selectedItems[s].id); continue;}
                    if(type=="specctrInfoCircle" || type=="specctrInfoArm" || type=="specctrInfoSpec" || type=="specctrInfoGroup" ||
                    type == "noteItemCircle" || type == "noteArm" || type == "noteSpec" || type == "noteGroup")
                    {var id =  selectedItems[s].extractLabel("specctrSourceId");
                        ids.pushOnce(id);
                    }
                }catch(e){}


            for(var j=0;j<ids.length;j++) {
                var currId = ids[j];
                var source = currSpread.findItemByID(currId);
                var pageItem = source; //refactor
                //property spec update
                var itemType = $.specctrId.pageItemType(pageItem);
                var legendLayer;
                var newColor;
            
                if(itemType=="text") {
                    newColor = $.specctrId.legendColorType();
                 } else {
                    newColor = $.specctrId.legendColorObject();
                 }
                
                var allRelatedItems =  currSpread.findRelatedBySourceId(pageItem.id);        
//~                 if(allRelatedItems["specctrInfoGroup"]) 
//~                     allRelatedItems["specctrInfoGroup"].ungroup();
                
                var spec = allRelatedItems["specctrInfoSpec"];
                var arm = allRelatedItems["specctrInfoArm"];
                var itemCircle = allRelatedItems["specctrInfoCircle"];
                var firstBullet = allRelatedItems["specctrFirstBullet"];
                var secondBullet = allRelatedItems["specctrSecondBullet"];
                
                //For note specs
                if(allRelatedItems["noteGroup"]) 
                    allRelatedItems["noteGroup"].ungroup();
                
                var noteSpec = allRelatedItems["noteSpec"];
                var noteArm = allRelatedItems["noteArm"];
                var noteItemCircle = allRelatedItems["noteItemCircle"];
                var noteLegendLayer = $.specctrId.legendNoteLayer();

                //coords specs       
                if (source)    
                    for(var prop in coordSpecsObj) {
                        if(allRelatedItems[prop]) {
                            $.specctrId.createCoordinateSpecsForItem(pageItem,true,allRelatedItems);
                            break;
                        }
                    }

                //dimension specs
                if(source)    
                    for(var prop in dimSpecsObj) {
                        if(allRelatedItems[prop]) {
                            $.specctrId.createDimensionSpecsForItem (pageItem, true, allRelatedItems);
                            break;
                        }
                    }

                //single spacing specs
                if(source)    
                    for(var prop in spacingSingleSpecsObj) {
                        if(allRelatedItems[prop]) {
                            $.specctrId.createSpacingSpecsForItem (pageItem, true, allRelatedItems);
                            break;
                        }
                   }
               
                //double spacing specs
                //rework this, include search into allRelatedItems
                if(source) {
                    var sources = currSpread.existDoubleSpacingSpecBySourceIdAndTypes(pageItem.id, spacingDoubleSpecsObj);
                    for(var s=0;s<sources.length;s++)
                        $.specctrId.createSpacingSpecsForItems (pageItem,sources[s], true);
                }
               
                if(source && spec) {
                    try{
                        if(itemType=="text") {
                            legendLayer = $.specctrId.legendTextPropertiesLayer();
                         } else {
                            legendLayer = $.specctrId.legendObjectPropertiesLayer();
                        }
            
                    if(model.specOption == "Line") {
                        var name = spec.parent.name;
                        if(!name)
                            name = "Specctr Properties Marks";
                        
                        if(firstBullet) firstBullet.remove();
                        if(secondBullet) secondBullet.remove();
                        
                        $.specctrId.updateSpecByType(source, spec, arm, itemCircle, legendLayer, 
                            newColor, itemType, name, "specctrInfoGroup", "specctrInfoArm", "specctrInfoCircle");
                     } else {
                        $.specctrId.createPropertySpecsForItem(source);
                    }
                    } catch (e) {}
                }

        
              if(source && noteSpec) {
                  try{
                        var noteLegendLayer = $.specctrId.legendNoteLayer();
                        var name = noteSpec.parent.name;
                        if(!name)
                            name = "Specctr Add Notes";
                            
                        $.specctrId.updateSpecByType(source, noteSpec, noteArm, noteItemCircle, noteLegendLayer, 
                            newColor, itemType, name, "noteGroup", "noteArm", "noteItemCircle");
                    } catch (e) {}
                }
            }//for id end
        } catch(e) {}    
        
        //  logTime("end");
        return true;
    },

//~ updateSpecBullet : function (source, spec, firstBullet, secondBullet, legendLayer, 
//~                             newColor, itemType, "Specctr Properties Mark", "specctrInfoGroup") {
//~                                 
//~     },

    updateSpecByType : function (source, spec, arm, itemCircle, legendLayer, newColor, itemType, 
        specGroupName, specGroupType, armName, itemCircleName) {
        
        var currPage = $.specctrId.getCurrentPage();
        
        var pageItem = source;
        var aItem = source;
        var bItem = spec;
        var aBounds = $.specctrId.itemCoords(aItem);
        var bBounds = $.specctrId.itemCoords(bItem);
        var bX = bBounds.x2;
        var bY = bBounds.y1 - model.armWeight/2;
        var centerX = bBounds.center.x;
        var sourceCenterX = aBounds.center.x;
        
        var artRect = currPage.bounds;
        var artboardCenterX = artRect[1]/2+artRect[3]/2;
    
        if(bBounds.x2<=sourceCenterX && spec.parentStory.justification != Justification.LEFT_ALIGN) {						
            spec.parentStory.justification = Justification.LEFT_ALIGN;
            spec.parentStory.recompose();
        } else if (bBounds.x1>=sourceCenterX  && spec.parentStory.justification != Justification.RIGHT_ALIGN) {					
            spec.parentStory.justification = Justification.RIGHT_ALIGN;
            spec.parentStory.recompose();
        }
        
        if( spec.parentStory.justification == Justification.RIGHT_ALIGN) 
            bX=bBounds.x1; //?
            
        //centers
        var aX = aBounds.x1;
        var aY = aBounds.center.y;
        var aXC= aBounds.center.x;

        if(bX>=aBounds.x1 && bX<=aBounds.x2) {
            aX=aXC;
            if (bY>aBounds.y2) {aY=aBounds.y2;} else {aY=aBounds.y1;}
        } else if(bX>aBounds.x2) {
            aX=aBounds.x2;
        }

        var dX=aX-bX;
        var dY=aY-bY;
        var originalBX = undefined;
        if(dX>armPartLength) {
            originalBX=bX;
            //bX+=armPartLength;
            dX+=armPartLength;
        } else if (dX<-armPartLength) {
            originalBX=bX;
            //bX-=armPartLength;
            dX-=armPartLength;
        }
        
        if(dX==0) dX=1;
        if(dY==0) dY=1;
        var aTg = dY/dX;
        var aCtg = dX/dY;
        var gipotenuzaLen  = Math.sqrt(dX*dX+dY*dY);
        var aCos = dX/gipotenuzaLen;
        var aSin = dY/gipotenuzaLen;

        //refactor it
        var pageItemBounds = aBounds;
        var  specBounds = bBounds;

        //arm update
        var armX1 = aX;
        var armX2 = bX;
        var armDX = Math.abs(armX1-armX2);
        var dx = armPartLength;
        if(armX1<armX2) dx=-dx;

        if(!arm) {
            arm = currPage.graphicLines.add(legendLayer, undefined, undefined,{strokeWeight:model.armWeight, fillColor:"None", strokeColor:newColor , geometricBounds:[specBounds.y1,armX2,aY,armX1]});
            arm.insertLabel("specctrSourceId",pageItem.id.toString());
            arm.insertLabel("specctrType",armName);
            //      pageItem.insertLabel("specctrInfoArm",arm.id.toString());
        }
        //     arm.locked = false;
        if (armDX<armPartLength*1.3) {
            arm.paths[0].entirePath = [[armX2,specBounds.y1],[armX1,aY]];
        } else {        
            arm.paths[0].entirePath =[[armX2,specBounds.y1],[armX2+dx,specBounds.y1],[armX1,aY]];
        }
    
        //    arm.locked = true;
        var circleD = $.specctrId.circleDiameter(model.armWeight);

        if (!itemCircle) {
            itemCircle = currPage.ovals.add(legendLayer, undefined, undefined,{strokeWeight:model.armWeight, fillColor:"Paper", strokeColor:newColor , geometricBounds:[aY-circleD/2,aX-circleD/2,aY+circleD/2,aX+circleD/2]});
            itemCircle.insertLabel("specctrSourceId",pageItem.id.toString());
            itemCircle.insertLabel("specctrType",itemCircleName);
             //  itemCircle.locked = true;
            //   pageItem.insertLabel("specctrInfoCircle",itemCircle.id.toString());

             /*if(sourceItem.typename=="TextFrame")
                            itemCircle.filled = true;
                            else itemCircle.filled = false;
                    */
        } else {
            //          itemCircle.locked = false;
            itemCircle.geometricBounds=[aY-circleD/2,aX-circleD/2,aY+circleD/2,aX+circleD/2];
            //    itemCircle.locked = true;
        }

 try {
        
        if(itemType=="text") {
            itemCircle.fillColor = newColor;            
        } else {
            itemCircle.fillColor = "Paper"; //change to none?
        }

        arm.strokeColor = newColor;
        itemCircle.strokeColor = newColor;
        spec.parentStory.fillColor = newColor;
        arm.insertLabel("specctrCoords",arm.geometricBounds.join("|"));
        itemCircle.insertLabel("specctrCoords",itemCircle.geometricBounds.join("|"));
        spec.insertLabel("specctrCoords",spec.geometricBounds.join("|"));
        pageItem.insertLabel("specctrCoords",pageItem.geometricBounds.join("|"));

        var  specGroup = currPage.groups.add([spec,itemCircle,arm],legendLayer,undefined,undefined,{name: specGroupName});
        specGroup.insertLabel("specctrSourceId",pageItem.id.toString());
        specGroup.insertLabel("specctrType",specGroupType);
        specGroup.insertLabel("specctrCoords",specGroup.geometricBounds.join("|"));
        
    } catch (e) {}
    },

    circleDiameter : function(strokeWidth) {
        return Math.max(3, strokeWidth * 2 + 3);
    },

    legendColorObject : function() {
        return this.addIfNotExists ([this.rChannel(model.legendColorObject),
                                                    this.gChannel(model.legendColorObject),
                                                        this.bChannel(model.legendColorObject)]);
    },

    legendColorType : function() {
        return this.addIfNotExists ([this.rChannel(model.legendColorType),
                                                    this.gChannel(model.legendColorType),
                                                        this.bChannel(model.legendColorType)]);
    },

    legendColorSpacing : function() {
            return this.addIfNotExists ([this.rChannel(model.legendColorSpacing),
                                                        this.gChannel(model.legendColorSpacing),
                                                            this.bChannel(model.legendColorSpacing)]);
    },

    rChannel : function(value) {
        return parseInt(value.substring(1, 3), 16);
    },

    gChannel : function(value) {
        return parseInt(value.substring(3, 5), 16);
    },
            
    bChannel : function(value) {
        return parseInt(value.substring(5, 7), 16);
    },

    isText : function(obj) {
        //if pageItems has text
        var result = false;
        try{
            if(obj.texts.length) result = true;
            }catch(e){}
        return result;
    },

    isShape : function(obj) {
        //if pageItem has stroke or fill
            var result = false;
        try{
            if(obj.strokeColor.name!="None" || obj.fillColor.name!="None") result = true;
            }catch(e){}
        return result;
    },

    pageItemType : function(obj) {
        //text,shape,mixed
        var textType = this.isText(obj);
        var shapeType = this.isShape(obj);
        if(textType && shapeType) return "mixed";
        if(textType) return "text";
        return "shape";
    },

    getScaledValue : function(value) {
        if(model.specInPrcntg) return value;
        var scaledValue = value;
        try {
            if (model.useScaleBy) {       //Scaling option is checked or not.
                var scaling = Number(model.scaleValue.substring(1));
                if(!scaling)
                    scaling = 1;
            
                if(model.scaleValue.charAt(0) == '/')
                    scaledValue = scaledValue / scaling;
                else
                    scaledValue = scaledValue * scaling;
            }
        } catch(e) {
            scaledValue = value;
        }

        return scaledValue;
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
    },

    getLayerName : function (artLayer) {
        try {
            var name = artLayer.name;
            if (!name && this.pageItemType(artLayer) == "text")
                name = artLayer.contents;
            
            var maxWordAllowed = 5;
            var maxCharAllowed = 20;
            var nameArr = [];
            name = name.split(/[\( ,.'?!;:\r\)]+/);
            
            if(name.length > maxWordAllowed) {
                for(var i = 0; i < maxWordAllowed; i++)
                    nameArr[i] = name[i];
            } else {
                nameArr = name;
            }

            name = nameArr.join("_").substring(0,maxCharAllowed).toLowerCase();
        } catch (e) {}
        
        if(!name) {
            name = artLayer.toString().split(/[ \] ]+/);   //Format will be like "[Object PathItem]". We need PathItem which will be on 2nd index.
            name = name[1].toLowerCase();
        }
    
        return name;
    },

    IsLayerPresent : function (layerName) {
        try {
            var newLayer = app.activeDocument.layers.itemByName(layerName);
            newLayer.id;
        } catch(e) {
            return false;
        }
        return true;
    }

};


function log(caption)
{
    
if(debug) 
    try{
    $.writeln(caption);  
    }catch(e){}
}

function logTime(caption)
{
    
if(debug) 
    {
        
      var date = new Date();
      var time = date.getTime();
      if(prevTime==undefined) prevTime = time;
    $.writeln(caption+" - "+(time-prevTime));  
    prevTime = time;
    }
}
