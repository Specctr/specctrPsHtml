/*//////////////////////////////////////////////////////////////////////////////
 * File Name: specctrPsCommon.jsx
 * Description: Includes all the common methods which is used in the creation of all other specs.
//////////////////////////////////////////////////////////////////////////////*/

if(typeof($)=== 'undefined')
	$={};
    
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

};

