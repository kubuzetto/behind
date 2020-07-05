"use strict";

browser.contextMenus.create ({ "id": "behind_ctxmenu",
	"title": browser.i18n.getMessage("menuButtonTextDefault"), "visible": false,
	"contexts": [ "image", "link", "page", "audio", "video", "frame" ],
	"onclick": function (x, t) {
		browser.contextMenus.update ("behind_ctxmenu", { "visible": false });
		let fn = function(opt) {
			browser.tabs.create({ url: "/inline.html", active: opt && opt.bgCbox !== "f", openerTabId: t.id});
		};
		browser.storage.local.get('bgCbox').then(fn, () => fn({bgCbox: "t"}));
	}});

// try to add an icon to the menu item: this is not currently supported in chrome and might fail
const noop = function (a) {};
browser.contextMenus.update ("behind_ctxmenu", {"icons": {"16": "icon.svg"}}).then (noop, noop);

browser.runtime.onMessage.addListener (function (fn, x) {
	if (fn && fn.nm == "setClickedElements") {
		var upd = {"visible": true, "enabled": true};
		if (!!fn.frame) {
			upd.title = browser.i18n.getMessage ("menuButtonTextFrameDisabled");
			upd.enabled = false;
		} else if (!!fn.st)
			upd.title = browser.i18n.getMessage ("menuButtonTextDefault");
		else if (!!fn.ce)
			upd.title = browser.i18n.getMessage ("menuButtonTextWithNum", [fn.ce]);
		else
			upd.visible = false;
		browser.contextMenus.update ("behind_ctxmenu", upd);
		// no refresh function in chrome
		if (typeof browser.contextMenus.refresh === "function")
			browser.contextMenus.refresh ();
	}
});
