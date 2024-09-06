import { addContextMenu } from "./contextMenu.js";
import { reportBug } from "./util.js";

export const BASE_URL = "https://graph.microsoft.com/v1.0/me/onenote";

/**@param {Request} request*/
async function sendRequest(request) {
	try {
		const response = await fetch(request);
		const data = await response.text();
		if (response.ok) return data;
		response.status > 400 && reportBug(JSON.parse(data).error);
	} catch (error) {
		reportBug(error);
		console.error(error);
	}
}

async function refreshAccessToken() {
	const TOKEN_URL = "https://cloud.oneclipper.noterail.site/api/get-onenote-token";
	const { ROP_ORE, KTM_RU } = await chrome.storage.sync.get(["ROP_ORE", "KTM_RU"]);
	try {
		const response = await fetch(TOKEN_URL, { headers: { "User-Key": KTM_RU } });
		const data = await response.text();
		if (response.ok) {
			chrome.storage.sync.set({ ROP_ORE: data, refreshAt: Date.now() + 3600 });
			return data;
		}
	} catch (error) {
		reportBug(error);
		console.error(error);
	}
}

export async function getHeaders(contentType) {
	const { OROP_ORE, refreshAt } = await chrome.storage.sync.get(["ROP_ORE", "refreshAt"]);
	const token = refreshAt > Date.now() ? OROP_ORE : await refreshAccessToken();

	const headers = new Headers({ Authorization: "Bearer " + token });
	contentType && headers.append("Content-Type", contentType);
	return headers;
}

export async function createHTMLPage(htmlContent, sectionId, pageTitle) {
	sectionId ??= (await getStore("lastSectionId")).lastSectionId;
	//get sectionId
	const url = `${BASE_URL}/sections/${sectionId}/pages`;
	const headers = await getHeaders("text/html");
	const body = `<html>
		<head>
			<title>${pageTitle ?? new Date().toISOString()}</title>
			<meta name="created" content="${new Date().toISOString()}" />
		</head>
		<body>${htmlContent}</body>
  	</html>`;
	const request = new Request(url, { method: "PATCH", headers, body });
	const data = await sendRequest(request);
	if (!data) return;
	const json = JSON.parse(data);
	const sectionName = ""; //TODO
	const page = { id: json.id, title: json.title, path: sectionName };
	const pages = (await getStore([sectionId]))[sectionId];
	pages.push(page);
	setStore({ [sectionId]: pages, lastPage: page, lastPageId: page.id });
	addContextMenu(page.id, page.title);
	return page;
}

/* export async function createMultipartPage(sectionId, htmlContent, images) {
	const url = `${BASE_URL}/sections/${sectionId}/pages`;
	const headers = await getHeaders();
	
	const jsonBlob = new Blob([htmlContent], { type: "text/html" });
	const formData = new FormData();
	formData.append("Presentation", jsonBlob);
	images.forEach((value,key) => formData.append(key, value));
	
	const request = new Request(url, { method: "POST", headers, body: formData });
	return await sendRequest(request);
} */

export async function patchHTMLContent(htmlContent, pageId) {
	pageId ??= (await getStore("lastPageuId")).lastPageId;
	if (pageId === "createPage") return createHTMLPage(htmlContent);
	setStore({ lastPageId: pageId });
	const url = `${BASE_URL}/pages/${pageId}/contents`;
	const headers = await getHeaders("application/json");

	const body = [
		{
			target: "div",
			action: "insert",
			content: htmlContent,
		},
	];
	const request = new Request(url, { method: "PATCH", headers, body: JSON.stringify(body) });
	return await sendRequest(request);
}

export async function patchHTMLContentWithImages(htmlContent, pageId, images) {
	pageId ??= (await getStore("lastPageId")).lastPageId;
	const url = `${BASE_URL}/pages/${pageId}/content`;
	const headers = await getHeaders();

	const jsonContent = [
		{
			target: "div",
			action: "isert",
			content: htmlContent,
		},
	];
	const jsonBlob = new Blob([JSON.stringify(jsonContent)], { type: "application/json" });
	const formData = new FormData();
	formData.append("Command", jsonBlob);
	images.forEach((value, key) => formData.append(key, value));
	const request = new Request(url, { method: "PUT", headers, body: formData });
	return await sendRequest(request);
}

export async function patchScreenshot(screenshotBlob, pageId) {
	const url = `${BASE_URL}/pages/${pageId}/content`;
	const headers = await getHeaders();

	const shotName = Date.now().toString();
	const jsonContent = [
		{
			target: "div",
			action: "insert",
			content: `<img src='name:${shotName}' alt='' />`,
		},
	];
	const jsonBlob = new Blob([JSON.stringify(jsonContent)], { type: "application/json" });
	const formData = new FormData();
	formData.append("Command", jsonBlob);
	formData.append(shotName, screenshotBlob);
	const request = new Request(url, { method: "PUT", headers, body: formData });
	return await sendRequest(request);
}
