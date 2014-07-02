/*//////////////////////////////////////////////////////////////////////////////
 * File Name: specctrPhotoshop.jsx
 * Description: This file includes all the functions which create specs i.e. property spec,
    width/height spec, spacing spec, coordinate spec and expand canvas feature.
//////////////////////////////////////////////////////////////////////////////*/

#include "json2.js"

var model;
var heightChoice = { "Left" : 1 , "Right" : 2, "Center" : 3 };
var widthChoice = { "Top" : 1 , "Bottom" : 2, "Center" : 3 };
var lyrBound;

ext_PHXS_setModel = setModel;
ext_PHXS_expandCanvas = createCanvasBorder;
ext_PHXS_createDimensionSpecs = createDimensionSpecsForItem;
ext_PHXS_createSpacingSpecs = createSpacingSpecs;
ext_PHXS_createPropertySpecs = createPropertySpecsForItem;
ext_PHXS_getFonts = getFontList;

//Get the application font's name and font's family.
function getFontList()
{
    var font = app.fonts;
    var appFontLength = font.length;
    var result = new Array();
    
	//Set the spec text properties.
	for (var i = 0; i < appFontLength; i++)
	{
        var currFont = font[i];
        if(currFont.style == "Regular")
        {
            var object = new Object();
            object.label = currFont.family;
            object.font = currFont.name;
            result.push(object);
        }
	}

    return JSON.stringify(result);
 }

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

