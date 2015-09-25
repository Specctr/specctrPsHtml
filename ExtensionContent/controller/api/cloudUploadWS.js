/**
 * 
 */

Specctr = Specctr || {};
Specctr.cloudAPI = {
	getProjectList: Specctr.Utility.tryCatchLog(function(data) {
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
				
				//Add data to table.
				var table = document.getElementById("projectTable");
				for(var i = 0; i < response.projects.length; i++) {
					try {
						
						//Check if project name already exist in table.
						if($("#projectTable tr:contains('"+response.projects[i].name+"')").length > 0)
							continue;
						
						var row = table.insertRow(-1);
						var name = row.insertCell(0);
						name.innerHTML = response.projects[i].name;
						name.setAttribute('value', response.projects[i].id);
					} catch(e) {
						alert(e);
					}
				}
				
				$("#projectTable tr").on("click",function() {
					try {
						$(this).addClass('highlight').siblings().removeClass('highlight');
					} catch(e) {
						alert(e);
					}
				});
				
			},
			error: function(xhr) {
				specctrDialog.showAlert('error');
				pref.logResError(xhr);
			}
		});
	}),
		
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
		alert("getDocId");
		$.ajax({
			url: SPECCTR_API + "/documents",
			type: "POST",
			contentType: "application/json;charset=utf-8",
			dataType: "json",
			data: data,
			success: function(response, xhr) {
				alert(JSON.stringify(response) + ":getDocId");
				pref.log('Synced css for document: ' + JSON.stringify(response));
				Specctr.cloudAPI.uploadCss(cssInfo, response, true);
			},
			error: function(xhr) {
				specctrDialog.showAlert('error');
				pref.logResError(xhr);
			}
		});
		
	},
	
	uploadCss: Specctr.Utility.tryCatchLog(function (cssInfo, response, bStoreIds) {
		var css = JSON.parse(cssInfo);
		var cssJson = CSSJSON.toJSON(css.text);
		alert('uploadcss: ' + response.document_id);
		
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
				alert("upload Css success " + bStoreIds);
				specctrDialog.showAlert('success');
				pref.log('Synced css for document: ' + JSON.stringify(response));
				
				//If success store Ids to the selected project and document.
				if(bStoreIds) {
					//Get the selected project name 
					var selectedProjRef = $("#projectTable").find('.highlight').find('td:first');
					selectedProjRef.attr('value', response.project_id);
					evalScript("$.specctr" + hostApplication + "." + "setDocId('"+response.document_id+"')");
				}
				

			},
			error: function(xhr) {
				specctrDialog.showAlert('error');
				pref.logResError(xhr);
			}
		});
	}),
};