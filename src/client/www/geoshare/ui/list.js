iris.ui(function(self) {

	var userRes = iris.resource(iris.path.resource.user);

	self.create = function() {
		self.tmpl(iris.path.ui.list.html);

		iris.on('refresh-nearest-contacts', self.render);
	};

	self.render = function() {
		var me = userRes.me();
		var contacts = userRes.nearestContacts();

		iris.log('[list] render, contacts=' + contacts.length);

		var countText = contacts.length + " near contact" + (contacts.length !== 1 ? 's' : '');
		self.inflate({ countText: countText, hasContacts: contacts.length > 0 });

		self.destroyUIs('contacts');
		contacts.forEach(function(contact) {
			self.ui("contacts", iris.path.ui.item.js).render(me, contact);
		});
	};

	self.reset = function() {
		self.destroyUIs('contacts');
		return self;
	};

}, iris.path.ui.list.js);