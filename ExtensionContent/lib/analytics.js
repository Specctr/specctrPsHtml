var net = require('net');

var extId = window.__adobe_cep__.getExtensionId();
var namespace = 'specctr.extension';
var HG_KEY = 'c9070102-3a4f-4fb1-8c6b-542159440c4a';

analytics = {};

analytics.send = function(stat, value) {
    var socket = net.createConnection(2003, "61bdfcd3.carbon.hostedgraphite.com");
    socket.on('data', function(data) {
	  console.log('RESPONSE: ' + data);
	}).on('connect', function() {
		socket.write(HG_KEY + "." + stat + " " + value + "\n");
		socket.end();
	}).on('end', function() {
	  console.log('HostedGraphite connection ended');
	}).on('error', function(err) {
        var email;
        if (Specctr && Specctr.Activation && Specctr.Activation.email) {
            email = Specctr.Activation.email.replace("@","_at_");
            email = email.replace(/\./g, "_");
        }else{
            email = "no_email";
        }

        var version;
        if (Specctr && Specctr.Version) {
            version = Specctr.Version.replace(/\./g, "_");
        }else{
            version = "no_version";
        }
        bugsnag.notify(err, {user: {email: email}, version: version});
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
        email = email.replace(/\./g, "_");
    }else{
        email = "no_email";
    }

    var version;
    if (Specctr && Specctr.Version) {
        version = Specctr.Version.replace(/\./g, "_");
    }else{
        version = "no_version";
    }
    
    //return namespace + '.' + version + '.' + os + '.' + hostApplication + '.' + extId + '.' + email;
    return namespace;
};

analytics.trackFeature = function(feature) {
	try {
	    var stat = this.prefix() + '.features.' + feature + '.count';
		this.send(stat, 1);
	}catch(e){
		console.log(e);
	};
};

analytics.trackEvent = function(name) {
	try {
		var stat = this.prefix() + '.events.' + name + '.count';
		this.send(stat, 1);
	}catch(e){
		console.log(e);
	}
};

analytics.trackError = function(type) {
	try {
		var stat = this.prefix() + '.errors.' + type + '.count';
		this.send(stat, 1);
	}catch(e) {
		console.log(e);
	};
};
