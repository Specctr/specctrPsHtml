/*//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 * File Name: specctrPsExportCss.jsx
 * Description: Includes the methods for exporting css of the specced objects.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////*/

#include "specctrPsCommon.jsx"
if(typeof($)=== 'undefined')
	$={};

String.prototype.replaceAll = function(search, replacement) {
    return this.replace(new RegExp(search, 'g'), replacement);
};

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
            //Set data for each artboard and export each artboard individually otherwise eport the doc.
            var docImageArray = [];
            this.SetDocumentImgDetails(docImageArray, filePath);
            cssInfo.document_images = docImageArray;
            cssInfo.text = cssInfo.text.replaceAll("\n","");
            return JSON.stringify(cssInfo);
        } else {
            //Create the file and export it.
            var cssFile = "";
            var cssFilePath = "";
            var doc = app.activeDocument;
            
            try {
                var documentPath = doc.path;
            } catch(e) {
                documentPath = "";
            }
            
            try {
                var name = doc.name.toLowerCase().replace(".psd", "");
            } catch (e) {
                name = "Styles";
            }
                
            if(documentPath)
                cssFilePath = documentPath + "/"+name+".css";
            else
                cssFilePath = "~/desktop/"+name+".css";

            cssFile = File(cssFilePath);

            if(cssFile.exists) {
                var replaceFileFlag = confirm("File already exists in this location.\rDo you want to replace it?", true, "Specctr");
                if(!replaceFileFlag)
                    return;
            }
                
            if(cssFile) {
                cssFile.open("w");
                cssFile.write(cssInfo.text);
                cssFile.close;
                
                if(replaceFileFlag)
                    alert("CSS exported successfully.");
                else 
                    alert("CSS exported to " + cssFilePath);
                    
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
            jpegOptions.quality = 9;            
            jpegOptions.embedColorProfile = true;  
            jpegOptions.matte = MatteType.NONE;  
            app.activeDocument.saveAs(new File(filePath), jpegOptions, true); 
        }
    },

    SetDocumentImgDetails : function (docImageArray, filePath) {
        try {
            var pref = app.preferences;
            var startRulerUnits = pref.rulerUnits; 
            pref.rulerUnits = Units.PIXELS;
            
            //Get list of artboards.
            var abList = this.getAllArtboards();
            var abCount = abList[0];
            
            if(abCount < 1) {
                var doc = app.activeDocument;
                var obj = {};
                obj.image_data = "";
                obj.name = app.activeDocument.name.toLowerCase().replace(".psd", "");
                obj.width = doc.width + "";
                obj.height = doc.height + "";
                obj.is_artboard = false;
                obj.layer_id = "";
                obj.ext = "jpg";
                docImageArray.push(obj);
                pref.rulerUnits = startRulerUnits;
                
                //Export the active document as jpg.
                this.exportToJPEG(filePath + "/" + obj.name + "." + obj.ext);
                
                return;
            }
        
            //Make all invisible.
            for (var i = 0; i < abCount; i++) {
                this.selectLayerByIndex(abList[1][i]);
                app.activeDocument.activeLayer.visible = false;
            }

            for (i = 0; i < abCount; i++) {
                this.selectLayerByIndex(abList[1][i]);
                var artLayer = app.activeDocument.activeLayer;
                artLayer.visible = true;
                var bounds = $.specctrPsCommon.artBoardBounds();
                var obj = {};
                obj.image_data = "";
                obj.name = artLayer.name;
                obj.width = (bounds[2]-bounds[0]) + "";
                obj.height = (bounds[3]-bounds[1]) + "";
                obj.top = bounds[1] + "";
                obj.bottom = bounds[3] + "";
                obj.left = bounds[0] + "";
                obj.right = bounds[2] + "";
                obj.is_artboard = true;
                obj.layer_id = i+1;
                obj.ext = "jpg";
                docImageArray.push(obj);
                this.exportToJPEG(filePath +"/"+obj.name+"."+obj.ext);
                artLayer.visible = false;
            }
            
            //Make all layer visible.
            for (i = 0; i < abCount; i++) {
                this.selectLayerByIndex(abList[1][i]);
                app.activeDocument.activeLayer.visible = true;
            }
        
        } catch (e) {alert(e);}
        pref.rulerUnits = startRulerUnits;
    },

    getAllArtboards : function () {
        try {
            var ab = [];
            var theRef = new ActionReference();
            theRef.putProperty(charIDToTypeID('Prpr'), stringIDToTypeID("artboards"));
            theRef.putEnumerated(charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
            var getDescriptor = new ActionDescriptor();
            getDescriptor.putReference(stringIDToTypeID("null"), theRef);
            var abDesc = executeAction(charIDToTypeID("getd"), getDescriptor, DialogModes.NO).getObjectValue(stringIDToTypeID("artboards"));
            var abCount = abDesc.getList(stringIDToTypeID('list')).count;
            if (abCount > 0) {
                for (var i = 0; i < abCount; ++i) {
                    var abObj = abDesc.getList(stringIDToTypeID('list')).getObjectValue(i);
                    var abTopIndex = abObj.getInteger(stringIDToTypeID("top"));
                    ab.push(abTopIndex);

                }
            }
            return [abCount, ab];
        } catch (e) { alert(e); }
    },

    selectLayerByIndex : function (index) {
        var ref = new ActionReference();
        ref.putIndex(charIDToTypeID("Lyr "), index + 1);
        var desc = new ActionDescriptor();
        desc.putReference(charIDToTypeID("null"), ref);
        desc.putBoolean(charIDToTypeID("MkVs"), false);
        executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);
    }

};
