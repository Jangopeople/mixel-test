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
import { SITE_NAME, toAbsoluteUrl } from "@/lib/seo.ts";
import { ArrowRight, Bot, Cloud, Headphones, Quote } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

const CASE_IMAGES = [
  "/assets/media/stills/case-m365.svg",
  "/assets/media/stills/case-servicedesk.svg",
  "/assets/media/stills/case-ai-kyc.svg",
] as const;

const CASE_ICONS = [Cloud, Headphones, Bot] as const;

export default function CaseStudies() {
  const { t } = useTranslation("common");
  const { lng } = useParams<{ lng: string }>();
  const locale = lng ?? "de";

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t("home.cases.title"),
    description: t("home.cases.subtitle"),
    url: toAbsoluteUrl(`/${locale}/case-studies`),
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: toAbsoluteUrl(`/${locale}`),
    },
  } as const;

  const cases = [1, 2, 3].map((index) => ({
    icon: CASE_ICONS[index - 1],
    image: CASE_IMAGES[index - 1],
    sector: t(`home.cases.card${index}.sector`),
    title: t(`home.cases.card${index}.title`),
    summary: t(`home.cases.card${index}.summary`),
    metric1: t(`home.cases.card${index}.metric1`),
    metric2: t(`home.cases.card${index}.metric2`),
  }));

  const testimonials = [1, 2, 3].map((index) => ({
    name: t(`testimonials.client${index}.name`),
    company: t(`testimonials.client${index}.company`),
    quote: t(`testimonials.client${index}.quote`),
  }));

  return (
    <div className="min-h-screen bg-background">
      <SeoHead title={t("home.cases.title")} description={t("home.cases.subtitle")} schema={schema} />
      <Header />

      <section className="border-b bg-slate-100/90 py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t("nav.case_studies")}</p>
            <h1 className="text-balance text-4xl font-semibold md:text-5xl">{t("home.cases.title")}</h1>
            <p className="text-muted-foreground">{t("home.cases.subtitle")}</p>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {cases.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
                  <div className="aspect-video overflow-hidden bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardHeader className="space-y-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">{item.sector}</p>
                    <CardTitle className="text-2xl">{item.title}</CardTitle>
                    <CardDescription className="text-base">{item.summary}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <p className="rounded-lg border bg-muted/50 px-3 py-2 font-semibold text-slate-900">{item.metric1}</p>
                      <p className="rounded-lg border bg-muted/50 px-3 py-2 font-semibold text-slate-900">{item.metric2}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/35 py-14 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <h2 className="text-3xl font-semibold md:text-4xl">{t("testimonials.title")}</h2>
            <p className="mt-2 text-muted-foreground">{t("testimonials.subtitle")}</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((item) => (
              <Card key={item.name} className="border-border/70 bg-card/95">
                <CardHeader>
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <Quote className="h-4 w-4 text-primary" />
                  </div>
                  <CardDescription className="text-sm leading-relaxed text-foreground">{item.quote}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                  <p className="text-sm text-muted-foreground">{item.company}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="rounded-2xl border bg-card p-8 text-center md:p-10">
            <h2 className="text-2xl font-semibold md:text-3xl">{t("cta.ready_title")}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{t("cta.ready_subtitle")}</p>
            <div className="mt-6">
              <Button asChild size="lg">
                <Link to={`/${locale}/contact`}>
                  {t("cta.contact")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
