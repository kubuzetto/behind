"use strict";

document.addEventListener('DOMContentLoaded', function() {
	browser.storage.local.get('bgCbox').then(function(r) {
		document.querySelector("#bg_cbox").checked = r.bgCbox !== "f";
	}).finally(function() {
		document.querySelector('#bg_cbox+span').innerText = browser.i18n.getMessage("bgCheckbox");
		document.querySelector('#bg_cbox_hint').innerText = browser.i18n.getMessage("bgCheckboxHint");
		document.querySelector("#bg_cbox").disabled = false;
	});
});
document.querySelector("#bg_cbox").addEventListener("click", function(e) {
	browser.storage.local.set({bgCbox: document.querySelector("#bg_cbox").checked ? "t" : "f"});
});
