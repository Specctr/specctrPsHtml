/*//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 * File Name: specctrPsExportCss.jsx
 * Description: Includes the methods for exporting css of the specced objects.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

#include "specctrPsCommon.jsx"
if(typeof($)=== 'undefined')
	$={};

$.specctrPsExportCss = {
	//Generate css string for specs.
	getCss : function() {
        if(!app.documents.length)           //Checking document is open or not.
	        return;
	    
	    try {
	        var propertySpecLayerGroup = app.activeDocument.layerSets.getByName("Specctr").layerSets.getByName("Properties");
	    } catch(e) {
	         alert("No spec present to export.");
	         return;
	    }
	    
	    if(ExternalObject.AdobeXMPScript == null)
	        ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');		//Load the XMP Script library to access XMPMetadata info of layers.

	    var coordinateSpecsInfo = this.getStyleFromOtherSpecs("Coordinates");           //Get the array of coordinate specs info.
	    var styleText = $.specctrPsCommon.getCssBodyText();            //Add the body text at the top of css file.
	    styleText += this.getCssForText(coordinateSpecsInfo);
	    styleText += this.getCssForShape(coordinateSpecsInfo);
        return styleText; 
	},

    //Export the spec layer's css to specctr server.
    exportCss : function() {
       var cssInfo = {
	    	document_name: app.activeDocument.name,
	    	text: this.getCss()
	    };
	    return JSON.stringify(cssInfo);
    },

    //Get the coordinate or width/height spec style info.
    getStyleFromOtherSpecs : function(specName) {
        var doc = app.activeDocument;
        var specsInfo = [];
        try {
            var specLayerGroup = doc.layerSets.getByName("Specctr").layerSets.getByName(specName);
        } catch(e) {
            return specsInfo;
        }
        
        var noOfSpecs = specLayerGroup.layerSets.length;
        while(noOfSpecs) {
            try {
                var object = {};
                var spec = specLayerGroup.layerSets[noOfSpecs - 1].artLayers[0];
                object.idLayer = $.specctrPsCommon.getXMPData(spec, "idLayer");
                object.styleText = $.specctrPsCommon.getXMPData(spec, "css");
                specsInfo.push(object);
             } catch(e) {}
             noOfSpecs = noOfSpecs - 1;
        }
        
        return specsInfo;
    },

    //Return css text for shape objects.
    getCssForShape : function(coordinateSpecsInfo) {
        var doc = app.activeDocument;
        try {
            var objectSpecGroup = doc.layerSets.getByName("Specctr").layerSets.getByName("Properties").layerSets.getByName("Object Specs");
        } catch(e) {
            return "";
        }
        
        var styleText = "";
        var dimensionSpecsInfo = this.getStyleFromOtherSpecs("Dimensions");           //Get the array of width/height specs info. 
        var noOfDimensionSpecs = dimensionSpecsInfo.length;
        var noOfCoordinateSpecs = coordinateSpecsInfo.length;
        var noOfObjectSpecLayerGroups = objectSpecGroup.layerSets.length;
        
        while(noOfObjectSpecLayerGroups) {
            try {
                var objectSpec = objectSpecGroup.layerSets[noOfObjectSpecLayerGroups - 1].artLayers.getByName("Specs");
                var text = $.specctrPsCommon.getXMPData(objectSpec, "css");

                if(noOfDimensionSpecs)
                    text = this.addSpecsStyleTextToCss(objectSpec, text, dimensionSpecsInfo);

                if(noOfCoordinateSpecs)
                    text = this.addSpecsStyleTextToCss(objectSpec, text, coordinateSpecsInfo);

                styleText += text + "\r\r";
            } catch(e) {}

            noOfObjectSpecLayerGroups = noOfObjectSpecLayerGroups - 1;
        }

        return styleText;
    },

    //Return css text for text objects.
    getCssForText : function(coordinateSpecsInfo) {
        var doc = app.activeDocument;
        try {
            var textSpecGroup = doc.layerSets.getByName("Specctr").layerSets.getByName("Properties").layerSets.getByName("Text Specs");
        } catch(e) {
            return "";
        }
        
        var styleText = "";
        var noOfTextSpecLayerGroups = textSpecGroup.layerSets.length;
        var noOfCoordinateSpecs = coordinateSpecsInfo.length;
        
        while(noOfTextSpecLayerGroups) {
            try {
                var textSpec = textSpecGroup.layerSets[noOfTextSpecLayerGroups - 1].artLayers.getByName("Specs");
                var text = $.specctrPsCommon.getXMPData(textSpec, "css");
                
                if(noOfCoordinateSpecs)
                    text = this.addSpecsStyleTextToCss(textSpec, text, coordinateSpecsInfo);
                    
                styleText += text + "\r\r";
            } catch(e) {}
            noOfTextSpecLayerGroups = noOfTextSpecLayerGroups - 1;
        }

        return styleText;
    },

    //Add coordinate or width/height style text into css file.
    addSpecsStyleTextToCss : function(spec, text, specsInfo) {
        var idLayer = $.specctrPsCommon.getXMPData(spec.parent, "idLayer");
        var specCssText = "";
        var noOfSpecs = specsInfo.length;

        for(var i = 0; i < noOfSpecs; i++) {
            if(specsInfo[i].idLayer == idLayer) {
                specCssText = specsInfo[i].styleText;
                break;
            }
        }

        if(specCssText)
            text = text.replace("}", specCssText + "\r}");
        
        return text;
    }

};