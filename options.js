"use strict";

document.addEventListener('DOMContentLoaded', function() {
	// remove url of this page from history
	browser.permissions.contains({permissions: ["history"]}).then(allowed => {
		if (allowed) browser.history.deleteUrl({url: window.location.href});
	});

	let cbox = document.querySelector("#bg_cbox");
	if (cbox) {
		document.querySelector('#bg_cbox+span').innerText = browser.i18n.getMessage("bgCheckbox");
		document.querySelector('#bg_cbox_hint').innerText = browser.i18n.getMessage("bgCheckboxHint");
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
	document.querySelector('#theme_lite_label').innerText = browser.i18n.getMessage("lightTheme");
	document.querySelector('#theme_auto_label').innerText = browser.i18n.getMessage("autoTheme");
	document.querySelector('#theme_dark_label').innerText = browser.i18n.getMessage("darkTheme");
	document.querySelector('#theme_hint').innerText = browser.i18n.getMessage("themeHint");

	let hp = document.querySelector("#history_perm");
	if (hp) {
		document.querySelector('#history_perm_hint').innerText = browser.i18n.getMessage("historyPermHint");
		let hpRequest = browser.i18n.getMessage("historyPermRequest");
		let hpRevoke = browser.i18n.getMessage("historyPermRevoke");
		let updHistoryPermButtonState = function() {
			browser.permissions.contains({permissions: ["history"]})
				.then(allowed => {
					hp.checked = allowed;
					hp.disabled = false;
					document.querySelector('#history_perm+span').innerText
						= allowed ? hpRevoke : hpRequest;
				});
		};
		hp.addEventListener("click", function() {
			hp.disabled = true;
			let fn = hp.checked ? browser.permissions.request : browser.permissions.remove;
			fn({permissions: ["history"]}).finally(updHistoryPermButtonState)
		});
		updHistoryPermButtonState();
	}

	let bp_cbox = document.querySelector("#bypass_cbox");
	if (bp_cbox) {
		document.querySelector('#bypass_cbox+span').innerText = browser.i18n.getMessage("bypassCheckbox");
		document.querySelector('#bypass_cbox_hint').innerText = browser.i18n.getMessage("bypassCheckboxHint");
		browser.storage.local.get('bypassOne').then(function(r) {
			bp_cbox.checked = r.bypassOne === "t";
		}).finally(function() {
			bp_cbox.addEventListener("click", function(e) {
				browser.storage.local.set({bypassOne: bp_cbox.checked ? "t" : "f"});
			});
			bp_cbox.disabled = false;
		});
	}
});
