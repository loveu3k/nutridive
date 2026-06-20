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
      <section className="text-center mb-10 animate-fade-in">
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-surface-900">
          用
          <span className="bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
            科學
          </span>
          探索營養的深度
        </h1>
      </section>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white shadow-sm overflow-hidden">
              <div className="aspect-video bg-surface-200 animate-pulse" />
              <div className="p-5">
                {/* Tag skeleton */}
                <div className="flex gap-1.5 mb-3 animate-pulse">
                  <div className="h-5 w-16 rounded-full bg-surface-200" />
                  <div className="h-5 w-12 rounded-full bg-surface-200" />
                </div>
                {/* Title skeleton - 2 lines */}
                <div className="space-y-2 mb-2 animate-pulse">
                  <div className="h-[26px] w-full rounded bg-surface-200" />
                  <div className="h-[26px] w-2/3 rounded bg-surface-200" />
                </div>
                {/* Date skeleton */}
                <div className="h-5 w-28 rounded bg-surface-200 animate-pulse" />
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
