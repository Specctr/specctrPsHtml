/*//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 * File Name: specctrPsSpacing.jsx
 * Description: Includes the methods for creation, updation and deletion of spacing specs
 for the selected art object(s).
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

#include"specctrPsCommon.jsx";
if(typeof($)=== 'undefined')
	$={};

var model;
var textBaseLine;
var artBoardBounds;
$.specctrPsSpacing = {
    
    //Suspend the history of creating spacing spec of layers.
    createSpacingSpecs : function() {
        try {
            var selectedArtItems = $.specctrPsCommon.getSelectedLayers();
            var numberOfSelectedItems = selectedArtItems.length;
            var doc = app.activeDocument;
            var pref = app.preferences;
            var startRulerUnits = pref.rulerUnits; 
            var startTypeUnits = pref.typeUnits;
            pref.rulerUnits = Units.PIXELS;
            pref.typeUnits = TypeUnits.PIXELS;
            model = $.specctrPsCommon.getModel();
            var lyr = charIDToTypeID("Lyr ");
            var ordn = charIDToTypeID("Ordn");
            var trgt = charIDToTypeID("Trgt");
            var layerEffects = stringIDToTypeID('layerEffects');
            var layerFXVisible = stringIDToTypeID('layerFXVisible');
            
            if(numberOfSelectedItems === 2) {
                var artLayer1 = $.specctrPsCommon.selectLayerByIndex(selectedArtItems[0]);
                var artLayer2 = $.specctrPsCommon.selectLayerByIndex(selectedArtItems[1]);

                if(artLayer1.typename === "LayerSet" || artLayer2.typename === "LayerSet") {
                    alert("Please select shape layers or text layers only.");
                    return;
                }

                doc.activeLayer = artLayer1;
                
                if(model.includeStroke) {
                    var ref = new ActionReference();
                    ref.putEnumerated(lyr, ordn, trgt);
                    var layer = executeActionGet(ref);
                    if(layer.hasKey(layerEffects) && layer.getBoolean(layerFXVisible))
                        var bounds1 = $.specctrPsCommon.returnBounds(artLayer1);
                    else
                        bounds1 = artLayer1.bounds;
                } else {
                    bounds1 = artLayer1.boundsNoEffects;
                }
            
                if(artLayer1.kind === LayerKind.TEXT) {
                    doc.activeLayer = artLayer1;
                    app.activeDocument.suspendHistory('TextBaseLine', 'this.getTextBaseLine(artLayer1, artLayer1.textItem)');
                    executeAction(charIDToTypeID('undo'), undefined, DialogModes.NO);
                    bounds1[3] =  textBaseLine;
                }

                doc.activeLayer = artLayer2;
                
                if(model.includeStroke) {
                    ref = new ActionReference();
                    ref.putEnumerated(lyr, ordn, trgt);
                    layer = executeActionGet(ref);
                    if(layer.hasKey(layerEffects) && layer.getBoolean(layerFXVisible))
                        var bounds2 = $.specctrPsCommon.returnBounds(artLayer2);
                    else
                        bounds2 = artLayer2.bounds;
                } else {
                    bounds2 = artLayer2.boundsNoEffects;
                }

                if(artLayer2.kind === LayerKind.TEXT) {
                    doc.activeLayer = artLayer2;
                    app.activeDocument.suspendHistory('TextBaseLine', 'this.getTextBaseLine(artLayer2, artLayer2.textItem)');
                    executeAction(charIDToTypeID('undo'), undefined, DialogModes.NO);
                    bounds2[3] =  textBaseLine;
                }

                pref.rulerUnits = startRulerUnits;
                pref.typeUnits = startTypeUnits;
                app.activeDocument.suspendHistory('Spacing spec', 'this.createSpacingSpecsForTwoItems(artLayer1, artLayer2, bounds1, bounds2)');
            } else if(numberOfSelectedItems === 1) {
                var artLayer = doc.activeLayer;
                if(!$.specctrPsCommon.startUpCheckBeforeSpeccing(artLayer))      //Check if layer is valid for speccing i.e. not an artlayer set or specced object.
                    return;

                if(model.includeStroke) {
                    ref = new ActionReference();
                    ref.putEnumerated(lyr, ordn, trgt);
                    layer = executeActionGet(ref);
                    if(layer.hasKey(layerEffects) && layer.getBoolean(layerFXVisible))
                        var bounds = $.specctrPsCommon.returnBounds(artLayer);
                    else
                        bounds = artLayer.bounds;
                } else {
                    bounds = artLayer.boundsNoEffects;
                }
            
                if(artLayer.kind === LayerKind.TEXT) {
                    doc.activeLayer = artLayer;
                    app.activeDocument.suspendHistory('TextBaseLine', 'this.getTextBaseLine(artLayer, artLayer.textItem)');
                    executeAction(charIDToTypeID('undo'), undefined, DialogModes.NO);
                    bounds[3] =  textBaseLine;
                }

                //Check artboard is present or not and make changes in bounds accordingly.
                var isArtBoardPresent = $.specctrPsCommon.isArtBoardPresent();
                if(isArtBoardPresent) {
                    // Check for active layer's parent.
                    artBoardBounds = $.specctrPsCommon.getArtBoardBounds(artLayer);
                    if(artBoardBounds == null) {
                        pref.rulerUnits = startRulerUnits;
                        pref.typeUnits = startTypeUnits;
                        alert("Property not applicable for this artlayer.");
                        return;
                    }
                } else {
                    artBoardBounds = null;
                }
                
                pref.rulerUnits = startRulerUnits;
                pref.typeUnits = startTypeUnits;
                app.activeDocument.suspendHistory('Spacing spec', 'this.createSpacingSpecsForSingleItem(artLayer, bounds)');
            } else {
                alert("Please select one or two shape/text layer(s)!");
            }
        } catch(e) {}
    },

    //Create the spacing spec for two selected layers.
    createSpacingSpecsForTwoItems : function(artLayer1, artLayer2, bounds1, bounds2) {
        if(ExternalObject.AdobeXMPScript == null)
            ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');		//Load the XMP Script library to access XMPMetadata info of layers.

        var doc = app.activeDocument;
        doc.activeLayer = artLayer2;
        var uniqueIdOfSecondLayer = $.specctrPsCommon.getIDOfLayer();

        //Code for updating the specs.
        var spacingSpec = "";
        var indexOfSpecInFirstLayerXMPArray = "";
        var indexOfSpecInSecondLayerXMPArray = "";
        var idSpacingSpec = this.getXMPDataForSpacingSpec(artLayer1, uniqueIdOfSecondLayer, "idSpacingSpec");
        if(idSpacingSpec) {
            spacingSpec = $.specctrPsCommon.getLayerByID(idSpacingSpec);
            if(spacingSpec) {
                spacingSpec.remove();
                indexOfSpecInFirstLayerXMPArray = this.getIndexFromXmpArray(artLayer1, idSpacingSpec, "idSpacingSpec");
                indexOfSpecInSecondLayerXMPArray = this.getIndexFromXmpArray(artLayer2, idSpacingSpec, "idSpacingSpec");
            }
        }

        //Save the current preferences
        var startRulerUnits = app.preferences.rulerUnits;
        var startTypeUnits = app.preferences.typeUnits;
        var originalDPI = doc.resolution;
        $.specctrPsCommon.setPreferences(Units.PIXELS, TypeUnits.PIXELS, 72);
        var isOverlapped = false;
        var uniqueIdOfSpec = "";
        doc.activeLayer = artLayer1;
        var uniqueIdOfFirstLayer = $.specctrPsCommon.getIDOfLayer();

        // Check overlap
        if (bounds1[0]<bounds2[2] && bounds1[2]>bounds2[0] &&
            bounds1[3]>bounds2[1] && bounds1[1]<bounds2[3]) {
            isOverlapped = true;
        }
        
        //Check artboard is present or not and make changes in bounds accordingly.
        var parent = doc;
        var isArtBoardPresent = $.specctrPsCommon.isArtBoardPresent();
        if(isArtBoardPresent) {
            parent = $.specctrPsCommon.getArtBoard(artLayer1);
        }
    
        var legendLayer = $.specctrPsCommon.legendSpecLayer("Spacing", parent).layerSets.add();
        var aName = $.specctrPsCommon.getLayerName(artLayer1).substring(0,10);
        var bName = $.specctrPsCommon.getLayerName(artLayer2).substring(0,10);
        legendLayer.name = "SPEC_spc_"+aName+"_"+bName;
    
        var spec = legendLayer;

        // Check if there's vertical perpendicular
        if (bounds1[0]<bounds2[2] && bounds1[2]>bounds2[0]) {
            var x= Math.max(bounds1[0], bounds2[0])/2+Math.min(bounds1[2], bounds2[2])/2;
            var y1, y2;

            if(!isOverlapped) {
                if(bounds1[1]<bounds2[1]) {
                    y1=bounds1[3];
                    y2=bounds2[1];
                } else {
                    y1=bounds2[3];
                    y2=bounds1[1];
                }
                this.createVertSpec(x, x, y2, y1, startRulerUnits, spec);
            } else {
                //for top to top
                if(model.spaceTop) {
                    if(bounds1[1]>bounds2[1]) {
                        y1=bounds1[1];
                        y2=bounds2[1];
                    } else {
                        y1=bounds2[1];
                        y2=bounds1[1];
                    }
                    this.createVertSpec(x, x, y1, y2, startRulerUnits, spec);
                }

                //for bottom to bottom
                if(model.spaceBottom) {
                     if(bounds1[3]>bounds2[3]) {
                        y1=bounds1[3];
                        y2=bounds2[3];
                    } else {
                        y1=bounds2[3];
                        y2=bounds1[3];
                    }
                    this.createVertSpec(x, x, y1, y2, startRulerUnits, spec);
                }
            }
        }
        
        // Check if there's horizontal perpendicular
        if (bounds1[3]>bounds2[1] && bounds1[1]<bounds2[3]) {
            var y = Math.max(bounds1[1], bounds2[1])/2+Math.min(bounds1[3], bounds2[3])/2;
            var x1, x2;

            if(!isOverlapped) {
                if(bounds1[0]>bounds2[0]) {
                    x1=bounds1[0];
                    x2=bounds2[2]; 
                } else {
                    x1=bounds2[0];
                    x2=bounds1[2]; 
                }
                this.createHorizontalSpec(x1, x2, y, y, startRulerUnits, spec);
            } else {
                //for left to left
                if(model.spaceLeft) {
                    if(bounds1[0]>bounds2[0]) {
                        x1=bounds1[0];
                        x2=bounds2[0]; 
                    } else {
                        x1=bounds2[0];
                        x2=bounds1[0]; 
                    }
                    this.createHorizontalSpec(x1, x2, y, y, startRulerUnits, spec);
                }
                
                //for right to right
                if(model.spaceRight) {
                    if(bounds1[2]>bounds2[2]) {
                        x1=bounds1[2];
                        x2=bounds2[2]; 
                    } else {
                        x1=bounds2[2];
                        x2=bounds1[2]; 
                    }
                    this.createHorizontalSpec(x1, x2, y, y, startRulerUnits, spec);
                }
            }
         }

        doc.activeLayer = spec;
        uniqueIdOfSpec = $.specctrPsCommon.getIDOfLayer();
        var xmpData = [{layerHandler : spec,
                                   properties : [{name : "SpeccedObject", value : "true"}, 
                                                      {name : "firstLayer", value : uniqueIdOfFirstLayer},
                                                      {name : "secondLayer", value : uniqueIdOfSecondLayer}]}
                                ];

        var specArtLayersLength = spec.artLayers.length;
        
        //Select all child layers and link them.
        for(var i = 0; i < specArtLayersLength-1; ++i) {
            spec.artLayers[i].link(spec.artLayers[i+1]);
            var data = {layerHandler : spec.artLayers[i], properties : [{name : "SpeccedObject", value : "true"}]};
            xmpData.push(data);
        }
        
        spec.artLayers[i].link(spec);
        data = {layerHandler : spec.artLayers[i], properties : [{name : "SpeccedObject", value : "true"}]};
        xmpData.push(data);
        
        $.specctrPsCommon.setXmpDataOfLayer(xmpData);

        $.specctrPsCommon.selectLayers(artLayer1.name, artLayer2.name);
        this.setXmpDataForSpacingSpec(artLayer1, uniqueIdOfSpec, "idSpacingSpec", indexOfSpecInFirstLayerXMPArray);
        this.setXmpDataForSpacingSpec(artLayer2, uniqueIdOfSpec, "idSpacingSpec", indexOfSpecInSecondLayerXMPArray);
        $.specctrPsCommon.setPreferences(startRulerUnits, startTypeUnits, originalDPI);      //Setting the original preferences of the document.
    },

    //Create the spacing spec for a selected layer.
    createSpacingSpecsForSingleItem : function(artLayer, bounds) {
         if(ExternalObject.AdobeXMPScript == null)
            ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');		//Load the XMP Script library to access XMPMetadata info of layers.

        var spacingSpec = "";
        var idSpacingSpec = $.specctrPsCommon.getXMPData(artLayer, "idSingleSpacingSpec");
        if(idSpacingSpec) {
            spacingSpec = $.specctrPsCommon.getLayerByID(idSpacingSpec);
            if(spacingSpec) 
                spacingSpec.remove();
        }

        //Save the current preferences
        var doc = app.activeDocument;
        var startRulerUnits = app.preferences.rulerUnits;
        var startTypeUnits = app.preferences.typeUnits;
        var originalDPI = doc.resolution;
        $.specctrPsCommon.setPreferences(Units.PIXELS, TypeUnits.PIXELS, 72);
        var font = model.legendFont;
        var newColor =  $.specctrPsCommon.legendColor(model.legendColorSpacing);
        var height = bounds[3] - bounds[1];
        var width = bounds[2] - bounds[0];
        var armWidth = model.armWeight / 2.0;
        var spacing = 3 + 0.3 * model.armWeight;
        var cnvsRect, parent;
        
        // Canvas can be Artboard.
        if(artBoardBounds == null) {
            parent = doc;
            cnvsRect = $.specctrPsCommon.originalCanvasSize();       //Get the original canvas size.
        } else {
            parent = $.specctrPsCommon.getArtBoard(artLayer);
            cnvsRect = artBoardBounds;
        }
    
        var relativeHeight='', relativeWidth='';
        if(model.specInPrcntg) {
             if(model.relativeHeight != 0)
                relativeHeight = model.relativeHeight;
            else
                relativeHeight = cnvsRect[3];

            if(model.relativeWidth != 0)
                relativeWidth = model.relativeWidth;
            else
                relativeWidth = cnvsRect[2];
        }

        var legendLayer = $.specctrPsCommon.legendSpecLayer("Spacing", parent).layerSets.add();
        legendLayer.name = "SPEC_spc_"+$.specctrPsCommon.getLayerName(artLayer);

        var specItemsGroup = legendLayer;
        
        var lines = "", specText = "", textLayer = "";
        var distanceValue = "";
        var aPos, bPos, cPos;

        if(model.spaceTop) {
            if(!model.specInPrcntg) {
                distanceValue = $.specctrPsCommon.pointsToUnitsString($.specctrPsCommon.getScaledValue(bounds[1] - cnvsRect[1]), startRulerUnits);
            } else {
                 distanceValue = Math.round(1.0 * (bounds[1] - cnvsRect[1]) / relativeHeight * 10000) / 100 + "%";
            }

            if(model.decimalFractionValue === "fraction")
                distanceValue = $.specctrPsCommon.decimalToFraction(distanceValue);

            aPos = bounds[0] + width / 2 - spacing;
            textLayer = specItemsGroup.artLayers.add();
            textLayer.kind = LayerKind.TEXT;
            specText = textLayer.textItem;
            specText.kind = TextType.POINTTEXT;
            specText.justification = Justification.RIGHT;
            specText.color.rgb = newColor;
            specText.font = font;
            specText.size = model.legendFontSize;
            specText.contents = distanceValue;
            specText.position = [aPos - armWidth, (bounds[1] + cnvsRect[1]) / 2.0];
            textLayer.move(specItemsGroup, ElementPlacement.INSIDE);
            
            cPos = aPos + spacing;
            lines = $.specctrPsCommon.createLine(cPos, cnvsRect[1], cPos, bounds[1], newColor);      //Main top line.
            bPos = bounds[1] - armWidth;
            cPos = cPos + spacing;
            $.specctrPsCommon.setShape(aPos, bPos, cPos, bPos);   //Top line's top.
            bPos = cnvsRect[1] + armWidth;
            $.specctrPsCommon.setShape(aPos, bPos, cPos, bPos);   //Top line's bottom.
        }

        if(model.spaceLeft) {
            if(!model.specInPrcntg) {
                distanceValue = $.specctrPsCommon.pointsToUnitsString($.specctrPsCommon.getScaledValue(bounds[0] - cnvsRect[0]), startRulerUnits);
            } else {
                 distanceValue = Math.round(1.0 * (bounds[0] - cnvsRect[0]) / relativeWidth * 10000) / 100 + "%";
             }

            if(model.decimalFractionValue === "fraction")
                distanceValue = $.specctrPsCommon.decimalToFraction(distanceValue);

            if(textLayer === "") {
                textLayer = specItemsGroup.artLayers.add();
                textLayer.kind = LayerKind.TEXT;
                specText = textLayer.textItem;
                specText.kind = TextType.POINTTEXT;
                specText.color.rgb = newColor;
                specText.font = font;
                specText.size = model.legendFontSize;
            } else {
                textLayer = textLayer.duplicate(textLayer, ElementPlacement.PLACEBEFORE);
                specText = textLayer.textItem;
            }

            cPos = bounds[3] - height / 2 - spacing;
            specText.justification = Justification.CENTER;
            specText.contents = distanceValue;
            specText.position = [(bounds[0] + cnvsRect[0]) / 2.0, cPos - armWidth];
            textLayer.move(specItemsGroup, ElementPlacement.INSIDE);
            
            bPos = cPos + spacing;
            lines = $.specctrPsCommon.createLine(cnvsRect[0], bPos, bounds[0], bPos, newColor);    //Main left line.
            bPos = bPos + spacing;
            aPos = bounds[0] - armWidth;
            $.specctrPsCommon.setShape(aPos, bPos, aPos, cPos);   //Left line's left.
            aPos = cnvsRect[0] + armWidth;
            $.specctrPsCommon.setShape(aPos, bPos, aPos, cPos);   //Left line's right.
        }

        if(model.spaceRight) {
            if(!model.specInPrcntg) {
                distanceValue =  $.specctrPsCommon.pointsToUnitsString($.specctrPsCommon.getScaledValue(cnvsRect[2] - bounds[2]), startRulerUnits);
            } else {
                 distanceValue = Math.round(1.0 * (cnvsRect[2] - bounds[2]) / relativeWidth * 10000) / 100 + "%";
             }

            if(model.decimalFractionValue === "fraction")
                distanceValue = $.specctrPsCommon.decimalToFraction(distanceValue);

            if(textLayer === "") {
                textLayer =  specItemsGroup.artLayers.add();
                textLayer.kind = LayerKind.TEXT;
                specText = textLayer.textItem;
                specText.kind = TextType.POINTTEXT;
                specText.color.rgb = newColor;
                specText.font = font;
                specText.size = model.legendFontSize;
            } else {
                textLayer = textLayer.duplicate(textLayer, ElementPlacement.PLACEBEFORE);
                specText = textLayer.textItem;
            }
            cPos = bounds[3] - height / 2 - spacing;
            specText.justification = Justification.CENTER;
            specText.contents = distanceValue;
            specText.position = [(bounds[2] + cnvsRect[2]) / 2.0, cPos - armWidth];
            textLayer.move(specItemsGroup, ElementPlacement.INSIDE);
            
            bPos = cPos + spacing;
            lines = $.specctrPsCommon.createLine(cnvsRect[2], bPos, bounds[2], bPos, newColor);    //Main Right line.
            bPos = bPos + spacing;
            aPos = bounds[2] + armWidth;
            $.specctrPsCommon.setShape(aPos, bPos, aPos, cPos);   //Right line's left.
            aPos = cnvsRect[2] - armWidth;
            $.specctrPsCommon.setShape(aPos, bPos, aPos, cPos);   //Right line's right.
        }

        if(model.spaceBottom) {
            if(!model.specInPrcntg) {
                distanceValue =  $.specctrPsCommon.pointsToUnitsString($.specctrPsCommon.getScaledValue(cnvsRect[3] - bounds[3]), startRulerUnits);
            } else {
                 distanceValue = Math.round(1.0 * (cnvsRect[3] - bounds[3]) / relativeHeight * 10000) / 100 + "%";
             }

             if(model.decimalFractionValue === "fraction")
                distanceValue = $.specctrPsCommon.decimalToFraction(distanceValue);

            if(textLayer === "") {
                textLayer = specItemsGroup.artLayers.add();
                textLayer.kind = LayerKind.TEXT;
                specText = textLayer.textItem;
                specText.kind = TextType.POINTTEXT;
                specText.color.rgb = newColor;
                specText.font = font;
                specText.size = model.legendFontSize;
            } else {
                textLayer = textLayer.duplicate(textLayer, ElementPlacement.PLACEBEFORE);
                specText = textLayer.textItem;
            }

            aPos = bounds[0] + width / 2 - spacing;
            specText.justification = Justification.RIGHT;
            specText.contents = distanceValue;
            specText.position = [aPos - armWidth, (bounds[3]+cnvsRect[3])/2.0];
            textLayer.move(specItemsGroup, ElementPlacement.INSIDE);

            cPos = aPos + spacing;
            lines = $.specctrPsCommon.createLine(cPos, cnvsRect[3], cPos, bounds[3], newColor);   //Main bottom line.
            bPos = bounds[3] + armWidth;
            cPos = cPos + spacing;
            $.specctrPsCommon.setShape(aPos, bPos, cPos, bPos);   //Bottom line's left.
            bPos = cnvsRect[3] - armWidth;
            $.specctrPsCommon.setShape(aPos, bPos, cPos, bPos);   //Bottom line's right.
        }

        //Converting selected layers into single smart object.
        doc.activeLayer = specItemsGroup;
        idSpacingSpec = $.specctrPsCommon.getIDOfLayer();

        //Shifting 'Specctr' to upper layer.
//        try {
//        var specctrLayerSet = legendLayer.parent.parent;
        
//        alert(doc.layers.length-1);
//        alert(specctrLayerSet.name);
//        specctrLayerSet.move(doc.layers[doc.layers.length-1], ElementPlacement.PLACEBEFORE);
//        $.specctrPsCommon.placeBorderBefore(specctrLayerSet);
//        } catch (e) {alert(e);}
        doc.activeLayer = artLayer;
        var xmpData = [{layerHandler : artLayer,
                                        properties : [{name : "idSingleSpacingSpec", value :idSpacingSpec}]
                                    },
                                {layerHandler : specItemsGroup,
                                        properties : [{name : "SpeccedObject", value :"true"}]
                                    }
                                ];
                                
        var specArtLayersLength = specItemsGroup.artLayers.length;
        
        //Select all child layers and link them.
        for(var i = 0; i < specArtLayersLength-1; ++i) {
            specItemsGroup.artLayers[i].link(specItemsGroup.artLayers[i+1]);
            var data = {layerHandler : specItemsGroup.artLayers[i], properties : [{name : "SpeccedObject", value : "true"}]};
            xmpData.push(data);
        }
        
        specItemsGroup.artLayers[i].link(specItemsGroup);
        data = {layerHandler : specItemsGroup.artLayers[i], properties : [{name : "SpeccedObject", value : "true"}]};
        xmpData.push(data);

        $.specctrPsCommon.setXmpDataOfLayer(xmpData);
        $.specctrPsCommon.setPreferences(startRulerUnits, startTypeUnits, originalDPI);      //Setting the original preferences of the document.
    },

    //Get spacing spec id (spec between two objects) of the layer if present.
    getXMPDataForSpacingSpec : function(activeLayer, layerId, specString) {
        try {
           var layerXMP = new XMPMeta(activeLayer.xmpMetadata.rawData);
            var noOfItemsInXmpArray = layerXMP.countArrayItems(XMPConst.NS_PHOTOSHOP, specString);
            var specId = "", spec = "";
            
            for( var i = 0; i < noOfItemsInXmpArray; i++) {
                specId = layerXMP.getArrayItem(XMPConst.NS_PHOTOSHOP, specString, i + 1).toString();
                spec = $.specctrPsCommon.getLayerByID(specId);
                if(spec) {
                    var specXMP = new XMPMeta(spec.xmpMetadata.rawData);
                    var firstLayerId = specXMP.getArrayItem(XMPConst.NS_PHOTOSHOP, "firstLayer", 1).toString();
                    var secondLayerId = specXMP.getArrayItem(XMPConst.NS_PHOTOSHOP, "secondLayer", 1).toString();
                    if(layerId == firstLayerId || layerId == secondLayerId)
                        return specId;
                }
            }
        } catch(e) {}
        return null;
    },

    //Return the index at which spec id is present from xmp array of layer.
    getIndexFromXmpArray : function(artLayer, idSpec, specString) {
        var layerXMP = new XMPMeta(artLayer.xmpMetadata.rawData);
        var noOfItemsInXmpArray = layerXMP.countArrayItems(XMPConst.NS_PHOTOSHOP, specString);
        var id = "", pos = 0;
        for(var i = 0; i < noOfItemsInXmpArray; i++) {
            id = layerXMP.getArrayItem(XMPConst.NS_PHOTOSHOP, specString, i + 1).toString();
            if(id == idSpec) {
                pos = i + 1;
                break;
            }
        }
        artLayer.xmpMetadata.rawData = layerXMP.serialize();
        return pos;
    },

    //Get text base line position.
    getTextBaseLine : function(artLayer, textItem) {
        try {
            var contents = textItem.contents;
            var size = 12;
            var sizeID = stringIDToTypeID("size");
            var transformID = stringIDToTypeID("transform");
            var ref = new ActionReference();
            ref.putEnumerated( charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') ); 
            var desc = executeActionGet(ref).getObjectValue(stringIDToTypeID('textKey'));

            var textStyleRangeID = stringIDToTypeID("textStyleRange");
            var textStyleID = stringIDToTypeID("textStyle");
            var txtList = desc.getList(textStyleRangeID);
            var txtDesc = txtList.getObjectValue(0);

            if(txtDesc.hasKey(textStyleID)) {
                var styleDesc = txtList.getObjectValue(0).getObjectValue(textStyleID);
                if(styleDesc.hasKey(sizeID)) {
                    size =  styleDesc.getDouble(sizeID);
                    if(desc.hasKey(transformID)) {
                        var mFactor = desc.getObjectValue(transformID).getUnitDoubleValue(stringIDToTypeID("yy"));
                        size = (size * mFactor).toFixed(2).toString().replace(/0+$/g,'').replace(/\.$/,'');
                    }
                }
            }

            contents = contents.replace(/(j)/g, 'l');
            contents = contents.replace(/(g|p|q|y|Q)/g, 'c');
            textItem.contents = contents;
            this.setFontSizePixels(parseFloat(size));
        } catch(e) {}

        var bounds = artLayer.bounds;
        textBaseLine = bounds[3];
    },

    //Set the font size to text item in pixel.
    setFontSizePixels : function(size) {
        var magicNumber = app.charIDToTypeID("0042");
        var layerDesc = new ActionDescriptor();  
        var ref = new ActionReference();  
        ref.putProperty(app.charIDToTypeID('Prpr'), app.charIDToTypeID('TxtS'));  
        ref.putEnumerated(app.charIDToTypeID('TxLr'), app.charIDToTypeID('Ordn'), app.charIDToTypeID('Trgt'));
        layerDesc.putReference(app.charIDToTypeID('null'), ref);

        var propertyDesc = new ActionDescriptor();  
        propertyDesc.putInteger(app.stringIDToTypeID('textOverrideFeatureName'), magicNumber);  
        propertyDesc.putInteger(app.stringIDToTypeID('typeStyleOperationType'), 3);
        propertyDesc.putUnitDouble(app.charIDToTypeID('Sz  '), app.charIDToTypeID('#Pxl'), size);
        layerDesc.putObject(app.charIDToTypeID('T   '), app.charIDToTypeID('TxtS'), propertyDesc);
        executeAction(app.charIDToTypeID('setd'), layerDesc, DialogModes.NO);
    },

    //Create text spec for horizontal distances for spacing specs between two objects.
    createHorizontalSpec : function(x1, x2, y1, y2, startRulerUnits, legendLayer) {
        try {
            var distance = Math.abs(x2-x1);
            var spacing = 3+0.3*model.armWeight;
            var armWidth = model.armWeight/2;
            var newColor = $.specctrPsCommon.legendColor(model.legendColorSpacing);
            if(!model.specInPrcntg) {
                //Absolute distance.
                distance = $.specctrPsCommon.pointsToUnitsString($.specctrPsCommon.getScaledValue(distance), startRulerUnits);
            } else {
                //Relative distance with respect to original canvas.
                var relativeWidth='';
                var orgnlCanvas = $.specctrPsCommon.originalCanvasSize();       //Get the original canvas size.
                if(model.relativeWidth != 0)
                    relativeWidth = model.relativeWidth;
                else
                    relativeWidth = orgnlCanvas[2];
                distance = Math.round(1.0 * distance/relativeWidth*10000)/100 + "%";
            }

            if(model.decimalFractionValue === "fraction")
                distance = $.specctrPsCommon.decimalToFraction(distance);

            var textLayer = legendLayer.artLayers.add();
            textLayer.kind = LayerKind.TEXT;
            var specText = textLayer.textItem;
            specText.kind = TextType.POINTTEXT;
            specText.justification = Justification.CENTER; 
            specText.color.rgb = newColor;
            specText.font = model.legendFont;
            specText.size = model.legendFontSize;
            specText.contents = distance;
            specText.position = [(x1+x2)/2.0, y1-spacing-armWidth];
            textLayer.move(legendLayer, ElementPlacement.INSIDE);
            
            var line = $.specctrPsCommon.createLine(x1, y1, x2, y2, newColor);
            var aPos = x2+armWidth;
            var bPos = y1+spacing;
            var cPos = y2-spacing;
            $.specctrPsCommon.setShape(aPos, bPos, aPos, cPos);    //horizontal left line.
            aPos = x1-armWidth;
            $.specctrPsCommon.setShape(aPos, bPos, aPos, cPos);    //horizontal right line.
        } catch(e) {}
    },

    //Create text spec for vertical distances for spacing specs between two objects.
    createVertSpec : function(x1, x2, y1, y2, startRulerUnits, legendLayer) {    
        try {
            var distance = Math.abs(y2-y1);
            var spacing = 3+0.3*model.armWeight;
            var armWidth = model.armWeight/2;
            var newColor = $.specctrPsCommon.legendColor(model.legendColorSpacing);
            if(!model.specInPrcntg) {
                //Value after applying scaling.
                distance = $.specctrPsCommon.pointsToUnitsString($.specctrPsCommon.getScaledValue(distance), startRulerUnits);
            } else {
                //Relative distance with respect to original canvas.
                var relativeHeight='';
                var orgnlCanvas = $.specctrPsCommon.originalCanvasSize();       //Get the original canvas size.
                if(model.relativeHeight != 0)
                    relativeHeight = model.relativeHeight;
                else
                    relativeHeight = orgnlCanvas[3];
                distance = Math.round(1.0 * distance/relativeHeight*10000)/100 + "%";
            }

            if(model.decimalFractionValue === "fraction")
                distance = $.specctrPsCommon.decimalToFraction(distance);

            var textLayer = legendLayer.artLayers.add();
            textLayer.kind = LayerKind.TEXT;
            var specText = textLayer.textItem;
            specText.kind = TextType.POINTTEXT;
            specText.justification = Justification.RIGHT;
            specText.color.rgb = newColor;
            specText.font = model.legendFont;
            specText.size = model.legendFontSize;
            specText.contents = distance;
            specText.position = [x1-spacing-armWidth, (y1+y2)/2.0];
            textLayer.move(legendLayer, ElementPlacement.INSIDE);
            
            var line = $.specctrPsCommon.createLine(x1, y1, x2, y2, newColor);
            var aPos =  y2+armWidth;
            $.specctrPsCommon.setShape(x1-spacing, aPos, x1+spacing, aPos);    //vertical top line.
            aPos =  y1-armWidth;
            $.specctrPsCommon.setShape(x2-spacing, aPos, x2+spacing, aPos);    //vertical bottom line.
        } catch(e) {}
    },

    //Set XMPMetadata for the layers on which spacing specs between two object applied.
    setXmpDataForSpacingSpec : function(activeLayer, value, specString, index) {
        try {
            var layerXMP = new XMPMeta(activeLayer.xmpMetadata.rawData);
        } catch(e) {
            layerXMP = new XMPMeta();			// layer did not have metadata so create new
        }

        try {
            var noOfItemsInArray = layerXMP.countArrayItems(XMPConst.NS_PHOTOSHOP, specString);
            if(index) {
                layerXMP.setArrayItem(XMPConst.NS_PHOTOSHOP, specString, index, value.toString());
            } else {
                layerXMP.appendArrayItem(XMPConst.NS_PHOTOSHOP, specString, null, XMPConst.PROP_IS_ARRAY, XMPConst.ARRAY_IS_ORDERED);
                layerXMP.insertArrayItem(XMPConst.NS_PHOTOSHOP, specString, noOfItemsInArray - 1, value.toString());
            }
            activeLayer.xmpMetadata.rawData = layerXMP.serialize();
        } catch(e) {}
    }

};
