"use strict";
window.addEventListener("load", function() {
	let url = window.location.href;
	let idx = url.indexOf("#!");
	if (idx > 0 && idx < url.length - 2) {
		let e = document.createElement("img");
		e.src = url.substring(idx + 2);
		e.className = "transparent";
		document.body.appendChild(e);
	}
	// remove url of this generated page from history
	browser.permissions.contains({permissions: ["history"]}).then(allowed => {
		if (allowed) browser.history.deleteUrl({url: window.location.href});
	});
});
