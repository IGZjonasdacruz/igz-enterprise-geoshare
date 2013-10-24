iris.ui(function(self) {

	var userRes = iris.resource(iris.path.resource.user);

	self.settings({
		showStatus: null,
		hideStatus: null
	});

	self.create = function() {
		self.tmpl(iris.path.ui.shareMode.html);

		['name', 'email', 'photo', 'distance', 'location'].forEach(function(key) {
			self.ui('shareMode_items', iris.path.ui.shareMode_item.js, {key: key, name: key.charAt(0).toUpperCase() + key.slice(1)});
		});

		self.get().on('show.bs.modal', self.render);

		self.get('save-btn').on('click', save);

	};

	self.render = function() {
		var me = userRes.me();
		self.ui('shareMode_items').forEach(function(ui) {
			var key = ui.getState().key;
			ui.render(me.shareMode === undefined || me.shareMode === 'all' || Array.isArray(me.shareMode) && me.shareMode.indexOf(key) > -1);
		});
	};

	function save() {
		var shareMode = [];
		self.ui('shareMode_items').forEach(function(ui) {
			var key = ui.getState().key;
			var checked = ui.getState().checked;
			if (checked) {
				shareMode.push(key);
			}
		});

		if (shareMode.length === self.ui('shareMode_items').length) {
			shareMode = 'all';
		}

		self.get().modal('hide');

		if (self.setting('showStatus')) {
			self.setting('showStatus')('Updating share mode');
		}
		
		userRes.sendShareMode(shareMode).done(function() {
			if (self.setting('hideStatus')) {
				self.setting('hideStatus')();
			}
			;
		});
	}

}, iris.path.ui.shareMode.js);