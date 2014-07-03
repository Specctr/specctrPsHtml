specctrPsHtml/PsLiteHtml-2.0
============================

Specctr for Photoshop

Project Name: specctrPsHtml

Description: The objective of the project is to create a panel name "Specctr-Lite" in Photoshop. The panel consists four tabs,
- Main tab : It consist 6 buttons and one text box.
	- Shape / Text : Create property specs of the objects.
	- Width / Height : Create width/height specs of the objects.
	- Spacing : Disabled.
	- Coordinates : Disabled.
	- Export : Disabled.
	- Expand : Expand the background to 250 only.
	- Expand text box : Disabled.

- Option tab : It consist checkboxes to allow which property is to be shown in property specs. Only first three check boxes of text item is enabled.

- Responsive tab : Disabled.

- Setting tab : Only font combo-box is enabled, rest of them are disabled. 

Features of the Panel:
1. GLOBAL FEATURES
- Expand Canvas
- Specs organized in layers
- Multispec, spec multiple objects
- Line ends

2. MEASUREMENTS
- Width & height

3. SMART OBJECT
- Fill Color
- Effect Stroke color, size, style
- Opacity, filter 

4. TEXT
- Font family
- Size
- Color 

5. OPTIONS
- Font selection for specs.

6. Others
- Number system is used for Shape/Text property specs.
- Dimension specs can be created on user's selected position. (see dropdown feature of buttons)
 
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
- A menu item will appear in the Window>Extensions>Specctr-Lite. On clicking this menu-item, panel will appear. 

Tools and IDE used:
- Eclipese 3.6 or later.
- Extension Builder 3 (EB3)

Supported platforms:
- Photoshop version: Photoshop CC
- OS support: Mac and Win.

For more understanding of UI:
- http://www.specctr.com/products.php
- http://www.specctr.com