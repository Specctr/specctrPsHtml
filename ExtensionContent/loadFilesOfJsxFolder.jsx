/*//////////////////////////////////////////////////////////////////////////////
 * File Name: loadFilesOfJsxFolder.jsx
 * Description: This file include the functions to load the js/jsx files in the jsx folder path.
//////////////////////////////////////////////////////////////////////////////*/

if(typeof($)=='undefined')
	$={};

$._ext = {
    
    //Evaluate a file and catch the exception.
    evalFile : function(path) {
        try {
            $.evalFile(path);
        } catch (e) {
            alert("Exception:" + e);
        }
    },

    // Evaluate all the files in the given folder 
    evalFiles : function(jsxFolderPath, hostApp) {
        var folder = new Folder(jsxFolderPath);
        if (folder.exists) {
            var jsxFiles = folder.getFiles("*.jsx");
            for (var i = 0; i < jsxFiles.length; i++) {
                var jsxFile = jsxFiles[i];
                if(hostApp == "Id" ) { 
                    if(jsxFile.name.indexOf("Indesign") > 0) {
                        $._ext.evalFile(jsxFile);
                        break;
                    }
                } else if (hostApp == "Ai") {
                    if(jsxFile.name.indexOf("Illustrator") > 0) {
                        $._ext.evalFile(jsxFile);
                        break;
                    }
                } else {
                    if(jsxFile.name.indexOf("Ps") > 0 || jsxFile.name.indexOf("Photoshop") > 0) {
                        $._ext.evalFile(jsxFile);
                    }
                }
            }
        }
        return true;
    }
};
