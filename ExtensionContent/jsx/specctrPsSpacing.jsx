
#include"specctrPsCommon.jsx";
if(typeof($)=== 'undefined')
	$={};

var model;
$.specctrPsSpacing = {
    //Suspend the history of creating spacing spec of layers.
    createSpacingSpecs : function() {
        try {
            var selectedArtItems = $.specctrPsCommon.getSelectedLayers();
            var numberOfSelectedItems = selectedArtItems.length;
            var doc = app.activeDocument;
            var pref = app.preferences;
            var startRulerUnits = pref.rulerUnits; 
            pref.rulerUnits = Units.PIXELS;
            model = $.specctrPsCommon.getModel();
            var lyr = charIDToTypeID("Lyr ");
            var ordn = charIDToTypeID("Ordn");
            var trgt = charIDToTypeID("Trgt");
            var layerEffects = stringIDToTypeID('layerEffects');
            var layerFXVisible = stringIDToTypeID('layerFXVisible');
            if(numberOfSelectedItems === 2) {
                //get selected art items.
                var artLayer1 = $.specctrPsCommon.selectLayerByIndex(selectedArtItems[0]);
                var artLayer2 = $.specctrPsCommon.selectLayerByIndex(selectedArtItems[1]);

                if(artLayer1.typename === "LayerSet" || artLayer2.typename === "LayerSet") {
                    alert("Please select shape layers or text layers only.");
                    return;
                }

                doc.activeLayer = artLayer1;
                var ref = new ActionReference();
                ref.putEnumerated(lyr, ordn, trgt);
                var layer = executeActionGet(ref);
                if(layer.hasKey(layerEffects) && layer.getBoolean(layerFXVisible))
                    var bounds1 = $.specctrPsCommon.returnBounds(artLayer1);
                else
                    bounds1 = artLayer1.bounds;

                doc.activeLayer = artLayer2;
                ref = new ActionReference();
                ref.putEnumerated(lyr, ordn, trgt);
                layer = executeActionGet(ref);
                if(layer.hasKey(layerEffects) && layer.getBoolean(layerFXVisible))
                    var bounds2 = $.specctrPsCommon.returnBounds(artLayer2);
                else
                    bounds2 = artLayer2.bounds;

                pref.rulerUnits = startRulerUnits;
                app.activeDocument.suspendHistory('Spacing spec', 'this.createSpacingSpecsForTwoItems(artLayer1, artLayer2, bounds1, bounds2)');
            } else if(numberOfSelectedItems === 1) {
                var artLayer = doc.activeLayer;
                if(!$.specctrPsCommon.startUpCheckBeforeSpeccing(artLayer))      //Check if layer is valid for speccing i.e. not an artlayer set or specced object.
                    return;

                ref = new ActionReference();
                ref.putEnumerated(lyr, ordn, trgt);
                layer = executeActionGet(ref);
                if(layer.hasKey(layerEffects) && layer.getBoolean(layerFXVisible))
                    var bounds = $.specctrPsCommon.returnBounds(artLayer);
                else
                    bounds = artLayer.bounds;

                pref.rulerUnits = startRulerUnits;
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
        var spacingSpec = "", legendLayer = "";
        var indexOfSpecInFirstLayerXMPArray = "";
        var indexOfSpecInSecondLayerXMPArray = "";
        var idSpacingSpec = this.getXMPDataForSpacingSpec(artLayer1, uniqueIdOfSecondLayer, "idSpacingSpec");
        if(idSpacingSpec) {
            spacingSpec = $.specctrPsCommon.getLayerByID(idSpacingSpec);
            if(spacingSpec) {
                legendLayer = spacingSpec.parent;
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
        if(artLayer1.kind === LayerKind.TEXT && artLayer1.textItem.kind === TextType.POINTTEXT) {
            doc.activeLayer = artLayer1;
            var baseLinePosition = this.getPointTextBaseLine(artLayer1.textItem);
            bounds1[3] = artLayer1.textItem.position[1] + baseLinePosition;
        }
        if(artLayer2.kind === LayerKind.TEXT && artLayer2.textItem.kind === TextType.POINTTEXT) {
            doc.activeLayer = artLayer2;
            var baseLinePosition = this.getPointTextBaseLine(artLayer2.textItem);
            bounds2[3] = artLayer2.textItem.position[1] + baseLinePosition;
        }

        // Check overlap
        if (bounds1[0]<bounds2[2] && bounds1[2]>bounds2[0] &&
            bounds1[3]>bounds2[1] && bounds1[1]<bounds2[3]) {
            isOverlapped = true;
        }
        if(legendLayer === "") {
            legendLayer = $.specctrPsCommon.legendSpecLayer("Spacing").layerSets.add();
            legendLayer.name = "Specctr Spacing Mark";
        }
        var spec = legendLayer.layerSets.add();
        spec.name = "SpacingSpec";

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
        spec = $.specctrPsCommon.createSmartObject();
        uniqueIdOfSpec = $.specctrPsCommon.getIDOfLayer();
        $.specctrPsCommon.setXmpDataForSpec(spec, "true", "SpeccedObject");
        $.specctrPsCommon.setXmpDataForSpec(spec, uniqueIdOfFirstLayer, "firstLayer");
        $.specctrPsCommon.setXmpDataForSpec(spec, uniqueIdOfSecondLayer, "secondLayer");
        $.specctrPsCommon.selectLayers(artLayer1.name, artLayer2.name);
        this.setXmpDataForSpacingSpec(artLayer1, uniqueIdOfSpec, "idSpacingSpec", indexOfSpecInFirstLayerXMPArray);
        this.setXmpDataForSpacingSpec(artLayer2, uniqueIdOfSpec, "idSpacingSpec", indexOfSpecInSecondLayerXMPArray);
        $.specctrPsCommon.setPreferences(startRulerUnits, startTypeUnits, originalDPI);      //Setting the original preferences of the document.
    },

    //Create the spacing spec for a selected layer.
    createSpacingSpecsForSingleItem : function(artLayer, bounds) {
         if(ExternalObject.AdobeXMPScript == null)
            ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');		//Load the XMP Script library to access XMPMetadata info of layers.

        var spacingSpec = "", legendLayer = "";
        var idSpacingSpec = $.specctrPsCommon.getXMPData(artLayer, "idSingleSpacingSpec");
        if(idSpacingSpec) {
            spacingSpec = $.specctrPsCommon.getLayerByID(idSpacingSpec);
            if(spacingSpec) {
                legendLayer = spacingSpec.parent;
                spacingSpec.remove();
            }
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
        var cnvsRect = $.specctrPsCommon.originalCanvasSize();       //Get the original canvas size.
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

        if(legendLayer === "") {
            legendLayer = $.specctrPsCommon.legendSpecLayer("Spacing").layerSets.add();
            legendLayer.name = "Specctr Spacing Mark";
        }

        var specItemsGroup = legendLayer.layerSets.add();
        specItemsGroup.name = "SpacingSpec";

        var lines = "", specText = "", textLayer = "";
        var distanceValue = "";
        var aPos, bPos, cPos;

        if(model.spaceTop) {
            if(!model.specInPrcntg)
                distanceValue = $.specctrPsCommon.pointsToUnitsString($.specctrPsCommon.getScaledValue(bounds[1] - cnvsRect[1]), startRulerUnits);
            else
                 distanceValue = Math.round((bounds[1] - cnvsRect[1]) / relativeHeight * 10000) / 100 + "%";
            
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
            cPos = aPos + spacing;
            lines = $.specctrPsCommon.createLine(cPos, cnvsRect[1], cPos, bounds[1], newColor);      //Main top line.
            bPos = bounds[1] - armWidth;
            cPos = cPos + spacing;
            $.specctrPsCommon.setShape(aPos, bPos, cPos, bPos);   //Top line's top.
            bPos = cnvsRect[1] + armWidth;
            $.specctrPsCommon.setShape(aPos, bPos, cPos, bPos);   //Top line's bottom.
        }

        if(model.spaceLeft) {
            if(!model.specInPrcntg)
                distanceValue = $.specctrPsCommon.pointsToUnitsString($.specctrPsCommon.getScaledValue(bounds[0] - cnvsRect[0]), startRulerUnits);
            else
                 distanceValue = Math.round((bounds[0] - cnvsRect[0]) / relativeWidth * 10000) / 100 + "%";

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
            bPos = cPos + spacing;
            lines = $.specctrPsCommon.createLine(cnvsRect[0], bPos, bounds[0], bPos, newColor);    //Main left line.
            bPos = bPos + spacing;
            aPos = bounds[0] - armWidth;
            $.specctrPsCommon.setShape(aPos, bPos, aPos, cPos);   //Left line's left.
            aPos = cnvsRect[0] + armWidth;
            $.specctrPsCommon.setShape(aPos, bPos, aPos, cPos);   //Left line's right.
        }

        if(model.spaceRight) {
            if(!model.specInPrcntg)
                distanceValue =  $.specctrPsCommon.pointsToUnitsString($.specctrPsCommon.getScaledValue(cnvsRect[2] - bounds[2]), startRulerUnits);
            else
                 distanceValue = Math.round((cnvsRect[2] - bounds[2]) / relativeWidth * 10000) / 100 + "%";

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
            bPos = cPos + spacing;
            lines = $.specctrPsCommon.createLine(cnvsRect[2], bPos, bounds[2], bPos, newColor);    //Main Right line.
            bPos = bPos + spacing;
            aPos = bounds[2] + armWidth;
            $.specctrPsCommon.setShape(aPos, bPos, aPos, cPos);   //Right line's left.
            aPos = cnvsRect[2] - armWidth;
            $.specctrPsCommon.setShape(aPos, bPos, aPos, cPos);   //Right line's right.
        }

        if(model.spaceBottom) {
            if(artLayer.kind === LayerKind.TEXT && artLayer.textItem.kind === TextType.POINTTEXT) {
                doc.activeLayer = artLayer;
                var baseLinePosition = this.getPointTextBaseLine(artLayer.textItem);
                bounds[3] = artLayer.textItem.position[1] + baseLinePosition;
            }

            if(!model.specInPrcntg)
                distanceValue =  $.specctrPsCommon.pointsToUnitsString($.specctrPsCommon.getScaledValue(cnvsRect[3] - bounds[3]), startRulerUnits);
            else
                 distanceValue = Math.round((cnvsRect[3] - bounds[3]) / relativeHeight * 10000) / 100 + "%";

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
        specItemsGroup = $.specctrPsCommon.createSmartObject();
        idSpacingSpec = $.specctrPsCommon.getIDOfLayer();

        doc.activeLayer = artLayer;
        $.specctrPsCommon.setXmpDataForSpec(artLayer, idSpacingSpec, "idSingleSpacingSpec");
        $.specctrPsCommon.setXmpDataForSpec(specItemsGroup, "true", "SpeccedObject");
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
    getPointTextBaseLine : function(textItem) {
        var imFactor = "";
        var leading = "", size = "";
        var kDefaultLeadVal = 120.0, kDefaultFontSize= 12;
        var isAutoLeading="";
        
        var sizeID = stringIDToTypeID("size");
        var transformID = stringIDToTypeID("transform");
        var yyID = stringIDToTypeID("yy");
        var autoLeadingID = stringIDToTypeID("autoLeading");
        var ref = new ActionReference();
        ref.putEnumerated( charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') ); 
        var desc = executeActionGet(ref).getObjectValue(stringIDToTypeID('textKey'));

        //Character Styles
        var textStyleRangeID = stringIDToTypeID("textStyleRange");
        var textStyleID = stringIDToTypeID("textStyle");
        var txtList = desc.getList(textStyleRangeID);
        var txtDesc = txtList.getObjectValue(0);
        
        if(txtDesc.hasKey(textStyleID)) {
            var rangeList = desc.getList(textStyleRangeID);
            var styleDesc = rangeList.getObjectValue(0).getObjectValue(textStyleID);
            if(styleDesc.hasKey(sizeID)) {
                size =  styleDesc.getDouble(sizeID);
                if(desc.hasKey(transformID)) {
                    mFactor = desc.getObjectValue(transformID).getUnitDoubleValue (yyID);
                    size = (size* mFactor).toFixed(2).toString().replace(/0+$/g,'').replace(/\.$/,'');
                }
            }
            if(styleDesc.hasKey(autoLeadingID)) {
                isAutoLeading = styleDesc.getBoolean(autoLeadingID);
                if(isAutoLeading == false) {
                     leading = styleDesc.getDouble(stringIDToTypeID("leading"));
                     if(desc.hasKey(transformID)) {
                         mFactor = desc.getObjectValue(transformID).getUnitDoubleValue (yyID);
                         leading = (leading* mFactor).toFixed(2).toString().replace(/0+$/g,'').replace(/\.$/,'');
                     }
                }
            }
        }
        
        //Paragraph styles.
        var paragraphStyleID = stringIDToTypeID("paragraphStyle");
        var defaultStyleID = stringIDToTypeID("defaultStyle");
        var paraList = desc.getList(stringIDToTypeID("paragraphStyleRange"));
        var paraDesc = paraList.getObjectValue(0);
        if (paraDesc.hasKey(paragraphStyleID)) {
            var paraStyle = paraDesc.getObjectValue(paragraphStyleID);
            if(paraStyle.hasKey(defaultStyleID)) {
                var defStyle = paraStyle.getObjectValue(defaultStyleID);
                if(size === " " && defStyle.hasKey(sizeID)) {
                    size = defStyle.getDouble(sizeID);
                    if(desc.hasKey(transformID)) {
                        var mFactor = desc.getObjectValue(transformID).getUnitDoubleValue (yyID);
                        size = (size* mFactor).toFixed(2).toString().replace(/0+$/g,'').replace(/\.$/,'');
                    }
                }
                if (leading === "" && defStyle.hasKey(autoLeadingID)) {
                    isAutoLeading = defStyle.getBoolean(autoLeadingID);
                    if(isAutoLeading == false) {
                        leading = defStyle.getDouble(stringIDToTypeID("leading"));
                        if(desc.hasKey(transformID)) {
                            mFactor = desc.getObjectValue(transformID).getUnitDoubleValue(yyID);
                            leading = (leading* mFactor).toFixed(2).toString().replace(/0+$/g,'').replace(/\.$/,'');
                        }
                     }
                 }
            }
        }

        if(leading == "" || isAutoLeading == true)
            leading =  size / 100 * Math.round(kDefaultLeadVal);

        leading = Math.round(leading * 100) / 100;
        var contents = textItem.contents;
        contents = contents.replace(/^\s+|\s+$/gm,'');                  //Trim the spaces.
        var lastChar = contents.charAt (contents.length - 1);
        while(lastChar === "\u0003" || lastChar === "\r") {
            contents = contents.slice (0, contents.length - 1);
            lastChar = contents.charAt (contents.length - 1);
        }
        var lines = contents.split(/[\u0003\r]/);  //Splitting content from Enter or Shift+Enter.
        return (lines.length - 1) * leading;
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
                distance = Math.round(distance/relativeWidth*10000)/100 + "%";
            }
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
                distance = Math.round(distance/relativeHeight*10000)/100 + "%";
            }
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