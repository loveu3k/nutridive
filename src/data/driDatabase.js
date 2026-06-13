/**
 * 多國膳食營養素參考攝取量 (DRI) 數據庫
 *
 * 支持標準：
 *  - TW:     台灣衛福部《國人膳食營養素參考攝取量》(114年版)
 *  - US_NIH: 美國國家衛生研究院 (NIH / IOM)
 *  - EU_EFSA: 歐盟食品安全局 (EFSA)
 *  - CN:     中國營養學會《中國居民膳食營養素參考攝取量》
 *
 * 資料範圍：成人 (19–50 / 51–70 / 71+)
 * 欄位說明：
 *   ageMin/ageMax  — 年齡區間（含）
 *   gender         — "male" | "female" | "any"
 *   isPregnant     — 僅 gender="female" 時有意義；true = 孕期或哺乳期
 *   rda            — 建議攝取量 (RDA 或 AI)
 *   ul             — 可耐受最高攝取量（null = 尚未訂定）
 *   unit           — 計量單位
 *   color          — Tailwind 漸層色 class
 */

// ── 所有營養素名稱（14 種）──────────────────────────────
export const NUTRIENT_NAMES = [
  '維生素A', '維生素B12', '維生素C', '維生素D', '維生素E', '維生素K',
  '鈣', '鐵', '鎂', '鋅',
  'Omega-3', '蛋白質', '膳食纖維', '葉酸',
];

// ── 營養素顏色映射（與原始設計一致）──────────────────────
export const NUTRIENT_COLORS = {
  '維生素A':   'from-orange-400 to-amber-500',
  '維生素B12': 'from-rose-400 to-pink-500',
  '維生素C':   'from-yellow-400 to-orange-400',
  '維生素D':   'from-amber-300 to-yellow-500',
  '維生素E':   'from-lime-400 to-green-500',
  '維生素K':   'from-emerald-400 to-teal-500',
  '鈣':       'from-sky-400 to-blue-500',
  '鐵':       'from-red-400 to-rose-500',
  '鎂':       'from-violet-400 to-purple-500',
  '鋅':       'from-cyan-400 to-teal-500',
  'Omega-3':  'from-blue-400 to-indigo-500',
  '蛋白質':   'from-fuchsia-400 to-purple-500',
  '膳食纖維': 'from-green-400 to-emerald-500',
  '葉酸':     'from-teal-400 to-cyan-500',
};

// ── 標準清單（供 UI 下拉選單）────────────────────────────
export const DRI_STANDARDS = [
  { key: 'TW',      flag: '🇹🇼', name: '台灣衛福部 DRI (114年版)' },
  { key: 'US_NIH',  flag: '🇺🇸', name: '美國國家衛生研究院 (NIH)' },
  { key: 'EU_EFSA', flag: '🇪🇺', name: '歐盟食品安全局 (EFSA)' },
  { key: 'CN',      flag: '🇨🇳', name: '中國營養學會 DRIs' },
];

// ══════════════════════════════════════════════════════════
//  DRI_DATABASE — 核心數據
// ══════════════════════════════════════════════════════════

