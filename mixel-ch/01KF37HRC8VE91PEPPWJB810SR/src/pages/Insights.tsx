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
import { ArrowRight, CalendarDays, Newspaper } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

export default function Insights() {
  const { t } = useTranslation("common");
  const { lng } = useParams<{ lng: string }>();
  const locale = lng ?? "de";

  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${SITE_NAME} Insights`,
    description: t("home.insights.subtitle"),
    url: toAbsoluteUrl(`/${locale}/insights`),
  } as const;

  const items = [1, 2, 3].map((index) => ({
    tag: t(`home.insights.item${index}.tag`),
    title: t(`home.insights.item${index}.title`),
    description: t(`home.insights.item${index}.desc`),
  }));

  return (
    <div className="min-h-screen bg-background">
      <SeoHead title={t("home.insights.title")} description={t("home.insights.subtitle")} schema={schema} />
      <Header />

      <section className="border-b bg-slate-100/90 py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t("nav.insights")}</p>
            <h1 className="text-balance text-4xl font-semibold md:text-5xl">{t("home.insights.title")}</h1>
            <p className="text-muted-foreground">{t("home.insights.subtitle")}</p>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto grid max-w-5xl gap-6">
            {items.map((item) => (
              <Card key={item.title} className="border-border/70 bg-card/95 shadow-sm">
                <CardHeader className="space-y-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Newspaper className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                    <span>{item.tag}</span>
                    <span aria-hidden>•</span>
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      2026
                    </span>
                  </div>
                  <CardTitle className="text-2xl">{item.title}</CardTitle>
                  <CardDescription className="text-base">{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/${locale}/contact`}>
                      {t("home.insights.cta")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