//Get the list of selected layers.
function getSelectedLayers()
{
    var selectedLayers; 
    
    try
    {
        var doc = app.activeDocument;
        selectedLayers   = new Array();
        
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

//Expand the canvas.
function expandCanvas()
{
    if(!app.documents.length)           //Checking document is open or not.
        return;
    
    var doc = app.activeDocument;
    var activeLayer = doc.activeLayer;
    
    //Save and change the preferences of the document.
    var startRulerUnits = app.preferences.rulerUnits;
    var startTypeUnits = app.preferences.typeUnits;
    app.preferences.rulerUnits = Units.PIXELS;
    app.preferences.typeUnits = TypeUnits.PIXELS;
    
    var height = doc.height;
    var width = doc.width;
    
    var border = canvasBorder();       //Checking  whether border is created or not.
    doc.resizeCanvas(width+2*model.canvasExpandSize, height+2*model.canvasExpandSize, AnchorPosition.MIDDLECENTER);     // Expanding the canvas.
    
    if(border == null)
    {
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
        desc.putUnitDouble(charIDToTypeID("Top "), idPxl, model.canvasExpandSize);
        desc.putUnitDouble(charIDToTypeID("Left"), idPxl, model.canvasExpandSize);
        desc.putUnitDouble(charIDToTypeID("Btom"), idPxl, height+model.canvasExpandSize);
        desc.putUnitDouble(charIDToTypeID("Rght"), idPxl, width+model.canvasExpandSize);
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
 
    doc.activeLayer = activeLayer;
    //Reset the application preferences.
    app.preferences.rulerUnits = startRulerUnits;
    app.preferences.typeUnits = startTypeUnits;
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

        //Absolute distance.
        widthValue = pointsToUnitsString(lyrWidth, startRulerUnits);
        heightValue = pointsToUnitsString(lyrHeight, startRulerUnits);

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
    doc.activeLayer = artLayer;

    doc.resizeImage(null, null, originalDPI, ResampleMethod.NONE);
}

//Create text spec for horizontal distances for spacing specs between two objects.
function createHrzntlSpec(x1, x2, y1, y2, font, startRulerUnits, legendLayer)
{
    try
    {
        var hrzntlDstnc = Math.abs(x2-x1);
        var spacing = 10+model.armWeight;
        var newColor = legendColorSpacing();
        
        if(legendLayer == null)
        {
            legendLayer = legendSpacingLayer().layerSets.add();
            legendLayer.name = "Specctr Spacing Mark";
        }
    
        //Absolute distance.
        hrzntlDstnc = pointsToUnitsString(hrzntlDstnc, startRulerUnits);
        
        var hrzntSpacing = legendLayer.artLayers.add();
        hrzntSpacing.kind = LayerKind.TEXT;
        var specText = hrzntSpacing.textItem;
        specText.kind = TextType.POINTTEXT;
        specText.justification = Justification.CENTER; 
        specText.color.rgb = newColor;
        specText.font = font;
        specText.size = model.legendFontSize;
        specText.contents = hrzntlDstnc;
        specText.position = new Array((x1+x2)/2.0, y1-spacing*0.3-model.armWeight/2);
        
        var hrzntLine = createLine(x1, y1, x2, y2, newColor);
        setShape(x2+model.armWeight/2, y1+0.3*spacing, x2+model.armWeight/2, y2-0.3*spacing);    //horizontal left line.
        setShape(x1-model.armWeight/2, y1+0.3*spacing, x1-model.armWeight/2, y2-0.3*spacing);    //horizontal right line.
        
        selectLayers(hrzntSpacing.name, hrzntLine.name);
        var spec = createSmartObject();
        return spec;
    }
    catch(e)
    {}
}

//Create text spec for vertical distances for spacing specs between two objects.
function createVertSpec(x1, x2, y1, y2, font, startRulerUnits, legendLayer)
{
    try
    {
        var vrtclDstnc = Math.abs(y2-y1);
        var spacing = 10+model.armWeight;
        var newColor = legendColorSpacing();
        if(legendLayer == null)
        {
            legendLayer = legendSpacingLayer().layerSets.add();
            legendLayer.name = "Specctr Spacing Mark";
        }
        
        //Value after applying scaling.
        vrtclDstnc = pointsToUnitsString(vrtclDstnc, startRulerUnits);
            
        var spacingSpec = legendLayer.artLayers.add();
        spacingSpec.kind = LayerKind.TEXT;
        var specText = spacingSpec.textItem;
        specText.kind = TextType.POINTTEXT;
        specText.justification = Justification.RIGHT;
        specText.color.rgb = newColor;
        specText.font = font;
        specText.size = model.legendFontSize;
        specText.contents = vrtclDstnc;
        specText.position = new Array(x1-spacing*0.3-model.armWeight/2, (y1+y2)/2.0);
        
        var line = createLine(x1, y1, x2, y2, newColor);
        setShape(x1-0.3*spacing, y2+model.armWeight/2, x1+0.3*spacing, y2+model.armWeight/2);    //vertical top line.
        setShape(x2-0.3*spacing, y1-model.armWeight/2, x2+0.3*spacing, y1-model.armWeight/2);    //vertical bottom line.
        
         selectLayers(spacingSpec.name, line.name);
         var spec = createSmartObject();
         return spec;
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
        
        if(numberOfSelectedItems == 2)
        {
            //get selected art items.
            var artLayer1 = selectLayerByIndex(selectedArtItems[0]);
            var artLayer2 = selectLayerByIndex(selectedArtItems[1]);
            
            if(artLayer1.typename == "LayerSet" || artLayer2.typename == "LayerSet")
            {
                alert("Please select shape layers or text layers only.");
                return;
            }
        
            var bounds1 = returnBounds(artLayer1);
            var bounds2 = returnBounds(artLayer2);
            app.activeDocument.suspendHistory('Get Spacing Info', 'createSpacingSpecsForTwoItems(artLayer1, artLayer2, bounds1, bounds2)');
        }
        else if(numberOfSelectedItems == 1)
        {
            var artLayer = app.activeDocument.activeLayer;
            
            if(!startUpCheckBeforeSpeccing(artLayer))      //Check if layer is valid for speccing i.e. not an artlayer set or specced object.
                return;
            
            var bounds = returnBounds(artLayer);
            app.activeDocument.suspendHistory('Get Spacing Info', 'createSpacingSpecsForSingleItem(artLayer, bounds)');
        }
        else
        {
            alert("Please select one or two shape/text layer(s)!");
        }
    }
    catch(e)
    {}
}

//Create the spacing spec for two selected layers.
function createSpacingSpecsForTwoItems(artLayer1, artLayer2, bounds1, bounds2)
{
    var doc = app.activeDocument;
        
    //Save the current preferences
    var startRulerUnits = app.preferences.rulerUnits;
    var startTypeUnits = app.preferences.typeUnits;
    var originalDPI = doc.resolution;
    setPreferences(Units.PIXELS, TypeUnits.PIXELS, 72);
    
    var font = getFont();
    var isOverlapped = false;
    var legendLayer, spec;
    var vertSpecBottom = "", hrznSpecRight = "", vertSpecTop = "", hrznSpecLeft = "";
    var uniqueIdOfSpec = "";
    doc.activeLayer = artLayer1;
    
	// Check overlap
	if (bounds1[0]<bounds2[2] && bounds1[2]>bounds2[0] &&
		bounds1[3]>bounds2[1] && bounds1[1]<bounds2[3])
	{
		isOverlapped = true;
	}
    
    // Check if there's vertical perpendicular
	if (bounds1[0]<bounds2[2] && bounds1[2]>bounds2[0])
	{
        var x= Math.max(bounds1[0], bounds2[0])/2+Math.min(bounds1[2], bounds2[2])/2;
        var y1;
        var y2;
		
        if(!isOverlapped)
        {
            if(bounds1[1]<bounds2[1])
            {
                y1=bounds1[3];
                y2=bounds2[1]
            }
            else 
            {
                y1=bounds2[3];
                y2=bounds1[1];
            }

            var vertSpecNoOvrLapped = createVertSpec(x, x, y2, y1, font, startRulerUnits, legendLayer);
            vertSpecNoOvrLapped.name = "Spacing Spec";
        }
        else
        {
            //for top to top
            if(model.spaceTop)
            {
                if(bounds1[1]>bounds2[1])
                {
                    y1=bounds1[1];
                    y2=bounds2[1]
                }
                else 
                {
                    y1=bounds2[1];
                    y2=bounds1[1]
                }

                vertSpecTop = createVertSpec(x, x, y1, y2, font, startRulerUnits, legendLayer);
                legendLayer = vertSpecTop.parent;
            }
            
            //for bottom to bottom
            if(model.spaceBottom)
            {
                 if(bounds1[3]>bounds2[3])
                {
                    y1=bounds1[3];
                    y2=bounds2[3]
                }
                else 
                {
                    y1=bounds2[3];
                    y2=bounds1[3]
                }
                
                vertSpecBottom = createVertSpec(x, x, y1, y2, font, startRulerUnits, legendLayer);
                legendLayer = vertSpecBottom.parent;
            }
        }
    }
    
    // Check if there's horizontal perpendicular
	if (bounds1[3]>bounds2[1] && bounds1[1]<bounds2[3])
	{
        var y = Math.max(bounds1[1], bounds2[1])/2+Math.min(bounds1[3], bounds2[3])/2;
				
        var x1;
        var x2;
        
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
            
            var hrznSpecNoOvrlap = createHrzntlSpec(x1, x2, y, y, font, startRulerUnits, legendLayer);
            hrznSpecNoOvrlap.name = "Spacing Spec";
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
            
                hrznSpecLeft = createHrzntlSpec(x1, x2, y, y, font, startRulerUnits, legendLayer);
                legendLayer = hrznSpecLeft.parent;
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
                
                hrznSpecRight = createHrzntlSpec(x1, x2, y, y, font, startRulerUnits, legendLayer);
            }
        }
     }

   try
   {
        if(isOverlapped)
        {
            selectLayers(vertSpecTop.name, vertSpecBottom.name, hrznSpecLeft.name, hrznSpecRight.name);
            spec = createSmartObject();
            spec.name = "SpacingSpec";
        }
    }
    catch(e)
    {}
    
    selectLayers(artLayer1.name, artLayer2.name);
    setPreferences(startRulerUnits, startTypeUnits, originalDPI);      //Setting the original preferences of the document.
}

//Create the spacing spec for a selected layer.
function createSpacingSpecsForSingleItem(artLayer, bounds)
{
    //Save the current preferences
    var doc = app.activeDocument;
    var startRulerUnits = app.preferences.rulerUnits;
    var startTypeUnits = app.preferences.typeUnits;
    var originalDPI = doc.resolution;
    setPreferences(Units.PIXELS, TypeUnits.PIXELS, 72);

    var font = getFont();
    var newColor = legendColorSpacing();
    var height = bounds[3]-bounds[1];
    var width = bounds[2]-bounds[0];
    
    var spacing = 10+model.armWeight;
    var cnvsRect = originalCanvasSize();       //Get the original canvas size.
    
    var toTop = bounds[1]-cnvsRect[1];
	var toLeft = bounds[0]-cnvsRect[0];
    var toRight = cnvsRect[2]-bounds[2];
    var toBottom = cnvsRect[3]-bounds[3];
  
    //Absolute distance.
    toTop = pointsToUnitsString(toTop, startRulerUnits);
    toLeft = pointsToUnitsString(toLeft, startRulerUnits);
    toRight = pointsToUnitsString(toRight, startRulerUnits);
    toBottom = pointsToUnitsString(toBottom, startRulerUnits);
       
    var legendLayer = legendSpacingLayer().layerSets.add();
    legendLayer.name = "Specctr Spacing Mark";
    
    var lines = "", specText, topText = "", leftText = "", rightText = "", bottomText = "";
    
    if(model.spaceTop)
    {
        //Create the spec text for top.
        topText = legendLayer.artLayers.add();
        topText.kind = LayerKind.TEXT;
        specText = topText.textItem;
        specText.kind = TextType.POINTTEXT;
        specText.justification = Justification.RIGHT;
        specText.color.rgb = newColor;
        specText.font = font;
        specText.size = model.legendFontSize;
        specText.contents = toTop;
        specText.position = new Array(bounds[0]+width/2-spacing*0.3-model.armWeight/2, (bounds[1]+cnvsRect[1])/2.0);

        lines = createLine(bounds[0]+width/2, cnvsRect[1], bounds[0]+width/2, bounds[1], newColor);      //Main top line.
        setShape(bounds[0]+width/2-0.3*spacing, 
                                bounds[1]-model.armWeight/2, 
                                    bounds[0]+width/2+0.3*spacing, 
                                        bounds[1]-model.armWeight/2);                       //Top line's top.
        setShape(bounds[0]+width/2-0.3*spacing, 
                                cnvsRect[1]+model.armWeight/2, 
                                    bounds[0]+width/2+0.3*spacing, 
                                        cnvsRect[1]+model.armWeight/2);                     //Top line's bottom.
                                        
        selectLayers(topText.name, lines.name);
        topText = createSmartObject();
    }

    if(model.spaceLeft)
    {
        //Create the spec text for left.
        leftText = legendLayer.artLayers.add();
        leftText.kind = LayerKind.TEXT;
        specText = leftText.textItem;
        specText.kind = TextType.POINTTEXT;
        specText.justification = Justification.CENTER;
        specText.color.rgb = newColor;
        specText.font = font;
        specText.size = model.legendFontSize;
        specText.contents = toLeft;
        specText.position = new Array((bounds[0]+cnvsRect[0])/2.0, bounds[3]-height/2-spacing*0.3-model.armWeight/2);
                
        lines = createLine(cnvsRect[0], bounds[3]-height/2, bounds[0], bounds[3]-height/2, newColor);    //Main left line.
        setShape(bounds[0]-model.armWeight/2, 
                                bounds[3]-height/2+0.3*spacing, 
                                    bounds[0]-model.armWeight/2, 
                                        bounds[3]-height/2-0.3*spacing);                        //Left line's left.
        setShape(cnvsRect[0]+model.armWeight/2, 
                                bounds[3]-height/2+0.3*spacing, 
                                    cnvsRect[0]+model.armWeight/2, 
                                        bounds[3]-height/2-0.3*spacing);                        //Left line's right.
        
        selectLayers(leftText.name, lines.name);
        leftText = createSmartObject();
    }

    if(model.spaceRight)
    {
        //Create the spec text for right.
        rightText =  legendLayer.artLayers.add();
        rightText.kind = LayerKind.TEXT;
        specText = rightText.textItem;
        specText.kind = TextType.POINTTEXT;
        specText.justification = Justification.CENTER;
        specText.color.rgb = newColor;
        specText.font = font;
        specText.size = model.legendFontSize;
        specText.contents = toRight;
        specText.position = new Array((bounds[2]+cnvsRect[2])/2.0, bounds[3]-height/2-spacing*0.3-model.armWeight/2);
        
        lines = createLine(cnvsRect[2], bounds[3]-height/2, bounds[2], bounds[3]-height/2, newColor);    //Main Right line.
        setShape(bounds[2]+model.armWeight/2, 
                                bounds[3]-height/2+0.3*spacing, 
                                    bounds[2]+model.armWeight/2, 
                                        bounds[3]-height/2-0.3*spacing);                        //Right line's left.
        setShape(cnvsRect[2]-model.armWeight/2, 
                                bounds[3]-height/2+0.3*spacing, 
                                    cnvsRect[2]-model.armWeight/2, 
                                        bounds[3]-height/2-0.3*spacing);                        //Right line's right.
        
        selectLayers(rightText.name, lines.name);
        rightText = createSmartObject();
    }

    if(model.spaceBottom)
    {
        //Create the spec text for bottom.
        bottomText = legendLayer.artLayers.add();
        bottomText.kind = LayerKind.TEXT;
        specText = bottomText.textItem;
        specText.kind = TextType.POINTTEXT;
        specText.justification = Justification.RIGHT;
        specText.color.rgb = newColor;
        specText.font = font;
        specText.size = model.legendFontSize;
        specText.contents = toBottom;
        specText.position = new Array(bounds[0]+width/2-spacing*0.3-model.armWeight/2, (bounds[3]+cnvsRect[3])/2.0);
        
        lines = createLine(bounds[0]+width/2, cnvsRect[3], bounds[0]+width/2, bounds[3], newColor);        //Main bottom line.
        setShape(bounds[0]+width/2-0.3*spacing, 
                                bounds[3]+model.armWeight/2, 
                                    bounds[0]+width/2+0.3*spacing, 
                                        bounds[3]+model.armWeight/2);                           //Bottom line's left.
        setShape(bounds[0]+width/2-0.3*spacing, 
                                cnvsRect[3]-model.armWeight/2, 
                                    bounds[0]+width/2+0.3*spacing, 
                                        cnvsRect[3]-model.armWeight/2);                         //Bottom line's right.
        
        selectLayers(bottomText.name, lines.name);
        bottomText = createSmartObject();
    }
    
    //Converting selected layers into single smart object.
    selectLayers(topText.name, leftText.name, rightText.name, bottomText.name);
    var spec = createSmartObject();
    spec.name = "SpacingSpec";
    
    doc.activeLayer = artLayer;
    setPreferences(startRulerUnits, startTypeUnits, originalDPI);      //Setting the original preferences of the document.
}

//Create the number of spec.
function createNumber(legendLayer, number, font)
{
    try
    {
        //Color of the number over the circle.
        var txtColor = new RGBColor();
        txtColor.red = 255;
        txtColor.blue = 255;
        txtColor.green = 255;
        
        //Create the circle with number over it.
        var txt =  legendLayer.artLayers.add();
        txt.kind = LayerKind.TEXT;
        var specText = txt.textItem;
        specText.kind = TextType.POINTTEXT;
        specText.color.rgb = txtColor;
        specText.font = font;
        specText.size = model.legendFontSize;
        specText.contents = number;
        specText.fauxBold = true;
        return txt;
    }
    catch(e)
    { 
        return null;
    }
}

//Suspend the history of creating properties spec of layers.
function createPropertySpecsForItem()
{
    try
    {
        var sourceItem = getActiveLayer();
        var bounds = returnBounds(sourceItem);
        app.activeDocument.suspendHistory('Get Property Info', 'createPropertySpecs(sourceItem, bounds)');
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
    
	if(artLayer.typename == 'LayerSet')
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
            ExternalObject.AdobeXMPScript.unload();
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
            
            ExternalObject.AdobeXMPScript.unload();
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
           
            //remove metadata stored in activeLayer
            var layerXMP = new XMPMeta(artLayer.xmpMetadata.rawData );
            layerXMP.deleteProperty(XMPConst.NS_PHOTOSHOP, "idLayer");
            layerXMP.deleteProperty(XMPConst.NS_PHOTOSHOP, "idSpec");
            layerXMP.deleteProperty(XMPConst.NS_PHOTOSHOP, "idBullet");
            layerXMP.deleteProperty(XMPConst.NS_PHOTOSHOP, "idDupBullet");
            layerXMP.deleteProperty(XMPConst.NS_PHOTOSHOP, "number");
            artLayer.xmpMetadata.rawData = layerXMP.serialize();
         }
     }

	//Save the current preferences
    var startTypeUnits = app.preferences.typeUnits; 
	var startRulerUnits = app.preferences.rulerUnits;
	app.preferences.rulerUnits = Units.PIXELS;
	var originalDPI = doc.resolution;
        
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
        
        idLayer = getIDOfLayer();				                                    //Get unique ID of selected layer.
        var artLayerBounds = bounds;

        var legendLayer;
        switch(sourceItem.kind)
        {
            case LayerKind.TEXT:
                infoText   = getSpecsInfoForTextItem(sourceItem);
                newColor = legendColorType();
                legendLayer = legendTextPropertiesLayer().layerSets.add();
                if(number == -1)
                {
                    noOfSpec = parseInt(noOfSpec) + 1;
                    number = noOfSpec;
                }
                legendLayer.name = "Text Spec "+number;
                break;
         
            case LayerKind.GRADIENTFILL:
            case LayerKind.SOLIDFILL: 
                infoText = getSpecsInfoForPathItem(sourceItem);
                legendLayer = legendObjectPropertiesLayer().layerSets.add();
                if(number == -1)
                {
                    noOfSpec = parseInt(noOfSpec)+1;
                    number = noOfSpec;
                }  
                legendLayer.name = "Object Spec "+number;
                break;

            default: 
                infoText = getSpecsInfoForGeneralItem(sourceItem); 
                legendLayer = legendObjectPropertiesLayer().layerSets.add();
                if(number == -1)
                {
                    noOfSpec = parseInt(noOfSpec) + 1;
                    number = noOfSpec;
                }  
                legendLayer.name = "Object Spec "+number;
        }

        if (infoText == "") 
            return;
        
        var name = artLayer.name;
        var nameLength = name.length;
        infoText = "\r"+name+infoText;
        app.preferences.typeUnits = TypeUnits.PIXELS;
        doc.resizeImage(null, null, 72, ResampleMethod.NONE);
        var spacing = 10;
        var isLeft, pos;
        var centerX = artLayerBounds[0]/2 + artLayerBounds[2]/2;             //Get the center of item.
        var font = getFont();
        
        //Create spec text for art object.
        var spec = legendLayer.artLayers.add();
        spec.kind = LayerKind.TEXT;
        var specText = spec.textItem;
        specText.kind = TextType.POINTTEXT;
        specText.contents = infoText;
        applyBold(1, nameLength+1);
        specText.color.rgb = newColor;
        specText.font = font;
        specText.size = model.legendFontSize;
        idSpec = getIDOfLayer ();
        spec.name = "Specs";
        
        var txt = createNumber(legendLayer, number, font);
        txt.name = "___Number";
        var dia = txt.bounds[3]-txt.bounds[1]+12;
        
        legendLayer.visible = false;
        var circle = createCircle (artLayerBounds[1], artLayerBounds[0]-dia, artLayerBounds[1]+dia, artLayerBounds[0], newColor);
        circle.move(txt, ElementPlacement.PLACEAFTER);
        pos = new Array();
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
            
        setXmpDataOfLayer(artLayer, idLayer, idSpec, idBullet, idDupBullet, number);
        setXmpDataOfLayer(spec, idLayer, idSpec, idBullet, idDupBullet, number);
        setXmpDataOfLayer(bullet, idLayer, idSpec, idBullet, idDupBullet, number);
        setXmpDataOfLayer(dupBullet, idLayer, idSpec, idBullet, idDupBullet, number);
        setXmpDataOfDoc(doc, noOfSpec);
        
        ExternalObject.AdobeXMPScript.unload();
    }
    catch(e)
    {}
    
    doc.activeLayer = artLayer;
    doc.resizeImage(null, null, originalDPI, ResampleMethod.NONE);
    
	//Reset the application preferences
    app.preferences.rulerUnits = startRulerUnits;
    app.preferences.typeUnits = startTypeUnits;
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
    var font = getFont();
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
        pos = new Array();
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

        // Set Xmp metadata for spec and bullet.
        setXmpDataOfLayer(dupBullet, idLayer, idSpec, idBullet, idDupBullet, number);
        setXmpDataOfLayer(bullet, idLayer, idSpec, idBullet, idDupBullet, number);
        setXmpDataOfLayer (spec, idLayer, idSpec, idBullet, idDupBullet, number);
    }
    catch(e)
    {}
    
    doc.resizeImage(null, null, originalDPI, ResampleMethod.NONE);
    // Reset the application preferences
    app.preferences.typeUnits = startTypeUnits;
    app.preferences.rulerUnits = startRulerUnits;
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
        app.preferences.rulerUnits = rulerUnit;
        app.preferences.typeUnits = typeUnit;
        app.activeDocument.resizeImage(null, null, resolution, ResampleMethod.NONE);
    }
    catch(e)
    {
        alert(e);
    }
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

