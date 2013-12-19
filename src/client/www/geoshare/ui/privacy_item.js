iris.ui(function(self) {
	
	self.settings({
		id: 'item_id',
		value: 'item_value',
		privacy: false
	});

	self.create = function() {
		self.tmplMode(self.APPEND);
		self.tmpl(iris.path.ui.privacy_item.html);
		self.inflate({value: self.setting('value')});
		self.render();
	};

	self.render = function() {
		self.inflate({privacy: self.setting('privacy')});
	};
	
	self.getState = function() {
		return {
			id: self.setting('id'),
			privacy: self.get('item').prop('checked')
		};
	};

}, iris.path.ui.privacy_item.js);