var Views = Specctr.Views = Specctr.Views || {};

var CloudTab = Views.CloudTab = {};

CloudTab.renderTrial = function() {};

var messageMap = {
	"subscription.active": function(activation){return "Active";},
	"subscription.trialing": function(activation){
		var date = new Date();
		var now = date.getTime() / 1000;
		var daysLeft = Math.ceil((activation.active_until - now)/(60*60*24));
		var daysLabel = "days";
		if (daysLeft === 1) daysLabel = "day";
		return "Trial (" + daysLeft + " " + daysLabel + " left)";
	},
	"subscription.inactive": function(){return "Inactive";},
	"subscription.none": function(){return "No subscription";},
};

CloudTab.renderPlan = function(activation) {
	$('#userEmail').html(activation.email);
	$('#planName').html(activation.plan);
	if (activation.success) {
		$('#planStatus').html(messageMap[activation.code](activation));
		$('#planStatus').removeClass('alert');

	}else{
		$('#planStatus').html(messageMap[activation.code]());
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
