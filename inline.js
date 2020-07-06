"use strict";

document.title = browser.i18n.getMessage("resultsPageTitle");

var makeLiElem = function (ul, ht) {
	if (ht && ht.length) {
		let ct = document.createElement ("div");
		ct.className = "imCt";
		ul.appendChild (ct);
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
		ct.appendChild (im);
		im.src = ht;
	}
};

window.onload = function () {
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
};
