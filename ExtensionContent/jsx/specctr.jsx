/*//////////////////////////////////////////////////////////////////////////////
 * File Name: specctr.jsx
 * Description: This file includes all the functions which create specs i.e. property spec,
    width/height spec, spacing spec, coordinate spec and expand canvas feature.
//////////////////////////////////////////////////////////////////////////////*/

#include "json2.js"

var model;
var heightChoice = { "Left" : 1 , "Right" : 2, "Center" : 3 };
var widthChoice = { "Top" : 1 , "Bottom" : 2, "Center" : 3 };
var cssText = "";
var cssBodyText = "";
var lyrBound;

ext_setModel = setModel;
ext_expandCanvas = createCanvasBorder;

//Get the updated value of UI's component from html file.
function setModel(currModel)
{
    try
    {
        model = JSON.parse(currModel);
    }
    catch(e)
    {
        alert(e);
    }
}

//Convert background layer into regular layer.
function backgroundLayerIntoNormalLayer()
{
    try
    {
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
    }
    catch(e)
    {}
}

//Select all layers in the layer panel.
function selectAllLayer()
{
    try
    {
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        desc.putReference(charIDToTypeID("null"), ref);
        executeAction(stringIDToTypeID("selectAllLayers"), desc, DialogModes.NO);
    }
    catch(e)
    {}
}

//Group the selected layers.
function groupLayers()
{
    try
    {
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putClass(stringIDToTypeID("layerSection"));
        desc.putReference(charIDToTypeID("null"), ref);
        var refLyr = new ActionReference();
        refLyr.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        desc.putReference(charIDToTypeID("From"), refLyr);
        executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
        return app.activeDocument.activeLayer;
    }
    catch(e)
    {
        return null;
    }
}

//Mask the group layer.
function layerMasking()
{
    try
    {
        var desc = new ActionDescriptor();
        var idChnl = charIDToTypeID("Chnl");
        desc.putClass(charIDToTypeID("Nw  "), idChnl);
        var ref = new ActionReference();
        ref.putEnumerated(idChnl, idChnl, charIDToTypeID("Msk "));
        desc.putReference(charIDToTypeID("At  "), ref);
        desc.putEnumerated(charIDToTypeID("Usng"), charIDToTypeID("UsrM"), charIDToTypeID("RvlS"));
        executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO);
    }
    catch(e)
    {}
}

//Add layer and convert it into background layer.
function lyrIntoBckgrndLyr()
{
    try
    {
        var lyr = app.activeDocument.artLayers.add();
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putClass(charIDToTypeID("BckL"));
        desc.putReference(charIDToTypeID("null"), ref);
        var refLayer = new ActionReference();
        refLayer.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        desc.putReference(charIDToTypeID("Usng"), refLayer);
        executeAction(charIDToTypeID("Mk  "), desc, DialogModes.NO );
    }
    catch(e)
    {}
}

//Suspend the history of creating canvas border.
function createCanvasBorder()
{
    try
    {
        app.activeDocument.suspendHistory('Expand Canvas', 'expandCanvas()');
    }
    catch(e)
    {}
}

//Get the reference of the border, if it is already present.
function canvasBorder()
{
    var border = null;
    try
    {
        border = app.activeDocument.artLayers.getByName("Specctr Canvas Border");                   //pass the reference of the border art layer.
    }
    catch(e)
    {}

	return border;
}

//Draw a dash line border of original size of the canvas.
function drawDashBorder()
{
    var doc = app.activeDocument;
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
}

//Expand the canvas.
function expandCanvas()
{
    if(!app.documents.length)           //Checking document is open or not.
        return;
    
    //Save and change the preferences of the document.
    var doc = app.activeDocument;
    var startRulerUnits = app.preferences.rulerUnits;
    var startTypeUnits = app.preferences.typeUnits;
    var originalDPI = doc.resolution;
    setPreferences(Units.PIXELS, TypeUnits.PIXELS, 72);

    try
    {
        var height = doc.height;
        var width = doc.width;
        var activeLayer = doc.activeLayer;
        var border = canvasBorder();       //Checking  whether border is created or not.
        if(border == null)
        {
            backgroundLayerIntoNormalLayer();              //Convert background layer into normal layer.
            selectAllLayer();                                          //Select all layers from layer panel.
            var group = groupLayers();
            var groupName = "Original Canvas ["+width+" x "+height+"]"
            group.name = groupName;
            doc.selection.selectAll();                                    //Select the whole canvas.
            layerMasking();                                          //Mask the group layer.
            lyrIntoBckgrndLyr();                                     //Add layer and convert it into background layer.
            drawDashBorder();                                       //Create the dashed border.
            doc = app.activeDocument;
            
            try
            {
                var specctrLayer = doc.layerSets.getByName(groupName).layerSets.getByName("Specctr");
                specctrLayer.move(doc.layers[0] , ElementPlacement.PLACEAFTER);     //Move the Specctr folder.
            }
            catch(e)
            {}
        }
        
        doc.resizeCanvas(width+2*model.canvasExpandSize, height+2*model.canvasExpandSize, AnchorPosition.MIDDLECENTER);     // Expanding the canvas.
    }
    catch(e)
    {}
    
    if(activeLayer)
        doc.activeLayer = activeLayer;
    
    setPreferences(startRulerUnits, startTypeUnits, originalDPI);      //Setting the original preferences of the document.
}

