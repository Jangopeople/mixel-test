import { Button } from "@/components/ui/button.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import LocaleSwitcher from "@/components/ui/locale-switcher.tsx";
import QuickContactBar from "@/components/layout/QuickContactBar.tsx";
import SiteSearch from "@/components/layout/SiteSearch.tsx";
import { api } from "@/convex/_generated/api.js";
import { useQuery } from "convex/react";
import {
  ChevronDown,
  ExternalLink,
  Lock,
  LockKeyhole,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

const CLIENT_PORTALS = [
  { key: "accounting", href: "https://acc.mixel.ch", domain: "acc.mixel.ch" },
  { key: "ticketsystem", href: "https://ism.mixel.ch", domain: "ism.mixel.ch" },
  {
    key: "marketing",
    href: "https://marketing.mixel.ch",
    domain: "marketing.mixel.ch",
  },
  { key: "mixekai", href: "https://ai.mixel.ch", domain: "ai.mixel.ch" },
  { key: "kyc", href: "https://kyc.mixel.ch", domain: "kyc.mixel.ch" },
] as const;

type PortalKey = (typeof CLIENT_PORTALS)[number]["key"];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation("common");
  const locale = lng ?? "de";

  const hasPortalAuthBackend = Boolean(import.meta.env.VITE_CONVEX_URL);
  const portalState = useQuery(
    api.users.getPortalAccess,
    hasPortalAuthBackend ? {} : "skip",
  );
  const isPortalLoading = hasPortalAuthBackend && portalState === undefined;
  const hasPortalAccess = (key: PortalKey) =>
    hasPortalAuthBackend && portalState?.portalAccess?.[key] === true;
  const allowedPortalCount = CLIENT_PORTALS.filter((item) =>
    hasPortalAccess(item.key),
  ).length;

  const handleHomeClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  };

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg"
      >
        {t("nav.skip_to_content")}
      </a>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
          <Link
            to={`/${locale}`}
            className="flex items-center gap-3"
            onClick={handleHomeClick}
            aria-label={t("nav.home")}
          >
            <img
              src="/assets/branding/mixel-logo.png"
              alt="Mixel IT and Corporate Services"
              width={56}
              height={56}
              fetchPriority="high"
              className="h-14 w-14"
            />
            <div className="hidden sm:block">
              <div className="text-lg font-bold leading-tight">Mixel</div>
              <div className="hidden 2xl:block text-xs text-muted-foreground">
                IT and Corporate Services
              </div>
            </div>
          </Link>

          <nav
            className="hidden lg:flex gap-8 items-center"
            aria-label="Main navigation"
          >
            <Link
              to={`/${locale}/apps`}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {t("nav.apps")}
            </Link>
            <div
              className="relative group"
              onMouseEnter={() => setIsServicesOpen(true)}
              onMouseLeave={() => setIsServicesOpen(false)}
            >
              <button
                className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1 py-2"
                aria-expanded={isServicesOpen}
                aria-haspopup="true"
              >
                {t("nav.services")}
                <ChevronDown className="h-4 w-4" />
              </button>
              {isServicesOpen && (
                <div
                  className="absolute top-full left-0 pt-2 w-56 z-50"
                  role="menu"
                >
                  <div className="bg-card border rounded-lg shadow-xl py-2">
                    <Link
                      to={`/${locale}/services/network`}
                      className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                      role="menuitem"
                    >
                      {t("service.network")}
                    </Link>
                    <Link
                      to={`/${locale}/services/server`}
                      className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                      role="menuitem"
                    >
                      {t("service.server")}
                    </Link>
                    <Link
                      to={`/${locale}/services/microsoft-365`}
                      className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                      role="menuitem"
                    >
                      {t("service.microsoft365")}
                    </Link>
                    <Link
                      to={`/${locale}/services/video-security`}
                      className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                      role="menuitem"
                    >
                      {t("service.video")}
                    </Link>
                    <Link
                      to={`/${locale}/services/telephony`}
                      className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                      role="menuitem"
                    >
                      {t("service.telephony")}
                    </Link>
                    <Link
                      to={`/${locale}/services/ai`}
                      className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                      role="menuitem"
                    >
                      {t("service.ai")}
                    </Link>
                    <Link
                      to={`/${locale}/services/service-desk`}
                      className="block px-4 py-2 text-sm hover:bg-muted transition-colors"
                      role="menuitem"
                    >
                      {t("service.servicedesk")}
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <Link
              to={`/${locale}/case-studies`}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {t("nav.case_studies")}
            </Link>
            <Link
              to={`/${locale}/pricing`}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              {t("nav.pricing")}
            </Link>
            <Link
              to={`/${locale}/insights`}
              className="hidden 2xl:inline text-sm font-medium hover:text-primary transition-colors"
            >
              {t("nav.insights")}
            </Link>
            <Link
              to={`/${locale}/about`}
              className="hidden 2xl:inline text-sm font-medium hover:text-primary transition-colors"
            >
              {t("nav.about")}
            </Link>
            <Link
              to={`/${locale}/contact`}
              className="hidden 2xl:inline text-sm font-medium hover:text-primary transition-colors"
            >
              {t("nav.contact")}
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <SiteSearch />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={allowedPortalCount > 0 ? "default" : "outline"}
                  size="sm"
                  className="hidden md:inline-flex"
                  aria-label={t("auth.header_action")}
                >
                  <LockKeyhole className="h-4 w-4" />
                  <span className="hidden lg:inline">
                    {t("auth.header_action")}
                  </span>
                  {allowedPortalCount > 0 ? (
                    <span className="rounded-full bg-primary-foreground/20 px-1.5 text-xs">
                      {allowedPortalCount}
                    </span>
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>{t("auth.menu_title")}</DropdownMenuLabel>
                <p className="px-2 pb-2 text-xs text-muted-foreground">
                  {t("auth.menu_subtitle")}
                </p>
                <DropdownMenuSeparator />

                {isPortalLoading ? (
                  <p className="px-2 py-1.5 text-sm text-muted-foreground">
                    {t("auth.loading")}
                  </p>
                ) : (
                  CLIENT_PORTALS.map((portal) => {
                    const isAllowed = hasPortalAccess(portal.key);
                    const portalName = t(`auth.portal.${portal.key}`);
                    if (hasPortalAuthBackend && !isAllowed) {
                      return (
                        <DropdownMenuItem key={portal.key} disabled>
                          <Lock className="h-4 w-4" />
                          <span className="flex-1">{portalName}</span>
                          <span className="text-xs text-muted-foreground">
                            {portal.domain}
                          </span>
                        </DropdownMenuItem>
                      );
                    }
                    return (
                      <DropdownMenuItem key={portal.key} asChild>
                        <a href={portal.href} target="_blank" rel="noreferrer">
                          {hasPortalAuthBackend ? (
                            <ShieldCheck className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <LockKeyhole className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="flex-1">{portalName}</span>
                          <span className="text-xs text-muted-foreground">
                            {portal.domain}
                          </span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </DropdownMenuItem>
                    );
                  })
                )}

                <DropdownMenuSeparator />
                {hasPortalAuthBackend &&
                !isPortalLoading &&
                !portalState?.hasAnyPortalAccess ? (
                  <p className="px-2 pb-2 text-xs text-muted-foreground">
                    {t("auth.no_access")}
                  </p>
                ) : null}
                <div className="p-2 pt-0">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <a href="mailto:info@mixel.ch?subject=Portal%20access%20request">
                      {t("auth.request_access")}
                    </a>
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <LocaleSwitcher />
            <Button
              asChild
              className="hidden md:inline-flex"
              data-analytics-event="header_call_click"
            >
              <a href="tel:0444331400">{t("cta.call")}</a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t bg-background">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <Link
                to={`/${locale}`}
                className="block py-2 text-sm font-medium"
                onClick={() => {
                  handleHomeClick();
                  setIsMenuOpen(false);
                }}
              >
                {t("nav.home")}
              </Link>
              <Link
                to={`/${locale}/apps`}
                className="block py-2 text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.apps")}
              </Link>
              <Link
                to={`/${locale}/case-studies`}
                className="block py-2 text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.case_studies")}
              </Link>
              <Link
                to={`/${locale}/pricing`}
                className="block py-2 text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.pricing")}
              </Link>
              <Link
                to={`/${locale}/insights`}
                className="block py-2 text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.insights")}
              </Link>
              <Link
                to={`/${locale}/about`}
                className="block py-2 text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.about")}
              </Link>
              <Link
                to={`/${locale}/contact`}
                className="block py-2 text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                {t("nav.contact")}
              </Link>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  {t("nav.services")}
                </div>
                <Link
                  to={`/${locale}/services/network`}
                  className="block py-2 pl-4 text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("service.network")}
                </Link>
                <Link
                  to={`/${locale}/services/server`}
                  className="block py-2 pl-4 text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("service.server")}
                </Link>
                <Link
                  to={`/${locale}/services/microsoft-365`}
                  className="block py-2 pl-4 text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("service.microsoft365")}
                </Link>
                <Link
                  to={`/${locale}/services/video-security`}
                  className="block py-2 pl-4 text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("service.video")}
                </Link>
                <Link
                  to={`/${locale}/services/telephony`}
                  className="block py-2 pl-4 text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("service.telephony")}
                </Link>
                <Link
                  to={`/${locale}/services/ai`}
                  className="block py-2 pl-4 text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("service.ai")}
                </Link>
                <Link
                  to={`/${locale}/services/service-desk`}
                  className="block py-2 pl-4 text-sm"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("service.servicedesk")}
                </Link>
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="text-sm font-medium text-muted-foreground">
                  {t("auth.menu_title")}
                </div>
                {isPortalLoading ? (
                  <p className="text-sm text-muted-foreground">
                    {t("auth.loading")}
                  </p>
                ) : (
                  CLIENT_PORTALS.map((portal) => {
                    const isAllowed = hasPortalAccess(portal.key);
                    const portalName = t(`auth.portal.${portal.key}`);
                    if (hasPortalAuthBackend && !isAllowed) {
                      return (
                        <div
                          key={portal.key}
                          className="flex items-center justify-between rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground"
                        >
                          <span>{portalName}</span>
                          <Lock className="h-4 w-4" />
                        </div>
                      );
                    }
                    return (
                      <a
                        key={portal.key}
                        href={portal.href}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                      >
                        <span>{portalName}</span>
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </a>
                    );
                  })
                )}
                <Button asChild variant="outline" className="w-full">
                  <a href="mailto:info@mixel.ch?subject=Portal%20access%20request">
                    {t("auth.request_access")}
                  </a>
                </Button>
              </div>

              <Button asChild className="w-full">
                <a href="tel:0444331400">{t("cta.call")}</a>
              </Button>
            </div>
          </div>
        )}
      </header>

      <QuickContactBar />
    </>
  );
}
