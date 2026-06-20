import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setStatus('error');
      setMessage('密碼長度必須至少為 6 個字元。');
      return;
    }

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('兩次輸入的密碼不一致，請重新檢查。');
      return;
    }

    setSubmitting(true);
    setStatus(null);
    setMessage('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setStatus('success');
      setMessage('🎉 密碼重設成功！即將為您跳轉至首頁...');
      
      // 2秒後跳轉至首頁
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2000);
    } catch (err) {
      setStatus('error');
      setMessage(`重設失敗：${err.message || '發生未知錯誤'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-3 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  // 安全防護：若當前沒有登入的 Session，則無法直接重設密碼
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center min-h-[60vh] flex flex-col justify-center items-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-2xl mb-4 shadow-sm">⚠️</div>
        <h2 className="text-xl font-bold text-surface-900 mb-2">未授權存取</h2>
        <p className="text-surface-500 text-sm mb-6">您需要透過電子郵件中的重設密碼連結進入此頁面，或者先進行登入。</p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-md transition-all cursor-pointer"
        >
          返回首頁
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12 min-h-[60vh] flex flex-col justify-center">
      <div className="glass p-8 rounded-3xl shadow-xl border border-white/20">
        <div className="text-center mb-6">
          <span className="text-4xl">🔑</span>
          <h2 className="text-2xl font-extrabold text-surface-900 mt-2">設定新密碼</h2>
          <p className="text-xs text-surface-400 mt-1">請為帳號 <span className="font-semibold text-primary-600">{user.email}</span> 設定新的登入密碼</p>
        </div>

        {status && (
          <div className={`p-4 rounded-xl text-xs font-medium mb-6 leading-relaxed ${
            status === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-surface-600 mb-1.5">輸入新密碼</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 個字元"
              className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 bg-white/50 outline-none transition-all text-sm"
              disabled={submitting || status === 'success'}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-600 mb-1.5">確認新密碼</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="請再次輸入新密碼"
              className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 bg-white/50 outline-none transition-all text-sm"
              disabled={submitting || status === 'success'}
            />
          </div>

          <button
            type="submit"
            disabled={submitting || status === 'success'}
            className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg disabled:opacity-50 transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            {submitting ? '儲存中...' : '儲存並更新密碼'}
          </button>
        </form>
      </div>
    </div>
  );
}
