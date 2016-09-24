/*
File-Name: cloudUploadWS.js
Description: Consist all the ajax call methods for uploading css to servers.
 */

if (Specctr.Utility.getHostApp() == "Ps") {
    var WebSocket = require('ws');
    var Q =  require('q');
    var wsConnect;
    var wsDef = Q.defer();
    var ws;
    var connErrorLogged = false;

    var seekingConnect = setInterval(Specctr.Utility.tryCatchLog(function() {
        if (!connErrorLogged) logger.info("[cloudUploadWS] Attempting to connect via WebSockets.");

        ws = new WebSocket('ws://127.0.0.1:63421');// + Specctr.Generator.PORT);
        ws.on('error', function(err) {
            if (!connErrorLogged) {
                console.log(err);
				logger.error(err);
                connErrorLogged = true;
            }
        });
        ws.on('open', function() {
            logger.info("[cloudUploadWS] WebSockets open.");
            wsDef.resolve();
            clearInterval(seekingConnect);
        });
    
        wsConnect = wsDef.promise;
        wsConnect.done(function() {
            $("#uploadButton").removeClass("disabled");
            $("#uploadBtnLabel").html("Upload");
            $("#uploadingGif").hide();
        });
    }), 2000);
}else{
    $(document).ready(function() {
        $("#uploadButton").removeClass("disabled");
        $("#uploadBtnLabel").html("Upload");
        $("#uploadingGif").hide();
    });
}

Specctr.cloudAPI = {
	
	/**
	 * Get the project list from the server and populate it.
	 */
	getProjectList: Specctr.Utility.tryCatchLog(function(data, projectId) {
		
	//	$("#spinnerBlock").show();
		
		$.ajax({
			url: getApi() + "/projects/list",
			type: "GET",
			contentType: "application/json;charset=utf-8",
			data:data,
			dataType: "json",
			success: function(response, xhr) {
				pref.log(JSON.stringify(response));
		//		$("#spinnerBlock").hide();
				$("#tabContainer").hide();
				$("#dvCloudContainer").show();

				var docProject = '';
				//Add data to table.
				var table = document.getElementById("projectTable");
				var projectLength = response.projects.length;
				for(var i = 0; i < projectLength; i++)
					try {
						var project = response.projects[i];
						var itrName = project.name;
						var itrId = project.id;
						
						//Check if project name already exist in table.
						if($("#projectTable tr:contains('"+itrName+"')").length > 0) {
							if(projectId == itrId)
								docProject = $("#projectTable tr:contains('"+itrName+"')");
							continue;
						}
						
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
				//$("#spinnerBlock").hide();
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
		
//		$("#spinnerBlock").show();
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
	//			$("#spinnerBlock").hide();
				Specctr.cloudAPI.uploadCss(cssInfo, response, true);
			},
			error: function(xhr) {
				//$("#spinnerBlock").hide();
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

        //$("#spinnerBlock").show();
        var timestamp = Math.floor(Date.now() / 1000);

		var data = JSON.stringify({
            timestamp: timestamp,
			api_key: api_key,
			machine_id: machine_id,
			document_name: css.document_name,
			css_items: cssJson.children,
			project_id: response.project_id,
            application: hostApplication
		});

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

                if (hostApplication == "Ps") {
                    wsConnect.done(function() {
                        var params = {
                            message: 'specctr_upload',
                            timestamp: timestamp, 
                            api_key: api_key,
                            machine_id: machine_id,
                            document_id: response.document_id,
                            project_id: response.project_id,
                            host: getHost()
                        };
                        ws.send(JSON.stringify(params));

                        _.each(cssJson.children, function(cssSpec, name) {
                            if (cssSpec.layer_index && cssSpec.layer_id) {
                                ws.send(JSON.stringify(_.extend(params, {
                                    message: 'specctr_upload_layer',
                                    layer_id: cssSpec.layer_id,
                                    layer_index: cssSpec.layer_index
                                })));
                            }
                        });
                    });
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
