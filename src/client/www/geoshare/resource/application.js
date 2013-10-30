iris.resource(function (self) {

	var nearestContacts = [], me = null;

	self.signIn = function(lat, lng) {
		return self.post("sign-in", {lat: lat, lng: lng}).done(function(data){
			iris.log('signIn done');

			me = data.user;
			nearestContacts = data.nearestContacts;
		});
	};

	self.signOut = function() {
		return self.get("sign-out").done(function () {
			iris.log('signOut done');
			self.reset();
		});
	};

	self.sendShareMode = function(shareMode) {
		return self.put("user/me/shareMode", {shareMode: shareMode}).done(function(data){
			iris.log('sendShareMode done');
			me.shareMode = shareMode;
		});
	};

	self.sendGcmId = function(gcmId) {
		return self.put("user/me/gcm-id", {gcmId: gcmId});
	};

	self.me = function () {
		return me;
	};

	self.nearestContacts = function () {
		return nearestContacts;
	};

	self.countText = function () {
		return nearestContacts.length + " near contact" + (nearestContacts.length !== 1 ? 's' : '');
	};

	self.reset = function () {
		nearestContacts = [];
		me = null;
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
			iris.notify('notify', { msg: 'The user "' + contact.name + '" has been discovered!' });
		}

		iris.notify('refresh-nearest-contacts');
	};

}, iris.path.resource.app);
