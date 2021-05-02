"use strict";
window.addEventListener("load", function() {
	let url = window.location.href;
	let idx = url.indexOf("#!");
	if (idx > 0 && idx < url.length - 2) {
		let imgURL = url.substring(idx + 2);
		document.addEventListener("keydown", function(e) {
			if ((window.navigator.platform.match("Mac")?e.metaKey:e.ctrlKey)&&
					e.keyCode == 83) {
				e.preventDefault();
				window.location.href = imgURL;
			}
		}, false);

		let e = document.createElement("img");
		e.className = "transparent";
		document.body.appendChild(e);
		fetch(new Request(imgURL)).then(function(r) {
			r.blob().then(function(b) {
				e.src = URL.createObjectURL(b);
			});
		});
	}

	// remove url of this generated page from history
	browser.permissions.contains({permissions: ["history"]}).then(allowed => {
		if (allowed) browser.history.deleteUrl({url: window.location.href});
	});
});
