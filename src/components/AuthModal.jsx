import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();

  if (!isOpen) return null;

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError('');
    setSuccessMsg('');
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
        onClose();
      } else {
        if (!displayName.trim()) {
          setError('請輸入暱稱');
          setSubmitting(false);
          return;
        }
        const data = await signUpWithEmail(email, password, displayName.trim());
        if (data?.user?.identities?.length === 0) {
          setError('此 Email 已被註冊');
        } else {
          setSuccessMsg('註冊成功！請查看你的 Email 以確認帳號。');
        }
      }
    } catch (err) {
      setError(getErrorMessage(err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(getErrorMessage(err.message));
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="relative px-6 pt-8 pb-4 bg-gradient-to-br from-primary-500 to-primary-700 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🧬</span>
            <span className="font-display text-lg font-bold">營養深潛</span>
          </div>
          <h2 className="text-xl font-bold">
            {mode === 'login' ? '歡迎回來' : '建立帳號'}
          </h2>
          <p className="text-sm text-primary-100 mt-1">
            {mode === 'login' ? '登入以使用留言和下載功能' : '加入我們，探索營養的奧秘'}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {/* Google OAuth Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-surface-200 text-surface-700 font-medium hover:bg-surface-50 hover:border-surface-300 transition-all active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            使用 Google {mode === 'login' ? '登入' : '註冊'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-surface-200" />
            <span className="text-xs text-surface-400 font-medium">或使用 Email</span>
            <div className="flex-1 h-px bg-surface-200" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1.5">暱稱</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="你想被叫什麼？"
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">密碼</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 6 個字元"
                minLength={6}
                className="w-full px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-lg bg-green-50 text-green-600 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {successMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl text-white font-semibold bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  處理中...
                </span>
              ) : (
                mode === 'login' ? '登入' : '註冊'
              )}
            </button>
          </form>

          {/* Switch mode */}
          <p className="text-center text-sm text-surface-500 mt-5">
            {mode === 'login' ? (
              <>
                還沒有帳號？{' '}
                <button onClick={() => switchMode('register')} className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                  立即註冊
                </button>
              </>
            ) : (
              <>
                已經有帳號了？{' '}
                <button onClick={() => switchMode('login')} className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                  登入
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function getErrorMessage(msg) {
  if (msg.includes('Invalid login credentials')) return '帳號或密碼錯誤';
  if (msg.includes('Email not confirmed')) return '請先確認你的 Email';
  if (msg.includes('User already registered')) return '此 Email 已被註冊';
  if (msg.includes('Password should be at least')) return '密碼至少需要 6 個字元';
  if (msg.includes('Unable to validate email')) return '請輸入有效的 Email 地址';
  return msg;
}
