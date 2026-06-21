/** A handler that smooth-scrolls to a Home section by its id. */
export type SectionJump = (id: string) => void;

// Smooth-scroll to a Home section by id. Retries across a few animation frames
// so it also works right after navigating to "/" from another route, where the
// target section hasn't mounted yet.
export function scrollToSection(id: string, retries = 60): void {
  const el = document.getElementById(id);
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior: "smooth" });
  } else if (retries > 0) {
    requestAnimationFrame(() => scrollToSection(id, retries - 1));
  }
}
