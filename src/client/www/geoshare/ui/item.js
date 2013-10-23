iris.ui(function(self) {


	self.create = function() {
		self.tmplMode(self.APPEND);
		self.tmpl(iris.path.ui.item.html);
	};

	self.render = function(me, contact) {
		self.inflate({
			email: contact.email,
			emailto: 'mailto:' + contact.email,
			photo: 'https://profiles.google.com/s2/u/0/photos/profile/' + contact._id + '?sz=50',
			distance: getDistanceFromLatLonInKm(me, contact)
		});
	};

	self.reset = function() {
		self.destroyUI();
		return self;
	};

	//Distance between two points using the Haversine formula: http://stackoverflow.com/questions/27928/how-do-i-calculate-distance-between-two-latitude-longitude-points
	function getDistanceFromLatLonInKm(me, contact) {
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

}, iris.path.ui.item.js);