/*//////////////////////////////////////////////////////////////////////////////
 * File Name: specctrPsCommon.jsx
 * Description: Includes all the common methods which is used in the creation of all other specs.
//////////////////////////////////////////////////////////////////////////////*/

#include "json2.js"
if(typeof($)=== 'undefined')
	$={};

var model = "";
var lyrBound = "";
var cssBodyText = "";
$.specctrPsCommon = {
    
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
    legendSpecLayer : function(specName, parent) {
        var newLayer;
        try {
            newLayer=this.legendLayer(parent).layerSets.getByName(specName);
        } catch(e) {
            newLayer=this.legendLayer(parent).layerSets.add();
             newLayer.name=specName;
        }
        return newLayer;	
    },

    //This function create the artlayer set named 'Specctr', if not created.
    legendLayer : function(parent) {
        var layerSetRef;
        try {
            layerSetRef = parent.layerSets.getByName("Specctr");
        } catch(e) {
             layerSetRef = parent.layerSets.add();
             layerSetRef.name = "Specctr";
             this.placeBorderBefore(layerSetRef);
        }
        return layerSetRef;
    },

    //Set position of border before the particular layer in Layer panel.
    placeBorderBefore : function(layer) {
        try {
            var border = app.activeDocument.artLayers.getByName("Specctr Canvas Border"); 
            border.move(layer, ElementPlacement.PLACEBEFORE);
        } catch(e) {}
    },

    //Get the original size of canvas.
    originalCanvasSize : function() {
        var bounds; 
        var border = this.canvasBorder();
        if(border === undefined) {
            bounds = [0, 0, app.activeDocument.width, app.activeDocument.height];
        } else {
            //Get stored border width from metadata. 
            var armWeight = Number(this.getXMPData(border, "borderWidth"));
            bounds = border.bounds; 
            bounds[0] += armWeight; 
            bounds[1] += armWeight; 
            bounds[2] -= armWeight; 
            bounds[3] -= armWeight; 
        }
        return bounds;
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

    //Get ID of selected art layer.
    getIDOfLayer : function() {
        var ref = new ActionReference(); 
        ref.putProperty( charIDToTypeID("Prpr") , charIDToTypeID( "LyrI" )); 
        ref.putEnumerated( charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        return(executeActionGet(ref).getInteger(charIDToTypeID( "LyrI" )));
    },

    //Set the XMPMetadata to the active layer.
    setXmpDataOfLayer : function(data) {
        var layer, layerXMP;
        var noOfLayers = data.length;
        var propertyName, value, noOfProperties;
        
        for (var i = 0; i < noOfLayers; i++) {
            layer = data[i].layerHandler;
            noOfProperties = data[i].properties.length;
            try {
                layerXMP = new XMPMeta(layer.xmpMetadata.rawData);
            } catch(e) {
                layerXMP = new XMPMeta();	// layer did not have metadata so create new.
            }
            
            for (var k = 0; k < noOfProperties; k++) {
                try {
                    propertyName = data[i].properties[k].name;
                    value = data[i].properties[k].value;
                    layerXMP.appendArrayItem(XMPConst.NS_PHOTOSHOP, propertyName, null, XMPConst.PROP_IS_ARRAY, XMPConst.ARRAY_IS_ORDERED);
                    layerXMP.insertArrayItem(XMPConst.NS_PHOTOSHOP, propertyName, 1, value.toString());
                } catch(e) {}
            }
            layer.xmpMetadata.rawData = layerXMP.serialize();
        }
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
        if(cssBodyText == 'undefined')
            cssBodyText = "";
        return cssBodyText;
    },
    
    //Convert decimal value into fraction string.
    decimalToFraction : function (decimalValue) {
        //Split decimalValue and get the digit value.
        var digitValue = decimalValue.split (" ");
        if(decimalValue.search("%") !== -1) {
            digitValue = decimalValue.split("%");
            digitValue[1] = "%";
        }
            
        var digitPart = digitValue[0];
        var postUnit = "";
        if(digitValue.length === 2)
            postUnit = " " + digitValue[1];

        function highestCommonFactor(a,b) {
            if (b == 0) return a;
            return highestCommonFactor(b, a % b);
        }

        var decimalArray = digitPart.split(".");
        if(decimalArray.length == 1) {
            return decimalValue;
        }

        var leftDecimalPart = decimalArray[0];
        var rightDecimalPart = decimalArray[1];

        var numerator = leftDecimalPart + rightDecimalPart;
        var denominator = Math.pow(10, rightDecimalPart.length);
        var factor = highestCommonFactor(numerator, denominator);
        denominator /= factor;
        numerator /= factor;
        return numerator + "/" + denominator + postUnit;
    },

    // Get number for bullet.
    getBulletNumber : function (artLayer, doc, isNewBullet) {
        var specctrLayerSet = doc.layerSets.getByName("Specctr").layerSets;
         //Check if any number is linked with selected art layer or not, if not then assign a number.
        var number =  this.getXMPData(artLayer, "number"); //Number linked with art layer.
        try {
            specctrLayerSet.getByName("Properties");
        } catch(e) {
            try {
                specctrLayerSet.getByName("Add Note");
            } catch (e) {
                number = 0;
                isNewBullet = true;
            }
        }
        if(number == null) {
            //Number linked with document, this no. tells the total no. of property specs created on document.
            number = $.specctrPsCommon.getXMPData(doc, "noOfSpec"); 
            if(number == null)
                number = 0;
            isNewBullet = true;
        }

        if(isNewBullet) {
            number = parseInt(number) + 1;
            var xmpData = [{layerHandler : artLayer, 
                                    properties : [{name : "number", value : number}]
                                    }, 
                                    {layerHandler : doc,
                                        properties : [{name : "noOfSpec", value : number}]
                                    }];
            
            this.setXmpDataOfLayer(xmpData);
        }
        return parseInt(number);
    },
    
    //Create arm for property spec.
    createArm : function (specText, spec, artLayerBounds, newColor) {
        var arm = null;
        var startX = spec.bounds[2];
        var centerX = (artLayerBounds[0] + artLayerBounds[2]) / 2;
        var centerY = (artLayerBounds[1] + artLayerBounds[3]) / 2;

        //Get the end points for arm.
        if(specText.justification == Justification.LEFT) {
            if(startX < artLayerBounds[0]) {
                arm = this.createLine(startX, spec.bounds[1], artLayerBounds[0], centerY, newColor);
                this.setShape(startX, spec.bounds[1], artLayerBounds[0], centerY, "circle");
            } else if(startX > artLayerBounds[2]) {
                arm = this.createLine(startX, spec.bounds[1], artLayerBounds[2], centerY, newColor);
                this.setShape(startX, spec.bounds[1], artLayerBounds[2], centerY, "circle");
            }
        } else {
            startX = spec.bounds[0];

            if(startX > artLayerBounds[2]) {
                arm = this.createLine(startX, spec.bounds[1], artLayerBounds[2], centerY, newColor);
                this.setShape(startX, spec.bounds[1], artLayerBounds[2], centerY, "circle");
            } else if(startX < artLayerBounds[0]) {
                arm = this.createLine(startX, spec.bounds[1], artLayerBounds[0], centerY, newColor);
                this.setShape(startX, spec.bounds[1], artLayerBounds[0], centerY, "circle");
            }
        }

        if(arm == null) {
            arm = this.createLine(startX, spec.bounds[1], centerX, artLayerBounds[1], newColor);
            this.setShape(startX, spec.bounds[1], centerX, artLayerBounds[1], "circle");
        }
    
        return arm;
    },

    //Create the number of spec.
    createNumber : function(legendLayer, number, font) {
        //Color of the number over the circle.
        var color = new RGBColor();
        color.hexValue = "ffffff";

        //Create the circle with number over it.
        var txt =  legendLayer.artLayers.add();
        txt.kind = LayerKind.TEXT;
        var specText = txt.textItem;
        specText.kind = TextType.POINTTEXT;
        specText.color.rgb = color;
        specText.font = font;
        specText.size = model.legendFontSize;
        specText.contents = number;
        specText.fauxBold = true;
        return txt;
    },

    //Create circle and apply color to that circle.
    createCircle : function(top,left, bottom, right, newColor) {
        try {
            var idcontentLayer = stringIDToTypeID( "contentLayer" );
            var idsolidLayer = stringIDToTypeID( "solidColorLayer" );
            var idPxl = charIDToTypeID( "#Pxl" );
            var idNull = charIDToTypeID( "null" );

            //Creating circle for the numbering on object/spec.
            var desc = new ActionDescriptor();
            var ref = new ActionReference();
            ref.putClass(idcontentLayer);
            desc.putReference(idNull, ref);
            var layerDesc = new ActionDescriptor();
            layerDesc.putClass(charIDToTypeID("Type"), idsolidLayer);
            var propDesc = new ActionDescriptor();
            propDesc.putUnitDouble(charIDToTypeID( "Top " ), idPxl, top);
            propDesc.putUnitDouble(charIDToTypeID( "Left" ), idPxl, left);
            propDesc.putUnitDouble(charIDToTypeID( "Btom" ), idPxl, bottom);
            propDesc.putUnitDouble(charIDToTypeID( "Rght" ), idPxl, right);
            layerDesc.putObject(charIDToTypeID( "Shp " ), charIDToTypeID( "Elps" ), propDesc );
            desc.putObject(charIDToTypeID( "Usng" ), idcontentLayer, layerDesc );
            executeAction(charIDToTypeID( "Mk  " ), desc, DialogModes.NO );
         
            //Adding color to the selected art layer.
            ref = new ActionReference();
            ref.putEnumerated( idcontentLayer, charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ));
            layerDesc = new ActionDescriptor();
            layerDesc.putReference(idNull, ref );
            propDesc = new ActionDescriptor();
            propDesc.putDouble( charIDToTypeID( "Rd  " ), newColor.red);
            propDesc.putDouble( charIDToTypeID( "Grn " ), newColor.green );
            propDesc.putDouble( charIDToTypeID( "Bl  " ), newColor.blue );
            var setColorDesc = new ActionDescriptor();
            setColorDesc.putObject( charIDToTypeID( "Clr " ), charIDToTypeID( "RGBC" ), propDesc );
            layerDesc.putObject( charIDToTypeID( "T   " ), idsolidLayer, setColorDesc );
            executeAction( charIDToTypeID( "setd" ), layerDesc, DialogModes.NO );
        
            return app.activeDocument.activeLayer;
        } catch(e) {
            return null;
        }
    },
    
    //Create bullet for specs.
    createBullet : function (legendLayer, number, font, artLayerBounds, newColor) {
        var txt = this.createNumber(legendLayer, number, font);
        txt.name = "___Number";
        var dia = txt.bounds[3] - txt.bounds[1] + 12;
        var circle = this.createCircle(artLayerBounds[1], artLayerBounds[0] - dia, 
                                                        artLayerBounds[1] + dia, artLayerBounds[0], newColor);
        circle.move(txt, ElementPlacement.PLACEAFTER);
        var pos = [(circle.bounds[0] + circle.bounds[2]) / 2.0 - (txt.bounds[2] - txt.bounds[0]) / 2.0,
                            (circle.bounds[1] + circle.bounds[3]) / 2.0 - (txt.bounds[3] - txt.bounds[1]) / 2.0];
        txt.translate(pos[0] - txt.bounds[0], pos[1] - txt.bounds[1]);
        $.specctrPsCommon.selectLayers(circle.name, txt.name);
        var bullet = $.specctrPsCommon.createSmartObject();
        bullet.name = "__sFirstBullet";
        return bullet;
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

    setShape : function(startX, startY, endX, endY, shape) {
        var idPxl = charIDToTypeID("#Pxl");
        
        if(shape == "circle") {
            //Calculate radius of circle.
            var circleR = model.armWeight + 3;

            var circleDesc = new ActionDescriptor();
            actRef = new ActionReference();
            actRef.putEnumerated( charIDToTypeID( "Path" ),  charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            circleDesc.putReference(charIDToTypeID("null"), actRef);
            propertyDesc = new ActionDescriptor();
            propertyDesc.putInteger(stringIDToTypeID("unitValueQuadVersion"), 1 );
            propertyDesc.putUnitDouble( charIDToTypeID( "Top " ), idPxl, endY - circleR);
            propertyDesc.putUnitDouble( charIDToTypeID( "Left" ), idPxl, endX - circleR);
            propertyDesc.putUnitDouble( charIDToTypeID( "Btom" ), idPxl, endY + circleR);
            propertyDesc.putUnitDouble( charIDToTypeID( "Rght" ), idPxl, endX+ circleR);
            circleDesc.putObject( charIDToTypeID( "T   " ), charIDToTypeID( "Elps" ), propertyDesc);
            executeAction( charIDToTypeID( "AddT") , circleDesc, DialogModes.NO);
        } else {

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
        }
    },

    //Adjust the positions of property specs item on the active document.
    adjustPositionOfSpecItems : function (spec, specText, dupBullet, specYPos, 
            spacing, condition1, condition2, dia, isNewSpecCreated, canvasBounds) {
                
        if(condition1 >= condition2) {
            if(isNewSpecCreated) {
                specText.justification = Justification.LEFT;
                spec.translate(-(spec.bounds[0]-spacing-dia), specYPos-spec.bounds[1]);
            }
            dupBullet.translate(spec.bounds[0]-dupBullet.bounds[0]-dia-1, spec.bounds[1]-dupBullet.bounds[1]-1);
        } else {
            if(isNewSpecCreated) {
                specText.justification = Justification.RIGHT;
                spec.translate(canvasBounds[2]-spacing-spec.bounds[2]-dia+canvasBounds[0], specYPos-spec.bounds[1]);
            }
            dupBullet.translate(spec.bounds[2]-dupBullet.bounds[0]+1, spec.bounds[1]-dupBullet.bounds[1]-1);
        }
    
    },

    //Delete layer using its name .
    deleteArtLayerByName : function (layer, name) {
        try {
            layer.artLayers.getByName(name).remove();
        } catch (e) {}
    },
    
    //Artboard is present in document or not.
    isArtBoardPresent : function() {
        var isThisArtBoard = false;
        
        try {
            var doc = app.activeDocument;
            var activeLayer = doc.activeLayer;
            
            var layerSetLength = doc.layerSets.length;
            for (var i = 0; i < layerSetLength; i++) {
                doc.activeLayer = doc.layerSets[i];
                var ref = new ActionReference();
                ref.putEnumerated( charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ) );
                isThisArtBoard = executeActionGet(ref).getBoolean(stringIDToTypeID("artboardEnabled"));
                if(isThisArtBoard) 
                    break;
            }
        } catch (e) {}
        
        if(activeLayer)
            doc.activeLayer = activeLayer;
        
        //Get the parent of layer and check if it is an artboard.
        return isThisArtBoard;
    },
    
    //Get art board bounds, if any.
    getArtBoardBounds : function(artLayer) {
        try {
            var parent = artLayer.parent;
            if(parent.typename == "Document")
                return null;
                
            while (parent.parent.typename != "Document") {
                parent = parent.parent;
            }
            
            app.activeDocument.activeLayer = parent;    //parent is artboard now.
            var ref = new ActionReference();
            ref.putEnumerated( charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ) );
            
            // get artboard dimensions
            var artBoardRect = executeActionGet(ref).getObjectValue(stringIDToTypeID("artboard")).getObjectValue(stringIDToTypeID("artboardRect"));
            var bounds = [];
            bounds[0] = new UnitValue (artBoardRect.getDouble(stringIDToTypeID("left")), "px");
            bounds[1] = new UnitValue (artBoardRect.getDouble(stringIDToTypeID("top")), "px");
            bounds[2] = new UnitValue (artBoardRect.getDouble(stringIDToTypeID("right")), "px");
            bounds[3] = new UnitValue (artBoardRect.getDouble(stringIDToTypeID("bottom")), "px");
             
             return bounds;
        } catch(e) {}
        
        return null;
    },

    getArtBoard : function (artLayer) {
         try {
            var parent = artLayer.parent;
            if(parent.typename == "Document")
                return app.activeDocument;
                
            while (parent.parent.typename != "Document") {
                parent = parent.parent;
            }
            return parent;
        }catch (e) { return app.activeDocument;}
    },

};