//Get spec info for general items.
function getSpecsInfoForGeneralItem(sourceItem)
{
    var infoText;
    
	if(sourceItem.kind == undefined)
	{
		infoText = "";
		return;
	}
    
    var infoText = sourceItem.kind.toString().replace ("LayerKind.", "");
    var pageItem = sourceItem;

    try
	{
        if(model.textAlpha)
        {
            var opacityString = "\r\tOpacity: " + Math.round(pageItem.opacity) / 100;
            infoText += opacityString;
        }
    }
	catch(e)
	{}
     
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
                var color = colorAsString(getColor(colorDescriptor));
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
        }
    
        if(model.shapeEffects)          //Get the Effect values of the shape object.
        {
            var effectValue = getEffectsOfLayer();
            if(effectValue != "")
                infoText += effectValue;
                
             doc.activeLayer = pageItem;
        }
    }
    catch(e)
    {}
    
    doc.activeLayer = pageItem;
    return infoText;
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
    var color = new SolidColor();
    color.rgb.red = 0;
    color.rgb.green = 0;
    color.rgb.blue = 0;
    return color;
}

//Get the properties of the text item.
function getSpecsInfoForTextItem(pageItem)
{
    var textItem = pageItem.textItem;
    var infoText = "", color="";
    var alpha = "", leading = "", size = "", font = "";
    var kDefaultLeadVal = 120.0, kDefaultFontVal='MyriadPro-Regular', kDefaultFontSize= 12;
    var underline = "", strike = "", bold = "",  italic = "";
    var tracking = "", isAutoLeading="", rltvFontSize = 16;

    try
    {
        var ref = new ActionReference();
        ref.putEnumerated( charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') ); 
        var desc = executeActionGet(ref).getObjectValue(stringIDToTypeID('textKey'));
        
        //Character Styles
        var txtList = desc.getList(stringIDToTypeID( "textStyleRange" ) );
        var txtDesc = txtList.getObjectValue( 0 );
        if(txtDesc.hasKey(stringIDToTypeID("textStyle"))) 
        {
            var rangeList = desc.getList(stringIDToTypeID('textStyleRange'));
            var styleDesc = rangeList.getObjectValue(0).getObjectValue(stringIDToTypeID('textStyle'));
            if(styleDesc.hasKey(stringIDToTypeID("size")))
            {
                size =  styleDesc.getDouble(stringIDToTypeID('size'));
                if(desc.hasKey(stringIDToTypeID('transform')))
                {
                    var mFactor = desc.getObjectValue(stringIDToTypeID('transform')).getUnitDoubleValue (stringIDToTypeID('yy') );
                    size = (size* mFactor).toFixed(2).toString().replace(/0+$/g,'').replace(/\.$/,'');
                }
            }
            if(styleDesc.hasKey(stringIDToTypeID("fontPostScriptName")))
                font =  styleDesc.getString(stringIDToTypeID('fontPostScriptName'));
            if(styleDesc.hasKey(stringIDToTypeID("tracking")))
                tracking =  styleDesc.getString(stringIDToTypeID('tracking'));
            if(styleDesc.hasKey(stringIDToTypeID("underline")))
                underline = typeIDToStringID(styleDesc.getEnumerationValue( stringIDToTypeID("underline") ));
            if(styleDesc.hasKey(stringIDToTypeID("strikethrough")))
                strike = typeIDToStringID(styleDesc.getEnumerationValue( stringIDToTypeID("strikethrough") ));
            if(styleDesc.hasKey(stringIDToTypeID("syntheticBold")))
                bold = styleDesc.getBoolean( stringIDToTypeID("syntheticBold") );
            if(styleDesc.hasKey(stringIDToTypeID("syntheticItalic")))
                italic = styleDesc.getBoolean( stringIDToTypeID("syntheticItalic"));
            if(styleDesc.hasKey(stringIDToTypeID("autoLeading")))
            {
                isAutoLeading = styleDesc.getBoolean(stringIDToTypeID("autoLeading"));
                if(isAutoLeading == false)
                {
                     leading = styleDesc.getDouble(stringIDToTypeID("leading"));
                     if(desc.hasKey(stringIDToTypeID('transform')))
                     {
                         var mFactor = desc.getObjectValue(stringIDToTypeID('transform')).getUnitDoubleValue (stringIDToTypeID('yy') );
                         leading = (leading* mFactor).toFixed(2).toString().replace(/0+$/g,'').replace(/\.$/,'');
                     }
                }
            }
             
             if(styleDesc.hasKey(stringIDToTypeID("color"))) 
                color = getColor(styleDesc.getObjectValue(stringIDToTypeID("color")));
        }
        
        //Paragraph styles.
        var paraList = desc.getList(stringIDToTypeID("paragraphStyleRange"));
        var paraDesc = paraList.getObjectValue( 0 );
        if (paraDesc.hasKey(stringIDToTypeID("paragraphStyle") ) ) 
        {
            var paraStyle = paraDesc.getObjectValue( stringIDToTypeID("paragraphStyle") );
            if(paraStyle.hasKey( stringIDToTypeID("defaultStyle") ) ) 
            {
                var defStyle = paraStyle.getObjectValue(stringIDToTypeID("defaultStyle") );
                if(font=="" && defStyle.hasKey(stringIDToTypeID("fontPostScriptName") ) ) 
                    font= defStyle.getString(stringIDToTypeID("fontPostScriptName") );
                if(size == "" && defStyle.hasKey(stringIDToTypeID("size") ) )
                {
                    size = defStyle.getDouble( stringIDToTypeID("size") );
                    if(desc.hasKey(stringIDToTypeID('transform')))
                    {
                        var mFactor = desc.getObjectValue(stringIDToTypeID('transform')).getUnitDoubleValue (stringIDToTypeID('yy') );
                        size = (size* mFactor).toFixed(2).toString().replace(/0+$/g,'').replace(/\.$/,'');
                    }
                }
                if(tracking == "" && defStyle.hasKey( stringIDToTypeID("tracking") ) )
                    tracking = defStyle.getInteger( stringIDToTypeID("tracking") );
                if(underline == "" && defStyle.hasKey( stringIDToTypeID("underline") ) )
                    underline = typeIDToStringID(defStyle.getEnumerationValue( stringIDToTypeID("underline") ));
                if (strike == "" && defStyle.hasKey( stringIDToTypeID("strikethrough") ) )
                    strike = typeIDToStringID(defStyle.getEnumerationValue( stringIDToTypeID("strikethrough")) );
                if (bold == "" && defStyle.hasKey( stringIDToTypeID("syntheticBold") ) )
                    bold = defStyle.getBoolean( stringIDToTypeID("syntheticBold"));
                if (italic == "" && defStyle.hasKey( stringIDToTypeID("syntheticItalic") ) )
                    italic = defStyle.getBoolean( stringIDToTypeID("syntheticItalic"));

                if (leading == "" && defStyle.hasKey( stringIDToTypeID("autoLeading") ) )
                {
                    isAutoLeading = defStyle.getBoolean( stringIDToTypeID("autoLeading"));
                    if(isAutoLeading == false)
                    {
                        leading = defStyle.getDouble( stringIDToTypeID("leading"));
                        if(desc.hasKey(stringIDToTypeID('transform')))
                        {
                            var mFactor = desc.getObjectValue(stringIDToTypeID('transform')).getUnitDoubleValue (stringIDToTypeID('yy') );
                            leading = (leading* mFactor).toFixed(2).toString().replace(/0+$/g,'').replace(/\.$/,'');
                        }
                     }

                 }
                
                if (color == "" && defStyle.hasKey(stringIDToTypeID("color"))) 
                    color = getColor(defStyle.getObjectValue(stringIDToTypeID("color")));
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

        //Get the text font and concat it in text info,
        if (model.textFont)
        {
            if(font == "")
                font = kDefaultFontVal;
                
            infoText += "\rFont-Family: " + font;
        }

        //Get the font size.
        if (model.textSize)
        {
            if(size == "")
                size = kDefaultFontSize;
                
            var fontSize = Math.round(size * 100) / 100 + " " + getTypeUnits();
            infoText += "\rFont-Size: " + fontSize;
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
            }
        }
        catch(e)
        {
           var alignment = getAlignment();
           infoText += "\rText-Align: " + alignment;
        }
   
        if (model.textLeading)
        {
            if(leading == "" || isAutoLeading == true)
                leading =  size / 100 * Math.round(kDefaultLeadVal);

            leading = leading.toString().replace("px", "");
            leading = Math.round(leading * 100) / 100 + " " + getTypeUnits();
            
            infoText += "\rLine-Height: " + leading;
        }

        if (model.textTracking)
        {
            var tracking = Math.round(tracking / 1000 * 100) / 100 + " em";
            infoText += "\rLetter-Spacing: " + tracking;
        }
    
        if (alpha != "")
        {
            infoText += "\rOpacity: " + alpha;
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
	return parseInt(value.substring(1, 3), 16);
}

//Get the green color value from the color hex value.
function gChannel(value) 
{
	return parseInt(value.substring(3, 5), 16);
}

//Get the blue color value from the color hex value.
function bChannel(value)
{
	return parseInt(value.substring(5, 7), 16);
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
