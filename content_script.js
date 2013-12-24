main();

function main() {
	newHNTabOpened();

	//add openPage code to webpage
	var headElem = document.getElementsByTagName('head')[0];
	var scriptElem = document.createElement('script');
	scriptElem.type = 'text/javascript';
	scriptElem.src = chrome.extension.getURL('inject.js');
	headElem.appendChild(scriptElem);
	
	//add click event listener
	document.addEventListener("linkClicked", function(e) {
			var aElem = e.target;
			openWebPage(aElem.href);
		}, true);
	
	
	//counter for changeLink id's
	var idCounter = 0;
	
	//get elements with class 'title'
	var titleElems = document.getElementsByClassName('title');
	for (var i = 0; i < titleElems.length; i++) {
		//get first anchor tag
		var elem = titleElems[i].getElementsByTagName('a')[0];
		//if anchor tag exists make it open in a new tab
		if (elem !== undefined) {
			changeLink(elem, idCounter++);
		}
	}
	
	//get elements with class 'subtext'
	var subtextElems = document.getElementsByClassName('subtext');
	for (var i = 0; i < subtextElems.length; i++) {
		//get all of the anchor tags
		var linkElems = subtextElems[i].getElementsByTagName('a');
		for (var j = 0; j < linkElems.length; j++) {
			var elem = linkElems[j];
			changeLink(elem, idCounter++);
		}
	}
}

function changeLink(aElem, id) {
	aElem.setAttribute('id', 'HNHelper' + id);
	aElem.setAttribute('onclick', "event.preventDefault(); onLinkClicked(\'" + aElem.id + "\', \'" + aElem.href + "\')");
}

function openWebPage(url) {
	try {
		chrome.runtime.sendMessage({say: "open webpage", url: url}, function(response) {
				console.log("'Hacker News Helper' extension says: " + response.result);
			});
	} catch(e) {
		alert(e);
	}
}

function newHNTabOpened() {
	try {
		chrome.runtime.sendMessage({say: "new HN tab opened"}, function(response) {
				console.log("'Hacker News Helper' extension says: " + response.result);
			});
	} catch(e) {
		alert(e);
	}
}
