import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/AuthModal';
import { DRI_STANDARDS, NUTRIENT_COLORS } from '../data/driDatabase';
import { supabase, isConfigured } from '../lib/supabase';
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

// ── 本地備用種子資料 ──────────────────────────────
const MOCK_RESOURCES = [
  {
    id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    title: '每日建議營養卡 (DRIs)',
    description: '依據你的年齡、性別與參考標準，精準計算每日建議營養素攝取量，並生成專屬的個人營養卡片。',
    category: 'calculator',
    file_path: null,
    file_size: null,
    is_interactive: true,
    interactive_id: 'daily-nutrition-card',
    requires_auth: false,
    download_count: 128
  },
  {
    id: 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e',
    title: '台灣膳食營養素參考攝取量 (DRIs) 手冊',
    description: '衛生福利部國民健康署官方最新版成人與兒童 DRIs 參考手冊，包含各營養素之建議與上限攝取標準。',
    category: 'pdf',
    file_path: 'tw_dris_handbook.pdf',
    file_size: '4.8 MB',
    is_interactive: false,
    interactive_id: null,
    requires_auth: false,
    download_count: 85
  },
  {
    id: 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f',
    title: '臨床實證維生素 D3/K2 協同補給指引',
    description: '深入探討維生素 D3 與 K2 的協同吸收效應，以及對於人體骨骼與免疫系統健康之實證影響。',
    category: 'pdf',
    file_path: 'vitamin_d_k2_guide.pdf',
    file_size: '1.5 MB',
    is_interactive: false,
    interactive_id: null,
    requires_auth: true,
    download_count: 42
  },
  {
    id: 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a',
    title: '高蛋白減脂飲食分配與換算圖表',
    description: '幫助你在熱量赤字期間，依據體重與每日活動量精準分配與換算碳水、脂肪與蛋白質攝取比例之圖表。',
    category: 'chart',
    file_path: 'protein_fat_ratio_chart.pdf',
    file_size: '850 KB',
    is_interactive: false,
    interactive_id: null,
    requires_auth: false,
    download_count: 156
  },
  {
    id: 'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b',
    title: '常見微量元素缺乏自我評估清單',
    description: '整理缺鐵、缺鈣、缺鎂、缺鋅等常見微量營養素缺乏時，身體發出的早期警訊與飲食盲點自我檢視表。',
    category: 'pdf',
    file_path: 'micronutrient_checklist.pdf',
    file_size: '1.1 MB',
    is_interactive: false,
    interactive_id: null,
    requires_auth: true,
    download_count: 61
  }
];

