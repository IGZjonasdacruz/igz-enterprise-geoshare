window.setUpHangout = function(link, contact) {
	if (geoshare.isBrowser) {
		link.attr('href', 'https://plus.google.com/hangouts/_?gid=' + geosharecfg.google_project_id);
	} else {
		link.click(function() {
			mobileHangout(contact);
			return false;
		});
	}
};

function mobileHangout(contact) {
	CDV.WEBINTENT.startActivity(
			{
				action: CDV.WEBINTENT.ACTION_VIEW,
				url: 'https://plus.google.com/' + contact._id
			},
	function() {
		iris.log('Started Google+ for ' + contact._id);
	},
			function(err) {
				iris.notify('notify', {msg: 'Error: cannot open Google+'});
				iris.log('Error: cannot open Google+', err);
			}
	);
}
	