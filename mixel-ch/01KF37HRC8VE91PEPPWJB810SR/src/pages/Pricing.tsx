import Footer from "@/components/layout/Footer.tsx";
import Header from "@/components/layout/Header.tsx";
import SeoHead from "@/components/seo/SeoHead.tsx";
import CostEstimator from "@/components/sections/CostEstimator.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { toAbsoluteUrl } from "@/lib/seo.ts";
import { ArrowRight, CheckCircle2, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

export default function Pricing() {
  const { t } = useTranslation("common");
  const { lng } = useParams<{ lng: string }>();
  const locale = lng ?? "de";

  const pricingSchema = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: t("home.calculator.title"),
    description: t("home.calculator.subtitle"),
    url: toAbsoluteUrl(`/${locale}/pricing`),
    itemListElement: [
      t("home.calculator.module.security"),
      t("home.calculator.module.cloud"),
      t("home.calculator.module.support"),
    ].map((name) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name,
      },
    })),
  } as const;

  const highlights = [
    t("home.calculator.include.monitoring"),
    t("home.calculator.include.helpdesk"),
    t("home.calculator.include.security"),
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={t("home.calculator.title")}
        description={t("home.calculator.subtitle")}
        schema={pricingSchema}
      />
      <Header />

      <section className="border-b bg-slate-100/90 py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {t("nav.pricing")}
            </p>
            <h1 className="text-balance text-4xl font-semibold md:text-5xl">
              {t("home.calculator.title")}
            </h1>
            <p className="text-muted-foreground">{t("home.calculator.subtitle")}</p>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-6 md:grid-cols-3">
            {highlights.map((highlight) => (
              <Card key={highlight} className="border-border/70 bg-card/95">
                <CardHeader className="space-y-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{highlight}</CardTitle>
                  <CardDescription>{t("home.calculator.disclaimer")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to={`/${locale}/contact`}>
                      {t("home.calculator.cta_offer")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <CostEstimator />

      <section className="pb-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="rounded-2xl border bg-card p-8 text-center md:p-10">
            <h2 className="text-2xl font-semibold md:text-3xl">{t("cta.ready_title")}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{t("cta.ready_subtitle")}</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to={`/${locale}/contact`}>
                  {t("home.calculator.cta_offer")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="tel:0444331400">
                  <Phone className="mr-2 h-4 w-4" />
                  {t("home.calculator.cta_call")}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
