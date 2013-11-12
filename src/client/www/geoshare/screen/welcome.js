iris.screen(function(self) {

	var appRes = iris.resource(iris.path.resource.app);

	self.create = function() {
		self.tmpl(iris.path.screen.welcome.html);

		self.get('logout_btn').on('click', logout);
		self.get('login_btn').on('click', onBtnLogin);

		self.screens("screens", [
			["map", iris.path.screen.map.js],
			["list", iris.path.screen.list.js]
		]);

		iris.on(iris.BEFORE_NAVIGATION, onBeforeNavigation);

		self.ui('notify', iris.path.ui.notify.js);

		var shareModeUI = self.ui('privacy', iris.path.ui.shareMode.js, {showStatus: showStatus, hideStatus: hideStatus});

		self.get('shareMode_btn').on('click', function() {
			shareModeUI.get().modal('toggle');
		});

		// collapse nav-bar on click
		self.get('navbar_items').find('a').on('click', function() {
			if ( self.get('navbar_items').hasClass('in') ) {
				self.get('collapse_nav_btn').click();
			}
		});

		if (localStorage.access_token) {
			login();
		} else {
			showLogin();
		}
	};

	function showLogin() {
		self.get('collapse_nav_btn').toggleClass('hidden', true);
		self.inflate({
			showMenu: false,
			showUserBox: false,
			showLogin: true
		});
	}

	function onBeforeNavigation() {
		var hash = document.location.hash;
		self.inflate({showUserBox: (hash == '')});

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

	function onBtnLogin (e) {
		if (geoshare.isBrowser) {
			location.reload();
		} else {
			login();
		}
	}

	function login() {
		iris.notify('clearNotifications');
		
		self.inflate({
			showMenu: false,
			showUserBox: false,
			showLogin: false
		});
		showStatus('Getting access...');
		googleapi.getToken().done(onGetToken).fail(onGetTokenFail);
	}

	function logout(e) {
		iris.notify('clearNotifications');
		appRes.signOut().done(function() {
			googleapi.reset();
			showLogin();
		});
	}

	function onGetToken(data) {
		showStatus('Initializing');
		sendLocation();
	}

	function onGetTokenFail(e) {
		var msg;
		if (e.hasOwnProperty('type') && e.type === 'user_denied_access') {
			msg = 'Please authorize this application to start';
		} else {
			msg = 'Login error, please try again later...';
		}

		iris.notify('notify', {msg: msg, type: 'danger'});
		hideStatus();
		showLogin();
	}

	function sendLocation() {
		navigator.geolocation.getCurrentPosition(
				onGetPosition,
				onGetPositionError,
				{enableHighAccuracy: true}
		);
	}

	function onGetPosition(position) {
		var pos = position.coords;
		iris.log('lat = ' + pos.latitude + ', lng=' + pos.longitude);

		appRes.signIn(pos.latitude, pos.longitude).done(function() {

			iris.locale(appRes.me().locale || 'en');
			hideStatus();
			self.get('collapse_nav_btn').toggleClass('hidden', false);

			self.inflate({
				user: appRes.me(),
				showMenu: true,
				showUserBox: true,
				showLogin: false
			});

			if (!geoshare.isBrowser) {
				gnotification.listen(function(data) {
					appRes.addNearContact(data);
				});
			}

		}).fail(onSignInFail);
	}

	function onSignInFail () {
		hideStatus();
		showLogin();
	}

	function onGetPositionError(error) {
		iris.notify('notify', {msg: 'Cannot get location', type: 'danger'});
		onSignInFail();
	}

}, iris.path.screen.welcome.js);
