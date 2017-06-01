/*//////////////////////////////////////////////////////////////////////////////
 * File Name: specctrPsCommon.jsx
 * Description: Includes all the common methods which is used in the creation of all other specs.
//////////////////////////////////////////////////////////////////////////////*/

if(typeof($)=== 'undefined')
	$={};

String.prototype.replaceAll = function(search, replacement) {
    return this.replace(new RegExp(search, 'g'), replacement);
};

String.prototype.trim = function () {
    return this.replace(/^\s+/, '').replace(/\s+$/, '');
};

$.specctrUtility = {
    //Get the updated value of UI's component from html file.
    breakStringAtLength : function (str, index) {
        try {
            if(!str || index <= 0)
                return str;
            
            var temp = "";
            for(i = index; i < str.length; i += index) {
                temp += str.substring(i-index, i);        
                temp += "\r";
            }

            temp += str.substring(i-index, str.length);
        
        } catch (e) {temp = str;}
        
        return temp;
    },

    getFormattedCss : function (orgnlCss) {
        try {
            var css = orgnlCss.replaceAll("\n","");
            var cssStr = "";

            //Replace all yCoord and xCoord into top and left respectively.
            css = css.replaceAll("yCoord:", "top:");
            css= css.replaceAll("xCoord:", "left:");
            
            //Split the css based on '{' and '}'.
            var cssParts = css.split(/[{}]+/);
            var nCssElements = cssParts.length;

            //Add newline after each json element, exclude non-css elements.
            for (var i = 0; i < nCssElements; i+=2) 
                try {
                    var cssItems = cssParts[i+1].split(";");
                    var arrLen = cssItems.length; 
                    cssStr += cssParts[i] + "{\n";

                    for (var j = 0; j < arrLen; j++) 
                        try {
                            var fStr = cssItems[j].substring(0, cssItems[j].indexOf(":"));
                            var sStr = cssItems[j].substring(cssItems[j].indexOf(":") + 1).trim();
                        
                            if(fStr && sStr != 'undefined' && !(fStr.search("artboard_") > -1 || fStr.search("layer_") > -1 || fStr.search("text_") > -1)) 
                                cssStr += "    " + fStr + ": " + sStr + ";\n";
                        } catch (e) {}
                    
                    cssStr += "}\n";
                } catch (e) {}

        } catch (e) {
            cssStr = orgnlCss;
        }
        
        if(!cssStr)
            cssStr = orgnlCss;
            
        return cssStr;
    },
};

