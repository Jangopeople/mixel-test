import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import SeoHead from "@/components/seo/SeoHead.tsx";
import { isSupportedLocale } from "@/i18n.ts";
import { Mail, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const location = useLocation();
  const { t } = useTranslation("common");
  const firstSegment = location.pathname.split("/").filter(Boolean)[0];
  const locale = isSupportedLocale(firstSegment) ? firstSegment : "de";

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)]">
      <SeoHead
        title={t("notfound.title")}
        description={t("notfound.description")}
        noIndex
      />
      <main className="container mx-auto flex min-h-screen items-center px-4 py-16 md:px-6">
        <div className="mx-auto w-full max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">404</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-900 md:text-4xl">{t("notfound.title")}</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t("notfound.description")}</p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Button asChild>
              <Link to={`/${locale}`}>{t("notfound.cta_home")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={`/${locale}/services/network`}>{t("notfound.cta_services")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={`/${locale}/contact`}>{t("notfound.cta_contact")}</Link>
            </Button>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left sm:p-5">
            <p className="text-sm font-semibold text-slate-900">{t("notfound.support_title")}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t("notfound.support_subtitle")}</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button asChild size="sm" variant="outline" className="justify-start">
                <a href="tel:0444331400">
                  <Phone className="mr-2 h-4 w-4" />
                  044 433 14 00
                </a>
              </Button>
              <Button asChild size="sm" variant="outline" className="justify-start">
                <a href="mailto:info@mixel.ch">
                  <Mail className="mr-2 h-4 w-4" />
                  info@mixel.ch
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