//Suspend the history of creating dimension spec of layer.
function createDimensionSpecsForItem()
{
    try
    {
        var artLayer = getActiveLayer();
        if(artLayer == null || !startUpCheckBeforeSpeccing(artLayer))      //Check if layer is valid for speccing i.e. not an artlayer set or specced object.
            return;
        
        var bounds = returnBounds(artLayer);
        app.activeDocument.suspendHistory('Get Dimension Info', 'calculateDmnsns(artLayer, bounds)');      //Pass bounds and layer for creating dimension spec.
    }
    catch(e)
    {}
}

//Calculate the width and height value of the selected art layer. These values may be fixed (in px/inches/cm) or relative to document (in %) which depends on the users choice.
function calculateDmnsns(artLayer, bounds)
{
    //Save the current preferences
    var doc = app.activeDocument;
    var startRulerUnits = app.preferences.rulerUnits;
    var startTypeUnits = app.preferences.typeUnits;
    var originalDPI = doc.resolution;
    setPreferences(Units.PIXELS, TypeUnits.PIXELS, originalDPI);

    try
    {
        var lyrHeight = bounds[3] - bounds[1];
        var lyrWidth = bounds[2] - bounds[0];
        var widthValue = "", heightValue = "";

        if(!model.specInPrcntg)
        {
            if(model.useScaleBy)
            {
                var scaling = Number(model.scaleValue.substring(1));
            
                if(!scaling)
                    scaling = 1;
            
                if(model.scaleValue.charAt(0) == '/')
                {
                    lyrHeight = lyrHeight/scaling;
                    lyrWidth = lyrWidth/scaling;
                }
                else
                {
                    lyrHeight = lyrHeight*scaling;
                    lyrWidth = lyrWidth*scaling;
                }
            }
        
            //Absolute distance.
            widthValue = pointsToUnitsString(lyrWidth, startRulerUnits);
            heightValue = pointsToUnitsString(lyrHeight, startRulerUnits);
        }
        else 
        {
            //Relative distance with respect to original canvas.
            var relativeHeight='', relativeWidth='';
            var orgnlCanvas = originalCanvasSize();       //Get the original canvas size.
            
            if(model.rltvHeight != 0)
                relativeHeight = model.rltvHeight;
            else
                relativeHeight = orgnlCanvas[3];
                
            if(model.rltvWidth != 0)
                relativeWidth = model.rltvWidth;
            else
                relativeWidth = orgnlCanvas[2];

            widthValue = Math.round(lyrWidth/relativeWidth*100) + " %";
            heightValue = Math.round(lyrHeight/relativeHeight*100) + " %";
        }

        createDimensionSpecs(artLayer, bounds, widthValue, heightValue);
    }
    catch(e)
    {}
    
    doc.activeLayer = artLayer;
    setPreferences(startRulerUnits, startTypeUnits, originalDPI);      //Setting the original preferences of the document.
}

