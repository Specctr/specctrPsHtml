Specctr = Specctr || {};
Specctr.Auth = {
	/**
	 * Validate the license of the user and move to the tab container
	 *  if user's credentials valid.
	 */
	login: Specctr.Utility.tryCatchLog(function(ev) {
		var urlRequest = SPECCTR_API + "/register_machine?";
		urlRequest += "&email=" + $("#loginEmail").val();
		urlRequest += "&password=" + $("#loginPassword").val();

		$.ajax({
			url:urlRequest,
			type: 'POST',
			contentType: "application/json",
			dataType: "json",
			success: function(response, textStatus, xhr) {
				pref.log(xhr.status + " - " + response.message);
				// If unsuccessful, return without saving the data in file.
				if (response.success) {
					analytics.trackActivation('succeeded');	
					var activationPrefs = Specctr.Activation = {
						licensed : true,
						machine_id: response.machine_id,
						api_key: response.api_key,
						email: response.user	
					};
					pref.addFileToPreferenceFolder('.license', 
						JSON.stringify(activationPrefs)); //Create license file.
					
					$("#loginFooterLabel").click();
					Specctr.Init.init();
				} else {
					analytics.trackActivation('failed');
					specctrDialog.showAlert(response.message);
				}
			},
			error: function(xhr, status, error) {
				var response = '';
				try {
					response = JSON.parse(xhr.responseText);
				} catch(e) {}
				
				if(response) {
					pref.log(xhr.status + " - " + response.message);
					specctrDialog.showAlert(response.message);
				} else {
					pref.log(status + " - " + error);
					specctrDialog.showAlert(error);
				}
				
			}
		});
	}),
	
	/**
	 * Check subscription status.
	 */
	checkStatus: Specctr.Utility.tryCatchLog(function(activation) {
		var urlRequest = SPECCTR_API + "/subscriptions/status";

		$.ajax({
			url:urlRequest,
			type: 'GET',
			contentType: "application/json",
			dataType: "json",
			data: {
				api_key: activation.api_key,
				machine_id: activation.machine_id
			}
		}).done(Specctr.Utility.tryCatchLog(function(response, status, xhr){
			pref.log(xhr.status + " - " + "Status verified as active.");
			_.extend(activation, response);
			pref.addFileToPreferenceFolder('.license', JSON.stringify(activation));
			Specctr.Views.CloudTab.renderPlan(activation);
			Specctr.UI.enableAllTabs();
		})).fail(Specctr.Utility.tryCatchLog(function(xhr){
			if (xhr.status === 401) {
				pref.log(xhr.status + " - " + "Unauthorized ");
				// Load login container..		
				$("#tabContainer").hide();
				$("#loginContainer").show();
			}
			else {
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
		$("#tabContainer").hide();
		$("#loginContainer").show();
		
		//Delete license file from preference folder.
		var licenseFilePath = pref.getFilePath('.license');
		pref.deleteFile(licenseFilePath);
	})
};

