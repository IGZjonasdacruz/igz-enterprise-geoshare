iris.ui(function(self) {
	
	self.settings = {
		contacts: [],
		isFuture: false
	};

	var appRes = iris.resource(iris.path.resource.app);

	self.create = function() {
		self.tmplMode(self.APPEND);
		self.tmpl(iris.path.ui.list.html);

		iris.on('refresh-nearest-contacts', self.render);
		self.render();
	};

	self.render = function() {
		var me = appRes.me();
		var contacts = self.setting('contacts');

		iris.log('[list] render, contacts=' + contacts.length);
		
		self.inflate({ countText: countText(), hasContacts: contacts.length > 0, isFuture: self.setting('isFuture') });

		self.destroyUIs('contacts');
		contacts.forEach(function(contact) {
			self.ui("contacts", iris.path.ui.list_item.js, {isFuture: self.setting('isFuture')}).render(me, contact);
		});
	};

	self.reset = function() {
		self.destroyUIs('contacts');
		return self;
	};
	
	
	function countText () {
		return self.setting('contacts').length + " near contact" + (self.setting('contacts').length !== 1 ? 's' : '');
	};

}, iris.path.ui.list.js);
