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
					Specctr.Init.init();
				} else {
					analytics.trackActivation('failed');
					specctrDialog.showAlert(response.message);
				}
			},
			error: function(xhr) {
				pref.log(xhr.status + " - " + response.message);
				var response = JSON.parse(xhr.responseText);
				specctrDialog.showAlert(response.message);
			}
		});
	}),
	
		
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
		}).done(function(response, status, xhr){
			pref.log(xhr.status + " - " + "Status verified as active.");
			_.extend(activation, response);
			pref.addFileToPreferenceFolder('.license', JSON.stringify(activation));
			Specctr.Views.CloudTab.renderPlan(activation);
		}).fail(function(xhr){
			pref.log(xhr.status + " - " + "Unable to verify active status.");
			Specctr.Views.CloudTab.renderPlan(activation);
			
		});
	})
};

