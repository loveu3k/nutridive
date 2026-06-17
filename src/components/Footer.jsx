export default function Footer() {
  return (
    <footer className="mt-auto border-t border-surface-200 bg-white/60 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <span className="text-white text-base">🧬</span>
              </div>
              <span className="font-display text-lg font-bold text-primary-700">營養深潛</span>
            </div>
            <p className="text-sm text-surface-500 leading-relaxed">
              用科學探索營養的深度。<br />
              以最新科學文獻為基礎，帶你深入了解健康營養學。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wider mb-3">快速連結</h3>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-sm text-surface-500 hover:text-primary-600 transition-colors">首頁</a>
              </li>
              <li>
                <a href="/nutrition-tool" className="text-sm text-surface-500 hover:text-primary-600 transition-colors">營養工具</a>
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h3 className="text-sm font-semibold text-surface-900 uppercase tracking-wider mb-3">免責聲明</h3>
            <p className="text-xs text-surface-400 leading-relaxed">
              本站內容僅供教育與資訊分享用途，不構成醫療建議。如有健康問題，請諮詢專業醫療人員。
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-surface-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-surface-400">
            © {new Date().getFullYear()} 營養深潛. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-surface-400 hover:text-red-500 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" />
                <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="white" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
