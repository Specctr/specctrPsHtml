﻿/*//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 * File Name: specctrPsAddNote.jsx
 * Description: Include the methods for creation, updation and deletion of properties specs
  for the selected art object.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

#include "specctrPsCommon.jsx"
#include "specctrUtility.jsx"

if(typeof($)=== 'undefined')
	$={};

var model;
$.specctrPsAddNote = {

   //Suspend the history of creating add note spec of layers.
   addNoteSpecs : function(noteText) {
       try {
            var sourceItem = $.specctrPsCommon.getActiveLayer();
            if(sourceItem === null || !$.specctrPsCommon.startUpCheckBeforeSpeccing(sourceItem))      //Check if layer is valid for speccing i.e. not an artlayer set or specced object.
                return;

            var pref = app.preferences;
            var startRulerUnits = pref.rulerUnits; 
            pref.rulerUnits = Units.PIXELS;
            var bounds = sourceItem.bounds;
            pref.rulerUnits = startRulerUnits;
            
            app.activeDocument.suspendHistory('Add note spec', 'this.createNoteSpecs(sourceItem, bounds, noteText)');
        } catch(e) {}
   },

    //Create the note specs for the selected art item.
    createNoteSpecs : function(sourceItem, bounds, noteText) {
    try {

        model = $.specctrPsCommon.getModel();
        var doc = app.activeDocument;
        var infoText = $.specctrUtility.breakStringAtLength(noteText, 30);
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
                this.updateNoteSpec(sourceItem, legendLayer, bounds, propertySpecBottom, infoText);
                $.specctrPsCommon.setPreferences(startRulerUnits, startTypeUnits, originalDPI);
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
    
        //Create spec text for art object.
        var layerName = $.specctrPsCommon.getLayerName(artLayer);
        legendLayer = $.specctrPsCommon.legendSpecLayer("Add Note", parent).layerSets.add();
        legendLayer.name = "SPEC_note_" + layerName;
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
        spec.move(legendLayer, ElementPlacement.INSIDE);

        //Calcutate the position of spec text item.
        if(centerX <=  (cnvsRect[0] + cnvsRect[2])/2.0) {
            specText.justification = Justification.LEFT;
            spec.translate(-(spec.bounds[0]-spacing - cnvsRect[0]), propertySpecBottom-spec.bounds[1]);
        } else {
            specText.justification = Justification.RIGHT;
            spec.translate(cnvsRect[2]-spacing-spec.bounds[2], propertySpecBottom-spec.bounds[1]);
        }

        //Get the end points for arm.
        legendLayer.visible = true;
        arm = $.specctrPsCommon.createArm(specText, spec, artLayerBounds, newColor);
        arm.name = "__sArm";
        spec.link(arm);

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
    updateNoteSpec : function(artLayer, legendLayer, bounds, specYPos, noteText) {
        // Save the current preferences
        var startTypeUnits = app.preferences.typeUnits;
        var startRulerUnits = app.preferences.rulerUnits;
        app.preferences.rulerUnits = Units.PIXELS;
        
        var doc = app.activeDocument;
        var originalDPI = doc.resolution;
        var spacing = 10;
        var newColor;
        
        if(artLayer.kind == LayerKind.TEXT)
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
                spec.name = "Specs";
                isNewSpecCreated = true;
            }
    
            specText.contents = noteText;
            specText.color.rgb = newColor;
            specText.font = font;
            specText.size = model.legendFontSize;
            
            var centerX = (artLayerBounds[0] + artLayerBounds[2])/2;
            var centerY = (artLayerBounds[1] + artLayerBounds[3]) / 2;
            
            $.specctrPsCommon.deleteArtLayerByName(legendLayer, "__sArm");
                
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

        } catch(e) {alert(e);}

        doc.activeLayer = artLayer;
        doc.resizeImage(null, null, originalDPI, ResampleMethod.NONE);
        
        // Reset the application preferences
        app.preferences.typeUnits = startTypeUnits;
        app.preferences.rulerUnits = startRulerUnits;
    }
};
