
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
        
            var coordinateSpec = "";
            var idCoordinateSpec = $.specctrPsCommon.getXMPData(sourceItem, "idCoordinateSpec");
            if(idCoordinateSpec) {
                coordinateSpec = $.specctrPsCommon.getLayerByID(idCoordinateSpec);
                if(coordinateSpec) {
                    var parent = coordinateSpec.parent;
                    coordinateSpec.remove();
                    if(parent.typename === "LayerSet")
                        parent.remove();
                
                    //Delete the xmp data of the layer.
                    var layerXMP = new XMPMeta(sourceItem.xmpMetadata.rawData);
                    layerXMP.deleteProperty(XMPConst.NS_PHOTOSHOP, "idCoordinateSpec");
                    sourceItem.xmpMetadata.rawData = layerXMP.serialize();
                }
            }
        
            //Save the current preferences
            var model = $.specctrPsCommon.getModel();
            var doc = app.activeDocument;
            var startRulerUnits = app.preferences.rulerUnits;
            var startTypeUnits = app.preferences.typeUnits;
            var originalDPI = doc.resolution;
            $.specctrPsCommon.setPreferences(Units.PIXELS, TypeUnits.PIXELS, 72);
        
            var font = model.legendFont;
            var newColor = $.specctrPsCommon.legendColor(model.legendColorSpacing);
            var left = "", top = "";
            
            //Responsive option selected or not.
            if(!model.specInPrcntg) {
                //Absolute distance.
                top = $.specctrPsCommon.pointsToUnitsString(bounds[1], startRulerUnits).split(" ", 1);
                left = $.specctrPsCommon.pointsToUnitsString(bounds[0], startRulerUnits).split(" ", 1);
            } else {
                //Relative distance with respect to original canvas.
                var relativeTop='', relativeLeft='';
                var orgnlCanvas = $.specctrPsCommon.originalCanvasSize();       //Get the original canvas size.
                if(model.relativeHeight != 0)
                    relativeTop = model.relativeHeight;
                else
                    relativeTop = orgnlCanvas[3];
                    
                if(model.relativeWidth != 0)
                    relativeLeft = model.relativeWidth;
                else
                    relativeLeft = orgnlCanvas[2];

                left = Math.round(bounds[0] / relativeLeft * 10000) / 100 + "%";
                top = Math.round(bounds[1] / relativeTop * 10000) / 100 + "%";
            }

            var styleText = "\tleft: " + left + ";\r\ttop: " + top + ";";
            var doc = app.activeDocument;
            var spacing = 3 + model.armWeight;
            var legendLayer = $.specctrPsCommon.legendSpecLayer("Coordinates").layerSets.add();            //To create the layer group for coordinate layer.
            legendLayer.name = "Specctr Coordinates Mark";
        
            var lines = "", coordinateText = "";
            var spec = legendLayer.layerSets.add();
            spec.name = "CoordinatesSpec";
            
            //Create the spec text for top.
            coordinateText = spec.artLayers.add();
            coordinateText.kind = LayerKind.TEXT;
            var specText = coordinateText.textItem;
            specText.kind = TextType.POINTTEXT;
            specText.justification = Justification.RIGHT;
            specText.color.rgb = newColor;
            specText.font = font;
            specText.size = model.legendFontSize;
            specText.contents = "x: " + left + " y: " + top;
            
            var line = "";
            var aPos, bPos, cPos;
            if(sourceItem.kind === LayerKind.TEXT) {

                if(sourceItem.textItem.kind === TextType.PARAGRAPHTEXT) {
                    aPos = sourceItem.textItem.position[1] - model.armWeight;
                    cPos = sourceItem.textItem.position[1] - model.armWeight / 2;
                } else {
                    aPos = sourceItem.textItem.position[1] + model.armWeight;
                    cPos = sourceItem.textItem.position[1];
                }

                bPos = bounds[0] - spacing;
                specText.position = [bPos - model.armWeight / 2, aPos - spacing];
                spacing = spacing + 5;
                bPos = bPos - 5;
                line = $.specctrPsCommon.createLine(bPos - model.armWeight,  aPos, 
                                                            bounds[0] + spacing, aPos, newColor);     //Horizontal line.

                aPos = bounds[0] - model.armWeight;
                $.specctrPsCommon.setShape(aPos, cPos - spacing, aPos, 
                                                cPos + spacing);        //Vertical line
            } else {
                specText.position =[bounds[0] - spacing, bounds[1] - spacing];
                spacing = spacing + 5;
                aPos = bounds[1] - model.armWeight / 2;
                line = $.specctrPsCommon.createLine(bounds[0] - spacing, aPos, 
                            bounds[0] + spacing, aPos, newColor);     //Horizontal line.
                aPos = bounds[0] - model.armWeight / 2;
                $.specctrPsCommon.setShape(aPos, bounds[1] - spacing, aPos, 
                            bounds[1] + spacing);        //Vertical line
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