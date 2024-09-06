"use strict";
const previewBoxElem = document.createElement("clipped-article-preview");
previewBoxElem.attachShadow({ mode: "open" });
const previewBox = previewBoxElem.shadowRoot;

previewBox.innerHTML = `<style>
:host {
	--article-bgc: hsl(0, 0%, 100%);
	--txt-clr: hsl(0, 0%, 5%);
	display: block;
	width: 70%;
	position: fixed;
	left: 15%;
	top: 10%;
	z-index: 2000;
	padding-inline: 0.4em;
	padding-bottom: 0.4em;
}

@media (prefers-color-scheme: dark) {
	:host {
		--txt-clr: #bdc1c6;
		--article-bgc: hsl(0, 0%, 22%);
	}
}

clip-saver-bar {
	display: flex;
	flex-direction: row-reverse;

	& button:first-child {
		border: none;
		border-radius: 0 0.4em 0 0;
		padding: 0.2em 0.5em;
		font-size: 16px;
		color: white;
		background-color: rgb(0, 162, 255);
		cursor: pointer;
	}
}

clipped-article {
	display: block;
	max-height: 86vh;
	overflow-y: auto;
	padding-inline: 0.4em;
	background-color: var(--article-bgc);
	color: var(--txt-clr);
	box-shadow: rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px;
	border-radius: 0.5em 0 0.5em 0.5em;
	border: 4px solid rgb(132, 0, 255);

	& img {
		max-width: 100%;
	}

	& pre {
		margin-left: 1em;
		padding: 0.5em;
		background-color: rgb(33 33 33);
	}
}


output {
	min-width: 8em;
	background-color: #333;
	color: rgb(255, 208, 0);
	text-align: center;
	border-radius: 12px;
    padding: 4px 8px;
	position: fixed;
	z-index: 1000;
	left: 40%;
	bottom: 20px;
	width: max-content;
	translate: 0 200%;
	animation: in-out 4s ease-out;
}

@keyframes in-out {
	10%,
	90% {
		translate: 0 0;
	}
}
</style> 
<clipped-article-preview>
	<clip-saver-bar>
		<button>✂️ Clip Article</button>
		<select name="databases"></select>
		<button class="close-btn">❌</button>	
	</clip-saver-bar>
	<clipped-article contenteditable="true" spellcheck="false"></clipped-article>
</clipped-article-preview>
<output hidden></output>`;

document.body.appendChild(previewBoxElem);
const dbSelectElem = previewBox.querySelector("select");

function getArticleRoot() {
	return (
		document.getElementById("post") ??
		document.getElementById("blog") ??
		document.body.querySelector("article") ??
		document.getElementById("content") ??
		document.body.querySelector("[class='container']") ??
		document.body.querySelector("[id^='post']") ??
		document.body.querySelector("[class~='blog']") ??
		document.body.querySelector("[class~='content']") ??
		document.body.querySelector("[id~='content']") ??
		document.body.querySelector("[class~='container']") ??
		document.body.querySelector("main") ??
		document.body
	);
}

const clippedArticle = previewBox.querySelector("clipped-article");
//prettier-ignore
const ignoreTags = new Set(["SCRIPT", "STYLE", "IFRAME", "svg", "CANVAS", "FOOTER", "ASIDE", "NAV","META","LINK","BUTTON","LABEL","INPUT","TEXTAREA","SELECT","BUTTON", "DATALIST","FORM","MENU","NOSCRIPT","EMBED","OBJECT","PROGRESS","SLOT","TEMPLATE"]);
//prettier-ignore
const ignoreClasses = ["nav","toc","sidebar","footer", "sticky","banner","share","dropdown","author","edit","ignore","subscribe","breadcrumb","rating","meta","tags","feed","related","newsletter"];
const docFrag = new DocumentFragment();

/** @param {HTMLCollection} childNodes, @param {DocumentFragment|HTMLElement} parentElement*/
function insertChildNodes(childNodes, parentElement) {
	childNodes: for (const node of childNodes) {
		if (node.nodeType === 1) {
			if (ignoreTags.has(node.tagName)) continue;
			if (node.tagName === "IMG" && node["width"] < 50) continue;

			for (const igClass of ignoreClasses) {
				if (node.className.toLowerCase()?.includes?.(igClass) || node.id.toLowerCase()?.includes?.(igClass))
					continue childNodes;
			}

			const nwElem = node.cloneNode();
			nwElem["removeAttribute"]("style");
			// @ts-ignore
			node.hasChildNodes() && insertChildNodes(node.childNodes, nwElem);
			parentElement.appendChild(nwElem);
		} else if (node.nodeType === 3) parentElement.appendChild(node.cloneNode());
	}
}
const elements = getArticleRoot().children;
insertChildNodes(elements, docFrag);
clippedArticle.appendChild(docFrag);

async function clipArticle() {
	const sectionId = "";
	await chrome.runtime.sendMessage({
		htmlContent: clippedArticle.innerHTML,
		sectionId: sectionId,
	});
	toast("Article clipped to oneNote");
	clippedArticle.parentElement.remove();
	setTimeout(() => previewBoxElem.remove(), 5100);
}

previewBox.querySelector("button").addEventListener("click", clipArticle);
previewBox.querySelector("button.close-btn").addEventListener("click", () => previewBoxElem.remove());

chrome.storage.local.get("openNotebook").then(async ({ openNotebook: notebookId }) => {
	if (!notebookId) return;
	const { [notebookId]: sections, lastSectionId } = await chrome.storage.local.get([notebookId, "lastSectionId"]);
	dbSelectElem.innerHTML += sections.map((db) => `<option value="${db.id}">${db.name}</option>`).join("");
	dbSelectElem.value = lastSectionId;
});

function toast(msg) {
	const snackbar = previewBox.lastElementChild;
	snackbar["hidden"] = false;
	snackbar.textContent = msg;
	setTimeout(() => (snackbar["hidden"] = true), 5100);
}
