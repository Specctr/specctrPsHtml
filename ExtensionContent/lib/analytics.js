var extId = window.__adobe_cep__.getExtensionId();
var namespace = 'specctr.extension.';

analytics = {};

analytics.trackFeature = function(feature) {
	try {
		var stat = namespace + feature + '.clicked';

		statsc.increment(stat);
		//var hash = CryptoJS.SHA1(licenseCode);
		var hash = licenseCode;
	
	    if (hash !== 'legacy') {
	        var stat = namespace + extId + '.' + hash + '.' + feature + '.clicked';
	        statsc.increment(stat);
	    }
	}catch(e){
		console.log(e);
	};
};

analytics.trackActivation = function(action) {
	try {
		var stat = namespace + 'activation.' + action;
	    statsc.increment(stat);
	}catch(e){
		console.log(e);
	}
};

analytics.trackError = function() {
	try {
		var stat = namespace + error + '.' + licenseCode + '.returned';
		statsc.increment(stat);
	}catch(e) {
		console.log(e);
	};
};
