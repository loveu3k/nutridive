import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isConfigured } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 載入使用者 profile
  const fetchProfile = async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (!error && data) {
      setProfile(data);
    }
  };

  // 監聽認證狀態變化
  useEffect(() => {
    if (!isConfigured) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }
    // 取得初始 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    }).catch(() => {
      // Supabase 未連線時也要解除 loading
      setLoading(false);
    });

    // 監聽狀態變化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);

        // 💡 當偵測到密碼重設 (PASSWORD_RECOVERY) 事件時，自動導向重設密碼頁面
        if (event === 'PASSWORD_RECOVERY') {
          navigate('/reset-password', { replace: true });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Email 登入
  const signInWithEmail = async (email, password) => {
    if (!isConfigured) {
      throw new Error('請先在 .env 檔案中設定 Supabase 環境變數以啟用登入功能。');
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  // Email 註冊
  const signUpWithEmail = async (email, password, displayName) => {
    if (!isConfigured) {
      throw new Error('請先在 .env 檔案中設定 Supabase 環境變數以啟用註冊功能。');
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: displayName,
        },
      },
    });
    if (error) throw error;
    return data;
  };

  // Google OAuth 登入
  const signInWithGoogle = async (returnTo = '/') => {
    if (!isConfigured) {
      throw new Error('請先在 .env 檔案中設定 Supabase 環境變數以啟用 Google 登入功能。');
    }
    // 儲存觸發登入的來源頁面，供 callback 跳回
    try {
      sessionStorage.setItem('auth_redirect_to', returnTo);
    } catch { /* sessionStorage 不可用時忽略 */ }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  };

  // 登出
  const signOut = async () => {
    if (!isConfigured) {
      setUser(null);
      setProfile(null);
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
