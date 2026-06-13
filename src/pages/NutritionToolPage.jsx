import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import { DRI_STANDARDS, NUTRIENT_COLORS } from '../data/driDatabase';
import { isConfigured } from '../lib/supabase';
import {
  lookupDRI,
  getIntakeStatus,
  getRdaPercentage,
  getUlMarkerPosition,
  getStatusColor,
  getAllNutrientNames,
} from '../data/driHelpers';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const GOALS = ['均衡營養', '增肌減脂', '骨骼健康', '心血管保養', '免疫提升', '腸道健康'];
const STORAGE_KEY = 'nutrition_tool_draft';

// ── sessionStorage 序列化 / 反序列化 ─────────────────
function saveDraft(state) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* 忽略 */ }
}

function loadDraft() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      sessionStorage.removeItem(STORAGE_KEY);
      return JSON.parse(raw);
    }
  } catch { /* 忽略 */ }
  return null;
}

export default function NutritionToolPage() {
  const { user } = useAuth();
  const showLock = isConfigured && !user;
  const cardRef = useRef(null);

  // ── 從 sessionStorage 恢復或使用預設值 ────────────
  const draft = useRef(loadDraft());
  const d = draft.current;

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedNutrients, setSelectedNutrients] = useState(d?.selectedNutrients ?? []);
  const [intakeValues, setIntakeValues] = useState(d?.intakeValues ?? {});
  const [selectedGoal, setSelectedGoal] = useState(d?.selectedGoal ?? '均衡營養');
  const [userName, setUserName] = useState(d?.userName ?? '');
  const [downloading, setDownloading] = useState(false);

  // ── 個人資訊 ──────────────────────────────────────
  const [age, setAge] = useState(d?.age ?? 30);
  const [gender, setGender] = useState(d?.gender ?? 'male');
  const [isPregnant, setIsPregnant] = useState(d?.isPregnant ?? false);
  const [standard, setStandard] = useState(d?.standard ?? 'TW');
  const [standardOpen, setStandardOpen] = useState(false);

  // ── pendingAction：登入成功後自動執行 ──────────────
  const [pendingAction, setPendingAction] = useState(d?.pendingAction ?? null);

  // 登入成功後自動下載
  useEffect(() => {
    if (user && pendingAction) {
      const timer = setTimeout(() => {
        if (pendingAction === 'download_image') handleDownloadImage(true);
        if (pendingAction === 'download_pdf') handleDownloadPDF(true);
        setPendingAction(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, pendingAction]);

  // ── DRI lookup（用 useMemo 式邏輯）───────────────
  const getNutrientDRI = useCallback(
    (name) => lookupDRI(standard, name, age, gender, isPregnant),
    [standard, age, gender, isPregnant]
  );

  const allNutrients = getAllNutrientNames();

  // ── 營養素選擇 ────────────────────────────────────
  const toggleNutrient = (name) => {
    setSelectedNutrients((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const updateIntake = (name, value) => {
    setIntakeValues((prev) => ({ ...prev, [name]: value }));
  };

  // ── sessionStorage 暫存 ──────────────────────────
  const saveCurrentState = useCallback(() => {
    saveDraft({
      selectedNutrients, intakeValues, selectedGoal, userName,
      age, gender, isPregnant, standard, pendingAction: null,
    });
  }, [selectedNutrients, intakeValues, selectedGoal, userName, age, gender, isPregnant, standard]);

  // ── 觸發 Auth 前暫存 ─────────────────────────────
  const triggerAuth = (action) => {
    saveDraft({
      selectedNutrients, intakeValues, selectedGoal, userName,
      age, gender, isPregnant, standard, pendingAction: action,
    });
    setAuthModalOpen(true);
  };

  // ── 下載圖片 ─────────────────────────────────────
  const handleDownloadImage = async (skipAuthCheck = false) => {
    if (isConfigured && !skipAuthCheck && !user) {
      triggerAuth('download_image');
      return;
    }
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `營養深潛-每日營養卡-${new Date().toLocaleDateString('zh-TW')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download image error:', err);
    }
    setDownloading(false);
  };

  // ── 下載 PDF ──────────────────────────────────────
  const handleDownloadPDF = async (skipAuthCheck = false) => {
    if (isConfigured && !skipAuthCheck && !user) {
      triggerAuth('download_pdf');
      return;
    }
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
      pdf.save(`營養深潛-每日營養卡-${new Date().toLocaleDateString('zh-TW')}.pdf`);
    } catch (err) {
      console.error('Download PDF error:', err);
    }
    setDownloading(false);
  };

  // ── 日期 ──────────────────────────────────────────
  const today = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const currentStandard = DRI_STANDARDS.find((s) => s.key === standard);

  // ══════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="text-center mb-10 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-500/10 text-accent-600 text-sm font-medium mb-4">
          <span>🧬</span>
          精準科學工具
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-surface-900 mb-3">
          每日營養卡
        </h1>
        <p className="text-surface-500 max-w-2xl mx-auto">
          依據你的年齡、性別與國際權威標準，精準計算每日建議攝取量。
          輸入你的營養攝取數據，即時生成專屬營養卡片。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ════════ Left: Form ════════ */}
        <div className="space-y-5 animate-slide-up">
          {/* ── 個人資訊 + 標準選擇 ── */}
          <div className="rounded-2xl border border-surface-200 bg-white p-6 space-y-5">
            <h3 className="flex items-center gap-2 text-sm font-bold text-surface-800">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs">📋</span>
              個人資訊
            </h3>

            {/* 名字 */}
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1.5">名字（選填）</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="顯示在卡片上的名字"
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
              />
            </div>

            {/* 年齡 + 性別 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">年齡</label>
                <div className="relative">
                  <input
                    type="number"
                    min="19"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(Math.max(19, Math.min(120, parseInt(e.target.value) || 19)))}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-surface-400">歲</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-surface-500 mb-1.5">性別</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setGender('male'); setIsPregnant(false); }}
                    className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      gender === 'male'
                        ? 'bg-blue-50 text-blue-700 ring-2 ring-blue-300'
                        : 'bg-surface-50 text-surface-600 hover:bg-surface-100'
                    }`}
                  >
                    ♂ 男
                  </button>
                  <button
                    onClick={() => setGender('female')}
                    className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      gender === 'female'
                        ? 'bg-pink-50 text-pink-700 ring-2 ring-pink-300'
                        : 'bg-surface-50 text-surface-600 hover:bg-surface-100'
                    }`}
                  >
                    ♀ 女
                  </button>
                </div>
              </div>
            </div>

            {/* 孕期/哺乳期 */}
            {gender === 'female' && (
              <label className="flex items-center gap-3 p-3 rounded-xl bg-pink-50/50 border border-pink-100 cursor-pointer transition-all hover:bg-pink-50">
                <input
                  type="checkbox"
                  checked={isPregnant}
                  onChange={(e) => setIsPregnant(e.target.checked)}
                  className="w-4 h-4 rounded border-pink-300 text-pink-600 focus:ring-pink-200"
                />
                <div>
                  <span className="text-sm font-medium text-pink-800">孕期 / 哺乳期</span>
                  <p className="text-xs text-pink-500 mt-0.5">部分營養素建議攝取量會提高</p>
                </div>
              </label>
            )}

            {/* 參考標準選擇 */}
            <div>
              <label className="block text-xs font-medium text-surface-500 mb-1.5">📊 參考標準</label>
              <div className="relative">
                <button
                  onClick={() => setStandardOpen(!standardOpen)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-surface-200 bg-white hover:border-primary-300 transition-all text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{currentStandard?.flag}</span>
                    <span className="font-medium text-surface-800">{currentStandard?.name}</span>
                  </span>
                  <svg className={`w-4 h-4 text-surface-400 transition-transform ${standardOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {standardOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-surface-200 rounded-xl shadow-lg overflow-hidden animate-scale-in">
                    {DRI_STANDARDS.map((s) => (
                      <button
                        key={s.key}
                        onClick={() => { setStandard(s.key); setStandardOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors ${
                          standard === s.key
                            ? 'bg-primary-50 text-primary-700 font-semibold'
                            : 'text-surface-700 hover:bg-surface-50'
                        }`}
                      >
                        <span className="text-lg">{s.flag}</span>
                        {s.name}
                        {standard === s.key && (
                          <svg className="w-4 h-4 ml-auto text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── 健康目標 ── */}
          <div className="rounded-2xl border border-surface-200 bg-white p-6">
            <h3 className="flex items-center gap-2 text-sm font-bold text-surface-800 mb-3">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white text-xs">🎯</span>
              健康目標
            </h3>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((goal) => (
                <button
                  key={goal}
                  onClick={() => setSelectedGoal(goal)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedGoal === goal
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          {/* ── 營養素選擇 ── */}
          <div className="rounded-2xl border border-surface-200 bg-white p-6">
            <h3 className="flex items-center gap-2 text-sm font-bold text-surface-800 mb-3">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs">💊</span>
              選擇營養素（可多選）
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {allNutrients.map((name) => {
                const color = NUTRIENT_COLORS[name];
                return (
                  <button
                    key={name}
                    onClick={() => toggleNutrient(name)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                      selectedNutrients.includes(name)
                        ? 'bg-primary-50 text-primary-700 ring-2 ring-primary-300'
                        : 'bg-surface-50 text-surface-600 hover:bg-surface-100'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${color} shrink-0`} />
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── 攝取量輸入 ── */}
          {selectedNutrients.length > 0 && (
            <div className="rounded-2xl border border-surface-200 bg-white p-6">
              <h3 className="flex items-center gap-2 text-sm font-bold text-surface-800 mb-3">
                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs">📝</span>
                每日攝取量
              </h3>
              <div className="space-y-3">
                {selectedNutrients.map((name) => {
                  const dri = getNutrientDRI(name);
                  const intake = parseFloat(intakeValues[name]) || 0;
                  const status = dri ? getIntakeStatus(intake, dri.rda, dri.ul) : 'empty';

                  return (
                    <div key={name}>
                      <div className="flex items-center gap-3">
                        <label className="w-24 text-sm text-surface-700 font-medium shrink-0">{name}</label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={intakeValues[name] || ''}
                          onChange={(e) => updateIntake(name, e.target.value)}
                          placeholder={dri ? `建議 ${dri.rda}` : '—'}
                          className={`flex-1 px-3 py-2 rounded-lg border outline-none text-sm transition-all ${
                            status === 'danger'
                              ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-red-50/30'
                              : 'border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100'
                          }`}
                        />
                        <span className="text-xs text-surface-400 w-8">{dri?.unit ?? ''}</span>
                      </div>
                      {/* UL 超量警告 */}
                      {status === 'danger' && dri?.ul && (
                        <div className="mt-1.5 ml-27 flex items-center gap-1.5 text-xs text-red-600 font-medium animate-fade-in">
                          <svg className="w-3.5 h-3.5 shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.999L13.732 4.001c-.77-1.333-2.694-1.333-3.464 0L3.34 16.001c-.77 1.332.192 2.999 1.732 2.999z" />
                          </svg>
                          已超過每日安全上限（UL: {dri.ul}{dri.unit}）
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ════════ Right: Card Preview + Download ════════ */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="sticky top-24">
            {/* ── 營養卡預覽 ── */}
            <div
              ref={cardRef}
              className="nutrition-card-preview rounded-2xl overflow-hidden shadow-xl"
              style={{
                background: 'linear-gradient(135deg, #065f46 0%, #047857 30%, #059669 60%, #0d9488 100%)',
              }}
            >
              {/* Card Header */}
              <div className="px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🧬</span>
                    <span className="text-white/80 text-sm font-medium">營養深潛</span>
                  </div>
                  <span className="text-white/60 text-xs">{today}</span>
                </div>
                <h2 className="text-white text-xl font-bold mt-3">
                  {userName ? `${userName} 的每日營養卡` : '我的每日營養卡'}
                </h2>
                <div className="flex flex-wrap gap-2 mt-2">
                  <div className="inline-block px-3 py-1 rounded-full bg-white/15 text-white/90 text-xs font-medium">
                    🎯 {selectedGoal}
                  </div>
                  <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs">
                    {currentStandard?.flag} {currentStandard?.name?.split(' ')[0]}
                  </div>
                </div>
              </div>

              {/* Nutrients Progress Bars */}
              <div className="px-6 pb-6">
                {selectedNutrients.length === 0 ? (
                  <div className="py-8 text-center text-white/50 text-sm">
                    ← 請在左側選擇營養素
                  </div>
                ) : (
                  <div className="space-y-3 mt-2">
                    {selectedNutrients.map((name) => {
                      const dri = getNutrientDRI(name);
                      if (!dri) return null;

                      const intake = parseFloat(intakeValues[name]) || 0;
                      const pct = getRdaPercentage(intake, dri.rda);
                      const status = getIntakeStatus(intake, dri.rda, dri.ul);
                      const statusColor = getStatusColor(status);
                      const ulMarkerPos = getUlMarkerPosition(dri.rda, dri.ul);
                      const color = NUTRIENT_COLORS[name];
                      const barColor = status === 'danger' ? 'from-red-500 to-red-600' : color;

                      return (
                        <div key={name}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className={`font-medium ${status === 'danger' ? 'text-red-300' : 'text-white'}`}>
                              {name}
                              {status === 'danger' && <span className="ml-1 animate-pulse">⚠️</span>}
                            </span>
                            <span className="text-white/70 text-xs">
                              {intake || '—'} / {dri.rda} {dri.unit}
                              {pct > 0 && (
                                <span className={`ml-1.5 font-bold ${statusColor.text}`}>
                                  {pct}%
                                </span>
                              )}
                            </span>
                          </div>
                          {/* Progress Bar Container */}
                          <div className="relative">
                            <div className="h-2.5 rounded-full bg-white/15 overflow-hidden">
                              <div
                                className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500`}
                                style={{ width: `${Math.min(pct / 2, 100)}%` }}
                              />
                            </div>
                            {/* UL Marker Line */}
                            {ulMarkerPos !== null && (
                              <div
                                className="absolute top-0 h-2.5 w-px border-l border-dashed border-white/40"
                                style={{ left: `${ulMarkerPos}%` }}
                                title={`UL: ${dri.ul}${dri.unit}`}
                              />
                            )}
                            {/* 100% RDA Marker */}
                            <div
                              className="absolute top-0 h-2.5 w-px bg-white/25"
                              style={{ left: '50%' }}
                            />
                          </div>
                          {/* Danger Warning on Card */}
                          {status === 'danger' && dri.ul && (
                            <p className="text-red-300 text-[10px] mt-0.5 flex items-center gap-1">
                              <span className="animate-pulse">⚠️</span>
                              超過安全上限 UL {dri.ul}{dri.unit}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Card Legend */}
              {selectedNutrients.length > 0 && (
                <div className="px-6 py-2 bg-black/10 flex items-center justify-center gap-4 text-[10px] text-white/50">
                  <span className="flex items-center gap-1">
                    <span className="w-4 h-1.5 rounded-full bg-white/25 inline-block" />
                    50% = RDA 100%
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-px h-2.5 border-l border-dashed border-white/40 inline-block" />
                    UL 上限
                  </span>
                </div>
              )}

              {/* Card Footer */}
              <div className="px-6 py-3 bg-black/15 text-center">
                <p className="text-white/40 text-xs">營養深潛 — 用科學探索營養的深度 | nutrideep.com</p>
              </div>
            </div>

            {/* ── Download Buttons ── */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleDownloadImage()}
                disabled={downloading || selectedNutrients.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                下載圖片
                {showLock && <span className="text-xs opacity-70">🔒</span>}
              </button>
              <button
                onClick={() => handleDownloadPDF()}
                disabled={downloading || selectedNutrients.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 ring-1 ring-primary-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                下載 PDF
                {showLock && <span className="text-xs opacity-70">🔒</span>}
              </button>
            </div>
            {showLock && (
              <p className="text-center text-xs text-surface-400 mt-2">
                🔒 下載功能需要登入
              </p>
            )}
            {!isConfigured && (
              <p className="text-center text-xs text-emerald-600 mt-2 font-medium">
                💡 目前為資料庫離線測試模式，已為您自動解鎖下載功能！
              </p>
            )}
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        returnTo="/nutrition-tool"
      />
    </div>
  );
}
