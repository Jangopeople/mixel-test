import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import Footer from "@/components/layout/Footer.tsx";
import Header from "@/components/layout/Header.tsx";
import SeoHead from "@/components/seo/SeoHead.tsx";
import CostEstimator from "@/components/sections/CostEstimator.tsx";
import FaqSection from "@/components/sections/FaqSection.tsx";
import InsightsSection from "@/components/sections/InsightsSection.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { LOCAL_BUSINESS_SCHEMA, ORGANIZATION_SCHEMA } from "@/lib/seo.ts";
import {
  Award,
  ArrowRight,
  Building2,
  Bot,
  CheckCircle2,
  Cloud,
  FileText,
  Handshake,
  Headphones,
  Mail,
  MapPin,
  MonitorPlay,
  Network,
  Phone,
  PlayCircle,
  Server,
  Star,
  Shield,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

const PARTNER_LOGOS = [
  { src: "/assets/branding/partner-microsoft.png", alt: "Microsoft" },
  { src: "/assets/branding/partner-lenovo-pc.png", alt: "Lenovo PC Partner" },
  {
    src: "/assets/branding/partner-lenovo-infra.png",
    alt: "Lenovo Infrastructure",
  },
  { src: "/assets/branding/partner-swisscom.png", alt: "Swisscom" },
  { src: "/assets/branding/partner-odoo.jpg", alt: "Odoo" },
  { src: "/assets/branding/partner-plus41.png", alt: "+41" },
  { src: "/assets/branding/partner-sysprint.png", alt: "Sysprint" },
] as const;

const CLIENT_LOGOS = [
  { src: "/assets/branding/client-bascom.png", alt: "Bascom" },
  { src: "/assets/branding/client-toitoi.png", alt: "TOI TOI" },
  { src: "/assets/branding/client-twint.png", alt: "Twint" },
  { src: "/assets/branding/client-rumox.png", alt: "Rumox" },
  { src: "/assets/branding/client-st-academy.png", alt: "S+T Academy" },
] as const;

const VIDEO_HERO = "/assets/media/hero-operations.mp4";

const MEDIA_SHOWCASE = [
  {
    type: "video",
    src: "/assets/media/loop-coding-1.mp4",
    objectPosition: "object-center",
  },
  {
    type: "video",
    src: "/assets/media/loop-coding-2.mp4",
    objectPosition: "object-center",
  },
  {
    type: "image",
    src: "/assets/media/stills/media-showcase-innovation.svg",
    objectPosition: "object-center",
  },
] as const;

export default function Index() {
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation("common");
  const locale = lng ?? "de";
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const quickServices = [
    { icon: Network, label: t("service.network"), path: "network" },
    { icon: Server, label: t("service.server"), path: "server" },
    { icon: Cloud, label: t("service.microsoft365"), path: "microsoft-365" },
    { icon: Headphones, label: t("service.servicedesk"), path: "service-desk" },
  ] as const;

  const pillars = [
    {
      icon: Shield,
      title: t("home.pillar.infrastructure.title"),
      description: t("home.pillar.infrastructure.desc"),
      links: [
        { label: t("service.network"), to: `/${locale}/services/network` },
        { label: t("service.server"), to: `/${locale}/services/server` },
      ],
    },
    {
      icon: Cloud,
      title: t("home.pillar.workplace.title"),
      description: t("home.pillar.workplace.desc"),
      links: [
        {
          label: t("service.microsoft365"),
          to: `/${locale}/services/microsoft-365`,
        },
        { label: t("service.telephony"), to: `/${locale}/services/telephony` },
      ],
    },
    {
      icon: MonitorPlay,
      title: t("home.pillar.security.title"),
      description: t("home.pillar.security.desc"),
      links: [
        {
          label: t("service.video"),
          to: `/${locale}/services/video-security`,
        },
        { label: t("auth.portal.kyc"), to: "https://kyc.mixel.ch" },
      ],
    },
    {
      icon: Bot,
      title: t("home.pillar.support.title"),
      description: t("home.pillar.support.desc"),
      links: [
        {
          label: t("service.servicedesk"),
          to: `/${locale}/services/service-desk`,
        },
        { label: t("service.ai"), to: `/${locale}/services/ai` },
      ],
    },
  ] as const;

  const deliverySteps = [
    {
      icon: CheckCircle2,
      title: t("home.delivery.step1.title"),
      description: t("home.delivery.step1.desc"),
    },
    {
      icon: Workflow,
      title: t("home.delivery.step2.title"),
      description: t("home.delivery.step2.desc"),
    },
    {
      icon: Server,
      title: t("home.delivery.step3.title"),
      description: t("home.delivery.step3.desc"),
    },
    {
      icon: Headphones,
      title: t("home.delivery.step4.title"),
      description: t("home.delivery.step4.desc"),
    },
  ] as const;

  const videoCards = [
    {
      title: t("home.media.card1.title"),
      description: t("home.media.card1.desc"),
      type: MEDIA_SHOWCASE[0].type,
      src: MEDIA_SHOWCASE[0].src,
      objectPosition: MEDIA_SHOWCASE[0].objectPosition,
    },
    {
      title: t("home.media.card2.title"),
      description: t("home.media.card2.desc"),
      type: MEDIA_SHOWCASE[1].type,
      src: MEDIA_SHOWCASE[1].src,
      objectPosition: MEDIA_SHOWCASE[1].objectPosition,
    },
    {
      title: t("home.media.card3.title"),
      description: t("home.media.card3.desc"),
      type: MEDIA_SHOWCASE[2].type,
      src: MEDIA_SHOWCASE[2].src,
      objectPosition: MEDIA_SHOWCASE[2].objectPosition,
    },
  ] as const;

  const appShowcase = [
    {
      icon: FileText,
      title: t("home.apps.card.accounting.title"),
      description: t("home.apps.card.accounting.desc"),
      href: "https://acc.mixel.ch",
      domain: "acc.mixel.ch",
      image: "/assets/media/stills/app-accounting.svg",
    },
    {
      icon: Headphones,
      title: t("home.apps.card.ticketsystem.title"),
      description: t("home.apps.card.ticketsystem.desc"),
      href: "https://ism.mixel.ch",
      domain: "ism.mixel.ch",
      image: "/assets/media/stills/app-ticketing.svg",
    },
    {
      icon: MonitorPlay,
      title: t("home.apps.card.marketing.title"),
      description: t("home.apps.card.marketing.desc"),
      href: "https://marketing.mixel.ch",
      domain: "marketing.mixel.ch",
      image: "/assets/media/stills/app-marketing.svg",
    },
    {
      icon: Bot,
      title: t("home.apps.card.mixekai.title"),
      description: t("home.apps.card.mixekai.desc"),
      href: "https://ai.mixel.ch",
      domain: "ai.mixel.ch",
      image: "/assets/media/stills/app-ai.svg",
    },
    {
      icon: Shield,
      title: t("home.apps.card.kyc.title"),
      description: t("home.apps.card.kyc.desc"),
      href: "https://kyc.mixel.ch",
      domain: "kyc.mixel.ch",
      image: "/assets/media/stills/app-kyc.svg",
    },
  ] as const;

  const appStack = [
    t("home.apps.stack.item1"),
    t("home.apps.stack.item2"),
    t("home.apps.stack.item3"),
    t("home.apps.stack.item4"),
  ] as const;

  const trustHighlights = [
    {
      icon: Headphones,
      title: t("home.trust.item1.title"),
      description: t("home.trust.item1.desc"),
    },
    {
      icon: MapPin,
      title: t("home.trust.item2.title"),
      description: t("home.trust.item2.desc"),
    },
    {
      icon: ShieldCheck,
      title: t("home.trust.item3.title"),
      description: t("home.trust.item3.desc"),
    },
    {
      icon: Handshake,
      title: t("home.trust.item4.title"),
      description: t("home.trust.item4.desc"),
    },
  ] as const;

  const certifications = [
    {
      icon: Award,
      title: t("home.certifications.item1.title"),
      description: t("home.certifications.item1.desc"),
    },
    {
      icon: ShieldCheck,
      title: t("home.certifications.item2.title"),
      description: t("home.certifications.item2.desc"),
    },
    {
      icon: Building2,
      title: t("home.certifications.item3.title"),
      description: t("home.certifications.item3.desc"),
    },
    {
      icon: Handshake,
      title: t("home.certifications.item4.title"),
      description: t("home.certifications.item4.desc"),
    },
  ] as const;

  const caseStudies = [
    {
      icon: Cloud,
      sector: t("home.cases.card1.sector"),
      title: t("home.cases.card1.title"),
      summary: t("home.cases.card1.summary"),
      metrics: [t("home.cases.card1.metric1"), t("home.cases.card1.metric2")],
      image: "/assets/media/stills/case-m365.svg",
    },
    {
      icon: Headphones,
      sector: t("home.cases.card2.sector"),
      title: t("home.cases.card2.title"),
      summary: t("home.cases.card2.summary"),
      metrics: [t("home.cases.card2.metric1"), t("home.cases.card2.metric2")],
      image: "/assets/media/stills/case-servicedesk.svg",
    },
    {
      icon: Bot,
      sector: t("home.cases.card3.sector"),
      title: t("home.cases.card3.title"),
      summary: t("home.cases.card3.summary"),
      metrics: [t("home.cases.card3.metric1"), t("home.cases.card3.metric2")],
      image: "/assets/media/stills/case-ai-kyc.svg",
    },
  ] as const;

  const testimonials = [
    {
      name: t("testimonials.client1.name"),
      company: t("testimonials.client1.company"),
      quote: t("testimonials.client1.quote"),
    },
    {
      name: t("testimonials.client2.name"),
      company: t("testimonials.client2.company"),
      quote: t("testimonials.client2.quote"),
    },
    {
      name: t("testimonials.client3.name"),
      company: t("testimonials.client3.company"),
      quote: t("testimonials.client3.quote"),
    },
  ] as const;

  const teamMembers = [
    {
      image: "/assets/media/team/team-1.svg",
      name: t("home.team.member1.name"),
      role: t("home.team.member1.role"),
      bio: t("home.team.member1.bio"),
      credential: t("home.team.member1.credential"),
      profile: "https://www.linkedin.com",
    },
    {
      image: "/assets/media/team/team-2.svg",
      name: t("home.team.member2.name"),
      role: t("home.team.member2.role"),
      bio: t("home.team.member2.bio"),
      credential: t("home.team.member2.credential"),
      profile: "https://www.linkedin.com",
    },
    {
      image: "/assets/media/team/team-3.svg",
      name: t("home.team.member3.name"),
      role: t("home.team.member3.role"),
      bio: t("home.team.member3.bio"),
      credential: t("home.team.member3.credential"),
      profile: "https://www.linkedin.com",
    },
  ] as const;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [1, 2, 3, 4, 5, 6].map((index) => ({
      "@type": "Question",
      name: t(`home.faq.item${index}.q`),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(`home.faq.item${index}.a`),
      },
    })),
  } as const;

  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const company = String(formData.get("company") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    const subject = encodeURIComponent(
      `IT consultation request - ${company || name || "Mixel lead"}`,
    );
    const body = encodeURIComponent(
      [
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Company: ${company}`,
        "",
        "Requirements:",
        message,
      ].join("\n"),
    );

    if (typeof window.gtag === "function") {
      window.gtag("event", "generate_lead", {
        form_name: "homepage_contact_form",
        page_path: window.location.pathname,
      });
    }

    window.location.href = `mailto:info@mixel.ch?subject=${subject}&body=${body}`;
    setContactSubmitted(true);
    event.currentTarget.reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={t("hero.title")}
        description={t("hero.subtitle")}
        schema={[ORGANIZATION_SCHEMA, LOCAL_BUSINESS_SCHEMA, faqSchema]}
      />
      <a
        href="#contact"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        {t("a11y.skip_to_contact")}
      </a>
      <Header />

      <section className="sticky top-20 z-40 border-b border-slate-200 bg-white/93 backdrop-blur supports-[backdrop-filter]:bg-white/82">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-start justify-between gap-3 py-3 md:flex-row md:items-center">
            <p className="text-sm font-semibold text-slate-700">
              {t("home.quickcta.text")}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <a href={`/${locale}#contact`}>
                  {t("home.quickcta.cta_strategy")}
                </a>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                data-analytics-event="quickcta_demo_click"
              >
                <Link to={`/${locale}/contact`}>
                  {t("home.quickcta.cta_demo")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="swiss-gradient section-pulse relative overflow-hidden border-b border-slate-200 text-white">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover opacity-26 mix-blend-screen"
        >
          <source src={VIDEO_HERO} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.72)_0%,rgba(15,23,42,0.56)_44%,rgba(15,23,42,0.25)_100%)]" />
        <div className="container relative mx-auto px-4 py-24 md:px-6 md:py-32">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="fade-up space-y-8">
              <div className="inline-flex items-center rounded-full border border-white/35 bg-white/14 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur">
                {t("home.eyebrow")}
              </div>

              <div className="space-y-4">
                <h1 className="max-w-3xl text-balance text-4xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
                  {t("hero.title")}
                </h1>
                <p className="max-w-2xl text-lg text-white/90 md:text-2xl">
                  {t("hero.subtitle")}
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-14 w-full px-8 sm:w-auto"
                  data-analytics-event="hero_call_click"
                >
                  <a href="tel:0444331400">
                    <Phone className="mr-2 h-4 w-4" />
                    {t("cta.call_now")}
                  </a>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  data-analytics-event="hero_strategy_click"
                  className="h-14 w-full border-white/45 bg-white/12 px-8 text-white hover:bg-white/24 sm:w-auto"
                >
                  <a href={`/${locale}#contact`}>
                    {t("home.cta.strategy")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>

            <Card className="lift-card fade-up-delayed h-fit border-slate-200 bg-white/95 text-slate-900 shadow-xl backdrop-blur">
              <CardHeader>
                <CardTitle className="text-2xl">
                  {t("home.cta.catalog")}
                </CardTitle>
                <CardDescription className="text-slate-600">
                  {t("home.pillars.subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickServices.map((service) => {
                  const Icon = service.icon;
                  return (
                    <Link
                      key={service.path}
                      to={`/${locale}/services/${service.path}`}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-white/70 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white"
                    >
                      <span className="flex items-center gap-2 font-medium">
                        <Icon className="h-4 w-4 text-primary" />
                        {service.label}
                      </span>
                      <ArrowRight className="h-4 w-4 text-slate-500" />
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-b bg-card py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lift-card rounded-2xl border bg-background p-6 text-center">
              <p className="font-mono text-4xl font-bold text-primary">17+</p>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">
                {t("stats.experience")}
              </p>
            </div>
            <div className="lift-card rounded-2xl border bg-background p-6 text-center">
              <p className="font-mono text-4xl font-bold text-primary">100+</p>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">
                {t("stats.clients")}
              </p>
            </div>
            <div className="lift-card rounded-2xl border bg-background p-6 text-center">
              <p className="font-mono text-4xl font-bold text-primary">99.7%</p>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">
                {t("stats.support")}
              </p>
            </div>
            <div className="lift-card rounded-2xl border bg-background p-6 text-center">
              <p className="font-mono text-4xl font-bold text-primary">
                &lt;1h
              </p>
              <p className="mt-1 text-sm font-semibold text-muted-foreground">
                {t("stats.quality")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b bg-white py-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 md:p-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">
                  {t("home.socialproof.eyebrow")}
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                  {t("home.socialproof.title")}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {t("home.socialproof.subtitle")}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                </div>
                <span className="text-sm font-semibold text-slate-700">
                  {t("home.socialproof.rating")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b bg-slate-50/75 py-14">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto mb-8 max-w-3xl space-y-2 text-center">
            <h2 className="text-2xl font-semibold md:text-3xl">
              {t("home.trust.title")}
            </h2>
            <p className="text-muted-foreground">{t("home.trust.subtitle")}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {trustHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="lift-card rounded-xl border border-slate-200 bg-white/92 p-5 shadow-sm"
                >
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="services" className="py-20 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto mb-12 max-w-3xl space-y-3 text-center">
            <h2 className="text-3xl font-semibold md:text-4xl">
              {t("home.pillars.title")}
            </h2>
            <p className="text-muted-foreground">
              {t("home.pillars.subtitle")}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <Card
                  key={pillar.title}
                  className="lift-card border-border/70 bg-card/80 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <CardHeader className="space-y-3">
                    <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{pillar.title}</CardTitle>
                    <CardDescription className="text-base">
                      {pillar.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {pillar.links.map((link) => {
                      const external = link.to.startsWith("https://");
                      if (external) {
                        return (
                          <a
                            key={link.to}
                            href={link.to}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                          >
                            {link.label}
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </a>
                        );
                      }
                      return (
                        <Link
                          key={link.to}
                          to={link.to}
                          className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                        >
                          {link.label}
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      );
                    })}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y bg-slate-50/70 py-20 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto mb-12 max-w-3xl space-y-3 text-center">
            <h2 className="text-3xl font-semibold md:text-4xl">
              {t("home.cases.title")}
            </h2>
            <p className="text-muted-foreground">{t("home.cases.subtitle")}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {caseStudies.map((study) => {
              const Icon = study.icon;
              return (
                <Card
                  key={study.title}
                  className="lift-card border-slate-200 bg-white/95 shadow-sm"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden border-b bg-slate-100">
                    <img
                      src={study.image}
                      alt={study.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardHeader className="space-y-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                      {study.sector}
                    </p>
                    <CardTitle className="text-xl">{study.title}</CardTitle>
                    <CardDescription>{study.summary}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {study.metrics.map((metric) => (
                        <span
                          key={metric}
                          className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
                        >
                          {metric}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <InsightsSection />

      <section id="about" className="border-b bg-background py-20 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto mb-12 max-w-3xl space-y-3 text-center">
            <h2 className="text-3xl font-semibold md:text-4xl">
              {t("testimonials.title")}
            </h2>
            <p className="text-muted-foreground">
              {t("testimonials.subtitle")}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((item) => (
              <Card
                key={item.name}
                className="lift-card border-border/70 bg-card"
              >
                <CardHeader className="space-y-2">
                  <CardTitle className="text-xl">{item.name}</CardTitle>
                  <CardDescription>{item.company}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    "{item.quote}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b bg-slate-50/70 py-20 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto mb-12 max-w-3xl space-y-3 text-center">
            <h2 className="text-3xl font-semibold md:text-4xl">
              {t("home.team.title")}
            </h2>
            <p className="text-muted-foreground">{t("home.team.subtitle")}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {teamMembers.map((member) => (
              <Card
                key={member.name}
                className="lift-card overflow-hidden border-border/70 bg-white/95 shadow-sm"
              >
                <div className="aspect-square overflow-hidden border-b bg-slate-100">
                  <img
                    src={member.image}
                    alt={member.name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardHeader className="space-y-2">
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <CardDescription>{member.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                  <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    {member.credential}
                  </p>
                  <div className="mt-4">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="w-full"
                    >
                      <a href={member.profile} target="_blank" rel="noreferrer">
                        {t("home.team.profile_cta")}
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto mb-12 max-w-3xl space-y-3 text-center">
            <h2 className="text-3xl font-semibold md:text-4xl">
              {t("home.proof.title")}
            </h2>
            <p className="text-muted-foreground">{t("home.proof.subtitle")}</p>
          </div>

          <div className="space-y-10">
            <div className="space-y-5">
              <h3 className="text-center text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("partners.tech")}
              </h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                {PARTNER_LOGOS.map((partner) => (
                  <div
                    key={partner.alt}
                    className="flex h-24 items-center justify-center rounded-xl border bg-card p-4"
                  >
                    <img
                      src={partner.src}
                      alt={partner.alt}
                      loading="lazy"
                      decoding="async"
                      className="max-h-12 w-auto object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <h3 className="text-center text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {t("partners.clients")}
              </h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                {CLIENT_LOGOS.map((client) => (
                  <div
                    key={client.alt}
                    className="flex h-24 items-center justify-center rounded-xl border bg-card p-4"
                  >
                    <img
                      src={client.src}
                      alt={client.alt}
                      loading="lazy"
                      decoding="async"
                      className="max-h-12 w-auto object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <CostEstimator />

      <section className="border-y bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-8 md:flex-row md:items-center">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold md:text-3xl">
                {t("cta.ready_title")}
              </h2>
              <p className="text-primary-foreground/85">
                {t("cta.ready_subtitle")}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                variant="secondary"
                data-analytics-event="ready_call_click"
              >
                <a href="tel:0444331400">{t("cta.call_now")}</a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
              >
                <a href={`/${locale}#contact`}>{t("cta.contact_form")}</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <FaqSection />

      <section id="contact" className="py-20 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mx-auto max-w-4xl space-y-4 text-center">
            <img
              src="/assets/branding/mixel-logo.png"
              alt="Mixel Logo"
              loading="lazy"
              decoding="async"
              className="mx-auto h-20 w-auto"
            />
            <h2 className="text-3xl font-semibold md:text-4xl">
              {t("contact.title")}
            </h2>
            <p className="text-muted-foreground">{t("contact.subtitle")}</p>
          </div>

          <div className="mx-auto mt-10 grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-1">
              <Card>
                <CardHeader className="space-y-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">
                    {t("contact.address")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">
                    {t("footer.company")}
                  </p>
                  <p>{t("footer.address")}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="space-y-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">
                    {t("contact.phone")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <a
                    href="tel:0444331400"
                    className="font-semibold text-foreground hover:underline"
                  >
                    044 433 14 00
                  </a>
                  <p>{t("contact.hours")}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="space-y-3">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-xl">
                    {t("contact.email")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <a
                    href="mailto:info@mixel.ch"
                    className="font-semibold text-foreground hover:underline"
                  >
                    info@mixel.ch
                  </a>
                  <p>{t("contact.response")}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl">
                  {t("contact.form.title")}
                </CardTitle>
                <CardDescription>{t("contact.form.subtitle")}</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleContactSubmit}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      name="name"
                      required
                      placeholder={t("contact.form.name")}
                      aria-label={t("contact.form.name")}
                    />
                    <Input
                      name="email"
                      type="email"
                      required
                      placeholder={t("contact.form.email")}
                      aria-label={t("contact.form.email")}
                    />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input name="phone" placeholder={t("contact.form.phone")} aria-label={t("contact.form.phone")} />
                    <Input
                      name="company"
                      placeholder={t("contact.form.company")}
                      aria-label={t("contact.form.company")}
                    />
                  </div>
                  <Textarea
                    name="message"
                    required
                    rows={5}
                    placeholder={t("contact.form.message")}
                    aria-label={t("contact.form.message")}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("contact.form.privacy_notice")}
                  </p>
                  {contactSubmitted ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                      <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-600" />
                      <p className="text-sm font-semibold text-emerald-800">
                        {t("contact.form.success")}
                      </p>
                      <p className="mt-1 text-xs text-emerald-600">
                        {t("contact.form.success_detail")}
                      </p>
                    </div>
                  ) : null}
                  <Button
                    type="submit"
                    className="w-full"
                    data-analytics-event="contact_form_submit"
                  >
                    {t("contact.form.submit")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" data-analytics-event="cta_call_click">
              <a href="tel:0444331400">
                <Phone className="mr-2 h-4 w-4" />
                {t("cta.call")}
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              data-analytics-event="cta_email_click"
            >
              <a href="mailto:info@mixel.ch">
                <Mail className="mr-2 h-4 w-4" />
                {t("cta.email")}
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
