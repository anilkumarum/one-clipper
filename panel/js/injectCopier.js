function copyScript() {
	const port = chrome.runtime.connect({ name: location.host });
	port.onMessage.addListener(function (msg) {});
	port.onDisconnect.addListener(() => {
		document.body.removeEventListener("copy", sendSelectedContent);
		document.body.removeEventListener("mousedown", onMouseDown);
		document.body.removeEventListener("keydown", onKeyDown);
	});

	function onKeyDown(evt) {
		if (evt.ctrlKey) {
			evt.code === "KeyZ"
				? port.postMessage({ command: "Undo" })
				: evt.code === "KeyY" && port.postMessage({ command: "Redo" });
		} else if ((evt.altKey || evt.metaKey) && evt.code === "KeyH") {
			globalThis.markClipperHighlighter?.highlightSelected(false);
			sendSelectedContent();
			getSelection().removeAllRanges();
		}
	}

	function onMouseDown() {
		port.postMessage({ command: "saveCaret" });
	}

	async function sendSelectedContent() {
		const selection = getSelection();
		if (selection.isCollapsed) return;
		const range = selection.getRangeAt(0);
		const parentTag = range.commonAncestorContainer.parentElement["tagName"].toLowerCase();
		const parentElem = document.createElement(parentTag);
		parentElem.appendChild(range.cloneContents());
		port.postMessage({ command: "copied", htmlContent: parentElem.outerHTML });
	}

	document.body.addEventListener("copy", sendSelectedContent);
	document.body.addEventListener("mousedown", onMouseDown);
	addEventListener("keydown", onKeyDown);
	import(chrome.runtime.getURL("scripts/highlighter/Highlighter.js"));
	console.log("oneClipper script injected");
}

export async function injectCopier(tabId, info) {
	if (info.status === "complete") {
		try {
			await chrome.scripting.executeScript({
				target: { tabId: tabId, allFrames: true },
				func: copyScript,
			});
		} catch (error) {}
	}
}
