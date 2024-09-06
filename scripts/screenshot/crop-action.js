import { overLay } from "./crop-box.js";

// input cropped action
export function captureShot({ currentTarget }) {
	const viewBox = overLay.firstElementChild;
	const rect0 = viewBox.getBoundingClientRect();
	const screenHeight = innerHeight;
	const withinViewPort = rect0.height <= screenHeight;
	rect0.y < 0 && viewBox.scrollIntoView();
	if (!withinViewPort) {
		const header = document.querySelector("header");
		fixStickyPosition(header) || fixStickyPosition(header.firstElementChild);
		const nav = document.querySelector("nav");
		fixStickyPosition(nav) || fixStickyPosition(nav.firstElementChild);
		const aside = document.querySelector("aside");
		fixStickyPosition(aside) || fixStickyPosition(aside.firstElementChild);
		/* const footer = document.querySelector("footer");
		fixStickyPosition(footer) || fixStickyPosition(footer.firstElementChild); */
	}

	const rect = viewBox.getBoundingClientRect();
	const coordinate = {
		x: rect.x + 2,
		y: rect.y,
		width: rect.width - 2,
		height: rect.height,
	};
	overLay.hidden = true;
	const pageId = currentTarget.nextElementSibling.value;

	setTimeout(async () => {
		function msgListener(request) {
			request.msg === "scroll" && scrollBy({ top: request.top, behavior: "instant" });
		}
		chrome.runtime.onMessage.addListener(msgListener);
		const message = { msg: "captureShot", coordinate, screenHeight, withinViewPort, pageId };
		const response = await chrome.runtime.sendMessage(message);
		toast("screenshot inserted");
		setTimeout(() => document.querySelector("shot-cropper")?.remove(), 8000);
		chrome.runtime.onMessage.removeListener(msgListener);
	}, 5);
}

function fixStickyPosition(elem) {
	if (!elem) return true;
	const styleMap = elem.computedStyleMap();
	const isStatic = styleMap.get("position").toString() === "static";
	isStatic || (elem.style.position = "static");
	return !isStatic;
}

function toast(msg) {
	const snackbar = overLay.nextElementSibling;
	snackbar["hidden"] = false;
	snackbar.textContent = msg;
	setTimeout(() => (snackbar["hidden"] = true), 5100);
}
