// Shared bilingual primitives for the GYROKINESIS Home page, ported from the
// Claude Design project's ui_kits/website/components.jsx into typed TSX.
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

export function Eyebrow({ cjk, en }: { cjk: ReactNode; en?: string }) {
  return (
    <div className="eyebrow">
      {cjk}
      {en && <span className="eyebrow-en"> · {en}</span>}
    </div>
  );
}

export function BilingualHeading({
  cjk,
  en,
  level = 2,
  align = "left",
}: {
  cjk: ReactNode;
  en?: string;
  level?: 2 | 3;
  align?: "left" | "center";
}) {
  const Tag = `h${level}` as "h2" | "h3";
  return (
    <Tag className={`bh bh-${align}`}>
      <span className="bh-cjk">{cjk}</span>
      {en && <span className="bh-en">{en}</span>}
    </Tag>
  );
}

export function Rule({ width = 32 }: { width?: number }) {
  return <div className="rule" style={{ width }} />;
}

// GYROKINESIS® — always all caps, Times New Roman, with the registered mark.
export function Gyro() {
  return <span className="gyro">GYROKINESIS®</span>;
}

// Render a plain string, swapping any literal "GYROKINESIS®" for the
// Times-New-Roman <Gyro/> mark so the trademark keeps its required typeface
// even inside data-driven copy.
export function renderGyro(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  text.split("GYROKINESIS®").forEach((part, i) => {
    if (i > 0) out.push(<Gyro key={`g${i}`} />);
    if (part) out.push(<span key={`t${i}`}>{part}</span>);
  });
  return out;
}

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
} & (
  | ({ as?: "button" } & React.ButtonHTMLAttributes<HTMLButtonElement>)
  | ({ as: "a" } & React.AnchorHTMLAttributes<HTMLAnchorElement>)
);

export function Button({
  children,
  variant = "primary",
  size = "md",
  icon,
  as = "button",
  ...rest
}: ButtonProps) {
  const className = `btn btn-${variant} btn-${size}`;
  if (as === "a") {
    return (
      <a className={className} {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        <span>{children}</span>
        {icon}
      </a>
    );
  }
  return (
    <button className={className} {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      <span>{children}</span>
      {icon}
    </button>
  );
}

export function Arrow() {
  return <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />;
}

const TONES: Record<string, string> = {
  sage: "linear-gradient(135deg, #c8d2bd 0%, #92a079 60%, #4f5e47 100%)",
  paper: "linear-gradient(135deg, #f3efe6 0%, #d0ccbe 60%, #8a8779 100%)",
  clay: "linear-gradient(135deg, #f1e0cf 0%, #d2a282 60%, #9c6f4d 100%)",
  moss: "linear-gradient(135deg, #4f5e47 0%, #28321f 100%)",
};

// A warm gradient block that signals where a photo goes — communicates the
// photographic brief without faking a real photo.
export function ImagePlaceholder({
  aspect = "4/3",
  caption,
  tone = "sage",
}: {
  aspect?: string;
  caption?: string;
  tone?: keyof typeof TONES;
}) {
  return (
    <div className="img-ph" style={{ aspectRatio: aspect, background: TONES[tone] }}>
      <div className="img-ph-vignette" />
      {caption && <span className="img-ph-cap">{caption}</span>}
    </div>
  );
}
