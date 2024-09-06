(async function insertCropper() {
	const { createCropUI } = await import("./crop-box.js");
	const shotCropper = await createCropUI();
	document.body.appendChild(shotCropper);
})();
