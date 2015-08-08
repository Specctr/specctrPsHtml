/*//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 * File Name: specctrPsExpandCanvas.jsx
 * Description: Includes the methods for creating border at the canvas edges and expand the canvas. 
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

#include"specctrPsCommon.jsx";
if(typeof($) === 'undefined')
	$={};

$.specctrPsExpandCanvas = {

    //Suspend the history of creating canvas border.
    createCanvasBorder : function () {
        try {
            if(!app.documents.length)    //Checking document is open or not.
                return;
            
            var isArtBoardPresent = $.specctrPsCommon.isArtBoardPresent();
            if(isArtBoardPresent) {
               alert("Property not applicable for this document.")
               return;
            }

            app.activeDocument.suspendHistory('Expand Canvas', 'this.expandCanvas()');
        } catch(e) {}
    },

    //Expand the canvas.
    expandCanvas : function () {
       try {       
           if(ExternalObject.AdobeXMPScript == null)
                ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
            
            var doc = app.activeDocument;
            var pref = app.preferences;
            var startRulerUnits = pref.rulerUnits; 
            pref.rulerUnits = Units.PIXELS;
            var model = $.specctrPsCommon.getModel();
            var height = doc.height;
            var width = doc.width;
            var activeLayer = doc.activeLayer;
            var border = $.specctrPsCommon.canvasBorder();       //Checking  whether border is created or not.
            if(border === undefined) {
                var backgroundLayer = this.backgroundLayerIntoNormalLayer();              //Convert background layer into normal layer.
                this.selectAllLayer();                                          //Select all layers from layer panel.
                var group = this.groupLayers();
                var groupName = "Original Canvas ["+width+" x "+height+"]"
                group.name = groupName;
                doc.selection.selectAll();                                    //Select the whole canvas.
                this.layerMasking();                                          //Mask the group layer.
                if(backgroundLayer)
                    this.lyrIntoBckgrndLyr();                                     //Add layer and convert it into background layer.
                
                border = this.drawDashBorder();                                       //Create the dashed border.
                doc = app.activeDocument;
                
                try {
                    var specctrLayer = doc.layerSets.getByName(groupName).layerSets.getByName("Specctr");
                    specctrLayer.move(doc.layers[0] , ElementPlacement.PLACEAFTER);     //Move the Specctr folder.
                } catch(e) {}
                
                //Store border width in metadata. 
                var xmpData = [{layerHandler : border, 
                                        properties : [{name : "borderWidth", value : Math.ceil(model.armWeight).toString ()}]
                                    }
                                ];

                $.specctrPsCommon.setXmpDataOfLayer(xmpData);
            }
            
            doc.resizeCanvas(width + 2*model.canvasExpandSize, 
                                        height + 2*model.canvasExpandSize, AnchorPosition.MIDDLECENTER);     // Expanding the canvas.

        } catch(e) {
            alert(e);
        }
        
        if(activeLayer)
            doc.activeLayer = activeLayer;
        
        pref.rulerUnits = startRulerUnits;
    },

    //Convert background layer into regular layer.
    backgroundLayerIntoNormalLayer : function () {
        try {
            var idLyr = charIDToTypeID("Lyr ");
            var desc = new ActionDescriptor();
            var ref = new ActionReference();
            ref.putProperty(idLyr, charIDToTypeID("Bckg"));
            desc.putReference(charIDToTypeID("null"), ref);
            var propertyDesc = new ActionDescriptor();
            propertyDesc.putUnitDouble(charIDToTypeID("Opct"), charIDToTypeID("#Prc"), 100.0);
            propertyDesc.putEnumerated(charIDToTypeID("Md  "), charIDToTypeID("BlnM"), charIDToTypeID("Nrml"));
            desc.putObject(charIDToTypeID("T   "), idLyr, propertyDesc);
            executeAction(charIDToTypeID( "setd" ), desc, DialogModes.NO );
            return true;
        } catch (e) {
            return false;
        }
    },

    //Select all layers in the layer panel.
    selectAllLayer : function () {
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        desc.putReference(charIDToTypeID("null"), ref);
        executeAction(stringIDToTypeID("selectAllLayers"), desc, DialogModes.NO);
    },

    //Group the selected layers.
    groupLayers : function () {
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putClass(stringIDToTypeID("layerSection"));
        desc.putReference(charIDToTypeID("null"), ref);
        var refLyr = new ActionReference();
        refLyr.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        desc.putReference(charIDToTypeID("From"), refLyr);
        executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
        return app.activeDocument.activeLayer;
    },

    //Mask the group layer.
    layerMasking : function () {
        var desc = new ActionDescriptor();
        var idChnl = charIDToTypeID("Chnl");
        desc.putClass(charIDToTypeID("Nw  "), idChnl);
        var ref = new ActionReference();
        ref.putEnumerated(idChnl, idChnl, charIDToTypeID("Msk "));
        desc.putReference(charIDToTypeID("At  "), ref);
        desc.putEnumerated(charIDToTypeID("Usng"), charIDToTypeID("UsrM"), charIDToTypeID("RvlS"));
        executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
    },

    //Add layer and convert it into background layer.
    lyrIntoBckgrndLyr : function () {
        var lyr = app.activeDocument.artLayers.add();
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putClass(charIDToTypeID("BckL"));
        desc.putReference(charIDToTypeID("null"), ref);
        var refLayer = new ActionReference();
        refLayer.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        desc.putReference(charIDToTypeID("Usng"), refLayer);
        executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO );
    },    

    //Draw a dash line border of original size of the canvas.
    drawDashBorder : function () {
        var doc = app.activeDocument;
        var model = $.specctrPsCommon.getModel();
        var height = doc.height;
        var width = doc.width;
        var newColor = new RGBColor();
        newColor.red = 200;
        newColor.blue = 200;
        newColor.green = 200;
            
        var idsolidColorLayer = stringIDToTypeID("solidColorLayer");
        var idClr = charIDToTypeID("Clr ");
        var idRd = charIDToTypeID("Rd  ");
        var idGrn = charIDToTypeID("Grn ");
        var idBl = charIDToTypeID("Bl  ");
        var idRGBC = charIDToTypeID("RGBC");
        var idPxl = charIDToTypeID("#Pxl");
            
        var strokeDashes = 12.0;
        var spaceBetweenStrokes = 12.0;
        var strokeStyleResolution = 70.0;
        var strokeOpacity = 100.0;
        var cornerSize = -1.0;
        var offset = 0.0;
        var miterLimit = 100.0;
            
        //Border for CS 6 and CC version.
        var idNne = charIDToTypeID("#Nne");
        var idstrokeStyleLineCapType = stringIDToTypeID( "strokeStyleLineCapType" );
        var idstrokeStyle = stringIDToTypeID("strokeStyle");
        var idstrokeStyleLineJoinType = stringIDToTypeID("strokeStyleLineJoinType");
        var idstrokeStyleLineAlignment = stringIDToTypeID("strokeStyleLineAlignment");
            
        var borderDesc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putClass(stringIDToTypeID("contentLayer"));
        borderDesc.putReference(charIDToTypeID("null"), ref);
            
        var propertyDesc = new ActionDescriptor();
        var colorDesc = new ActionDescriptor();
        var desc = new ActionDescriptor();
        desc.putDouble(idRd, newColor.red);
        desc.putDouble(idGrn, newColor.green);
        desc.putDouble(idBl, newColor.blue);
        colorDesc.putObject(idClr, idRGBC, desc);
        propertyDesc.putObject(charIDToTypeID("Type"), idsolidColorLayer, colorDesc);
            
        desc = new ActionDescriptor();
        desc.putInteger(stringIDToTypeID("unitValueQuadVersion"), 1);
        desc.putUnitDouble(charIDToTypeID("Top "), idPxl, 0);
        desc.putUnitDouble(charIDToTypeID("Left"), idPxl, 0);
        desc.putUnitDouble(charIDToTypeID("Btom"), idPxl, height);
        desc.putUnitDouble(charIDToTypeID("Rght"), idPxl, width);
        desc.putUnitDouble(stringIDToTypeID("topRight"), idPxl, cornerSize);
        desc.putUnitDouble(stringIDToTypeID("topLeft"), idPxl, cornerSize);
        desc.putUnitDouble(stringIDToTypeID("bottomLeft"), idPxl, cornerSize);
        desc.putUnitDouble(stringIDToTypeID("bottomRight"), idPxl, cornerSize);
        propertyDesc.putObject(charIDToTypeID("Shp "), charIDToTypeID("Rctn"), desc);
            
        desc = new ActionDescriptor();
        desc.putInteger(stringIDToTypeID("strokeStyleVersion"), 2);
        desc.putBoolean(stringIDToTypeID("strokeEnabled"), true);
        desc.putBoolean(stringIDToTypeID("fillEnabled"), false);
        desc.putUnitDouble(stringIDToTypeID("strokeStyleLineWidth"), idPxl, model.armWeight);
        desc.putUnitDouble(stringIDToTypeID("strokeStyleLineDashOffset"), idPxl, offset);
        desc.putDouble(stringIDToTypeID("strokeStyleMiterLimit"), miterLimit);
        desc.putEnumerated(idstrokeStyleLineCapType, idstrokeStyleLineCapType, stringIDToTypeID("strokeStyleButtCap"));
        desc.putEnumerated(idstrokeStyleLineJoinType, idstrokeStyleLineJoinType, stringIDToTypeID("strokeStyleMiterJoin"));
        desc.putEnumerated(idstrokeStyleLineAlignment, idstrokeStyleLineAlignment, stringIDToTypeID("strokeStyleAlignCenter"));
        desc.putEnumerated( idstrokeStyleLineAlignment, idstrokeStyleLineAlignment, stringIDToTypeID( "strokeStyleAlignOutside" ) );
        desc.putBoolean(stringIDToTypeID("strokeStyleScaleLock"), false);
        desc.putBoolean(stringIDToTypeID("strokeStyleStrokeAdjust"), false);
            
        var list = new ActionList();
        list.putUnitDouble(idNne, strokeDashes);
        list.putUnitDouble(idNne, spaceBetweenStrokes);
         
        desc.putList(stringIDToTypeID("strokeStyleLineDashSet"), list);
        desc.putEnumerated(stringIDToTypeID("strokeStyleBlendMode"), charIDToTypeID("BlnM"), charIDToTypeID("Nrml"));
        desc.putUnitDouble( stringIDToTypeID("strokeStyleOpacity"), charIDToTypeID("#Prc"), strokeOpacity);
            
        colorDesc = new ActionDescriptor();
        var tmpDesc = new ActionDescriptor();
        tmpDesc.putDouble(idRd, newColor.red);
        tmpDesc.putDouble(idGrn, newColor.green);
        tmpDesc.putDouble(idBl, newColor.blue);
        colorDesc.putObject(idClr, idRGBC, tmpDesc);
            
        desc.putObject(stringIDToTypeID("strokeStyleContent"), idsolidColorLayer, colorDesc);
        desc.putDouble(stringIDToTypeID("strokeStyleResolution"), strokeStyleResolution);
        propertyDesc.putObject(idstrokeStyle, idstrokeStyle, desc);
           
        borderDesc.putObject(charIDToTypeID("Usng"), stringIDToTypeID("contentLayer"), propertyDesc);
        executeAction(charIDToTypeID("Mk  "), borderDesc, DialogModes.NO);

        doc.activeLayer.move(doc.layers[0] , ElementPlacement.PLACEBEFORE);
        doc.activeLayer.name =  "Specctr Canvas Border";
        doc.activeLayer.allLocked = true;
        
        return doc.activeLayer;
    }
};