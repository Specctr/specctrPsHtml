analytics = {};

analytics.trackFeature = function(feature) {
	license = license || 'legacy';
	var stat = 'specctr.extension.' + feature + '.clicked';
	//var stat = 'specctr.extension.html.' + getExtensionId() + '.' + licenseCode + '.' + feature + '.clicked';
	statsc.increment(stat);
};
