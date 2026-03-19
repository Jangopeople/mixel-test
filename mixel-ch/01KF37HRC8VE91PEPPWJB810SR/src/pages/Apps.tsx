import Footer from "@/components/layout/Footer.tsx";
import Header from "@/components/layout/Header.tsx";
import SeoHead from "@/components/seo/SeoHead.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  ArrowRight,
  Bot,
  ExternalLink,
  FileText,
  Headphones,
  MonitorPlay,
  Shield,
  Sparkles,
  Workflow,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

const APPS_HERO_VIDEO = "/assets/media/loop-coding-3.mp4";
const APPS_HERO_POSTER = "/assets/media/stills/apps-hero-architecture.svg";

const APP_PORTALS = [
  {
    key: "accounting",
    icon: FileText,
    href: "https://acc.mixel.ch",
    domain: "acc.mixel.ch",
    image: "/assets/media/stills/app-accounting.svg",
    surfaceClass: "bg-slate-100",
  },
  {
    key: "ticketsystem",
    icon: Headphones,
    href: "https://ism.mixel.ch",
    domain: "ism.mixel.ch",
    image: "/assets/media/stills/app-ticketing.svg",
    surfaceClass: "bg-blue-50",
  },
  {
    key: "marketing",
    icon: MonitorPlay,
    href: "https://marketing.mixel.ch",
    domain: "marketing.mixel.ch",
    image: "/assets/media/stills/app-marketing.svg",
    surfaceClass: "bg-emerald-50",
  },
  {
    key: "mixekai",
    icon: Bot,
    href: "https://ai.mixel.ch",
    domain: "ai.mixel.ch",
    image: "/assets/media/stills/app-ai.svg",
    surfaceClass: "bg-amber-50",
  },
  {
    key: "kyc",
    icon: Shield,
    href: "https://kyc.mixel.ch",
    domain: "kyc.mixel.ch",
    image: "/assets/media/stills/app-kyc.svg",
    surfaceClass: "bg-rose-50",
  },
] as const;

export default function Apps() {
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation("common");
  const locale = lng ?? "de";

  const deliverySteps = [
    { icon: Sparkles, title: t("apps.method.step1.title"), desc: t("apps.method.step1.desc") },
    { icon: Workflow, title: t("apps.method.step2.title"), desc: t("apps.method.step2.desc") },
    { icon: Shield, title: t("apps.method.step3.title"), desc: t("apps.method.step3.desc") },
    { icon: Headphones, title: t("apps.method.step4.title"), desc: t("apps.method.step4.desc") },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <SeoHead title={t("apps.hero.title")} description={t("apps.hero.subtitle")} />
      <Header />

      <section className="relative overflow-hidden border-b bg-slate-100 text-slate-900">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={APPS_HERO_POSTER}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={APPS_HERO_VIDEO} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(248,250,252,0.93)_20%,rgba(248,250,252,0.75)_58%,rgba(226,232,240,0.9)_100%)]" />

        <div className="container relative mx-auto px-4 py-20 md:px-6 md:py-24">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary/90">
              {t("apps.hero.eyebrow")}
            </p>
            <h1 className="text-balance text-4xl font-semibold leading-tight md:text-5xl lg:text-6xl">
              {t("apps.hero.title")}
            </h1>
            <p className="mx-auto max-w-3xl text-lg text-slate-700 md:text-xl">
              {t("apps.hero.subtitle")}
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" data-analytics-event="apps_primary_cta_click">
                <a href={`/${locale}#contact`}>
                  {t("apps.hero.cta_primary")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                data-analytics-event="apps_demo_cta_click"
                className="border-slate-300 bg-white/80 text-slate-900 hover:bg-white"
              >
                <Link to={`/${locale}/contact`}>
                  {t("apps.hero.cta_secondary")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto mb-12 max-w-3xl space-y-3 text-center">
            <h2 className="text-3xl font-semibold md:text-4xl">{t("apps.gallery.title")}</h2>
            <p className="text-muted-foreground">{t("apps.gallery.subtitle")}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {APP_PORTALS.map((app) => {
              const Icon = app.icon;
              const mailSubject = encodeURIComponent(`Demo request - ${app.domain}`);

              return (
                <Card key={app.key} className="overflow-hidden border-border/70 shadow-sm">
                  <div className={`relative aspect-video overflow-hidden ${app.surfaceClass}`}>
                    <img
                      src={app.image}
                      alt={app.domain}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute right-3 bottom-3 inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white/75 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {t("apps.portal.restricted")}
                    </div>
                  </div>

                  <CardHeader className="space-y-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>{t(`apps.portal.${app.key}.title`)}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {t(`apps.portal.${app.key}.desc`)}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="rounded-md border bg-muted/40 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {app.domain}
                    </p>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>{t(`apps.portal.${app.key}.feature1`)}</p>
                      <p>{t(`apps.portal.${app.key}.feature2`)}</p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button asChild size="sm" className="flex-1" data-analytics-event="apps_open_portal_click">
                        <a href={app.href} target="_blank" rel="noreferrer">
                          {t("apps.portal.open")}
                          <ExternalLink className="ml-2 h-3.5 w-3.5" />
                        </a>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="flex-1" data-analytics-event="apps_request_demo_click">
                        <Link to={`/${locale}/contact`}>
                          {t("apps.portal.demo")}
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/40 py-20 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto mb-12 max-w-3xl space-y-3 text-center">
            <h2 className="text-3xl font-semibold md:text-4xl">{t("apps.method.title")}</h2>
            <p className="text-muted-foreground">{t("apps.method.subtitle")}</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {deliverySteps.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.title} className="border-border/70 bg-card">
                  <CardHeader className="space-y-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                    <CardDescription>{step.desc}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="rounded-2xl border bg-card p-8 text-center md:p-10">
            <h2 className="text-2xl font-semibold md:text-3xl">{t("apps.outro.title")}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{t("apps.outro.subtitle")}</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <a href={`/${locale}#contact`}>
                  {t("apps.outro.cta_primary")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to={`/${locale}`}>{t("apps.outro.cta_secondary")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
