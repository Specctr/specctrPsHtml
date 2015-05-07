var Views = Specctr.Views = Specctr.Views || {};

var CloudTab = Views.CloudTab = {};

CloudTab.renderTrial = function() {};

CloudTab.renderPlan = function(activation) {
	$('#userEmail').html(activation.email);
	$('#planName').html(activation.plan);
	
	var $profileLink = $('#user-profile_link');
	$profileLink.attr('href', activation.user_profile_url);
	$profileLink.on('click', function(ev) {
		ev.preventDefault();
		ev.stopPropagation();
		
		var url = $(ev.currentTarget).attr('href');
		new CSInterface.openURLInDefaultBrowser(url);
	});
};
