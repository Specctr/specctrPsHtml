/*//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 * File Name: specctrPsAddNote.jsx
 * Description: Include the methods for creation, updation and deletion of properties specs
  for the selected art object.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

#include "specctrPsCommon.jsx"

if(typeof($)=== 'undefined')
	$={};

var model;
$.specctrPsAddNote = {

   //Suspend the history of creating add note spec of layers.
   addNoteSpecs : function() {
       try {
            var sourceItem = $.specctrPsCommon.getActiveLayer();
            if(sourceItem === null || !$.specctrPsCommon.startUpCheckBeforeSpeccing(sourceItem))      //Check if layer is valid for speccing i.e. not an artlayer set or specced object.
                return;

            var pref = app.preferences;
            var startRulerUnits = pref.rulerUnits; 
            pref.rulerUnits = Units.PIXELS;
            var bounds = sourceItem.bounds;
            pref.rulerUnits = startRulerUnits;
            app.activeDocument.suspendHistory('Add note spec', 'this.createNoteSpecs(sourceItem, bounds)');
        } catch(e) {}
   },

    //Create the note specs for the selected art item.
    createNoteSpecs : function(sourceItem, bounds) {
    try {

        model = $.specctrPsCommon.getModel();
        
        var doc = app.activeDocument;
        var infoText = "#Add_Note";
        var newColor;
        
        if(sourceItem.kind == LayerKind.TEXT)
            newColor = $.specctrPsCommon.legendColor(model.legendColorType);
        else
            newColor = $.specctrPsCommon.legendColor(model.legendColorObject);
            
        var artLayer = sourceItem;

        var spec, idLayer, idSpec, lyr;
        var idBullet, bullet, dupBullet, idDupBullet;
        var legendLayer, propertySpec;
        var artLayerBounds = bounds;

        //Save the current preferences
        var startTypeUnits = app.preferences.typeUnits; 
        var startRulerUnits = app.preferences.rulerUnits;
        var originalDPI = doc.resolution;
        $.specctrPsCommon.setPreferences(Units.PIXELS, TypeUnits.PIXELS, 72);
        
        var spacing = 10;
        var isLeft, pos, propertySpecBottom = artLayerBounds[1];
        var centerX = (artLayerBounds[0] + artLayerBounds[2]) / 2;             //Get the center of item.
        var centerY = (artLayerBounds[1] + artLayerBounds[3]) / 2;
        var font = model.legendFont;
        var idLayer = $.specctrPsCommon.getIDOfLayer();   //Get unique ID of selected layer.
        
        //Check if selected art layer has already the property specs with the bullet.
        if(ExternalObject.AdobeXMPScript == null)
            ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');		//Load the XMP Script library to access XMPMetadata info of layers.
         
         var idSpec = $.specctrPsCommon.getXMPData(artLayer, "idSpec");			//Check if metadata of the layer is already present or not.
         if(idSpec != null) {
             var propertyLegendLayer = $.specctrPsCommon.getLayerByID(idSpec);
             if(propertyLegendLayer) {
                 try {
                    propertySpec = propertyLegendLayer.artLayers.getByName("Specs");
                    propertySpecBottom = propertySpec.bounds[3] + spacing;
                } catch (e) {}
            }
         }
    
        var noteId = $.specctrPsCommon.getXMPData(artLayer, "idNote");			//Check if metadata of the layer is already present or not.
         if(noteId != null) {
             legendLayer = $.specctrPsCommon.getLayerByID(noteId);
             if(legendLayer) {
                this.updateNoteSpec(sourceItem, legendLayer, bounds, propertySpecBottom, propertyLegendLayer);
                return;
            }
         }
        //Create spec text for art object.
        legendLayer = $.specctrPsCommon.legendSpecLayer("Add Note").layerSets.add();
        legendLayer.name = "Note Spec";
        noteId = $.specctrPsCommon.getIDOfLayer();
        var spec = legendLayer.artLayers.add();
        spec.kind = LayerKind.TEXT;
        var specText = spec.textItem;
        specText.kind = TextType.POINTTEXT;
        specText.contents = infoText;
        specText.color.rgb = newColor;
        specText.font = font;
        specText.size = model.legendFontSize;
        spec.name = "Specs";

        //Number system.
        if(model.specOption == "Bullet") {
             if(propertyLegendLayer) {
                 try {
                    bullet = propertyLegendLayer.artLayers.getByName("__sFirstBullet");
                } catch (e) {}
             }
         
            //Check if any number is linked with selected art layer or not, if not then assign a number.
            if (!bullet) {
                var number = $.specctrPsCommon.getBulletNumber(artLayer, doc, true);
                bullet = $.specctrPsCommon.createBullet(legendLayer, number, font, artLayerBounds, newColor);
            }
            
            var dia = bullet.bounds[2] - bullet.bounds[0];
            bullet.translate(artLayerBounds[0]-bullet.bounds[0]-dia-1, artLayerBounds[1]-bullet.bounds[1]-1);
            dupBullet = bullet.duplicate(bullet, ElementPlacement.PLACEBEFORE);
            dupBullet.move(legendLayer, ElementPlacement.INSIDE);

           $.specctrPsCommon.adjustPositionOfSpecItems(spec, specText, dupBullet, propertySpecBottom, spacing,
                                                              doc.width/2.0, centerX, dia, true);

            dupBullet.name = "__sSecondBullet";
            spec.link(dupBullet);
        } else {
            //Calcutate the position of spec text item.
            if(centerX <=  doc.width/2.0) {
                specText.justification = Justification.LEFT;
                spec.translate(-(spec.bounds[0]-spacing), propertySpecBottom-spec.bounds[1]);
            } else {
                specText.justification = Justification.RIGHT;
                spec.translate(doc.width-spacing-spec.bounds[2], propertySpecBottom-spec.bounds[1]);
            }

            //Get the end points for arm.
            arm = $.specctrPsCommon.createArm(specText, spec, artLayerBounds, newColor);
            arm.name = "__sArm";
            spec.link(arm);
        }
        var xmpData = [{layerHandler : legendLayer, 
                                    properties : [{name : "idLayer", value : idLayer}, 
                                                        {name : "idNote", value : noteId}]
                                    }, 
                                    {layerHandler : artLayer,
                                        properties : [{name : "idLayer", value : idLayer}, 
                                                            {name : "idNote", value : noteId}]
                                    }];
        
        $.specctrPsCommon.setXmpDataOfLayer(xmpData);

    } catch (e) {
        alert(e);
    }
    doc.activeLayer = artLayer;
    $.specctrPsCommon.setPreferences(startRulerUnits, startTypeUnits, originalDPI);
    },

    //Update the note spec of the layer whose spec is already present.
    updateNoteSpec : function(artLayer, legendLayer, bounds, specYPos, propertyLegendLayer) {
        // Save the current preferences
        var startTypeUnits = app.preferences.typeUnits;
        var startRulerUnits = app.preferences.rulerUnits;
        app.preferences.rulerUnits = Units.PIXELS;
        
        var doc = app.activeDocument;
        var originalDPI = doc.resolution;
        var spacing = 10;
        var newColor;
        
        if(sourceItem.kind == LayerKind.TEXT)
            newColor = $.specctrPsCommon.legendColor(model.legendColorType);
        else
            newColor = $.specctrPsCommon.legendColor(model.legendColorObject);
            
        var infoText, isBulletCreated;
        var font = model.legendFont;
        var artLayerBounds = bounds;
        var pos, idDupBullet, idBullet;
        var isNewSpecCreated = false;
        doc.activeLayer = artLayer;

        try {
            var justification = Justification.LEFT;
            app.preferences.typeUnits = TypeUnits.PIXELS;
            doc.resizeImage(null, null, 72, ResampleMethod.NONE);

            try {
                var specText;
                var spec = legendLayer.artLayers.getByName("Specs");
                doc.activeLayer = spec;
                specText = spec.textItem;
            } catch (e) {
                spec = legendLayer.artLayers.add();
                spec.kind = LayerKind.TEXT;
                specText = spec.textItem;
                specText.kind = TextType.POINTTEXT;
                specText.contents = "#Add_Note";
                specText.color.rgb = newColor;
                specText.font = font;
                specText.size = model.legendFontSize;
                spec.name = "Specs";
                isNewSpecCreated = true;
            }

            var centerX = (artLayerBounds[0] + artLayerBounds[2])/2;
            var centerY = (artLayerBounds[1] + artLayerBounds[3]) / 2;
            
            $.specctrPsCommon.deleteArtLayerByName(legendLayer, "__sFirstBullet");
            $.specctrPsCommon.deleteArtLayerByName(legendLayer, "__sSecondBullet");
            $.specctrPsCommon.deleteArtLayerByName(legendLayer, "__sArm");
                
            if(model.specOption == "Bullet") {
                $.specctrPsCommon.deleteArtLayerByName(propertyLegendLayer, "__sFirstBullet");
                //Check if any number is linked with selected art layer or not, if not then assign a number.
                var number = $.specctrPsCommon.getBulletNumber(artLayer, doc, false);
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

        } catch(e) {alert(e);}

        doc.activeLayer = artLayer;
        doc.resizeImage(null, null, originalDPI, ResampleMethod.NONE);
        // Reset the application preferences
        app.preferences.typeUnits = startTypeUnits;
        app.preferences.rulerUnits = startRulerUnits;
    }
};
