// Showcase landing page — intentionally left blank for now (design/wording not
// finalised). Kept as a neutral placeholder so navigation is complete.
import { SITE_NAME } from "../config";

export function HomePage() {
  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="text-3xl font-semibold text-content">{SITE_NAME}</h1>
      <p className="mt-4 max-w-md text-content/60">
        Page d'accueil en construction — la vitrine de présentation sera bientôt
        disponible.
      </p>
    </section>
  );
}
