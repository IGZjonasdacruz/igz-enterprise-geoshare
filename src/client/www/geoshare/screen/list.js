iris.screen(function(self) {

	var userRes = iris.resource(iris.path.resource.user);

	self.create = function() {
		self.tmpl(iris.path.screen.list.html);

		iris.on('refresh-nearest-contacts', self.render);
		self.render();
	};

	self.render = function() {
		var me = userRes.me();
		var contacts = userRes.nearestContacts();

		iris.log('[list] render, contacts=' + contacts.length);

		self.inflate({ countText: userRes.countText(), hasContacts: contacts.length > 0 });

		self.destroyUIs('contacts');
		contacts.forEach(function(contact) {
			self.ui("contacts", iris.path.ui.list_item.js).render(me, contact);
		});
	};

	self.reset = function() {
		self.destroyUIs('contacts');
		return self;
	};

}, iris.path.screen.list.js);
