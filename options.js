"use strict";

document.addEventListener('DOMContentLoaded', function() {
	document.querySelector('#bg_cbox+span').innerText = browser.i18n.getMessage("bgCheckbox");
	document.querySelector('#bg_cbox_hint').innerText = browser.i18n.getMessage("bgCheckboxHint");
	document.querySelector('#theme_lite_label').innerText = browser.i18n.getMessage("lightTheme");
	document.querySelector('#theme_auto_label').innerText = browser.i18n.getMessage("autoTheme");
	document.querySelector('#theme_dark_label').innerText = browser.i18n.getMessage("darkTheme");
	document.querySelector('#theme_hint').innerText = browser.i18n.getMessage("themeHint");

	let cbox = document.querySelector("#bg_cbox");
	if (cbox) {
		browser.storage.local.get('bgCbox').then(function(r) {
			cbox.checked = r.bgCbox !== "f";
		}).finally(function() {
			cbox.addEventListener("click", function(e) {
				browser.storage.local.set({bgCbox: cbox.checked ? "t" : "f"});
			});
			cbox.disabled = false;
		});
	}

	browser.storage.local.get('theme').then(function(r) {
		document.querySelector("#theme_" + (r.theme || "auto")).checked = true;
	});

	for (let val of ["lite", "auto", "dark"]) {
		let elem = document.querySelector("#theme_" + val);
		if (elem) {
			elem.addEventListener("click", function(e) {
				browser.storage.local.set({theme: val});
			});
			elem.disabled = false;
		}
	}
});