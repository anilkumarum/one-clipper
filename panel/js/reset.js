globalThis.$on = (target, type, callback) => target.addEventListener(type, callback);
globalThis.eId = document.getElementById.bind(document);

// Get element by CSS selector:
globalThis.$ = (selector, scope) => (scope || document).querySelector(selector);

/**@type {chrome.i18n.getMessage} */
globalThis.i18n = chrome.i18n.getMessage.bind(this);
globalThis.setLang = (/** @type {string} */ key) => (eId(key).textContent = chrome.i18n.getMessage(key));

/**@type {chrome.storage.LocalStorageArea['get']} */
globalThis.getStore = chrome.storage.local.get.bind(chrome.storage.local);
/**@type {chrome.storage.LocalStorageArea['set']} */
globalThis.setStore = chrome.storage.local.set.bind(chrome.storage.local);

const snackbar = eId("snackbar");
globalThis.toast = (msg) => {
	snackbar.hidden = false;
	snackbar.innerText = msg;
	setTimeout(() => (snackbar.hidden = true), 5100);
};
