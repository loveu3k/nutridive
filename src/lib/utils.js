/**
 * 清理影片標題，移除 YouTube 標籤（#高血壓）與頻道後綴（| 營養深潛）
 * 讓前台 UI 與 SEO Meta Tags 更加整潔、專業，避免關鍵字堆疊
 * 
 * @param {string} rawTitle 原始標題
 * @returns {string} 清理後的標題
 */
export function cleanTitle(rawTitle) {
  if (!rawTitle) return '';
  // 1. 移除所有的 Hashtags（例如 #高血壓 #便秘）
  let clean = rawTitle.replace(/#\S+/g, '');
  // 2. 移除頻道名稱後綴（相容繁簡體及不同的管道符號和空白）
  clean = clean.replace(/\s*[|｜]\s*營養深潛\s*/gi, '');
  clean = clean.replace(/\s*[|｜]\s*营养深潜\s*/gi, '');
  // 3. 去除多餘空格
  return clean.trim();
}
