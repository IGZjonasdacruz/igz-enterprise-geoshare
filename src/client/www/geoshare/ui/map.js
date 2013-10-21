iris.ui(function(self) {

	var map;

	self.create = function() {
		self.tmpl(iris.path.ui.map.html);
	};

	self.render = function (userPosition, contacts) {

		if ( !map ) {
			createMap(userPosition);
		}
		
		iris.log('[map] Set map center')
		map.setCenter(userPosition.latitude, userPosition.longitude);

		iris.log('[map] Draw user, lat=' + userPosition.latitude + ', lng=' + userPosition.longitude)
		map.addMarker({
			lat: userPosition.latitude,
			lng: userPosition.longitude,
			title: 'Me',
			icon: 'img/me_marker.png',
			infoWindow: {
				content: '<p>You are here</p>'
			}
		});

		iris.log('[map] Draw user contacts')
		contacts.forEach(function(contact) {
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

	}

	self.reset = function () {
		map.removeMarkers();
	};

	function createMap (userPosition) {
		map = new GMaps({
			div: '#map',
			lat: userPosition.latitude,
			lng: userPosition.longitude,
			zoom: 14,
			zoomControl: true,
			zoomControlOpt: {
				style: 'SMALL',
				position: 'TOP_RIGHT'
			},
			panControl: true,
			streetViewControl: true,
			mapTypeControl: false
		});
	}

}, iris.path.ui.map.js);
