"use strict";

document.title = browser.i18n.getMessage("resultsPageTitle");

var makeLiElem = function (ul, ht) {
	if (ht && ht.length) {
		let ct = document.createElement ("div");
		ct.className = "imCt";
		ul.appendChild (ct);
		let a = document.createElement ("a");
		a.target = "_blank";
		a.setAttribute("download", "");
		a.href = ht;
		let im = document.createElement ("img");
		im.onload = function () {
			if (im.naturalWidth && im.naturalHeight) {
				let szTxt = browser.i18n.getMessage
					("imgSizeText", [im.naturalWidth, im.naturalHeight]);
				im.setAttribute ("title", szTxt);
				let spn = document.createElement("span");
				spn.innerText = szTxt;
				ct.appendChild(spn);
			}
		}
		a.appendChild (im);
		ct.appendChild (a);
		im.src = ht;
	}
};

let checkTheme = function() {
	browser.storage.local.get('theme').then(function(r) {
		document.body.id=r.theme;
		document.querySelector("#theme_" + (r.theme || "auto")).checked = true;
	});
};

window.onload = function () {
	checkTheme();
	browser.storage.onChanged.addListener((x,y) => checkTheme());
	for (let val of ["lite", "auto", "dark"]) {
		let elem = document.querySelector("#theme_" + val);
		if (elem) {
			elem.addEventListener("click", function(e) {
				browser.storage.local.set({theme: val});
				checkTheme();
			});
			elem.disabled = false;
		}
	}
	document.querySelector('#theme_lite_label').innerText = browser.i18n.getMessage("lightTheme");
	document.querySelector('#theme_auto_label').innerText = browser.i18n.getMessage("autoTheme");
	document.querySelector('#theme_dark_label').innerText = browser.i18n.getMessage("darkTheme");

	browser.tabs.getCurrent ().then (function (self) {
		// missing opener tab id; close
		var oti = self.openerTabId;
		if (!oti) close ();
		// is the opener tab still open?
		browser.tabs.get (oti).then (function (tab) {
			document.title += " [" + tab.title + "]";
		}, close);
		// try to send message to the tab
		browser.tabs.sendMessage (oti,
			{nm: "fetchClickedElements"}).then (function (v) {
				var main = document.querySelector ("#main");
				if (v && v.el && v.el.length) {
					v.el.forEach (function (x) {makeLiElem (main, x);});
				} else {
					main.innerText = browser.i18n.getMessage ("errorNoImages");
				}
		}, function (e) {
			console.error (browser.i18n.getMessage ("errorTabsSendMessage", e.toString()));
		});
	}, function (e) {
		console.error (browser.i18n.getMessage ("errorTabsGetCurrent", e.toString()));
	});

	// remove url of this generated page from history
	browser.permissions.contains({permissions: ["history"]}).then(allowed => {
		if (allowed) browser.history.deleteUrl({url: window.location.href});
	});
};
