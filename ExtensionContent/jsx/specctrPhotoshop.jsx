﻿/*//////////////////////////////////////////////////////////////////////////////
 * File Name: specctrPhotoshop.jsx
 * Description: This file includes all the functions which create specs i.e. property spec,
    width/height spec, spacing spec, coordinate spec and expand canvas feature.
//////////////////////////////////////////////////////////////////////////////*/

#include "json2.js"
#include "stream.js"

var model;
var heightChoice = { "Left" : 1 , "Right" : 2, "Center" : 3 };
var widthChoice = { "Top" : 1 , "Bottom" : 2, "Center" : 3 };
var cssText = "";
var cssBodyText = "";
var lyrBound;

ext_PHXS_setModel = setModel;
ext_PHXS_expandCanvas = createCanvasBorder;
ext_PHXS_createDimensionSpecs = createDimensionSpecsForItem;
ext_PHXS_createSpacingSpecs = createSpacingSpecs;
ext_PHXS_createCoordinateSpecs = createCoordinateSpecs;
ext_PHXS_createPropertySpecs = createPropertySpecsForItem;
ext_PHXS_exportCss = exportCss;
ext_PHXS_getFonts = getFontList;

//Get the application font's name and font's family.
function getFontList()
{
    var font = app.fonts;
    var appFontLength = font.length;
    var result = [];
    
	//Set the spec text properties.
	for (var i = 0; i < appFontLength; i++)
	{
        var currFont = font[i];
        if(currFont.style == "Regular")
        {
            var object = {};
            object.label = currFont.family;
            object.font = currFont.postScriptName;
            result.push(object);
        }
	}

    return JSON.stringify(result);
 }

//Get the updated value of UI's component from html file.
function setModel(currModel)
{
    model = JSON.parse(currModel);
}

