iris.ui(function(self) {

	var appRes = iris.resource(iris.path.resource.app);

	self.create = function() {
		self.tmplMode(self.APPEND);
		self.tmpl(iris.path.ui.list.html);

		iris.on('refresh-nearest-contacts', self.render);
		self.render();
	};

	self.render = function() {
		var me = appRes.me();
		var contacts = appRes.nearestContacts();

		iris.log('[list] render, contacts=' + contacts.length);

		self.inflate({ countText: appRes.countText(), hasContacts: contacts.length > 0 });

		self.destroyUIs('contacts');
		contacts.forEach(function(contact) {
			self.ui("contacts", iris.path.ui.list_item.js).render(me, contact);
		});
	};

	self.reset = function() {
		self.destroyUIs('contacts');
		return self;
	};

}, iris.path.ui.list.js);
