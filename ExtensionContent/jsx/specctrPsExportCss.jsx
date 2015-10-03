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
	        return "";
	    
         try {
            var doc = app.activeDocument;
            var activeLayer = doc.activeLayer;
            var parent, isThisArtBoard, isArtBoardPresent = false;
            var coordinateSpecsInfo, styleText = "", propertySpecLayerGroup;
            
            var layerSetLength = doc.layerSets.length;
            for (var i = 0; i < layerSetLength; i++) {
                doc.activeLayer = doc.layerSets[i];
                parent = doc.layerSets[i];
                var ref = new ActionReference();
                ref.putEnumerated( charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ) );
                isThisArtBoard = executeActionGet(ref).getBoolean(stringIDToTypeID("artboardEnabled"));
                if(isThisArtBoard)  {
                    try {
                        propertySpecLayerGroup = parent.layerSets.getByName("Specctr").layerSets.getByName("Properties");
                    } catch(e) {
                         return "";
                    }
                    
                    if(ExternalObject.AdobeXMPScript == null)
                        ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');		//Load the XMP Script library to access XMPMetadata info of layers.

                    coordinateSpecsInfo = this.getStyleFromOtherSpecs("Coordinates", parent);           //Get the array of coordinate specs info.
                    styleText += $.specctrPsCommon.getCssBodyText();            //Add the body text at the top of css file.
                    styleText += this.getCssForText(coordinateSpecsInfo, parent);
                    styleText += this.getCssForShape(coordinateSpecsInfo, parent);
                    isArtBoardPresent = true;
                }
            }
        } catch (e) {}
        
        if(isArtBoardPresent == false) {
            try {
                propertySpecLayerGroup = doc.layerSets.getByName("Specctr").layerSets.getByName("Properties");
            } catch(e) {
                 alert("No spec present to export.");
                 return "";
            }
            
            if(ExternalObject.AdobeXMPScript == null)
                ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');		//Load the XMP Script library to access XMPMetadata info of layers.

            coordinateSpecsInfo = this.getStyleFromOtherSpecs("Coordinates", doc);           //Get the array of coordinate specs info.
            styleText = $.specctrPsCommon.getCssBodyText();            //Add the body text at the top of css file.
            styleText += this.getCssForText(coordinateSpecsInfo, doc);
            styleText += this.getCssForShape(coordinateSpecsInfo, doc);
        }
    
        if(activeLayer)
            doc.activeLayer = activeLayer;

        return styleText; 
	},

    //Export the spec layer's css to specctr server.
    exportCss : function() {
        if(ExternalObject.AdobeXMPScript == null)
            ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');
            
        var documentId = $.specctrPsCommon.getXMPData(app.activeDocument, "document_id");
        var projectId = $.specctrPsCommon.getXMPData(app.activeDocument, "project_id");
        var cssInfo = {
	    	document_name: app.activeDocument.name,
             document_id:  documentId,
             project_id: projectId,
	    	text: this.getCss()
	    };
        
        if(cssInfo.text == "")
            return "";
        
        //Get model value.
        var model = $.specctrPsCommon.getModel();
 
        if(model.cloudOption == "export") {
            return JSON.stringify(cssInfo);
        } else {
            //Create the file and export it.
            var cssFile = "";
            var cssFilePath = "";
            
            try {
                var documentPath = app.activeDocument.path;
            } catch(e) {
                documentPath = "";
            }
            
            if(documentPath)
                cssFilePath = documentPath + "/Styles.css";
            else
                cssFilePath = "~/desktop/Styles.css";

            cssFile = File(cssFilePath);

            if(cssFile.exists) {
                var replaceFileFlag = confirm("Styles.css already exists in this location.\rDo you want to replace it?", true, "Specctr");
                if(!replaceFileFlag)
                    return;
            }
                
            if(cssFile) {
                cssFile.open("w");
                cssFile.write(cssInfo.text);
                cssFile.close;
                
                if(replaceFileFlag)
                    alert("Styles.css is exported.");
                else 
                    alert("Styles.css is exported to " + cssFilePath);
            } else {
                alert("Unable to export!");
                return;
            }
        }
    },

    //Get the coordinate or width/height spec style info.
    getStyleFromOtherSpecs : function(specName, parent) {
        var specsInfo = [];
        try {
            var specLayerGroup = parent.layerSets.getByName("Specctr").layerSets.getByName(specName);
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
    getCssForShape : function(coordinateSpecsInfo, parent) {
        try {
            var objectSpecGroup = parent.layerSets.getByName("Specctr").layerSets.getByName("Properties").layerSets.getByName("Object Specs");
        } catch(e) {
            return "";
        }
        
        var styleText = "";
        var dimensionSpecsInfo = this.getStyleFromOtherSpecs("Dimensions", parent);           //Get the array of width/height specs info. 
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
    getCssForText : function(coordinateSpecsInfo, parent) {
        try {
            var textSpecGroup = parent.layerSets.getByName("Specctr").layerSets.getByName("Properties").layerSets.getByName("Text Specs");
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