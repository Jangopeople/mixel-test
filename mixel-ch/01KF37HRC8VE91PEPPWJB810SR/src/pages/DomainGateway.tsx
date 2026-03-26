import { useEffect, useState } from "react";
import { ArrowUpRight, BriefcaseBusiness, MonitorCog } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import SeoHead from "@/components/seo/SeoHead.tsx";

type Lang = "en" | "de" | "fr";

const destinationStyle = {
  it: {
    icon: MonitorCog,
    accentClass:
      "from-red-600 via-red-500 to-orange-400 shadow-red-500/25 border-red-400/30",
    buttonClass: "bg-red-600 hover:bg-red-700 text-white border-red-700",
    href: "https://www.mixel.ch",
  },
  corporate: {
    icon: BriefcaseBusiness,
    accentClass:
      "from-slate-900 via-slate-800 to-slate-600 shadow-slate-700/25 border-slate-500/30",
    buttonClass: "bg-slate-900 hover:bg-slate-800 text-white border-slate-950",
    href: "https://www.mixel.lu",
  },
} as const;

const copy: Record<
  Lang,
  {
    title: string;
    welcome: string;
    subtitle: string;
    languageLabel: string;
    visitCta: string;
    pageTitle: string;
    pageDescription: string;
    destinations: {
      it: { title: string; subtitle: string };
      corporate: { title: string; subtitle: string };
    };
  }
> = {
  en: {
    title: "Choose Your Destination",
    welcome: "Welcome",
    subtitle: "Continue to the right Mixel website for your needs.",
    languageLabel: "Language",
    visitCta: "Visit Website",
    pageTitle: "Mixel Group | Select Destination",
    pageDescription:
      "Select your destination: Mixel IT or Corporate Services.",
    destinations: {
      it: {
        title: "Mixel IT",
        subtitle: "Managed IT, Cybersecurity, Cloud and Support",
      },
      corporate: {
        title: "Corporate Services",
        subtitle: "International structuring and business services",
      },
    },
  },
  de: {
    title: "Wählen Sie Ihr Ziel",
    welcome: "Willkommen",
    subtitle:
      "Gehen Sie weiter zur passenden Mixel-Website für Ihre Anforderungen.",
    languageLabel: "Sprache",
    visitCta: "Website besuchen",
    pageTitle: "Mixel Group | Ziel wählen",
    pageDescription:
      "Wählen Sie Ihr Ziel: Mixel IT oder Corporate Services.",
    destinations: {
      it: {
        title: "Mixel IT",
        subtitle: "Managed IT, Cybersicherheit, Cloud und Support",
      },
      corporate: {
        title: "Corporate Services",
        subtitle:
          "Internationale Strukturierung und Unternehmensdienstleistungen",
      },
    },
  },
  fr: {
    title: "Choisissez votre destination",
    welcome: "Bienvenue",
    subtitle:
      "Continuez vers le site Mixel adapté à vos besoins.",
    languageLabel: "Langue",
    visitCta: "Visiter le site",
    pageTitle: "Mixel Group | Choisir une destination",
    pageDescription:
      "Choisissez votre destination : Mixel IT ou Corporate Services.",
    destinations: {
      it: {
        title: "Mixel IT",
        subtitle: "IT gérée, cybersécurité, cloud et support",
      },
      corporate: {
        title: "Corporate Services",
        subtitle:
          "Structuration internationale et services d'entreprise",
      },
    },
  },
};

const languages: Lang[] = ["en", "de", "fr"];

function getInitialLang(): Lang {
  const stored = localStorage.getItem("mixel_gateway_lang");
  if (stored === "en" || stored === "de" || stored === "fr") {
    return stored;
  }

  const browserLang = navigator.language.slice(0, 2).toLowerCase();
  if (browserLang === "de" || browserLang === "fr") {
    return browserLang;
  }

  return "en";
}

export default function DomainGateway() {
  const [lang, setLang] = useState<Lang>(getInitialLang);
  const t = copy[lang];

  useEffect(() => {
    localStorage.setItem("mixel_gateway_lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <div className="relative min-h-svh overflow-hidden bg-[radial-gradient(circle_at_20%_20%,#fee2e2_0%,transparent_45%),radial-gradient(circle_at_80%_0%,#e2e8f0_0%,transparent_40%),linear-gradient(160deg,#fafafa_0%,#f1f5f9_100%)]">
      <SeoHead title={t.pageTitle} description={t.pageDescription} />
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-red-300/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-slate-300/30 blur-3xl" />

      <main className="relative mx-auto flex min-h-svh max-w-6xl flex-col justify-center px-6 py-16 md:px-10">
        <div className="mb-8 flex items-center justify-center gap-3 md:mb-10 md:justify-end">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {t.languageLabel}
          </span>
          <div className="inline-flex rounded-xl bg-white/80 p-1 shadow ring-1 ring-slate-200">
            {languages.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setLang(value)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition ${
                  lang === value
                    ? "bg-slate-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-12 text-center md:mb-16">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/70 shadow-lg ring-1 ring-slate-200">
            <img
              src="/assets/branding/mixel-logo.png"
              alt="Mixel"
              className="h-12 w-12 object-contain"
            />
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-600">
            {t.welcome}
          </p>
          <h1 className="mt-3 text-balance text-4xl font-semibold leading-tight text-slate-900 md:text-6xl">
            {t.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-balance text-lg text-slate-600">
            {t.subtitle}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 md:gap-8">
          {(
            [
              {
                ...destinationStyle.it,
                ...t.destinations.it,
              },
              {
                ...destinationStyle.corporate,
                ...t.destinations.corporate,
              },
            ] as const
          ).map((item) => {
            const Icon = item.icon;

            return (
              <section
                key={item.title}
                className={`group relative overflow-hidden rounded-3xl border bg-gradient-to-br p-8 text-white shadow-2xl transition-transform duration-300 hover:-translate-y-1 ${item.accentClass}`}
              >
                <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/15 blur-xl" />

                <div className="relative flex h-full flex-col">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 ring-1 ring-white/30">
                    <Icon className="h-8 w-8" />
                  </div>

                  <h2 className="text-3xl font-semibold leading-tight">
                    {item.title}
                  </h2>
                  <p className="mt-3 max-w-md text-base text-white/90">
                    {item.subtitle}
                  </p>

                  <div className="mt-8">
                    <Button
                      asChild
                      className={`h-12 rounded-xl border px-5 text-base font-medium ${item.buttonClass}`}
                    >
                      <a href={item.href}>
                        {t.visitCta}
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
