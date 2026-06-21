import { useState } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginScreen, useAuth } from "./auth";
import { useI18n } from "./i18n";
import { NavBar } from "./components/NavBar";
import { HomePage } from "./pages/HomePage";
import { BlogListPage } from "./blog/BlogListPage";
import { ArticlePage } from "./blog/ArticlePage";
import { ArticleEditor } from "./blog/ArticleEditor";
import { CalendarPage } from "./calendar/CalendarPage";

function Shell() {
  const { state } = useAuth();
  const { t } = useI18n();
  const unlocked = state.status === "unlocked";
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <div className="flex min-h-full flex-col">
      <NavBar onLoginClick={() => setLoginOpen(true)} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<ArticlePage />} />
          {/* Editor + Calendar are professor-only; anonymous URLs redirect home. */}
          <Route
            path="/editor"
            element={unlocked ? <ArticleEditor /> : <Navigate to="/" replace />}
          />
          <Route
            path="/editor/:slug"
            element={unlocked ? <ArticleEditor /> : <Navigate to="/" replace />}
          />
          <Route
            path="/calendar"
            element={unlocked ? <CalendarPage /> : <Navigate to="/" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="border-t border-content/10 py-6 text-center text-xs text-content/40">
        {t("brand")}
      </footer>
      {loginOpen && <LoginScreen onClose={() => setLoginOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  );
}
