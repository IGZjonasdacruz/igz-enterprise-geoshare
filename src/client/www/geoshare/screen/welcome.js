iris.screen(function(self) {

	var userRes = iris.resource(iris.path.resource.user);

	self.create = function() {
		self.tmpl(iris.path.screen.welcome.html);

		self.get('logout_btn').on('click', logout);
		self.get('login_btn').on('click', login);

		self.screens("screens", [
			["map", iris.path.screen.map.js],
			["list", iris.path.screen.list.js]
		]);

		iris.on(iris.BEFORE_NAVIGATION, onBeforeNavigation);

		self.ui('notify', iris.path.ui.notify.js);

		showLogin();
	};

	function showLogin () {
		self.inflate({
			showMenu: false,
			showUserBox: false,
			showLogin: true
		});
	}

	function onBeforeNavigation () {
		var hash = document.location.hash;
		self.inflate({ showUserBox: (hash == '') });

		var $menu = self.get('menu');
		$('a', $menu).parent().removeClass('active');
		$('a[href="' + hash + '"]', $menu).parent().addClass('active');
	}

	function showStatus(msg) {
		self.get('loader').show();
		self.get('status').text(msg);
	}

	function hideStatus() {
		self.get('loader').hide();
		self.get('status').text('');
	}

	function login() {
		self.get('login_box').hide();
		showStatus('Getting access...');
		googleapi.getToken().done(onGetToken).fail(onGetTokenFail);
	}

	function logout(e) {
		userRes.logout().done(function() {
			googleapi.reset();

			if (geoshare.isBrowser) {
				return document.location.href = 'http://localhost:3000/login';
			} else {
				showLogin();
			}
		});
	}

	function onGetToken(data) {
		self.get('logout_btn').show();
		showStatus('Sending location...');
		sendLocation();
	}

	function onGetTokenFail(e) {
		showStatus('Logging...');
		googleapi.authorize().done(onGetToken);
	}

	function sendLocation() {
		navigator.geolocation.getCurrentPosition(
			onGetPosition,
			onGetPositionError,
			{ enableHighAccuracy: true }
		);
	}

	function onGetPosition(position) {
		var pos = position.coords;
		iris.log('lat = ' + pos.latitude + ', lng=' + pos.longitude);
		
		userRes.sendLocation(pos.latitude, pos.longitude).done(function() {	
			showStatus('Finding the nearest users...');

			userRes.getNearestContacts().done(function(users) {
				hideStatus();

				iris.log('All neareat user found =' + users.length);

				self.inflate({
					user : userRes.me(),
					showMenu: true,
					showUserBox: true,
					showLogin: false
				});
			});
		});
	}

	function onGetPositionError(error) {
		iris.notify('notify', { msg : 'Error: cannot get location...' });
	}

}, iris.path.screen.welcome.js);
