//keeps track of the toggle state of the clicks while on HN
state = 0;

//getter for toggle state
function getState() {
	return state+1;
}

//setter for toggle state
function setState(stateToSet) {
	state = stateToSet - 1;
}


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
		var targetURL = "https://news.ycombinator.com/";
		if (tab.url !== targetURL) { //we are not on the HN homepage
			//go to the HN homepage
			chrome.tabs.update(tab.id, { url: targetURL }, function(){});
		} else { //we are already on the HN homepage
			//toggle between options 1, 2, 3
			var badgeColor = [255, 0, 0];
			setState((getState() % 3) + 1);
			chrome.browserAction.setBadgeBackgroundColor({color: colorWithAlpha(badgeColor, 255)});
			chrome.browserAction.setBadgeText({text: getState().toString()});
			setTimeout(fadeOutBadge, 500);
		}
	});

//color is an RGB color array, alpha is the A value in the returned RGBA color array
function colorWithAlpha(color, alpha) {
	return color.concat(alpha);
}

//fades badge out by reducing opacity over time and then removing the badge altogether
function fadeOutBadge() {
	chrome.browserAction.getBadgeBackgroundColor({}, function(result) {
			var color = result.slice(0,3);
			var alpha = result[3];
			
			var reduceDelta = 50;
			var timeInterval = 50;
			var x = setInterval(function() {
					if (alpha - reduceDelta <= 0) {
						clearInterval(x);
						chrome.browserAction.setBadgeText({text: ""});
						chrome.browserAction.setBadgeBackgroundColor({color: colorWithAlpha(color, 255)});
					} else {
						chrome.browserAction.getBadgeBackgroundColor({}, function(result) {
								alpha -= reduceDelta;
								chrome.browserAction.setBadgeBackgroundColor({color: colorWithAlpha(color, alpha)});
							});
					}
				}, timeInterval);
		});
}
