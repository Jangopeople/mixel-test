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
import { LOCAL_BUSINESS_SCHEMA, ORGANIZATION_SCHEMA } from "@/lib/seo.ts";
import { ArrowRight, Award, Handshake, Headphones, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

const TEAM_IMAGES = [
  "/assets/media/team/team-1.svg",
  "/assets/media/team/team-2.svg",
  "/assets/media/team/team-3.svg",
] as const;

export default function About() {
  const { t } = useTranslation("common");
  const { lng } = useParams<{ lng: string }>();
  const locale = lng ?? "de";

  const values = [
    {
      icon: Award,
      title: t("about.quality"),
      description: t("about.quality_desc"),
    },
    {
      icon: Handshake,
      title: t("about.service"),
      description: t("about.service_desc"),
    },
    {
      icon: Headphones,
      title: t("about.support"),
      description: t("about.support_desc"),
    },
    {
      icon: ShieldCheck,
      title: t("home.trust.item3.title"),
      description: t("home.trust.item3.desc"),
    },
  ] as const;

  const teamMembers = [1, 2, 3].map((index) => ({
    image: TEAM_IMAGES[index - 1],
    name: t(`home.team.member${index}.name`),
    role: t(`home.team.member${index}.role`),
    bio: t(`home.team.member${index}.bio`),
    credential: t(`home.team.member${index}.credential`),
  }));

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={t("about.title")}
        description={t("about.subtitle")}
        schema={[ORGANIZATION_SCHEMA, LOCAL_BUSINESS_SCHEMA]}
      />
      <Header />

      <section className="border-b bg-slate-100/90 py-16 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t("nav.about")}</p>
            <h1 className="text-balance text-4xl font-semibold md:text-5xl">{t("about.title")}</h1>
            <p className="text-muted-foreground">{t("about.subtitle")}</p>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto grid max-w-5xl gap-4 md:grid-cols-3">
            <Card className="md:col-span-3 border-border/70 bg-card/95">
              <CardHeader>
                <CardTitle className="text-3xl">{t("about.why_title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-base leading-relaxed text-muted-foreground">
                <p>{t("about.description1")}</p>
                <p>{t("about.description2")}</p>
                <p>{t("about.description3")}</p>
              </CardContent>
            </Card>

            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title} className="border-border/70 bg-card/95">
                  <CardHeader className="space-y-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>{value.title}</CardTitle>
                    <CardDescription>{value.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y bg-muted/35 py-14 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <h2 className="text-3xl font-semibold md:text-4xl">{t("home.team.title")}</h2>
            <p className="mt-2 text-muted-foreground">{t("home.team.subtitle")}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {teamMembers.map((member) => (
              <Card key={member.name} className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
                <img
                  src={member.image}
                  alt={member.name}
                  loading="lazy"
                  decoding="async"
                  className="h-56 w-full object-cover"
                />
                <CardHeader>
                  <CardTitle>{member.name}</CardTitle>
                  <CardDescription>{member.role}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="text-muted-foreground">{member.bio}</p>
                  <p className="rounded-lg border bg-muted/45 px-3 py-2 text-xs font-semibold text-slate-700">
                    {member.credential}
                  </p>
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
