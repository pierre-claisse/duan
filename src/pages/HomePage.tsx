// Home (首頁) — GYROKINESIS landing page, built from the Claude Design project
// "段予婷 GYROKINESIS Design System" (ui_kits/website). A single scrolling page:
// Hero → About → Activity → Contact → Footer. Bilingual copy (Traditional
// Chinese + English) is baked into the markup the way the design intends.
//
// NOTE: the Activity article list is placeholder copy for now — wiring it to the
// real blog is intentionally left for later. The "全部文章 / All" link already
// points at the live /blog route.
import { useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Arrow,
  BilingualHeading,
  Button,
  Eyebrow,
  Gyro,
  ImagePlaceholder,
  renderGyro,
  Rule,
} from "../home/primitives";

// ---- Smooth in-page scroll (HashRouter owns the URL hash, so we scroll by id
//      manually rather than relying on anchor navigation). ----
function useJump() {
  return useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior: "smooth" });
  }, []);
}

// ============================================================================
// Hero
// ============================================================================
function Hero({ onJump }: { onJump: (id: string) => void }) {
  return (
    <section className="hero" id="top">
      <div className="hero-photo">
        <ImagePlaceholder aspect="auto" tone="moss" caption="Photo · morning light through fronds, hands in sphere" />
      </div>
      <div className="hero-inner">
        <Eyebrow cjk={<><Gyro /> 認證指導</>} en="Certified trainer · Taipei" />
        <h1 className="hero-title">
          <span className="hero-title-cjk">呼吸先到<br />動作隨後。</span>
          <span className="hero-title-en">Breath arrives first;<br />movement follows.</span>
        </h1>
        <p className="hero-lede">
          私人 <Gyro /> 課程 ／ 台北．大安區<br />
          <em>Private sessions in Taipei.</em>
        </p>
        <div className="hero-cta">
          <Button variant="primary" size="lg" onClick={() => onJump("contact")} icon={<Arrow />}>
            聯絡 · Get in touch
          </Button>
          <Button variant="secondary" size="lg" onClick={() => onJump("activity")} icon={<Arrow />}>
            課程與文字 · Activity
          </Button>
        </div>
      </div>
      <button type="button" className="hero-scroll-cue" onClick={() => onJump("about")}>
        <span>scroll</span>
        <div className="hero-scroll-line" />
      </button>
    </section>
  );
}

