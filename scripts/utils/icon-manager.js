import { ICON_PATH } from "../constants.js";

export class IconManager {
    constructor(iconBasePath = ICON_PATH) {
        this.iconBasePath = iconBasePath;
        this.totalIcons = 20; // silueta1.png - silueta20.png
    }

    /**
     * Generate all icon paths
     * @returns {string[]} Array of icon paths
     */
    getAllIconPaths() {
        const icons = [];
        for (let i = 1; i <= this.totalIcons; i++) {
            icons.push(`${this.iconBasePath}silueta${i}.png`);
        }
        return icons;
    }

    /**
     * Returns a shuffled subset of icons without repetition
     * @param {number} count - Number of icons to return
     * @returns {string[]} Array of shuffled icon paths
     */
    getShuffledIcons(count) {
        const allIcons = this.getAllIconPaths();
        this.shuffleArray(allIcons);

        return allIcons.slice(0, count);
    }

    /**
     * Fisher-Yates shuffle
     */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}