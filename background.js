chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
				
		var result = "did nothing";
		if (request.say == "open new tab" && request.url !== undefined) {
			var focusOnNewTab = false;
			if (request.focusOnNewTab == true) focusOnNewTab = true;
			chrome.tabs.create({
						url: request.url,
						selected: focusOnNewTab,
						openerTabId: sender.tab.id,
						windowId: sender.tab.windowId,
						index: sender.tab.index + 1
						});
			result = "opened new tab";
		}
		sendResponse({result: result});
	});