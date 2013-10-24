iris.ui(function(self) {

	self.create = function() {
		self.tmpl(iris.path.ui.notify.html);

		self.on('notify', onNotify);
		self.on('clearNotifications', onClearNotifications);
	};

	function onNotify(settings) {
		self.ui("items", iris.path.ui.notify_item.js, settings);
	}

	function onClearNotifications() {
		var uis = self.ui("items") || [];
		uis.forEach(function(ui) {
			ui.destroyUI();
		});
	}

}, iris.path.ui.notify.js);
