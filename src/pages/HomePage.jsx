import { useState, useEffect } from 'react';
import { supabase, isConfigured } from '../lib/supabase';
import PostCard from '../components/PostCard';

import { DEMO_POSTS } from '../data/posts';

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!isConfigured) {
        setPosts(DEMO_POSTS);
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('id, title, slug, youtube_video_id, nutrients, created_at')
          .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
          setPosts(DEMO_POSTS);
        } else {
          setPosts(data);
        }
      } catch {
        // Supabase 未連線，使用示範資料
        setPosts(DEMO_POSTS);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="text-center mb-12 animate-fade-in">
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-surface-900 mb-4">
          用
          <span className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
            科學
          </span>
          探索營養的深度
        </h1>
        <p className="text-lg text-surface-500 max-w-2xl mx-auto leading-relaxed">
          每一期影片都以最新的科學文獻為基礎，帶你深入了解營養學的關鍵知識，
          讓健康決策不再靠感覺。
        </p>
      </section>

      {/* Posts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white shadow-sm overflow-hidden animate-pulse">
              <div className="aspect-video bg-surface-200" />
              <div className="p-5 space-y-3">
                <div className="flex gap-2">
                  <div className="h-5 w-16 rounded-full bg-surface-200" />
                  <div className="h-5 w-12 rounded-full bg-surface-200" />
                </div>
                <div className="h-6 w-full rounded bg-surface-200" />
                <div className="h-4 w-32 rounded bg-surface-200" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, index) => (
            <div key={post.id} className="animate-slide-up" style={{ animationDelay: `${index * 80}ms` }}>
              <PostCard post={post} index={index} />
            </div>
          ))}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-surface-400 text-lg">目前還沒有文章，敬請期待！</p>
        </div>
      )}
    </div>
  );
}
