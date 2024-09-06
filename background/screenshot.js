import { patchScreenshot } from "./api-request.js";

export class Screenshoter {
	constructor(cordinate, screenHeight, tabId) {
		this.coordinate = cordinate;
		this.screenHeight = screenHeight;
		this.tabId = tabId;
	}

	async captureVisibleScreen() {
		try {
			const img64Url = await chrome.tabs.captureVisibleTab({ format: "png" });
			return await (await fetch(img64Url)).blob();
		} catch (error) {
			await new Promise((r) => setTimeout(r, 1000));
			return await this.captureVisibleScreen();
		}
	}

	async captureViewportShot() {
		const cord = this.coordinate;
		const img64Url = await chrome.tabs.captureVisibleTab({ format: "png" });
		const shotBlob = await (await fetch(img64Url)).blob();
		const imageBitmap = await createImageBitmap(shotBlob, cord.x, cord.y, cord.width, cord.height);

		const canvas = new OffscreenCanvas(cord.width, cord.height);
		const ctx = canvas.getContext("bitmaprenderer");
		ctx.transferFromImageBitmap(imageBitmap);
		imageBitmap.close();
		return await canvas.convertToBlob({ type: "image/png" });
	}

	async captureAndUpload({ withinViewPort, pageId }) {
		try {
			const shotBlob = await this.captureViewportShot();

			await patchScreenshot(shotBlob, pageId);
			setStore({ lastPageId: pageId });
			return "success";
		} catch (error) {
			console.log(error);
		}
	}
}
