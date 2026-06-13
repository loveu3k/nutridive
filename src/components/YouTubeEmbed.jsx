export default function YouTubeEmbed({ videoId }) {
  if (!videoId) return null;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-lg bg-surface-900" style={{ aspectRatio: '16/9' }}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
