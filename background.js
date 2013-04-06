//handles opening new tab
//listens for messages from content script
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
				
		var result = "did not open webpage";
		var success = false;
		if (request.say == "open webpage" && request.url !== undefined) {
			var focusOnNewTab = false;
			try {
				chrome.tabs.create({
						    url: request.url,
							selected: focusOnNewTab,
							openerTabId: sender.tab.id,
							windowId: sender.tab.windowId,
							index: sender.tab.index + 1
							});
			} catch(e) { alert(e); }				
			result = "opened webpage in new tab with focusOnNewTab = " + focusOnNewTab;
			success = true;
		}
		sendResponse({result: result, success: success});
	});


//logic for handling clicks on browser action icon
chrome.browserAction.onClicked.addListener(function(tab) {
		var targetURL = "https://news.ycombinator.com";
		if (tab.url !== targetURL) {
			chrome.tabs.update(tab.id, {url: targetURL});
		}
	});