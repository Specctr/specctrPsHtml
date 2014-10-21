
#include "stream.js"
if(typeof($)=== 'undefined')
	$={};

$.specctrPsSwatches = {
    readFromRuntime : function(color) {
        try {
            var path = doc.path;
        } catch(e) {
            path = "";
        }
        
        if(path)
            path = path + "/_specctr_temp.aco";
        else
            path = "~/desktop/_specctr_temp.aco";

        var file = new File(path);
        if (file.exists)
            file.remove();
        this.saveSwatches(file);
        var swatchName = this.readFromACOFile(file, color);
        file.remove();
        return swatchName;
    },

    saveSwatches : function(fptr) {
      var desc = new ActionDescriptor();
      desc.putPath( charIDToTypeID('null'), fptr);
      var ref = new ActionReference();
      ref.putProperty(charIDToTypeID('Prpr'), charIDToTypeID('Clrs'));
      ref.putEnumerated(charIDToTypeID('capp'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt'));
      desc.putReference(charIDToTypeID('T   '), ref);
      executeAction(charIDToTypeID('setd'), desc, DialogModes.NO);
    },

    readFromACOFile : function(fptr, color) {
        var str = Stream.readStream(fptr);
        try{
        var swatchName = this.read(str, color);}catch(e){alert(e);}
        return swatchName;
    },

    read : function(str, color) {
      var version = str.readInt16();
      var swatchName = '';
      if (version == 1) {
        var version1 = 1;
        var numberOfColors1 = str.readInt16();
        var count1 = 0;
        swatchName = this.readColors(str, numberOfColors1, false, color);
        if (str.eof())
          return;
        version = str.readInt16();
      }

      var version2 = 2;
      var numberOfColors2 = str.readInt16();
      var count2 = 0;
      swatchName = this.readColors(str, numberOfColors2, true, color);
      
      return swatchName;
    },

    readColors : function(str, count, names, color) {
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
            try {
                cname = str.readUnicode();
                var swatchColor = this.setColor(cbytes, ctype);

                switch(model) {
                     case ColorModel.GRAYSCALE:
                        var scGray = Math.round(swatchColor.gray.gray);     //swatch color Gray
                        var ocGray = Math.round(color.gray.gray);               //object color Gray
                         if( Math.abs(ocGray - scGray) <= 1)
                            return cname;
                         break;
                     case ColorModel.RGB:
                         var scRed = Math.round(swatchColor.rgb.red), ocRed = Math.round(color.rgb.red);
                         var scGreen = Math.round(swatchColor.rgb.green),  ocGreen = Math.round(color.rgb.green);
                         var scBlue = Math.round(swatchColor.rgb.blue), ocBlue = Math.round(color.rgb.blue);
                         if((Math.abs(ocRed - scRed) <= 1) && 
                            (Math.abs(ocGreen - scGreen) <= 1) && 
                            (Math.abs(ocBlue - scBlue) <= 1))
                                return cname;
                         break;
                     case ColorModel.CMYK:
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
                            var scL = Math.round(swatchColor.lab.l), ocL = Math.round(color.lab.l);
                            var scA = Math.round(swatchColor.lab.a), ocA = Math.round(color.lab.a);
                            var scB = Math.round(swatchColor.lab.b), ocB = Math.round(color.lab.b);
                            if((Math.abs(ocL - scL) <= 1) && 
                            (Math.abs(ocA - scA) <= 1) && 
                            (Math.abs(ocB - scB) <= 1))
                                return cname;
                   }
            } catch(e) {alert(e);}
        }
      }
    },

    setColor : function(cwords, ctype) {
      var color = new SolidColor();
      switch (ctype) {
        case 0:
          color.rgb.red   = this.mapInto256(cwords[0]);
          color.rgb.green = this.mapInto256(cwords[1]);
          color.rgb.blue  = this.mapInto256(cwords[2]);
          break;

        case 1:
          color.hsb.hue = 360 * cwords[0]/0xFFFF;
          color.hsb.saturation = this.mapInto100(cwords[1]);
          color.hsb.brightness  = this.mapInto100(cwords[2]);
          break;

        case 2:
          color.cmyk.cyan    = 100 - this.mapInto100(cwords[0]);
          color.cmyk.magenta = 100 - this.mapInto100(cwords[1]);
          color.cmyk.yellow  = 100 - this.mapInto100(cwords[2]);
          color.cmyk.black   = 100 - this.mapInto100(cwords[3]);
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
    },

  mapInto256 : function(value) {
    var rc = value/256.0;
    return (rc > 255.0) ? 255 : rc;
  },

  mapInto100 : function(value) {
    return 100.0 * value / 0xFFFF;
  }

};