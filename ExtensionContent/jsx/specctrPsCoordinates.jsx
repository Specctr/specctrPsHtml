/*//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 * File Name: specctrPsCoordinates.jsx
 * Description: Includes the methods for creation, updation and deletion of coordinate specs
  for the selected art object.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

#include"specctrPsCommon.jsx";
if(typeof($)=== 'undefined')
	$={};

var artBoardBounds;
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
            
            //Check artboard is present or not and make changes in bounds accordingly.
            var isArtBoardPresent = $.specctrPsCommon.isArtBoardPresent();
            if(isArtBoardPresent) {
                // Check for active layer's parent.
                artBoardBounds = $.specctrPsCommon.getArtBoardBounds(sourceItem);
                if(artBoardBounds == null) {
                    alert("Property not applicable for this artlayer.");
                    return;
                }
            } else {
                artBoardBounds = null;
            }
    
            app.activeDocument.suspendHistory('Coordinate Info', 'this.createCoordinates(sourceItem, bounds)');
        } catch(e) {}
    },
    
    //Set coordinate specs to the selected corner.
    setSpecsToGivenPoints : function(spec, x1, y, x2, newColor, font, size,
                                                        justification, content, textX, textY) {
            var xLine = $.specctrPsCommon.createLine(x1, y, x2, y, newColor);     //Horizontal line.
            var yLine = xLine.duplicate(xLine, ElementPlacement.PLACEBEFORE);
            yLine = yLine.rotate(90.0);
            var coordinateText = spec.artLayers.add();
            coordinateText.kind = LayerKind.TEXT;
            var specText = coordinateText.textItem;
            specText.position = [textX,textY];
            specText.kind = TextType.POINTTEXT;
            specText.justification = justification;
            specText.color.rgb = newColor;
            specText.font = font;
            specText.size = size;
            specText.contents = content;
            
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
            var halfWeight = model.armWeight / 2;
            var size = model.legendFontSize;
            var spacing = 10 + halfWeight;
            var margin = spacing - 5;
            var widthMargin = bounds[2] - bounds[0] + model.armWeight;
            var heightMargin = bounds[3] - bounds[1] + model.armWeight;
            var startRulerUnits = app.preferences.rulerUnits;
            var startTypeUnits = app.preferences.typeUnits;
            var originalDPI = doc.resolution;
            $.specctrPsCommon.setPreferences(Units.PIXELS, TypeUnits.PIXELS, 72);

            var font = model.legendFont;
            var newColor = $.specctrPsCommon.legendColor(model.legendColorSpacing);
            var orgnlCanvas, parent;
             
             // Canvas can be Artboard.
            if(artBoardBounds == null) {
                parent = doc;
                orgnlCanvas = $.specctrPsCommon.originalCanvasSize();       //Get the original canvas size.
            } else {
                parent = $.specctrPsCommon.getArtBoard(sourceItem);
                orgnlCanvas = artBoardBounds;
            }
        
            var left = bounds[0] - orgnlCanvas[0];
            var top = bounds[1] - orgnlCanvas[1];
            var right = bounds[2] - orgnlCanvas[0];
            var bottom = bounds[3] - orgnlCanvas[1];
            
            //Responsive option selected or not.
            if(!model.specInPrcntg) {
                //Absolute distance.
                top = $.specctrPsCommon.pointsToUnitsString(top, startRulerUnits).split(" ", 1);
                left = $.specctrPsCommon.pointsToUnitsString(left, startRulerUnits).split(" ", 1);
                right = $.specctrPsCommon.pointsToUnitsString(right, startRulerUnits).split(" ", 1);
                bottom = $.specctrPsCommon.pointsToUnitsString(bottom, startRulerUnits).split(" ", 1);
            } else {
                //Relative distance with respect to original canvas.
                var relativeHeight='', relativeWidth='';
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

            var textLeftMargin = bounds[0] - margin;
            var textTopMargin = bounds[1] - margin;
            var textRightMargin = bounds[2] + margin;
            var textBottomMargin = bounds[3] - margin;
            var leftJustification = Justification.LEFT;
            var rightJustification = Justification.RIGHT;
            var styleText = "left: " + left + ";\r\ttop: " + top + 
                                        ";\r\tright: " + right + ";\r\tbottom: " + bottom + ";";

            if(legendLayer === "") {
                legendLayer = $.specctrPsCommon.legendSpecLayer("Coordinates", parent).layerSets.add();            //To create the layer group for coordinate layer.
                legendLayer.name = "Specctr Coordinates Mark";
            }

            var xLine = "", yLine = "", mark="", coordinateText = "";
            var spec = legendLayer.layerSets.add();
            spec.name = "CoordinatesSpec";

            //Coordinate specs for left top.
            var content;
            var x1, y1, x2;
             
            switch(model.coordinateCellNumber) {
                case 0: content = "x: " + left + " y: " + top;
                    x1 = bounds[0] - spacing - model.armWeight;
                    y1 = bounds[1] - halfWeight;
                    x2 = bounds[0] + spacing;
                    this.setSpecsToGivenPoints(spec, x1, y1, x2, newColor, font, size,
                                                            rightJustification,  content, textLeftMargin, textTopMargin);
                    break;
                
                case 1: content =  "x: " + right + " y: " + top;
                    x1 = bounds[2] + spacing + model.armWeight;
                    y1 = bounds[1] - halfWeight;
                    x2 = bounds[2] - spacing;
                    this.setSpecsToGivenPoints(spec, x1, y1, x2, newColor, font, size,
                                                            leftJustification,  content, textRightMargin, textTopMargin);
                break;
                
                case 2: content =  "x: " + right + " y: " + bottom;
                    x1 = bounds[2] + spacing + model.armWeight;
                    y1 = bounds[3] + halfWeight;
                    x2 = bounds[2] - spacing;
                    this.setSpecsToGivenPoints(spec, x1, y1, x2, newColor, font, size,
                                                                leftJustification,  content, textRightMargin, textBottomMargin);
                break;
                
                case 3: content =  "x: " + left + " y: " + bottom;
                    x1 = bounds[0] - spacing - model.armWeight;
                    y1 = bounds[3] + halfWeight;
                    x2 = bounds[0] + spacing;
                    this.setSpecsToGivenPoints(spec, x1, y1, x2, newColor, font, size,
                                                            rightJustification,  content, textLeftMargin, textBottomMargin);
                break;

                default:
            }

            doc.activeLayer = spec;
            spec = $.specctrPsCommon.createSmartObject();
            idCoordinateSpec = $.specctrPsCommon.getIDOfLayer();
            doc.activeLayer = sourceItem;
            var idLayer = $.specctrPsCommon.getIDOfLayer();
            
            var xmpData = [{layerHandler : sourceItem, 
                                        properties : [{name : "idCoordinateSpec", value : idCoordinateSpec}]
                                    }, 
                                    {layerHandler : spec,
                                        properties : [{name : "SpeccedObject", value : "true"}, 
                                                            {name : "css", value : styleText},
                                                            {name : "idLayer", value : idLayer}]
                                    }
                                ];
            $.specctrPsCommon.setXmpDataOfLayer(xmpData);
        
        } catch(e) {
            doc.activeLayer = sourceItem;
        }
        
        $.specctrPsCommon.setPreferences(startRulerUnits, startTypeUnits, originalDPI);      //Setting the original preferences of the document.
    }

};