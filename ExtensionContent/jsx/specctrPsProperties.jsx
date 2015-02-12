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
            app.activeDocument.suspendHistory('Property Specs', 'this.createPropertySpecs(sourceItem, bounds)');
        } catch(e) {}
    },

    //Get the property of selected layer and show it on active document.
    createPropertySpecs : function(sourceItem, bounds) {
        var doc = app.activeDocument;
        var infoText;
        model = $.specctrPsCommon.getModel();
        var newColor = $.specctrPsCommon.legendColor(model.legendColorObject);
        var artLayer = sourceItem;
        var spec, idLayer, idSpec, lyr;
        var idBullet, bullet, dupBullet, idDupBullet;
        var legendLayer;

        try {
            //WARNiNG: Do Check it is specctr's specctr or any other specctr.
            var specctrLayerSet = artLayer.parent.parent.parent;
            if(artLayer.typename === "LayerSet" || specctrLayerSet.name === "Specctr" ||
                specctrLayerSet.parent.name === "Specctr")
                return;
        } catch (e) {}

        if(ExternalObject.AdobeXMPScript == null)
            ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');		//Load the XMP Script library to access XMPMetadata info of layers.
        
         idSpec = $.specctrPsCommon.getXMPData(artLayer, "idSpec");			//Check if metadata of the layer is already present or not.
         if(idSpec != null) {
             legendLayer = $.specctrPsCommon.getLayerByID(idSpec);
             if(legendLayer) {
                this.updateSpec(sourceItem, legendLayer, bounds);
                return;
            }
         }

         try {
            idLayer = $.specctrPsCommon.getIDOfLayer();   //Get unique ID of selected layer.
            var artLayerBounds = bounds;
            var name = artLayer.name;

            switch(sourceItem.kind) {
                case LayerKind.TEXT:
                    infoText  = this.getSpecsInfoForTextItem(sourceItem);
                    newColor = $.specctrPsCommon.legendColor(model.legendColorType);
                    legendLayer = this.legendPropertiesLayer("Text Specs").layerSets.add();
                    legendLayer.name = "Text Spec ";
                    var wordsArray = name.split(" ");
                    if(wordsArray.length > 2)
                        name = wordsArray[0] + " " + wordsArray[1] + " " + wordsArray[2];
                    break;
             
                case LayerKind.GRADIENTFILL:
                case LayerKind.SOLIDFILL: 
                    infoText = this.getSpecsInfoForPathItem(sourceItem);
                    legendLayer = this.legendPropertiesLayer("Object Specs").layerSets.add();
                    legendLayer.name = "Object Spec ";
                    break;

                default: 
                    infoText = this.getSpecsInfoForGeneralItem(sourceItem); 
                    legendLayer = this.legendPropertiesLayer("Object Specs").layerSets.add();
                    legendLayer.name = "Object Spec ";
            }

            if (infoText === "") 
                return;

            idSpec = $.specctrPsCommon.getIDOfLayer();

            //Save the current preferences
            var startTypeUnits = app.preferences.typeUnits; 
            var startRulerUnits = app.preferences.rulerUnits;
            var originalDPI = doc.resolution;
            $.specctrPsCommon.setPreferences(Units.PIXELS, TypeUnits.PIXELS, 72);
            
            var nameLength = name.length;
            infoText = "\r"+name+infoText;
            var spacing = 10;
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
            this.applyBold(1, nameLength + 1);
            specText.color.rgb = newColor;
            specText.font = font;
            specText.size = model.legendFontSize;
            spec.name = "Specs";
            
            //Number system..
            if(model.specOption == "Bullet") {
                //Check if any number is linked with selected art layer or not, if not then assign a number.
                var number = $.specctrPsCommon.getBulletNumber(artLayer, doc, true);
                legendLayer.name += number;
                bullet = $.specctrPsCommon.createBullet(legendLayer, number, font, artLayerBounds, newColor);
                dupBullet = bullet.duplicate(bullet, ElementPlacement.PLACEBEFORE);
                var dia = bullet.bounds[2] - bullet.bounds[0];
                
                //Adjust position of spec items.
               $.specctrPsCommon.adjustPositionOfSpecItems(spec, specText, dupBullet, artLayerBounds[1], spacing, 
                                                                  doc.width/2.0, centerX, dia, true);
                                                                  
                dupBullet.name = "__sSecondBullet";
                spec.link(dupBullet);
                legendLayer.visible = true;
                bullet.visible = true;
            } else {
                //Calcutate the position of spec text item.
                if(centerX <=  doc.width/2.0) {
                    specText.justification = Justification.LEFT;
                    spec.translate(-(spec.bounds[0]-spacing), artLayerBounds[1]-spec.bounds[1]);
                } else {
                    specText.justification = Justification.RIGHT;
                    spec.translate(doc.width-spacing-spec.bounds[2], artLayerBounds[1]-spec.bounds[1]);
                }

                //Get the end points for arm.
                legendLayer.visible = true;
                arm = $.specctrPsCommon.createArm(specText, spec, artLayerBounds, newColor);
                arm.name = "__sArm";
                spec.link(arm);
            }

            $.specctrPsCommon.setXmpDataOfLayer(artLayer, idLayer, idSpec);
            $.specctrPsCommon.setXmpDataOfLayer(legendLayer, idLayer, idSpec);
            if(cssText === "")
                cssText = name + " {\r" + infoText.toLowerCase() + "\r}";
            $.specctrPsCommon.setXmpDataForSpec(spec, cssText, "css");

        } catch(e) {alert(e);}

        doc.activeLayer = artLayer;
        $.specctrPsCommon.setPreferences(startRulerUnits, startTypeUnits, originalDPI);
    },

    //Update the property spec of the layer whose spec is already present.
    updateSpec : function(artLayer, legendLayer, bounds) {
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
        doc.activeLayer = artLayer;

        try {
            switch(artLayer.kind) {
                case LayerKind.TEXT:
                    infoText   = this.getSpecsInfoForTextItem(artLayer);
                    newColor = $.specctrPsCommon.legendColor(model.legendColorType);
                    break;

                case LayerKind.GRADIENTFILL:
                case LayerKind.SOLIDFILL: 
                    infoText = this.getSpecsInfoForPathItem(artLayer);
                    break;

                default: 
                    infoText = this.getSpecsInfoForGeneralItem(artLayer); 
            }
        
            if(infoText == "") 
                return;

            var justification = Justification.LEFT;
            var name = artLayer.name;
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
            this.applyBold(1, nameLength+1);
            specText.color.rgb = newColor;
            specText.font = font;
            specText.size = model.legendFontSize;
            specText.justification = justification;

            var centerX = (artLayerBounds[0] + artLayerBounds[2])/2;
            var centerY = (artLayerBounds[1] + artLayerBounds[3]) / 2;
            if(model.specOption == "Bullet") {
                //Check if any number is linked with selected art layer or not, if not then assign a number.
               var number = $.specctrPsCommon.getBulletNumber(artLayer, doc, false);
                
                //Look for the arm and delete it.
                $.specctrPsCommon.deleteArtLayerByName(legendLayer, "__sArm");
                
                try {
                    var bullet = legendLayer.artLayers.getByName("__sFirstBullet");
                } catch (e) {
                    bullet = $.specctrPsCommon.createBullet(legendLayer, number, font, artLayerBounds, newColor);
                }

                try {
                    var dupBullet = legendLayer.artLayers.getByName("__sSecondBullet");
                } catch (e) {
                    dupBullet = bullet.duplicate(bullet, ElementPlacement.PLACEBEFORE);
                    dupBullet.name = "__sSecondBullet";
                }

                var dia = bullet.bounds[2] - bullet.bounds[0];
                //Adjust position of spec items.
               $.specctrPsCommon.adjustPositionOfSpecItems(spec, specText, dupBullet, artLayerBounds[1], spacing, centerX, 
                                                                    (spec.bounds[0] + spec.bounds[2]) / 2.0, dia, isNewSpecCreated);

                bullet.translate(artLayerBounds[0]-bullet.bounds[0]-dia-1, artLayerBounds[1]-bullet.bounds[1]-1);
                spec.link(dupBullet);
            } else {
                
                $.specctrPsCommon.deleteArtLayerByName(legendLayer, "__sFirstBullet");
                $.specctrPsCommon.deleteArtLayerByName(legendLayer, "__sSecondBullet");
                $.specctrPsCommon.deleteArtLayerByName(legendLayer, "__sArm");
                
                //Calcutate the position of spec text item.
                if (isNewSpecCreated == true) {
                    if(centerX <=  doc.width/2.0) {
                        specText.justification = Justification.LEFT;
                        spec.translate(-(spec.bounds[0]-spacing), artLayerBounds[1]-spec.bounds[1]);
                    } else {
                        specText.justification = Justification.RIGHT;
                        spec.translate(doc.width-spacing-spec.bounds[2], artLayerBounds[1]-spec.bounds[1]);
                    }
                }

                //Create the arm at  the end points of spec and selected art layer.
                arm = $.specctrPsCommon.createArm(specText, spec, artLayerBounds, newColor);
                arm.name = "__sArm";
                spec.link(arm);
            }

            if(cssText == "")
                cssText = name + " {\r" + infoText.toLowerCase() + "\r}";

            // Set Xmp metadata for spec and bullet.
            $.specctrPsCommon.setXmpDataForSpec(spec, cssText, "css");
        } catch(e) {alert(e);}

        doc.activeLayer = artLayer;
        doc.resizeImage(null, null, originalDPI, ResampleMethod.NONE);
        // Reset the application preferences
        app.preferences.typeUnits = startTypeUnits;
        app.preferences.rulerUnits = startRulerUnits;
    },

    //Get the properties of the text item.
    getSpecsInfoForTextItem : function(pageItem) {
        var textItem = pageItem.textItem;
        var infoText = "", color="", mFactor = "";
        var alpha = "", leading = "", size = "", font = "";
        var kDefaultLeadVal = 120.0, kDefaultFontVal='MyriadPro-Regular', kDefaultFontSize= 12;
        var underline = "", strike = "", bold = "",  italic = "";
        var tracking = "", isAutoLeading="", rltvFontSize = 16;

        try {
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

            //Paragraph styles.
            var paragraphStyleID = stringIDToTypeID("paragraphStyle");
            var defaultStyleID = stringIDToTypeID("defaultStyle");
            var paraList = desc.getList(stringIDToTypeID("paragraphStyleRange"));
            var paraDesc = paraList.getObjectValue(0);
            if (paraDesc.hasKey(paragraphStyleID)) {
                var paraStyle = paraDesc.getObjectValue(paragraphStyleID);
                if(paraStyle.hasKey(defaultStyleID)) {
                    var defStyle = paraStyle.getObjectValue(defaultStyleID);
                    if(font === "" && defStyle.hasKey(fontPostScriptID)) 
                        font = defStyle.getString(fontPostScriptID);
                    if(size === " " && defStyle.hasKey(sizeID)) {
                        size = defStyle.getDouble(sizeID);
                        if(desc.hasKey(transformID)) {
                            var mFactor = desc.getObjectValue(transformID).getUnitDoubleValue (yyID);
                            size = (size* mFactor).toFixed(2).toString().replace(/0+$/g,'').replace(/\.$/,'');
                        }
                    }
                    if(tracking === "" && defStyle.hasKey(trackingID))
                        tracking = defStyle.getInteger(trackingID);
                    if(underline === "" && defStyle.hasKey(underlineID))
                        underline = typeIDToStringID(defStyle.getEnumerationValue(underlineID));
                    if (strike === "" && defStyle.hasKey(strikethroughID))
                        strike = typeIDToStringID(defStyle.getEnumerationValue(strikethroughID));
                    if (bold === "" && defStyle.hasKey(syntheticBoldID))
                        bold = defStyle.getBoolean(syntheticBoldID);
                    if (italic === "" && defStyle.hasKey(syntheticItalicID))
                        italic = defStyle.getBoolean(syntheticItalicID);
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
                    if (color === "" && defStyle.hasKey(colorID)) 
                        color = this.getColor(defStyle.getObjectValue(colorID));
                }
            }
        } catch(e) {
            alert(e);
        }

        try {
            if(model.textAlpha)
                alpha = Math.round(pageItem.opacity)/100 ;

            var name = pageItem.name;
            var wordsArray = name.split(" ");
            if(wordsArray.length > 2)
                name = wordsArray[0] + " " + wordsArray[1] + " " + wordsArray[2];

            cssText = name.toLowerCase()+" {";
            if (model.textFont) {
                if(font == "")
                    font = kDefaultFontVal;
                    
                infoText += "\rFont-Family: " + font;
                cssText += "\r\tfont-family: " + font + ";";
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
                cssText += "\r\tfont-size: " + fontSize + ";";
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
                 cssText += "\r\tcolor: "+ color.toLowerCase() + ";";
            }

            //Get the style of text.
            if (model.textStyle) {
                var styleString = "normal";
                if (bold == true) 
                    styleString = "bold";
                if (italic == true) 
                    styleString += "/ italic";

                infoText += "\rFont-Style: " + styleString;
                cssText += "\r\tfont-style: "+ styleString + ";";
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
                    cssText += "\r\ttext-decoration: "+ styleString + ";";
                }
            }

            //Get the alignment of the text.
            try {
                if (model.textAlignment) {
                    var s = textItem.justification.toString();
                    s = s.substring(14,15).toLowerCase() + s.substring(15).toLowerCase();
                    infoText += "\rText-Align: " + s;
                    cssText += "\r\ttext-align: " + s + ";";
                }
            } catch(e) {
               var alignment = this.getAlignment();
               infoText += "\rText-Align: " + alignment;
               cssText += "\r\ttext-align: " + alignment + ";";
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
                cssText += "\r\tline-height: " + leading + ";";
            }

            if (model.textTracking) {
                var tracking = Math.round(tracking / 1000 * 100) / 100 + " em";
                infoText += "\rLetter-Spacing: " + tracking;
                cssText += "\r\tletter-spacing: " + tracking + ";";
            }
        
            if (alpha != "") {
                infoText += "\rOpacity: " + alpha;
                cssText += "\r\topacity: " + alpha + ";";
            }
        
            if (model.textEffects) {
                var strokeVal = this.getStrokeValOfLayer(pageItem);
                if(strokeVal != "")
                    infoText += strokeVal;
                    
                var effectValue = this.getEffectsOfLayer();
                if(effectValue != "")
                    infoText += effectValue;
                    
                 doc.activeLayer = pageItem;
            }
        } catch(e) {}
        
        cssText += "\r}";
        if(model.specInEM) {
            cssBodyText = "body {\r\tfont-size: " + Math.round(10000 / 16 * rltvFontSize) / 100 + "%;\r}\r\r";
            $.specctrPsCommon.setCssBodyText(cssBodyText);
        }
        
        return infoText;
    },

    //Getting info for shape object.
    getSpecsInfoForPathItem : function(pageItem) {
        var pathItem = pageItem;
        var doc = app.activeDocument;
        var alpha = "";
        
        // Get the layer kind and color value of that layer.
        var infoText = "";
        cssText = "."+pathItem.name.toLowerCase()+" {";
        
        //Gives the opacity for the art layer,
        if(model.shapeAlpha)
            alpha = Math.round(pageItem.opacity)/100;

        try {
            if (model.shapeFill) {  
                
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
                    cssText += "\r\tbackground: " + cssColor + ";";
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
                    cssText += "\r\tbackground: " + gradientValue +";";
                }
            }
        } catch(e) {}

        try {
            doc.activeLayer = pageItem;
            if(model.shapeStroke) {
                var strokeVal = this.getStrokeValOfLayer(pageItem);
                if(strokeVal != "")
                    infoText += strokeVal;
            }
            
            if(alpha != "") {
                infoText += "\rOpacity: "+alpha;
                cssText += "\r\topacity: "+alpha+";";
            }
        
            if(model.shapeEffects) {
                var effectValue = this.getEffectsOfLayer();
                if(effectValue != "")
                    infoText += effectValue;
                 doc.activeLayer = pageItem;
            }
        
            if(model.shapeBorderRadius) {
                doc.activeLayer = pageItem;
                var roundCornerValue = this.getRoundCornerValue();
                if(roundCornerValue != "") {
                    infoText += "\r" + roundCornerValue;
                    cssText += "\r\t" + roundCornerValue.toLowerCase() + ";";
                }
            }
        } catch(e) {}
        
        cssText += "\r}";
        doc.activeLayer = pageItem;
        return infoText;
    },

    //Get the default color value.
    getDefaultColor : function() {
        var newColor = new RGBColor();
        newColor.hexValue = "000000";
        return newColor;
    },

    //Get the color value of selected color model in UI.
    colorAsString : function(c) {
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

                    case "RGB":
                    default:
                        if (model.useHexColor) {
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
                        } else {
                            
                            if(model.rgbTransformIntoPercentage === true) {
                                var rVal = Math.round(colorType.red / 255 * 100);
                                var gVal =  Math.round(colorType.green / 255 * 100);
                                var bVal =  Math.round(colorType.blue / 255 * 100);
                            } else {
                                rVal = Math.round(colorType.red);
                                gVal =  Math.round(colorType.green);
                                bVal =  Math.round(colorType.blue);
                            }
                            
                            result = "rgb(" + rVal + ", " + gVal + ", " + bVal + ")";
                        }
                }
                break;

                case "CMYKColor":
                    result = "cmyk(" + Math.round(colorType.cyan) + ", " + Math.round(colorType.magenta) + ", " + Math.round(colorType.yellow) + ", " + Math.round(colorType.black) + ")";
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
                            infoText += getStrokeFx(desc);
                        else
                            infoText += " off";
                    }
                    doc.activeLayer = pageItem;
                }
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
        cssText = "." + pageItem.name.toLowerCase() + " {\r\t" + infoText.toLowerCase() + ";";

        if(model.textAlpha) {
            var opacityString = "\r\tOpacity: " + Math.round(pageItem.opacity) / 100;
            infoText += opacityString;
            cssText += opacityString.toLowerCase() + ";";
        }
        cssText += "\r}";
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
    legendPropertiesLayer : function(specName) {
        var newLayer;
        try {
            newLayer= $.specctrPsCommon.legendSpecLayer("Properties").layerSets.getByName(specName);
        } catch(e) {
            newLayer= $.specctrPsCommon.legendSpecLayer("Properties").layerSets.add();
            newLayer.name=specName;
        }
        return newLayer;
    },

};