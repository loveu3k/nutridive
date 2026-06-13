/**
 * DRI 數據查詢與計算工具函數
 *
 * 從 driDatabase.js 中根據使用者條件（標準 / 年齡 / 性別 / 孕哺）
 * 查詢對應的 RDA、UL，並判斷攝取量狀態。
 */
import { DRI_DATABASE, NUTRIENT_COLORS, NUTRIENT_NAMES } from './driDatabase';

/**
 * 查詢特定營養素的 DRI 數據
 *
 * @param {string} standard  - 標準代碼：'TW' | 'US_NIH' | 'EU_EFSA' | 'CN'
 * @param {string} name      - 營養素名稱（如 '鈣'）
 * @param {number} age       - 使用者年齡
 * @param {string} gender    - 'male' | 'female'
 * @param {boolean} isPregnant - 是否孕期/哺乳期
 * @returns {{ rda: number, ul: number|null, unit: string, color: string } | null}
 */
export function lookupDRI(standard, name, age, gender, isPregnant = false) {
  const db = DRI_DATABASE[standard];
  if (!db) return null;

  const entries = db.nutrients[name];
  if (!entries || entries.length === 0) return null;

  // 優先匹配順序：精確 gender + isPregnant > 精確 gender > "any"
  let bestMatch = null;
  let bestScore = -1;

  for (const entry of entries) {
    // 年齡範圍檢查
    if (age < entry.ageMin || age > entry.ageMax) continue;

    let score = 0;

    // 性別匹配
    if (entry.gender === gender) {
      score += 10;
    } else if (entry.gender === 'any') {
      score += 5;
    } else {
      continue; // 性別不匹配，跳過
    }

    // 孕哺狀態匹配（僅 female 才有意義）
    if (gender === 'female' && isPregnant) {
      if (entry.isPregnant === true) {
        score += 20; // 精確匹配孕哺
      } else if (entry.isPregnant === undefined && entry.gender === 'any') {
        // 'any' 條目不指定 isPregnant，可以作為 fallback
        score += 1;
      }
      // isPregnant === false 的條目不應匹配孕婦
      else if (entry.isPregnant === false) {
        score -= 5;
      }
    } else {
      // 非孕哺：優先匹配 isPregnant === false 或未指定的
      if (entry.isPregnant === true) {
        continue; // 非孕婦不應匹配孕婦資料
      }
      if (entry.isPregnant === false) {
        score += 3;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  if (!bestMatch) {
    // 寬鬆 fallback：只要年齡範圍匹配就行
    for (const entry of entries) {
      if (age >= entry.ageMin && age <= entry.ageMax) {
        bestMatch = entry;
        break;
      }
    }
  }

  if (!bestMatch) return null;

  return {
    rda: bestMatch.rda,
    ul: bestMatch.ul,
    unit: bestMatch.unit,
    color: NUTRIENT_COLORS[name] || 'from-gray-400 to-gray-500',
  };
}

/**
 * 判斷攝取量狀態
 *
 * @param {number} intake - 實際攝取量
 * @param {number} rda    - 建議攝取量
 * @param {number|null} ul - 可耐受最高攝取量（null = 無上限）
 * @returns {'empty' | 'low' | 'adequate' | 'over_rda' | 'danger'}
 */
export function getIntakeStatus(intake, rda, ul) {
  if (!intake || intake <= 0) return 'empty';
  const pctRda = (intake / rda) * 100;
  if (ul !== null && intake > ul) return 'danger';
  if (pctRda >= 100) return 'over_rda';
  if (pctRda >= 70) return 'adequate';
  return 'low';
}

/**
 * 計算 RDA 百分比（封頂 200%）
 */
export function getRdaPercentage(intake, rda) {
  if (!intake || intake <= 0 || !rda) return 0;
  return Math.min(Math.round((intake / rda) * 100), 200);
}

/**
 * 計算 UL 在進度條上的位置百分比
 * 以 RDA 100% 為基準，UL 位置 = (UL / RDA) * 100
 * 進度條最大顯示 200%，所以 UL marker 不超過 100%（的 bar 寬度）
 */
export function getUlMarkerPosition(rda, ul) {
  if (!ul || !rda) return null;
  const pos = (ul / rda) * 100;
  // 進度條按 200% RDA 為滿寬，所以實際位置要除以 2
  return Math.min(pos / 2, 100);
}

/**
 * 獲取狀態對應的顏色
 */
export function getStatusColor(status) {
  switch (status) {
    case 'danger':   return { text: 'text-red-400', bar: 'from-red-500 to-red-600', bg: 'bg-red-500' };
    case 'over_rda': return { text: 'text-green-300', bar: null, bg: null }; // 使用原色
    case 'adequate': return { text: 'text-green-300', bar: null, bg: null };
    case 'low':      return { text: 'text-amber-300', bar: null, bg: null };
    default:         return { text: 'text-white/50', bar: null, bg: null };
  }
}

/**
 * 取得所有營養素名稱
 */
export function getAllNutrientNames() {
  return NUTRIENT_NAMES;
}