export default function NutritionToolPage() {
  const { user } = useAuth();

  // ── 工具與檔案庫狀態 ──────────────────────────────────
  const [resources, setResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeToolId, setActiveToolId] = useState(null);
  const [downloadingResourceIds, setDownloadingResourceIds] = useState({});

  // ── 每日營養卡計算器狀態 ──────────────────────────────
  const showLock = isConfigured && !user;
  const cardRef = useRef(null);
  const draft = useRef(loadDraft());
  const d = draft.current;

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedNutrients, setSelectedNutrients] = useState(d?.selectedNutrients ?? []);
  const [intakeValues, setIntakeValues] = useState(d?.intakeValues ?? {});
  const [selectedGoal, setSelectedGoal] = useState(d?.selectedGoal ?? '均衡營養');
  const [userName, setUserName] = useState(d?.userName ?? '');
  const [downloading, setDownloading] = useState(false);

  const [age, setAge] = useState(d?.age ?? 30);
  const [gender, setGender] = useState(d?.gender ?? 'male');
  const [isPregnant, setIsPregnant] = useState(d?.isPregnant ?? false);
  const [standard, setStandard] = useState(d?.standard ?? 'TW');
  const [standardOpen, setStandardOpen] = useState(false);

  const [pendingAction, setPendingAction] = useState(d?.pendingAction ?? null);

  // ── 獲取工具與檔案清單 ─────────────────────────────
  useEffect(() => {
    const fetchResources = async () => {
      if (!isConfigured) {
        setResources(MOCK_RESOURCES);
        setLoadingResources(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('nutrition_resources')
          .select('*')
          .order('created_at', { ascending: true });

        if (error || !data || data.length === 0) {
          setResources(MOCK_RESOURCES);
        } else {
          setResources(data);
        }
      } catch (err) {
        console.error('Error fetching tools/files:', err);
        setResources(MOCK_RESOURCES);
      }
      setLoadingResources(false);
    };

    fetchResources();
  }, []);

  // ── 登入成功後自動執行先前未完成的動作 ──────────
  useEffect(() => {
    if (user && pendingAction && resources.length > 0) {
      const timer = setTimeout(() => {
        if (pendingAction === 'download_image') {
          handleDownloadImage(true);
        } else if (pendingAction === 'download_pdf') {
          handleDownloadPDF(true);
        } else if (pendingAction.startsWith('download_resource_')) {
          const id = pendingAction.replace('download_resource_', '');
          const res = resources.find(r => r.id === id);
          if (res) handleDownloadResource(res, true);
        }
        setPendingAction(null);
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, pendingAction, resources]);

  // ── DRI lookup ────────────────────────────────────
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

  // ── 下載 PDF 檔案庫資源 ─────────────────────────
  const handleDownloadResource = async (resource, skipAuthCheck = false) => {
    if (isConfigured && !skipAuthCheck && resource.requires_auth && !user) {
      triggerAuth(`download_resource_${resource.id}`);
      return;
    }

    setDownloadingResourceIds(prev => ({ ...prev, [resource.id]: true }));

    try {
      if (isConfigured && resource.file_path) {
        // 更新資料庫中的下載次數
        try {
          await supabase.rpc('increment_download_count', { resource_id: resource.id });
        } catch (dbErr) {
          console.warn('DB Increment download count fail:', dbErr);
        }

        // 獲取 Supabase Storage 下載 URL
        const { data } = supabase.storage.from('nutrition-files').getPublicUrl(resource.file_path);
        
        if (data?.publicUrl) {
          // 在新頁面打開/觸發瀏覽器下載
          window.open(data.publicUrl, '_blank');
        } else {
          throw new Error('Supabase Public URL Empty');
        }
      } else {
        // 離線模式或未配檔案路徑：現場為用戶使用 jsPDF 動態生成精美的示範檔案
        await generateDemoPDF(resource);
      }

      // 更新本機計數狀態，讓 UI 立刻反應下載次數變化
      setResources(prev =>
        prev.map(r => r.id === resource.id ? { ...r, download_count: r.download_count + 1 } : r)
      );
    } catch (err) {
      console.error('Download error, falling back to dynamic PDF generation:', err);
      await generateDemoPDF(resource);
    } finally {
      setDownloadingResourceIds(prev => ({ ...prev, [resource.id]: false }));
    }
  };

  // ── 英文檔名轉換（避免 jsPDF CJK 編碼錯誤）─────────
  const getEnglishTitle = (id) => {
    switch (id) {
      case 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e':
        return 'Taiwan_DRI_Guidelines_Handbook';
      case 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f':
        return 'Vitamin_D3_K2_Evidence_Guide';
      case 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a':
        return 'Protein_Fat_Ratio_Chart';
      case 'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b':
        return 'Micronutrient_Deficiency_Checklist';
      default:
        return 'Nutrition_Resource_Doc';
    }
  };

  // ── jsPDF 本機動態生成精美指南 PDF ────────────────
  const generateDemoPDF = async (resource) => {
    const doc = new jsPDF();
    
    // 繪製頂部 Emerald 標籤橫條
    doc.setFillColor(5, 150, 105); // Emerald 600
    doc.rect(0, 0, 210, 45, 'F');
    
    // 頂部文字 (由於預設字體不支援中文字元，我們以優雅的英文進行展示)
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("NutriDive - Science Evidence-Based Health", 20, 22);
    doc.setFontSize(11);
    doc.text("Empowering your health choices with premium scientific literature", 20, 32);
    
    // 本文內容
    doc.setTextColor(51, 65, 85); // Slate 700
    doc.setFontSize(15);
    doc.text("Resource Download: " + getEnglishTitle(resource.id).replace(/_/g, ' '), 20, 60);
    
    // 繪製分水線
    doc.setLineWidth(0.5);
    doc.setDrawColor(209, 213, 219);
    doc.line(20, 65, 190, 65);
    
    doc.setFontSize(10);
    let y = 78;
    
    const lines = [
      `[Document ID]   ${resource.id}`,
      `[Category]      ${resource.category.toUpperCase()}`,
      `[File Size]     ${resource.file_size || 'N/A'}`,
      `[Status]        Demonstration File (Local Offline Mode)`,
      ``,
      `Thank you for downloading resources from NutriDive!`,
      `This PDF file was dynamically generated on the fly.`,
      `Once your Supabase integration is fully configured and you upload the actual file,`,
      `this button will download the real PDF guidelines from Supabase Storage.`,
      ``,
      `[Description]`,
      resource.description,
      ``,
      `[How to configure Supabase Storage & Database]`,
      `1. Log in to your Supabase Console.`,
      `2. Go to 'Storage' and create a new bucket named 'nutrition-files'.`,
      `3. Make it 'Public' so that anyone can download the guides.`,
      `4. Upload your actual PDF guide (e.g. '${resource.file_path || 'file.pdf'}').`,
      `5. Add a record in 'nutrition_resources' table with this file_path.`,
      ``,
      `-----------------------------------------------------------------------------------------`,
      `NutriDive - Dive deep into nutrition science | nutrideep.com`,
    ];
    
    lines.forEach(line => {
      if (line.length > 70) {
        const splitLines = doc.splitTextToSize(line, 170);
        splitLines.forEach(l => {
          doc.text(l, 20, y);
          y += 8;
        });
      } else {
        doc.text(line, 20, y);
        y += 8;
      }
    });
    
    doc.save(`NutriDive-${getEnglishTitle(resource.id)}.pdf`);
  };

  // ── 日期 ──────────────────────────────────────────
  const today = new Date().toLocaleDateString('zh-TW', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const currentStandard = DRI_STANDARDS.find((s) => s.key === standard);

  // ── 關鍵字與分類篩選邏輯 ─────────────────────────
  const filteredResources = resources.filter(res => {
    const matchesCategory = activeCategory === 'all' || res.category === activeCategory;
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (res.description && res.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // ══════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[70vh]">
      
      {activeToolId === 'daily-nutrition-card' ? (
        // ── 視圖二：每日營養素建議卡 (原工具) ────────────────
        <div className="animate-fade-in">
          {/* 返回導覽 */}
          <button
            onClick={() => setActiveToolId(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-surface-600 hover:text-primary-600 bg-surface-50 hover:bg-primary-50 border border-surface-200 hover:border-primary-200 transition-all duration-200 mb-8 cursor-pointer shadow-sm hover:shadow"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回工具與檔案庫
          </button>

          {/* 計算器標題 */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-500/10 text-accent-600 text-sm font-medium mb-4">
              <span>🧬</span>
              精準科學工具
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-surface-900 mb-3">
              每日建議營養卡 (DRIs)
            </h1>
            <p className="text-surface-500 max-w-2xl mx-auto">
              依據你的年齡、性別與國際權威標準，精準計算每日建議攝取量。
              輸入你的營養攝取數據，即時生成專屬營養卡片。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ── Left: Form ── */}
            <div className="space-y-5">
              {/* 📋 個人資訊 */}
              <div className="rounded-2xl border border-surface-200 bg-white p-6 space-y-5">
                <h3 className="flex items-center gap-2 text-sm font-bold text-surface-800">
                  <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs">📋</span>
                  個人資訊
                </h3>

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
                        className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                          gender === 'male'
                            ? 'bg-blue-50 text-blue-700 ring-2 ring-blue-300'
                            : 'bg-surface-50 text-surface-600 hover:bg-surface-100'
                        }`}
                      >
                        ♂ 男
                      </button>
                      <button
                        onClick={() => setGender('female')}
                        className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
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

                <div>
                  <label className="block text-xs font-medium text-surface-500 mb-1.5">📊 參考標準</label>
                  <div className="relative">
                    <button
                      onClick={() => setStandardOpen(!standardOpen)}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-surface-200 bg-white hover:border-primary-300 transition-all text-sm cursor-pointer"
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
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors cursor-pointer ${
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

              {/* 🎯 健康目標 */}
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
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
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

              {/* 💊 選擇營養素 */}
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
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left cursor-pointer ${
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

              {/* 📝 攝取量輸入 */}
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

            {/* ── Right: Preview ── */}
            <div className="space-y-4">
              <div className="sticky top-24">
                <div
                  ref={cardRef}
                  className="nutrition-card-preview rounded-2xl overflow-hidden shadow-xl"
                  style={{
                    background: 'linear-gradient(135deg, #065f46 0%, #047857 30%, #059669 60%, #0d9488 100%)',
                  }}
                >
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
                              <div className="relative">
                                <div className="h-2.5 rounded-full bg-white/15 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-500`}
                                    style={{ width: `${Math.min(pct / 2, 100)}%` }}
                                  />
                                </div>
                                {ulMarkerPos !== null && (
                                  <div
                                    className="absolute top-0 h-2.5 w-px border-l border-dashed border-white/40"
                                    style={{ left: `${ulMarkerPos}%` }}
                                    title={`UL: ${dri.ul}${dri.unit}`}
                                  />
                                )}
                                <div
                                  className="absolute top-0 h-2.5 w-px bg-white/25"
                                  style={{ left: '50%' }}
                                />
                              </div>
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

                  <div className="px-6 py-3 bg-black/15 text-center">
                    <p className="text-white/40 text-xs">營養深潛 — 用科學探索營養的深度 | nutrideep.com</p>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleDownloadImage()}
                    disabled={downloading || selectedNutrients.length === 0}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 ring-1 ring-primary-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
        </div>
      ) : (
        // ── 視圖一：營養科學工具與檔案庫中心 (大廳) ──────────────
        <div className="animate-fade-in">
          {/* 頂部 Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-4">
              <span>🧬</span>
              科學營養小助手
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-surface-900 mb-3">
              科學工具與文獻檔案庫
            </h1>
            <p className="text-surface-500 max-w-2xl mx-auto leading-relaxed">
              在這裡您可以找到各式實用的營養素建議計算小工具，以及豐富的科學實證指南、PDF 檔案與分析圖表，助您健康決策更具底氣。
            </p>
          </div>

          {/* 離線測試提示橫條 */}
          {!isConfigured && (
            <div className="mb-8 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-emerald-800 text-sm flex items-start gap-3 animate-fade-in">
              <span className="text-lg leading-none mt-0.5">💡</span>
              <div>
                <h4 className="font-bold mb-0.5">系統目前運行於「離線示範模式」</h4>
                <p className="text-emerald-700 text-xs leading-relaxed">
                  Supabase 環境變數尚未設定。我們已為您載入預置的科學小工具與下載檔案。下載 PDF 將會自動觸發現場動態 PDF 生成，您可以直接體驗完整的使用流程！
                </p>
              </div>
            </div>
          )}

          {/* 篩選與搜尋列 */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            {/* 分類導覽 */}
            <div className="flex flex-wrap gap-1.5 bg-surface-100 p-1.5 rounded-xl w-full md:w-auto">
              {[
                { key: 'all', label: '全部資源' },
                { key: 'calculator', label: '計算工具' },
                { key: 'pdf', label: '指南手冊 (PDF)' },
                { key: 'chart', label: '資訊圖表' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveCategory(tab.key)}
                  className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    activeCategory === tab.key
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-surface-600 hover:text-surface-800 hover:bg-white/40'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 搜尋欄 */}
            <div className="relative w-full md:max-w-xs shrink-0">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 text-sm">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋工具與檔案庫..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 bg-white outline-none transition-all text-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 text-xs font-bold w-4 h-4 rounded-full bg-surface-100 flex items-center justify-center cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* 工具與檔案卡片網格 */}
          {loadingResources ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-56 rounded-2xl bg-white border border-surface-200 p-6 space-y-4">
                  <div className="flex justify-between">
                    <div className="w-10 h-10 rounded-xl bg-surface-100" />
                    <div className="w-20 h-6 rounded bg-surface-100" />
                  </div>
                  <div className="h-5 w-2/3 rounded bg-surface-100" />
                  <div className="h-10 w-full rounded bg-surface-100" />
                </div>
              ))}
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-surface-200 shadow-sm animate-fade-in">
              <span className="text-4xl">📁</span>
              <p className="text-surface-400 mt-4 text-sm font-medium">找不到符合條件的工具或檔案，請更換關鍵字再試試！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((res) => {
                const isDownloading = downloadingResourceIds[res.id];
                return (
                  <div 
                    key={res.id} 
                    className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white border border-surface-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div>
                      {/* 卡片頂部 (Emoji 圖標 + 類型標籤) */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-3xl p-2.5 rounded-xl bg-surface-50 group-hover:bg-primary-50 transition-colors duration-300">
                          {res.category === 'calculator' ? '📋' : res.category === 'pdf' ? '📘' : '📊'}
                        </span>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          res.category === 'calculator' 
                            ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                            : res.category === 'pdf' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                        }`}>
                          {res.category === 'calculator' ? '計算工具' : res.category === 'pdf' ? '電子指南 (PDF)' : '資訊圖表'}
                        </span>
                      </div>

                      {/* 標題與簡介 */}
                      <h3 className="text-base font-bold text-surface-900 group-hover:text-primary-600 transition-colors mb-2">
                        {res.title}
                      </h3>
                      <p className="text-xs text-surface-500 leading-relaxed mb-6">
                        {res.description}
                      </p>
                    </div>

                    {/* 卡片底部資訊與操作按鈕 */}
                    <div>
                      <div className="flex items-center justify-between text-xs text-surface-400 mb-4 border-t border-surface-100 pt-4">
                        {res.category !== 'calculator' ? (
                          <span>檔案大小: <strong className="text-surface-700 font-medium">{res.file_size}</strong></span>
                        ) : (
                          <span>免安裝 • 線上使用</span>
                        )}
                        <span>使用次數: <strong className="text-surface-700 font-medium">{res.download_count} 次</strong></span>
                      </div>

                      {res.category === 'calculator' ? (
                        <button
                          onClick={() => setActiveToolId(res.interactive_id)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-sm transition-all duration-200 active:scale-[0.98] cursor-pointer"
                        >
                          開始使用
                          <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDownloadResource(res)}
                          disabled={isDownloading}
                          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.98] cursor-pointer ${
                            res.requires_auth && !user
                              ? 'text-accent-700 bg-accent-50 hover:bg-accent-100 ring-1 ring-accent-200'
                              : 'text-primary-700 bg-primary-50 hover:bg-primary-100 ring-1 ring-primary-200'
                          }`}
                        >
                          {isDownloading ? (
                            <>
                              <span className="w-3.5 h-3.5 rounded-full border-2 border-primary-700 border-t-transparent animate-spin" />
                              下載中...
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              {res.requires_auth ? '會員限定下載' : '免費下載'}
                              {res.requires_auth && !user && <span className="opacity-70">🔒</span>}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 登入視窗 */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        returnTo="/nutrition-tool"
      />
    </div>
  );
}
