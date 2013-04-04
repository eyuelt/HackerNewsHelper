//init idCounter for changeLink
idCounter = 0;

//add openPage code to page
var headElem = document.getElementsByTagName('head')[0];
var scriptElem = document.createElement('script');
scriptElem.type = 'text/javascript';
scriptElem.src = chrome.extension.getURL('inject.js');
headElem.appendChild(scriptElem);

//add click event listener
document.addEventListener("linkClicked", function(e) {
	var aElem = e.target;
	var href = aElem.href;
	aElem.setAttribute('href', 'javascript:void(0)');
	openPageInNewTab(href);
}, true);


//get elements with class 'title'
var titleElems = document.getElementsByClassName('title');
for (var i = 0; i < titleElems.length; i++) {
    //get first anchor tag
	var elem = titleElems[i].getElementsByTagName('a')[0];
	//if anchor tag exists make it open in a new tab
	if (elem !== undefined) {
		changeLink(elem);
	}
}

//get elements with class 'subtext'
var subtextElems = document.getElementsByClassName('subtext');
for (var i = 0; i < subtextElems.length; i++) {
	//get all of the anchor tags
	var linkElems = subtextElems[i].getElementsByTagName('a');
	for (var j = 0; j < linkElems.length; j++) {
		var elem = linkElems[j];
		changeLink(elem);
	}
}


function changeLink(aElem) {
	aElem.setAttribute('id', 'HNHelper' + idCounter++);
	aElem.setAttribute('onclick', "onLinkClicked(\'" + aElem.id + "\', \'" + aElem.href + "\')");
	aElem.setAttribute('href', 'javascript:void(0)');
}

function openPageInNewTab(url) {
	try {
		chrome.runtime.sendMessage({say: "open new tab", url: url, focusOnNewTab: false}, callback);
	} catch(e) {
		alert(e);
	}
}

function callback(response) {
	console.log("'HackerNewsHelper extension' says: " + response.result);
}