//Get the list of selected layers.
function getSelectedLayers()
{
    var selectedLayers; 
        
    try
    {
        var doc = app.activeDocument;
        selectedLayers   = [];
        var isBackGroundPresent;
        
        try
        {
            isBackGroundPresent = doc.backgroundLayer;
        }
        catch(e)
        {
            isBackGroundPresent = false;
        }
        
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
                if(isBackGroundPresent)
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
            if(isBackGroundPresent) 
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

//Get the active layer.
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
        
        return true;
    }
    catch(e)
    {
        return false;
    }
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
            var backgroundLayer = backgroundLayerIntoNormalLayer();              //Convert background layer into normal layer.
            selectAllLayer();                                          //Select all layers from layer panel.
            var group = groupLayers();
            var groupName = "Original Canvas ["+width+" x "+height+"]"
            group.name = groupName;
            doc.selection.selectAll();                                    //Select the whole canvas.
            layerMasking();                                          //Mask the group layer.
            if(backgroundLayer)
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

//Get the coordinate or width/height spec style info.
function getStyleFromOtherSpecs(specName)
{
    var doc = app.activeDocument;
    var specsInfo = [];
    try
    {
        var specLayerGroup = doc.layerSets.getByName("Specctr").layerSets.getByName(specName);
    }
    catch(e)
    {
        return specsInfo;
    }
    
    var noOfSpecs = specLayerGroup.layerSets.length;
    while(noOfSpecs)
    {
        try
        {
            var object = {};
            var spec = specLayerGroup.layerSets[noOfSpecs - 1].artLayers[0];
            object.idLayer = getXMPData(spec, "idLayer");
            object.styleText = getXMPData(spec, "css");
            specsInfo.push(object);
         }
         catch(e)
         {}
         noOfSpecs = noOfSpecs - 1;
    }
    
    return specsInfo;
}

//Add coordinate or width/height style text into css file.
function addSpecsStyleTextToCss(spec, text, specsInfo)
{
    var idLayer = getXMPData(spec, "idLayer");
    var specCssText = "";
    var noOfSpecs = specsInfo.length;
    
    for(var i = 0; i < noOfSpecs; i++)
    {
        if(specsInfo[i].idLayer == idLayer)
        {
            specCssText = specsInfo[i].styleText;
            break;
        }
    }
                
    if(specCssText)
        text = text.replace("}", specCssText + "\r}");
    
    return text;
}

//Return css text for shape objects.
function getCssForShape(coordinateSpecsInfo)
{
    var doc = app.activeDocument;
    try
    {
        var objectSpecGroup = doc.layerSets.getByName("Specctr").layerSets.getByName("Properties").layerSets.getByName("Object Specs");
    }
    catch(e)
    {
        return "";
    }
    
    var styleText = "";
    var dimensionSpecsInfo = getStyleFromOtherSpecs("Dimensions");           //Get the array of width/height specs info. 
    var noOfDimensionSpecs = dimensionSpecsInfo.length;
    var noOfCoordinateSpecs = coordinateSpecsInfo.length;
    var noOfObjectSpecLayerGroups = objectSpecGroup.layerSets.length;
    
    while(noOfObjectSpecLayerGroups)
    {
        try
        {
            var objectSpec = objectSpecGroup.layerSets[noOfObjectSpecLayerGroups - 1].artLayers.getByName("Specs");
            var text = getXMPData(objectSpec, "css");
            
            if(noOfDimensionSpecs)
                text = addSpecsStyleTextToCss(objectSpec, text, dimensionSpecsInfo);
            
            if(noOfCoordinateSpecs)
                text = addSpecsStyleTextToCss(objectSpec, text, coordinateSpecsInfo);
                
            styleText += text + "\r\r";
        }
        catch(e)
        {}
             
        noOfObjectSpecLayerGroups = noOfObjectSpecLayerGroups - 1;
    }

    return styleText;
}

//Return css text for text objects.
function getCssForText(coordinateSpecsInfo)
{
    var doc = app.activeDocument;
    try
    {
        var textSpecGroup = doc.layerSets.getByName("Specctr").layerSets.getByName("Properties").layerSets.getByName("Text Specs");
    }
    catch(e)
    {
        return "";
    }
    
    var styleText = "";
    var noOfTextSpecLayerGroups = textSpecGroup.layerSets.length;
    var noOfCoordinateSpecs = coordinateSpecsInfo.length;
    
    while(noOfTextSpecLayerGroups)
    {
        try
        {
            var textSpec = textSpecGroup.layerSets[noOfTextSpecLayerGroups - 1].artLayers.getByName("Specs");
            var text = getXMPData(textSpec, "css");
            
            if(noOfCoordinateSpecs)
                text = addSpecsStyleTextToCss(textSpec, text, coordinateSpecsInfo);
                
            styleText += text + "\r\r";
        }
        catch(e)
        {}
            
        noOfTextSpecLayerGroups = noOfTextSpecLayerGroups - 1;
    }

    return styleText;
}

//Export the spec layer into css text file.
function exportCss()
{
    if(!app.documents.length)           //Checking document is open or not.
        return;
    
    var doc = app.activeDocument;
    try
    {
        var propertySpecLayerGroup = doc.layerSets.getByName("Specctr").layerSets.getByName("Properties");
    }
    catch(e)
    {
         alert("No spec present to export.");
         return;
    }
    
    if(ExternalObject.AdobeXMPScript == null)
		ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');		//Load the XMP Script library to access XMPMetadata info of layers.
        
    var coordinateSpecsInfo = getStyleFromOtherSpecs("Coordinates");           //Get the array of coordinate specs info.
    
    var styleText = cssBodyText;            //Add the body text at the top of css file.
    styleText += getCssForText(coordinateSpecsInfo);
    styleText += getCssForShape(coordinateSpecsInfo);
    
    if(styleText == "")
    {
        alert("No spec present to export!");
        return;
    }
    
    //Create the file and export it.
    var cssFile = "";
    var cssFilePath = "";
    
    try
    {
        var documentPath = doc.path;
    }
    catch(e)
    {
        documentPath = "";
    }
    
    if(documentPath)
        cssFilePath = documentPath + "/Styles.css";
    else
        cssFilePath = "~/desktop/Styles.css";

    cssFile = File(cssFilePath);

    if(cssFile.exists)
    {
        var replaceFileFlag = confirm("Styles.css already exists in this location.\rDo you want to replace it?", true, "Specctr");
        if(!replaceFileFlag)
            return;
    }
        
    if(cssFile)
    {
        cssFile.open("w");
        cssFile.write(styleText);
        cssFile.close;
        
        if(replaceFileFlag)
            alert("Styles.css is exported.");
        else 
            alert("Styles.css is exported to " + cssFilePath);
    }
    else
    {
        alert("Unable to export!");
        return;
    }
}

//Suspend the history of creating dimension spec of layer.
function createDimensionSpecsForItem()
{
    try
    {
        var artLayer = getActiveLayer();
        if(artLayer === null || !startUpCheckBeforeSpeccing(artLayer))      //Check if layer is valid for speccing i.e. not an artlayer set or specced object.
            return;

        var pref = app.preferences;
        var startRulerUnits = pref.rulerUnits; 
        pref.rulerUnits = Units.PIXELS;
        
        var ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        var layer = executeActionGet(ref);
        if(layer.hasKey(stringIDToTypeID('layerEffects')) && layer.getBoolean(stringIDToTypeID('layerFXVisible')))
            var bounds = returnBounds(artLayer);
        else
            bounds = artLayer.bounds;

        pref.rulerUnits = startRulerUnits;
        app.activeDocument.suspendHistory('Dimension Specs', 'createDimensionSpecs(artLayer, bounds)');      //Pass bounds and layer for creating dimension spec.
    }
    catch(e)
    {}
}

//Create the dimension spec for a selected layer.
function createDimensionSpecs(artLayer, bounds)
{
    if(ExternalObject.AdobeXMPScript == null)
		ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');		//Load the XMP Script library to access XMPMetadata info of layers.

    var dimensionSpec = "", legendLayer = "";
    var idDimensionSpec = getXMPData(artLayer, "idDimensionSpec");
    if(idDimensionSpec)
    {
        dimensionSpec = getLayerByID(idDimensionSpec);
        if(dimensionSpec)
        {
            legendLayer = dimensionSpec.parent;
            dimensionSpec.remove();
        }
    }

    //Create the specs.
    var doc = app.activeDocument;
    var startRulerUnits = app.preferences.rulerUnits;
    var startTypeUnits = app.preferences.typeUnits;
    var originalDPI = doc.resolution;
    setPreferences(Units.PIXELS, TypeUnits.PIXELS, 72);

    var text = "", line = "", specText = "";
    var height = bounds[3]-bounds[1];
    var width = bounds[2]-bounds[0];
    var spacing = 10+model.armWeight;
    var armWidth = model.armWeight/2.0;
    var newColor = legendColorSpacing();

    if(legendLayer === "")
    {
        legendLayer = legendDimensionsLayer().layerSets.add();
        legendLayer.name = "Specctr Dimension Mark"; 
    }

    var spec = legendLayer.layerSets.add();
    spec.name = "DimensionSpec"; 
    
    var widthValue = '', heightValue = '';
    var relativeHeight='', relativeWidth='';
    if(model.specInPrcntg)
    {
        var orgnlCanvas = originalCanvasSize();       //Get the original canvas size.
        if(model.relativeHeight != 0)
            relativeHeight = model.relativeHeight;
        else
            relativeHeight = orgnlCanvas[3];

        if(model.relativeWidth != 0)
            relativeWidth = model.relativeWidth;
        else
            relativeWidth = orgnlCanvas[2];
    }

    if(model.widthPos > 0)
    {
         if(!model.specInPrcntg)
            widthValue = pointsToUnitsString(getScaledValue(width), startRulerUnits);
        else
            widthValue = Math.round(width/relativeWidth*10000) /100+ "%";

        text = spec.artLayers.add();
        text.kind = LayerKind.TEXT;
        specText = text.textItem;
        specText.kind = TextType.POINTTEXT;
        specText.justification = Justification.CENTER;
        specText.color.rgb = newColor;
        specText.font = model.legendFont;
        specText.size = model.legendFontSize;
        specText.contents = widthValue;
    }

    var aPos, bPos, cPos;
    switch(model.widthPos)
    {
        case widthChoice.Top:
            specText.position = [bounds[0]+width/2.0, bounds[1]-spacing-armWidth];

            bPos = bounds[1]-0.7*spacing;
            line = createLine(bounds[0], bPos, bounds[2], bPos, newColor);     //Main width line.

            aPos = bounds[0]+armWidth;
            bPos = bounds[1]-0.4*spacing;
            cPos = bounds[1]-spacing;
            setShape(aPos, bPos, aPos, cPos);   //Width line's left.

            aPos = bounds[2]-armWidth;
            setShape(aPos, bPos, aPos, cPos);   // Width line's right.
            break;
            
        case widthChoice.Bottom:
            specText.position = [bounds[0]+width/2.0, bounds[3]+spacing+armWidth+model.legendFontSize*0.8];
            
            bPos = bounds[3]+0.7*spacing;
            line = createLine(bounds[0], bPos, bounds[2], bPos, newColor);     //Main width line.
            
            aPos = bounds[0]+armWidth;
            bPos = bounds[3]+0.4*spacing;
            cPos = bounds[3]+spacing;
            setShape(aPos, bPos, aPos, cPos);   //Width line's left.
            
            aPos = bounds[2]-armWidth;
            setShape(aPos, bPos, aPos, cPos);    // Width line's right.
            break;
            
        case widthChoice.Center:
            specText.position =[bounds[0]+width/2.0, bounds[1]+height/2.0-spacing+model.armWeight*2.0];

            bPos = bounds[1]+height/2.0;
            line = createLine(bounds[0], bPos, bounds[2], bPos, newColor);     //Main width line.

            aPos = bounds[0]+armWidth;
            cPos = bPos+0.4*spacing;
            bPos = bPos-0.4*spacing;
            setShape(aPos, bPos, aPos, cPos);   //Width line's left.

            aPos = bounds[2]-armWidth;
            setShape(aPos, bPos, aPos, cPos);   // Width line's right.   

            default:
    }

    if(model.heightPos > 0)
    {
        if(!model.specInPrcntg)
            heightValue = pointsToUnitsString(getScaledValue(height), startRulerUnits);
        else
            heightValue = Math.round(height/relativeHeight*10000) /100+ "%";

        text = spec.artLayers.add();
        text.kind = LayerKind.TEXT;
        specText = text.textItem;
        specText.kind = TextType.POINTTEXT;
        specText.justification = Justification.RIGHT;
        specText.color.rgb = newColor;
        specText.font = model.legendFont;
        specText.size = model.legendFontSize;
        specText.contents = heightValue;
    }

    switch(model.heightPos)
    {
        case heightChoice.Left:
            specText.position = [bounds[0]-spacing-armWidth, bounds[1]+height/2.0];

            aPos = bounds[0]-0.7*spacing;
            line = createLine(aPos, bounds[3], aPos, bounds[1], newColor);      //Main height line

            aPos = bounds[0]-0.4*spacing;
            bPos = bounds[1]+armWidth;
            cPos = bounds[0]-spacing;
            setShape(aPos, bPos, cPos, bPos);   //Height line's top.

            bPos = bounds[3]-armWidth;
            setShape(aPos, bPos, cPos, bPos);    //Height line's bottom.
            break;

        case heightChoice.Right:
            specText.justification = Justification.LEFT;
            specText.position = [bounds[2]+spacing+armWidth, bounds[1]+height/2.0];

            aPos = bounds[2]+0.7*spacing;
            line = createLine(aPos, bounds[3], aPos, bounds[1], newColor);      //Main height line

            aPos = bounds[2]+0.4*spacing;
            bPos = bounds[1]+armWidth;
            cPos = bounds[2]+spacing;
            setShape(aPos, bPos, cPos, bPos);   //Height line's top.

            bPos = bounds[3]-armWidth;
            setShape(aPos, bPos, cPos, bPos);   //Height line's bottom.
            break;

        case heightChoice.Center:
            specText.justification = Justification.LEFT;
            specText.position = [bounds[2]-width/2.0+0.4*spacing+armWidth, bounds[1]+height/2.0];

            aPos = bounds[2]-width/2.0;
            line = createLine(aPos, bounds[3], aPos, bounds[1], newColor);      //Main height line

            bPos = bounds[1]+armWidth;
            cPos = aPos-0.4*spacing;
            aPos = aPos+0.4*spacing;
            setShape(aPos, bPos, cPos, bPos);   //Height line's top.

            bPos = bounds[3]-armWidth;
            setShape(aPos, bPos, cPos, bPos);   //Height line's bottom.
          default:
    }

    doc.activeLayer = spec;
    spec = createSmartObject();
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
    setPreferences(startRulerUnits, startTypeUnits, originalDPI);
}

//Create text spec for horizontal distances for spacing specs between two objects.
function createHorizontalSpec(x1, x2, y1, y2, startRulerUnits, legendLayer)
{
    try
    {
        var distance = Math.abs(x2-x1);
        var spacing = 3+0.3*model.armWeight;
        var armWidth = model.armWeight/2;
        var newColor = legendColorSpacing();

        if(!model.specInPrcntg)
        {
            //Absolute distance.
            distance = pointsToUnitsString(getScaledValue(distance), startRulerUnits);
        }
        else 
        {
            //Relative distance with respect to original canvas.
            var relativeWidth='';
            var orgnlCanvas = originalCanvasSize();       //Get the original canvas size.
            
            if(model.relativeWidth != 0)
                relativeWidth = model.relativeWidth;
            else
                relativeWidth = orgnlCanvas[2];

            distance = Math.round(distance/relativeWidth*10000)/100 + "%";
        }

        var textLayer = legendLayer.artLayers.add();
        textLayer.kind = LayerKind.TEXT;
        var specText = textLayer.textItem;
        specText.kind = TextType.POINTTEXT;
        specText.justification = Justification.CENTER; 
        specText.color.rgb = newColor;
        specText.font = model.legendFont;
        specText.size = model.legendFontSize;
        specText.contents = distance;
        specText.position = [(x1+x2)/2.0, y1-spacing-armWidth];

        var line = createLine(x1, y1, x2, y2, newColor);
        var aPos = x2+armWidth;
        var bPos = y1+spacing;
        var cPos = y2-spacing;
        setShape(aPos, bPos, aPos, cPos);    //horizontal left line.
        aPos = x1-armWidth;
        setShape(aPos, bPos, aPos, cPos);    //horizontal right line.
    }
    catch(e)
    {}
}

//Create text spec for vertical distances for spacing specs between two objects.
function createVertSpec(x1, x2, y1, y2, startRulerUnits, legendLayer)
{
    try
    {
        var distance = Math.abs(y2-y1);
        var spacing = 3+0.3*model.armWeight;
        var armWidth = model.armWeight/2;
        var newColor = legendColorSpacing();
        
        if(!model.specInPrcntg)
        {
            //Value after applying scaling.
            distance = pointsToUnitsString(getScaledValue(distance), startRulerUnits);
        }
        else 
        {
            //Relative distance with respect to original canvas.
            var relativeHeight='';
            var orgnlCanvas = originalCanvasSize();       //Get the original canvas size.
            
            if(model.relativeHeight != 0)
                relativeHeight = model.relativeHeight;
            else
                relativeHeight = orgnlCanvas[3];

            distance = Math.round(distance/relativeHeight*10000)/100 + "%";
        }

        var textLayer = legendLayer.artLayers.add();
        textLayer.kind = LayerKind.TEXT;
        var specText = textLayer.textItem;
        specText.kind = TextType.POINTTEXT;
        specText.justification = Justification.RIGHT;
        specText.color.rgb = newColor;
        specText.font = model.legendFont;
        specText.size = model.legendFontSize;
        specText.contents = distance;
        specText.position = [x1-spacing-armWidth, (y1+y2)/2.0];

        var line = createLine(x1, y1, x2, y2, newColor);
        var aPos =  y2+armWidth;
        setShape(x1-spacing, aPos, x1+spacing, aPos);    //vertical top line.
        aPos =  y1-armWidth;
        setShape(x2-spacing, aPos, x2+spacing, aPos);    //vertical bottom line.
    }
    catch(e)
    {}
}

//Suspend the history of creating spacing spec of layers.
function createSpacingSpecs()
{
    try
    {
        var selectedArtItems = getSelectedLayers();
        var numberOfSelectedItems = selectedArtItems.length;
        var doc = app.activeDocument;
        var pref = app.preferences;
        var startRulerUnits = pref.rulerUnits; 
        pref.rulerUnits = Units.PIXELS;
        
        var lyr = charIDToTypeID("Lyr ");
        var ordn = charIDToTypeID("Ordn");
        var trgt = charIDToTypeID("Trgt");
        var layerEffects = stringIDToTypeID('layerEffects');
        var layerFXVisible = stringIDToTypeID('layerFXVisible');
        if(numberOfSelectedItems === 2)
        {
            //get selected art items.
            var artLayer1 = selectLayerByIndex(selectedArtItems[0]);
            var artLayer2 = selectLayerByIndex(selectedArtItems[1]);

            if(artLayer1.typename === "LayerSet" || artLayer2.typename === "LayerSet")
            {
                alert("Please select shape layers or text layers only.");
                return;
            }

            doc.activeLayer = artLayer1;
            var ref = new ActionReference();
            ref.putEnumerated(lyr, ordn, trgt);
            var layer = executeActionGet(ref);
            if(layer.hasKey(layerEffects) && layer.getBoolean(layerFXVisible))
                var bounds1 = returnBounds(artLayer1);
            else
                bounds1 = artLayer1.bounds;

            doc.activeLayer = artLayer2;
            ref = new ActionReference();
            ref.putEnumerated(lyr, ordn, trgt);
            layer = executeActionGet(ref);
            if(layer.hasKey(layerEffects) && layer.getBoolean(layerFXVisible))
                var bounds2 = returnBounds(artLayer2);
            else
                bounds2 = artLayer2.bounds;

            app.activeDocument.suspendHistory('Spacing spec', 'createSpacingSpecsForTwoItems(artLayer1, artLayer2, bounds1, bounds2)');
        }
        else if(numberOfSelectedItems === 1)
        {
            var artLayer = doc.activeLayer;

            if(!startUpCheckBeforeSpeccing(artLayer))      //Check if layer is valid for speccing i.e. not an artlayer set or specced object.
                return;

            ref = new ActionReference();
            ref.putEnumerated(lyr, ordn, trgt);
            layer = executeActionGet(ref);
            if(layer.hasKey(layerEffects) && layer.getBoolean(layerFXVisible))
                var bounds = returnBounds(artLayer);
            else
                bounds = artLayer.bounds;

            app.activeDocument.suspendHistory('Spacing spec', 'createSpacingSpecsForSingleItem(artLayer, bounds)');
        }
        else
        {
            alert("Please select one or two shape/text layer(s)!");
        }

        pref.rulerUnits = startRulerUnits;
    }
    catch(e)
    {}
}

//Create the spacing spec for two selected layers.
function createSpacingSpecsForTwoItems(artLayer1, artLayer2, bounds1, bounds2)
{
    if(ExternalObject.AdobeXMPScript == null)
		ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');		//Load the XMP Script library to access XMPMetadata info of layers.

    var doc = app.activeDocument;
    doc.activeLayer = artLayer2;
    var uniqueIdOfSecondLayer = getIDOfLayer();

    //Code for updating the specs.
    var spacingSpec = "", legendLayer = "";
    var indexOfSpecInFirstLayerXMPArray = "";
    var indexOfSpecInSecondLayerXMPArray = "";
    var idSpacingSpec = getXMPDataForSpacingSpec(artLayer1, uniqueIdOfSecondLayer, "idSpacingSpec");
    if(idSpacingSpec)
    {
        spacingSpec = getLayerByID(idSpacingSpec);
        if(spacingSpec)
        {
            legendLayer = spacingSpec.parent;
            spacingSpec.remove();
            indexOfSpecInFirstLayerXMPArray = getIndexFromXmpArray(artLayer1, idSpacingSpec, "idSpacingSpec");
            indexOfSpecInSecondLayerXMPArray = getIndexFromXmpArray(artLayer2, idSpacingSpec, "idSpacingSpec");
        }
    }

    //Save the current preferences
    var startRulerUnits = app.preferences.rulerUnits;
    var startTypeUnits = app.preferences.typeUnits;
    var originalDPI = doc.resolution;
    setPreferences(Units.PIXELS, TypeUnits.PIXELS, 72);

    var isOverlapped = false;
    var uniqueIdOfSpec = "";
    doc.activeLayer = artLayer1;
    var uniqueIdOfFirstLayer = getIDOfLayer();

    if(artLayer1.kind === LayerKind.TEXT && artLayer1.textItem.kind === TextType.POINTTEXT)
    {
        doc.activeLayer = artLayer1;
        var baseLinePosition = getPointTextBaseLine(artLayer1.textItem);
        bounds1[3] = artLayer1.textItem.position[1] + baseLinePosition;
    }

    if(artLayer2.kind === LayerKind.TEXT && artLayer2.textItem.kind === TextType.POINTTEXT)
    {
        doc.activeLayer = artLayer2;
        var baseLinePosition = getPointTextBaseLine(artLayer2.textItem);
        bounds2[3] = artLayer2.textItem.position[1] + baseLinePosition;
    }

	// Check overlap
	if (bounds1[0]<bounds2[2] && bounds1[2]>bounds2[0] &&
		bounds1[3]>bounds2[1] && bounds1[1]<bounds2[3])
	{
		isOverlapped = true;
	}

    if(legendLayer === "")
    {
        legendLayer = legendSpacingLayer().layerSets.add();
        legendLayer.name = "Specctr Spacing Mark";
    }
    var spec = legendLayer.layerSets.add();
    spec.name = "SpacingSpec";

    // Check if there's vertical perpendicular
	if (bounds1[0]<bounds2[2] && bounds1[2]>bounds2[0])
	{
        var x= Math.max(bounds1[0], bounds2[0])/2+Math.min(bounds1[2], bounds2[2])/2;
        var y1, y2;

        if(!isOverlapped)
        {
            if(bounds1[1]<bounds2[1])
            {
                y1=bounds1[3];
                y2=bounds2[1];
            }
            else 
            {
                y1=bounds2[3];
                y2=bounds1[1];
            }
            createVertSpec(x, x, y2, y1, startRulerUnits, spec);
        }
        else
        {
            //for top to top
            if(model.spaceTop)
            {
                if(bounds1[1]>bounds2[1])
                {
                    y1=bounds1[1];
                    y2=bounds2[1];
                }
                else 
                {
                    y1=bounds2[1];
                    y2=bounds1[1];
                }
                createVertSpec(x, x, y1, y2, startRulerUnits, spec);
            }

            //for bottom to bottom
            if(model.spaceBottom)
            {
                 if(bounds1[3]>bounds2[3])
                {
                    y1=bounds1[3];
                    y2=bounds2[3];
                }
                else 
                {
                    y1=bounds2[3];
                    y2=bounds1[3];
                }
                createVertSpec(x, x, y1, y2, startRulerUnits, spec);
            }
        }
    }
    
    // Check if there's horizontal perpendicular
	if (bounds1[3]>bounds2[1] && bounds1[1]<bounds2[3])
	{
        var y = Math.max(bounds1[1], bounds2[1])/2+Math.min(bounds1[3], bounds2[3])/2;
        var x1, x2;

        if(!isOverlapped)
        {
            if(bounds1[0]>bounds2[0])
            {
                x1=bounds1[0];
                x2=bounds2[2]; 
            }
            else
            {
                x1=bounds2[0];
                x2=bounds1[2]; 
            }
            createHorizontalSpec(x1, x2, y, y, startRulerUnits, spec);
        } 
        else
        {
            //for left to left
            if(model.spaceLeft)
            {
                if(bounds1[0]>bounds2[0])
                {
                    x1=bounds1[0];
                    x2=bounds2[0]; 
                }
                else
                {
                    x1=bounds2[0];
                    x2=bounds1[0]; 
                }
                createHorizontalSpec(x1, x2, y, y, startRulerUnits, spec);
            }
            
            //for right to right
            if(model.spaceRight)
            {
                if(bounds1[2]>bounds2[2])
                {
                    x1=bounds1[2];
                    x2=bounds2[2]; 
                }
                else
                {
                    x1=bounds2[2];
                    x2=bounds1[2]; 
                }
                createHorizontalSpec(x1, x2, y, y, startRulerUnits, spec);
            }
        }
     }

    doc.activeLayer = spec;
    spec = createSmartObject();
    uniqueIdOfSpec = getIDOfLayer();
    setXmpDataForSpec(spec, "true", "SpeccedObject");
    setXmpDataForSpec(spec, uniqueIdOfFirstLayer, "firstLayer");
    setXmpDataForSpec(spec, uniqueIdOfSecondLayer, "secondLayer");
    selectLayers(artLayer1.name, artLayer2.name);
    setXmpDataForSpacingSpec(artLayer1, uniqueIdOfSpec, "idSpacingSpec", indexOfSpecInFirstLayerXMPArray);
    setXmpDataForSpacingSpec(artLayer2, uniqueIdOfSpec, "idSpacingSpec", indexOfSpecInSecondLayerXMPArray);
    setPreferences(startRulerUnits, startTypeUnits, originalDPI);      //Setting the original preferences of the document.
}

//Create the spacing spec for a selected layer.
function createSpacingSpecsForSingleItem(artLayer, bounds)
{
     if(ExternalObject.AdobeXMPScript == null)
		ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');		//Load the XMP Script library to access XMPMetadata info of layers.

    var spacingSpec = "", legendLayer = "";
    var idSpacingSpec = getXMPData(artLayer, "idSingleSpacingSpec");
    if(idSpacingSpec)
    {
        spacingSpec = getLayerByID(idSpacingSpec);
        if(spacingSpec)
        {
            legendLayer = spacingSpec.parent;
            spacingSpec.remove();
        }
    }

    //Save the current preferences
    var doc = app.activeDocument;
    var startRulerUnits = app.preferences.rulerUnits;
    var startTypeUnits = app.preferences.typeUnits;
    var originalDPI = doc.resolution;
    setPreferences(Units.PIXELS, TypeUnits.PIXELS, 72);

    var font = model.legendFont;
    var newColor = legendColorSpacing();
    var height = bounds[3] - bounds[1];
    var width = bounds[2] - bounds[0];
    var armWidth = model.armWeight / 2.0;
    var spacing = 3 + 0.3 * model.armWeight;
    var cnvsRect = originalCanvasSize();       //Get the original canvas size.

    var relativeHeight='', relativeWidth='';
    if(model.specInPrcntg)
    {
         if(model.relativeHeight != 0)
            relativeHeight = model.relativeHeight;
        else
            relativeHeight = cnvsRect[3];

        if(model.relativeWidth != 0)
            relativeWidth = model.relativeWidth;
        else
            relativeWidth = cnvsRect[2];
    }

    if(legendLayer === "")
    {
        legendLayer = legendSpacingLayer().layerSets.add();
        legendLayer.name = "Specctr Spacing Mark";
    }

    var specItemsGroup = legendLayer.layerSets.add();
    specItemsGroup.name = "SpacingSpec";

    var lines = "", specText = "", textLayer = "";
    var distanceValue = "";
    var aPos, bPos, cPos;

    if(model.spaceTop)  //Create the spec text for top.
    {
        if(!model.specInPrcntg)
            distanceValue =  pointsToUnitsString(getScaledValue(bounds[1] - cnvsRect[1]), startRulerUnits);
        else
             distanceValue = Math.round((bounds[1] - cnvsRect[1]) / relativeHeight * 10000) / 100 + "%";
        
        aPos = bounds[0] + width / 2 - spacing;
        textLayer = specItemsGroup.artLayers.add();
        textLayer.kind = LayerKind.TEXT;
        specText = textLayer.textItem;
        specText.kind = TextType.POINTTEXT;
        specText.justification = Justification.RIGHT;
        specText.color.rgb = newColor;
        specText.font = font;
        specText.size = model.legendFontSize;
        specText.contents = distanceValue;
        specText.position = [aPos - armWidth, (bounds[1] + cnvsRect[1]) / 2.0];

        cPos = aPos + spacing;
        lines = createLine(cPos, cnvsRect[1], cPos, bounds[1], newColor);      //Main top line.

        bPos = bounds[1] - armWidth;
        cPos = cPos + spacing;
        setShape(aPos, bPos, cPos, bPos);   //Top line's top.

        bPos = cnvsRect[1] + armWidth;
        setShape(aPos, bPos, cPos, bPos);   //Top line's bottom.
    }

    if(model.spaceLeft) //Create the spec text for left.
    {
        if(!model.specInPrcntg)
            distanceValue =  pointsToUnitsString(getScaledValue(bounds[0] - cnvsRect[0]), startRulerUnits);
        else
             distanceValue = Math.round((bounds[0] - cnvsRect[0]) / relativeWidth * 10000) / 100 + "%";

        if(textLayer === "")
        {
            textLayer = specItemsGroup.artLayers.add();
            textLayer.kind = LayerKind.TEXT;
            specText = textLayer.textItem;
            specText.kind = TextType.POINTTEXT;
            specText.color.rgb = newColor;
            specText.font = font;
            specText.size = model.legendFontSize;
        }
        else
        {
            textLayer = textLayer.duplicate(textLayer, ElementPlacement.PLACEBEFORE);
            specText = textLayer.textItem;
        }

        cPos = bounds[3] - height / 2 - spacing;
        specText.justification = Justification.CENTER;
        specText.contents = distanceValue;
        specText.position = [(bounds[0] + cnvsRect[0]) / 2.0, cPos - armWidth];

        bPos = cPos + spacing;
        lines = createLine(cnvsRect[0], bPos, bounds[0], bPos, newColor);    //Main left line.

        bPos = bPos + spacing;
        aPos = bounds[0] - armWidth;
        setShape(aPos, bPos, aPos, cPos);   //Left line's left.

        aPos = cnvsRect[0] + armWidth;
        setShape(aPos, bPos, aPos, cPos);   //Left line's right.
    }

    if(model.spaceRight)    //Create the spec text for right.
    {
        if(!model.specInPrcntg)
            distanceValue =  pointsToUnitsString(getScaledValue(cnvsRect[2] - bounds[2]), startRulerUnits);
        else
             distanceValue = Math.round((cnvsRect[2] - bounds[2]) / relativeWidth * 10000) / 100 + "%";

        if(textLayer === "")
        {
            textLayer =  specItemsGroup.artLayers.add();
            textLayer.kind = LayerKind.TEXT;
            specText = textLayer.textItem;
            specText.kind = TextType.POINTTEXT;
            specText.color.rgb = newColor;
            specText.font = font;
            specText.size = model.legendFontSize;
        }
        else
        {
            textLayer = textLayer.duplicate(textLayer, ElementPlacement.PLACEBEFORE);
            specText = textLayer.textItem;
        }

        cPos = bounds[3] - height / 2 - spacing;
        specText.justification = Justification.CENTER;
        specText.contents = distanceValue;
        specText.position = [(bounds[2] + cnvsRect[2]) / 2.0, cPos - armWidth];

        bPos = cPos + spacing;
        lines = createLine(cnvsRect[2], bPos, bounds[2], bPos, newColor);    //Main Right line.

        bPos = bPos + spacing;
        aPos = bounds[2] + armWidth;
        setShape(aPos, bPos, aPos, cPos);   //Right line's left.
        aPos = cnvsRect[2] - armWidth;
        setShape(aPos, bPos, aPos, cPos);   //Right line's right.
    }

    if(model.spaceBottom)   //Create the spec text for bottom.
    {
        if(artLayer.kind === LayerKind.TEXT && artLayer.textItem.kind === TextType.POINTTEXT)
        {
            doc.activeLayer = artLayer;
            var baseLinePosition = getPointTextBaseLine(artLayer.textItem);
            bounds[3] = artLayer.textItem.position[1] + baseLinePosition;
        }

        if(!model.specInPrcntg)
            distanceValue =  pointsToUnitsString(getScaledValue(cnvsRect[3] - bounds[3]), startRulerUnits);
        else
             distanceValue = Math.round((cnvsRect[3] - bounds[3]) / relativeHeight * 10000) / 100 + "%";

        if(textLayer === "")
        {
            textLayer = specItemsGroup.artLayers.add();
            textLayer.kind = LayerKind.TEXT;
            specText = textLayer.textItem;
            specText.kind = TextType.POINTTEXT;
            specText.color.rgb = newColor;
            specText.font = font;
            specText.size = model.legendFontSize;
        }
        else
        {
            textLayer = textLayer.duplicate(textLayer, ElementPlacement.PLACEBEFORE);
            specText = textLayer.textItem;
        }

        aPos = bounds[0] + width / 2 - spacing;
        specText.justification = Justification.RIGHT;
        specText.contents = distanceValue;
        specText.position = [aPos - armWidth, (bounds[3]+cnvsRect[3])/2.0];

        cPos = aPos + spacing;
        lines = createLine(cPos, cnvsRect[3], cPos, bounds[3], newColor);   //Main bottom line.

        bPos = bounds[3] + armWidth;
        cPos = cPos + spacing;
        setShape(aPos, bPos, cPos, bPos);   //Bottom line's left.
        bPos = cnvsRect[3] - armWidth;
        setShape(aPos, bPos, cPos, bPos);   //Bottom line's right.
    }

    //Converting selected layers into single smart object.
    doc.activeLayer = specItemsGroup;
    specItemsGroup = createSmartObject();
    idSpacingSpec = getIDOfLayer();

    doc.activeLayer = artLayer;
    setXmpDataForSpec(artLayer, idSpacingSpec, "idSingleSpacingSpec");
    setXmpDataForSpec(specItemsGroup, "true", "SpeccedObject");

    setPreferences(startRulerUnits, startTypeUnits, originalDPI);      //Setting the original preferences of the document.
}

//Get text base line position.
function getPointTextBaseLine(textItem)
{
    var imFactor = "";
    var leading = "", size = "";
    var kDefaultLeadVal = 120.0, kDefaultFontSize= 12;
    var isAutoLeading="";
    
    var sizeID = stringIDToTypeID("size");
    var transformID = stringIDToTypeID("transform");
    var yyID = stringIDToTypeID("yy");
    var autoLeadingID = stringIDToTypeID("autoLeading");

    var ref = new ActionReference();
    ref.putEnumerated( charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') ); 
    var desc = executeActionGet(ref).getObjectValue(stringIDToTypeID('textKey'));

    //Character Styles
    var textStyleRangeID = stringIDToTypeID("textStyleRange");
    var textStyleID = stringIDToTypeID("textStyle");
    var txtList = desc.getList(textStyleRangeID);
    var txtDesc = txtList.getObjectValue(0);
    
    if(txtDesc.hasKey(textStyleID)) 
    {
        var rangeList = desc.getList(textStyleRangeID);
        var styleDesc = rangeList.getObjectValue(0).getObjectValue(textStyleID);
        if(styleDesc.hasKey(sizeID))
        {
            size =  styleDesc.getDouble(sizeID);
            if(desc.hasKey(transformID))
            {
                mFactor = desc.getObjectValue(transformID).getUnitDoubleValue (yyID);
                size = (size* mFactor).toFixed(2).toString().replace(/0+$/g,'').replace(/\.$/,'');
            }
        }
    
        if(styleDesc.hasKey(autoLeadingID))
        {
            isAutoLeading = styleDesc.getBoolean(autoLeadingID);
            if(isAutoLeading == false)
            {
                 leading = styleDesc.getDouble(stringIDToTypeID("leading"));
                 if(desc.hasKey(transformID))
                 {
                     mFactor = desc.getObjectValue(transformID).getUnitDoubleValue (yyID);
                     leading = (leading* mFactor).toFixed(2).toString().replace(/0+$/g,'').replace(/\.$/,'');
                 }
            }
        }
    }
    
    //Paragraph styles.
    var paragraphStyleID = stringIDToTypeID("paragraphStyle");
    var defaultStyleID = stringIDToTypeID("defaultStyle");
    var paraList = desc.getList(stringIDToTypeID("paragraphStyleRange"));
    var paraDesc = paraList.getObjectValue(0);
    if (paraDesc.hasKey(paragraphStyleID)) 
    {
        var paraStyle = paraDesc.getObjectValue(paragraphStyleID);
        if(paraStyle.hasKey(defaultStyleID)) 
        {
            var defStyle = paraStyle.getObjectValue(defaultStyleID);
            if(size === " " && defStyle.hasKey(sizeID))
            {
                size = defStyle.getDouble(sizeID);
                if(desc.hasKey(transformID))
                {
                    var mFactor = desc.getObjectValue(transformID).getUnitDoubleValue (yyID);
                    size = (size* mFactor).toFixed(2).toString().replace(/0+$/g,'').replace(/\.$/,'');
                }
            }
            if (leading === "" && defStyle.hasKey(autoLeadingID))
            {
                isAutoLeading = defStyle.getBoolean(autoLeadingID);
                if(isAutoLeading == false)
                {
                    leading = defStyle.getDouble(stringIDToTypeID("leading"));
                    if(desc.hasKey(transformID))
                    {
                        mFactor = desc.getObjectValue(transformID).getUnitDoubleValue(yyID);
                        leading = (leading* mFactor).toFixed(2).toString().replace(/0+$/g,'').replace(/\.$/,'');
                    }
                 }
             }
        }
    }

    if(leading == "" || isAutoLeading == true)
        leading =  size / 100 * Math.round(kDefaultLeadVal);

    leading = Math.round(leading * 100) / 100;
    
    var contents = textItem.contents;
    contents = contents.replace(/^\s+|\s+$/gm,'');                  //Trim the spaces.
    var lastChar = contents.charAt (contents.length - 1);
    while(lastChar === "\u0003" || lastChar === "\r")
    {
        contents = contents.slice (0, contents.length - 1);
        lastChar = contents.charAt (contents.length - 1);
    }

    var lines = contents.split(/[\u0003\r]/);  //Splitting content from Enter or Shift+Enter.
    return (lines.length - 1) * leading;
}

//Create the number of spec.
function createNumber(legendLayer, number, font)
{
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
}

//Suspend the history of creating properties spec of layers.
function createPropertySpecsForItem()
{
    try
    {
        var sourceItem = getActiveLayer();
        if(sourceItem === null)
            return;

        var pref = app.preferences;
        var startRulerUnits = pref.rulerUnits; 
        pref.rulerUnits = Units.PIXELS;
        var ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        var layer = executeActionGet(ref);
        if(layer.hasKey(stringIDToTypeID('layerEffects')) && layer.getBoolean(stringIDToTypeID('layerFXVisible')))
            var bounds = returnBounds(sourceItem);
        else
            bounds = sourceItem.bounds;

        pref.rulerUnits = startRulerUnits;
        app.activeDocument.suspendHistory('Property Specs', 'createPropertySpecs(sourceItem, bounds)');
    }
    catch(e)
    {}
}

//Get the property of selected layer and show it on active document.
function createPropertySpecs(sourceItem, bounds)
{
	var doc = app.activeDocument;
	var infoText;
	var newColor = legendColorObject();
	var artLayer = sourceItem;
	var spec, idLayer, idSpec, lyr;
    var idBullet, bullet, dupBullet, idDupBullet;
    var number = -1;
    var noOfSpec;

	if(artLayer.typename === 'LayerSet')
		return;

 	if(ExternalObject.AdobeXMPScript == null)
		ExternalObject.AdobeXMPScript = new ExternalObject('lib:AdobeXMPScript');		//Load the XMP Script library to access XMPMetadata info of layers.
	
     idSpec = getXMPData(artLayer, "idSpec");			//Check if metadata of the layer is already present or not.
     if(idSpec != null)
     {
         spec = getLayerByID(idSpec);
         idBullet = getXMPData(artLayer, "idBullet");
         bullet = getLayerByID(idBullet);
         idDupBullet = getXMPData(artLayer, "idDupBullet");
         dupBullet = getLayerByID(idDupBullet);
         
         if(spec == artLayer || bullet == artLayer || dupBullet == artLayer)
         {
            doc.activeLayer = artLayer;
            return;
         }
        
         if(spec != null)
         {
            idLayer = getXMPData(artLayer, "idLayer");
            lyr = getLayerByID(idLayer);

            if(lyr != null)
                updateSpec(lyr, spec, idLayer, bullet, dupBullet, bounds);

            try
            {
                doc.activeLayer = artLayer;
            }
            catch(e)
            {}
            return;
         }
         else
         {
              if(bullet)
              {
                  try
                  {
                     number = getXMPData(artLayer, "number");
                     if(number == null)
                        number = -1;
                     bullet.parent.remove();
                  }
                  catch(e)
                  {}
              }
         }
     }

     try
    {
        doc.activeLayer = artLayer;
        noOfSpec = getXMPData(doc, "noOfSpec");
        try
        {
            doc.layerSets.getByName("Specctr").layerSets.getByName("Properties");
            if(noOfSpec == null)
                noOfSpec = 0;
        }
        catch(e)
        {
            noOfSpec = 0;
        }

        idLayer = getIDOfLayer();   //Get unique ID of selected layer.
        var artLayerBounds = bounds;
        var name = artLayer.name;

        var legendLayer;
        switch(sourceItem.kind)
        {
            case LayerKind.TEXT:
                infoText   = getSpecsInfoForTextItem(sourceItem);
                newColor = legendColorType();
                legendLayer = legendTextPropertiesLayer().layerSets.add();
                if(number === -1)
                {
                    noOfSpec = parseInt(noOfSpec) + 1;
                    number = noOfSpec;
                }
                legendLayer.name = "Text Spec "+number;
                var wordsArray = name.split(" ");
                if(wordsArray.length > 2)
                    name = wordsArray[0] + " " + wordsArray[1] + " " + wordsArray[2];
                break;
         
            case LayerKind.GRADIENTFILL:
            case LayerKind.SOLIDFILL: 
                infoText = getSpecsInfoForPathItem(sourceItem);
                legendLayer = legendObjectPropertiesLayer().layerSets.add();
                if(number === -1)
                {
                    noOfSpec = parseInt(noOfSpec)+1;
                    number = noOfSpec;
                }  
                legendLayer.name = "Object Spec "+number;
                break;

            default: 
                infoText = getSpecsInfoForGeneralItem(sourceItem); 
                legendLayer = legendObjectPropertiesLayer().layerSets.add();
                if(number === -1)
                {
                    noOfSpec = parseInt(noOfSpec) + 1;
                    number = noOfSpec;
                }  
                legendLayer.name = "Object Spec "+number;
        }

        if (infoText === "") 
            return;

        //Save the current preferences
        var startTypeUnits = app.preferences.typeUnits; 
        var startRulerUnits = app.preferences.rulerUnits;
        var originalDPI = doc.resolution;
        setPreferences(Units.PIXELS, TypeUnits.PIXELS, 72);
        
        var nameLength = name.length;
        infoText = "\r"+name+infoText;
        var spacing = 10;
        var isLeft, pos;
        var centerX = (artLayerBounds[0] + artLayerBounds[2]) / 2;             //Get the center of item.
        var font = model.legendFont;

        //Create spec text for art object.
        var spec = legendLayer.artLayers.add();
        spec.kind = LayerKind.TEXT;
        var specText = spec.textItem;
        specText.kind = TextType.POINTTEXT;
        specText.contents = infoText;
        applyBold(1, nameLength + 1);
        specText.color.rgb = newColor;
        specText.font = font;
        specText.size = model.legendFontSize;
        idSpec = getIDOfLayer ();
        spec.name = "Specs";
        
        var txt = createNumber(legendLayer, number, font);
        txt.name = "___Number";
        var dia = txt.bounds[3] - txt.bounds[1] + 12;
        
        legendLayer.visible = false;
        var circle = createCircle (artLayerBounds[1], artLayerBounds[0]-dia, artLayerBounds[1]+dia, artLayerBounds[0], newColor);
        circle.move(txt, ElementPlacement.PLACEAFTER);
        pos = [];
        pos[0] = (circle.bounds[0]+circle.bounds[2])/2.0-(txt.bounds[2]-txt.bounds[0])/2.0;
        pos[1] = (circle.bounds[1]+circle.bounds[3])/2.0-(txt.bounds[3]-txt.bounds[1])/2.0;
        txt.translate(pos[0]-txt.bounds[0], pos[1]-txt.bounds[1]);
        selectLayers(circle.name, txt.name);
        bullet = createSmartObject();
        bullet.name = "Bullet";
        idBullet = getIDOfLayer();
        dupBullet = bullet.duplicate(bullet, ElementPlacement.PLACEBEFORE);
        doc.activeLayer = dupBullet;
        idDupBullet = getIDOfLayer();

        //Calcutate the position of spec text item.
        if(centerX <=  doc.width/2.0)
        {
            specText.justification = Justification.LEFT;
            spec.translate(-(spec.bounds[0]-spacing-dia), artLayerBounds[1]-spec.bounds[1]);
            dupBullet.translate(spec.bounds[0]-dupBullet.bounds[0]-dia-1, spec.bounds[1]-dupBullet.bounds[1]-1);
            isLeft = true;
        }
        else
        {
            specText.justification = Justification.RIGHT;
            spec.translate(doc.width-spacing-spec.bounds[2]-dia, artLayerBounds[1]-spec.bounds[1]);
            dupBullet.translate(spec.bounds[2]-dupBullet.bounds[0]+1, spec.bounds[1]-dupBullet.bounds[1]-1);
            isLeft = false;
        }

        dupBullet.name = "Spec Bullet";
        spec.link(dupBullet);

        legendLayer.visible = true;
        bullet.visible = true;
        dupBullet.visible = true;
        spec.visible = true;

        if(cssText === "")
            cssText = name + " {\r" + infoText.toLowerCase() + "\r}";

        setXmpDataOfLayer(artLayer, idLayer, idSpec, idBullet, idDupBullet, number);
        setXmpDataOfLayer(spec, idLayer, idSpec, idBullet, idDupBullet, number);
        setXmpDataOfLayer(bullet, idLayer, idSpec, idBullet, idDupBullet, number);
        setXmpDataOfLayer(dupBullet, idLayer, idSpec, idBullet, idDupBullet, number);
        setXmpDataOfDoc(doc, noOfSpec);
        setXmpDataForSpec(spec, cssText, "css");
    }
    catch(e)
    {}

    doc.activeLayer = artLayer;
    setPreferences(startRulerUnits, startTypeUnits, originalDPI);
}

//Update the property spec of the layer whose spec is already present.
function updateSpec(lyr, spec, idLayer, bullet, dupBullet, bounds)
{
    // Save the current preferences
    var startTypeUnits = app.preferences.typeUnits;
    var startRulerUnits = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.PIXELS;
    
    var doc = app.activeDocument;
    var originalDPI = doc.resolution;
        
    var spacing = 10;
    var newColor = legendColorObject();
    var infoText, isBulletCreated;
    var font = model.legendFont;
    var artLayerBounds = bounds;
    var number, pos, idDupBullet, idBullet;

    try
    {
        switch(lyr.kind)
        {
            case LayerKind.TEXT:
                infoText   = getSpecsInfoForTextItem(lyr);
                newColor = legendColorType();
                break;

            case LayerKind.GRADIENTFILL:
            case LayerKind.SOLIDFILL: 
                infoText = getSpecsInfoForPathItem(lyr);
                break;

            default: 
                infoText = getSpecsInfoForGeneralItem(lyr); 
        }
    
        if(infoText == "") 
            return;
        
        var name = lyr.name;
        var nameLength = name.length;
        infoText = "\r"+name+infoText;
        app.preferences.typeUnits = TypeUnits.PIXELS;
        doc.resizeImage(null, null, 72, ResampleMethod.NONE);
        var legendLayer = spec.parent;
        var spcBounds = spec.bounds;
        var specX = spcBounds[0]/2 + spcBounds[2]/2;
        spec.remove();
        var centerX = artLayerBounds[0]/2 + artLayerBounds[2]/2;

        number = getXMPData(lyr, "number");
        if(bullet != null)
            bullet.remove();
        
        if(dupBullet != null)
            dupBullet.remove();
            
        spec = legendLayer.artLayers.add();
        spec.kind = LayerKind.TEXT;
        var specText = spec.textItem;
        specText.kind = TextType.POINTTEXT;
        specText.contents = infoText;
        applyBold(1, nameLength+1)
        specText.color.rgb = newColor;
        specText.font = font;
        specText.size = model.legendFontSize;

        idSpec = getIDOfLayer();
        spec.name = "Specs";

        var txt = createNumber(legendLayer, number, font);
        txt.name = "___Number";
        var dia = txt.bounds[3]-txt.bounds[1]+12;

        legendLayer.visible = false;
        var circle = createCircle(artLayerBounds[1], artLayerBounds[0]-dia, artLayerBounds[1]+dia, artLayerBounds[0], newColor);
        circle.move(txt, ElementPlacement.PLACEAFTER);
        pos = [];
        pos[0] = (circle.bounds[0]+circle.bounds[2])/2.0-(txt.bounds[2]-txt.bounds[0])/2.0;
        pos[1] = (circle.bounds[1]+circle.bounds[3])/2.0-(txt.bounds[3]-txt.bounds[1])/2.0;
        txt.translate(pos[0]-txt.bounds[0], pos[1]-txt.bounds[1]);
        selectLayers(circle.name, txt.name);
        bullet = createSmartObject();
        bullet.name = "Bullet";
        idBullet = getIDOfLayer();
        dupBullet = bullet.duplicate(bullet, ElementPlacement.PLACEBEFORE);
        dupBullet.name = "Spec Bullet";
        doc.activeLayer = dupBullet;
        idDupBullet = getIDOfLayer ();
        if(centerX >=  specX)
        {
            specText.justification = Justification.LEFT;
            spec.translate(spcBounds[0]-spec.bounds[0]+dia, spcBounds[1]-spec.bounds[1]);
            dupBullet.translate(spec.bounds[0]-dupBullet.bounds[0]-dia-1, spec.bounds[1]-dupBullet.bounds[1]-1);
        }
        else
        {
            specText.justification = Justification.RIGHT;
            spec.translate(spcBounds[0]-spec.bounds[0], spcBounds[1]-spec.bounds[1]);
            dupBullet.translate(spec.bounds[2]-dupBullet.bounds[0]+1, spec.bounds[1]-dupBullet.bounds[1]-1);
        }

        spec.link(dupBullet);
        spec.translate(spcBounds[0]-spec.bounds[0], spcBounds[1]-spec.bounds[1]);
        legendLayer.visible = true;
        bullet.visible = true;
        dupBullet.visible = true;
        spec.visible = true;

        var layerXMP = new XMPMeta(lyr.xmpMetadata.rawData);
        layerXMP.setArrayItem(XMPConst.NS_PHOTOSHOP, "idSpec", 1, idSpec.toString());
        layerXMP.setArrayItem(XMPConst.NS_PHOTOSHOP, "idBullet", 1, idBullet.toString());
        layerXMP.setArrayItem(XMPConst.NS_PHOTOSHOP, "idDupBullet", 1, idDupBullet.toString());
        layerXMP.setArrayItem(XMPConst.NS_PHOTOSHOP, "number", 1, number.toString());
        lyr.xmpMetadata.rawData = layerXMP.serialize();

        if(cssText == "")
        cssText = name + " {\r" + infoText.toLowerCase() + "\r}";

        // Set Xmp metadata for spec and bullet.
        setXmpDataOfLayer(dupBullet, idLayer, idSpec, idBullet, idDupBullet, number);
        setXmpDataOfLayer(bullet, idLayer, idSpec, idBullet, idDupBullet, number);
        setXmpDataOfLayer (spec, idLayer, idSpec, idBullet, idDupBullet, number);
        setXmpDataForSpec(spec, cssText, "css");
    }
    catch(e)
    {}
    
    doc.resizeImage(null, null, originalDPI, ResampleMethod.NONE);
    // Reset the application preferences
    app.preferences.typeUnits = startTypeUnits;
	app.preferences.rulerUnits = startRulerUnits;
}

//Suspend the history of creating coordinates spec of layers.
function createCoordinateSpecs()
{
    try
    {
        var sourceItem = getActiveLayer();
        if(sourceItem === null || !startUpCheckBeforeSpeccing(sourceItem))      //Check if layer is valid for speccing i.e. not an artlayer set or specced object.
            return;
        
        var pref = app.preferences;
        var startRulerUnits = pref.rulerUnits; 
        pref.rulerUnits = Units.PIXELS;
        var ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        var layer = executeActionGet(ref);
        if(layer.hasKey(stringIDToTypeID('layerEffects')) && layer.getBoolean(stringIDToTypeID('layerFXVisible')))
            var bounds = returnBounds(sourceItem);
        else
            bounds = sourceItem.bounds;

        pref.rulerUnits = startRulerUnits;
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
    
        var font = model.legendFont;
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
            
            if(model.relativeHeight != 0)
                relativeTop = model.relativeHeight;
            else
                relativeTop = orgnlCanvas[3];
                
            if(model.relativeWidth != 0)
                relativeLeft = model.relativeWidth;
            else
                relativeLeft = orgnlCanvas[2];

            left = Math.round(bounds[0]/relativeLeft*10000)/100 + "%";
            top = Math.round(bounds[1]/relativeTop*10000)/100 + "%";
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
            specText.position = [sourceItem.textItem.position[0]-spacing-model.armWeight/2, sourceItem.textItem.position[1]-spacing+model.armWeight];
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
            specText.position =[bounds[0]-spacing, bounds[1]-spacing];
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

//Create circle and apply color to that circle.
function createCircle(top,left, bottom, right, newColor)
{
    try
    {
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
    }
    catch(e)
    {
        return null;
    }
}

//Apply bold to the heading of the property spec.
function applyBold(from, to)
{
    try
    {
        var idTxtt = charIDToTypeID("Txtt");
        var idT = charIDToTypeID("T   ");
        var idTxLr = charIDToTypeID("TxLr");
        var idTxtS = charIDToTypeID( "TxtS" );
        
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putEnumerated( idTxLr, charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        desc.putReference(charIDToTypeID("null"), ref);
 
        var propertyDesc = new ActionDescriptor();
        var list = new ActionList();
        var styleDesc = new ActionDescriptor();
        styleDesc.putInteger(charIDToTypeID("From"), from);
        styleDesc.putInteger(idT, to);
        var boldDesc = new ActionDescriptor();
        boldDesc.putBoolean( stringIDToTypeID( "syntheticBold" ), true );
        styleDesc.putObject(idTxtS, idTxtS, boldDesc);
        list.putObject(idTxtt, styleDesc);
        propertyDesc.putList( idTxtt, list);
        desc.putObject(idT, idTxLr, propertyDesc);
        executeAction(charIDToTypeID( "setd" ), desc, DialogModes.NO);
    }
    catch(e)
    {
        alert(e);
    }
}

//Set the preferences of the document.
function setPreferences(rulerUnit, typeUnit, resolution)
{
    try
    {
        var pref = app.preferences;
        pref.rulerUnits = rulerUnit;
        pref.typeUnits = typeUnit;
        app.activeDocument.resizeImage(null, null, resolution, ResampleMethod.NONE);
    }
    catch(e)
    {}
}

//Store the current number of properties spec in the XMPMetadata of the document.
function setXmpDataOfDoc(doc, noOfSpec)
{
    var layerXMP;
	try
	{
		layerXMP = new XMPMeta(doc.xmpMetadata.rawData);			// get the object
	}
	catch(errMsg)
	{
		layerXMP = new XMPMeta();			// layer did not have metadata so create new
	}

	try
	{
        layerXMP.appendArrayItem(XMPConst.NS_PHOTOSHOP, "noOfSpec", null, XMPConst.PROP_IS_ARRAY, XMPConst.ARRAY_IS_ORDERED);
        layerXMP.insertArrayItem(XMPConst.NS_PHOTOSHOP, "noOfSpec", 1, noOfSpec.toString());

        doc.xmpMetadata.rawData = layerXMP.serialize();
    }
	catch(errMsg) 
	{}
}

//Set the XMPMetadata to the active layer.
function setXmpDataOfLayer(activeLayer, idLyr, idSpec,  idBullet, idDupBullet, number)
{
	var layerXMP;
	try
	{
		layerXMP = new XMPMeta(activeLayer.xmpMetadata.rawData);			// get the object
	}
	catch(errMsg)
	{
		layerXMP = new XMPMeta();			// layer did not have metadata so create new
	}

	try
	{
        layerXMP.appendArrayItem(XMPConst.NS_PHOTOSHOP, "idLayer", null, XMPConst.PROP_IS_ARRAY, XMPConst.ARRAY_IS_ORDERED);
        layerXMP.insertArrayItem(XMPConst.NS_PHOTOSHOP, "idLayer", 1, idLyr.toString());

        layerXMP.appendArrayItem(XMPConst.NS_PHOTOSHOP, "idSpec", null, XMPConst.PROP_IS_ARRAY, XMPConst.ARRAY_IS_ORDERED);
        layerXMP.insertArrayItem(XMPConst.NS_PHOTOSHOP, "idSpec", 1, idSpec.toString());

        layerXMP.appendArrayItem(XMPConst.NS_PHOTOSHOP, "idBullet", null, XMPConst.PROP_IS_ARRAY, XMPConst.ARRAY_IS_ORDERED);
        layerXMP.insertArrayItem(XMPConst.NS_PHOTOSHOP, "idBullet", 1, idBullet.toString());
        
        layerXMP.appendArrayItem(XMPConst.NS_PHOTOSHOP, "idDupBullet", null, XMPConst.PROP_IS_ARRAY, XMPConst.ARRAY_IS_ORDERED);
        layerXMP.insertArrayItem(XMPConst.NS_PHOTOSHOP, "idDupBullet", 1, idDupBullet.toString());
        
        layerXMP.appendArrayItem(XMPConst.NS_PHOTOSHOP, "number", null, XMPConst.PROP_IS_ARRAY, XMPConst.ARRAY_IS_ORDERED);
        layerXMP.insertArrayItem(XMPConst.NS_PHOTOSHOP, "number", 1, number.toString());
        
        activeLayer.xmpMetadata.rawData = layerXMP.serialize();
    }
	catch(e) 
	{}
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

//Set XMPMetadata for the layers on which spacing specs between two object applied.
function setXmpDataForSpacingSpec(activeLayer, value, specString, index)
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
        var noOfItemsInArray = layerXMP.countArrayItems(XMPConst.NS_PHOTOSHOP, specString);
        if(index)
        {
            layerXMP.setArrayItem(XMPConst.NS_PHOTOSHOP, specString, index, value.toString());
        }
        else
        {
            layerXMP.appendArrayItem(XMPConst.NS_PHOTOSHOP, specString, null, XMPConst.PROP_IS_ARRAY, XMPConst.ARRAY_IS_ORDERED);
            layerXMP.insertArrayItem(XMPConst.NS_PHOTOSHOP, specString, noOfItemsInArray - 1, value.toString());
        }
        
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

//Get spacing spec id (spec between two objects) of the layer if present.
function getXMPDataForSpacingSpec(activeLayer, layerId, specString)
{
    try
	{
       var layerXMP = new XMPMeta(activeLayer.xmpMetadata.rawData);
        var noOfItemsInXmpArray = layerXMP.countArrayItems(XMPConst.NS_PHOTOSHOP, specString);
        var specId = "", spec = "";
        
        for( var i = 0; i < noOfItemsInXmpArray; i++)
        {
            specId = layerXMP.getArrayItem(XMPConst.NS_PHOTOSHOP, specString, i + 1).toString();
            spec = getLayerByID(specId);
            if(spec)
            {
                var specXMP = new XMPMeta(spec.xmpMetadata.rawData);
                var firstLayerId = specXMP.getArrayItem(XMPConst.NS_PHOTOSHOP, "firstLayer", 1).toString();
                var secondLayerId = specXMP.getArrayItem(XMPConst.NS_PHOTOSHOP, "secondLayer", 1).toString();
                if(layerId == firstLayerId || layerId == secondLayerId)
                    return specId;
            }
        }
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

//Apply scaling to the given value.
function getScaledValue(value)
{
    var scaledValue = value;
    try
    {
        if(model.useScaleBy)        //Scaling option is checked or not.
        {
            var scaling = Number(model.scaleValue.substring(1));
        
            if(!scaling)
                scaling = 1;
        
            if(model.scaleValue.charAt(0) == '/')
                scaledValue = scaledValue / scaling;
            else
                scaledValue = scaledValue * scaling;
        }
    }
    catch(e)
    {
        scaledValue = value;
    }

    return scaledValue;
}

//Get spec info for general items.
function getSpecsInfoForGeneralItem(sourceItem)
{
    var infoText;
    cssText = "";
    
	if(sourceItem.kind == undefined)
	{
		infoText = "";
		return;
	}
    
    var infoText = sourceItem.kind.toString().replace ("LayerKind.", "");
    var pageItem = sourceItem;
    cssText = "." + pageItem.name.toLowerCase() + " {\r\t" + infoText.toLowerCase() + ";";

    try
	{
        if(model.textAlpha)
        {
            var opacityString = "\r\tOpacity: " + Math.round(pageItem.opacity) / 100;
            infoText += opacityString;
            cssText += opacityString.toLowerCase() + ";";
        }
    }
	catch(e)
	{}
     
    cssText += "\r}";
    return infoText;
}

//Getting info for shape object.
function getSpecsInfoForPathItem(pageItem)
{
    var pathItem = pageItem;
    var doc = app.activeDocument;
    var alpha = "";
    
    // Get the layer kind and color value of that layer.
	var infoText = "";
    cssText = "."+pathItem.name.toLowerCase()+" {";
    
    //Gives the opacity for the art layer,
	if(model.shapeAlpha)
        alpha = Math.round(pageItem.opacity)/100;
 
    try
    {
        if (model.shapeFill)
        {  
            var ref = new ActionReference();
            ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
            var desc = executeActionGet(ref).getList(charIDToTypeID("Adjs")).getObjectValue(0);
            doc.activeLayer = doc.layers[doc.layers.length-1];

            if(pathItem.kind == LayerKind.SOLIDFILL)
            {
                var colorDescriptor = desc.getObjectValue(stringIDToTypeID('color'));
                var solidColor = getColor(colorDescriptor);
                var color = colorAsString(solidColor);
                var swatchName = readFromRuntime(solidColor);
                if(swatchName !== undefined)
                    infoText +="\r" + swatchName;
                var cssColor = "";
                
                infoText += "\rBackground: ";
                if(alpha != "" && color.indexOf("(") >= 0)
                {
                    cssColor = convertColorIntoCss(color, alpha);
                    alpha = "";
                }
                else
                {
                    cssColor = color;
                }
            
                infoText += cssColor;
                cssText += "\r\tbackground: " + cssColor + ";";
            }
            else if(pathItem.kind == LayerKind.GRADIENTFILL)
            {
                var gradientValue = "";
                infoText += "\rBackground: ";
                gradientValue =  typeIDToStringID(desc.getEnumerationValue(charIDToTypeID("Type")))+" gradient ";
                desc = desc.getObjectValue(charIDToTypeID("Grad"));
                var colorList = desc.getList(charIDToTypeID("Clrs"));
                var count = colorList.count;                                                 //Number of color stops in gradient
                for( var c = 0; c < count; c++ )
                {
                    desc = colorList.getObjectValue(c);                                            // get color descriptor
                    gradientValue += colorAsString(getColor(desc.getObjectValue(stringIDToTypeID('color'))))+" ";
                }
                
                infoText += gradientValue;
                cssText += "\r\tbackground: " + gradientValue +";";
            }
        }
    }
    catch(e)
    {}

    try
    {
        doc.activeLayer = pageItem;
        if(model.shapeStroke)
        {
            var strokeVal = getStrokeValOfLayer(pageItem);
            if(strokeVal != "")
                infoText += strokeVal;
        }
        
        if(alpha != "")
        {
            infoText += "\rOpacity: "+alpha;
            cssText += "\r\topacity: "+alpha+";";
        }
    
        if(model.shapeEffects)          //Get the Effect values of the shape object.
        {
            var effectValue = getEffectsOfLayer();
            if(effectValue != "")
                infoText += effectValue;
                
             doc.activeLayer = pageItem;
        }
    
        if(model.shapeBorderRadius)         //Get the corner radius of the shape object.
        {
            doc.activeLayer = pageItem;
            var roundCornerValue = getRoundCornerValue();
            if(roundCornerValue != "")
            {
                infoText += "\r" + roundCornerValue;
                cssText += "\r\t" + roundCornerValue.toLowerCase() + ";";
            }
        }
    }
    catch(e)
    {}
    
    cssText += "\r}";
    doc.activeLayer = pageItem;
    return infoText;
}

//To get the bounds of layer.
function getBounds(artLayer)
{
    var desc, ref, list;
    try
    {
        app.activeDocument.activeLayer = artLayer;
        ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID( "Lyr " ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ));
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

        artLayer = createSmartObject();
    }
    catch(e)
    {}

    lyrBound = artLayer.bounds;
}

// Return bounds of the layer.
function returnBounds(artLayer)
{
    try
    {
        app.activeDocument.suspendHistory('Get Bounds','getBounds(artLayer)');     // get bounds of layer.
        executeAction(charIDToTypeID('undo'), undefined, DialogModes.NO);
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

//Get the drop shadow effect's properties values.
function getDropShadowFx(dropShadowDesc)
{
    var infoText = "";
    var alpha = dropShadowDesc.getUnitDoubleValue (stringIDToTypeID( 'opacity' ))/100;
    var color = colorAsString(getColor(dropShadowDesc.getObjectValue(stringIDToTypeID('color'))));
    if(color.indexOf("(") >= 0)
        infoText += convertColorIntoCss(color, alpha);
    else
        infoText += color+" alpha: "+alpha;
    
    return infoText;
}

//Get the inner shadow effect's properties values.
function getInnerShadowFx(innerShadowDesc)
{
    var infoText = "";
    var alpha = innerShadowDesc.getUnitDoubleValue (stringIDToTypeID( 'opacity' ))/100;
    var color = colorAsString(getColor(innerShadowDesc.getObjectValue(stringIDToTypeID('color'))));
    if(color.indexOf("(") >= 0)
        infoText += convertColorIntoCss(color, alpha);
    else
        infoText += color+" alpha: "+alpha;
    
    return infoText;
    //infoText += " Angle: "+innerShadowDesc.getUnitDoubleValue (stringIDToTypeID( 'localLightingAngle' ));
    //infoText += "\r Blur size: "+innerShadowDesc.getUnitDoubleValue (stringIDToTypeID( 'blur' ))+" px";
    //infoText += "\r Alpha: "+innerShadowDesc.getUnitDoubleValue (stringIDToTypeID( 'opacity' ))+"%";
    //infoText += "\r Mode: "+typeIDToStringID(innerShadowDesc.getEnumerationValue( stringIDToTypeID( 'mode' )));
    //infoText += "\r Distance: "+innerShadowDesc.getUnitDoubleValue (stringIDToTypeID( 'distance' ))+" px";
    //infoText += "\r Choke: "+innerShadowDesc.getUnitDoubleValue (stringIDToTypeID( 'chokeMatte' ))+"%";
    //infoText += "\r Noise: "+innerShadowDesc.getUnitDoubleValue (stringIDToTypeID( 'noise' ))+"%";
}

//Get the stroke effect's properties values.
function getStrokeFx(strokeDesc)
{
    var infoText = "";
    infoText += Math.round(strokeDesc.getUnitDoubleValue(stringIDToTypeID('size'))) + " px";
    infoText += ", "+colorAsString(getColor(strokeDesc.getObjectValue(stringIDToTypeID('color'))));
    
    return infoText;
}

//~ //Get the gradient effect's propeties values.
function getGradientFx(gradientDesc)
{
    var infoText = "";
    //infoText += " Angle: "+gradientDesc.getUnitDoubleValue (stringIDToTypeID( 'angle' ));
    //infoText += "\r Scale: "+gradientDesc.getUnitDoubleValue (stringIDToTypeID( 'scale' ))+"%";
    //infoText += "\r Alpha: "+gradientDesc.getUnitDoubleValue (stringIDToTypeID( 'opacity' ))+"%";
    //infoText += "\r Style: "+typeIDToStringID(gradientDesc.getEnumerationValue( stringIDToTypeID( 'type' )));
    
    var desc = gradientDesc.getObjectValue(stringIDToTypeID('gradient'));
    var colorsList = desc.getList(stringIDToTypeID('colors'));
    var count = colorsList.count;                                                 //Number of color stops in gradient
    for( var c = 0; c < count; c++ )
    {
        desc = colorsList.getObjectValue(c);                                            // get color descriptor
        infoText += "\r Color["+c+"]: "+colorAsString(getColor(desc.getObjectValue(stringIDToTypeID('color'))));
    }

    return infoText;
}

//Get the color overlay effect's properties values.
function getColorOverlayFx(overlayDesc)
{
    var infoText = "";
    infoText = typeIDToStringID(overlayDesc.getEnumerationValue( stringIDToTypeID( 'mode' )))+"/ ";
    var alpha = overlayDesc.getUnitDoubleValue (stringIDToTypeID( 'opacity' ))/100;
    var color = colorAsString(getColor(overlayDesc.getObjectValue(stringIDToTypeID('color'))));
    if(color.indexOf("(") >= 0)
        infoText += convertColorIntoCss(color, alpha);
    else
        infoText += color+" alpha: "+alpha;
    
    return infoText;
}

//Get color value according to document model
function getColor(colorDesc)
{
     var color = new SolidColor();
     switch(app.activeDocument.mode)
     {
         case DocumentMode.GRAYSCALE:
             color.gray.gray = colorDesc.getDouble(charIDToTypeID('Gry '));
             break;
         case DocumentMode.RGB:
             color.rgb.red = colorDesc.getDouble(charIDToTypeID('Rd  '));
             color.rgb.green = colorDesc.getDouble(charIDToTypeID('Grn '));
             color.rgb.blue = colorDesc.getDouble(charIDToTypeID('Bl  '));
             break;
         case DocumentMode.CMYK:
              color.cmyk.cyan = colorDesc.getDouble(charIDToTypeID('Cyn '));
              color.cmyk.magenta = colorDesc.getDouble(charIDToTypeID('Mgnt'));
              color.cmyk.yellow = colorDesc.getDouble(charIDToTypeID('Ylw '));
              color.cmyk.black = colorDesc.getDouble(charIDToTypeID('Blck'));
              break;
         case DocumentMode.LAB:
               color.lab.l = colorDesc.getDouble(charIDToTypeID('Lmnc'));
               color.lab.a = colorDesc.getDouble(charIDToTypeID('A   '));
               color.lab.b = colorDesc.getDouble(charIDToTypeID('B   '));
               break;
       }
      return color;
}

//Get the default color value.
function getDefaultColor()
{
    var newColor = new RGBColor();
    newColor.hexValue = "000000";
    return newColor;
}

//Get the properties of the text item.
function getSpecsInfoForTextItem(pageItem)
{
    var textItem = pageItem.textItem;
    var infoText = "", color="", mFactor = "";
    var alpha = "", leading = "", size = "", font = "";
    var kDefaultLeadVal = 120.0, kDefaultFontVal='MyriadPro-Regular', kDefaultFontSize= 12;
    var underline = "", strike = "", bold = "",  italic = "";
    var tracking = "", isAutoLeading="", rltvFontSize = 16;

    try
    {
        var sizeID = stringIDToTypeID("size");
        var transformID = stringIDToTypeID("transform");
        var yyID = stringIDToTypeID("yy");
        var fontPostScriptID = stringIDToTypeID("fontPostScriptName");
        var trackingID = stringIDToTypeID("tracking");
        var underlineID = stringIDToTypeID("underline");
        var strikethroughID = stringIDToTypeID("strikethrough");
        var syntheticBoldID = stringIDToTypeID("syntheticBold");
        var syntheticItalicID = stringIDToTypeID("syntheticItalic");
        var autoLeadingID = stringIDToTypeID("autoLeading");
        var colorID = stringIDToTypeID("color");

        var ref = new ActionReference();
        ref.putEnumerated( charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') ); 
        var desc = executeActionGet(ref).getObjectValue(stringIDToTypeID('textKey'));

        //Character Styles
        var textStyleRangeID = stringIDToTypeID("textStyleRange");
        var textStyleID = stringIDToTypeID("textStyle");
        var txtList = desc.getList(textStyleRangeID);
        var txtDesc = txtList.getObjectValue(0);
        if(txtDesc.hasKey(textStyleID)) 
        {
            var rangeList = desc.getList(textStyleRangeID);
            var styleDesc = rangeList.getObjectValue(0).getObjectValue(textStyleID);
            if(styleDesc.hasKey(sizeID))
            {
                size =  styleDesc.getDouble(sizeID);
                if(desc.hasKey(transformID))
                {
                    mFactor = desc.getObjectValue(transformID).getUnitDoubleValue (yyID);
                    size = (size* mFactor).toFixed(2).toString().replace(/0+$/g,'').replace(/\.$/,'');
                }
            }
            if(styleDesc.hasKey(fontPostScriptID))
                font =  styleDesc.getString(fontPostScriptID);
            if(styleDesc.hasKey(trackingID))
                tracking =  styleDesc.getString(trackingID);
            if(styleDesc.hasKey(underlineID))
                underline = typeIDToStringID(styleDesc.getEnumerationValue(underlineID));
            if(styleDesc.hasKey(strikethroughID))
                strike = typeIDToStringID(styleDesc.getEnumerationValue(strikethroughID));
            if(styleDesc.hasKey(syntheticBoldID))
                bold = styleDesc.getBoolean(syntheticBoldID);
            if(styleDesc.hasKey(syntheticItalicID))
                italic = styleDesc.getBoolean(syntheticItalicID);
            if(styleDesc.hasKey(autoLeadingID))
            {
                isAutoLeading = styleDesc.getBoolean(autoLeadingID);
                if(isAutoLeading == false)
                {
                     leading = styleDesc.getDouble(stringIDToTypeID("leading"));
                     if(desc.hasKey(transformID))
                     {
                         mFactor = desc.getObjectValue(transformID).getUnitDoubleValue (yyID);
                         leading = (leading* mFactor).toFixed(2).toString().replace(/0+$/g,'').replace(/\.$/,'');
                     }
                }
            }
             if(styleDesc.hasKey(colorID)) 
                color = getColor(styleDesc.getObjectValue(colorID));
        }

        //Paragraph styles.
        var paragraphStyleID = stringIDToTypeID("paragraphStyle");
        var defaultStyleID = stringIDToTypeID("defaultStyle");
        var paraList = desc.getList(stringIDToTypeID("paragraphStyleRange"));
        var paraDesc = paraList.getObjectValue(0);
        if (paraDesc.hasKey(paragraphStyleID)) 
        {
            var paraStyle = paraDesc.getObjectValue(paragraphStyleID);
            if(paraStyle.hasKey(defaultStyleID)) 
            {
                var defStyle = paraStyle.getObjectValue(defaultStyleID);
                if(font === "" && defStyle.hasKey(fontPostScriptID)) 
                    font = defStyle.getString(fontPostScriptID);
                if(size === " " && defStyle.hasKey(sizeID))
                {
                    size = defStyle.getDouble(sizeID);
                    if(desc.hasKey(transformID))
                    {
                        var mFactor = desc.getObjectValue(transformID).getUnitDoubleValue (yyID);
                        size = (size* mFactor).toFixed(2).toString().replace(/0+$/g,'').replace(/\.$/,'');
                    }
                }
                if(tracking === "" && defStyle.hasKey(trackingID))
                    tracking = defStyle.getInteger(trackingID);
                if(underline === "" && defStyle.hasKey(underlineID))
                    underline = typeIDToStringID(defStyle.getEnumerationValue(underlineID));
                if (strike === "" && defStyle.hasKey(strikethroughID))
                    strike = typeIDToStringID(defStyle.getEnumerationValue(strikethroughID));
                if (bold === "" && defStyle.hasKey(syntheticBoldID))
                    bold = defStyle.getBoolean(syntheticBoldID);
                if (italic === "" && defStyle.hasKey(syntheticItalicID))
                    italic = defStyle.getBoolean(syntheticItalicID);
                if (leading === "" && defStyle.hasKey(autoLeadingID))
                {
                    isAutoLeading = defStyle.getBoolean(autoLeadingID);
                    if(isAutoLeading == false)
                    {
                        leading = defStyle.getDouble(stringIDToTypeID("leading"));
                        if(desc.hasKey(transformID))
                        {
                            mFactor = desc.getObjectValue(transformID).getUnitDoubleValue(yyID);
                            leading = (leading* mFactor).toFixed(2).toString().replace(/0+$/g,'').replace(/\.$/,'');
                        }
                     }
                 }
                if (color === "" && defStyle.hasKey(colorID)) 
                    color = getColor(defStyle.getObjectValue(colorID));
            }
        }
    }
    catch(e)
    {
        alert(e);
    }

    //Get the opacity of the text layer.
    try
    {
        if(model.textAlpha)
            alpha = Math.round(pageItem.opacity)/100 ;

        var name = pageItem.name;
        var wordsArray = name.split(" ");
        if(wordsArray.length > 2)
            name = wordsArray[0] + " " + wordsArray[1] + " " + wordsArray[2];

        cssText = name.toLowerCase()+" {";

        //Get the text font and concat it in text info,
        if (model.textFont)
        {
            if(font == "")
                font = kDefaultFontVal;
                
            infoText += "\rFont-Family: " + font;
            cssText += "\r\tfont-family: " + font + ";";
        }

        //Get the font size.
        if (model.textSize)
        {
            if(size == "")
                size = kDefaultFontSize;
                
            var fontSize = "";
            
            //Calculate the font size in 'em' units.
            if(model.specInEM)
            {
                if(model.baseFontSize != 0)
                    rltvFontSize = model.baseFontSize;
                    
                if(getTypeUnits() == 'mm')
                {
                    rltvFontSize = pointsToUnitsString(rltvFontSize, Units.MM).toString().replace(' mm','');
                }
                
                fontSize = Math.round(size / rltvFontSize * 100) / 100 + " em";
            }
            else 
            {
                fontSize = Math.round(size * 100) / 100;
                fontSize = getScaledValue(fontSize) + " " + getTypeUnits();
            }

            infoText += "\rFont-Size: " + fontSize;
            cssText += "\r\tfont-size: " + fontSize + ";";
        }
    
        //Get the color of text.
        if (model.textColor)
        {
            if(color == "")
                color = getDefaultColor();
            
            color = colorAsString(color);
            if(alpha != "" && color.indexOf("(") >= 0)
            {
                color = convertColorIntoCss(color, alpha);
                alpha = "";
            }
            
             infoText += "\rColor: " + color;
             cssText += "\r\tcolor: "+ color.toLowerCase() + ";";
        }

        //Get the style of text.
        if (model.textStyle)
        {
            var styleString = "normal";
            
            if (bold == true) 
                styleString = "bold";

            if (italic == true) 
                styleString += "/ italic";

            infoText += "\rFont-Style: " + styleString;
            cssText += "\r\tfont-style: "+ styleString + ";";
            styleString = "";

            if (underline != "" && underline != "underlineOff" )
                styleString = "underline";

            if (strike != "" && strike != "strikethroughOff") 
            {
                if(styleString != "")
                    styleString += "/ ";
                    
                styleString += "strike-through";
            }
        
            if(styleString != "")
            {
                infoText += "\rText-Decoration: " + styleString;
                cssText += "\r\ttext-decoration: "+ styleString + ";";
            }
        }

        //Get the alignment of the text.
        try
        {
            if (model.textAlignment)
            {
                var s = textItem.justification.toString();
                s = s.substring(14,15).toLowerCase() + s.substring(15).toLowerCase();
                infoText += "\rText-Align: " + s;
                cssText += "\r\ttext-align: " + s + ";";
            }
        }
        catch(e)
        {
           var alignment = getAlignment();
           infoText += "\rText-Align: " + alignment;
           cssText += "\r\ttext-align: " + alignment + ";";
        }
   
        if (model.textLeading)
        {
            if(leading == "" || isAutoLeading == true)
                leading =  size / 100 * Math.round(kDefaultLeadVal);

            leading = leading.toString().replace("px", "");
            
            //Calculate the line height in 'em' units.
            if(model.specInEM)
            {
                var rltvLineHeight = "";
                
                if(model.baseLineHeight != 0)
                {
                    rltvLineHeight = model.baseLineHeight;
                }
                else
                {
                    rltvLineHeight = rltvFontSize * 1.4;
                }   
                
                 if(getTypeUnits() == 'mm')
                        rltvLineHeight = pointsToUnitsString(rltvLineHeight, Units.MM).toString().replace(' mm','');
                
                leading = Math.round(leading / rltvLineHeight * 100) / 100 + " em";
            }
            else 
            {   
                leading = Math.round(leading * 100) / 100 + " " + getTypeUnits();
            }
        
            infoText += "\rLine-Height: " + leading;
            cssText += "\r\tline-height: " + leading + ";";
        }

        if (model.textTracking)
        {
            var tracking = Math.round(tracking / 1000 * 100) / 100 + " em";
            infoText += "\rLetter-Spacing: " + tracking;
            cssText += "\r\tletter-spacing: " + tracking + ";";
        }
    
        if (alpha != "")
        {
            infoText += "\rOpacity: " + alpha;
            cssText += "\r\topacity: " + alpha + ";";
        }
    
        if (model.textEffects)
        {
            var strokeVal = getStrokeValOfLayer(pageItem);
            if(strokeVal != "")
                infoText += strokeVal;
                
            var effectValue = getEffectsOfLayer();
            if(effectValue != "")
                infoText += effectValue;
                
             doc.activeLayer = pageItem;
        }
    }
    catch(e)
    {}
    
    cssText += "\r}";
    
    if(model.specInEM)
        cssBodyText = "body {\r\tfont-size: " + Math.round(10000 / 16 * rltvFontSize) / 100 + "%;\r}\r\r";
    
    return infoText;
}

// Get the properties of the effects of active layer.
function getEffectsOfLayer()
{
    try
    {
        var infoText="";
        var doc = app.activeDocument;
        var ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        
        if(executeActionGet(ref).hasKey(stringIDToTypeID('layerEffects')))                  //Check Effect is applied on layer or not.
        {
            if(executeActionGet(ref).getBoolean(stringIDToTypeID('layerFXVisible')))    //Check Effect visibility is off or on.
            {
                var desc;
                var layerEffectDesc = executeActionGet(ref).getObjectValue(stringIDToTypeID('layerEffects'));
                doc.activeLayer = doc.layers[doc.layers.length-1];
                
                //Get Gradient values.
                if(layerEffectDesc.hasKey(stringIDToTypeID('gradientFill')))
                {
                    infoText += "\rGradient: ";
                    desc = layerEffectDesc.getObjectValue(stringIDToTypeID('gradientFill'));
                    if(desc.getBoolean(stringIDToTypeID('enabled')))
                        infoText += getGradientFx(desc);
                    else
                        infoText += " off";
                }
            
                //Get Color Overlay values
                if(layerEffectDesc.hasKey(stringIDToTypeID('solidFill')))
                {
                    desc = layerEffectDesc.getObjectValue(stringIDToTypeID('solidFill'));
                    if(desc.getBoolean(stringIDToTypeID('enabled')))
                        infoText += "\rColor-Overlay: " + getColorOverlayFx(desc);
                    else
                        infoText += "\rColor-Overlay: off";
                }
                
                //Get InnerShadow values
                if(layerEffectDesc.hasKey(stringIDToTypeID('innerShadow')))
                {
                    desc = layerEffectDesc.getObjectValue(stringIDToTypeID('innerShadow'));
                    if(desc.getBoolean(stringIDToTypeID('enabled')))
                        infoText += "\rBox-Shadow: "+"Inset "+ getInnerShadowFx(desc);
                    else
                        infoText += "\rInner-Shadow: off";
                }
            
                //Get DropShadow values
                if(layerEffectDesc.hasKey(stringIDToTypeID('dropShadow')))
                {
                    desc = layerEffectDesc.getObjectValue(stringIDToTypeID('dropShadow'));
                    if(desc.getBoolean(stringIDToTypeID('enabled')))
                       infoText += "\rBox-Shadow: " + getDropShadowFx(desc);
                    else
                       infoText += "\rDrop-Shadow: off";
                }
            }
            else
                infoText += "\rEffect: off";
        }
        else
            infoText += "\rEffect: none";
                
        return infoText;
    }
    catch(e)
    {
        alert(e);
        return "";
    }
    
}

//Return value of stroke of the active layer.
function getStrokeValOfLayer(pageItem)
{
    try
    {
        var infoText = "";
        var doc = app.activeDocument;
        var ref = new ActionReference();
        ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
        if(executeActionGet(ref).hasKey(stringIDToTypeID('layerEffects')))                  //Check Effect is applied on layer or not.
        {
            if(executeActionGet(ref).getBoolean(stringIDToTypeID('layerFXVisible')))    //Check Effect visibility is off or on.
            {
                var layerEffectDesc = executeActionGet(ref).getObjectValue(stringIDToTypeID('layerEffects'));
                doc.activeLayer = doc.layers[doc.layers.length-1];
                   
                if(layerEffectDesc.hasKey(stringIDToTypeID('frameFX')))                 //Check if stroke is applied or not.
                {
                    infoText += "\rBorder: ";
                    var desc = layerEffectDesc.getObjectValue(stringIDToTypeID('frameFX'));
                    if(desc.getBoolean(stringIDToTypeID('enabled')))
                        infoText += getStrokeFx(desc);
                    else
                        infoText += " off";
                }
                doc.activeLayer = pageItem;
            }
        }
        return infoText;
    }
    catch(e)
    {
        doc.activeLayer = pageItem;
        return "";
    }
}

//Get the round corner value of the shape object.
function getRoundCornerValue()
{
    try
    {
        var infoText = "Border-radius: ";
        var doc = app.activeDocument;
        var anchorPoints = [];
        var shape = doc.pathItems[0];
        var pathItem = shape.subPathItems[0];
        var points = pathItem.pathPoints;
        var point = "";
        
        if(points.length < 5)
            return infoText+"0";
        
        if(points.length != 8)
            return "";

        for (var k = 1; k < 3 ; k++)
        {
            point = points[k];
            anchorPoints[k] =  point.anchor[0];
        }
    
        infoText +=  Math.abs(parseInt(anchorPoints[2]) - parseInt(anchorPoints[1]));
    }
    catch(e)
    {
        infoText = "";
    }

    return infoText;
}

function readFromRuntime(color) 
{
    var file = new File("G:" + '\\' + "temp.aco");
    if (file.exists)
        file.remove();
    saveSwatches(file);
    var swatchName = readFromACOFile(file, color);
    file.remove();
    return swatchName;
}

function saveSwatches(fptr) {
  var desc = new ActionDescriptor();
  desc.putPath( charIDToTypeID('null'), fptr);
  var ref = new ActionReference();
  ref.putProperty(charIDToTypeID('Prpr'), charIDToTypeID('Clrs'));
  ref.putEnumerated(charIDToTypeID('capp'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
  desc.putReference(charIDToTypeID('T   '), ref);
  executeAction(charIDToTypeID('setd'), desc, DialogModes.NO);
};

function readFromACOFile(fptr, color) {
        var str = Stream.readStream(fptr);
        var swatchName = read(str, color);
        return swatchName;
};

function read(str, color) {
  var version = str.readInt16();
  var swatchName = '';
  if (version == 1) {
    var version1 = 1;
    var numberOfColors1 = str.readInt16();
    var count1 = 0;
    swatchName = readColors(str, numberOfColors1, false, color);
    if (str.eof())
      return;
    version = str.readInt16();
  }

  var version2 = 2;
  var numberOfColors2 = str.readInt16();
  var count2 = 0;
  swatchName = readColors(str, numberOfColors2, true, color);
  
  return swatchName;
}

function readColors(str, count, names, color) {
    var model = color.model;
    for (var i = 0; i < count; i++) {
    var cname;
    var cbytes = [];
    var ctype = str.readInt16();
    cbytes.push(str.readInt16());
    cbytes.push(str.readInt16());
    cbytes.push(str.readInt16());
    cbytes.push(str.readInt16());

    if (names) {
        try
        {
            cname = str.readUnicode();
            var swatchColor = setColor(cbytes, ctype);

            switch(model)
             {
                 case ColorModel.GRAYSCALE:
                    var scGray = Math.round(swatchColor.gray.gray);     //swatch color Gray
                    var ocGray = Math.round(color.gray.gray);               //object color Gray
                     if( Math.abs(ocGray - scGray) <= 1)
                        return cname;
                     break;
                 case ColorModel.RGB:
//~                  alert(cname + ": "+ swatchColor.rgb.red + "_" +  swatchColor.rgb.green + "_"+  swatchColor.rgb.blue +"\r"
//~                             + color.rgb.red + "_" + color.rgb.green +"_"+ color.rgb.blue);
                     var scRed = Math.round(swatchColor.rgb.red), ocRed = Math.round(color.rgb.red);
                     var scGreen = Math.round(swatchColor.rgb.green),  ocGreen = Math.round(color.rgb.green);
                     var scBlue = Math.round(swatchColor.rgb.blue), ocBlue = Math.round(color.rgb.blue);
                     if((Math.abs(ocRed - scRed) <= 1) && 
                        (Math.abs(ocGreen - scGreen) <= 1) && 
                        (Math.abs(ocBlue - scBlue) <= 1))
                            return cname;
                     break;
                 case ColorModel.CMYK:
//~                   alert(cname + ": "+ swatchColor.cmyk.cyan + "_" +  swatchColor.cmyk.magenta + "_"+  swatchColor.cmyk.yellow +"\r"
//~                             + color.cmyk.cyan + "_" + color.cmyk.magenta +"_"+ color.cmyk.yellow);
                     var scCyan = Math.round(swatchColor.cmyk.cyan), ocCyan = Math.round(color.cmyk.cyan);
                     var scMagenta = Math.round(swatchColor.cmyk.magenta), ocMagenta = Math.round(color.cmyk.magenta);
                     var scYellow = Math.round(swatchColor.cmyk.yellow), ocYellow = Math.round(color.cmyk.yellow);
                     var scBlack = Math.round(swatchColor.cmyk.black), ocBlack = Math.round(color.cmyk.black);
                     
                      if((Math.abs(ocCyan - scCyan) <= 1) && 
                      (Math.abs(ocMagenta - scMagenta) <= 1) && 
                      (Math.abs(ocYellow - scYellow) <= 1) && 
                      (Math.abs(ocBlack - scBlack) <= 1))
                        return cname;
                      break;
                 case ColorModel.LAB:
//~                      alert(cname + ": "+ swatchColor.lab.l + "_" +  swatchColor.lab.a + "_"+  swatchColor.lab.b +"\r"
//~                             + color.lab.l+ "_" + color.lab.a +"_"+ color.lab.b);
                        var scL = Math.round(swatchColor.lab.l), ocL = Math.round(color.lab.l);
                        var scA = Math.round(swatchColor.lab.a), ocA = Math.round(color.lab.a);
                        var scB = Math.round(swatchColor.lab.b), ocB = Math.round(color.lab.b);
                        if((Math.abs(ocL - scL) <= 1) && 
                        (Math.abs(ocA - scA) <= 1) && 
                        (Math.abs(ocB - scB) <= 1))
                            return cname;
               }
        }
        catch(e)
        {}
    }
  }
}

function setColor(cwords, ctype) {
  var color = new SolidColor();

  function cnvt256(v) {
    var rc = v/256.0;
    return (rc > 255.0) ? 255 : rc; // XXX this seems a bit odd (bug)
  }
  function cnvt100(v) {
    return 100.0 * v / 0xFFFF;
  }

  switch (ctype) {
    case 0:
      color.rgb.red   = cnvt256(cwords[0]);
      color.rgb.green = cnvt256(cwords[1]);
      color.rgb.blue  = cnvt256(cwords[2]);
      break;

    case 1:
      color.hsb.hue = 360 * cwords[0]/0xFFFF;
      color.hsb.saturation = cnvt100(cwords[1]);
      color.hsb.brightness  = cnvt100(cwords[2]);
      break;

    case 2:
      color.cmyk.cyan    = 100 - cnvt100(cwords[0]);
      color.cmyk.magenta = 100 - cnvt100(cwords[1]);
      color.cmyk.yellow  = 100 - cnvt100(cwords[2]);
      color.cmyk.black   = 100 - cnvt100(cwords[3]);
      break;

    case 7:
      cwords[0]  = cwords[0] / 100;

      if (cwords[1] & 0x8000) {
        cwords[1] = (cwords[1]-0xFFFF) / 100;
      } else {
        cwords[1] = cwords[1] / 100;
      }

      if (cwords[2] & 0x8000) {
        cwords[2] = (cwords[2]-0xFFFF) / 100;
      } else {
        cwords[2] = cwords[2] / 100;
      }

      color.lab.l = cwords[0];
      color.lab.a = cwords[1];
      color.lab.b = cwords[2];
      break;

    case 8:
      color.gray.gray = cwords[0] / 100;
      break;
  }

  return color;
}

//To get the type units of the application preferences.
function getTypeUnits()
{
     var units = app.preferences.typeUnits;
     var unitStr = "px";
     if(units == "TypeUnits.POINTS")
        unitStr = "pt";
     else if(units == "TypeUnits.MM")
        unitStr = "mm";
     
     return unitStr;
}

//Get the alignment of the text using paragraph styles.
function getAlignment()
{
    var kDefaultAlignVal = "left";
    try
    {
        var ref = new ActionReference();
        ref.putEnumerated( charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") ); 
        var layerDesc = executeActionGet(ref);
        var textDesc = layerDesc.getObjectValue(stringIDToTypeID('textKey'));
        var rangeList = textDesc.getList(stringIDToTypeID('paragraphStyleRange'));

        // there will be at least one range so just get the first range descriptor
        var styleDesc = rangeList.getObjectValue(0).getObjectValue(stringIDToTypeID('paragraphStyle'));
   
        if(styleDesc.hasKey(stringIDToTypeID("align")))
            return typeIDToStringID(styleDesc.getEnumerationValue(stringIDToTypeID("align")));
        else
        {
            return kDefaultAlignVal;
        }
    }
    catch(e)
    {
        return kDefaultAlignVal;
    }
}

//Get the color value of selected color model in UI.
function colorAsString(c)
{
	var result = "";
	var color = c;
  // alert( color.rgb.red + "_" +  color.rgb.green + "_"+  color.rgb.blue );
	var newColor;
	var colorType;
	var foreGroundColor = app.foregroundColor;
	var sourceSpace;
	var targetSpace;
	var colorComponents;

	switch(c.model)
	{
		case ColorModel.RGB: 
			sourceSpace = c.rgb;
			colorComponents = [sourceSpace.red, sourceSpace.green, sourceSpace.blue];
			break;

		case  ColorModel.CMYK: 
			sourceSpace = c.cmyk; 
			colorComponents = [sourceSpace.cyan, sourceSpace.magenta, sourceSpace.yellow, sourceSpace.black]; 
			break;

		case ColorModel.LAB: 
			sourceSpace = c.lab; 
			colorComponents = [sourceSpace.l, sourceSpace.a, sourceSpace.b]; 
			break;

		case ColorModel.GRAYSCALE:
			sourceSpace = c.gray;
			colorComponents = [sourceSpace.gray];
			break;
 	}
    
	if(sourceSpace != null)
	{
		app.foregroundColor = c;
		switch(model.legendColorMode)
		{
			case "LAB":
                  targetSpace = app.foregroundColor.lab;
				newColor = new LabColor(); 
				newColor.l = targetSpace.l; 
				newColor.a = targetSpace.a;
				newColor.b = targetSpace.b; 
				break;

			case "CMYK":
                  targetSpace = app.foregroundColor.cmyk; 
				newColor = new CMYKColor(); 
				newColor.cyan = targetSpace.cyan; 
				newColor.magenta = targetSpace.magenta;
				newColor.yellow = targetSpace.yellow;
				newColor.black = targetSpace.black;
				break;

			default:
                  targetSpace = app.foregroundColor.rgb;
				newColor = new RGBColor();
				newColor.red = targetSpace.red;
				newColor.green = targetSpace.green;
				newColor.blue = targetSpace.blue;
				break;
		}

		colorType = newColor;
	}

	switch(colorType.typename)
	{
		case "RGBColor":
			switch(model.legendColorMode)
			{
				case "HSB":
					result = rgbToHsv(colorType);
					break;

				case "HSL":
					result = rgbToHsl(colorType);
					break;

				case "RGB":
				default:
					if (model.useHexColor)
					{
						var red = Math.round(colorType.red).toString(16);
						if (red.length == 1)
							red = "0" + red;

						var green = Math.round(colorType.green).toString(16);
						if (green.length == 1) 
							green = "0" + green;

						var blue = Math.round(colorType.blue).toString(16);
						if (blue.length == 1) 
							blue = "0" + blue;

						result = "#" + red + green + blue;
					}
					else
						result = "rgb(" + Math.round(colorType.red) + ", " + Math.round(colorType.green) + ", " + Math.round(colorType.blue) + ")";
			}
			break;

			case "CMYKColor":
				result = "cmyk(" + Math.round(colorType.cyan) + ", " + Math.round(colorType.magenta) + ", " + Math.round(colorType.yellow) + ", " + Math.round(colorType.black) + ")";
				break;

			case "LabColor":
				result = "lab(" + Math.round(colorType.l) + ", " + Math.round(colorType.a) + ", " + Math.round(colorType.b) + ")";
				break;

			case "GrayColor":
				result = "gray(" + Math.round(colorType.gray) + ")";
				break;
	}

    app.foregroundColor = foreGroundColor;
	return result;
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
    newColor.hexValue = model.legendColorType.substring(1, 7);
    return newColor;
}
 
//Get the color to apply on the spacing specs.
function legendColorSpacing()
{
    var newColor = new RGBColor();
    newColor.hexValue = model.legendColorSpacing.substring(1, 7);
    return newColor;
}

//Get the color to apply on the properties specs of shape layer.
function legendColorObject()
{
    var newColor = new RGBColor();
    newColor.hexValue = model.legendColorObject.substring(1, 7);
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
        var bounds = [0, 0, app.activeDocument.width, app.activeDocument.height];
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