//Create the dimension spec for a selected layer.
function createDimensionSpecs(artLayer, bounds, widthValue, heightValue)
{
    if(ExternalObject.AdobeXMPScript == null)
		ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');		//Load the XMP Script library to access XMPMetadata info of layers.
    
    var dimensionSpec = "";
    var idDimensionSpec = getXMPData(artLayer, "idDimensionSpec");
    if(idDimensionSpec)
    {
        dimensionSpec = getLayerByID(idDimensionSpec);
        if(dimensionSpec)
        {
            var parent = dimensionSpec.parent;
            dimensionSpec.remove();
            if(parent.typename == "LayerSet")
                parent.remove();
            
            //Delete the xmp data of the layer.
            var layerXMP = new XMPMeta(artLayer.xmpMetadata.rawData);
            layerXMP.deleteProperty(XMPConst.NS_PHOTOSHOP, "idDimensionSpec");
            artLayer.xmpMetadata.rawData = layerXMP.serialize();
        }
    }
    
    //Create the specs.
    var font = getFont();
    var doc = app.activeDocument;
    var originalDPI = doc.resolution;
    doc.resizeImage(null, null, 72, ResampleMethod.NONE);
    
    var heightText = "", widthText = "", widthLine = "", heightLine = "", specText = "";
    var height = bounds[3]-bounds[1];
    var width = bounds[2]-bounds[0];
    var spacing = 10+model.armWeight;
    
    var legendLayer = legendDimensionsLayer().layerSets.add();
    legendLayer.name = "Specctr Dimension Mark"; 
    var newColor = legendColorSpacing();
    
    if(model.widthPos > 0)
    {
        widthText = legendLayer.artLayers.add();
        widthText.kind = LayerKind.TEXT;
        specText = widthText.textItem;
        specText.kind = TextType.POINTTEXT;
        specText.justification = Justification.CENTER;
        specText.color.rgb = newColor;
        specText.font = font;
        specText.size = model.legendFontSize;
        specText.contents = widthValue;
    }

    switch(model.widthPos)
    {
        case widthChoice.Top:
            specText.position = new Array(bounds[0]+width/2.0, bounds[1]-spacing-model.armWeight/2.0);
            widthLine = createLine(bounds[0], bounds[1]-0.7*spacing, bounds[2], bounds[1]-0.7*spacing, newColor);     //Main width line.
            setShape(bounds[0]+model.armWeight/2, 
                                    bounds[1]-0.4*spacing, 
                                        bounds[0]+model.armWeight/2, 
                                            bounds[1]-spacing);                                     //Width line's left.
            setShape(bounds[2]-model.armWeight/2, 
                                    bounds[1]-0.4*spacing, 
                                        bounds[2]-model.armWeight/2, 
                                            bounds[1]-spacing);                                     // Width line's right.
            break;
            
        case widthChoice.Bottom:
            specText.position = new Array(bounds[0]+width/2.0, bounds[3]+spacing+model.armWeight/2.0+model.legendFontSize*0.8);
            widthLine = createLine(bounds[0], bounds[3]+0.7*spacing, bounds[2], bounds[3]+0.7*spacing, newColor);     //Main width line.
            setShape(bounds[0]+model.armWeight/2, 
                                    bounds[3]+0.4*spacing, 
                                        bounds[0]+model.armWeight/2, 
                                            bounds[3]+spacing);                                     //Width line's left.
            setShape(bounds[2]-model.armWeight/2, 
                                    bounds[3]+0.4*spacing, 
                                        bounds[2]-model.armWeight/2, 
                                            bounds[3]+spacing);                                     // Width line's right.
            break;
            
        case widthChoice.Center:
            specText.position = new Array(bounds[0]+width/2.0, bounds[1]+height/2.0-spacing+model.armWeight*2.0);
            widthLine = createLine(bounds[0], bounds[1]+height/2.0, bounds[2], bounds[1]+height/2.0, newColor);     //Main width line.
            setShape(bounds[0]+model.armWeight/2, 
                                    bounds[1]+height/2.0-0.4*spacing, 
                                        bounds[0]+model.armWeight/2, 
                                            bounds[1]+height/2.0+0.4*spacing);              //Width line's left.
            setShape(bounds[2]-model.armWeight/2, 
                                    bounds[1]+height/2.0-0.4*spacing, 
                                        bounds[2]-model.armWeight/2, 
                                            bounds[1]+height/2.0+0.4*spacing);              // Width line's right.   
            break;
            
            default:
    }

    if(model.heightPos > 0)
    {
        heightText = legendLayer.artLayers.add();
        heightText.kind = LayerKind.TEXT;
        specText = heightText.textItem;
        specText.kind = TextType.POINTTEXT;
        specText.justification = Justification.RIGHT;
        specText.color.rgb = newColor;
        specText.font = font;
        specText.size = model.legendFontSize;
        specText.contents = heightValue;
    }

    switch(model.heightPos)
    {
        case heightChoice.Left:
            specText.position = new Array(bounds[0]-spacing-model.armWeight/2, bounds[1]+height/2.0);
            heightLine = createLine(bounds[0]-0.7*spacing, bounds[3], bounds[0]-0.7*spacing, bounds[1], newColor);      //Main height line
            setShape(bounds[0]-0.4*spacing, 
                                    bounds[1]+model.armWeight/2, 
                                        bounds[0]-spacing, 
                                            bounds[1]+model.armWeight/2);                       //Height line's top.
            setShape(bounds[0]-0.4*spacing, 
                                    bounds[3]-model.armWeight/2, 
                                        bounds[0]-spacing, 
                                            bounds[3]-model.armWeight/2);                       //Height line's bottom.
            break;

        case heightChoice.Right:
            specText.justification = Justification.LEFT;
            specText.position = new Array(bounds[2]+spacing+model.armWeight/2.0, bounds[1]+height/2.0);
            heightLine = createLine(bounds[2]+0.7*spacing, bounds[3], bounds[2]+0.7*spacing, bounds[1], newColor);      //Main height line
            setShape(bounds[2]+0.4*spacing, 
                                    bounds[1]+model.armWeight/2, 
                                        bounds[2]+spacing, 
                                            bounds[1]+model.armWeight/2);                      //Height line's top.
            setShape(bounds[2]+0.4*spacing, 
                                    bounds[3]-model.armWeight/2, 
                                        bounds[2]+spacing, 
                                            bounds[3]-model.armWeight/2);                       //Height line's bottom.
            break;
            
        case heightChoice.Center:
            specText.justification = Justification.LEFT;
            specText.position = new Array(bounds[2]-width/2.0+0.4*spacing+model.armWeight/2.0, bounds[1]+height/2.0);
            heightLine = createLine(bounds[2]-width/2.0, bounds[3], bounds[2]-width/2.0, bounds[1], newColor);      //Main height line
            setShape(bounds[2]-width/2.0+0.4*spacing, 
                                    bounds[1]+model.armWeight/2, 
                                        bounds[2]-width/2.0-0.4*spacing, 
                                            bounds[1]+model.armWeight/2);                       //Height line's top.
            setShape(bounds[2]-width/2.0+0.4*spacing, 
                                    bounds[3]-model.armWeight/2, 
                                        bounds[2]-width/2.0-0.4*spacing, 
                                            bounds[3]-model.armWeight/2);                        //Height line's bottom.
            break;
            
            default:
    }

    //Converting selected layers into single smart object.
    selectLayers(widthText.name, heightText.name, widthLine.name, heightLine.name);
    var spec = createSmartObject();
    spec.name = "DimensionSpec";
    idDimensionSpec = getIDOfLayer();
    doc.activeLayer = artLayer;
    
    if(artLayer.kind != LayerKind.TEXT)
    {
        var idLayer = getIDOfLayer();
        setXmpDataForSpec(spec, idLayer, "idLayer");
        var styleText = "\twidth: " + widthValue + ";\r\theight: " + heightValue + ";";
        setXmpDataForSpec(spec, styleText, "css");
    }

    setXmpDataForSpec(artLayer, idDimensionSpec, "idDimensionSpec");
    setXmpDataForSpec(spec, "true", "SpeccedObject");
    doc.resizeImage(null, null, originalDPI, ResampleMethod.NONE);
    ExternalObject.AdobeXMPScript.unload();
}

