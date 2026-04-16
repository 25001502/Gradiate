/**
 * avatarUtils.js
 * Generates DiceBear cartoon-style avatar URLs from a seed + style.
 * No image uploads or Firebase Storage required.
 * API docs: https://www.dicebear.com/how-to-use/http-api/
 */

const DICEBEAR_BASE = "https://api.dicebear.com/7.x";

export const AVATAR_STYLES = [
  { key: "bottts", label: "Robot" },
  { key: "fun-emoji", label: "Emoji" },
  { key: "lorelei", label: "Illustrated" },
  { key: "micah", label: "Portrait" },
  { key: "pixel-art", label: "Pixel" },
  { key: "thumbs", label: "Thumbs" },
];

export const DEFAULT_AVATAR_STYLE = "bottts";

/**
 * Returns a DiceBear SVG avatar URL for the given seed and style.
 * The same seed + style always produces the same avatar.
 *
 * @param {string} seed  — unique value (e.g. Firebase UID)
 * @param {string} style — one of AVATAR_STYLES[].key
 * @returns {string} full URL to the SVG avatar
 */
export function getAvatarUrl(seed, style = DEFAULT_AVATAR_STYLE) {
  if (!seed) return "";
  return `${DICEBEAR_BASE}/${style}/svg?seed=${encodeURIComponent(seed)}`;
}
