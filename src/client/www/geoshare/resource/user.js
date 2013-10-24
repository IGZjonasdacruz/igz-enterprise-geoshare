iris.resource(function (self) {

	var nearestContacts = null, me = null;

	self.settings({
		path : 'user/'
	});

	self.sendLocation = function(lat, lng) {
		return self.post("me/location", {latitude: lat, longitude: lng, regid: geosharecfg.gcm.regid}).done(function(data){
			iris.log('sendLocation done');
			me = data;
		});
	};
	
	self.sendShareMode = function(shareMode) {
		return self.put("me/shareMode", {shareMode: shareMode}).done(function(data){
			iris.log('sendShareMode done');
			me = data;
		});
	};

	self.sendGcmId = function(gcmId) {
		return self.put("me/gcm-id", {gcmId: gcmId});
	};
	
	self.getNearestContacts = function() {
		return self.get("contacts/location").done(function (data) {
			iris.log('getNearestContacts done');
			nearestContacts = data;
		});
	};

	self.logout = function() {
		return self.get("logout").done(function () {
			iris.log('logout done');
			self.reset();
		});
	};

	self.addNearContact = function (data) {
		var contact = data.user;
		for ( var f = 0, F = nearestContacts.length; f < F; f++ ) {
			if ( nearestContacts[f].email === contact.email ) {
				break;
			}
		}
		nearestContacts[f] = contact;

		if ( f === F ) {
			// New user
			iris.notify('notify', { msg: 'The user ' + contact.email + ' has been discovered!' });
		}

		iris.notify('refresh-nearest-contacts');
	};

	self.me = function () {
		return me;
	};

	self.nearestContacts = function () {
		return nearestContacts;
	};

	self.countText = function () {
		return nearestContacts.length + " near contact" + (nearestContacts.length !== 1 ? 's' : '');
	}

	self.reset = function () {
		nearestContacts = null;
		me = null;
	};

}, iris.path.resource.user);
