//key for the toggle state in the chrome local storage
TOGGLE_STATE_KEY = "toggle_state";

//getter for toggle state
function getState(callback) {
	var obj = {};
	obj[TOGGLE_STATE_KEY] = 0;
	chrome.storage.local.get(obj, function(items) {
			callback(items[TOGGLE_STATE_KEY] + 1);
		});
}

//setter for toggle state
function setState(stateToSet, callback) {
	var obj = {};
	obj[TOGGLE_STATE_KEY] = stateToSet - 1;
	chrome.storage.local.set(obj, function() {
			callback();
		});
}


updateAllHNTabIcons();

//handles opening new tab
//listens for messages from content script
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
				
		var result = "did nothing";
		var success = false;
		if (request.say == "open webpage" && request.url !== undefined) {
			getState(function(state) {
					if (state == 3) {
						try {
							chrome.tabs.update(sender.tab.id, {url: request.url});
						} catch(e) { alert(e); }
						result = "opened webpage in same tab";
						success = true;
					} else {
						var focusOnNewTab = false;
						if (state == 2) focusOnNewTab = true;
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
				});
		} else if (request.say == "new HN tab opened") {
			updateIcon(sender.tab.id);
			result = "updated toggle state for new tab";
			success = true;
		}
		sendResponse({result: result, success: success});
	});


//logic for handling clicks on browser action icon
chrome.browserAction.onClicked.addListener(function(tab) {
		var targetURL = "https://news.ycombinator.com/";
		if (tab.url !== targetURL) { //we are not on the HN homepage
			//go to the HN homepage
			chrome.tabs.update(tab.id, {url: targetURL});
		} else { //we are already on the HN homepage
			//toggle between options 1, 2, 3
			var badgeColor = [255, 0, 0];
			getState(function(state) {
					setState((state % 3) + 1, function() {
							updateIcon(tab.id);
						});
				});
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

//set the icon image to the icon represented by the current state
function updateIcon(tabId) {
	//alert("need to update icon for tab " + tabId);
	var image_19;
	var image_38;

	getState(function(state) {
			switch(state) {
			case 2:
				image_19 = "images/yc_icon_19-2.png";
				image_38 = "images/yc_icon_38-2.png";
				break;
			case 3:
				image_19 = "images/yc_icon_19-3.png";
				image_38 = "images/yc_icon_38-3.png";
				break;
			default:
				image_19 = "images/yc_icon_19.png";
				image_38 = "images/yc_icon_38.png";
				break;
			}

			try {
				chrome.browserAction.setIcon({path: {'19': image_19, '38': image_38}, tabId: tabId});
			} catch(e) { alert(e); }
		});
}


//update icon for all already open Hacker News tabs (should be called at extension launch)
function updateAllHNTabIcons() {
	try {
		chrome.tabs.query({url: "https://news.ycombinator.com/"}, function(HNTabs) {
				for(var i = 0; i < HNTabs.length; i++) {
					updateIcon(HNTabs[i].id);
				}
			});
		alert("starting extension");
	} catch(e) { alert(e); }
}
