iris.resource(function (self) {

	self.settings({
		path : 'user/'
	});

	self.sendLocation = function(lat, lng) {
		return self.post("me/location", {latitude: lat, longitude: lng, regid: geosharecfg.gcm.regid});
	};
	
	self.getNearestContacts = function() {
		return self.get("contacts/location");
	};


}, iris.path.resource.user);
