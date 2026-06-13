import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const NUTRIENT_OPTIONS = [
  { name: '維生素A', unit: 'μg', rda: 900, color: 'from-orange-400 to-amber-500' },
  { name: '維生素B12', unit: 'μg', rda: 2.4, color: 'from-rose-400 to-pink-500' },
  { name: '維生素C', unit: 'mg', rda: 90, color: 'from-yellow-400 to-orange-400' },
  { name: '維生素D', unit: 'μg', rda: 15, color: 'from-amber-300 to-yellow-500' },
  { name: '維生素E', unit: 'mg', rda: 15, color: 'from-lime-400 to-green-500' },
  { name: '維生素K', unit: 'μg', rda: 120, color: 'from-emerald-400 to-teal-500' },
  { name: '鈣', unit: 'mg', rda: 1000, color: 'from-sky-400 to-blue-500' },
  { name: '鐵', unit: 'mg', rda: 18, color: 'from-red-400 to-rose-500' },
  { name: '鎂', unit: 'mg', rda: 400, color: 'from-violet-400 to-purple-500' },
  { name: '鋅', unit: 'mg', rda: 11, color: 'from-cyan-400 to-teal-500' },
  { name: 'Omega-3', unit: 'mg', rda: 1600, color: 'from-blue-400 to-indigo-500' },
  { name: '蛋白質', unit: 'g', rda: 50, color: 'from-fuchsia-400 to-purple-500' },
  { name: '膳食纖維', unit: 'g', rda: 25, color: 'from-green-400 to-emerald-500' },
  { name: '葉酸', unit: 'μg', rda: 400, color: 'from-teal-400 to-cyan-500' },
];

const GOALS = ['均衡營養', '增肌減脂', '骨骼健康', '心血管保養', '免疫提升', '腸道健康'];

export default function NutritionToolPage() {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedNutrients, setSelectedNutrients] = useState([]);
  const [intakeValues, setIntakeValues] = useState({});
  const [selectedGoal, setSelectedGoal] = useState('均衡營養');
  const [userName, setUserName] = useState('');
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef(null);

  const toggleNutrient = (name) => {
    setSelectedNutrients((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const updateIntake = (name, value) => {
    setIntakeValues((prev) => ({ ...prev, [name]: value }));
  };

  const getPercentage = (nutrient) => {
    const intake = parseFloat(intakeValues[nutrient.name]) || 0;
    return Math.min(Math.round((intake / nutrient.rda) * 100), 150);
  };

  const handleDownloadImage = async () => {
    if (!user) {
      setAuthModalOpen(true);
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

  const handleDownloadPDF = async () => {
    if (!user) {
      setAuthModalOpen(true);
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

  const today = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-10 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-500/10 text-accent-600 text-sm font-medium mb-4">
          <span>🎴</span>
          免費互動工具
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-surface-900 mb-3">
          每日營養卡
        </h1>
        <p className="text-surface-500 max-w-xl mx-auto">
          選擇你關注的營養素、輸入每日攝取量，即時預覽並下載你的專屬營養卡片。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Form */}
        <div className="space-y-6 animate-slide-up">
          {/* Name Input */}
          <div className="rounded-2xl border border-surface-200 bg-white p-6">
            <label className="block text-sm font-semibold text-surface-800 mb-2">你的名字（選填）</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="顯示在卡片上的名字"
              className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
            />
          </div>

          {/* Goal Selection */}
          <div className="rounded-2xl border border-surface-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-surface-800 mb-3">健康目標</h3>
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

          {/* Nutrient Selection */}
          <div className="rounded-2xl border border-surface-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-surface-800 mb-3">選擇營養素（可多選）</h3>
            <div className="grid grid-cols-2 gap-2">
              {NUTRIENT_OPTIONS.map((n) => (
                <button
                  key={n.name}
                  onClick={() => toggleNutrient(n.name)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                    selectedNutrients.includes(n.name)
                      ? 'bg-primary-50 text-primary-700 ring-2 ring-primary-300'
                      : 'bg-surface-50 text-surface-600 hover:bg-surface-100'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${n.color} shrink-0`} />
                  {n.name}
                </button>
              ))}
            </div>
          </div>

          {/* Intake Values */}
          {selectedNutrients.length > 0 && (
            <div className="rounded-2xl border border-surface-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-surface-800 mb-3">每日攝取量</h3>
              <div className="space-y-3">
                {selectedNutrients.map((name) => {
                  const n = NUTRIENT_OPTIONS.find((opt) => opt.name === name);
                  return (
                    <div key={name} className="flex items-center gap-3">
                      <label className="w-24 text-sm text-surface-700 font-medium shrink-0">{name}</label>
                      <input
                        type="number"
                        min="0"
                        value={intakeValues[name] || ''}
                        onChange={(e) => updateIntake(name, e.target.value)}
                        placeholder={`建議 ${n.rda}`}
                        className="flex-1 px-3 py-2 rounded-lg border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm"
                      />
                      <span className="text-xs text-surface-400 w-8">{n.unit}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Preview & Download */}
        <div className="space-y-4 animate-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="sticky top-24">
            {/* Card Preview */}
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
                <div className="inline-block mt-2 px-3 py-1 rounded-full bg-white/15 text-white/90 text-xs font-medium">
                  🎯 {selectedGoal}
                </div>
              </div>

              {/* Nutrients */}
              <div className="px-6 pb-6">
                {selectedNutrients.length === 0 ? (
                  <div className="py-8 text-center text-white/50 text-sm">
                    ← 請在左側選擇營養素
                  </div>
                ) : (
                  <div className="space-y-3 mt-2">
                    {selectedNutrients.map((name) => {
                      const n = NUTRIENT_OPTIONS.find((opt) => opt.name === name);
                      const pct = getPercentage(n);
                      const intake = intakeValues[name] || 0;
                      return (
                        <div key={name}>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-white font-medium">{name}</span>
                            <span className="text-white/70 text-xs">
                              {intake || '—'} / {n.rda} {n.unit}
                              {pct > 0 && (
                                <span className={`ml-1.5 font-bold ${pct >= 100 ? 'text-green-300' : 'text-amber-300'}`}>
                                  {pct}%
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-white/15 overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${n.color} transition-all duration-500`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="px-6 py-3 bg-black/15 text-center">
                <p className="text-white/40 text-xs">營養深潛 — 用科學探索營養的深度 | nutrideep.com</p>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleDownloadImage}
                disabled={downloading || selectedNutrients.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                下載圖片
                {!user && <span className="text-xs opacity-70">🔒</span>}
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={downloading || selectedNutrients.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 ring-1 ring-primary-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                下載 PDF
                {!user && <span className="text-xs opacity-70">🔒</span>}
              </button>
            </div>
            {!user && (
              <p className="text-center text-xs text-surface-400 mt-2">
                🔒 下載功能需要登入
              </p>
            )}
          </div>
        </div>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
