// inject.js
// Provides functions for communicating from the webpage to the content script

//this function is called by clicking link on hackernews
//the content script should be listening for the "linkClicked" event
function onLinkClicked(aElemID, href) {
	if (aElemID !== undefined) {
		var aElem = document.getElementById(aElemID);
		var e = document.createEvent("Events");
		e.initEvent("linkClicked", false, true);
		aElem.dispatchEvent(e);
	}
}
