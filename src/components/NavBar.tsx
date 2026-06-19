// Mobile-first top navigation. Links collapse behind a hamburger below `md`.
// The Agenda link only appears when the professor is signed in.
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, Moon, Sun, LogIn, LogOut } from "lucide-react";
import { useAuth } from "../auth";
import { useI18n } from "../i18n";
import { useTheme } from "../hooks/useTheme";
import { LanguageMenu } from "./LanguageMenu";

export function NavBar({ onLoginClick }: { onLoginClick: () => void }) {
  const { state, signOut } = useAuth();
  const { t } = useI18n();
  const { dark, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const unlocked = state.status === "unlocked";

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-3 py-2 text-sm transition-colors ${
      isActive
        ? "bg-accent/10 font-medium text-accent"
        : "text-content/70 hover:bg-content/5 hover:text-content"
    }`;

  const close = () => setOpen(false);

  const links = (
    <>
      <NavLink to="/" end className={linkClass} onClick={close}>
        {t("nav.home")}
      </NavLink>
      <NavLink to="/blog" className={linkClass} onClick={close}>
        {t("nav.blog")}
      </NavLink>
      {unlocked && (
        <NavLink to="/agenda" className={linkClass} onClick={close}>
          {t("nav.agenda")}
        </NavLink>
      )}
    </>
  );

  const actions = (
    <>
      <LanguageMenu onPick={close} />
      <button
        type="button"
        onClick={toggle}
        aria-label={dark ? t("nav.lightMode") : t("nav.darkMode")}
        className="rounded-lg p-2 text-content/70 hover:bg-content/5 hover:text-content"
      >
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      {unlocked ? (
        <button
          type="button"
          onClick={() => {
            signOut();
            close();
          }}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-content/70 hover:bg-content/5 hover:text-content"
        >
          <LogOut className="h-4 w-4" />
          {t("nav.logout")}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            onLoginClick();
            close();
          }}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-content/70 hover:bg-content/5 hover:text-content"
        >
          <LogIn className="h-4 w-4" />
          {t("nav.teacherLogin")}
        </button>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-content/10 bg-surface/95 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4">
        <div className="flex h-14 items-center justify-between">
          <NavLink to="/" className="text-base font-semibold text-content" onClick={close}>
            {t("brand")}
          </NavLink>

          <nav className="hidden items-center gap-1 md:flex">
            {links}
            <span className="mx-1 h-5 w-px bg-content/10" />
            {actions}
          </nav>

          <button
            type="button"
            className="rounded-lg p-2 text-content/70 hover:bg-content/5 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={t("nav.menu")}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <nav className="flex flex-col gap-1 pb-3 md:hidden">
            {links}
            <div className="mt-2 flex flex-wrap items-center gap-1 border-t border-content/10 pt-2">
              {actions}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
