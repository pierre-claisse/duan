// Top navigation — ported from the Claude Design "段予婷 GYROKINESIS Design
// System" (ui_kits/website). Fixed, transparent at the top, blurs in on scroll.
// Section links smooth-scroll the Home page (and route home first when clicked
// from another page). Additions over the source design: a 部落格 / Blog router
// link, a 教師登入 / Teacher sign-in control, and the dark/light theme switcher.
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { useAuth } from "../auth";
import { useTheme } from "../hooks/useTheme";
import { Arrow, Button } from "../home/primitives";
import { scrollToSection, type SectionJump } from "../lib/scrollToSection";

type NavItem =
  | { kind: "section"; id: string; cjk: string; en: string }
  | { kind: "route"; to: string; id: string; cjk: string; en: string };

const ITEMS: NavItem[] = [
  { kind: "section", id: "about", cjk: "關於", en: "About" },
  { kind: "section", id: "activity", cjk: "課程與文字", en: "Activity" },
  { kind: "route", to: "/blog", id: "blog", cjk: "部落格", en: "Blog" },
  { kind: "section", id: "contact", cjk: "聯絡", en: "Contact" },
];

export function NavBar({ onLoginClick }: { onLoginClick: () => void }) {
  const { state, signOut } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const unlocked = state.status === "unlocked";
  const onHome = location.pathname === "/";
  const onBlog = location.pathname.startsWith("/blog");

  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("top");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Section scroll-spy — only meaningful on the Home page.
  useEffect(() => {
    if (!onHome) return;
    const ids = ["top", "about", "activity", "contact"];
    const onScroll = () => {
      let current = "top";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [onHome]);

  const onJump: SectionJump = (id) => {
    if (!onHome) navigate("/");
    scrollToSection(id);
  };

  return (
    <nav className={`nav ${scrolled ? "nav-scrolled" : ""}`}>
      <div className="nav-inner">
        <a
          className="nav-brand"
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onJump("top");
          }}
        >
          <span className="nav-brand-cjk">段</span>
          <span className="nav-brand-en">Duan</span>
        </a>

        <ul className="nav-links">
          {ITEMS.map((it) =>
            it.kind === "section" ? (
              <li key={it.id}>
                <button
                  type="button"
                  className={!onBlog && active === it.id ? "nav-link is-active" : "nav-link"}
                  onClick={() => onJump(it.id)}
                >
                  <span className="nav-link-cjk">{it.cjk}</span>
                  <span className="nav-link-en">{it.en}</span>
                </button>
              </li>
            ) : (
              <li key={it.id}>
                <Link to={it.to} className={onBlog ? "nav-link is-active" : "nav-link"}>
                  <span className="nav-link-cjk">{it.cjk}</span>
                  <span className="nav-link-en">{it.en}</span>
                </Link>
              </li>
            ),
          )}
        </ul>

        <div className="nav-right">
          <button
            type="button"
            className="nav-theme"
            onClick={toggle}
            aria-label={dark ? "Light mode / 淺色模式" : "Dark mode / 深色模式"}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {unlocked ? (
            <button type="button" className="nav-link nav-account" onClick={signOut}>
              <span className="nav-link-cjk">登出</span>
              <span className="nav-link-en">Sign out</span>
            </button>
          ) : (
            <button type="button" className="nav-link nav-account" onClick={onLoginClick}>
              <span className="nav-link-cjk">教師登入</span>
              <span className="nav-link-en">Teacher sign-in</span>
            </button>
          )}

          <Button variant="primary" size="sm" onClick={() => onJump("contact")} icon={<Arrow />}>
            聯絡 · Contact
          </Button>
        </div>
      </div>
    </nav>
  );
}
