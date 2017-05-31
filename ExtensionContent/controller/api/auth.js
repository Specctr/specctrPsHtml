var semver = require('semver');

Specctr = Specctr || {};
Specctr.Auth = {
	/**
	 * Validate the license of the user and move to the tab container
	 *  if user's credentials valid.
	 */
	login: Specctr.Utility.tryCatchLog(function(ev) {
		
		$("#loginLabel").html("Logging in");
		$("#loggingGif").show();
		$("#loginHeaderDiv").show();
		$("#errorLoginDiv").hide();
		
		var urlRequest = getApi() + "/register_machine?";
		urlRequest += "&email=" + encodeURIComponent($("#loginEmail").val());
		urlRequest += "&password=" + encodeURIComponent($("#loginPassword").val());

		$.ajax({
			url:urlRequest,
			type: 'POST',
			contentType: "application/json",
			dataType: "json",
			success: function(response, textStatus, xhr) {
				pref.log(xhr.status + " - " + response.message);
				//$("#spinnerBlock").hide();

				// If unsuccessful, return without saving the data in file.
				if (response.success) {
					analytics.trackEvent('activation.succeeded');	
					var activationPrefs = Specctr.Activation = {
						licensed : true,
						machine_id: response.machine_id,
						api_key: response.api_key,
						email: response.user,
                        host: getHost()
					};
					
					//Set fresh api key and machine id.
					api_key = response.api_key;
					machine_id = response.machine_id;
					
					pref.addFileToPreferenceFolder('.license', JSON.stringify(activationPrefs)); //Create license file.

					$("#loginLabel").html("Log in");
					$("#loggingGif").hide();
					Specctr.Init.init();
				} else {
					analytics.trackEvent('activation.failed');	
					$("#loginLabel").html("Log in");
					$("#loggingGif").hide();
					$("#loginHeaderDiv").hide();
					$("#errorLoginDiv").show();
				}
			},
			error: function(xhr, status, error) {

				//$("#spinnerBlock").hide();
				var response = JSON.parse(xhr.responseText);
				
				if(response) {
					pref.log(xhr.status + " - " + response.message);
//					specctrDialog.showAlert(response.message);
				} else {
					pref.log(status + " - " + error);
//					specctrDialog.showAlert(error);
				}
				
				$("#loginLabel").html("Log in");
				$("#loggingGif").hide();
				$("#loginHeaderDiv").hide();
				$("#errorLoginDiv").show();
			}
		});
	}),
	
	/**
	 * Check subscription status.
	 */
	checkStatus: Specctr.Utility.tryCatchLog(function(activation) {
		var urlRequest = getApi() + "/subscriptions/status";

		$.ajax({
			url:urlRequest,
			type: 'GET',
			contentType: "application/json",
			dataType: "json",
			data: {
				api_key: activation.api_key,
				machine_id: activation.machine_id,
                version: activation.localVersion
			}
		}).done(Specctr.Utility.tryCatchLog(function(response, status, xhr){
			pref.log(xhr.status + " - " + "Status verified as active.");
			_.extend(activation, response);
			pref.addFileToPreferenceFolder('.license', JSON.stringify(activation));
			Specctr.Views.CloudTab.renderPlan(activation);
			Specctr.UI.enableAllTabs();

            version = activation.localVersion;
            var notify = function(newVersion){
                specctrDialog.showAlert("Please download and install the latest version: <span id='panel-download-link'>" + newVersion + "</span>.");
            };

            try{
                if (version && semver.lt(version, response.version)) {
                    notify(response.version);  
                } 
            }catch(e){ 
                notify(response.version);
            }

            var $downloadLink = $('#panel-download-link');
            $downloadLink.css({'textDecoration':'underline', 'cursor':'pointer'});
            $('.ui-widget button.ui-button').css('outline', 'none');
            $downloadLink.on('click', Specctr.Utility.tryCatchLog(function(ev) {
                pref.log("Opening download panel page in browser.");
                ev.preventDefault();
                ev.stopPropagation();
                
                new CSInterface().openURLInDefaultBrowser(SPECCTR_HOST + "/downloads/extension");
            }));
		})).fail(Specctr.Utility.tryCatchLog(function(xhr){
			
			if (xhr.status === 401) {
				pref.log(xhr.status + " - " + "Unauthorized ");
				// Load login container..		
				$("#tabContainer").hide();
				$("#loginContainer").show();
			} else {
				
				pref.log(xhr.status + " - " + "Inactive subscription.");
				var response = JSON.parse(xhr.responseText);
				_.extend(activation, response);
				pref.addFileToPreferenceFolder('.license', JSON.stringify(activation));
				Specctr.Views.CloudTab.renderPlan(activation);
				Specctr.UI.showTab(4);
				Specctr.UI.disableNonCloudTabs();
			}	
		}));
	}),
	
	/**
	 * Deactivate user's license.
	 */
	deActivate: Specctr.Utility.tryCatchLog(function() {
		//Set the first tab as last selected tab to avoid blank display issue after re-login.
		$("#tabHeader_1").click();
		
		// Load login container.
		$("#loginHeaderDiv").show();
		$("#errorLoginDiv").hide();
		$("#tabContainer").hide();
		$("#loginContainer").show();
		
		//Delete license file from preference folder.
		var licenseFilePath = pref.getFilePath('.license');
		pref.deleteFile(licenseFilePath);

		//refresh api keys.
		api_key = "";
	})
};

