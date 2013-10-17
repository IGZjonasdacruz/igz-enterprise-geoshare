iris.resource(function (self) {

	self.settings({
		path : 'user/'
	});

	self.sendLocation = function(lat, lng) {
		return self.post("me/location", {latitude: lat, longitude: lng});
	};


}, iris.path.resource.user);
