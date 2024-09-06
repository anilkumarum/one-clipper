import { ReportBug } from "../panel/components/helper/report-bug.js";
// @ts-ignore
import styleCss from "./style.css" assert { type: "css" };
document.adoptedStyleSheets.push(styleCss);

globalThis.eId = document.getElementById.bind(document);
globalThis.$on = (target, type, /** @type {Function} */ callback) => target.addEventListener(type, callback);

const storeData = await chrome.storage.local.get(["hightlightOn"]);
const highlightSwitch = eId("toggle_highlight");
highlightSwitch.checked = storeData.hightlightOn;
$on(highlightSwitch, "change", ({ target }) => {
	chrome.storage.local.set({ hightlightOn: target.checked });
	chrome.runtime.sendMessage({ msg: "toggle_highlight", hightlightOn: target.checked });
});

/**@type {HTMLDialogElement} */
const dialog = eId("host-permission");
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request === "requestHostPermission") {
		dialog.showModal();
		const button = dialog.querySelector("button");
		$on(button, "click", grantPermission);
		async function grantPermission() {
			chrome.permissions.request({ origins: ["<all_urls>"] }).then((granted) => {
				sendResponse(granted);
				button.textContent = `permission ${granted ? "Granted" : "Denied"}`;
				button.style.backgroundColor = granted ? "green" : "red";
				if (granted) {
					chrome.storage.local.set({ hightlightOn: true });
					chrome.runtime.sendMessage({ msg: "toggle_highlight", hightlightOn: true });
					setTimeout(close, 4000);
				}
			});
		}
		return true;
	} else if (request.msg === "reportBug") document.body.appendChild(new ReportBug(request.error));
});
