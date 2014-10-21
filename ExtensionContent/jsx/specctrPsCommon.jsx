
#include "json2.js"
if(typeof($)=== 'undefined')
	$={};

var model = "";
var lyrBound = "";
var cssBodyText = "";
$.specctrPsCommon = {
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

    //Get the updated value of UI's component from html file.
    setModel : function(currModel) {
        model = JSON.parse(currModel);
    },

    //Return model object.
    getModel : function() {
        return model;
    },

    //Get the active layer.
    getActiveLayer : function() {
        var selectedArtItems = this.getSelectedLayers();
        if(selectedArtItems.length !== 1) {
            alert("Please select only one art item!");
            return;
        }
        return app.activeDocument.activeLayer;
    },

    //Get the list of selected layers.
    getSelectedLayers : function() {
        try {
            var doc = app.activeDocument;
            var selectedLayers   = [];

            try {
                var isBackGroundPresent = doc.backgroundLayer;
            } catch(e) {
                isBackGroundPresent = false;
            }
            
            var layerRef = new ActionReference(); 
            layerRef.putEnumerated(app.charIDToTypeID("Dcmn"), app.charIDToTypeID("Ordn"), app.charIDToTypeID("Trgt"));
            var layerDesc = app.executeActionGet(layerRef); 
            var listOfSlctedLyr;
        
            if(layerDesc.hasKey(app.stringIDToTypeID('targetLayers'))) {
                listOfSlctedLyr = layerDesc.getList(app.stringIDToTypeID('targetLayers')); 
                var noOfSlctedLayer = listOfSlctedLyr.count;
                for(var i=0; i < noOfSlctedLayer; i++) { 
                    if(isBackGroundPresent)
                        selectedLayers.push(listOfSlctedLyr.getReference(i).getIndex()); 
                    else 
                        selectedLayers.push(listOfSlctedLyr.getReference(i).getIndex()+1); 
                } 
            } else {
                layerRef = new ActionReference(); 
                layerRef.putProperty(app.charIDToTypeID("Prpr"), app.charIDToTypeID("ItmI")); 
                layerRef.putEnumerated(app.charIDToTypeID("Lyr "), app.charIDToTypeID("Ordn"), app.charIDToTypeID("Trgt")); 
                if(isBackGroundPresent) 
                    selectedLayers.push(app.executeActionGet(layerRef).getInteger(app.charIDToTypeID("ItmI"))-1); 
                else 
                    selectedLayers.push(app.executeActionGet(layerRef).getInteger(app.charIDToTypeID("ItmI"))); 
            
                var layerVisibility = doc.activeLayer.visible;
                if(layerVisibility) 
                    doc.activeLayer.visible = false;
            
                layerDesc = new ActionDescriptor();
                listOfSlctedLyr = new ActionList();
                layerRef = new ActionReference();
                layerRef.putEnumerated(app.charIDToTypeID('Lyr '), app.charIDToTypeID('Ordn'), app.charIDToTypeID('Trgt'));
                listOfSlctedLyr.putReference(layerRef);
                layerDesc.putList(app.charIDToTypeID('null'), listOfSlctedLyr);
                app.executeAction(app.charIDToTypeID('Shw '), layerDesc, DialogModes.NO);
            
                if(!doc.activeLayer.visible) 
                    selectedLayers.shift();
            
                doc.activeLayer.visible = layerVisibility;
            } 
        } catch(e) {
            selectedLayers = null;
        }
        
        return selectedLayers;
    },

    //Check if layer is a valid layer for speccing or not.
    startUpCheckBeforeSpeccing : function(artLayer) {
        try {
            var isLayerValidForSpeccing = true;
            if(artLayer.typename === "LayerSet" || artLayer.isBackgroundLayer) {
                alert("Please select one shape or text layer");
                return false;
            }
            
            if(ExternalObject.AdobeXMPScript == null)
                ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');		//Load the XMP Script library to access XMPMetadata info of layers.

            var isLayerSpec = this.getXMPData(artLayer, "SpeccedObject");
            if(isLayerSpec === "true")
                isLayerValidForSpeccing = false;
        } catch(e) {
            isLayerValidForSpeccing = false;
        }
        return isLayerValidForSpeccing;
    },

    //Check that layer has XMPMetadata or not, if yes return the data.
    getXMPData : function(activeLayer, idStr) {
        try {
            var layerXMP = new XMPMeta(activeLayer.xmpMetadata.rawData);
            var idLayer = layerXMP.getArrayItem(XMPConst.NS_PHOTOSHOP, idStr, 1).toString();
            
            if(idLayer != "")
                return idLayer;
        } catch(e){}
        return null;
    },

    // Return bounds of the layer.
    returnBounds : function(artLayer) {
        try {
            app.activeDocument.suspendHistory('Get Bounds','this.getBounds(artLayer)');     // get bounds of layer.
            executeAction(charIDToTypeID('undo'), undefined, DialogModes.NO);
            return lyrBound;
        } catch(e) {
            return artLayer.bounds;
        }
    },

    //To get the bounds of layer.
    getBounds : function(artLayer) {
        var desc, ref, list;
        try {
            app.activeDocument.activeLayer = artLayer;
            ref = new ActionReference();
            ref.putEnumerated(charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ));
            var layerEffectDesc = executeActionGet(ref).getObjectValue(stringIDToTypeID('layerEffects'));
            if(layerEffectDesc.hasKey(stringIDToTypeID('dropShadow'))) {
                desc = new ActionDescriptor();
                list = new ActionList();
                ref = new ActionReference();
                ref.putClass( charIDToTypeID( "DrSh" ) );
                ref.putEnumerated(charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ));
                list.putReference( ref );
                desc.putList( charIDToTypeID( "null" ), list );
                executeAction( charIDToTypeID( "Hd  " ), desc, DialogModes.NO );
            }
            if(layerEffectDesc.hasKey(stringIDToTypeID('outerGlow'))) {
                desc = new ActionDescriptor();
                list = new ActionList();
                ref = new ActionReference();
                ref.putClass( charIDToTypeID( "OrGl" ) );
                ref.putEnumerated(charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ));
                list.putReference( ref );
                desc.putList( charIDToTypeID( "null" ), list );
                executeAction( charIDToTypeID( "Hd  " ), desc, DialogModes.NO );
            }

            artLayer = this.createSmartObject();
        } catch(e) {}

        lyrBound = artLayer.bounds;
    },

    //Create the smart object layer of the selected layers.
    createSmartObject : function() {
        try {
            executeAction(stringIDToTypeID("newPlacedLayer"), undefined, DialogModes.NO);
            return app.activeDocument.activeLayer;
        } catch(e) {
            return null;
        }
    },

    //Check that layer has XMPMetadata or not, if yes return the data.
    getXMPData : function(activeLayer, idStr) {
        try {
            var layerXMP = new XMPMeta(activeLayer.xmpMetadata.rawData);
            var idLayer = layerXMP.getArrayItem(XMPConst.NS_PHOTOSHOP, idStr, 1).toString();
            if(idLayer != "")
                return idLayer;
        } catch(e) {}
        return null;
    },

    //Make layer active by using ID.
    getLayerByID : function(id) {
        try {
            var desc = new ActionDescriptor();
            var ref = new ActionReference();
            ref.putIdentifier( charIDToTypeID( "Lyr " ), id );
            desc.putReference( charIDToTypeID( "null" ), ref );
            desc.putBoolean( charIDToTypeID( "MkVs" ), false );
            executeAction( charIDToTypeID( "slct" ), desc, DialogModes.NO );
            return app.activeDocument.activeLayer;
        } catch(e) {
            return null;
        }
    },

    //Set the preferences of the document.
    setPreferences : function(rulerUnit, typeUnit, resolution) {
        try {
            var pref = app.preferences;
            pref.rulerUnits = rulerUnit;
            pref.typeUnits = typeUnit;
            app.activeDocument.resizeImage(null, null, resolution, ResampleMethod.NONE);
        } catch(e) {}
    },

    //Get the color to apply on the specs.
    legendColor : function(value) {
        var newColor = new RGBColor();
        newColor.hexValue = value.substring(1, 7);
        return newColor;
    },

    //This function create the artlayer set named 'Dimensions', if not created.
    legendSpecLayer : function(specName) {
        var newLayer;
        try {
            newLayer=this.legendLayer().layerSets.getByName(specName);
        } catch(e) {
            newLayer=this.legendLayer().layerSets.add();
             newLayer.name=specName;
        }
        return newLayer;	
    },

    //This function create the artlayer set named 'Specctr', if not created.
    legendLayer : function() {
        var layerSetRef;
        try {
            layerSetRef = app.activeDocument.layerSets.getByName("Specctr");
        } catch(e) {
            layerSetRef = app.activeDocument.layerSets.add();
             layerSetRef.name = "Specctr";
             this.placeBorderBefore(layerSetRef);
        }
        return layerSetRef;
    },

    //Set position of border before the particular layer in Layer panel.
    placeBorderBefore : function(lyr) {
        try {
            var border = app.activeDocument.artLayers.getByName("Specctr Canvas Border"); 
            border.move(lyr, ElementPlacement.PLACEBEFORE);
        } catch(e) {}
    },

    //Get the original size of canvas.
    originalCanvasSize : function() {
        var border = this.canvasBorder();
        if(border === undefined) {
            var bounds = [0, 0, app.activeDocument.width, app.activeDocument.height];
            return bounds;
        } else {
            return border.bounds;
        }
    },

    //Get the reference of the border, if it is already present.
    canvasBorder : function () {
        var border;
        try {
            border = app.activeDocument.artLayers.getByName("Specctr Canvas Border");                   //pass the reference of the border art layer.
        } catch(e) {}
        return border;
    },

    //Convert the value from one unit to another and return the value string.
    pointsToUnitsString : function(value, units) {
        if(units === undefined || units === null)
            units = app.preferences.rulerUnits;
        
        var result;
        switch (units) {
            case Units.POINTS:
                result = Math.round(value) + " pt";
                break;
            case Units.INCHES:
                result = Math.round(value / 72 * 100) / 100 + " in";
                break;
            case Units.PICAS:
                result = Math.round(value / 12 * 100) / 100 + " pc";
                break;
            case Units.CM:
                result = Math.round(value/28.346*100)/100+" cm";
                break;
            case Units.MM:
                result = Math.round(value/2.8346*100)/100+" mm";
                break;
            default:
                result = Math.round(value)+" px";
                break;
        }
        return result;
    },

    //Apply scaling to the given value.
    getScaledValue : function(value) {
        var scaledValue = value;
        try {
            if(model.useScaleBy) {
                var scaling = Number(model.scaleValue.substring(1));
                if(!scaling)
                    scaling = 1;

                if(model.scaleValue.charAt(0) === '/')
                    scaledValue = scaledValue / scaling;
                else
                    scaledValue = scaledValue * scaling;
            }
        } catch(e) {
            scaledValue = value;
        }
        return scaledValue;
    },

    //Create line and apply color to that line.
    createLine : function(startX, startY, endX, endY, newColor) {
        var idcontentLayer = stringIDToTypeID( "contentLayer" );
        var idSolidLayer = stringIDToTypeID( "solidColorLayer" );
        var idStrt = charIDToTypeID( "Strt" );
        var idHrzn = charIDToTypeID( "Hrzn" );
        var idPxl = charIDToTypeID( "#Pxl" );
        var idVrtc = charIDToTypeID( "Vrtc" );
        var idPnt = charIDToTypeID( "Pnt " );
        var idNull = charIDToTypeID( "null" );
        var idType = charIDToTypeID( "T   " );
        var idOrdn = charIDToTypeID( "Ordn" );
        var idTrgt = charIDToTypeID( "Trgt" );

        //Creating arm.
        var actRef = new ActionReference();
        actRef.putClass( idcontentLayer );
        var layerDesc = new ActionDescriptor();
        layerDesc.putReference(idNull, actRef );
        var lineDesc = new ActionDescriptor();
        lineDesc.putClass( charIDToTypeID( "Type" ), idSolidLayer);
        var propertyDesc = new ActionDescriptor();
        var strtPointDesc = new ActionDescriptor();
        strtPointDesc.putUnitDouble( idHrzn, idPxl,  startX);
        strtPointDesc.putUnitDouble( idVrtc, idPxl, startY);
        var endPointDesc = new ActionDescriptor();
        endPointDesc.putUnitDouble( idHrzn, idPxl, endX );
        endPointDesc.putUnitDouble( idVrtc, idPxl, endY );
        propertyDesc.putObject(  charIDToTypeID( "Strt" ), idPnt, strtPointDesc );
        propertyDesc.putObject( charIDToTypeID( "End " ), idPnt, endPointDesc);
        propertyDesc.putUnitDouble( charIDToTypeID( "Wdth" ), idPxl, model.armWeight );
        lineDesc.putObject( charIDToTypeID( "Shp " ), charIDToTypeID( "Ln  " ), propertyDesc );
        layerDesc.putObject( charIDToTypeID( "Usng" ), idcontentLayer, lineDesc );
        executeAction( charIDToTypeID( "Mk  " ), layerDesc, DialogModes.NO );

        //Adding color to the selected art layer.
        actRef = new ActionReference();
        actRef.putEnumerated( idcontentLayer, idOrdn, idTrgt);
        layerDesc = new ActionDescriptor();
        layerDesc.putReference(idNull, actRef );
        var colorDesc = new ActionDescriptor();
        colorDesc.putDouble( charIDToTypeID( "Rd  " ), newColor.red);
        colorDesc.putDouble( charIDToTypeID( "Grn " ), newColor.green );
        colorDesc.putDouble( charIDToTypeID( "Bl  " ), newColor.blue );
        var setColorDesc = new ActionDescriptor();
        setColorDesc.putObject( charIDToTypeID( "Clr " ), charIDToTypeID( "RGBC" ), colorDesc );
        layerDesc.putObject( idType, idSolidLayer, setColorDesc );
        executeAction( charIDToTypeID( "setd" ), layerDesc, DialogModes.NO );
            
         return app.activeDocument.activeLayer;
    },

    //Create the shape art layer in the selected layer.
    setShape : function(startX, startY, endX, endY, shape) {
        var idPxl = charIDToTypeID("#Pxl");
        var idHrzn = charIDToTypeID("Hrzn");
        var idVrtc = charIDToTypeID("Vrtc");
        
        var shapeDesc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID("Path"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        shapeDesc.putReference(charIDToTypeID("null"), ref);
        var propDesc = new ActionDescriptor();
        var desc = new ActionDescriptor();
        desc.putUnitDouble(idHrzn, idPxl, startX);
        desc.putUnitDouble(idVrtc, idPxl, startY);
        propDesc.putObject(charIDToTypeID( "Strt" ), idPxl, desc);
        desc = new ActionDescriptor();
        desc.putUnitDouble( idHrzn, idPxl, endX);
        desc.putUnitDouble( idVrtc, idPxl, endY);
        propDesc.putObject( charIDToTypeID("End "), idPxl, desc);
        propDesc.putUnitDouble( charIDToTypeID("Wdth"), idPxl, model.armWeight);
        shapeDesc.putObject( charIDToTypeID( "T   " ),  charIDToTypeID( "Ln  " ), propDesc);
        executeAction( charIDToTypeID( "AddT" ), shapeDesc, DialogModes.NO );
    },

    //Get ID of selected art layer.
    getIDOfLayer : function() {
        var ref = new ActionReference(); 
        ref.putProperty( charIDToTypeID("Prpr") , charIDToTypeID( "LyrI" )); 
        ref.putEnumerated( charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        return(executeActionGet(ref).getInteger(charIDToTypeID( "LyrI" )));
    },

    //Set XMPMetadata for specced Object.
    setXmpDataForSpec : function(activeLayer, value, specString) {
        var layerXMP;
        try {
            layerXMP = new XMPMeta(activeLayer.xmpMetadata.rawData);
        } catch(e) {
            layerXMP = new XMPMeta();			// layer did not have metadata so create new
        }

        try {
            layerXMP.appendArrayItem(XMPConst.NS_PHOTOSHOP, specString, null, XMPConst.PROP_IS_ARRAY, XMPConst.ARRAY_IS_ORDERED);
            layerXMP.insertArrayItem(XMPConst.NS_PHOTOSHOP, specString, 1, value.toString());
            activeLayer.xmpMetadata.rawData = layerXMP.serialize();
        } catch(e){}
    },

    //Select the layers on name basis.
    selectLayers : function(firstLyr, scndLyr, thrdLyr, frthLyr) {
        try {
            var idLyr = charIDToTypeID("Lyr ");
            var desc = new ActionDescriptor();
            var ref = new ActionReference();

            if(firstLyr != undefined)
                ref.putName(idLyr, firstLyr);
            if(scndLyr != undefined)
                ref.putName(idLyr, scndLyr);
            if(thrdLyr != undefined)
                ref.putName(idLyr, thrdLyr);
            if(frthLyr != undefined)
                ref.putName(idLyr, frthLyr);
                
            desc.putReference(charIDToTypeID("null"), ref);
            desc.putBoolean(charIDToTypeID("MkVs"), false);
            executeAction(charIDToTypeID("slct"), desc, DialogModes.NO);
        } catch(e) {}
    },

    //Make the layer active by using index value.
    selectLayerByIndex : function(index) {
        var layerRef = new ActionReference();
        layerRef.putIndex(app.charIDToTypeID("Lyr "), index);
        var layerDesc = new ActionDescriptor();
        layerDesc.putReference(app.charIDToTypeID("null"), layerRef);
        layerDesc.putBoolean(app.charIDToTypeID("MkVs"), false); 
        try {
            app.executeAction(app.charIDToTypeID("slct"), layerDesc, DialogModes.NO);
            return app.activeDocument.activeLayer;
        } catch(e) {
            return null;
        }
    },

    //To get the type units of the application preferences.
    getTypeUnits : function() {
         var units = app.preferences.typeUnits;
         var unitStr = "px";
         if(units == "TypeUnits.POINTS")
            unitStr = "pt";
         else if(units == "TypeUnits.MM")
            unitStr = "mm";
         return unitStr;
    },

    setCssBodyText : function (cssBody) {
            cssBodyText = cssBody;
        },

    getCssBodyText : function (cssBody) {
            return cssBodyText;
        }

};

