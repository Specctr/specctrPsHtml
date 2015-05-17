var Views = Specctr.Views = Specctr.Views || {};

var CloudTab = Views.CloudTab = {};

CloudTab.renderTrial = function() {};

CloudTab.renderPlan = function(activation) {
	$('#userEmail').html(activation.email);
	$('#planName').html(activation.plan);
	
	var $profileLink = $('#user-profile-link');
	$profileLink.on('click', Specctr.Utility.tryCatchLog(function(ev) {
		pref.log("Opening profile in browser.");
		ev.preventDefault();
		ev.stopPropagation();
		
		new CSInterface().openURLInDefaultBrowser(activation.user_profile_url);
	}));
};
