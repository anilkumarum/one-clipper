"use strict";
let timeId;

function onMouseEnter(event) {
	/**@type {HTMLElement} */
	const element = event.target;
	timeId = setTimeout(() => {
		// prettier-ignore
		if (element === document.body ||element.classList.contains("one-clipped") ||element.parentElement.tagName === "CLIP-ARTICLE-BTN" || !element.innerText)return;
		element.style.backgroundColor = "var(--one-clipper-bgc)";
		element.style.outline = "1px dashed red";
	}, 200);
}

function onMouseLeave(event) {
	timeId && clearTimeout(timeId);
	/**@type {HTMLElement} */
	const element = event.target;
	// prettier-ignore
	if (element === document.body ||element.classList.contains("one-clipped") || element.parentElement.tagName === "CLIP-ARTICLE-BTN" || !element.innerText)return;
	element.style.backgroundColor = "unset";
	element.style.outline = "none";
}

function onMouseDown(event) {
	/**@type {HTMLElement} */
	const element = event.target;
	if (element.parentElement.tagName === "CLIP-ARTICLE-BTN") return;
	element.style.backgroundColor = "rgb(193, 164, 248)";
	element.classList.toggle("one-clipped");
	clipArticleBtn?.isConnected || insertSaveBtn();
}

document.body.addEventListener("mouseout", onMouseLeave);
document.body.addEventListener("mouseover", onMouseEnter);
document.body.addEventListener("mousedown", onMouseDown);

let pageList;
async function selectPage({ target }) {
	if (target.value === "openPageList") {
		if (pageList) return pageList.showPopover();

		// const { PageList } = await import(chrome.runtime.getURL("/common/page-list.js"));
		// pageList = new PageList();
		clipArticleBtn.appendChild(pageList);
		setTimeout(() => pageList.showPopover(), 100);
	}
}

async function onClipBtnClick() {
	const elements = document.body.querySelectorAll(".one-clipped");
	const htmlContent = Array.prototype.map.call(elements, (elem) => elem.outerHTML).join("\n");
	await chrome.runtime.sendMessage({ htmlContent, pageId: clipArticleBtn.firstElementChild["value"] });
	document.body.removeEventListener("mouseout", onMouseLeave);
	document.body.removeEventListener("mouseover", onMouseEnter);
	document.body.removeEventListener("mousedown", onMouseDown);
	for (const elem of elements) {
		elem.classList.remove("one-clipped");
		elem["style"].backgroundColor = "unset";
		elem["style"].outline = "none";
	}
	clipArticleBtn.remove();
}

/**@type {HTMLElement} */
var clipArticleBtn;
async function insertSaveBtn() {
	const { lastSectionId: sectionId } = await chrome.storage.local.get("lastSectionId");
	const { [sectionId]: pages, lastPageId } = await chrome.storage.local.get([sectionId, "lastPageId"]);
	clipArticleBtn = document.createElement("clip-article-btn");
	clipArticleBtn.innerHTML = `<select name="pages">
				<option value="createPage">Create new page</option>
				${pages?.map((page) => `<option value="${page.id}">${page.title.slice(0, 24)}</option>`).join("")}
			</select>
			<span>✂️ Clip Selected</span>`;
	document.body.appendChild(clipArticleBtn);
	clipArticleBtn.firstElementChild["value"] = lastPageId;
	clipArticleBtn.lastElementChild.addEventListener("click", onClipBtnClick);
}

// @ts-ignore
const cssStyleSheet = new CSSStyleSheet();
cssStyleSheet.replace(`
	:root {
		--one-clipper-bgc: wheat;
	}
	@media (prefers-color-scheme: dark) {
		:root {
			--one-clipper-bgc: rgb(90, 90, 90)
		}
	}
	clip-article-btn {
		position: fixed;
		bottom: 1em;
		right: 1em;
		z-index: 1000;

		& select {
			width: 100%;
			border-radius: 0.4em 0.4em 0 0;
		}

		& span {
			display: block;
			border-radius: 0 0 0.4em 0.4em;
			padding: 0.2em 0.5em;
			font-size: 18px;
			color: white;
			background-color: rgb(132, 0, 255);
			box-shadow: rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px;
			cursor: pointer;
		}
	}`);
document.adoptedStyleSheets.push(cssStyleSheet);
