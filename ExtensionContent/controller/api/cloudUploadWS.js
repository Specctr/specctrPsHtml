/*
File-Name: cloudUploadWS.js
Description: Consist all the ajax call methods for uploading css to servers.
 */

$(document).ready(function() {
    $("#uploadButton").removeClass("disabled");
    $("#uploadBtnLabel").html("Upload");
    $("#uploadingGif").hide();
});

Specctr.cloudAPI = {
	
	/**
	 * Get the project list from the server and populate it.
	 */
	getProjectList: Specctr.Utility.tryCatchLog(function(data, projectId) {
		
		$.ajax({
			url: getApi() + "/projects/list",
			type: "GET",
			contentType: "application/json;charset=utf-8",
			data:data,
			dataType: "json",
			success: function(response, xhr) {
				pref.log(JSON.stringify(response));
				$("#tabContainer").hide();
				$("#dvCloudContainer").show();

				var docProject = '';
				//Add data to table.
				var table = document.getElementById("projectTable");
				var projectLength = response.projects.length;
                // clear table before repopulating.
                $("#projectTable").html('');
				for(var i = 0; i < projectLength; i++)
					try {
						var project = response.projects[i];
						var itrName = project.name;
						var itrId = project.id;
							
						var row = table.insertRow(-1);
						var name = row.insertCell(0);
						name.innerHTML = itrName;
						name.setAttribute('value', itrId);
						
						if(projectId == itrId)
							docProject = name;
						
					} catch(e) {}
				
				$("#projectTable tr").on("click",function() {
						$(this).addClass('highlight').siblings().removeClass('highlight');
				});
				
				if(projectId) {
					$(docProject).trigger( "click" );
				} else {
					$("#projectTable tr").removeClass('highlight');
				}
			},
			error: function(xhr) {
				$("#uploadBtnLabel").html("Upload");
				$("#uploadingGif").hide();
				specctrDialog.showAlert('error');
				pref.logResError(xhr);
			}
		});
	}),
	
	/**
	 * Get the document Id and project Id from the server.
	 */
	getDocId: function(cssInfo, projectName) {
		var css = JSON.parse(cssInfo);
		var cssJson = CSSJSON.toJSON(css.text);
		
		var data = JSON.stringify({
			api_key: api_key,
			machine_id: machine_id,
			document_name: css.document_name,
			css_items: cssJson.children,
			project_name: projectName,
            application: hostApplication
		});

		$.ajax({
			url: getApi() + "/documents",
			type: "POST",
			contentType: "application/json;charset=utf-8",
			dataType: "json",
			data: data,
			success: function(response, xhr) {
				pref.log('Synced css for document: ' + JSON.stringify(response));
				Specctr.cloudAPI.uploadCss(cssInfo, response, true);
			},
			error: function(xhr) {
				$("#uploadBtnLabel").html("Upload");
				$("#uploadingGif").hide();
				specctrDialog.showAlert('error');
				pref.logResError(xhr);
			}
		});
		
	},

    /**
     * Remove text_content property from css and move up in nested json
     */
    moveTextContent: function(cssItems) {
        var moveAttributes = ['text_contents','xCoord','yCoord','layer_index','layer_id','layer_name','artboard_name','artboard_index','artboard_id','parent_layer_name','parent_layer_id','parent_layer_index'];
        _.each(cssItems, function(value, key) {
            _.each(moveAttributes, function(moveAttribute) {
                if (value.attributes && value.attributes[moveAttribute]) {
                    value[moveAttribute] = value.attributes[moveAttribute];
                    delete(value.attributes[moveAttribute]);
                }  
            });
        });
        return cssItems;
    },
	
	/**
	 * Upload the css to the server to specific document id and store the ids if not persisted.
	 */
	uploadCss: Specctr.Utility.tryCatchLog(function (cssInfo, response, bStoreIds) {
		var css = JSON.parse(cssInfo);
		var cssJson = CSSJSON.toJSON(css.text);
        cssJson.children = Specctr.cloudAPI.moveTextContent(cssJson.children);
         
        var docImageArr = css.document_images;
        console.log(cssInfo);
        
        //Get image base 64 data.
        var filePath = pref.getExportedFilePath();
        var arrSize = docImageArr.length;
        for (var i = 0; i < arrSize; i++) {
        	var path = filePath +"/"+docImageArr[i].name+"."+docImageArr[i].ext;
        	docImageArr[i].image_data = window.cep.fs.readFile(path, window.cep.encoding.Base64).data;
        	pref.deleteFile(path);
        }

        var timestamp = Math.floor(Date.now() / 1000);
       
		var data = JSON.stringify({
            timestamp: timestamp,
			api_key: api_key,
			machine_id: machine_id,
			document_name: css.document_name,
			document_images: docImageArr,
			css_items: cssJson.children,
			project_id: response.project_id,
            application: hostApplication
            
		});
		
		console.log(data);

		$.ajax({
			url: getApi() + "/documents/" + response.document_id,
			type: "PUT",
			contentType: "application/json;charset=utf-8",
			dataType: "json",
			data: data,
			success: function(response, xhr) {
			    //specctrDialog.showAlert('success');
			    pref.log('Synced css for document: ' + JSON.stringify(response));
				
				//If success store Ids to the selected project and document.
				if(bStoreIds) {
					//Get the selected project name 
					var selectedProjRef = $("#projectTable").find('.highlight').find('td:first');
					selectedProjRef.attr('value', response.project_id);
					evalScript("$.specctr" + hostApplication + "." + "setDocId('"+
							response.document_id+"','"+ response.project_id + "')", function (response) {
						//$("#spinnerBlock").hide();
						$("#uploadBtnLabel").html("Upload");
						$("#uploadingGif").hide();
						$("#dvCloudContainer").css("background-color","#009688");
						$("#cloudHeaderLabel").html("Success!");
						$("#attchToProjLabel").html("Your specs have been up-<br>loaded to Specctr Cloud");
						$("#mainUploadBlock").hide();
						$("#successUploadBlock").show();
					});
				} else {
					//$("#spinnerBlock").hide();
					$("#uploadBtnLabel").html("Upload");
					$("#uploadingGif").hide();
					$("#dvCloudContainer").css("background-color","#009688");
					$("#cloudHeaderLabel").html("Success!");
					$("#attchToProjLabel").html("Your specs have been up-<br>loaded to Specctr Cloud");
					$("#mainUploadBlock").hide();
					$("#successUploadBlock").show();
				}
			},
			error: function(xhr) {
				//$("#spinnerBlock").hide();
				$("#uploadBtnLabel").html("Upload");
				$("#uploadingGif").hide();
				specctrDialog.showAlert('error');
				pref.logResError(xhr);
			}
		});
	}),
};
