import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

export default function Footer() {
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation("common");
  const locale = lng ?? "de";

  return (
    <footer className="border-t bg-background py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-8 grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img
                src="/assets/branding/mixel-logo.png"
                alt="Mixel Logo"
                loading="lazy"
                decoding="async"
                className="h-12 w-12"
              />
              <div>
                <div className="font-bold">Mixel</div>
                <div className="text-xs text-muted-foreground">IT and Corporate Services</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{t("footer.address")}</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                Tel: <a href="tel:0444331400" className="hover:text-foreground">044 433 14 00</a>
              </p>
              <p>
                Email: <a href="mailto:info@mixel.ch" className="hover:text-foreground">info@mixel.ch</a>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">{t("nav.services")}</h4>
            <nav className="flex flex-col space-y-2 text-sm" aria-label="Services navigation">
              <Link to={`/${locale}/services/network`} className="text-muted-foreground hover:text-foreground transition-colors">
                {t("service.network")}
              </Link>
              <Link to={`/${locale}/services/server`} className="text-muted-foreground hover:text-foreground transition-colors">
                {t("service.server")}
              </Link>
              <Link to={`/${locale}/services/microsoft-365`} className="text-muted-foreground hover:text-foreground transition-colors">
                {t("service.microsoft365")}
              </Link>
              <Link to={`/${locale}/services/video-security`} className="text-muted-foreground hover:text-foreground transition-colors">
                {t("service.video")}
              </Link>
              <Link to={`/${locale}/services/service-desk`} className="text-muted-foreground hover:text-foreground transition-colors">
                {t("service.servicedesk")}
              </Link>
              <Link to={`/${locale}/services/ai`} className="text-muted-foreground hover:text-foreground transition-colors">
                {t("service.ai")}
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">{t("nav.about")}</h4>
            <nav className="flex flex-col space-y-2 text-sm" aria-label="Company navigation">
              <Link to={`/${locale}/apps`} className="text-muted-foreground hover:text-foreground transition-colors">
                {t("nav.apps")}
              </Link>
              <Link to={`/${locale}/pricing`} className="text-muted-foreground hover:text-foreground transition-colors">
                {t("nav.pricing")}
              </Link>
              <Link to={`/${locale}/case-studies`} className="text-muted-foreground hover:text-foreground transition-colors">
                {t("nav.case_studies")}
              </Link>
              <Link to={`/${locale}/insights`} className="text-muted-foreground hover:text-foreground transition-colors">
                {t("nav.insights")}
              </Link>
              <Link to={`/${locale}/about`} className="text-muted-foreground hover:text-foreground transition-colors">
                {t("nav.about")}
              </Link>
              <Link to={`/${locale}/contact`} className="text-muted-foreground hover:text-foreground transition-colors">
                {t("nav.contact")}
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">{t("footer.legal")}</h4>
            <nav className="flex flex-col space-y-2 text-sm" aria-label="Legal navigation">
              <Link to={`/${locale}/privacy`} className="text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.privacy")}
              </Link>
              <Link to={`/${locale}/terms`} className="text-muted-foreground hover:text-foreground transition-colors">
                {t("footer.terms")}
              </Link>
            </nav>
          </div>
        </div>

        <div className="border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
            <span>© {new Date().getFullYear()} {t("footer.company")}</span>
            <div className="flex gap-6">
              <Link to={`/${locale}/privacy`} className="hover:text-foreground transition-colors">
                {t("footer.privacy")}
              </Link>
              <Link to={`/${locale}/terms`} className="hover:text-foreground transition-colors">
                {t("footer.terms")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
