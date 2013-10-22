iris.resource(function (self) {

	self.settings({
		path : 'user/'
	});

	self.sendLocation = function(lat, lng) {
		return self.post("me/location", {latitude: lat, longitude: lng, regid: geosharecfg.gcm.regid});
	};

	self.sendGcmId = function(gcmId) {
		return self.put("me/gcm-id", {gcmId: gcmId});
	};
	
	self.getNearestContacts = function() {
		return self.get("contacts/location");
	};

	self.logout = function() {
		return self.get("logout");
	};


}, iris.path.resource.user);
