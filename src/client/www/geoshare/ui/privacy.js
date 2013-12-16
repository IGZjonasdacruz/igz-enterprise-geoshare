iris.ui(function(self) {

	var appRes = iris.resource(iris.path.resource.app);

	self.settings({
		showStatus: null,
		hideStatus: null
	});

	self.create = function() {
		self.tmpl(iris.path.ui.privacy.html);

		['name', 'email', 'photo', 'distance', 'location'].forEach(function(key) {
			self.ui('privacy_items', iris.path.ui.privacy_item.js, {key: key, name: key.charAt(0).toUpperCase() + key.slice(1)});
		});

		self.get().on('show.bs.modal', self.render);

		self.get('save-btn').on('click', save);

	};

	self.render = function() {
		var me = appRes.me();
		self.ui('privacy_items').forEach(function(ui) {
			var key = ui.getState().key;
			ui.render(me.privacy === undefined || me.privacy === 'none' || Array.isArray(me.privacy) && me.privacy.indexOf(key) === -1);
		});
	};

	function save() {
		var privacy = [];
		self.ui('privacy_items').forEach(function(ui) {
			var key = ui.getState().key;
			var checked = ui.getState().checked;
			if (!checked) {
				privacy.push(key);
			}
		});

		if (privacy.length === self.ui('privacy_items').length) {
			privacy = 'none';
		}

		self.get().modal('hide');

		if (self.setting('showStatus')) {
			self.setting('showStatus')('Updating share mode');
		}
		
		appRes.sendPrivacy(privacy).done(function() {
			if (self.setting('hideStatus')) {
				self.setting('hideStatus')();
			}
			;
		});
	}

}, iris.path.ui.privacy.js);