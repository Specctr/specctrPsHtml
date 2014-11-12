/*//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 * File Name: specctrPsCoordinates.jsx
 * Description: Includes the methods for creation, updation and deletion of coordinate specs
  for the selected art object.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

#include"specctrPsCommon.jsx";
if(typeof($)=== 'undefined')
	$={};

$.specctrPsCoordinates = {
    //Suspend the history of creating coordinates spec of layers.
    createCoordinateSpecs : function() {
        try {
            var sourceItem = $.specctrPsCommon.getActiveLayer();
            if(sourceItem === null || !$.specctrPsCommon.startUpCheckBeforeSpeccing(sourceItem))      //Check if layer is valid for speccing i.e. not an artlayer set or specced object.
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
            app.activeDocument.suspendHistory('Coordinate Info', 'this.createCoordinates(sourceItem, bounds)');
        } catch(e) {}
    },

    //Create coordinate specs for the layer.
    createCoordinates : function(sourceItem, bounds) {
        try {
            if(ExternalObject.AdobeXMPScript == null)
                ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');		//Load the XMP Script library to access XMPMetadata info of layers.
        
            var coordinateSpec = "", legendLayer = "";
            var idCoordinateSpec = $.specctrPsCommon.getXMPData(sourceItem, "idCoordinateSpec");
            if(idCoordinateSpec) {
                coordinateSpec = $.specctrPsCommon.getLayerByID(idCoordinateSpec);
                if(coordinateSpec) {
                    legendLayer = coordinateSpec.parent;
                    coordinateSpec.remove();
                }
            }

            //Save the current preferences
            var model = $.specctrPsCommon.getModel();
            var doc = app.activeDocument;
            var halfWeight = model.armWeight / 2.0;
            var spacing = 10 + halfWeight;
            var margin = spacing - 5;
            var layerWidth = bounds[2] - bounds[0];
            var layerHeight = bounds[3] - bounds[1];
            var startRulerUnits = app.preferences.rulerUnits;
            var startTypeUnits = app.preferences.typeUnits;
            var originalDPI = doc.resolution;
            $.specctrPsCommon.setPreferences(Units.PIXELS, TypeUnits.PIXELS, 72);

            var font = model.legendFont;
            var newColor = $.specctrPsCommon.legendColor(model.legendColorSpacing);
            var left = "", top = "", right = "", bottom = "";
            
            //Responsive option selected or not.
            if(!model.specInPrcntg) {
                //Absolute distance.
                top = $.specctrPsCommon.pointsToUnitsString(bounds[1], startRulerUnits).split(" ", 1);
                left = $.specctrPsCommon.pointsToUnitsString(bounds[0], startRulerUnits).split(" ", 1);
                right = $.specctrPsCommon.pointsToUnitsString(bounds[2], startRulerUnits).split(" ", 1);
                bottom = $.specctrPsCommon.pointsToUnitsString(bounds[3], startRulerUnits).split(" ", 1);
            } else {
                //Relative distance with respect to original canvas.
                var relativeHeight='', relativeWidth='';
                var orgnlCanvas = $.specctrPsCommon.originalCanvasSize();       //Get the original canvas size.
                if(model.relativeHeight != 0)
                    relativeHeight = model.relativeHeight;
                else
                    relativeHeight = orgnlCanvas[3];

                if(model.relativeWidth != 0)
                    relativeWidth = model.relativeWidth;
                else
                    relativeWidth = orgnlCanvas[2];

                left = Math.round(bounds[0] / relativeWidth * 10000) / 100 + "%";
                top = Math.round(bounds[1] / relativeHeight * 10000) / 100 + "%";
                right = Math.round(bounds[2] / relativeWidth * 10000) / 100 + "%";
                bottom = Math.round(bounds[3] / relativeHeight * 10000) / 100 + "%";
            }

            var styleText = "\tleft: " + left + ";\r\ttop: " + top + ";";
            
            if(legendLayer === "") {
                legendLayer = $.specctrPsCommon.legendSpecLayer("Coordinates").layerSets.add();            //To create the layer group for coordinate layer.
                legendLayer.name = "Specctr Coordinates Mark";
            }

            var xLine = "", yLine = "", mark="", coordinateText = "";
            var spec = legendLayer.layerSets.add();
            spec.name = "CoordinatesSpec";
            var aPos, bPos, cPos;

            //Coordinate specs for left top.
            if(1) {
                aPos = bounds[0] - spacing - model.armWeight;
                bPos = bounds[0] + spacing;
                cPos = bounds[1] - halfWeight;
                mark = spec.layerSets.add();
                xLine = $.specctrPsCommon.createLine(aPos, cPos, bPos, cPos, newColor);     //Horizontal line.
                yLine = xLine.duplicate(xLine, ElementPlacement.PLACEBEFORE);
                yLine = yLine.rotate(90.0);
                doc.activeLayer = mark;
                mark = $.specctrPsCommon.createSmartObject();
                coordinateText = spec.artLayers.add();
                coordinateText.kind = LayerKind.TEXT;
                var specText = coordinateText.textItem;
                specText.kind = TextType.POINTTEXT;
                specText.justification = Justification.RIGHT;
                specText.color.rgb = newColor;
                specText.font = font;
                specText.size = model.legendFontSize;
                specText.contents = "x: " + left + " y: " + top;
                specText.position = [bounds[0] - margin, bounds[1] - margin];
            }
            
            //Coordinate specs for right top.
            if(1) {
                //if(mark === "") {
                    aPos = bounds[2] - spacing;
                    bPos = bounds[2] + spacing + model.armWeight;
                    cPos = bounds[1] - halfWeight;
                    mark = spec.layerSets.add();
                    xLine = $.specctrPsCommon.createLine(aPos, cPos, bPos, cPos, newColor);     //Horizontal line.
                    yLine = xLine.duplicate(xLine, ElementPlacement.PLACEBEFORE);
                    yLine = yLine.rotate(90.0);
                    doc.activeLayer = mark;
                    mark = $.specctrPsCommon.createSmartObject();
               // } else {
                //    mark = mark.duplicate(mark, ElementPlacement.PLACEBEFORE);
                //    mark.translate(layerWidth + model.armWeight, 0);
              //  }
                if(coordinateText === "") {
                    coordinateText = spec.artLayers.add();
                    coordinateText.kind = LayerKind.TEXT;
                    specText = coordinateText.textItem;
                    specText.kind = TextType.POINTTEXT;
                    specText.color.rgb = newColor;
                    specText.font = font;
                    specText.size = model.legendFontSize;
                } else {
                    coordinateText = coordinateText.duplicate(coordinateText, ElementPlacement.PLACEBEFORE);
                    specText = coordinateText.textItem;
                }
                specText.justification = Justification.LEFT;
                specText.contents = "x: " + right + " y: " + top;
                specText.position = [bounds[2] + margin, bounds[1] - margin];
            }
        
            //Coordinate specs for left bottom.
            if(1) {
                //if(mark === "") {
                    aPos = bounds[0] - spacing - model.armWeight;
                    bPos = bounds[0] + spacing;
                    cPos = bounds[3] + halfWeight;
                    mark = spec.layerSets.add();
                    xLine = $.specctrPsCommon.createLine(aPos, cPos, bPos, cPos, newColor);     //Horizontal line.
                    yLine = xLine.duplicate(xLine, ElementPlacement.PLACEBEFORE);
                    yLine = yLine.rotate(90.0);
                    doc.activeLayer = mark;
                    mark = $.specctrPsCommon.createSmartObject();
               // } else {
                //    mark = mark.duplicate(mark, ElementPlacement.PLACEBEFORE);
                //    mark.translate(layerWidth + model.armWeight, 0);
              //  }
                if(coordinateText === "") {
                    coordinateText = spec.artLayers.add();
                    coordinateText.kind = LayerKind.TEXT;
                    specText = coordinateText.textItem;
                    specText.kind = TextType.POINTTEXT;
                    specText.color.rgb = newColor;
                    specText.font = font;
                    specText.size = model.legendFontSize;
                } else {
                    coordinateText = coordinateText.duplicate(coordinateText, ElementPlacement.PLACEBEFORE);
                    specText = coordinateText.textItem;
                }
                specText.justification = Justification.RIGHT;
                specText.contents = "x: " + left + " y: " + bottom;
                specText.position = [bounds[0] - margin, bounds[3] - margin];
            }
        
            //Coordinate specs for right bottom.
            if(1) {
                //if(mark === "") {
                    aPos = bounds[2] - spacing;
                    bPos = bounds[2] + spacing + model.armWeight;
                    cPos = bounds[3] + halfWeight;
                    mark = spec.layerSets.add();
                    xLine = $.specctrPsCommon.createLine(aPos, cPos, bPos, cPos, newColor);     //Horizontal line.
                    yLine = xLine.duplicate(xLine, ElementPlacement.PLACEBEFORE);
                    yLine = yLine.rotate(90.0);
                    doc.activeLayer = mark;
                    mark = $.specctrPsCommon.createSmartObject();
               // } else {
                //    mark = mark.duplicate(mark, ElementPlacement.PLACEBEFORE);
                //    mark.translate(layerWidth + model.armWeight, 0);
              //  }
                if(coordinateText === "") {
                    coordinateText = spec.artLayers.add();
                    coordinateText.kind = LayerKind.TEXT;
                    specText = coordinateText.textItem;
                    specText.kind = TextType.POINTTEXT;
                    specText.color.rgb = newColor;
                    specText.font = font;
                    specText.size = model.legendFontSize;
                } else {
                    coordinateText = coordinateText.duplicate(coordinateText, ElementPlacement.PLACEBEFORE);
                    specText = coordinateText.textItem;
                }
                specText.justification = Justification.LEFT;
                specText.contents = "x: " + right + " y: " + bottom;
                specText.position = [bounds[2] + margin, bounds[3] - margin];
            }
        
            doc.activeLayer = spec;
            spec = $.specctrPsCommon.createSmartObject();
            idCoordinateSpec = $.specctrPsCommon.getIDOfLayer();
            
            $.specctrPsCommon.setXmpDataForSpec(sourceItem, idCoordinateSpec, "idCoordinateSpec");
            $.specctrPsCommon.setXmpDataForSpec(spec, "true", "SpeccedObject");
            $.specctrPsCommon.setXmpDataForSpec(spec, styleText, "css");
            doc.activeLayer = sourceItem;
            var idLayer = $.specctrPsCommon.getIDOfLayer();
            $.specctrPsCommon.setXmpDataForSpec(spec, idLayer, "idLayer");
        } catch(e) {
            doc.activeLayer = sourceItem;
        }
        
        $.specctrPsCommon.setPreferences(startRulerUnits, startTypeUnits, originalDPI);      //Setting the original preferences of the document.
    }

};