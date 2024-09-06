import { BASE_URL, getHeaders } from "./api-request.js";
import { reportBug } from "./util.js";

/**@param {Request} request*/
async function getRequest(request) {
	try {
		const response = await fetch(request);
		const data = await response.json();
		if (response.ok) return data;
		response.status > 400 && reportBug(JSON.parse(data).error);
	} catch (error) {
		reportBug(error);
		console.error(error);
	}
}

export async function getNoteBookList() {
	const url = `${BASE_URL}/notebooks`;
	const headers = await getHeaders();
	const request = new Request(url, { method: "GET", headers });
	const data = await getRequest(request);
	const notebooks = data.value.map((notebook) => ({ id: notebook.id, name: notebook.displayName }));
	setStore({ notebooks, openNotebook: notebooks[0].id });
	return notebooks;
}

/**@param {string} notebookId*/
export async function getNoteBookSections(notebookId) {
	const url = `${BASE_URL}/notebooks/${notebookId}/sections`;
	const headers = await getHeaders();
	const request = new Request(url, { method: "GET", headers });
	const data = await getRequest(request);
	const sections = data.value.map((section) => ({ id: section.id, name: section.displayName }));
	setStore({ [notebookId]: sections, lastSectionId: sections[0].id });
	return sections;
}

/**@param {string} sectionId*/
export async function getSectionPages(sectionId) {
	const url = `${BASE_URL}/sections/${sectionId}/pages`;
	const headers = await getHeaders();
	const request = new Request(url, { method: "GET", headers });
	const data = await getRequest(request);
	const pages = data.value.map((page) => ({ id: page.id, title: page.title }));
	setStore({ [sectionId]: pages });
	return pages;
}
