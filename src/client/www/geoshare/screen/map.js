iris.screen(function(self) {

	var map;
	var userRes = iris.resource(iris.path.resource.user);

	self.create = function() {
		self.tmpl(iris.path.screen.map.html);

		self.on('resize', resize);
		self.on('refresh-nearest-contacts', self.render);

		self.render();
	};

	function resize() {
		var $window = $(window);
		self.get()
				.height($window.height() - self.get().offset().top - 60);

		if (map) {
			map.refresh();
		}
	}

	self.render = function() {

		var me = userRes.me();
		var contacts = userRes.nearestContacts();

		iris.log('[map] Remove makers');

		resize();

		if (!map) {
			createMap(me);
		}

		map.removeMarkers();

		iris.log('[map] Set map center');
		map.setCenter(me.location.coordinates[1], me.location.coordinates[0]);

		iris.log('[map] Draw user, lat=' + me.location.coordinates[1] + ', lng=' + me.location.coordinates[0]);
		addMarker(me);

		iris.log('[map] Draw user contacts');
		contacts.forEach(function(contact) {
			addMarker(contact);
		});
	};

	self.reset = function() {
		map.removeMarkers();
		return self;
	};

	self.show = function() {
		self.get().show();
		return this;
	};

	function createMap(me) {
		map = new GMaps({
			div: '#map',
			lat: me.location.coordinates[1],
			lng: me.location.coordinates[0],
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

	function addMarker(user) {
		map.addMarker({
			lat: user.location.coordinates[1],
			lng: user.location.coordinates[0],
			title: user.email,
			icon: user.photo + '?sz=50',
			infoWindow: {
				content: user.email
			}
		});
	}

}, iris.path.screen.map.js);
