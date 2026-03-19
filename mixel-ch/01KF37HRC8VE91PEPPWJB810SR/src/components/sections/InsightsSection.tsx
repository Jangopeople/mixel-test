import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { ArrowRight, Newspaper } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

export default function InsightsSection() {
  const { t } = useTranslation("common");
  const { lng } = useParams<{ lng: string }>();
  const locale = lng ?? "de";

  const items = [1, 2, 3].map((index) => ({
    title: t(`home.insights.item${index}.title`),
    description: t(`home.insights.item${index}.desc`),
    tag: t(`home.insights.item${index}.tag`),
  }));

  return (
    <section className="border-y bg-slate-50/80 py-20 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto mb-12 max-w-3xl space-y-3 text-center">
          <h2 className="text-3xl font-semibold md:text-4xl">{t("home.insights.title")}</h2>
          <p className="text-muted-foreground">{t("home.insights.subtitle")}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <Card key={item.title} className="border-slate-200 bg-white/95 shadow-sm">
              <CardHeader className="space-y-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Newspaper className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">{item.tag}</p>
                <CardTitle className="text-xl">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" size="sm" className="w-full" data-analytics-event="insights_cta_click">
                  <a href={`/${locale}#contact`}>
                    {t("home.insights.cta")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
