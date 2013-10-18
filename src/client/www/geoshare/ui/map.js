iris.ui(function(self) {

	self.settings({
		me: {
			latitude: 40.421603,
			longitude: -3.705488
		},
		contacts: []
	});

	self.create = function() {
		self.tmpl(iris.path.ui.map.html);
		self.get('map').width($(document).width());
		self.get('map').height($(document).height());
		map = new GMaps({
			div: '#map',
			lat: self.setting('me').latitude,
			lng: self.setting('me').longitude,
			zoom: 12,
			zoomControl: true,
			zoomControlOpt: {
				style: 'SMALL',
				position: 'TOP_RIGHT'
			},
			panControl: true,
			streetViewControl: true,
			mapTypeControl: false
		});

		map.addMarker({
			lat: self.setting('me').latitude,
			lng: self.setting('me').longitude,
			title: 'Me',
			icon: 'img/me_marker.png',
			infoWindow: {
				content: '<p>You are here</p>'
			}
		});

		self.setting('contacts').forEach(function(contact) {
			map.addMarker({
				lat: contact.location.coordinates[1],
				lng: contact.location.coordinates[0],
				title: contact.email,
				icon: 'img/contact_marker.png',
				infoWindow: {
					content: "<p>" + contact.email + "</p>"
				}
			});
		});
	};
}, iris.path.ui.map.js);