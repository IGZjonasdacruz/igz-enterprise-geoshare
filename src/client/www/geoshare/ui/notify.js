iris.ui(function(self) {

	self.create = function() {
		self.tmpl(iris.path.ui.notify.html);
		
		self.on('notify', onNotify);
	};
	
	function onNotify (settings) {
		self.ui("items", iris.path.ui.notify_item.js, settings);
	}

}, iris.path.ui.notify.js);
