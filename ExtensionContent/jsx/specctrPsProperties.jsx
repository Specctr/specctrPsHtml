/*//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
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
    
    propertyChecked : function (artItemType) {
        model = $.specctrPsCommon.getModel();
        
        if(artItemType == LayerKind.TEXT) {
            
             if(model.textLayerName || model.textFont || model.textSize 
                || model.textColor ||  model.textStyle || model.textAlignment
                || model.textLeading ||  model.textTracking || model.textAlpha
                || model.textEffects)
                return true;
            else
                return false;
                
        } else {
            
           if(model.shapeLayerName || model.shapeFill || model.shapeStroke 
                || model.shapeAlpha ||  model.shapeEffects || model.shapeBorderRadius)
                return true;
            else
                return false;
                
        }
    },
    
    //Suspend the history of creating properties spec of layers.
    createPropertySpecsForItem : function() {
        try {
            var sourceItem = $.specctrPsCommon.getActiveLayer();
            if(sourceItem === null)
                return;

            var isPropertyChecked = this.propertyChecked(sourceItem.kind);
            if(!isPropertyChecked)
                return "Please select the checkboxes from properties.";
                
            if(sourceItem.isBackgroundLayer)
                return "Please select layer other than background.";
                
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

        //Save the current preferences
        var startTypeUnits = app.preferences.typeUnits; 
        var startRulerUnits = app.preferences.rulerUnits;
        var originalDPI = doc.resolution;
        $.specctrPsCommon.setPreferences(Units.PIXELS, TypeUnits.PIXELS, 72);
        
        var index = this.getIndexOfSelectedLayer();
        idLayer = $.specctrPsCommon.getIDOfLayer();   //Get unique ID of selected layer.

        //Check artboard is present or not and make changes in bounds accordingly.
        var parent = doc;

        cssText = "{";
        
        var cnvsRect = $.specctrPsCommon.getArtBoardBounds(artLayer);
        if(cnvsRect == null) {
            cnvsRect = [0, 0, doc.width, doc.height];
        } else {
            parent = $.specctrPsCommon.getArtBoard(artLayer);
            doc.activeLayer = parent;
            cssText += "artboard_name:" + parent.name+";";
            cssText += "artboard_index:" + this.getIndexOfSelectedLayer()+";";
            cssText += "artboard_id:" + $.specctrPsCommon.getIDOfLayer()+";";
        }
    
        var activeLayerParent = artLayer.parent;
        
        //Meaning activeLayerParent is neither doc nor artboard, it is actually group under doc or artboard,.
        if(activeLayerParent != parent) {
            doc.activeLayer = activeLayerParent;
            cssText += "parent_layer_name:" + activeLayerParent.name+";";
            cssText += "parent_layer_index:" + this.getIndexOfSelectedLayer()+";";
            cssText += "parent_layer_id:" + $.specctrPsCommon.getIDOfLayer()+";";
        }
 
        cssText += "layer_name:" + name+";";
        cssText += "layer_id:" + idLayer+";";
        cssText += "layer_index:" + index+";";

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
                this.updateSpec(sourceItem, idLayer, legendLayer, bounds, cnvsRect, noteSpecBottom, noteLegendLayer, index);
                $.specctrPsCommon.setPreferences(startRulerUnits, startTypeUnits, originalDPI);
                return;
            }
        }
    
         try {
            var artLayerBounds = bounds;
            var name = artLayer.name;
            var nameLength = name.length;
            
            var specctrLayerSet = $.specctrPsCommon.legendLayer(parent)
            var spec = specctrLayerSet.artLayers.add();
            spec.kind = LayerKind.TEXT;
            var specText = spec.textItem;
            specText.kind = TextType.POINTTEXT;
            doc.activeLayer = sourceItem;
            
            var cssBounds = [artLayerBounds[0]-cnvsRect[0], artLayerBounds[1]-cnvsRect[1], 
                                        artLayerBounds[2]-cnvsRect[0], artLayerBounds[3]-cnvsRect[1]] ;
            
            cssText += "xCoord:" + cssBounds[0].toString()+";";
            cssText += "yCoord:" + cssBounds[1].toString()+";";
            var cssObjectName = "." + name;

            switch(sourceItem.kind) {
                case LayerKind.TEXT:
                    cssObjectName = name;
                    infoText  = this.getSpecsInfoForTextItem(sourceItem);
                    newColor = $.specctrPsCommon.legendColor(model.legendColorType);
                    legendLayer = this.legendPropertiesLayer("Text Specs", parent).layerSets.add();
                    legendLayer.name = "Text Spec ";
                    
                    if(!model.textLayerName) nameLength = 0;
                    
                    break;
             
                case LayerKind.GRADIENTFILL:
                case LayerKind.SOLIDFILL: 
                    infoText = this.getSpecsInfoForPathItem(sourceItem, cssBounds);
                    legendLayer = this.legendPropertiesLayer("Object Specs", parent).layerSets.add();
                    legendLayer.name = "Object Spec ";
                    
                    if(!model.shapeLayerName) nameLength = 0;
                    
                    break;

                default: 
                    infoText = this.getSpecsInfoForGeneralItem(sourceItem, cssBounds); 
                    legendLayer = this.legendPropertiesLayer("Object Specs", parent).layerSets.add();
                    legendLayer.name = "Object Spec ";
                    
                    if(!model.shapeLayerName) nameLength = 0;
                    
            }

            if (infoText === "")  {
                spec.remove();
                legendLayer.remove();
                $.specctrPsCommon.setPreferences(startRulerUnits, startTypeUnits, originalDPI);
                return;
            }

            idSpec = $.specctrPsCommon.getIDOfLayer();

            var isLeft, pos;
            var centerX = (artLayerBounds[0] + artLayerBounds[2]) / 2;             //Get the center of item.
            var centerY = (artLayerBounds[1] + artLayerBounds[3]) / 2;
            var font = model.legendFont;

            //Create spec text for art object.
            legendLayer.visible = false;
            spec.move(legendLayer, ElementPlacement.INSIDE)
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
                         var number = $.specctrPsCommon.getXMPData(noteLegendLayer.artLayers.getByName("Specs"), "number");
                        bullet = noteLegendLayer.artLayers.getByName("__sFirstBullet");
                    } catch (e) {}
                 }
         
              //Check if any number is linked with selected art layer or not, if not then assign a number.
                if (!bullet) {
                    if(!number)
                        number = $.specctrPsCommon.getBulletNumber(spec, parent, true);
                        
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
        
            var css = cssObjectName + cssText + "}";
            
            var xmpData = [{layerHandler : legendLayer, 
                                    properties : [{name : "idLayer", value : idLayer}, 
                                                        {name : "idSpec", value : idSpec}]
                                    }, 
                                    {layerHandler : artLayer,
                                        properties : [{name : "idLayer", value : idLayer}, 
                                                            {name : "idSpec", value : idSpec}]
                                    },
                                    {layerHandler : spec,
                                        properties : [{name : "css", value : css}]
                                    }
                                ];

            $.specctrPsCommon.setXmpDataOfLayer(xmpData);

        } catch(e) {}

        doc.activeLayer = artLayer;
        $.specctrPsCommon.setPreferences(startRulerUnits, startTypeUnits, originalDPI);
    },

    //Update the property spec of the layer whose spec is already present.
    updateSpec : function(artLayer, idLayer, legendLayer, bounds, cnvsRect, specYPos, noteLegendLayer, index) {
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
        var nameLength = name.length;
        doc.activeLayer = artLayer;

        var cssBounds = [artLayerBounds[0]-cnvsRect[0], artLayerBounds[1]-cnvsRect[1], 
                                        artLayerBounds[2]-cnvsRect[0], artLayerBounds[3]-cnvsRect[1]] ;
        
        cssText += "xCoord:" + cssBounds[0].toString() + ";";
        cssText += "yCoord:" + cssBounds[1].toString()+ ";";
        var cssObjectName = "." + name;

        try {
            switch(artLayer.kind) {
                case LayerKind.TEXT:
                    cssObjectName = name;
                    infoText   = this.getSpecsInfoForTextItem(artLayer);
                    newColor = $.specctrPsCommon.legendColor(model.legendColorType);
                    
                    if(!model.textLayerName) nameLength = 0;
                    
                    break;

                case LayerKind.GRADIENTFILL:
                case LayerKind.SOLIDFILL: 
                    infoText = this.getSpecsInfoForPathItem(artLayer, cssBounds);
                    
                    if(!model.shapeLayerName) nameLength = 0;
                    
                    break;

                default: 
                    infoText = this.getSpecsInfoForGeneralItem(artLayer, cssBounds); 
                    if(!model.shapeLayerName) nameLength = 0;
            }

            var justification = Justification.LEFT;
            
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
                
                if(noteLegendLayer) {
                     try {
                         var number = $.specctrPsCommon.getXMPData(noteLegendLayer.artLayers.getByName("Specs"), "number");
                    } catch (e) {}
                 }
             
                //Check if any number is linked with selected art layer or not, if not then assign a number.
                if(!number)
                    number = $.specctrPsCommon.getBulletNumber(spec, legendLayer.parent.parent.parent.parent, false);
                
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

            var css = cssObjectName + cssText + "}";
            
            var xmpData = [{layerHandler : spec,
                                        properties : [{name : "css", value : css}]
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
            
            //Get all the required property of text items.
            
            //Get the name of text item.
            var name = pageItem.name;
            var wordsArray = name.split(" ");
            if(wordsArray.length > 2)
                name = wordsArray[0] + " " + wordsArray[1] + " " + wordsArray[2];
            
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
                var tracking = 0, isAutoLeading="", color="", mFactor = "";
                
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
                
                //If no font then set default font.
                if(font == "") font = kDefaultFontVal;
                if(size == "") size = kDefaultFontSize;
                
                //Get the font size if responsive option selected
                var fontSize = "";
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
 
                //Get alpha/opacity of text item.
                alpha = Math.round(pageItem.opacity)/100 ;
                
                //Get color
                if(color == "") color = this.getDefaultColor();
                
                color = this.colorAsString(color);

                if(alpha != "" && color.indexOf("(") >= 0) {
                    color = this.convertColorIntoCss(color, alpha);
                    alpha = "";
                }

                // Get the style of the text item.
                var styleString = "normal", textDecorationStyle = "";
                if (bold == true) styleString = "bold";
                if (italic == true) styleString += "/ italic";
                if (underline != "" && underline != "underlineOff" ) textDecorationStyle = "underline";
                if (strike != "" && strike != "strikethroughOff") {
                    if(textDecorationStyle != "") textDecorationStyle += "/ ";
                    textDecorationStyle += "strike-through";
                }
            
                //Get the alignment of the text.
                var alignment = "";
                try {
                    alignment = textItem.justification.toString();
                    alignment = alignment.substring(14,15).toLowerCase() + alignment.substring(15).toLowerCase();
                } catch(e) {
                   alignment = this.getAlignment();
                }
            
                //Get text leading.
                if(leading == "" || isAutoLeading == true)
                    leading =  size/100*Math.round(kDefaultLeadVal);
                
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

                //Get tracking of the text item.
                tracking = Math.round(tracking / 1000 * 100) / 100 + " em";
                
                //Set css for the selected text item.
                cssText += "text_contents:" + textItem.contents +";";
                cssText += "font-family:" + font+";";
                cssText += "font-size:" + fontSize+";";
                cssText += "color:" + color.toLowerCase()+";";
                cssText += "font-style:" + styleString+";";
                
                if(textDecorationStyle != "") 
                    cssText += "text-decoration:" + textDecorationStyle+";";
                
                cssText += "text-align:" + alignment+";";
                cssText += "line-height:" + leading+";";
                cssText += "letter-spacing:" + tracking+";";
                
                if(alpha != "") 
                    cssText += "opacity:" + alpha+";";

                //Add properties which are enabled in details tab.
                if (model.textLayerName) infoText = "\r" + name;
                if (model.textFont) infoText += "\rFont-Family: " + font;
                if (model.textSize) infoText += "\rFont-Size: " + fontSize;
                if (model.textColor) infoText += "\rColor: " + color;

                if (model.textStyle) {
                    infoText += "\rFont-Style: " + styleString;
                    if(textDecorationStyle != "")
                        infoText += "\rText-Decoration: " + textDecorationStyle;
                }

                if (model.textAlignment) infoText += "\rText-Align: " + alignment;
                if (model.textLeading) infoText += "\rLine-Height: " + leading;
                if (model.textTracking) infoText += "\rLetter-Spacing: " + tracking;
                if (alpha != "") infoText += "\rOpacity: " + alpha;
            
                if (model.textEffects) {
                    var strokeVal = this.getStrokeValOfLayer(pageItem);
                    if(strokeVal != "none" && strokeVal != "") infoText += "\rBorder: " + strokeVal;
                        
                    var effectValue = this.getEffectsOfLayer();
                    if(effectValue != "") infoText += effectValue;
                }
            
            }
        } catch(e) {}

        if(model.specInEM) {
            cssBodyText = "body {font-size: " + Math.round(10000 / 16 * rltvFontSize) / 100 + "%;}";
            $.specctrPsCommon.setCssBodyText(cssBodyText);
        }
            
        app.activeDocument.activeLayer = pageItem;
        return infoText;
    },

    //Getting info for shape object.
    getSpecsInfoForPathItem : function(pageItem, cssBounds) {
        var pathItem = pageItem;
        var doc = app.activeDocument;
        var alpha = "", effectValue = "";
        var borderRadius = "", strokeVal = "";
        
        // Get the layer kind and color value of that layer.
        var name = pathItem.name;
        var infoText = "";
        
        //Gives the opacity for the art layer,
        alpha = Math.round(pageItem.opacity)/100;
        
        try {
                doc.activeLayer = pageItem;
                var ref = new ActionReference();
                ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
                var desc = executeActionGet(ref).getList(charIDToTypeID("Adjs")).getObjectValue(0);
                doc.activeLayer = doc.layers[doc.layers.length-1];

                var shapeFillVal = "", swatchName = "";
                if(pathItem.kind == LayerKind.SOLIDFILL) {
                    var colorDescriptor = desc.getObjectValue(stringIDToTypeID('color'));
                    var solidColor = this.getColor(colorDescriptor);
                    var color = this.colorAsString(solidColor);
                    swatchName = $.specctrPsSwatches.readFromRuntime(solidColor);
                    
                    if(model.shapeAlpha && color.indexOf("(") >= 0) {
                        shapeFillVal = this.convertColorIntoCss(color, alpha);
                        alpha = "";
                    } else {
                        shapeFillVal = color;
                    }
                
                } else if(pathItem.kind == LayerKind.GRADIENTFILL) {
                    
                    shapeFillVal =  typeIDToStringID(desc.getEnumerationValue(charIDToTypeID("Type")))+" gradient ";
                    desc = desc.getObjectValue(charIDToTypeID("Grad"));
                    var colorList = desc.getList(charIDToTypeID("Clrs"));
                    var count = colorList.count;                                                 //Number of color stops in gradient
                    for( var c = 0; c < count; c++ ) {
                        desc = colorList.getObjectValue(c);                                            // get color descriptor
                        shapeFillVal += this.colorAsString(this.getColor(desc.getObjectValue(stringIDToTypeID('color'))))+" ";
                    }
                    
                }

        } catch(e) {}
        
        // Get the round corner values.
        doc.activeLayer = pageItem;
        borderRadius = this.getRoundCornerValue();
        
        doc.activeLayer = pageItem;
        strokeVal = this.getStrokeValOfLayer(pageItem);
        
        //Set css for selected shape item.
        cssText += "background:" + shapeFillVal+";";
        cssText += "border:" + strokeVal+";";
        
        if(alpha != "") 
            cssText += "opacity:" + alpha+";";
            
        cssText += "border-radius:" + borderRadius.toString()+";";
        cssText += "height:" +  (cssBounds[3]-cssBounds[1]).toString()+";";
        cssText += "width:" + (cssBounds[2]-cssBounds[0]).toString()+";";

        
        //Add properties which are enabled in details tab.
        if(model.shapeLayerName) infoText += "\r" + name;
        if(model.shapeFill) {
            if(swatchName !== "") infoText +="\r" + swatchName;
            infoText += "\rBackground: " + shapeFillVal;
        }
        
        if(model.shapeStroke) infoText += "\rBorder: " + strokeVal;
        if(model.shapeAlpha && alpha != "") infoText += "\rOpacity: "+alpha;
        
        if(model.shapeEffects) {
            doc.activeLayer = pageItem;
            effectValue = this.getEffectsOfLayer();
            infoText += effectValue;
        }
        
        if(model.shapeBorderRadius) infoText += "\rBorder-radius: " + borderRadius;
        
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
                        var desc = layerEffectDesc.getObjectValue(stringIDToTypeID('frameFX'));
                        if(desc.getBoolean(stringIDToTypeID('enabled')))
                            infoText += this.getStrokeFx(desc);
                        else
                            infoText += "off";
                    }
                    doc.activeLayer = pageItem;
                }
            } else {
                infoText += "none";
            }
        
            return infoText;
        } catch(e) {
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
            var doc = app.activeDocument;
            var anchorPoints = [];
            var shape = doc.pathItems[0];
            var pathItem = shape.subPathItems[0];
            var points = pathItem.pathPoints;
            var point = "";

            if(points.length < 5)
                return "0";
            if(points.length != 8)
                return "";

            for (var k = 1; k < 3 ; k++) {
                point = points[k];
                anchorPoints[k] =  point.anchor[0];
            }
        
            return  Math.abs(parseInt(anchorPoints[2]) - parseInt(anchorPoints[1])).toString();
            
        } catch(e) {}

        return "";
    },

    //Get spec info for general items.
    getSpecsInfoForGeneralItem : function(sourceItem, cssBounds) {
        if(sourceItem.kind == undefined) {
            return "";
        }
        
        var pageItem = sourceItem;
        
        var name = pageItem.name;
        var type = pageItem.kind.toString().replace ("LayerKind.", "").toLowerCase();
        var alpha = Math.round(pageItem.opacity) / 100;
        
        cssText += "type:" + type+";";
        cssText += "opacity:" + alpha+";";
        cssText += "height:" + (cssBounds[3]-cssBounds[1]).toString()+";";
        cssText += "width:" + (cssBounds[2]-cssBounds[0]).toString()+";";

        var infoText = "";
        if(model.shapeLayerName) infoText = "\r"+name+"\r"+type;
        if(model.shapeAlpha) infoText += "\rOpacity: " + opacityString;
        
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
    },

    getIndexOfSelectedLayer : function() {
        try {
            var doc = app.activeDocument;
            var isBackGroundPresent = false;

            try {
                if(doc.backgroundLayer)
                    isBackGroundPresent = true;
            } catch(e) {
                isBackGroundPresent = false;
            }
            
            var index;
            var layerRef = new ActionReference(); 
            layerRef.putProperty(app.charIDToTypeID("Prpr"), app.charIDToTypeID("ItmI")); 
            layerRef.putEnumerated(app.charIDToTypeID("Lyr "), app.charIDToTypeID("Ordn"), app.charIDToTypeID("Trgt")); 
                
            if(isBackGroundPresent) 
                index = app.executeActionGet(layerRef).getInteger(app.charIDToTypeID("ItmI"))-1; 
            else 
                index = app.executeActionGet(layerRef).getInteger(app.charIDToTypeID("ItmI")); 
                
        } catch(e) {
            index = 0;        
        }
    
        return index;
    }
};
