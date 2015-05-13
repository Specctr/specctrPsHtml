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
			success: function(response, status) {
				var logData = pref.createLogData(response.message);
				pref.addFileToPreferenceFolder('.log', logData);	//Create log file.		
				// If unsuccessful, return without saving the data in file.
				if (response.success) {
					analytics.trackActivation('succeeded');	
					var activationPrefs = Specctr.Activation = {
							licensed : true,
							machine_id: response.machine_id,
							api_key: response.api_key,
							email: response.email
					};
					pref.addFileToPreferenceFolder('.license', 
							JSON.stringify(activationPrefs)); //Create license file.
					pref.log('Logged in bro.');
					specctrInit.init();
				} else {
					analytics.trackActivation('failed');
					specctrDialog.showAlert(response.message);
				}
			},
			error: function(xhr) {
				var response = JSON.parse(xhr.responseText);
				specctrDialog.showAlert(response.message);
				pref.log(response.message);
			}
		});
	}),
	
		
	checkStatus: function(activation) {
		try{
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
			}).done(function(response){
				_.extend(activation, response);
				Specctr.Views.CloudTab.renderPlan(activation);
			}).fail(function(xhr){
				alert(xhr.status);
			});
		}catch(e){
			console.log(e + "\n" + e.stack);
		}
	}
};

/**
 * Callback function which is called when validation of user's license take place.
 * @param response {object} The object of the response came from the activation request.
 * @param status {string} The status of the activation request.
 */
function loginSuccessHandler(response, status) {
	
}

