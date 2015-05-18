var Views = Specctr.Views = Specctr.Views || {};

var CloudTab = Views.CloudTab = {};

CloudTab.renderTrial = function() {};

var messageMap = {
	"subscription.active": "Active",
	"subscription.inactive": "Inactive",
	"subscription.none": "No subscription",
};

CloudTab.renderPlan = function(activation) {
	$('#userEmail').html(activation.email);
	$('#planName').html(activation.plan);
	if (activation.success) {
		$('#planStatus').html(messageMap[activation.code]);
		$('#planStatus').removeClass('alert');

	}else{
		$('#planStatus').html(messageMap[activation.code]);
		$('#planStatus').addClass('alert');

	}	
	
	var $profileLink = $('#user-profile-link');
	$profileLink.on('click', Specctr.Utility.tryCatchLog(function(ev) {
		pref.log("Opening profile in browser.");
		ev.preventDefault();
		ev.stopPropagation();
		
		new CSInterface().openURLInDefaultBrowser(activation.user_profile_url);
	}));
};
