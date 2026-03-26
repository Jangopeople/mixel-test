import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import SeoHead from "@/components/seo/SeoHead.tsx";
import { buildServiceSchema } from "@/lib/seo.ts";
import PageBreadcrumb from "@/components/layout/PageBreadcrumb.tsx";
import RelatedServices from "@/components/layout/RelatedServices.tsx";
import { MonitorPlay, Check, Phone, Mail, Camera, Cloud, Shield, Bell } from "lucide-react";
import Header from "@/components/layout/Header.tsx";
import Footer from "@/components/layout/Footer.tsx";
import { useTranslation } from "react-i18next";

export default function VideoSecurityService() {
  const { t, i18n } = useTranslation("services");
  const locale = (i18n.resolvedLanguage ?? "de").split("-")[0];
  const serviceSchema = buildServiceSchema({
    name: t("video.title"),
    description: t("video.subtitle"),
    pathname: `/${locale}/services/video-security`,
  });

  const services = [
    { icon: Camera, key: "camera" },
    { icon: Cloud, key: "recording" },
    { icon: Bell, key: "alerts" },
    { icon: Shield, key: "remote" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SeoHead title={t("video.title")} description={t("video.subtitle")} schema={serviceSchema} />
      <Header />
      <PageBreadcrumb currentLabel={t("video.title")} />
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-4">
              <MonitorPlay className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">{t("video.title")}</h1>
            <p className="text-xl text-muted-foreground text-balance">
              {t("video.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild><a href="tel:0444331400"><Phone className="mr-2 h-5 w-5" />{t("video.cta.consult")}</a></Button>
              <Button size="lg" variant="secondary" asChild><a href="mailto:info@mixel.ch"><Mail className="mr-2 h-5 w-5" />{t("video.cta.quote")}</a></Button>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto space-y-16">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">{t("video.overview.title")}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t("video.overview.description")}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {services.map((service, i) => {
                const Icon = service.icon;
                return (
                  <Card key={i} className="hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4"><Icon className="h-8 w-8 text-primary" /></div>
                      <CardTitle>{t(`video.services.${service.key}.title`)}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <CardDescription className="text-base">{t(`video.services.${service.key}.description`)}</CardDescription>
                      <ul className="space-y-2">
                        {(t(`video.services.${service.key}.features`, { returnObjects: true }) as string[]).map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <RelatedServices currentPath="video-security" />
            <div className="bg-primary text-primary-foreground rounded-xl p-8 md:p-12 text-center space-y-6">
              <h3 className="text-3xl font-bold">{t("video.finalCta.title")}</h3>
              <p className="text-lg opacity-90 max-w-2xl mx-auto">{t("video.finalCta.description")}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" variant="secondary" asChild><a href="tel:0444331400"><Phone className="mr-2 h-5 w-5" />044 433 14 00</a></Button>
                <Button size="lg" variant="outline" asChild className="bg-background text-foreground border-background hover:bg-background/90"><a href="mailto:info@mixel.ch"><Mail className="mr-2 h-5 w-5" />{t("video.cta.quote")}</a></Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