// ============================================================================
// About
// ============================================================================
function About() {
  const credentials = [
    { yr: "2018—", cjk: "自由譯者（中英）", en: "Freelance translator, Mandarin ↔ English" },
    { yr: "2017", cjk: "社會學碩士．國立臺灣大學", en: "M.A. Sociology, National Taiwan University" },
    { yr: "2014—", cjk: "長期身體實踐：芭蕾、現代舞、瑜伽", en: "Long-term practice: ballet, modern, yoga" },
  ];
  return (
    <section className="section about" id="about">
      <div className="container">
        <div className="about-grid">
          <div className="about-portrait">
            <ImagePlaceholder aspect="3/4" tone="paper" caption="Portrait · Duan" />
          </div>
          <div className="about-body">
            <Eyebrow cjk="關於" en="About" />
            <BilingualHeading cjk="從社會學走進身體" en="From sociology into the body" level={2} />
            <p className="lede">
              「身體不是工具，而是棲所。」
              <br />
              <em>The body is not a tool — it is a place to live.</em>
            </p>
            <p>
              段在臺大社會學研究所完成碩士學位後，以中英筆譯為業，
              長年坐在桌前的身體，把她帶向 <Gyro /> 練習 ─ 一套以呼吸引導、
              螺旋與弧形動作為核心的身體方法。
            </p>
            <p>
              <em>
                After completing her M.A. in Sociology at NTU, Duan built a career
                as a Mandarin‑English translator — and the long hours of stillness
                drew her toward the <Gyro /> method, a practice organized around
                breath, spirals, and undulation. She now teaches in Taipei in both
                Mandarin and English.
              </em>
            </p>
            <Rule />
            <ul className="cred-list">
              {credentials.map((c, i) => (
                <li key={i} className="cred-item">
                  <span className="cred-yr">{c.yr}</span>
                  <span className="cred-body">
                    <span className="cred-cjk">{c.cjk}</span>
                    <span className="cred-en">{c.en}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Activity — session cards (left) + scrollable article list (right)
// ============================================================================
type Session = {
  eyebrow: string;
  cjk: string;
  en: string;
  desc: string;
  enDesc: string;
  duration: string;
  price: string;
  mark?: string;
};

function Activity({ onJump }: { onJump: (id: string) => void }) {
  const sessions: Session[] = [
    {
      eyebrow: "初次見面 · First meeting",
      cjk: "認識彼此",
      en: "Getting to know each other",
      desc: "第一次見面，聊聊你的身體、過去的練習與期待，試一小段引導。沒有壓力。",
      enDesc: "A first meeting — we talk through your body and what you’re hoping for, then try a short guided sequence.",
      duration: "45 min",
      price: "免費 Free",
      mark: "✻",
    },
    {
      eyebrow: "私人課 · 1‑on‑1",
      cjk: "一對一課程",
      en: "One on One session",
      desc: "完全為你編排的 GYROKINESIS® 課程，從呼吸到螺旋，逐次累積。",
      enDesc: "A GYROKINESIS® session built entirely around you — from breath to spiral, session by session.",
      duration: "60 min",
      price: "NT$ 2,800",
    },
    {
      eyebrow: "線上 · Online",
      cjk: "線上課程",
      en: "Online session",
      desc: "透過視訊指導的 GYROKINESIS® 課程，適合台北以外或國外的學生。建議搭配椅子與墊子。",
      enDesc: "A GYROKINESIS® session over video for students outside Taipei. A chair and mat are recommended.",
      duration: "50 min",
      price: "NT$ 2,200",
    },
  ];

  // Placeholder articles — real blog wiring is intentionally deferred.
  const articles = [
    { date: "2025.04", cjk: "〈坐太久的身體〉", en: "The over‑sitting body", excerpt: "翻譯桌前的身體，如何重新學會旋轉與打開。" },
    { date: "2025.02", cjk: "〈螺旋是一種思考〉", en: "Spiral as a way of thinking", excerpt: "從社會學到動作，談非線性的身體邏輯。" },
    { date: "2024.11", cjk: "〈呼吸的方向〉", en: "Which way the breath goes", excerpt: "吐氣先於用力 — 一個常被忽略的順序。" },
    { date: "2024.09", cjk: "〈從翻譯到身體〉", en: "From translation to the body", excerpt: "兩種語言之間的停頓，與動作之間的停頓。" },
    { date: "2024.06", cjk: "〈慢，但不鬆〉", en: "Slow, but not slack", excerpt: "緩慢練習裡的張力從何而來。" },
    { date: "2024.03", cjk: "〈第一堂課我會說的話〉", en: "What I say in a first class", excerpt: "給初學者的三句提醒，關於期待與耐心。" },
    { date: "2023.12", cjk: "〈把椅子當成同伴〉", en: "The chair as a partner", excerpt: "居家與線上練習裡，一張椅子能做的事。" },
    { date: "2023.10", cjk: "〈疼痛不是敵人〉", en: "Pain is not the enemy", excerpt: "聽身體說話，而不是急著讓它安靜。" },
    { date: "2023.07", cjk: "〈關於重複〉", en: "On repetition", excerpt: "同一個動作做第一百次時，發生了什麼。" },
  ];

  return (
    <section className="section activity" id="activity">
      <div className="container">
        <header className="section-head">
          <Eyebrow cjk="課程與文字" en="Activity" />
          <BilingualHeading cjk="練習，與關於練習的書寫" en="The practice, and writing around it" level={2} />
          <p className="section-sub">
            每堂課都是一次對話。歡迎初學者。
            <br />
            <em>Each session is its own conversation. Beginners welcome.</em>
          </p>
        </header>

        <div className="activity-split">
          {/* LEFT — session cards */}
          <div className="activity-sessions">
            {sessions.map((s, i) => (
              <article key={i} className="session-card">
                {s.mark && <span className="session-mark">{s.mark}</span>}
                <div className="session-eyebrow">{s.eyebrow}</div>
                <h3 className="session-ttl-cjk">{s.cjk}</h3>
                <div className="session-ttl-en">{s.en}</div>
                <p className="session-desc">{renderGyro(s.desc)}</p>
                <p className="session-desc en"><em>{renderGyro(s.enDesc)}</em></p>
                <div className="session-meta">
                  <span className="session-dur">{s.duration}</span>
                  <span className="session-price">{s.price}</span>
                </div>
              </article>
            ))}
            <div className="activity-cta">
              <Button variant="secondary" size="md" onClick={() => onJump("contact")} icon={<Arrow />}>
                來信詢問 · Get in touch
              </Button>
            </div>
          </div>

          {/* RIGHT — scrollable blog articles (height locked to the left column) */}
          <div className="activity-articles">
            <div className="activity-articles-inner">
              <div className="articles-head">
                <span className="articles-kind">文章 · Articles</span>
                <Link to="/blog" className="articles-all">全部文章 · All</Link>
              </div>
              <div className="articles-scroll">
                {articles.map((a, i) => (
                  <Link key={i} to="/blog" className="article-item">
                    <div className="article-date">{a.date}</div>
                    <h4 className="article-ttl-cjk">{a.cjk}</h4>
                    <div className="article-ttl-en"><em>{a.en}</em></div>
                    <p className="article-excerpt">{a.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Contact — links out to a contact form (placeholder) + direct channels.
// ============================================================================
function Contact() {
  const FORM_URL = "#"; // TODO: replace with the real contact-form link once provided.
  return (
    <section className="section contact" id="contact">
      <div className="container container-narrow">
        <header className="section-head section-head-center">
          <Eyebrow cjk="聯絡" en="Contact" />
          <BilingualHeading cjk="第一次接觸？來信認識一下。" en="First time? Say hello." level={2} align="center" />
          <p className="section-sub">
            透過表單留下你的需求與理想時段，段會親自回信。
            <br />
            <em>Leave your details in the form; Duan will personally write back.</em>
          </p>
        </header>

        <div className="contact-card">
          <Button variant="primary" size="lg" as="a" href={FORM_URL} icon={<Arrow />}>
            前往聯絡表單 · Open contact form
          </Button>
          <p className="contact-soon">
            表單連結即將開放。
            <br />
            <em>Form link coming soon.</em>
          </p>

          <div className="contact-divider"><span>或 · or</span></div>

          <div className="contact-direct">
            <a href="mailto:hello@duan.tw">hello@duan.tw</a>
            <a href="#" onClick={(e) => e.preventDefault()}>LINE · @duanmoves</a>
          </div>
          <p className="contact-note">
            段會在 48 小時內回信。
            <br />
            <em>Duan writes back within 48 hours.</em>
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// Footer (home-only — the design's full footer)
// ============================================================================
function HomeFooter({ onJump }: { onJump: (id: string) => void }) {
  return (
    <footer className="home-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-cjk">段</div>
            <div className="footer-en"><em>Duan</em></div>
            <div className="footer-tag"><Gyro /> Certified Trainer · Taipei</div>
          </div>
          <div className="footer-col">
            <div className="footer-h">聯絡 · Contact</div>
            <a href="mailto:hello@duan.tw">hello@duan.tw</a>
            <a href="#" onClick={(e) => e.preventDefault()}>LINE · @duanmoves</a>
          </div>
          <div className="footer-col">
            <div className="footer-h">站點 · Site</div>
            <button type="button" onClick={() => onJump("about")}>關於 · About</button>
            <button type="button" onClick={() => onJump("activity")}>課程與文字 · Activity</button>
            <Link to="/blog">部落格 · Blog</Link>
            <button type="button" onClick={() => onJump("contact")}>聯絡 · Contact</button>
          </div>
          <div className="footer-col">
            <div className="footer-h">語言 · Language</div>
            <p className="footer-note">
              本站以繁體中文與英文同時呈現。
              <br />
              <em>This site is published in Traditional Chinese and English in parallel.</em>
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 段 ／ Duan</span>
          <span><Gyro /> is a registered trademark of Gyrotonic Sales Corp.</span>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
export function HomePage() {
  const onJump = useJump();
  return (
    <div className="home">
      <Hero onJump={onJump} />
      <About />
      <Activity onJump={onJump} />
      <Contact />
      <HomeFooter onJump={onJump} />
    </div>
  );
}
