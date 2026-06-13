import { Link } from 'react-router-dom';

export default function PostCard({ post, index = 0 }) {
  const thumbnailUrl = `https://img.youtube.com/vi/${post.youtube_video_id}/maxresdefault.jpg`;
  const nutrients = post.nutrients || [];
  const date = new Date(post.created_at).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link
      to={`/post/${post.slug}`}
      className="group block rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden aspect-video">
        <img
          src={thumbnailUrl}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors duration-300">
          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:scale-100 scale-75">
            <svg className="w-6 h-6 text-red-500 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Nutrient tags */}
        {nutrients.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {nutrients.slice(0, 3).map((nutrient, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-primary-50 text-primary-700 ring-1 ring-primary-200"
              >
                {nutrient}
              </span>
            ))}
            {nutrients.length > 3 && (
              <span className="px-2 py-0.5 text-xs text-surface-400">
                +{nutrients.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="font-display text-lg font-bold text-surface-900 group-hover:text-primary-600 transition-colors line-clamp-2 mb-2">
          {post.title}
        </h3>

        {/* Date */}
        <p className="text-sm text-surface-400 flex items-center gap-1.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {date}
        </p>
      </div>
    </Link>
  );
}
