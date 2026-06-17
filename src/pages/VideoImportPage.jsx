import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isConfigured } from '../lib/supabase';
import AuthModal from '../components/AuthModal';

const TEMPLATE = `標題: 
影片ID: 
營養素: 鈣, 鐵, 鎂
日期: ${new Date().toISOString().split('T')[0]}
簡介: `;

const HELP_TEXT = `📋 使用說明：
1. 到 YouTube Studio 複製影片標題與影片 ID（網址中 v= 後面的代碼）
2. 按照上面的格式填入各欄位
3. 營養素之間用逗號分隔，沒有可以留空
4. 日期格式為 YYYY-MM-DD
5. 點擊「匯入」按鈕即可自動新增到資料庫`;

function parseVideoEntry(text) {
  const lines = text.trim().split('\n');
  const data = {};

  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    const value = line.slice(colonIdx + 1).trim();

    switch (key) {
      case '標題':
        data.title = value;
        break;
      case '影片ID':
        data.youtube_video_id = value;
        break;
      case '營養素':
        data.nutrients = value
          ? value.split(/[,，]/).map(s => s.trim()).filter(Boolean)
          : [];
        break;
      case '日期':
        data.created_at = value ? new Date(value).toISOString() : new Date().toISOString();
        break;
      case '簡介':
        data.content = value;
        break;
    }
  }

  // Auto-generate slug from video ID
  if (data.youtube_video_id) {
    data.slug = `yt-post-${data.youtube_video_id}`;
  }

  return data;
}

function validateEntry(entry) {
  const errors = [];
  if (!entry.title) errors.push('缺少標題');
  if (!entry.youtube_video_id) errors.push('缺少影片ID');
  if (!entry.slug) errors.push('無法生成 slug（缺少影片ID）');
  return errors;
}

export default function VideoImportPage() {
  const { user } = useAuth();
  const [text, setText] = useState(TEMPLATE);
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [statusMsg, setStatusMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [preview, setPreview] = useState(null);

  const handlePreview = () => {
    const entry = parseVideoEntry(text);
    const errors = validateEntry(entry);
    if (errors.length > 0) {
      setStatus('error');
      setStatusMsg(`格式錯誤：${errors.join('、')}`);
      setPreview(null);
      return;
    }
    setPreview(entry);
    setStatus(null);
    setStatusMsg('');
  };

  const handleSubmit = async () => {
    if (!isConfigured) {
      setStatus('error');
      setStatusMsg('Supabase 尚未連線，無法匯入。請先設定 .env 環境變數。');
      return;
    }

    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (!preview) {
      handlePreview();
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const { error } = await supabase.from('posts').insert([preview]);
      if (error) throw error;

      setStatus('success');
      setStatusMsg(`✅ 影片「${preview.title}」已成功匯入！`);
      setText(TEMPLATE);
      setPreview(null);
    } catch (err) {
      setStatus('error');
      setStatusMsg(`匯入失敗：${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[70vh]">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-4">
          <span>📥</span>
          管理工具
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-surface-900 mb-3">
          YouTube 影片匯入
        </h1>
        <p className="text-surface-500 max-w-xl mx-auto leading-relaxed text-sm">
          將新影片資訊貼入下方文字框，系統會自動解析並匯入到資料庫中。
        </p>
      </div>

      {/* Help Hint */}
      <div className="mb-6 p-4 rounded-2xl bg-primary-50/60 border border-primary-100 text-primary-800 text-xs leading-relaxed whitespace-pre-line animate-fade-in">
        {HELP_TEXT}
      </div>

      {/* Text Input */}
      <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm mb-6 animate-slide-up">
        <label className="block text-sm font-bold text-surface-800 mb-3">
          📝 影片資訊
        </label>
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setPreview(null); }}
          rows={8}
          className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm font-mono leading-relaxed resize-y"
          placeholder="按照格式貼入影片資訊..."
        />

        <div className="flex gap-3 mt-4">
          <button
            onClick={handlePreview}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 ring-1 ring-primary-200 transition-all active:scale-[0.98] cursor-pointer"
          >
            👁️ 預覽解析
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !isConfigured}
            className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {submitting ? '匯入中...' : '📥 匯入到資料庫'}
          </button>
        </div>
      </div>

      {/* Status Message */}
      {status && (
        <div className={`mb-6 p-4 rounded-2xl text-sm font-medium animate-scale-in ${
          status === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {statusMsg}
        </div>
      )}

      {/* Preview Card */}
      {preview && (
        <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm animate-scale-in">
          <h3 className="text-sm font-bold text-surface-800 mb-4 flex items-center gap-2">
            <span>📋</span>
            解析預覽
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              {preview.youtube_video_id && (
                <img
                  src={`https://img.youtube.com/vi/${preview.youtube_video_id}/hqdefault.jpg`}
                  alt=""
                  className="w-40 h-auto rounded-lg object-cover shrink-0"
                />
              )}
              <div className="space-y-2">
                <p><span className="font-medium text-surface-500">標題：</span>{preview.title}</p>
                <p><span className="font-medium text-surface-500">影片ID：</span><code className="text-xs bg-surface-100 px-1.5 py-0.5 rounded">{preview.youtube_video_id}</code></p>
                <p><span className="font-medium text-surface-500">Slug：</span><code className="text-xs bg-surface-100 px-1.5 py-0.5 rounded">{preview.slug}</code></p>
                <p><span className="font-medium text-surface-500">日期：</span>{preview.created_at ? new Date(preview.created_at).toLocaleDateString('zh-TW') : '—'}</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="font-medium text-surface-500">營養素：</span>
                  {preview.nutrients?.length > 0
                    ? preview.nutrients.map((n, i) => (
                        <span key={i} className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-50 text-primary-700 ring-1 ring-primary-200">{n}</span>
                      ))
                    : <span className="text-surface-400 text-xs">（無）</span>
                  }
                </div>
              </div>
            </div>
            {preview.content && (
              <div className="mt-3 p-3 rounded-lg bg-surface-50 text-xs text-surface-600 leading-relaxed">
                <span className="font-medium text-surface-500">簡介：</span>{preview.content}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Supabase status */}
      {!isConfigured && (
        <div className="mt-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-100 text-amber-800 text-xs flex items-start gap-2 animate-fade-in">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="font-bold mb-0.5">Supabase 尚未連線</p>
            <p>匯入功能需要設定 .env 中的 Supabase 環境變數。預覽解析功能仍可正常使用。</p>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        returnTo="/admin/import"
      />
    </div>
  );
}
