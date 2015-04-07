/*//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 * File Name: specctrPsDimension.jsx
 * Description: Includes the methods for creation, updation and deletion of width/height specs
  for the selected art object.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

#include"specctrPsCommon.jsx";
if(typeof($)=== 'undefined')
	$={};

var heightChoice = { "Left" : 1 , "Right" : 2, "Center" : 3 };
var widthChoice = { "Top" : 1 , "Bottom" : 2, "Center" : 3 };

$.specctrPsDimension = {
    //Suspend the history of creating dimension spec of layer.
    createDimensionSpecsForItem : function () {
        try {
            var artLayer = $.specctrPsCommon.getActiveLayer();
            if(artLayer === undefined || !$.specctrPsCommon.startUpCheckBeforeSpeccing(artLayer))      //Check if layer is valid for speccing i.e. not an artlayer set or specced object.
                return;

            var pref = app.preferences;
            var startRulerUnits = pref.rulerUnits; 
            pref.rulerUnits = Units.PIXELS;
            
            var ref = new ActionReference();
            ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            var layer = executeActionGet(ref);
            if(layer.hasKey(stringIDToTypeID('layerEffects')) && layer.getBoolean(stringIDToTypeID('layerFXVisible')))
                var bounds = $.specctrPsCommon.returnBounds(artLayer);
            else
                bounds = artLayer.bounds;
            pref.rulerUnits = startRulerUnits;
            app.activeDocument.suspendHistory('Dimension Specs', 'this.createDimensionSpecs(artLayer, bounds)');      //Pass bounds and layer for creating dimension spec.
        } catch(e) {}
    },

    //Create the dimension spec for a selected layer.
    createDimensionSpecs : function(artLayer, bounds) {
        if(ExternalObject.AdobeXMPScript == null)
            ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');		//Load the XMP Script library to access XMPMetadata info of layers.

        var dimensionSpec = "", legendLayer = "";
        var idDimensionSpec = $.specctrPsCommon.getXMPData(artLayer, "idDimensionSpec");
        if(idDimensionSpec) {
            dimensionSpec = $.specctrPsCommon.getLayerByID(idDimensionSpec);
            if(dimensionSpec) {
                legendLayer = dimensionSpec.parent;
                dimensionSpec.remove();
            }
        }

        //Create the specs.
        var model = $.specctrPsCommon.getModel();
        var doc = app.activeDocument;
        var startRulerUnits = app.preferences.rulerUnits;
        var startTypeUnits = app.preferences.typeUnits;
        var originalDPI = doc.resolution;
        $.specctrPsCommon.setPreferences(Units.PIXELS, TypeUnits.PIXELS, 72);

        var text = "", line = "", specText = "";
        var height = bounds[3]-bounds[1];
        var width = bounds[2]-bounds[0];
        var spacing = 10+model.armWeight;
        var armWidth = model.armWeight/2.0;
        var newColor = $.specctrPsCommon.legendColor(model.legendColorSpacing);

        if(legendLayer === "") {
            legendLayer = $.specctrPsCommon.legendSpecLayer("Dimensions").layerSets.add();
            legendLayer.name = "Specctr Dimension Mark"; 
        }

        var spec = legendLayer.layerSets.add();
        spec.name = "DimensionSpec"; 
        
        var widthValue = '', heightValue = '';
        var relativeHeight='', relativeWidth='';
        if(model.specInPrcntg) {
            var orgnlCanvas = $.specctrPsCommon.originalCanvasSize();       //Get the original canvas size.
            if(model.relativeHeight != 0)
                relativeHeight = model.relativeHeight;
            else
                relativeHeight = orgnlCanvas[3];

            if(model.relativeWidth != 0)
                relativeWidth = model.relativeWidth;
            else
                relativeWidth = orgnlCanvas[2];
        }

        if(model.widthPos > 0) {
             if(!model.specInPrcntg)
                widthValue = $.specctrPsCommon.pointsToUnitsString($.specctrPsCommon.getScaledValue(width), startRulerUnits);
            else
                widthValue = Math.round(width/relativeWidth*10000) /100+ "%";

            if(model.decimalFractionValue === "fraction")
                widthValue = $.specctrPsCommon.decimalToFraction(widthValue);

            text = spec.artLayers.add();
            text.kind = LayerKind.TEXT;
            specText = text.textItem;
            specText.kind = TextType.POINTTEXT;
            specText.justification = Justification.CENTER;
            specText.color.rgb = newColor;
            specText.font = model.legendFont;
            specText.size = model.legendFontSize;
            specText.contents = widthValue;
        }

        var aPos, bPos, cPos;
        switch(model.widthPos) {
            case widthChoice.Top:
                specText.position = [bounds[0]+width/2.0, bounds[1]-spacing-armWidth];
                bPos = bounds[1]-0.7*spacing;
                line = $.specctrPsCommon.createLine(bounds[0], bPos, bounds[2], bPos, newColor);     //Main width line.
                aPos = bounds[0]+armWidth;
                bPos = bounds[1]-0.4*spacing;
                cPos = bounds[1]-spacing;
                $.specctrPsCommon.setShape(aPos, bPos, aPos, cPos);   //Width line's left.
                aPos = bounds[2]-armWidth;
                $.specctrPsCommon.setShape(aPos, bPos, aPos, cPos);   // Width line's right.
                break;
                
            case widthChoice.Bottom:
                specText.position = [bounds[0]+width/2.0, bounds[3]+spacing+armWidth+model.legendFontSize*0.8];
                bPos = bounds[3]+0.7*spacing;
                line = $.specctrPsCommon.createLine(bounds[0], bPos, bounds[2], bPos, newColor);     //Main width line.
                aPos = bounds[0]+armWidth;
                bPos = bounds[3]+0.4*spacing;
                cPos = bounds[3]+spacing;
                $.specctrPsCommon.setShape(aPos, bPos, aPos, cPos);   //Width line's left.
                aPos = bounds[2]-armWidth;
                $.specctrPsCommon.setShape(aPos, bPos, aPos, cPos);    // Width line's right.
                break;
                
            case widthChoice.Center:
                specText.position =[bounds[0]+width/2.0, bounds[1]+height/2.0-spacing+model.armWeight*2.0];
                bPos = bounds[1]+height/2.0;
                line = $.specctrPsCommon.createLine(bounds[0], bPos, bounds[2], bPos, newColor);     //Main width line.
                aPos = bounds[0]+armWidth;
                cPos = bPos+0.4*spacing;
                bPos = bPos-0.4*spacing;
                $.specctrPsCommon.setShape(aPos, bPos, aPos, cPos);   //Width line's left.
                aPos = bounds[2]-armWidth;
                $.specctrPsCommon.setShape(aPos, bPos, aPos, cPos);   // Width line's right.   

            default:
        }

        if(model.heightPos > 0) {
            if(!model.specInPrcntg)
                heightValue = $.specctrPsCommon.pointsToUnitsString($.specctrPsCommon.getScaledValue(height), startRulerUnits);
            else
                heightValue = Math.round(height/relativeHeight*10000) /100+ "%";

            if(model.decimalFractionValue === "fraction")
                heightValue = $.specctrPsCommon.decimalToFraction(heightValue);

            text = spec.artLayers.add();
            text.kind = LayerKind.TEXT;
            specText = text.textItem;
            specText.kind = TextType.POINTTEXT;
            specText.justification = Justification.RIGHT;
            specText.color.rgb = newColor;
            specText.font = model.legendFont;
            specText.size = model.legendFontSize;
            specText.contents = heightValue;
        }

        switch(model.heightPos) {
            case heightChoice.Left:
                specText.position = [bounds[0]-spacing-armWidth, bounds[1]+height/2.0];
                aPos = bounds[0]-0.7*spacing;
                line = $.specctrPsCommon.createLine(aPos, bounds[3], aPos, bounds[1], newColor);      //Main height line
                aPos = bounds[0]-0.4*spacing;
                bPos = bounds[1]+armWidth;
                cPos = bounds[0]-spacing;
                $.specctrPsCommon.setShape(aPos, bPos, cPos, bPos);   //Height line's top.
                bPos = bounds[3]-armWidth;
                $.specctrPsCommon.setShape(aPos, bPos, cPos, bPos);    //Height line's bottom.
                break;

            case heightChoice.Right:
                specText.justification = Justification.LEFT;
                specText.position = [bounds[2]+spacing+armWidth, bounds[1]+height/2.0];
                aPos = bounds[2]+0.7*spacing;
                line = $.specctrPsCommon.createLine(aPos, bounds[3], aPos, bounds[1], newColor);      //Main height line
                aPos = bounds[2]+0.4*spacing;
                bPos = bounds[1]+armWidth;
                cPos = bounds[2]+spacing;
                $.specctrPsCommon.setShape(aPos, bPos, cPos, bPos);   //Height line's top.
                bPos = bounds[3]-armWidth;
                $.specctrPsCommon.setShape(aPos, bPos, cPos, bPos);   //Height line's bottom.
                break;

            case heightChoice.Center:
                specText.justification = Justification.LEFT;
                specText.position = [bounds[2]-width/2.0+0.4*spacing+armWidth, bounds[1]+height/2.0];
                aPos = bounds[2]-width/2.0;
                line = $.specctrPsCommon.createLine(aPos, bounds[3], aPos, bounds[1], newColor);      //Main height line
                bPos = bounds[1]+armWidth;
                cPos = aPos-0.4*spacing;
                aPos = aPos+0.4*spacing;
                $.specctrPsCommon.setShape(aPos, bPos, cPos, bPos);   //Height line's top.
                bPos = bounds[3]-armWidth;
                $.specctrPsCommon.setShape(aPos, bPos, cPos, bPos);   //Height line's bottom.
              
              default:
        }

        doc.activeLayer = spec;
        spec = $.specctrPsCommon.createSmartObject();
        idDimensionSpec = $.specctrPsCommon.getIDOfLayer();
        doc.activeLayer = artLayer;

        var xmpData = [{layerHandler : artLayer, 
                                        properties : [{name : "idDimensionSpec", value : idDimensionSpec}]
                                    }, 
                                    {layerHandler : spec,
                                        properties : [{name : "SpeccedObject", value : "true"}]
                                    }
                                ];

        if(artLayer.kind != LayerKind.TEXT) {
            var idLayer = $.specctrPsCommon.getIDOfLayer();
            var styleText = "\twidth: " + widthValue + ";\r\theight: " + heightValue + ";";
            var specData = {layerHandler : spec,
                                        properties : [{name : "css", value : styleText},
                                                            {name : "idLayer", value : idLayer}]
                                    };
            xmpData.push(specData);
        }

        $.specctrPsCommon.setXmpDataOfLayer(xmpData);
        $.specctrPsCommon.setPreferences(startRulerUnits, startTypeUnits, originalDPI);
    }

};