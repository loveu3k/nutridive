import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PostPage from './pages/PostPage';
import NutritionToolPage from './pages/NutritionToolPage';
import AuthCallbackPage from './pages/AuthCallbackPage';

const VideoImportPage = lazy(() => import('./pages/VideoImportPage'));

function LazyFallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 rounded-full border-3 border-primary-500 border-t-transparent animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/post/:slug" element={<PostPage />} />
            <Route path="/nutrition-tool" element={<NutritionToolPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route
              path="/admin/import"
              element={
                <Suspense fallback={<LazyFallback />}>
                  <VideoImportPage />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
