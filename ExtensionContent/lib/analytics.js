var net = require('net');

var extId = window.__adobe_cep__.getExtensionId();
var namespace = 'specctr.extension';
var HG_KEY = 'c9070102-3a4f-4fb1-8c6b-542159440c4a';

analytics = {};

analytics.send = function(stat, value) {
    var socket = net.createConnection(2003, "https://61bdfcd3.carbon.hostedgraphite.com", function() {
        socket.write(HG_KEY + "." + stat + " " + value + "\n");
        socket.end();
    });
};

analytics.prefix = function() {
    var csi = new CSInterface();

    var os;
    if (csi.getOSInformation().indexOf("Windows") > -1) {
        os = "windows" 
    }else if (csi.getOSInformation().indexOf("Mac") > -1) {
        os = "osx"
    }else{
        os = "unknown"
    }

    var email;
    if (Specctr && Specctr.Activation && Specctr.Activation.email) {
        email = Specctr.Activation.email.replace("@","_at_");
    }else{
        email = "no_email";
    }

    var version;
    if (Specctr && Specctr.Version) {
        version = Specctr.Version.replace(/\./g, "_");
    }else{
        version = "no_version";
    }
    
    return namespace + '.' + version + '.' + os + '.' + hostApplication + '.' + extId + '.' + email;
};

analytics.trackFeature = function(feature) {
	try {
	    var stat = this.prefix() + '.' + feature + '.count';
		this.send(stat, 1);
	}catch(e){
		console.log(e);
	};
};

analytics.trackActivation = function(status) {
	try {
		var stat = this.prefix() + '.' + 'activation.' + status + '.count';
		this.send(stat, 1);
	}catch(e){
		console.log(e);
	}
};

analytics.trackError = function(type) {
	try {
		var stat = this.prefix() + '.' + type + '.count';
		this.send(stat, 1);
	}catch(e) {
		console.log(e);
	};
};
