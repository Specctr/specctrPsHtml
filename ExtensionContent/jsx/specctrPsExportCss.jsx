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
            var styleText = "", propertySpecLayerGroup;
            
            var layerSetLength = doc.layerSets.length;
            for (var i = 0; i < layerSetLength; i++) {
                doc.activeLayer = doc.layerSets[i];
                parent = doc.layerSets[i];
                var ref = new ActionReference();
                ref.putEnumerated( charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ) );
                isThisArtBoard = executeActionGet(ref).getBoolean(stringIDToTypeID("artboardEnabled"));
                if(isThisArtBoard)  {
                    try {
                        isArtBoardPresent = true;
                        propertySpecLayerGroup = parent.layerSets.getByName("Specctr").layerSets.getByName("Properties");
                    } catch(e) {
                         continue;
                    }
                    
                    if(ExternalObject.AdobeXMPScript == null)
                        ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');		//Load the XMP Script library to access XMPMetadata info of layers.

                    styleText += $.specctrPsCommon.getCssBodyText();            //Add the body text at the top of css file.
                    styleText += this.getCssForText(parent);
                    styleText += this.getCssForShape(parent);
                }
            }
        } catch (e) {}
        
        if(isArtBoardPresent == false) {
            try {
                propertySpecLayerGroup = doc.layerSets.getByName("Specctr").layerSets.getByName("Properties");
            } catch(e) {
                 return "";
            }
            
            if(ExternalObject.AdobeXMPScript == null)
                ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');		//Load the XMP Script library to access XMPMetadata info of layers.

            styleText = $.specctrPsCommon.getCssBodyText();            //Add the body text at the top of css file.
            styleText += this.getCssForText(doc);
            styleText += this.getCssForShape(doc);
        }
    
        if(activeLayer)
            doc.activeLayer = activeLayer;

        return styleText; 
	},

    //Export the spec layer's css to specctr server.
    exportCss : function(filePath) {
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
        
        if(cssInfo.text == "") {
            alert("No spec present to export.");
            return "";
        }
    
        //Get model value.
        var model = $.specctrPsCommon.getModel();
 
        if(model.cloudOption == "export") {
            //Export the active document as jpg.
            this.exportToJPEG(filePath);
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
    getCssForShape : function(parent) {
        try {
            var objectSpecGroup = parent.layerSets.getByName("Specctr").layerSets.getByName("Properties").layerSets.getByName("Object Specs");
        } catch(e) {
            return "";
        }
        
        var styleText = "";
        var noOfObjectSpecLayerGroups = objectSpecGroup.layerSets.length;
        
        while(noOfObjectSpecLayerGroups) {
            try {
                var objectSpec = objectSpecGroup.layerSets[noOfObjectSpecLayerGroups - 1].artLayers.getByName("Specs");
                var text = $.specctrPsCommon.getXMPData(objectSpec, "css");
                styleText += text;
            } catch(e) {}

            noOfObjectSpecLayerGroups = noOfObjectSpecLayerGroups - 1;
        }

        return styleText;
    },

    //Return css text for text objects.
    getCssForText : function(parent) {
        try {
            var textSpecGroup = parent.layerSets.getByName("Specctr").layerSets.getByName("Properties").layerSets.getByName("Text Specs");
        } catch(e) {
            return "";
        }
        
        var styleText = "";
        var noOfTextSpecLayerGroups = textSpecGroup.layerSets.length;
        
        while(noOfTextSpecLayerGroups) {
            try {
                var textSpec = textSpecGroup.layerSets[noOfTextSpecLayerGroups - 1].artLayers.getByName("Specs");
                var text = $.specctrPsCommon.getXMPData(textSpec, "css");                    
                styleText += text;
            } catch(e) {}
            noOfTextSpecLayerGroups = noOfTextSpecLayerGroups - 1;
        }

        return styleText;
    },

    //Export psd as jpg.
    exportToJPEG : function (filePath) {
        if (app.documents.length > 0  && filePath) {  
            var jpegOptions = new JPEGSaveOptions();  
            jpegOptions.quality = 1;            //Quality is less in order to keep the size minimum. 
            jpegOptions.embedColorProfile = true;  
            jpegOptions.matte = MatteType.NONE;  
            app.activeDocument.saveAs(new File(filePath), jpegOptions, true); 
        }
    }

};
