iris.screen(function(self) {

	var map;
	var appRes = iris.resource(iris.path.resource.app);

	self.create = function() {
		self.tmpl(iris.path.screen.map.html);
		
		self.ui("map-slider", iris.path.ui.map_slider.js);

		self.on('resize', resize);
		self.on('refresh-nearest-contacts', self.render);
		self.on('refresh-me-position', self.render);

		self.render();
	};

	function resize() {
		var $window = $(window);
		self.get('map')
				.height($window.height() - self.get().offset().top - 60);

		if (map) {
			map.refresh();
		}
	}

	self.render = function(me) {
		me = me || appRes.me();
		var contacts = appRes.nearestContacts();

		iris.log('[map] Remove makers');

		// If the nav-bar is collapsing, the offset will be different
		// give 500 millis to collapse before the nav-tab
		setTimeout(function() {
			resize();
			if (!map) {
				createMap(me);
			}

			map.removeMarkers();
			
			iris.log('[map] Set map center');
			map.panTo(new google.maps.LatLng(me.location.coordinates[1], me.location.coordinates[0]));

			iris.log('[map] Draw user, lat=' + me.location.coordinates[1] + ', lng=' + me.location.coordinates[0]);
			addMarker(me);

			iris.log('[map] Draw user contacts');
			contacts.forEach(function(contact) {
				if (contact.location) {
					addMarker(contact);
				}
			});
			
		}, 500);



		self.inflate({countText: countText()});
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

		var div = $('<div></div>');
		var divEmail = $('<div></div>');

		divEmail.html(user.email ? user.email : "???");

		div.append(divEmail);

		var divHangout = $('<div></div>');
		var linkHangout = $('<a></a>');
		linkHangout.css({'textDecoration': 'none', 'cursor': 'pointer'});
		linkHangout.html('<img src="https://ssl.gstatic.com/s2/oz/images/stars/hangout/1/gplus-hangout-24x100-normal.png" \
							alt="Start a Hangout" \
							style="border:0;width:86px;height:20px;"/>');
		setUpHangout(linkHangout, user);
		divHangout.append(linkHangout);
		div.append(divHangout);

		map.addMarker({
			lat: user.location.coordinates[1],
			lng: user.location.coordinates[0],
			title: user.name ? user.name : '???',
			icon: user.photo ? user.photo + '?sz=50' : 'img/contact_marker.png',
			infoWindow: {
				content: div[0]
			}
		});

	}


	function countText() {
		return appRes.nearestContacts().length + " near contact" + (appRes.nearestContacts().length !== 1 ? 's' : '');
	}
	;

}, iris.path.screen.map.js);
