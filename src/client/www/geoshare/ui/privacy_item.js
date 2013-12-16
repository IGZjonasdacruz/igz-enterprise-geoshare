iris.ui(function(self) {
	
	self.settings({
		name: 'item_name',
		key: 'item_key'
	});

	self.create = function() {
		self.tmplMode(self.APPEND);
		self.tmpl(iris.path.ui.privacy_item.html);
		self.inflate({name: self.setting('name')});
	};

	self.render = function(checked) {
		self.inflate({state: checked ? 'checked':''});
	};
	
	self.getState = function() {
		return {
			key: self.setting('key'),
			checked: self.get('item').prop('checked')
		};
	};

}, iris.path.ui.privacy_item.js);