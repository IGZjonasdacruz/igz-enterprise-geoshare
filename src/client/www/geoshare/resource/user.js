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
			nearestContacts.forEach(function(contact) {
				//processContact(contact);
			});
		});
	};

	self.logout = function() {
		return self.get("logout").done(function () {
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
		processContact(contact)
		nearestContacts[f] = contact;

		iris.notify('notify', { msg: 'The user ' + contact.email + ' has been discovered!' });
		iris.notify('refresh-nearest-contacts');
	};

	self.me = function () {
		return me;
	};

	self.nearestContacts = function () {
		return nearestContacts;
	};

	self.reset = function () {
		nearestContacts = null;
		me = null;
	};

	//Distance between two points using the Haversine formula: http://stackoverflow.com/questions/27928/how-do-i-calculate-distance-between-two-latitude-longitude-points
	function getDistanceFromLatLon(me, contact) {
		var lat1 = me.location.coordinates[1],
				lon1 = me.location.coordinates[0],
				lat2 = contact.location.coordinates[1],
				lon2 = contact.location.coordinates[0];

		function deg2rad(deg) {
			return deg * (Math.PI / 180);
		}

		var R = 6371; // Radius of the earth in km
		var dLat = deg2rad(lat2 - lat1);  // deg2rad below
		var dLon = deg2rad(lon2 - lon1);
		var a =
				Math.sin(dLat / 2) * Math.sin(dLat / 2) +
				Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
				Math.sin(dLon / 2) * Math.sin(dLon / 2)
				;
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		var d = R * c; // Distance in km
		return parseInt(d * 1000, 10);
	}

	function processContact (contact) {
		contact.distance = getDistanceFromLatLonInKm(me, contact);
	}

}, iris.path.resource.user);