//Suspend the history of creating coordinates spec of layers.
function createCoordinateSpecs()
{
    try
    {
        var sourceItem = getActiveLayer();
        if(sourceItem == null || !startUpCheckBeforeSpeccing(sourceItem))      //Check if layer is valid for speccing i.e. not an artlayer set or specced object.
            return;
        
        var bounds = returnBounds(sourceItem);
        app.activeDocument.suspendHistory('Coordinate Info', 'createCoordinates(sourceItem, bounds)');
    }
    catch(e)
    {}
}

//Create coordinate specs for the layer.
function createCoordinates(sourceItem, bounds)
{
    try
    {
        if(ExternalObject.AdobeXMPScript == null)
            ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');		//Load the XMP Script library to access XMPMetadata info of layers.
    
        var coordinateSpec = "";
        var idCoordinateSpec = getXMPData(sourceItem, "idCoordinateSpec");
        if(idCoordinateSpec)
        {
            coordinateSpec = getLayerByID(idCoordinateSpec);
            if(coordinateSpec)
            {
                var parent = coordinateSpec.parent;
                coordinateSpec.remove();
                if(parent.typename == "LayerSet")
                    parent.remove();
            
                //Delete the xmp data of the layer.
                var layerXMP = new XMPMeta(sourceItem.xmpMetadata.rawData);
                layerXMP.deleteProperty(XMPConst.NS_PHOTOSHOP, "idCoordinateSpec");
                sourceItem.xmpMetadata.rawData = layerXMP.serialize();
            }
        }
    
        //Save the current preferences
        var doc = app.activeDocument;
        var startRulerUnits = app.preferences.rulerUnits;
        var startTypeUnits = app.preferences.typeUnits;
        var originalDPI = doc.resolution;
        setPreferences(Units.PIXELS, TypeUnits.PIXELS, 72);
    
        var font = getFont();
        var newColor = legendColorSpacing();
        var left = "", top = "";
        
        //Responsive option selected or not.
        if(!model.specInPrcntg)
        {
            //Absolute distance.
            top = pointsToUnitsString(bounds[1], startRulerUnits).split(" ", 1);
            left = pointsToUnitsString(bounds[0], startRulerUnits).split(" ", 1);
        }
        else 
        {
            //Relative distance with respect to original canvas.
            var relativeTop='', relativeLeft='';
            var orgnlCanvas = originalCanvasSize();       //Get the original canvas size.
            
            if(model.rltvHeight != 0)
                relativeTop = model.rltvHeight;
            else
                relativeTop = orgnlCanvas[3];
                
            if(model.rltvWidth != 0)
                relativeLeft = model.rltvWidth;
            else
                relativeLeft = orgnlCanvas[2];

            left = Math.round(bounds[0]/relativeLeft*100) + "%";
            top = Math.round(bounds[1]/relativeTop*100) + "%";
        }
        
        var styleText = "\tleft: " + left + ";\r\ttop: " + top + ";";
        var doc = app.activeDocument;
        var spacing = 3+model.armWeight;
        var legendLayer = legendCoordinateLayer().layerSets.add();            //To create the layer group for coordinate layer.
        legendLayer.name = "Specctr Coordinates Mark";
    
        var lines = "", coordinateText = "";
    
        //Create the spec text for top.
        coordinateText = legendLayer.artLayers.add();
        coordinateText.kind = LayerKind.TEXT;
        var specText = coordinateText.textItem;
        specText.kind = TextType.POINTTEXT;
        specText.justification = Justification.RIGHT;
        specText.color.rgb = newColor;
        specText.font = font;
        specText.size = model.legendFontSize;
        specText.contents = "x: "+left+" y: "+top;
        
        var line = "";
        if(sourceItem.kind == LayerKind.TEXT)
        {
            specText.position = new Array(sourceItem.textItem.position[0]-spacing-model.armWeight/2, sourceItem.textItem.position[1]-spacing+model.armWeight);
            spacing = spacing+5;
            line = createLine(sourceItem.textItem.position[0]-spacing-model.armWeight, 
                                                    sourceItem.textItem.position[1]+model.armWeight, 
                                                        sourceItem.textItem.position[0]+spacing,
                                                            sourceItem.textItem.position[1]+model.armWeight,
                                                                newColor);     //Horizontal line.
                                                            
            setShape(sourceItem.textItem.position[0]-model.armWeight, 
                                    sourceItem.textItem.position[1]-spacing, 
                                        sourceItem.textItem.position[0]-model.armWeight, 
                                            sourceItem.textItem.position[1]+spacing+model.armWeight);        //Vertical line
        }
        else
        {
            specText.position = new Array(bounds[0]-spacing, bounds[1]-spacing);
            spacing = spacing+5;
            line = createLine(bounds[0]-spacing, 
                                                    bounds[1]-model.armWeight/2, 
                                                        bounds[0]+spacing, 
                                                            bounds[1]-model.armWeight/2, 
                                                                newColor);     //Horizontal line.
                                                            
            setShape(bounds[0]-model.armWeight/2, 
                                    bounds[1]-spacing, 
                                        bounds[0]-model.armWeight/2, 
                                            bounds[1]+spacing);        //Vertical line
        }
    
        selectLayers(line.name, coordinateText.name);
        var spec = createSmartObject();
        spec.name = "CoordinatesSpec";
        idCoordinateSpec = getIDOfLayer();
        
        setXmpDataForSpec(sourceItem, idCoordinateSpec, "idCoordinateSpec");
        setXmpDataForSpec(spec, "true", "SpeccedObject");
        setXmpDataForSpec(spec, styleText, "css");
        doc.activeLayer = sourceItem;
        var idLayer = getIDOfLayer();
        setXmpDataForSpec(spec, idLayer, "idLayer");
    }
    catch(e)
    {
        doc.activeLayer = sourceItem;
    }
    
    setPreferences(startRulerUnits, startTypeUnits, originalDPI);      //Setting the original preferences of the document.
}

