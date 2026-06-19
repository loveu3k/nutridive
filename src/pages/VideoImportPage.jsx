import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, isConfigured } from '../lib/supabase';
import AuthModal from '../components/AuthModal';
import { cleanTitle } from '../lib/utils';
import { DEMO_POSTS } from '../data/posts';

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
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('video'); // 'video' | 'file'

  // Video import states
  const [text, setText] = useState(TEMPLATE);
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [statusMsg, setStatusMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [preview, setPreview] = useState(null);

  // File upload states
  const [fileTitle, setFileTitle] = useState('');
  const [fileDescription, setFileDescription] = useState('');
  const [fileCategory, setFileCategory] = useState('pdf'); // 'pdf' | 'chart'
  const [selectedFile, setSelectedFile] = useState(null);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [fileUploadStatus, setFileUploadStatus] = useState(null); // null | 'success' | 'error'
  const [fileUploadMsg, setFileUploadMsg] = useState('');
  const [fileSubmitting, setFileSubmitting] = useState(false);

  // Video edit/delete states
  const [postsList, setPostsList] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // Edit form states
  const [editTitle, setEditTitle] = useState('');
  const [editYoutubeId, setEditYoutubeId] = useState('');
  const [editNutrients, setEditNutrients] = useState('');
  const [editCreatedAt, setEditCreatedAt] = useState('');
  const [editContent, setEditContent] = useState('');
  const [updateStatus, setUpdateStatus] = useState(null); // null | 'success' | 'error'
  const [updateMsg, setUpdateMsg] = useState('');
  const [updateSubmitting, setUpdateSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center min-h-[60vh] flex flex-col justify-center items-center animate-fade-in">
        <div className="w-16 h-16 bg-primary-50 text-primary-500 rounded-full flex items-center justify-center text-2xl mb-4 shadow-sm">🔒</div>
        <h2 className="text-xl font-bold text-surface-900 mb-2">需要管理員登入</h2>
        <p className="text-surface-500 text-sm mb-6">此頁面僅限管理員存取，請先登入管理員帳號。</p>
        <button
          onClick={() => setAuthModalOpen(true)}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          登入管理員
        </button>
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          returnTo="/admin/import"
        />
      </div>
    );
  }

  if (!profile?.is_admin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center min-h-[60vh] flex flex-col justify-center items-center animate-fade-in">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-2xl mb-4 shadow-sm">⚠️</div>
        <h2 className="text-xl font-bold text-surface-900 mb-2">權限不足</h2>
        <p className="text-surface-500 text-sm mb-6">您目前登入的帳號 ({user.email}) 不是管理員，無法使用管理工具。</p>
        <a href="/" className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-all">返回首頁</a>
      </div>
    );
  }

  const formatBytes = (bytes, decimals = 1) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!isConfigured) {
      setFileUploadStatus('error');
      setFileUploadMsg('Supabase 尚未連線，無法上傳。請先設定 .env 環境變數。');
      return;
    }

    if (!fileTitle.trim()) {
      setFileUploadStatus('error');
      setFileUploadMsg('請填寫資源名稱');
      return;
    }

    if (!selectedFile) {
      setFileUploadStatus('error');
      setFileUploadMsg('請選擇要上傳的檔案');
      return;
    }

    setFileSubmitting(true);
    setFileUploadStatus(null);
    setFileUploadMsg('');

    try {
      const fileExt = selectedFile.name.split('.').pop();
      const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

      // 1. Upload to Storage
      const { error: uploadError } = await supabase.storage
        .from('nutrition-files')
        .upload(uniqueFileName, selectedFile);

      if (uploadError) throw uploadError;

      // 2. Insert into nutrition_resources
      const { error: dbError } = await supabase
        .from('nutrition_resources')
        .insert([
          {
            title: fileTitle.trim(),
            description: fileDescription.trim(),
            category: fileCategory,
            file_path: uniqueFileName,
            file_size: formatBytes(selectedFile.size),
            is_interactive: false,
            requires_auth: requiresAuth,
            download_count: 0
          }
        ]);

      if (dbError) {
        // Rollback uploaded file
        await supabase.storage.from('nutrition-files').remove([uniqueFileName]);
        throw dbError;
      }

      setFileUploadStatus('success');
      setFileUploadMsg(`✅ 檔案「${fileTitle}」已成功上傳並加入下載清單！`);
      setFileTitle('');
      setFileDescription('');
      setFileCategory('pdf');
      setSelectedFile(null);
      setRequiresAuth(false);

      const fileInput = document.getElementById('admin-file-input');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      setFileUploadStatus('error');
      setFileUploadMsg(`上傳失敗：${err.message}`);
    } finally {
      setFileSubmitting(false);
    }
  };

  const fetchPostsList = async () => {
    setLoadingPosts(true);
    if (!isConfigured) {
      setPostsList(DEMO_POSTS);
      setLoadingPosts(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, slug, youtube_video_id, nutrients, created_at, content')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPostsList(data);
      } else {
        setPostsList(DEMO_POSTS);
      }
    } catch {
      setPostsList(DEMO_POSTS);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'edit') {
      fetchPostsList();
      setEditingPost(null);
    }
  }, [activeTab]);

  const startEditing = (post) => {
    setEditingPost(post);
    setEditTitle(post.title || '');
    setEditYoutubeId(post.youtube_video_id || '');
    setEditNutrients(post.nutrients ? post.nutrients.join(', ') : '');
    setEditCreatedAt(post.created_at ? post.created_at.split('T')[0] : new Date().toISOString().split('T')[0]);
    setEditContent(post.content || '');
    setUpdateStatus(null);
    setUpdateMsg('');
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();
    if (!editingPost) return;

    setUpdateSubmitting(true);
    setUpdateStatus(null);
    setUpdateMsg('');

    try {
      const nutrientsArray = editNutrients
        ? editNutrients.split(/[,，]/).map(s => s.trim()).filter(Boolean)
        : [];

      const { error } = await supabase
        .from('posts')
        .update({
          title: editTitle.trim(),
          youtube_video_id: editYoutubeId.trim(),
          slug: `yt-post-${editYoutubeId.trim()}`,
          nutrients: nutrientsArray,
          created_at: new Date(editCreatedAt).toISOString(),
          content: editContent
        })
        .eq('id', editingPost.id);

      if (error) throw error;

      setUpdateStatus('success');
      setUpdateMsg('✅ 影片資訊已成功更新！');
      
      // Refresh list
      fetchPostsList();
      
      // Return to list view
      setTimeout(() => {
        setEditingPost(null);
        setUpdateStatus(null);
        setUpdateMsg('');
      }, 1200);
    } catch (err) {
      setUpdateStatus('error');
      setUpdateMsg(`更新失敗：${err.message}`);
    } finally {
      setUpdateSubmitting(false);
    }
  };

  const handleDeletePost = async (postId, postTitle) => {
    const displayTitle = cleanTitle(postTitle);
    if (!window.confirm(`確定要刪除影片「${displayTitle}」嗎？此動作無法復原！`)) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      fetchPostsList();
      alert('影片已成功刪除！');
    } catch (err) {
      alert(`刪除失敗：${err.message}`);
    }
  };

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
          管理工具主控台
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-surface-900 mb-3">
          {activeTab === 'video' ? 'YouTube 影片匯入' : activeTab === 'file' ? 'PDF 與圖表資源上傳' : '編輯已發佈影片'}
        </h1>
        <p className="text-surface-500 max-w-xl mx-auto leading-relaxed text-sm">
          {activeTab === 'video'
            ? '將新影片資訊貼入下方文字框，系統會自動解析並匯入到資料庫中。'
            : activeTab === 'file'
            ? '上傳新的 PDF 指引手冊或換算圖表，供前台使用者下載閱讀與追蹤下載量。'
            : '修改或刪除先前已發佈在網站上的影片文章資訊。'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-200 mb-8 animate-fade-in">
        <button
          onClick={() => setActiveTab('video')}
          className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'video'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-surface-400 hover:text-surface-600'
          }`}
        >
          🎥 匯入影片
        </button>
        <button
          onClick={() => setActiveTab('file')}
          className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'file'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-surface-400 hover:text-surface-600'
          }`}
        >
          📂 上傳資源
        </button>
        <button
          onClick={() => setActiveTab('edit')}
          className={`flex-1 py-3 text-center text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'edit'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-surface-400 hover:text-surface-600'
          }`}
        >
          ✏️ 管理已發佈影片
        </button>
      </div>

      {activeTab === 'video' && (
        <>
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
        </>
      )}

      {activeTab === 'file' && (
        <>
          {/* File Upload Form */}
          <form onSubmit={handleFileUpload} className="space-y-5 rounded-2xl border border-surface-200 bg-white p-6 shadow-sm mb-6 animate-slide-up">
            <div>
              <label className="block text-sm font-bold text-surface-800 mb-2">📁 選擇檔案</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-surface-200 border-dashed rounded-xl cursor-pointer hover:bg-surface-50/50 hover:border-primary-400 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <span className="text-3xl mb-2">📤</span>
                    <p className="mb-1 text-sm text-surface-600 font-medium px-4 text-center">
                      {selectedFile ? `已選取：${selectedFile.name}` : '點擊或拖曳檔案至此處上傳'}
                    </p>
                    <p className="text-xs text-surface-400">支援 PDF、圖片等格式 {selectedFile && `(${formatBytes(selectedFile.size)})`}</p>
                  </div>
                  <input
                    id="admin-file-input"
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="hidden"
                    accept=".pdf,image/*"
                    required
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-surface-800 mb-2">📌 資源名稱</label>
              <input
                type="text"
                value={fileTitle}
                onChange={(e) => setFileTitle(e.target.value)}
                placeholder="例如：常見微量元素缺乏自我評估清單"
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-surface-800 mb-2">📝 資源描述</label>
              <textarea
                value={fileDescription}
                onChange={(e) => setFileDescription(e.target.value)}
                placeholder="輸入此檔案的詳細介紹，將會展示給使用者看..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-surface-800 mb-2">🏷️ 資源分類</label>
                <select
                  value={fileCategory}
                  onChange={(e) => setFileCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm bg-white"
                >
                  <option value="pdf">PDF 手冊 / 指引</option>
                  <option value="chart">減脂 / 營養分配換算圖表</option>
                </select>
              </div>

              <div className="flex items-center h-full pt-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={requiresAuth}
                    onChange={(e) => setRequiresAuth(e.target.checked)}
                    className="w-4.5 h-4.5 text-primary-600 rounded border-surface-300 focus:ring-primary-400 focus:ring-2 accent-primary-500"
                  />
                  <span className="text-sm font-bold text-surface-700">🔒 需要登入才能下載此資源</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={fileSubmitting || !isConfigured}
              className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {fileSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  檔案上傳與資料儲存中...
                </>
              ) : (
                '📤 開始上傳並發佈資源'
              )}
            </button>
          </form>

          {/* File Upload Status Message */}
          {fileUploadStatus && (
            <div className={`mb-6 p-4 rounded-2xl text-sm font-medium animate-scale-in ${
              fileUploadStatus === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {fileUploadMsg}
            </div>
          )}
        </>
      )}

      {activeTab === 'edit' && (
        <>
          {editingPost ? (
            <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm mb-6 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-surface-800 text-lg flex items-center gap-2">
                  <span>✏️</span> 編輯影片資訊
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-surface-500 hover:text-surface-700 bg-surface-50 border border-surface-200 transition-all cursor-pointer"
                >
                  ← 返回影片清單
                </button>
              </div>

              <form onSubmit={handleUpdatePost} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">影片標題</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">YouTube 影片 ID</label>
                    <input
                      type="text"
                      value={editYoutubeId}
                      onChange={(e) => setEditYoutubeId(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1.5">發佈日期</label>
                    <input
                      type="date"
                      value={editCreatedAt}
                      onChange={(e) => setEditCreatedAt(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">核心營養素標籤 (以逗號分隔)</label>
                  <input
                    type="text"
                    value={editNutrients}
                    onChange={(e) => setEditNutrients(e.target.value)}
                    placeholder="例如：鈣, 鐵, 維生素D"
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-surface-700 mb-1.5">影片簡介 / 時間軸描述</label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm font-mono resize-y"
                    placeholder="輸入說明描述..."
                  />
                </div>

                {updateStatus && (
                  <div className={`p-3 rounded-xl text-sm font-medium ${
                    updateStatus === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {updateMsg}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingPost(null)}
                    className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-surface-500 bg-surface-50 border border-surface-200 hover:bg-surface-100 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={updateSubmitting || !isConfigured}
                    className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {updateSubmitting ? '儲存中...' : '💾 儲存並更新'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-4 animate-slide-up">
              {loadingPosts ? (
                <div className="py-20 text-center text-sm text-surface-400 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full border-3 border-primary-500 border-t-transparent animate-spin" />
                  <span>載入影片清單中...</span>
                </div>
              ) : postsList.length === 0 ? (
                <div className="py-20 text-center text-surface-400 text-sm border border-dashed border-surface-200 rounded-2xl bg-white">
                  目前資料庫中沒有任何影片。
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {postsList.map((post) => (
                    <div
                      key={post.id}
                      className="flex gap-4 p-4 rounded-2xl border border-surface-200 bg-white shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <img
                        src={`https://img.youtube.com/vi/${post.youtube_video_id}/hqdefault.jpg`}
                        alt=""
                        className="w-32 sm:w-40 aspect-video rounded-lg object-cover bg-surface-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        <div>
                          <h4 className="font-bold text-surface-800 text-sm sm:text-base line-clamp-2 mb-1">{cleanTitle(post.title)}</h4>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {post.nutrients && post.nutrients.map((n, i) => (
                              <span key={i} className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-primary-50 text-primary-700 ring-1 ring-primary-100">{n}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs text-surface-400 font-medium">
                            📅 {post.created_at ? new Date(post.created_at).toLocaleDateString('zh-TW') : '—'}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditing(post)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-primary-700 bg-primary-50 hover:bg-primary-100 transition-all cursor-pointer"
                            >
                              ✏️ 編輯
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id, post.title)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-all cursor-pointer"
                            >
                              🗑️ 刪除
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Supabase status */}
      {!isConfigured && (
        <div className="mt-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-100 text-amber-800 text-xs flex items-start gap-2 animate-fade-in">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="font-bold mb-0.5">Supabase 尚未連線</p>
            <p>管理功能需要設定 .env 中的 Supabase 環境變數。本地端功能仍可供部分預覽。</p>
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
