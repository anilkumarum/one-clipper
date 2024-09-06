"use strict";
if (!globalThis.highlightCommander) {
	class HighlightCommander {
		/**@type {Range[]} */
		highlightedRanges = [];
		position = 0;
		pageId;

		constructor() {
			if (CSS["highlights"].has("keepClipper-highlight"))
				this.highlight = CSS["highlights"].get("keepClipper-highlight");
			else {
				// @ts-ignore
				this.highlight = new Highlight();
				CSS["highlights"].set("keepClipper-highlight", this.highlight);
				const styleElem = document.createElement("style");
				styleElem.innerHTML = `*::highlight(keepClipper-highlight) {background-color: yellow;color:black}`;
				document.head.appendChild(styleElem);
			}

			this.pageId = location.href.split("#", 1)[0].slice(8, 100);
			this.fetchSavedHighlights();
			document.body.addEventListener("keyup", (evt) => evt.ctrlKey && evt.shiftKey && this.undoRedo[evt.code]?.());
		}

		#addChildIndexOnElem() {
			/**@param {HTMLCollection} children*/
			function setIndex(children) {
				for (let index = 0; index < children.length; index++) {
					const element = children[index];
					Object.defineProperty(element, "markerIdx", { value: index });
					if (element.childElementCount > 0) setIndex(element.children);
				}
			}
			setIndex(document.body.children);
		}

		/**@param {Range[]} ranges*/
		async saveAllHighlights(ranges) {
			this.#addChildIndexOnElem();
			this.highlightedRanges.push(...ranges);
			const { HighlightRange } = await import("./HighlightRange.js");
			const highlightRanges = ranges.map((range) => new HighlightRange(range));
			const pageHighlights = (await chrome.storage.local.get(this.pageId))[this.pageId] ?? [];
			pageHighlights.push(...highlightRanges);
			await chrome.storage.local.set({ [this.pageId]: pageHighlights });
		}

		undoRedo = {
			KeyZ: () => {
				if (this.position < 0) return;
				this.position--;
				const highlightRange = this.highlightedRanges[this.position];
				this.highlight.delete(highlightRange);
				this.removeHightlightFromStore();
			},

			KeyY: () => {
				if (this.position >= this.highlightedRanges.length) return;
				const highlightRange = this.highlightedRanges[this.position];
				this.highlight.add(highlightRange);
				this.saveHightlightInStore(highlightRange);
				this.position++;
			},
		};

		async removeHightlightFromStore() {
			const pageHighlights = (await chrome.storage.local.get(this.pageId))[this.pageId] ?? [];
			pageHighlights.splice(this.position, 1);
			await chrome.storage.local.set({ [this.pageId]: pageHighlights });
		}

		/**@param {Range} range*/
		async saveHightlightInStore(range) {
			const { HighlightRange } = await import("./HighlightRange.js");
			const highlightRange = new HighlightRange(range);
			const pageHighlights = (await chrome.storage.local.get(this.pageId))[this.pageId] ?? [];
			pageHighlights.push(highlightRange);
			await chrome.storage.local.set({ [this.pageId]: pageHighlights });
		}

		/** @param {import('./HighlightRange.js').HighlightRange} highlight*/
		applyHighlight(highlight) {
			function getParentElem(parentTree, parentElem = document.body) {
				// @ts-ignore
				for (const elemIdx of parentTree) parentElem = parentElem.children[elemIdx];
				return parentElem;
			}

			const commonParentElem = getParentElem(highlight.commonParentTree);
			const range = new Range();
			const startParentElem = highlight.startParents
				? getParentElem(highlight.startParents, commonParentElem)
				: commonParentElem;
			const startTxtNode = startParentElem.childNodes[highlight.startTxtNodeIdx];
			range.setStart(startTxtNode, highlight.startOffset);

			const endParentElem = highlight.endParents
				? getParentElem(highlight.endParents, commonParentElem)
				: commonParentElem;
			const endTxtNode = endParentElem.childNodes[highlight.endTxtNodeIdx];
			range.setEnd(endTxtNode, highlight.endOffset);
			this.highlight.add(range);
			this.highlightedRanges.push(range);
		}

		async fetchSavedHighlights() {
			const pageHighlights = (await chrome.storage.local.get(this.pageId))[this.pageId];
			if (pageHighlights) {
				pageHighlights.forEach(this.applyHighlight.bind(this));
				this.position = pageHighlights.length;
			}
		}

		clearHighlights() {
			this.highlight.clear();
		}

		async removeHighlights() {
			this.clearHighlights();
			await chrome.storage.local.remove(this.pageId);
		}
	}

	globalThis.highlightCommander = new HighlightCommander();
}