//Get the indexes of selected layers of the active document.
function getSelectedLayers()
{
    var selectedLayers; 
    
    try
    {
        var doc = app.activeDocument;
        selectedLayers   = new Array();
        
        var layerRef = new ActionReference(); 
        layerRef.putEnumerated(app.charIDToTypeID("Dcmn"), app.charIDToTypeID("Ordn"), app.charIDToTypeID("Trgt"));
        var layerDesc = app.executeActionGet(layerRef); 
        var listOfSlctedLyr;
    
        if(layerDesc.hasKey(app.stringIDToTypeID('targetLayers')))
        {
            listOfSlctedLyr = layerDesc.getList(app.stringIDToTypeID('targetLayers')); 
            var noOfSlctedLayer = listOfSlctedLyr.count;
            for(var i=0; i < noOfSlctedLayer; i++)
            { 
                if(doc.backgroundLayer)
                    selectedLayers.push(listOfSlctedLyr.getReference(i).getIndex()); 
                else 
                    selectedLayers.push(listOfSlctedLyr.getReference(i).getIndex()+1); 
            } 
        }
        else
        { 
            layerRef = new ActionReference(); 
            layerRef.putProperty(app.charIDToTypeID("Prpr"), app.charIDToTypeID("ItmI")); 
            layerRef.putEnumerated(app.charIDToTypeID("Lyr "), app.charIDToTypeID("Ordn"), app.charIDToTypeID("Trgt")); 
            if(doc.backgroundLayer) 
                selectedLayers.push(app.executeActionGet(layerRef).getInteger(app.charIDToTypeID("ItmI"))-1); 
            else 
                selectedLayers.push(app.executeActionGet(layerRef).getInteger(app.charIDToTypeID("ItmI"))); 
        
            var layerVisibility = doc.activeLayer.visible;
            if(layerVisibility == true) 
                doc.activeLayer.visible = false;
        
            layerDesc = new ActionDescriptor();
            listOfSlctedLyr = new ActionList();
            layerRef = new ActionReference();
            layerRef.putEnumerated(app.charIDToTypeID('Lyr '), app.charIDToTypeID('Ordn'), app.charIDToTypeID('Trgt'));
            listOfSlctedLyr.putReference(layerRef);
            layerDesc.putList(app.charIDToTypeID('null'), listOfSlctedLyr);
            app.executeAction(app.charIDToTypeID('Shw '), layerDesc, DialogModes.NO);
        
            if(doc.activeLayer.visible == false) 
                selectedLayers.shift();
        
            doc.activeLayer.visible = layerVisibility;
        } 
    }
    catch(e)
    {
        selectedLayers =  null;
    }
    
    return selectedLayers;
}

