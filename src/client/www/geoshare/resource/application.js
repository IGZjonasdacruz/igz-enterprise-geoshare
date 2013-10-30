iris.resource(function (self) {

	var nearestContacts = [], me = null;

	self.settings({
		path : ''
	});

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
		nearestContacts = [];
		me = null;
	};

}, iris.path.resource.app);
