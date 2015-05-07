Specctr.Auth = {
	checkStatus: function(activation) {
		var urlRequest = SPECCTR_API + "/subscriptions/status";

		$.ajax({
			url:urlRequest,
			type: 'GET',
			contentType: "application/json",
			dataType: "json",
			data: {
				api_key: api_key,
				machine_id: machine_id
			}
		}).done(function(response){
			_.extend(activation, response);
			Specctr.Views.CloudTab.renderPlan(activation);
		}).fail(function(xhr){
			alert(xhr.status);
		});
	}		
};