//Get the single active layer and if more than one layer is selected then popup a message and return null.
function getActiveLayer()
{
    var selectedArtItems = getSelectedLayers();
    if(selectedArtItems.length != 1)
    {
        alert("Please select only one art item!");
        return null;
    }
    
    return app.activeDocument.activeLayer;
}

//Make layer active by using ID.
function getLayerByID(id)
{
	try
	{
		var desc = new ActionDescriptor();
		var ref = new ActionReference();
		ref.putIdentifier( charIDToTypeID( "Lyr " ), id );
		desc.putReference( charIDToTypeID( "null" ), ref );
		desc.putBoolean( charIDToTypeID( "MkVs" ), false );
		executeAction( charIDToTypeID( "slct" ), desc, DialogModes.NO );
		return app.activeDocument.activeLayer;
	}
	catch(errMsg)
	{
		return null;
	}
}

//Get ID of selected art layer.
function getIDOfLayer()
{
	var ref = new ActionReference(); 
	ref.putProperty( charIDToTypeID("Prpr") , charIDToTypeID( "LyrI" )); 
	ref.putEnumerated( charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
	return(executeActionGet(ref).getInteger(charIDToTypeID( "LyrI" )));
}

//Check if layer is a valid layer for speccing or not.
function startUpCheckBeforeSpeccing(artLayer)
{
    try
    {
        var isLayerValidForSpeccing = true;
        if(artLayer.typename == "LayerSet" || artLayer.isBackgroundLayer)
        {
            alert("Please select one shape or text layer");
            return false;
        }
        
        if(ExternalObject.AdobeXMPScript == null)
            ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');		//Load the XMP Script library to access XMPMetadata info of layers.
    
        var isLayerSpec = getXMPData(artLayer, "SpeccedObject");
        ExternalObject.AdobeXMPScript.unload();
        
        if(isLayerSpec == "true")
            isLayerValidForSpeccing = false;
    }
    catch(e)
    {
        isLayerValidForSpeccing = false;
    }
    return isLayerValidForSpeccing;
}

//Set the preferences of the document.
function setPreferences(rulerUnit, typeUnit, resolution)
{
    try
    {
        var preferences = app.preferences;
        preferences.rulerUnits = rulerUnit;
        preferences.typeUnits = typeUnit;
        app.activeDocument.resizeImage(null, null, resolution, ResampleMethod.NONE);
    }
    catch(e)
    {
        alert(e);
    }
}

//Set XMPMetadata for specced Object.
function setXmpDataForSpec(activeLayer, value, specString)
{
    var layerXMP;
	try
	{
		layerXMP = new XMPMeta(activeLayer.xmpMetadata.rawData);
	}
	catch(e)
	{
		layerXMP = new XMPMeta();			// layer did not have metadata so create new
	}

	try
	{
        layerXMP.appendArrayItem(XMPConst.NS_PHOTOSHOP, specString, null, XMPConst.PROP_IS_ARRAY, XMPConst.ARRAY_IS_ORDERED);
        layerXMP.insertArrayItem(XMPConst.NS_PHOTOSHOP, specString, 1, value.toString());

        activeLayer.xmpMetadata.rawData = layerXMP.serialize();
    }
	catch(e) 
	{}
}

//Check that layer has XMPMetadata or not, if yes return the data.
function getXMPData(activeLayer, idStr)
{
	try
	{
        var layerXMP = new XMPMeta(activeLayer.xmpMetadata.rawData);
        var idLayer = layerXMP.getArrayItem(XMPConst.NS_PHOTOSHOP, idStr, 1).toString();
        
        if(idLayer != "")
            return idLayer;
	}
	catch(e)
	{}

	return null;
}

//Return the index at which spec id is present from xmp array of layer.
function getIndexFromXmpArray(artLayer, idSpec, specString)
{     
    var layerXMP = new XMPMeta(artLayer.xmpMetadata.rawData);
    var noOfItemsInXmpArray = layerXMP.countArrayItems(XMPConst.NS_PHOTOSHOP, specString);
    var id = "", pos = 0;
    for(var i = 0; i < noOfItemsInXmpArray; i++)
    {
            id = layerXMP.getArrayItem(XMPConst.NS_PHOTOSHOP, specString, i + 1).toString();
            if(id == idSpec)
            {
                pos = i + 1;
                break;
            }
    }
    artLayer.xmpMetadata.rawData = layerXMP.serialize();
    return pos;
}

//To get the bounds of layer.
function getBounds(artLayer)
{
    // Save the current preferences
	var startRulerUnits = app.preferences.rulerUnits;
	var startTypeUnits = app.preferences.typeUnits;
	app.preferences.rulerUnits = Units.PIXELS;
	app.preferences.typeUnits = TypeUnits.PIXELS;
    
    var desc, ref, list;
    try
    {
        app.activeDocument.activeLayer = artLayer;
        ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ));
        if(executeActionGet(ref).hasKey(stringIDToTypeID('layerEffects')) && executeActionGet(ref).getBoolean(stringIDToTypeID('layerFXVisible')))
        {
            var layerEffectDesc = executeActionGet(ref).getObjectValue(stringIDToTypeID('layerEffects'));
            if(layerEffectDesc.hasKey(stringIDToTypeID('dropShadow')))
            {
                desc = new ActionDescriptor();
                list = new ActionList();
                ref = new ActionReference();
                ref.putClass( charIDToTypeID( "DrSh" ) );
                ref.putEnumerated(charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ));
                list.putReference( ref );
                desc.putList( charIDToTypeID( "null" ), list );
                executeAction( charIDToTypeID( "Hd  " ), desc, DialogModes.NO );
            }
            if(layerEffectDesc.hasKey(stringIDToTypeID('outerGlow')))
            {
                desc = new ActionDescriptor();
                list = new ActionList();
                ref = new ActionReference();
                ref.putClass( charIDToTypeID( "OrGl" ) );
                ref.putEnumerated(charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ));
                list.putReference( ref );
                desc.putList( charIDToTypeID( "null" ), list );
                executeAction( charIDToTypeID( "Hd  " ), desc, DialogModes.NO );
            }
        }
        
        artLayer = createSmartObject();
    }
    catch(e)
    {}
    
    lyrBound = artLayer.bounds;
    
    // Reset the application preferences
	app.preferences.rulerUnits = startRulerUnits;
	app.preferences.typeUnits = startTypeUnits;
}


