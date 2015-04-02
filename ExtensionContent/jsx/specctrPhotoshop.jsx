/*//////////////////////////////////////////////////////////////////////////////
 * File Name: specctrPhotoshop.jsx
 * Description: This file calls the spec methods from their respective files i.e. property spec,
    width/height spec, spacing spec, coordinate spec and expand canvas feature.
//////////////////////////////////////////////////////////////////////////////*/

#target photoshop
#include "specctrPsCommon.jsx"
#include "specctrPsCoordinates.jsx"
#include "specctrPsDimension.jsx"
#include "specctrPsExpandCanvas.jsx"
#include "specctrPsExportCss.jsx"
#include "specctrPsProperties.jsx"
#include "specctrPsSpacing.jsx"
#include "specctrPsAddNote.jsx"

$.specctrPs = {
    //Get the application font's name and font's family.
    getFontList : function() {
        var font = app.fonts;
        var appFontLength = font.length;
        var result = [];
        //Set the spec text properties.
        for(var i = 0; i < appFontLength; i++) {
            var currFont = font[i];
            if(currFont.style == "Regular") {
                var object = {};
                object.label = currFont.family;
                object.font = currFont.postScriptName;
                result.push(object);
            }
        }
        return JSON.stringify(result);
    },

    //Call the setModel from specctrPsCommon..
    setModel : function(currModel) {
        $.specctrPsCommon.setModel(currModel);
    },

    //Call create canvas border method from specctrPsExpandCanvas jsx file.
    createCanvasBorder : function() {
        $.specctrPsExpandCanvas.createCanvasBorder();
    },

    //Call create dimension spec method from specctrPsDimension jsx file.
    createDimensionSpecs : function() {
        $.specctrPsDimension.createDimensionSpecsForItem();
    },
    
    //Call create spacing spec method from specctrPsSpacing jsx file.
    createSpacingSpecs : function() {
        $.specctrPsSpacing.createSpacingSpecs();
    },

    //Call create coordinate spec method from specctrPsCoordinates jsx file.
    createCoordinateSpecs : function() {
        $.specctrPsCoordinates.createCoordinateSpecs();
    },

    //Call create property spec method from specctrPsProperties jsx file.
    createPropertySpecs : function() {
        $.specctrPsProperties.createPropertySpecsForItem();
    },

    //Call create add note spec method from specctrPsAddNotes jsx file.
    addNoteSpecs : function() {
        $.specctrPsAddNote.addNoteSpecs();
    },

    //Call create exportCss method from specctrPsExportCss jsx file.
    exportCss : function() {
        $.specctrPsExportCss.exportCss();
    }
};
