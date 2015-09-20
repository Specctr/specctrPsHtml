﻿/*//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 * File Name: specctrPsProperties.jsx
 * Description: Include the methods for creation, updation and deletion of properties specs
  for the selected art object.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

#include "specctrPsCommon.jsx"
#include "specctrPsSwatches.jsx"
if(typeof($)=== 'undefined')
	$={};

var model;
var cssText = "";
var cssBodyText = "";
$.specctrPsProperties = {
    //Suspend the history of creating properties spec of layers.
    createPropertySpecsForItem : function() {
        try {
            var sourceItem = $.specctrPsCommon.getActiveLayer();
            if(sourceItem === null)
                return;

            var pref = app.preferences;
            var startRulerUnits = pref.rulerUnits; 
            pref.rulerUnits = Units.PIXELS;
            var ref = new ActionReference();
            ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            var layer = executeActionGet(ref);
            if(layer.hasKey(stringIDToTypeID('layerEffects')) && layer.getBoolean(stringIDToTypeID('layerFXVisible')))
                var bounds = $.specctrPsCommon.returnBounds(sourceItem);
            else
                bounds = sourceItem.bounds;

            pref.rulerUnits = startRulerUnits;
            
            //Check artboard is present or not and make changes in bounds accordingly.
            app.activeDocument.suspendHistory('Property Specs', 'this.createPropertySpecs(sourceItem, bounds)');
        } catch(e) {}
    },

    //Get the property of selected layer and show it on active document.
    createPropertySpecs : function(sourceItem, bounds) {
        var doc = app.activeDocument;
        var spacing = 10;
        var infoText;
        model = $.specctrPsCommon.getModel();
        var newColor = $.specctrPsCommon.legendColor(model.legendColorObject);
        var artLayer = sourceItem;
        var spec, idLayer, idSpec, lyr;
        var idBullet, bullet, dupBullet, idDupBullet;
        var legendLayer, noteSpecBottom = bounds[1];

        try {
            //WARNiNG: Do Check it is specctr's specctr or any other specctr.
            var specctrLayerSet = artLayer.parent.parent.parent;
            if(artLayer.typename === "LayerSet" || specctrLayerSet.name === "Specctr" ||
                specctrLayerSet.parent.name === "Specctr")
                return;
        } catch (e) {}

        if(ExternalObject.AdobeXMPScript == null)
            ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');		//Load the XMP Script library to access XMPMetadata info of layers.
        
         var noteId = $.specctrPsCommon.getXMPData(artLayer, "idNote");			//Check if metadata of the layer is already present or not.
         if(noteId != null) {
             var noteLegendLayer = $.specctrPsCommon.getLayerByID(noteId);
             if(noteLegendLayer) {
                try {
                    var noteSpec = noteLegendLayer.artLayers.getByName("Specs");
                    noteSpecBottom = noteSpec.bounds[3] + spacing;
                } catch (e) {}
            }
         }
     
         idSpec = $.specctrPsCommon.getXMPData(artLayer, "idSpec");			//Check if metadata of the layer is already present or not.
         if(idSpec != null) {
             legendLayer = $.specctrPsCommon.getLayerByID(idSpec);
             if(legendLayer) {
                this.updateSpec(sourceItem, legendLayer, bounds, noteSpecBottom, noteLegendLayer);
                return;
            }
         }

        //Check artboard is present or not and make changes in bounds accordingly.
        var parent = doc;

        var cnvsRect = $.specctrPsCommon.getArtBoardBounds(artLayer);
        if(cnvsRect == null) {
            cnvsRect = [0, 0, doc.width, doc.height];
        } else {
            parent = $.specctrPsCommon.getArtBoard(artLayer);
        }
    
         try {
            idLayer = $.specctrPsCommon.getIDOfLayer();   //Get unique ID of selected layer.
            var artLayerBounds = bounds;
            var name = artLayer.name;
            var nameLength = name.length;

            switch(sourceItem.kind) {
                case LayerKind.TEXT:
                    infoText  = this.getSpecsInfoForTextItem(sourceItem);
                    newColor = $.specctrPsCommon.legendColor(model.legendColorType);
                    legendLayer = this.legendPropertiesLayer("Text Specs", parent).layerSets.add();
                    legendLayer.name = "Text Spec ";
                    
                    if(model.textLayerName) {
                        var wordsArray = name.split(" ");
                        if(wordsArray.length > 2)
                            name = wordsArray[0] + " " + wordsArray[1] + " " + wordsArray[2];
                        infoText = "\r"+name+infoText;
                    } else {
                        infoText = "\r"+infoText;
                        nameLength = 0;
                    }
                    break;
             
                case LayerKind.GRADIENTFILL:
                case LayerKind.SOLIDFILL: 
                    infoText = this.getSpecsInfoForPathItem(sourceItem);
                    legendLayer = this.legendPropertiesLayer("Object Specs", parent).layerSets.add();
                    legendLayer.name = "Object Spec ";
                    if(model.shapeLayerName) {
                        infoText = "\r"+name+infoText;
                    } else {
                        infoText = "\r"+infoText;
                        nameLength = 0;
                    }
                    break;

                default: 
                    infoText = this.getSpecsInfoForGeneralItem(sourceItem); 
                    legendLayer = this.legendPropertiesLayer("Object Specs", parent).layerSets.add();
                    legendLayer.name = "Object Spec ";
                    infoText = "\r"+name+infoText;
            }

            if (infoText === "") 
                return;

            idSpec = $.specctrPsCommon.getIDOfLayer();

            //Save the current preferences
            var startTypeUnits = app.preferences.typeUnits; 
            var startRulerUnits = app.preferences.rulerUnits;
            var originalDPI = doc.resolution;
            $.specctrPsCommon.setPreferences(Units.PIXELS, TypeUnits.PIXELS, 72);
            
            var isLeft, pos;
            var centerX = (artLayerBounds[0] + artLayerBounds[2]) / 2;             //Get the center of item.
            var centerY = (artLayerBounds[1] + artLayerBounds[3]) / 2;
            var font = model.legendFont;

            //Create spec text for art object.
            legendLayer.visible = false;
            var spec = legendLayer.artLayers.add();
            spec.kind = LayerKind.TEXT;
            var specText = spec.textItem;
            specText.kind = TextType.POINTTEXT;
            specText.contents = infoText;
            if(nameLength != 0)
                this.applyBold(1, nameLength + 1);
            specText.color.rgb = newColor;
            specText.font = font;
            specText.size = model.legendFontSize;
            spec.name = "Specs";
            
            //Number system..
            if(model.specOption == "Bullet") {
                
                if(noteLegendLayer) {
                     try {
                        bullet = noteLegendLayer.artLayers.getByName("__sFirstBullet");
                    } catch (e) {}
                 }
         
              //Check if any number is linked with selected art layer or not, if not then assign a number.
                if (!bullet) {
                    var number = $.specctrPsCommon.getBulletNumber(artLayer, parent, true);
                    bullet = $.specctrPsCommon.createBullet(legendLayer, number, font, artLayerBounds, newColor);
                }
            
                var dia = bullet.bounds[2] - bullet.bounds[0];
                bullet.translate(artLayerBounds[0]-bullet.bounds[0]-dia-1, artLayerBounds[1]-bullet.bounds[1]-1);
                dupBullet = bullet.duplicate(bullet, ElementPlacement.PLACEBEFORE);
                dupBullet.move(legendLayer, ElementPlacement.INSIDE);
                
                //Adjust position of spec items.
               $.specctrPsCommon.adjustPositionOfSpecItems(spec, specText, dupBullet, noteSpecBottom, cnvsRect[0] + spacing, 
                                                                  (cnvsRect[0] + cnvsRect[2])/2.0, centerX, dia, true, cnvsRect);
                dupBullet.name = "__sSecondBullet";
                spec.link(dupBullet);
                legendLayer.visible = true;
                bullet.visible = true;
            } else {
                //Calcutate the position of spec text item.
                if(centerX <=  (cnvsRect[0] + cnvsRect[2])/2.0) {
                    specText.justification = Justification.LEFT;
                    spec.translate(-(spec.bounds[0]-spacing-cnvsRect[0]), noteSpecBottom-spec.bounds[1]);
                } else {
                    specText.justification = Justification.RIGHT;
                    spec.translate(cnvsRect[2]-spacing-spec.bounds[2], noteSpecBottom-spec.bounds[1]);
                }

                //Get the end points for arm.
                legendLayer.visible = true;
                arm = $.specctrPsCommon.createArm(specText, spec, artLayerBounds, newColor);
                arm.name = "__sArm";
                spec.link(arm);
            }
        
            if(cssText === "")
                cssText = name + " {" + infoText.toLowerCase() + "}";
            
             var xmpData = [{layerHandler : legendLayer, 
                                    properties : [{name : "idLayer", value : idLayer}, 
                                                        {name : "idSpec", value : idSpec}]
                                    }, 
                                    {layerHandler : artLayer,
                                        properties : [{name : "idLayer", value : idLayer}, 
                                                            {name : "idSpec", value : idSpec}]
                                    },
                                    {layerHandler : spec,
                                        properties : [{name : "css", value : cssText}]
                                    }
                                ];

            $.specctrPsCommon.setXmpDataOfLayer(xmpData);

        } catch(e) {alert(e);}

        doc.activeLayer = artLayer;
        $.specctrPsCommon.setPreferences(startRulerUnits, startTypeUnits, originalDPI);
    },

    //Update the property spec of the layer whose spec is already present.
    updateSpec : function(artLayer, legendLayer, bounds, specYPos, noteLegendLayer) {
        // Save the current preferences
        var startTypeUnits = app.preferences.typeUnits;
        var startRulerUnits = app.preferences.rulerUnits;
        app.preferences.rulerUnits = Units.PIXELS;
        
        var doc = app.activeDocument;
        var originalDPI = doc.resolution;
        var spacing = 10;
        var newColor = $.specctrPsCommon.legendColor(model.legendColorObject);
        var infoText, isBulletCreated;
        var font = model.legendFont;
        var artLayerBounds = bounds;
        var pos, idDupBullet, idBullet;
        var isNewSpecCreated = false;
        var name = artLayer.name;
        doc.activeLayer = artLayer;

        try {
            switch(artLayer.kind) {
                case LayerKind.TEXT:
                    infoText   = this.getSpecsInfoForTextItem(artLayer);
                    newColor = $.specctrPsCommon.legendColor(model.legendColorType);
                    if(model.textLayerName) {
                        var wordsArray = name.split(" ");
                        if(wordsArray.length > 2)
                            name = wordsArray[0] + " " + wordsArray[1] + " " + wordsArray[2];
                    } else {
                        name = "";
                    }
                    break;

                case LayerKind.GRADIENTFILL:
                case LayerKind.SOLIDFILL: 
                    infoText = this.getSpecsInfoForPathItem(artLayer);
                    if(!model.shapeLayerName)
                        name = "";
                    break;

                default: 
                    infoText = this.getSpecsInfoForGeneralItem(artLayer); 
            }
        
            if(infoText == "") 
                return;

            var justification = Justification.LEFT;
            
            var nameLength = name.length;
            infoText = "\r"+name+infoText;
            app.preferences.typeUnits = TypeUnits.PIXELS;
            doc.resizeImage(null, null, 72, ResampleMethod.NONE);

            try {
                var specText;
                var spec = legendLayer.artLayers.getByName("Specs");
                doc.activeLayer = spec;
                specText = spec.textItem;
                justification = specText.justification;
            } catch (e) {
                spec = legendLayer.artLayers.add();
                spec.kind = LayerKind.TEXT;
                specText = spec.textItem;
                specText.kind = TextType.POINTTEXT;
                spec.name = "Specs";
                isNewSpecCreated = true;
            }

            specText.contents = infoText;
            if(nameLength != 0)
                this.applyBold(1, nameLength+1);
            specText.color.rgb = newColor;
            specText.font = font;
            specText.size = model.legendFontSize;
            specText.justification = justification;

            var centerX = (artLayerBounds[0] + artLayerBounds[2])/2;
            var centerY = (artLayerBounds[1] + artLayerBounds[3]) / 2;
            
            $.specctrPsCommon.deleteArtLayerByName(legendLayer, "__sFirstBullet");
            $.specctrPsCommon.deleteArtLayerByName(legendLayer, "__sSecondBullet");
            $.specctrPsCommon.deleteArtLayerByName(legendLayer, "__sArm");

            if(model.specOption == "Bullet") {
                $.specctrPsCommon.deleteArtLayerByName(noteLegendLayer, "__sFirstBullet");
                //Check if any number is linked with selected art layer or not, if not then assign a number.
               var number = $.specctrPsCommon.getBulletNumber(artLayer, legendLayer.parent.parent.parent.parent, false);
                
                var bullet = $.specctrPsCommon.createBullet(legendLayer, number, font, artLayerBounds, newColor);
                bullet.name = "__sFirstBullet";
                
                var dupBullet = bullet.duplicate(bullet, ElementPlacement.PLACEBEFORE);
                dupBullet.name = "__sSecondBullet";
                dupBullet.move(legendLayer, ElementPlacement.INSIDE);
                
                var dia = bullet.bounds[2] - bullet.bounds[0];
                //Adjust position of spec items.
               $.specctrPsCommon.adjustPositionOfSpecItems(spec, specText, dupBullet, specYPos, spacing, centerX, 
                                                                    (spec.bounds[0] + spec.bounds[2]) / 2.0, dia, isNewSpecCreated);

                bullet.translate(artLayerBounds[0]-bullet.bounds[0]-dia-1, artLayerBounds[1]-bullet.bounds[1]-1);
                spec.link(dupBullet);
            } else {

                //Calcutate the position of spec text item.
                if (isNewSpecCreated == true) {
                    if(centerX <=  doc.width/2.0) {
                        specText.justification = Justification.LEFT;
                        spec.translate(-(spec.bounds[0]-spacing), specYPos-spec.bounds[1]);
                    } else {
                        specText.justification = Justification.RIGHT;
                        spec.translate(doc.width-spacing-spec.bounds[2], specYPos-spec.bounds[1]);
                    }
                }

                //Create the arm at  the end points of spec and selected art layer.
                arm = $.specctrPsCommon.createArm(specText, spec, artLayerBounds, newColor);
                arm.name = "__sArm";
                spec.link(arm);
            }

            if(cssText == "")
                cssText = name + " {" + infoText.toLowerCase() + "}";

            var xmpData = [{layerHandler : spec,
                                        properties : [{name : "css", value : cssText}]
                                    }
                                ];
            // Set Xmp metadata for spec and bullet.
            $.specctrPsCommon.setXmpDataOfLayer(xmpData);
        } catch(e) {}

        doc.activeLayer = artLayer;
        doc.resizeImage(null, null, originalDPI, ResampleMethod.NONE);
        // Reset the application preferences
        app.preferences.typeUnits = startTypeUnits;
        app.preferences.rulerUnits = startRulerUnits;
    },

    //Get the properties of the text item.
    getSpecsInfoForTextItem : function(pageItem) {
        var textItem = pageItem.textItem;
        var infoText = "";
        var rltvFontSize = 16;

        try {
            var name = pageItem.name;
            var wordsArray = name.split(" ");
            if(wordsArray.length > 2)
                name = wordsArray[0] + " " + wordsArray[1] + " " + wordsArray[2];
            cssText = name.toLowerCase()+" {";
            
            var sizeID = stringIDToTypeID("size");
            var transformID = stringIDToTypeID("transform");
            var yyID = stringIDToTypeID("yy");
            var fontPostScriptID = stringIDToTypeID("fontPostScriptName");
            var trackingID = stringIDToTypeID("tracking");
            var underlineID = stringIDToTypeID("underline");
            var strikethroughID = stringIDToTypeID("strikethrough");
            var syntheticBoldID = stringIDToTypeID("syntheticBold");
            var syntheticItalicID = stringIDToTypeID("syntheticItalic");
            var autoLeadingID = stringIDToTypeID("autoLeading");
            var colorID = stringIDToTypeID("color");
            var fromId = stringIDToTypeID("from");
            var toId = stringIDToTypeID("to");

            var ref = new ActionReference();
            ref.putEnumerated( charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') ); 
            var desc = executeActionGet(ref).getObjectValue(stringIDToTypeID('textKey'));

            //Character Styles
            var textStyleRangeID = stringIDToTypeID("textStyleRange");
            var textStyleID = stringIDToTypeID("textStyle");
            var txtList = desc.getList(textStyleRangeID);
            var rangeListCount =txtList.count;
            for (var i = 0; i < rangeListCount; i++) {
                var alpha = "", leading = "", size = "", font = "";
                var kDefaultLeadVal = 120.0, kDefaultFontVal='MyriadPro-Regular', kDefaultFontSize= 12;
                var underline = "", strike = "", bold = "",  italic = "";
                var tracking = "", isAutoLeading="", color="", mFactor = "";
                
                var from = txtList.getObjectValue(i).getInteger(fromId);
                var to = txtList.getObjectValue(i).getInteger(toId);
                if(i > 0) {
                    if (txtList.getObjectValue(i - 1).getInteger(fromId) == from 
                        && txtList.getObjectValue(i - 1).getInteger(toId) == to) 
                            continue; 
                    
                    infoText += "\r";
                }
                
                var txtDesc = txtList.getObjectValue(i);
                if(txtDesc.hasKey(textStyleID)) {
                    var rangeList = desc.getList(textStyleRangeID);
                    var styleDesc = rangeList.getObjectValue(i).getObjectValue(textStyleID);
                    if(styleDesc.hasKey(sizeID)) {
                        size =  styleDesc.getDouble(sizeID);
                        if(desc.hasKey(transformID)) {
                            mFactor = desc.getObjectValue(transformID).getUnitDoubleValue (yyID);
                            size = (size* mFactor).toFixed(2).toString().replace(/0+$/g,'').replace(/\.$/,'');
                        }
                    }
                    if(styleDesc.hasKey(fontPostScriptID))
                        font =  styleDesc.getString(fontPostScriptID);
                    if(styleDesc.hasKey(trackingID))
                        tracking =  styleDesc.getString(trackingID);
                    if(styleDesc.hasKey(underlineID))
                        underline = typeIDToStringID(styleDesc.getEnumerationValue(underlineID));
                    if(styleDesc.hasKey(strikethroughID))
                        strike = typeIDToStringID(styleDesc.getEnumerationValue(strikethroughID));
                    if(styleDesc.hasKey(syntheticBoldID))
                        bold = styleDesc.getBoolean(syntheticBoldID);
                    if(styleDesc.hasKey(syntheticItalicID))
                        italic = styleDesc.getBoolean(syntheticItalicID);
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
                     if(styleDesc.hasKey(colorID)) 
                        color = this.getColor(styleDesc.getObjectValue(colorID));
                }
                
                if(model.textAlpha)
                    alpha = Math.round(pageItem.opacity)/100 ;

                if (model.textFont) {
                    if(font == "")
                        font = kDefaultFontVal;
                        
                    infoText += "\rFont-Family: " + font;
                    cssText += "font-family: " + font + ";";
                }

                //Get the font size.
                if (model.textSize) {
                    if(size == "")
                        size = kDefaultFontSize;
                    var fontSize = "";
                    //Calculate the font size in 'em' units.
                    if(model.specInEM) {
                        if(model.baseFontSize != 0)
                            rltvFontSize = model.baseFontSize;
                            
                        if($.specctrPsCommon.getTypeUnits() == 'mm')
                            rltvFontSize = $.specctrPsCommon.pointsToUnitsString(rltvFontSize, Units.MM).toString().replace(' mm','');
                        
                        fontSize = Math.round(size / rltvFontSize * 100) / 100 + " em";
                    } else {
                        fontSize = Math.round(size * 100) / 100;
                        fontSize = $.specctrPsCommon.getScaledValue(fontSize) + " " + $.specctrPsCommon.getTypeUnits();
                    }

                    infoText += "\rFont-Size: " + fontSize;
                    cssText += "font-size: " + fontSize + ";";
                }
            
                //Get the color of text.
                if (model.textColor) {
                    if(color == "")
                        color = this.getDefaultColor();

                    color = this.colorAsString(color);

                    if(alpha != "" && color.indexOf("(") >= 0) {
                        color = this.convertColorIntoCss(color, alpha);
                        alpha = "";
                    }
                    infoText += "\rColor: " + color;
                     cssText += "color: "+ color.toLowerCase() + ";";
                }

                //Get the style of text.
                if (model.textStyle) {
                    var styleString = "normal";
                    if (bold == true) 
                        styleString = "bold";
                    if (italic == true) 
                        styleString += "/ italic";

                    infoText += "\rFont-Style: " + styleString;
                    cssText += "font-style: "+ styleString + ";";
                    styleString = "";

                    if (underline != "" && underline != "underlineOff" )
                        styleString = "underline";
                    if (strike != "" && strike != "strikethroughOff") {
                        if(styleString != "")
                            styleString += "/ ";
                        styleString += "strike-through";
                    }
                
                    if(styleString != "") {
                        infoText += "\rText-Decoration: " + styleString;
                        cssText += "text-decoration: "+ styleString + ";";
                    }
                }

                //Get the alignment of the text.
                try {
                    if (model.textAlignment) {
                        var s = textItem.justification.toString();
                        s = s.substring(14,15).toLowerCase() + s.substring(15).toLowerCase();
                        infoText += "\rText-Align: " + s;
                        cssText += "text-align: " + s + ";";
                    }
                } catch(e) {
                   var alignment = this.getAlignment();
                   infoText += "\rText-Align: " + alignment;
                   cssText += "text-align: " + alignment + ";";
                }
           
                if (model.textLeading) {
                    if(leading == "" || isAutoLeading == true)
                        leading =  size / 100 * Math.round(kDefaultLeadVal);
                    leading = leading.toString().replace("px", "");
                    
                    //Calculate the line height in 'em' units.
                    if(model.specInEM) {
                        var rltvLineHeight = "";
                        if(model.baseLineHeight != 0)
                            rltvLineHeight = model.baseLineHeight;
                        else
                            rltvLineHeight = rltvFontSize * 1.4;
                        
                         if($.specctrPsCommon.getTypeUnits() == 'mm')
                                rltvLineHeight = $.specctrPsCommon.pointsToUnitsString(rltvLineHeight, Units.MM).toString().replace(' mm','');
                        
                        leading = Math.round(leading / rltvLineHeight * 100) / 100 + " em";
                    } else {   
                        leading = Math.round(leading * 100) / 100 + " " + $.specctrPsCommon.getTypeUnits();
                    }
                
                    infoText += "\rLine-Height: " + leading;
                    cssText += "line-height: " + leading + ";";
                }

                if (model.textTracking) {
                    var tracking = Math.round(tracking / 1000 * 100) / 100 + " em";
                    infoText += "\rLetter-Spacing: " + tracking;
                    cssText += "letter-spacing: " + tracking + ";";
                }
            
                if (alpha != "") {
                    infoText += "\rOpacity: " + alpha;
                    cssText += "opacity: " + alpha + ";";
                }
            
                if (model.textEffects) {
                    var strokeVal = this.getStrokeValOfLayer(pageItem);
                    if(strokeVal != "")
                        infoText += strokeVal;
                        
                    var effectValue = this.getEffectsOfLayer();
                    if(effectValue != "")
                        infoText += effectValue;
                        
                     app.activeDocument.activeLayer = pageItem;
                }
            }
        } catch(e) {
            alert(e);
        }

        cssText += "}";
        if(model.specInEM) {
            cssBodyText = "body {font-size: " + Math.round(10000 / 16 * rltvFontSize) / 100 + "%;}";
            $.specctrPsCommon.setCssBodyText(cssBodyText);
        }
        
        return infoText;
    },

    //Getting info for shape object.
    getSpecsInfoForPathItem : function(pageItem) {
        var pathItem = pageItem;
        var doc = app.activeDocument;
        var alpha = "", effectValue = "";
        var borderRadius = "", strokeVal = "";
        
        // Get the layer kind and color value of that layer.
        var infoText = "";
        cssText = "."+pathItem.name.toLowerCase()+" {";
        
        //Gives the opacity for the art layer,
        if(model.shapeAlpha)
            alpha = Math.round(pageItem.opacity)/100;
        
        app.activeDocument.activeLayer = pageItem;
        if(model.shapeBorderRadius)
            borderRadius = this.getRoundCornerValue();
        
        doc.activeLayer = pageItem;
        
        if(model.shapeStroke)
            strokeVal = this.getStrokeValOfLayer(pageItem);
        
        if(model.shapeEffects) {
            doc.activeLayer = pageItem;
            effectValue = this.getEffectsOfLayer();
        }
        
        try {
            if (model.shapeFill) {  
                doc.activeLayer = pageItem;
                var ref = new ActionReference();
                ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
                var desc = executeActionGet(ref).getList(charIDToTypeID("Adjs")).getObjectValue(0);
                doc.activeLayer = doc.layers[doc.layers.length-1];

                if(pathItem.kind == LayerKind.SOLIDFILL) {
                    var colorDescriptor = desc.getObjectValue(stringIDToTypeID('color'));
                    var solidColor = this.getColor(colorDescriptor);
                    var color = this.colorAsString(solidColor);
                    var swatchName = $.specctrPsSwatches.readFromRuntime(solidColor);
                    if(swatchName !== undefined)
                        infoText +="\r" + swatchName;
                    var cssColor = "";
                    
                    infoText += "\rBackground: ";
                    if(alpha != "" && color.indexOf("(") >= 0) {
                        cssColor = this.convertColorIntoCss(color, alpha);
                        alpha = "";
                    } else {
                        cssColor = color;
                    }
                
                    infoText += cssColor;
                    cssText += "background: " + cssColor + ";";
                } else if(pathItem.kind == LayerKind.GRADIENTFILL) {
                    var gradientValue = "";
                    infoText += "\rBackground: ";
                    gradientValue =  typeIDToStringID(desc.getEnumerationValue(charIDToTypeID("Type")))+" gradient ";
                    desc = desc.getObjectValue(charIDToTypeID("Grad"));
                    var colorList = desc.getList(charIDToTypeID("Clrs"));
                    var count = colorList.count;                                                 //Number of color stops in gradient
                    for( var c = 0; c < count; c++ ) {
                        desc = colorList.getObjectValue(c);                                            // get color descriptor
                        gradientValue += this.colorAsString(this.getColor(desc.getObjectValue(stringIDToTypeID('color'))))+" ";
                    }
                    
                    infoText += gradientValue;
                    cssText += "background: " + gradientValue +";";
                }
            }
        } catch(e) {}

        if(strokeVal != "")
            infoText += strokeVal;
        
        if(alpha != "") {
            infoText += "\rOpacity: "+alpha;
            cssText += "opacity: "+alpha+";";
        }
        
        if(effectValue != "")
            infoText += effectValue;
        
        if(borderRadius != "") {
            infoText += "\r" + borderRadius;
            cssText += "" + borderRadius.toLowerCase() + ";";
        }

        cssText += "}";
        doc.activeLayer = pageItem;
        return infoText;
    },

    //Get the default color value.
    getDefaultColor : function() {
        var newColor = new SolidColor();
        newColor.model = ColorModel.RGB;
        newColor.rgb.hexValue = "000000";
        return newColor;
    },

    //Get the color value of selected color model in UI.
    colorAsString : function(c) {
        this.deselecAllLayers();        //To avoid color change on selected item.
        var result = "";
        var color = c;
        var newColor, colorType;
        var foreGroundColor = app.foregroundColor;
        var sourceSpace, targetSpace, colorComponents;

        switch(c.model) {
            case ColorModel.RGB: 
                sourceSpace = c.rgb;
                colorComponents = [sourceSpace.red, sourceSpace.green, sourceSpace.blue];
                break;

            case  ColorModel.CMYK: 
                sourceSpace = c.cmyk; 
                colorComponents = [sourceSpace.cyan, sourceSpace.magenta, sourceSpace.yellow, sourceSpace.black]; 
                break;

            case ColorModel.LAB: 
                sourceSpace = c.lab; 
                colorComponents = [sourceSpace.l, sourceSpace.a, sourceSpace.b]; 
                break;

            case ColorModel.GRAYSCALE:
                sourceSpace = c.gray;
                colorComponents = [sourceSpace.gray];
                break;
        }
        
        if(sourceSpace != null) {
            app.foregroundColor = c;
            switch(model.legendColorMode) {
                case "LAB":
                    targetSpace = app.foregroundColor.lab;
                    newColor = new LabColor(); 
                    newColor.l = targetSpace.l; 
                    newColor.a = targetSpace.a;
                    newColor.b = targetSpace.b; 
                    break;

                case "CMYK":
                    targetSpace = app.foregroundColor.cmyk; 
                    newColor = new CMYKColor(); 
                    newColor.cyan = targetSpace.cyan; 
                    newColor.magenta = targetSpace.magenta;
                    newColor.yellow = targetSpace.yellow;
                    newColor.black = targetSpace.black;
                    break;

                default:
                    targetSpace = app.foregroundColor.rgb;
                    newColor = new RGBColor();
                    newColor.red = targetSpace.red;
                    newColor.green = targetSpace.green;
                    newColor.blue = targetSpace.blue;
                    break;
            }

            colorType = newColor;
        }

        switch(colorType.typename) {
            case "RGBColor":
                switch(model.legendColorMode) {
                    case "HSB":
                        result = this.rgbToHsv(colorType);
                        break;

                    case "HSL":
                        result = this.rgbToHsl(colorType);
                        break;

                    case "HEX":
                        var red = Math.round(colorType.red).toString(16);
                        if (red.length === 1)
                            red = "0" + red;

                        var green = Math.round(colorType.green).toString(16);
                        if (green.length === 1) 
                            green = "0" + green;

                        var blue = Math.round(colorType.blue).toString(16);
                        if (blue.length === 1) 
                            blue = "0" + blue;

                        result = "#" + red + green + blue;
                        break;
                    
                    case "iOS (RGB as %)":
                        var rVal = Math.round(colorType.red / 255 * 100);
                        var gVal =  Math.round(colorType.green / 255 * 100);
                        var bVal =  Math.round(colorType.blue / 255 * 100);
                        result = "rgb(" + rVal + ", " + gVal + ", " + bVal + ")";
                        break;
                        
                    default:
                        rVal = Math.round(colorType.red);
                        gVal =  Math.round(colorType.green);
                        bVal =  Math.round(colorType.blue);
                        result = "rgb(" + rVal + ", " + gVal + ", " + bVal + ")";
                }
                break;

                case "CMYKColor":
                    result = "cmyk(" + Math.round(colorType.cyan) + ", " + Math.round(colorType.magenta) + 
                            ", " + Math.round(colorType.yellow) + ", " + Math.round(colorType.black) + ")";
                    break;

                case "LabColor":
                    result = "lab(" + Math.round(colorType.l) + ", " + Math.round(colorType.a) + ", " + Math.round(colorType.b) + ")";
                    break;

                case "GrayColor":
                    result = "gray(" + Math.round(colorType.gray) + ")";
                    break;
        }

        app.foregroundColor = foreGroundColor;
        return result;
    },

    //Conversion from RGB to HSL.
    rgbToHsl : function(rgb) {
        var r = rgb.red;
        var g = rgb.green;
        var b = rgb.blue;
        r = r/255, g = g/255, b = b/255;

        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;
                
        if(max == min) {
            h = s = 0;
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

    //Conversion from RGB To HSV.
    rgbToHsv : function(rgb) {
        var r = rgb.red;
        var g = rgb.green;
        var b = rgb.blue;
        r = r/255, g = g/255, b = b/255;

        var max = Math.max(r, g, b);
        var min = Math.min(r, g, b);
        var h, s, v = max;
        var d = max - min;
        s = max == 0 ? 0 : d / max;

        if(max == min) {
            h = 0;
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

    //Convert color into css style.
    convertColorIntoCss : function(color, alpha) {
        var index = color.indexOf("(");
        color = color.substr(0, index)+"a"+color.substr(index)
        color = color.substr(0, color.length-1)+", "+alpha+")";
        return color;
    },

    //Get the alignment of the text using paragraph styles.
    getAlignment : function() {
        var kDefaultAlignVal = "left";
        try {
            var ref = new ActionReference();
            ref.putEnumerated( charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") ); 
            var layerDesc = executeActionGet(ref);
            var textDesc = layerDesc.getObjectValue(stringIDToTypeID('textKey'));
            var rangeList = textDesc.getList(stringIDToTypeID('paragraphStyleRange'));

            // there will be at least one range so just get the first range descriptor
            var styleDesc = rangeList.getObjectValue(0).getObjectValue(stringIDToTypeID('paragraphStyle'));
            if(styleDesc.hasKey(stringIDToTypeID("align"))) {
                return typeIDToStringID(styleDesc.getEnumerationValue(stringIDToTypeID("align")));
            } else {
                return kDefaultAlignVal;
            }
        } catch(e) {
            return kDefaultAlignVal;
        }
    },

    //Return value of stroke of the active layer.
    getStrokeValOfLayer : function(pageItem) {
        try {
            var infoText = "";
            var doc = app.activeDocument;
            var ref = new ActionReference();
            ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));

            //Check Effect is applied on layer or not.
            if(executeActionGet(ref).hasKey(stringIDToTypeID('layerEffects'))) {
                if(executeActionGet(ref).getBoolean(stringIDToTypeID('layerFXVisible'))) { //Check Effect visibility is off or on.
                    var layerEffectDesc = executeActionGet(ref).getObjectValue(stringIDToTypeID('layerEffects'));
                    doc.activeLayer = doc.layers[doc.layers.length-1];
                       
                    if(layerEffectDesc.hasKey(stringIDToTypeID('frameFX'))) {
                        infoText += "\rBorder: ";
                        var desc = layerEffectDesc.getObjectValue(stringIDToTypeID('frameFX'));
                        if(desc.getBoolean(stringIDToTypeID('enabled')))
                            infoText += this.getStrokeFx(desc);
                        else
                            infoText += " off";
                    }
                    doc.activeLayer = pageItem;
                }
            }
            return infoText;
        } catch(e) {
            alert(e);
            doc.activeLayer = pageItem;
            return "";
        }
    },

    // Get the properties of the effects of active layer.
    getEffectsOfLayer : function() {
        try {
            var infoText="";
            var doc = app.activeDocument;
            var ref = new ActionReference();
            ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            
            //Check Effect is applied on layer or not.
            if(executeActionGet(ref).hasKey(stringIDToTypeID('layerEffects'))) {
                if(executeActionGet(ref).getBoolean(stringIDToTypeID('layerFXVisible'))) {
                    var desc;
                    var layerEffectDesc = executeActionGet(ref).getObjectValue(stringIDToTypeID('layerEffects'));
                    doc.activeLayer = doc.layers[doc.layers.length-1];
                    
                    //Get Gradient values.
                    if(layerEffectDesc.hasKey(stringIDToTypeID('gradientFill'))) {
                        infoText += "\rGradient: ";
                        desc = layerEffectDesc.getObjectValue(stringIDToTypeID('gradientFill'));
                        if(desc.getBoolean(stringIDToTypeID('enabled')))
                            infoText += this.getGradientFx(desc);
                        else
                            infoText += " off";
                    }
                
                    //Get Color Overlay values
                    if(layerEffectDesc.hasKey(stringIDToTypeID('solidFill'))) {
                        desc = layerEffectDesc.getObjectValue(stringIDToTypeID('solidFill'));
                        if(desc.getBoolean(stringIDToTypeID('enabled')))
                            infoText += "\rColor-Overlay: " + this.getColorOverlayFx(desc);
                        else
                            infoText += "\rColor-Overlay: off";
                    }
                    
                    //Get InnerShadow values
                    if(layerEffectDesc.hasKey(stringIDToTypeID('innerShadow'))) {
                        desc = layerEffectDesc.getObjectValue(stringIDToTypeID('innerShadow'));
                        if(desc.getBoolean(stringIDToTypeID('enabled')))
                            infoText += "\rBox-Shadow: "+"Inset "+ this.getInnerShadowFx(desc);
                        else
                            infoText += "\rInner-Shadow: off";
                    }
                
                    //Get DropShadow values
                    if(layerEffectDesc.hasKey(stringIDToTypeID('dropShadow'))) {
                        desc = layerEffectDesc.getObjectValue(stringIDToTypeID('dropShadow'));
                        if(desc.getBoolean(stringIDToTypeID('enabled')))
                           infoText += "\rBox-Shadow: " + this.getDropShadowFx(desc);
                        else
                           infoText += "\rDrop-Shadow: off";
                    }
                } else {
                    infoText += "\rEffect: off";
                }
            } else {
                infoText += "\rEffect: none";
            }
                    
            return infoText;
        } catch(e) {
            alert(e);
            return "";
        }
    },

    //Get the gradient effect's propeties values.
    getGradientFx : function(gradientDesc) {
        var infoText = "";
        var desc = gradientDesc.getObjectValue(stringIDToTypeID('gradient'));
        var colorsList = desc.getList(stringIDToTypeID('colors'));
        var count = colorsList.count;                                                 //Number of color stops in gradient
        for( var c = 0; c < count; c++ ) {
            desc = colorsList.getObjectValue(c);                                            // get color descriptor
            infoText += "\r Color["+c+"]: "+ this.colorAsString(this.getColor(desc.getObjectValue(stringIDToTypeID('color'))));
        }

        return infoText;
    },

    //Get color value according to document model
    getColor : function(colorDesc) {
         var color = new SolidColor();
         switch(app.activeDocument.mode) {
             case DocumentMode.GRAYSCALE:
                 color.gray.gray = colorDesc.getDouble(charIDToTypeID('Gry '));
                 break;
             case DocumentMode.RGB:
                 color.rgb.red = colorDesc.getDouble(charIDToTypeID('Rd  '));
                 color.rgb.green = colorDesc.getDouble(charIDToTypeID('Grn '));
                 color.rgb.blue = colorDesc.getDouble(charIDToTypeID('Bl  '));
                 break;
             case DocumentMode.CMYK:
                  color.cmyk.cyan = colorDesc.getDouble(charIDToTypeID('Cyn '));
                  color.cmyk.magenta = colorDesc.getDouble(charIDToTypeID('Mgnt'));
                  color.cmyk.yellow = colorDesc.getDouble(charIDToTypeID('Ylw '));
                  color.cmyk.black = colorDesc.getDouble(charIDToTypeID('Blck'));
                  break;
             case DocumentMode.LAB:
                   color.lab.l = colorDesc.getDouble(charIDToTypeID('Lmnc'));
                   color.lab.a = colorDesc.getDouble(charIDToTypeID('A   '));
                   color.lab.b = colorDesc.getDouble(charIDToTypeID('B   '));
                   break;
           }
          return color;
    },

    //Get the color overlay effect's properties values.
    getColorOverlayFx : function(overlayDesc) {
        var infoText = "";
        infoText = typeIDToStringID(overlayDesc.getEnumerationValue( stringIDToTypeID( 'mode' )))+"/ ";
        var alpha = overlayDesc.getUnitDoubleValue (stringIDToTypeID( 'opacity' ))/100;
        var color = this.colorAsString(this.getColor(overlayDesc.getObjectValue(stringIDToTypeID('color'))));
        if(color.indexOf("(") >= 0)
            infoText += this.convertColorIntoCss(color, alpha);
        else
            infoText += color+" alpha: "+alpha;
        
        return infoText;
    },

    //Get the inner shadow effect's properties values.
    getInnerShadowFx : function(innerShadowDesc) {
        var infoText = "";
        var alpha = innerShadowDesc.getUnitDoubleValue (stringIDToTypeID( 'opacity' ))/100;
        var color = this.colorAsString(this.getColor(innerShadowDesc.getObjectValue(stringIDToTypeID('color'))));
        if(color.indexOf("(") >= 0)
            infoText += this.convertColorIntoCss(color, alpha);
        else
            infoText += color+" alpha: "+alpha;
        
        return infoText;
    },

    //Get the drop shadow effect's properties values.
    getDropShadowFx : function(dropShadowDesc) {
        var infoText = "";
        var alpha = dropShadowDesc.getUnitDoubleValue (stringIDToTypeID( 'opacity' ))/100;
        var color = this.colorAsString(this.getColor(dropShadowDesc.getObjectValue(stringIDToTypeID('color'))));
        if(color.indexOf("(") >= 0)
            infoText += this.convertColorIntoCss(color, alpha);
        else
            infoText += color+" alpha: "+alpha;
        
        return infoText;
    },
    
    //Get the stroke effect's properties values.
    getStrokeFx : function(strokeDesc)
    {
        var infoText = "";
        infoText += Math.round(strokeDesc.getUnitDoubleValue(stringIDToTypeID('size'))) + " px";
        infoText += ", " + this.colorAsString(this.getColor(strokeDesc.getObjectValue(stringIDToTypeID('color'))));
        
        return infoText;
    },

    //Get the round corner value of the shape object.
    getRoundCornerValue : function() {
        try {
            var infoText = "Border-radius: ";
            var doc = app.activeDocument;
            var anchorPoints = [];
            var shape = doc.pathItems[0];
            var pathItem = shape.subPathItems[0];
            var points = pathItem.pathPoints;
            var point = "";

            if(points.length < 5)
                return infoText+"0";
            if(points.length != 8)
                return "";

            for (var k = 1; k < 3 ; k++) {
                point = points[k];
                anchorPoints[k] =  point.anchor[0];
            }
            infoText +=  Math.abs(parseInt(anchorPoints[2]) - parseInt(anchorPoints[1]));
        } catch(e) {
            alert(e);
            infoText = "";
        }

        return infoText;
    },

    //Get spec info for general items.
    getSpecsInfoForGeneralItem : function(sourceItem) {
        var infoText;
        cssText = "";
        
        if(sourceItem.kind == undefined) {
            infoText = "";
            return;
        }
        var infoText = sourceItem.kind.toString().replace ("LayerKind.", "");
        var pageItem = sourceItem;
        cssText = "." + pageItem.name.toLowerCase() + " {" + infoText.toLowerCase() + ";";

        if(model.textAlpha) {
            var opacityString = "Opacity: " + Math.round(pageItem.opacity) / 100;
            infoText += "\r\t" + opacityString;
            cssText += opacityString.toLowerCase() + ";";
        }
        cssText += "}";
        return infoText;
    },

    //Apply bold to the heading of the property spec.
    applyBold : function(from, to) {
        try {
            var idTxtt = charIDToTypeID("Txtt");
            var idT = charIDToTypeID("T   ");
            var idTxLr = charIDToTypeID("TxLr");
            var idTxtS = charIDToTypeID( "TxtS" );
            
            var desc = new ActionDescriptor();
            var ref = new ActionReference();
            ref.putEnumerated( idTxLr, charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            desc.putReference(charIDToTypeID("null"), ref);
     
            var propertyDesc = new ActionDescriptor();
            var list = new ActionList();
            var styleDesc = new ActionDescriptor();
            styleDesc.putInteger(charIDToTypeID("From"), from);
            styleDesc.putInteger(idT, to);
            var boldDesc = new ActionDescriptor();
            boldDesc.putBoolean( stringIDToTypeID( "syntheticBold" ), true );
            styleDesc.putObject(idTxtS, idTxtS, boldDesc);
            list.putObject(idTxtt, styleDesc);
            propertyDesc.putList( idTxtt, list);
            desc.putObject(idT, idTxLr, propertyDesc);
            executeAction(charIDToTypeID( "setd" ), desc, DialogModes.NO);
        } catch(e) {}
    },

   
    //This function create the artlayer set named 'Text Properties', if not created.
    legendPropertiesLayer : function(specName, parent) {
        var newLayer;
        try {
            newLayer= $.specctrPsCommon.legendSpecLayer("Properties", parent).layerSets.getByName(specName);
        } catch(e) {
            newLayer= $.specctrPsCommon.legendSpecLayer("Properties", parent).layerSets.add();
            newLayer.name=specName;
        }
        return newLayer;
    },
    
    //Deselect all selected layers from active document.
    deselecAllLayers : function() {
        try {
            var desc = new ActionDescriptor();   
            var ref = new ActionReference();   
            ref.putEnumerated( charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );   
            desc.putReference( charIDToTypeID('null'), ref );   
            executeAction( stringIDToTypeID('selectNoLayers'), desc, DialogModes.NO );  
        } catch (e) {}
    }
};