// Return bounds of the layer.
function returnBounds(artLayer)
{
    try
    {
        app.activeDocument.suspendHistory('Get Bounds','getBounds(artLayer)');     // get bounds of layer.
        executeAction( charIDToTypeID('undo'), undefined, DialogModes.NO);
        return lyrBound;
    }
    catch(e)
    {
        return artLayer.bounds;
    }
}

//Make the layer active by using index value.
function selectLayerByIndex(index)
{
    var layerRef = new ActionReference();
    layerRef.putIndex(app.charIDToTypeID("Lyr "), index);
    var layerDesc = new ActionDescriptor();
    layerDesc.putReference(app.charIDToTypeID("null"), layerRef);
     
    layerDesc.putBoolean(app.charIDToTypeID("MkVs"), false); 
    
    try
    {
        app.executeAction(app.charIDToTypeID("slct"), layerDesc, DialogModes.NO);
        return app.activeDocument.activeLayer;
    }
    catch(e)
    {
        return null;
    }
}

//Convert color into css style.
function convertColorIntoCss(color, alpha)
{
    var index = color.indexOf("(");
    color = color.substr(0, index)+"a"+color.substr(index)
    color = color.substr(0, color.length-1)+", "+alpha+")";
    return color;
}

//Create line and apply color to that line.
function createLine(startX, startY, endX, endY, newColor)
{
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
}

//Create the shape art layer in the selected layer.
function setShape(startX, startY, endX, endY, shape)
{
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
}

//Select the layers on name basis.
function selectLayers(firstLyr, scndLyr, thrdLyr, frthLyr)
{
    try
    {
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
    }
    catch(e)
    {}
}

//Create the smart object layer of the selected layers.
function createSmartObject()
{
    try
    {
        executeAction(stringIDToTypeID("newPlacedLayer"), undefined, DialogModes.NO);
        return app.activeDocument.activeLayer;
    }
    catch(e)
    {
        return null;
    }
}

//Get the post script name of the font.
function getFont()
{
	var postScriptName = "Myriad Pro-Regular";
	var font = app.fonts;
	var appFontLength = font.length;
	//Set the spec text properties.
	for (var i = 0; i < appFontLength; i++)
	{
		if(font[i].name == model.legendFont)
		{
			postScriptName = font[i].postScriptName;
			break;
		}
	}

	return postScriptName;
}

//This function create the artlayer set named 'Specctr', if not created.
function legendLayer()
{
	var layerSetRef;
	try
    {
		layerSetRef = app.activeDocument.layerSets.getByName("Specctr");
    }
	catch(e)
	{
		layerSetRef = app.activeDocument.layerSets.add();
         layerSetRef.name = "Specctr";
         placeBorderBefore(layerSetRef);
	}
	return layerSetRef;
}


//This function create the artlayer set named 'Spacing', if not created.
function legendSpacingLayer()
{
	var newLayer;

	try
    {
		newLayer = legendLayer().layerSets.getByName("Spacing");
	}
	catch(e)
	{
		newLayer = legendLayer().layerSets.add();
		newLayer.name = "Spacing";
	}

	return newLayer;	
}

//This function create the artlayer set named 'Dimensions', if not created.
function legendDimensionsLayer()
{
	var newLayer;
	try
    {
		newLayer=legendLayer().layerSets.getByName("Dimensions");
	}
	catch(e)
	{
		newLayer=legendLayer().layerSets.add();
         newLayer.name="Dimensions";
	}

	return newLayer;	
}                    

