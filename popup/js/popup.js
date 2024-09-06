import "../../panel/js/reset.js";
import { bookmarkTab, captureScreenshot, clipArticle, openSidePanel } from "./action.js";
import { ConnectOnenote } from "./connect-onenote.js";
// @ts-ignore
import baseCss from "../style/base.css" assert { type: "css" };
import actionCss from "../style/action-btn.css" assert { type: "css" };
document.adoptedStyleSheets.push(baseCss, actionCss);

chrome.storage.sync.get("onenote").then(({ onenote }) => {
	onenote ?? document.body.appendChild(new ConnectOnenote());
});

const notebookSelect = eId("notebook");
const { notebooks, openNotebook } = await getStore(["notebooks", "openNotebook"]);
notebooks?.forEach((notebook) => {
	const option = document.createElement("option");
	option.value = notebook.id;
	option.textContent = notebook.name.slice(0, 39);
	notebookSelect.appendChild(option);
});
notebookSelect.value = openNotebook;
$on(notebookSelect, "change", async () => {
	await chrome.runtime.sendMessage({ msg: "switchNotebook", notebookId: notebookSelect.value });
});

//bookmark
const bookmarkBtn = eId("bookmark");
const pageSelectElem = bookmarkBtn.previousElementSibling;
const { lastSectionId: sectionId } = await chrome.storage.local.get("lastSectionId");
const { [sectionId]: pages, lastPageId } = await chrome.storage.local.get([sectionId, "lastPageId"]);

pages?.forEach((page) => {
	const option = document.createElement("option");
	option.value = page.id;
	option.textContent = page.title.slice(0, 39);
	pageSelectElem.appendChild(option);
});
pageSelectElem.value = lastPageId;
$on(bookmarkBtn, "click", () => bookmarkTab(pageSelectElem.value));

//screenshot
const screenshotBtn = eId("screenshot");
$on(screenshotBtn, "click", captureScreenshot);

//clip article
const clipArticleBtn = eId("clipArticle");
$on(clipArticleBtn, "click", clipArticle.bind(null, "auto"));

//multi-select text
const mutliSelectBtn = eId("multiSelect");
$on(mutliSelectBtn, "click", clipArticle);

const openPanelBtn = eId("open_panel_btn");
$on(openPanelBtn, "click", openSidePanel);

const keys = {
	KeyA: clipArticle.bind(null, "auto"),
	KeyM: clipArticle,
	KeyS: captureScreenshot,
	KeyT: openSidePanel,
};

function onKeyDown(evt) {
	if (evt.altKey || evt.metaKey) keys[evt.code]?.();
}
document.body.addEventListener("keydown", onKeyDown);