export const DRI_DATABASE = {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  🇹🇼 台灣衛福部
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  TW: {
    name: '台灣衛福部 DRI (114年版)',
    nutrients: {
      '維生素A': [
        { ageMin: 19, ageMax: 50, gender: 'male',   rda: 600,  ul: 3000, unit: 'μg' },
        { ageMin: 51, ageMax: 70, gender: 'male',   rda: 600,  ul: 3000, unit: 'μg' },
        { ageMin: 71, ageMax: 150, gender: 'male',  rda: 600,  ul: 3000, unit: 'μg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: false, rda: 500,  ul: 3000, unit: 'μg' },
        { ageMin: 51, ageMax: 70, gender: 'female', isPregnant: false, rda: 500,  ul: 3000, unit: 'μg' },
        { ageMin: 71, ageMax: 150, gender: 'female', isPregnant: false, rda: 500,  ul: 3000, unit: 'μg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true,  rda: 600,  ul: 3000, unit: 'μg' },
      ],
      '維生素B12': [
        { ageMin: 19, ageMax: 150, gender: 'any', rda: 2.4, ul: null, unit: 'μg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true, rda: 2.6, ul: null, unit: 'μg' },
      ],
      '維生素C': [
        { ageMin: 19, ageMax: 150, gender: 'male',   rda: 100, ul: 2000, unit: 'mg' },
        { ageMin: 19, ageMax: 150, gender: 'female', isPregnant: false, rda: 100, ul: 2000, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true,  rda: 110, ul: 2000, unit: 'mg' },
      ],
      '維生素D': [
        { ageMin: 19, ageMax: 50, gender: 'any', rda: 10,  ul: 50, unit: 'μg' },
        { ageMin: 51, ageMax: 70, gender: 'any', rda: 15,  ul: 50, unit: 'μg' },
        { ageMin: 71, ageMax: 150, gender: 'any', rda: 15, ul: 50, unit: 'μg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true, rda: 10, ul: 50, unit: 'μg' },
      ],
      '維生素E': [
        { ageMin: 19, ageMax: 150, gender: 'male',   rda: 12, ul: 1000, unit: 'mg' },
        { ageMin: 19, ageMax: 150, gender: 'female', isPregnant: false, rda: 12, ul: 1000, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true,  rda: 14, ul: 1000, unit: 'mg' },
      ],
      '維生素K': [
        { ageMin: 19, ageMax: 150, gender: 'male',   rda: 120, ul: null, unit: 'μg' },
        { ageMin: 19, ageMax: 150, gender: 'female', isPregnant: false, rda: 90,  ul: null, unit: 'μg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true,  rda: 90,  ul: null, unit: 'μg' },
      ],
      '鈣': [
        { ageMin: 19, ageMax: 50, gender: 'any', rda: 1000, ul: 2500, unit: 'mg' },
        { ageMin: 51, ageMax: 70, gender: 'any', rda: 1000, ul: 2500, unit: 'mg' },
        { ageMin: 71, ageMax: 150, gender: 'any', rda: 1200, ul: 2500, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true, rda: 1000, ul: 2500, unit: 'mg' },
      ],
      '鐵': [
        { ageMin: 19, ageMax: 50, gender: 'male',   rda: 10,  ul: 40, unit: 'mg' },
        { ageMin: 51, ageMax: 150, gender: 'male',  rda: 10,  ul: 40, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: false, rda: 15,  ul: 40, unit: 'mg' },
        { ageMin: 51, ageMax: 150, gender: 'female', isPregnant: false, rda: 10,  ul: 40, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true,  rda: 45,  ul: 40, unit: 'mg' },
      ],
      '鎂': [
        { ageMin: 19, ageMax: 30, gender: 'male',   rda: 380, ul: 700, unit: 'mg' },
        { ageMin: 31, ageMax: 150, gender: 'male',  rda: 380, ul: 700, unit: 'mg' },
        { ageMin: 19, ageMax: 30, gender: 'female', isPregnant: false, rda: 320, ul: 700, unit: 'mg' },
        { ageMin: 31, ageMax: 150, gender: 'female', isPregnant: false, rda: 320, ul: 700, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true,  rda: 355, ul: 700, unit: 'mg' },
      ],
      '鋅': [
        { ageMin: 19, ageMax: 150, gender: 'male',   rda: 15,  ul: 35, unit: 'mg' },
        { ageMin: 19, ageMax: 150, gender: 'female', isPregnant: false, rda: 12,  ul: 35, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true,  rda: 15,  ul: 35, unit: 'mg' },
      ],
      'Omega-3': [
        { ageMin: 19, ageMax: 150, gender: 'male',   rda: 1600, ul: null, unit: 'mg' },
        { ageMin: 19, ageMax: 150, gender: 'female', isPregnant: false, rda: 1100, ul: null, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true,  rda: 1400, ul: null, unit: 'mg' },
      ],
      '蛋白質': [
        { ageMin: 19, ageMax: 70, gender: 'male',   rda: 60, ul: null, unit: 'g' },
        { ageMin: 71, ageMax: 150, gender: 'male',  rda: 55, ul: null, unit: 'g' },
        { ageMin: 19, ageMax: 70, gender: 'female', isPregnant: false, rda: 50, ul: null, unit: 'g' },
        { ageMin: 71, ageMax: 150, gender: 'female', isPregnant: false, rda: 50, ul: null, unit: 'g' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true,  rda: 60, ul: null, unit: 'g' },
      ],
      '膳食纖維': [
        { ageMin: 19, ageMax: 50, gender: 'male',   rda: 25, ul: null, unit: 'g' },
        { ageMin: 51, ageMax: 150, gender: 'male',  rda: 20, ul: null, unit: 'g' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: false, rda: 20, ul: null, unit: 'g' },
        { ageMin: 51, ageMax: 150, gender: 'female', isPregnant: false, rda: 20, ul: null, unit: 'g' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true,  rda: 25, ul: null, unit: 'g' },
      ],
      '葉酸': [
        { ageMin: 19, ageMax: 150, gender: 'any', rda: 400, ul: 1000, unit: 'μg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true, rda: 600, ul: 1000, unit: 'μg' },
      ],
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  🇺🇸 美國 NIH / IOM
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  US_NIH: {
    name: '美國國家衛生研究院 (NIH)',
    nutrients: {
      '維生素A': [
        { ageMin: 19, ageMax: 150, gender: 'male',   rda: 900,  ul: 3000, unit: 'μg' },
        { ageMin: 19, ageMax: 150, gender: 'female', isPregnant: false, rda: 700,  ul: 3000, unit: 'μg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true,  rda: 770,  ul: 3000, unit: 'μg' },
      ],
      '維生素B12': [
        { ageMin: 19, ageMax: 150, gender: 'any', rda: 2.4, ul: null, unit: 'μg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true, rda: 2.6, ul: null, unit: 'μg' },
      ],
      '維生素C': [
        { ageMin: 19, ageMax: 150, gender: 'male',   rda: 90,  ul: 2000, unit: 'mg' },
        { ageMin: 19, ageMax: 150, gender: 'female', isPregnant: false, rda: 75,  ul: 2000, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true,  rda: 85,  ul: 2000, unit: 'mg' },
      ],
      '維生素D': [
        { ageMin: 19, ageMax: 70, gender: 'any', rda: 15,  ul: 100, unit: 'μg' },
        { ageMin: 71, ageMax: 150, gender: 'any', rda: 20, ul: 100, unit: 'μg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true, rda: 15, ul: 100, unit: 'μg' },
      ],
      '維生素E': [
        { ageMin: 19, ageMax: 150, gender: 'any', rda: 15, ul: 1000, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true, rda: 15, ul: 1000, unit: 'mg' },
      ],
      '維生素K': [
        { ageMin: 19, ageMax: 150, gender: 'male',   rda: 120, ul: null, unit: 'μg' },
        { ageMin: 19, ageMax: 150, gender: 'female', isPregnant: false, rda: 90,  ul: null, unit: 'μg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true,  rda: 90,  ul: null, unit: 'μg' },
      ],
      '鈣': [
        { ageMin: 19, ageMax: 50, gender: 'any', rda: 1000, ul: 2500, unit: 'mg' },
        { ageMin: 51, ageMax: 70, gender: 'male', rda: 1000, ul: 2000, unit: 'mg' },
        { ageMin: 51, ageMax: 70, gender: 'female', isPregnant: false, rda: 1200, ul: 2000, unit: 'mg' },
        { ageMin: 71, ageMax: 150, gender: 'any', rda: 1200, ul: 2000, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true, rda: 1000, ul: 2500, unit: 'mg' },
      ],
      '鐵': [
        { ageMin: 19, ageMax: 50, gender: 'male',   rda: 8,   ul: 45, unit: 'mg' },
        { ageMin: 51, ageMax: 150, gender: 'male',  rda: 8,   ul: 45, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: false, rda: 18,  ul: 45, unit: 'mg' },
        { ageMin: 51, ageMax: 150, gender: 'female', isPregnant: false, rda: 8,   ul: 45, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true,  rda: 27,  ul: 45, unit: 'mg' },
      ],
      '鎂': [
        { ageMin: 19, ageMax: 30, gender: 'male',   rda: 400, ul: 350, unit: 'mg' },
        { ageMin: 31, ageMax: 150, gender: 'male',  rda: 420, ul: 350, unit: 'mg' },
        { ageMin: 19, ageMax: 30, gender: 'female', isPregnant: false, rda: 310, ul: 350, unit: 'mg' },
        { ageMin: 31, ageMax: 150, gender: 'female', isPregnant: false, rda: 320, ul: 350, unit: 'mg' },
        { ageMin: 19, ageMax: 30, gender: 'female', isPregnant: true,  rda: 350, ul: 350, unit: 'mg' },
        { ageMin: 31, ageMax: 50, gender: 'female', isPregnant: true,  rda: 360, ul: 350, unit: 'mg' },
      ],
      '鋅': [
        { ageMin: 19, ageMax: 150, gender: 'male',   rda: 11,  ul: 40, unit: 'mg' },
        { ageMin: 19, ageMax: 150, gender: 'female', isPregnant: false, rda: 8,   ul: 40, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true,  rda: 11,  ul: 40, unit: 'mg' },
      ],
      'Omega-3': [
        { ageMin: 19, ageMax: 150, gender: 'male',   rda: 1600, ul: null, unit: 'mg' },
        { ageMin: 19, ageMax: 150, gender: 'female', isPregnant: false, rda: 1100, ul: null, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true,  rda: 1400, ul: null, unit: 'mg' },
      ],
      '蛋白質': [
        { ageMin: 19, ageMax: 150, gender: 'male',   rda: 56, ul: null, unit: 'g' },
        { ageMin: 19, ageMax: 150, gender: 'female', isPregnant: false, rda: 46, ul: null, unit: 'g' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true,  rda: 71, ul: null, unit: 'g' },
      ],
      '膳食纖維': [
        { ageMin: 19, ageMax: 50, gender: 'male',   rda: 38, ul: null, unit: 'g' },
        { ageMin: 51, ageMax: 150, gender: 'male',  rda: 30, ul: null, unit: 'g' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: false, rda: 25, ul: null, unit: 'g' },
        { ageMin: 51, ageMax: 150, gender: 'female', isPregnant: false, rda: 21, ul: null, unit: 'g' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true,  rda: 28, ul: null, unit: 'g' },
      ],
      '葉酸': [
        { ageMin: 19, ageMax: 150, gender: 'any', rda: 400, ul: 1000, unit: 'μg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true, rda: 600, ul: 1000, unit: 'μg' },
      ],
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  🇪🇺 歐盟 EFSA
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  EU_EFSA: {
    name: '歐盟食品安全局 (EFSA)',
    nutrients: {
      '維生素A': [
        { ageMin: 19, ageMax: 150, gender: 'male',   rda: 750,  ul: 3000, unit: 'μg' },
        { ageMin: 19, ageMax: 150, gender: 'female', isPregnant: false, rda: 650,  ul: 3000, unit: 'μg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true,  rda: 700,  ul: 3000, unit: 'μg' },
      ],
      '維生素B12': [
        { ageMin: 19, ageMax: 150, gender: 'any', rda: 4.0, ul: null, unit: 'μg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true, rda: 4.5, ul: null, unit: 'μg' },
      ],
      '維生素C': [
        { ageMin: 19, ageMax: 150, gender: 'male',   rda: 110, ul: null, unit: 'mg' },
        { ageMin: 19, ageMax: 150, gender: 'female', isPregnant: false, rda: 95,  ul: null, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true,  rda: 105, ul: null, unit: 'mg' },
      ],
      '維生素D': [
        { ageMin: 19, ageMax: 150, gender: 'any', rda: 15, ul: 100, unit: 'μg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true, rda: 15, ul: 100, unit: 'μg' },
      ],
      '維生素E': [
        { ageMin: 19, ageMax: 150, gender: 'male',   rda: 13, ul: 300, unit: 'mg' },
        { ageMin: 19, ageMax: 150, gender: 'female', isPregnant: false, rda: 11, ul: 300, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true,  rda: 11, ul: 300, unit: 'mg' },
      ],
      '維生素K': [
        { ageMin: 19, ageMax: 150, gender: 'any', rda: 70, ul: null, unit: 'μg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true, rda: 70, ul: null, unit: 'μg' },
      ],
      '鈣': [
        { ageMin: 19, ageMax: 24, gender: 'any', rda: 1000, ul: 2500, unit: 'mg' },
        { ageMin: 25, ageMax: 150, gender: 'any', rda: 950, ul: 2500, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true, rda: 1000, ul: 2500, unit: 'mg' },
      ],
      '鐵': [
        { ageMin: 19, ageMax: 150, gender: 'male',   rda: 11,  ul: null, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: false, rda: 16,  ul: null, unit: 'mg' },
        { ageMin: 51, ageMax: 150, gender: 'female', isPregnant: false, rda: 11,  ul: null, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true,  rda: 16,  ul: null, unit: 'mg' },
      ],
      '鎂': [
        { ageMin: 19, ageMax: 150, gender: 'male',   rda: 350, ul: 250, unit: 'mg' },
        { ageMin: 19, ageMax: 150, gender: 'female', isPregnant: false, rda: 300, ul: 250, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true,  rda: 300, ul: 250, unit: 'mg' },
      ],
      '鋅': [
        { ageMin: 19, ageMax: 150, gender: 'male',   rda: 12.7, ul: 25, unit: 'mg' },
        { ageMin: 19, ageMax: 150, gender: 'female', isPregnant: false, rda: 9.4,  ul: 25, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true,  rda: 11.3, ul: 25, unit: 'mg' },
      ],
      'Omega-3': [
        { ageMin: 19, ageMax: 150, gender: 'any', rda: 250, ul: null, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true, rda: 450, ul: null, unit: 'mg' },
      ],
      '蛋白質': [
        { ageMin: 19, ageMax: 150, gender: 'any', rda: 58, ul: null, unit: 'g' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true, rda: 67, ul: null, unit: 'g' },
      ],
      '膳食纖維': [
        { ageMin: 19, ageMax: 150, gender: 'any', rda: 25, ul: null, unit: 'g' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true, rda: 25, ul: null, unit: 'g' },
      ],
      '葉酸': [
        { ageMin: 19, ageMax: 150, gender: 'any', rda: 330, ul: 1000, unit: 'μg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true, rda: 600, ul: 1000, unit: 'μg' },
      ],
    },
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //  🇨🇳 中國營養學會
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  CN: {
    name: '中國營養學會 DRIs',
    nutrients: {
      '維生素A': [
        { ageMin: 19, ageMax: 150, gender: 'male',   rda: 800,  ul: 3000, unit: 'μg' },
        { ageMin: 19, ageMax: 150, gender: 'female', isPregnant: false, rda: 700,  ul: 3000, unit: 'μg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true,  rda: 900,  ul: 3000, unit: 'μg' },
      ],
      '維生素B12': [
        { ageMin: 19, ageMax: 150, gender: 'any', rda: 2.4, ul: null, unit: 'μg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true, rda: 2.8, ul: null, unit: 'μg' },
      ],
      '維生素C': [
        { ageMin: 19, ageMax: 150, gender: 'any', rda: 100, ul: 2000, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true, rda: 115, ul: 2000, unit: 'mg' },
      ],
      '維生素D': [
        { ageMin: 19, ageMax: 64, gender: 'any', rda: 10,  ul: 50, unit: 'μg' },
        { ageMin: 65, ageMax: 150, gender: 'any', rda: 15, ul: 50, unit: 'μg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true, rda: 10, ul: 50, unit: 'μg' },
      ],
      '維生素E': [
        { ageMin: 19, ageMax: 150, gender: 'any', rda: 14, ul: 700, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true, rda: 14, ul: 700, unit: 'mg' },
      ],
      '維生素K': [
        { ageMin: 19, ageMax: 150, gender: 'any', rda: 80, ul: null, unit: 'μg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true, rda: 80, ul: null, unit: 'μg' },
      ],
      '鈣': [
        { ageMin: 19, ageMax: 50, gender: 'any', rda: 800, ul: 2000, unit: 'mg' },
        { ageMin: 51, ageMax: 150, gender: 'any', rda: 1000, ul: 2000, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true, rda: 1000, ul: 2000, unit: 'mg' },
      ],
      '鐵': [
        { ageMin: 19, ageMax: 150, gender: 'male',   rda: 12,  ul: 42, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: false, rda: 20,  ul: 42, unit: 'mg' },
        { ageMin: 51, ageMax: 150, gender: 'female', isPregnant: false, rda: 12,  ul: 42, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true,  rda: 29,  ul: 42, unit: 'mg' },
      ],
      '鎂': [
        { ageMin: 19, ageMax: 150, gender: 'male',   rda: 340, ul: 700, unit: 'mg' },
        { ageMin: 19, ageMax: 150, gender: 'female', isPregnant: false, rda: 310, ul: 700, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true,  rda: 370, ul: 700, unit: 'mg' },
      ],
      '鋅': [
        { ageMin: 19, ageMax: 150, gender: 'male',   rda: 12.5, ul: 40, unit: 'mg' },
        { ageMin: 19, ageMax: 150, gender: 'female', isPregnant: false, rda: 7.5,  ul: 40, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true,  rda: 9.5,  ul: 40, unit: 'mg' },
      ],
      'Omega-3': [
        { ageMin: 19, ageMax: 150, gender: 'any', rda: 1600, ul: null, unit: 'mg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true, rda: 2000, ul: null, unit: 'mg' },
      ],
      '蛋白質': [
        { ageMin: 19, ageMax: 64, gender: 'male',   rda: 65, ul: null, unit: 'g' },
        { ageMin: 65, ageMax: 150, gender: 'male',  rda: 65, ul: null, unit: 'g' },
        { ageMin: 19, ageMax: 64, gender: 'female', isPregnant: false, rda: 55, ul: null, unit: 'g' },
        { ageMin: 65, ageMax: 150, gender: 'female', isPregnant: false, rda: 55, ul: null, unit: 'g' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true,  rda: 70, ul: null, unit: 'g' },
      ],
      '膳食纖維': [
        { ageMin: 19, ageMax: 150, gender: 'any', rda: 25, ul: null, unit: 'g' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true, rda: 25, ul: null, unit: 'g' },
      ],
      '葉酸': [
        { ageMin: 19, ageMax: 150, gender: 'any', rda: 400, ul: 1000, unit: 'μg' },
        { ageMin: 19, ageMax: 50, gender: 'female', isPregnant: true, rda: 600, ul: 1000, unit: 'μg' },
      ],
    },
  },
};
