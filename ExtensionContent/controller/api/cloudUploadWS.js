/*
File-Name: cloudUploadWS.js
Description: Consist all the ajax call methods for uploading css to servers.
 */

Specctr = Specctr || {};
Specctr.cloudAPI = {
	
	/**
	 * Get the project list from the server and populate it.
	 */
	getProjectList: Specctr.Utility.tryCatchLog(function(data, projectId) {
		$.ajax({
			url: SPECCTR_API + "/projects/list",
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
				for(var i = 0; i < response.projects.length; i++) {
					try {
						
						//Check if project name already exist in table.
						if($("#projectTable tr:contains('"+response.projects[i].name+"')").length > 0) {
							if(projectId == response.projects[i].id)
								docProject = $("#projectTable tr:contains('"+response.projects[i].name+"')");
							continue;
						}
						
						var row = table.insertRow(-1);
						var name = row.insertCell(0);
						name.innerHTML = response.projects[i].name;
						name.setAttribute('value', response.projects[i].id);
						
						if(projectId == response.projects[i].id)
							docProject = name;
						
					} catch(e) {}
				}
				
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
		});

		$.ajax({
			url: SPECCTR_API + "/documents",
			type: "POST",
			contentType: "application/json;charset=utf-8",
			dataType: "json",
			data: data,
			success: function(response, xhr) {
				pref.log('Synced css for document: ' + JSON.stringify(response));
				Specctr.cloudAPI.uploadCss(cssInfo, response, true);
			},
			error: function(xhr) {
				specctrDialog.showAlert('error');
				pref.logResError(xhr);
			}
		});
		
	},
	
	/**
	 * Upload the css to the server to specific document id and store the ids if not persisted.
	 */
	uploadCss: Specctr.Utility.tryCatchLog(function (cssInfo, response, bStoreIds) {
		var css = JSON.parse(cssInfo);
		var cssJson = CSSJSON.toJSON(css.text);

		var data = JSON.stringify({
			api_key: api_key,
			machine_id: machine_id,
			document_name: css.document_name,
			css_items: cssJson.children,
			project_id: response.project_id,
		});

		$.ajax({
			url: SPECCTR_API + "/documents/" + response.document_id,
			type: "PUT",
			contentType: "application/json;charset=utf-8",
			dataType: "json",
			data: data,
			success: function(response, xhr) {
				specctrDialog.showAlert('success');
				pref.log('Synced css for document: ' + JSON.stringify(response));
				
				//If success store Ids to the selected project and document.
				if(bStoreIds) {
					//Get the selected project name 
					var selectedProjRef = $("#projectTable").find('.highlight').find('td:first');
					selectedProjRef.attr('value', response.project_id);
					evalScript("$.specctr" + hostApplication + "." + "setDocId('"+
							response.document_id+"','"+ response.project_id + "')", function (response) {
						$("#dvCloudContainer").hide();
						$("#tabContainer").show();
					});
				} else {
					$("#dvCloudContainer").hide();
					$("#tabContainer").show();
				}

			},
			error: function(xhr) {
				specctrDialog.showAlert('error');
				pref.logResError(xhr);
			}
		});
	}),
};