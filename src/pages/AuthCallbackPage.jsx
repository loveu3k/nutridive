import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase 會自動處理 URL hash 中的 token
    // 我們只需等待 session 就緒後跳轉
    const handleCallback = async () => {
      const { error } = await supabase.auth.getSession();
      if (error) {
        console.error('Auth callback error:', error);
      }
      // 跳轉回首頁
      navigate('/', { replace: true });
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-primary-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <p className="text-surface-600 font-medium">正在完成登入...</p>
        <p className="text-surface-400 text-sm mt-1">請稍候，即將為你跳轉</p>
      </div>
    </div>
  );
}
