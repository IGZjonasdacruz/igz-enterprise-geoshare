iris.ui(function(self) {

	var appRes = iris.resource(iris.path.resource.app);

	self.settings({
		showStatus: null,
		hideStatus: null,
		data: [],
		type: 'type'
	});

	self.create = function() {
		self.tmplMode(self.APPEND);
		self.tmpl(iris.path.ui.privacy.html);

		self.setting('data').forEach(function(item) {
			self.ui('privacy_items', iris.path.ui.privacy_item.js, item);
		});

		self.get().on('show.bs.modal', self.render);

		self.get('save-btn').on('click', save);

	};

	self.render = function() {
		
	};

	function save() {
		var data = [];
		self.ui('privacy_items').forEach(function(ui) {
			var id = ui.getState().id;
			var state = ui.getState().privacy;
			if (state) {
				data.push(id);
			}
		});
		
		self.get().modal('hide');

		if (self.setting('showStatus')) {
			self.setting('showStatus')('Updating share mode');
		}
		
		var privacy = {
		};
		
		privacy[self.setting('type')] = data;
		
		appRes.sendPrivacy(privacy).done(function() {
			if (self.setting('hideStatus')) {
				self.setting('hideStatus')();
			}
			;
		});
	}

}, iris.path.ui.privacy.js);