//This function create the artlayer set named 'Properties', if not created.
function legendPropertiesLayer()
{
	var newLayer;
	try
    {
		newLayer=legendLayer().layerSets.getByName("Properties");
	}
	catch(e)
	{
		newLayer=legendLayer().layerSets.add();
         newLayer.name="Properties";
	}

	return newLayer;	
}    

//This function create the artlayer set named 'Text Properties', if not created.
function legendTextPropertiesLayer()
{
	var newLayer;
	
	try
    {
		newLayer=legendPropertiesLayer().layerSets.getByName("Text Specs");
	}
    catch(e)
	{
		newLayer=legendPropertiesLayer().layerSets.add();
		newLayer.name="Text Specs";
	}

	return newLayer;
}

//This function create the artlayer set named 'Object Properties', if not created.
function legendObjectPropertiesLayer()
{
	var newLayer;
	try
    {
		newLayer=legendPropertiesLayer().layerSets.getByName("Object Specs");
	}
    catch(e)
	{
		newLayer=legendPropertiesLayer().layerSets.add();
		newLayer.name="Object Specs";
	}

	return newLayer;	
}

//This function create the artlayer set named 'Coordinates', if not created.
function legendCoordinateLayer()
{
    var newLayer;

	try
    {
		newLayer = legendLayer().layerSets.getByName("Coordinates");
	}
	catch(e)
	{
		newLayer = legendLayer().layerSets.add();
		newLayer.name = "Coordinates";
	}

	return newLayer;	
}

//Get the color to apply on the properties specs of text layer.
function legendColorType()
{
	var newColor = new RGBColor();
	newColor.red = rChannel(model.legendColorType);
	newColor.blue = bChannel(model.legendColorType);
	newColor.green = gChannel(model.legendColorType);
	return newColor;
}
 
//Get the color to apply on the spacing specs.
function legendColorSpacing()
{
	var newColor = new RGBColor();
	newColor.red = rChannel(model.legendColorSpacing);
	newColor.blue = bChannel(model.legendColorSpacing);
	newColor.green = gChannel(model.legendColorSpacing);
	return newColor;
}

//Get the color to apply on the properties specs of shape layer.
function legendColorObject()
{
	var newColor = new RGBColor();
	newColor.red = rChannel(model.legendColorObject);
	newColor.blue = bChannel(model.legendColorObject);
	newColor.green = gChannel(model.legendColorObject);
	return newColor;
}

//Set position of border before the particular layer in Layer panel.
function placeBorderBefore(lyr)
{
    try
    {
        var border = app.activeDocument.artLayers.getByName("Specctr Canvas Border"); 
        border.move(lyr, ElementPlacement.PLACEBEFORE);
    }
    catch(e)
    {}
}

//Get the red color value from the color hex value.
function rChannel(value)
{
	return value >> 16 & 0xFF;
}

//Get the green color value from the color hex value.
function gChannel(value) 
{
	return value >> 8 & 0xFF;
}

//Get the blue color value from the color hex value.
function bChannel(value)
{
	return value >> 0 & 0xFF;
} 

//Calculate the diameter of circle.
function circleDiameter(strokeWidth)
{
	return Math.max(3, strokeWidth*2+3);
}

//Get the original size of canvas.
function originalCanvasSize()
{
    var border = canvasBorder();
    if(border == null)
     {
        var bounds =  new Array(0, 0, app.activeDocument.width, app.activeDocument.height);
        return bounds;
    }
    else
        return border.bounds;
}

//Conversion from RGB to HSL.
function rgbToHsl(rgb)
{
	var r = rgb.red;
	var g = rgb.green;
	var b = rgb.blue;
	r = r/255, g = g/255, b = b/255;

	var max = Math.max(r, g, b);
	var min = Math.min(r, g, b);
	var h, s, l = (max + min) / 2;
			
	if(max == min)
		h = s = 0; // achromatic
	else
	{
		var d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch(max)
		{
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		h /= 6;
	}

	return "hsl(" + Math.round(h*360) + ", " + Math.round(s*100) + ", " + Math.round(l*100) + ")";
}

 //Conversion from RGB To HSV.
function rgbToHsv(rgb)
{
	var r = rgb.red;
	var g = rgb.green;
	var b = rgb.blue;
	r = r/255, g = g/255, b = b/255;

	var max = Math.max(r, g, b);
	var min = Math.min(r, g, b);
	var h, s, v = max;

	var d = max - min;
	s = max == 0 ? 0 : d / max;

	if(max == min)
		h = 0; // achromatic
	else
	{
		switch(max)
		{
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		h /= 6;
	}

	return "hsb(" + Math.round(h*360) + ", " + Math.round(s*100) + ", " + Math.round(v*100) + ")";
}

//Convert the value from one unit to another and return the value string.
function pointsToUnitsString(value, units)
{
	if(units == null)
		units = app.preferences.rulerUnits;

	var result;
    
    switch (units)
	{
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
}

//Return the value according to the rulerUnits of the document.
function typeUnits()
{
	if (app.preferences.rulerUnits == Units.PIXELS) 
		return "px"; 
	else 
		return "pt";
}
