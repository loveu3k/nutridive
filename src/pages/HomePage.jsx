import { useState, useEffect } from 'react';
import { supabase, isConfigured } from '../lib/supabase';
import PostCard from '../components/PostCard';

import { DEMO_POSTS } from '../data/posts';

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('全部');

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

  // Extract nutrients sorted by frequency
  const nutrientCounts = {};
  posts.forEach(post => {
    if (post.nutrients && Array.isArray(post.nutrients)) {
      post.nutrients.forEach(n => {
        if (n) {
          nutrientCounts[n] = (nutrientCounts[n] || 0) + 1;
        }
      });
    }
  });

  const sortedNutrients = Object.entries(nutrientCounts)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);

  const filteredPosts = selectedCategory === '全部'
    ? posts
    : posts.filter(post => post.nutrients && Array.isArray(post.nutrients) && post.nutrients.includes(selectedCategory));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <section className="text-center mb-10 animate-fade-in">
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

      {/* Category Tabs */}
      {(loading || posts.length > 0) && (
        <div className="flex flex-wrap justify-center gap-2 mb-8 min-h-[38px] items-center animate-fade-in">
          {loading ? (
            <>
              <div className="h-9 w-16 rounded-full bg-surface-200 animate-pulse" />
              <div className="h-9 w-12 rounded-full bg-surface-200 animate-pulse" />
              <div className="h-9 w-12 rounded-full bg-surface-200 animate-pulse" />
              <div className="h-9 w-16 rounded-full bg-surface-200 animate-pulse" />
            </>
          ) : (
            <>
              <button
                onClick={() => setSelectedCategory('全部')}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 cursor-pointer ${
                  selectedCategory === '全部'
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                }`}
              >
                全部
              </button>
              {sortedNutrients.map((nutrient) => (
                <button
                  key={nutrient}
                  onClick={() => setSelectedCategory(nutrient)}
                  className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 cursor-pointer ${
                    selectedCategory === nutrient
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                  }`}
                >
                  {nutrient}
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {/* Posts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white shadow-sm overflow-hidden border border-transparent">
              <div className="aspect-video bg-surface-200 animate-pulse" />
              <div className="p-5">
                {/* Tag skeleton */}
                <div className="flex gap-1.5 mb-3">
                  <div className="h-5 w-16 rounded-full bg-surface-200 animate-pulse" />
                  <div className="h-5 w-12 rounded-full bg-surface-200 animate-pulse" />
                </div>
                {/* Title skeleton - 2 lines */}
                <div className="space-y-2 mb-4">
                  <div className="h-5 w-full rounded bg-surface-200 animate-pulse" />
                  <div className="h-5 w-2/3 rounded bg-surface-200 animate-pulse" />
                </div>
                {/* Date skeleton */}
                <div className="h-4 w-28 rounded bg-surface-200 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post, index) => (
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

      {!loading && posts.length > 0 && filteredPosts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-surface-400 text-lg">沒有找到含有該營養素的文章，敬請期待！</p>
        </div>
      )}
    </div>
  );
}
