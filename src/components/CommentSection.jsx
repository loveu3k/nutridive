import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';

export default function CommentSection({ postId }) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles (
            display_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setComments(data);
      }
    } catch {
      // Supabase 未連線，忽略
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !user) return;
    setSubmitting(true);

    // 樂觀更新
    const optimisticComment = {
      id: 'temp-' + Date.now(),
      content: content.trim(),
      created_at: new Date().toISOString(),
      user_id: user.id,
      profiles: {
        display_name: profile?.display_name || user.email,
        avatar_url: profile?.avatar_url,
      },
    };
    setComments((prev) => [...prev, optimisticComment]);
    setContent('');

    const { error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content: content.trim(),
      });

    if (error) {
      // 撤回樂觀更新
      setComments((prev) => prev.filter((c) => c.id !== optimisticComment.id));
      setContent(optimisticComment.content);
    } else {
      // 重新載入以取得正確的 id
      fetchComments();
    }
    setSubmitting(false);
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('確定要刪除這則留言嗎？')) return;

    setComments((prev) => prev.filter((c) => c.id !== commentId));

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      fetchComments(); // 刪除失敗時重新載入
    }
  };

  const timeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return '剛剛';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} 分鐘前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} 小時前`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} 天前`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} 個月前`;
    return `${Math.floor(months / 12)} 年前`;
  };

  return (
    <>
      <div className="rounded-2xl border border-surface-200 bg-white overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-surface-900">留言區</h3>
            <p className="text-xs text-surface-400">
              {comments.length > 0 ? `${comments.length} 則留言` : '成為第一個留言的人！'}
            </p>
          </div>
        </div>

        {/* Comments List */}
        <div className="divide-y divide-surface-50">
          {loading ? (
            <div className="px-6 py-8 text-center text-surface-400 text-sm">載入留言中...</div>
          ) : comments.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-surface-400 text-sm">還沒有人留言，快來分享你的想法吧！</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="px-6 py-4 hover:bg-surface-50/50 transition-colors">
                <div className="flex gap-3">
                  {/* Avatar */}
                  {comment.profiles?.avatar_url ? (
                    <img
                      src={comment.profiles.avatar_url}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-surface-100 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-300 to-accent-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {(comment.profiles?.display_name)?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-surface-800">
                        {comment.profiles?.display_name || '匿名使用者'}
                      </span>
                      <span className="text-xs text-surface-400">
                        {timeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-surface-600 leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                  {/* Delete button (own comments only) */}
                  {user && comment.user_id === user.id && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="self-start p-1.5 rounded-lg text-surface-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="刪除留言"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Form / Login Prompt */}
        <div className="px-6 py-4 border-t border-surface-100 bg-surface-50/50">
          {user ? (
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="flex-shrink-0">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center text-white text-sm font-bold">
                    {(profile?.display_name || user.email)?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="分享你的想法..."
                  maxLength={500}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-sm bg-white"
                  required
                />
                <button
                  type="submit"
                  disabled={submitting || !content.trim()}
                  className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-sm hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  送出
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-surface-500 mb-2">登入後即可留言</p>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-6 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                登入留言
              </button>
            </div>
          )}
        </div>
      </div>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
