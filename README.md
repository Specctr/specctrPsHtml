Master Install Locations:
MAC:
WIN:

Log Locations:

MAC:
/Users/mityaWork/Library/Application Support/LocalStore/SpecctrPs-Pro.log
/Library/Application Support/LocalStore/SpecctrPs-Pro.log

WIN:



specctrHtml (Master)
================

Specctr for Photoshop, Illustrator and Indesign.

Project Name: specctrPsHtml

Description: The objective of the project is to create a panel name "Specctr-Pro" in Ps, Ai and Id. The panel consists some buttons, tabs, check boxes etc. and these are used to measure the width and height of the art object created in the canvas, to measure the spacing between two art objects and between the canvas edges and single art object. It also shows the properties of the art objects like shape, color, effects, border, inner shadow etc. And for text art object it shows text font family, font size, leading, styles etc.

Features of the Panel:
1. GLOBAL FEATURES
- Expand Canvas
- Specs organized in layers
- Multispec, spec multiple objects
- Line ends

2. MEASUREMENTS
- Width & height
- Spacing between object and canvas
- Spacing between multiple objects
- Spacing between text objects

3. SMART OBJECT
- Fill Color
- Swatch name.
- Effect Stroke color, size, style
- Opacity, filter 

4. TEXT
- Font family
- Size
- Color 
- Swatch name.
- Opacity, Filter
- Alignment, Leading, kerning

5. OPTIONS
- RGB/HEX/HSB/HSL/CMYK
- Specs style (font and color)
- Line weights
- Units set in global preferences
- Different color for spec Types 
- Different modes of calculating measurements
- Scaling specs (x2, x3, /2, /3 etc.)
- iOS option: RGB in %.
- Fraction/Decimal values.

6. Others
- Number system is used for Shape/Text property specs.
- Spacing, Dimension and Coordinate specs can be created on user's selected position. (see dropdown feature of buttons)
 
Importing steps:
- To build the project, We need Eclipse 3.6 or later version with Extension Builder 3.
- To import the project, Open Eclipse and click on File>Import.
- Import wizard will open. Select the "General>Existing Projects into Workspace" and click "Next" button at the bottom.
- There will be a "Select root directory" option browse for the project folder and click Finish.
- Project will be imported and ready to build.

How to Debug the project:
- Create a .debug file with format 
<?xml version="1.0" encoding="UTF-8"?> 
<ExtensionList>
    <Extension Id="">
        <HostList>
           <Host Name="PHXS" Port="8080"/> 
        </HostList>
    </Extension>
</ExtensionList>

- Place in Extension Manager folder and now debug the project.

Exporting steps:
- On exporting the project, the output of the file will be in the zxp format.
- To export the project, click on File>Export.
- Export wizard will open, create the certificate which will be in *.p12 format.
- Browse for the location and click finish. It will create the zxp at the browsed location.

Installing zxp steps:
- Clicking on the zxp will installed it via Extension Manager.
- A menu item will appear in the Window>Extensions>Specctr-Pro. On clicking this menu-item, panel will appear. 

Tools and IDE used:
- Eclipese 3.6 or later.
- Extension Builder 3 (EB3)

Supported platforms:
- Photoshop version: Ps (CC / CC_2014), Ai (CC / CC_2014) and Id (CC / CC_2014). 
- OS support: Mac and Win.

For more understanding of UI:
- http://www.specctr.com/products.php
- http://www.specctr.com

Note:
- Latest html version of specctrPs.
- This source code is used to make zxp for users.
