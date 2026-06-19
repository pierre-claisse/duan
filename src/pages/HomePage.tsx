// Showcase landing page — intentionally left blank for now (design/wording not
// finalised). Kept as a neutral placeholder so navigation is complete.
import { useI18n } from "../i18n";

export function HomePage() {
  const { t } = useI18n();
  return (
    <section className="flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="text-3xl font-semibold text-content">{t("brand")}</h1>
      <p className="mt-4 max-w-md text-content/60">{t("home.text")}</p>
    </section>
  );
}
