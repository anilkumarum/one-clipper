import { setResizer, startSelector } from "./crop-selector.js";
import { captureShot } from "./crop-action.js";
// @ts-ignore
import cropCss from "./shot-cropper.css" assert { type: "css" };

export const $on = (target, type, callback) => target.addEventListener(type, callback),
	$onO = (target, type, callback) => target.addEventListener(type, callback, { once: true });

function cropUi(pages) {
	return `<article class="overlay">
			<div class="view-box">
				<span class="top-left"></span>
				<span class="top-right"></span>
				<span class="bottom-left"></span>
				<span class="bottom-right"></span>
				<var class="left"></var>
				<var class="top"></var>
				<var class="right"></var>
				<var class="bottom"></var>
			</div>
			<div class="crop-action-wrapper" hidden>
				<div class="crop-action">
					<button class="capture">Capture</button>
					<select>
						<option value="createPage">Create new page</option>
						${pages.map((page) => `<option value="${page.id}">${page.title}</option>`).join("")}
					</select>
					<button>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
							<path fill="red" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
						</svg>
					</button>
				</div>
			</div>
		</article>
		<output hidden></output>`;
}

export async function createCropUI() {
	const { lastSectionId: sectionId } = await chrome.storage.local.get("lastSectionId");
	const { [sectionId]: pages, lastPageId } = await chrome.storage.local.get([sectionId, "lastPageId"]);
	const shotCropper = document.createElement("shot-cropper");
	shotCropper.attachShadow({ mode: "open" });
	shotCropper.shadowRoot.adoptedStyleSheets = [cropCss];
	shotCropper.shadowRoot.innerHTML = cropUi(pages ?? []);

	setListener();
	setInitialData(shotCropper);
	shotCropper.shadowRoot.querySelector("select").value = lastPageId;

	return shotCropper;
}

/**@type {HTMLDivElement} */
export let overLay;
function setInitialData(shotCropper) {
	const bodyHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
	overLay = shotCropper.shadowRoot.firstElementChild;
	overLay.style.bottom = innerHeight - bodyHeight + "px";
	overLay.style.borderBottomWidth = bodyHeight + "px";
	overLay.style.cursor = "crosshair";
}

function setOverLaySdw({ pageX, pageY }) {
	const bdrRight = document.body.offsetWidth - pageX;
	const bodyHeight = document.body.scrollHeight;
	overLay.style.borderWidth = `${pageY}px ${bdrRight}px ${bodyHeight}px ${pageX}px`;

	const viewBox = overLay.firstElementChild;
	viewBox["style"].visibility = "visible";
	$on(viewBox, "mousedown", setResizer);
	startSelector("bottom-right");
}

function setListener() {
	$onO(document.body, "mousedown", setOverLaySdw);
	$onO(document.body, "mouseup", setCropActionListener);
}

function setCropActionListener() {
	getSelection().collapseToEnd();
	const cropAction = overLay.lastElementChild.firstElementChild;
	$on(cropAction.firstElementChild, "click", captureShot);
	$on(cropAction.lastElementChild, "click", () => overLay.remove());
}
