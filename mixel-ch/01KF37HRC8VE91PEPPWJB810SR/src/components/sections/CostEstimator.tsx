import { Button } from "@/components/ui/button.tsx";
import { Slider } from "@/components/ui/slider.tsx";
import { CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

type ModuleKey = "security" | "cloud" | "support";

function formatChf(value: number) {
  return new Intl.NumberFormat("de-CH", {
    style: "currency",
    currency: "CHF",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CostEstimator() {
  const { t } = useTranslation("common");
  const { lng } = useParams<{ lng: string }>();
  const locale = lng ?? "de";
  const [employees, setEmployees] = useState(25);
  const [modules, setModules] = useState<Record<ModuleKey, boolean>>({
    security: true,
    cloud: false,
    support: true,
  });

  const estimate = useMemo(() => {
    let total = 450 + employees * 85;

    if (modules.security) {
      total += 250 + employees * 18;
    }
    if (modules.cloud) {
      total += 180 + employees * 12;
    }
    if (modules.support) {
      total += 300 + employees * 22;
    }

    const min = Math.round(total * 0.9);
    const max = Math.round(total * 1.15);

    return {
      min,
      max,
      includes: [
        t("home.calculator.include.monitoring"),
        t("home.calculator.include.helpdesk"),
        t("home.calculator.include.security"),
      ],
    };
  }, [employees, modules.cloud, modules.security, modules.support, t]);

  const toggleModule = (key: ModuleKey) => {
    setModules((previous) => ({ ...previous, [key]: !previous[key] }));
  };

  return (
    <section className="border-y bg-white py-20 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto mb-12 max-w-3xl space-y-3 text-center">
          <h2 className="text-3xl font-semibold md:text-4xl">{t("home.calculator.title")}</h2>
          <p className="text-muted-foreground">{t("home.calculator.subtitle")}</p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 md:p-8">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="employees" className="text-sm font-semibold text-slate-800">
                    {t("home.calculator.employees")}
                  </label>
                  <span className="text-sm font-semibold text-primary">{employees}</span>
                </div>
                <div className="mt-4">
                  <Slider
                    id="employees"
                    min={5}
                    max={250}
                    step={1}
                    value={[employees]}
                    onValueChange={(value) => setEmployees(value[0] ?? 25)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-800">{t("home.calculator.modules")}</p>
                <button
                  type="button"
                  onClick={() => toggleModule("security")}
                  aria-pressed={modules.security}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                    modules.security
                      ? "border-primary bg-primary/10 text-slate-900"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  {t("home.calculator.module.security")}
                </button>
                <button
                  type="button"
                  onClick={() => toggleModule("cloud")}
                  aria-pressed={modules.cloud}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                    modules.cloud
                      ? "border-primary bg-primary/10 text-slate-900"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  {t("home.calculator.module.cloud")}
                </button>
                <button
                  type="button"
                  onClick={() => toggleModule("support")}
                  aria-pressed={modules.support}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                    modules.support
                      ? "border-primary bg-primary/10 text-slate-900"
                      : "border-slate-300 bg-white text-slate-700"
                  }`}
                >
                  {t("home.calculator.module.support")}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">{t("home.calculator.result")}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900 md:text-4xl">
              {formatChf(estimate.min)} - {formatChf(estimate.max)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{t("home.calculator.disclaimer")}</p>

            <div className="mt-6 space-y-2">
              {estimate.includes.map((item) => (
                <p key={item} className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  {item}
                </p>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <Button asChild data-analytics-event="calculator_offer_click">
                <a href={`/${locale}#contact`}>{t("home.calculator.cta_offer")}</a>
              </Button>
              <Button asChild variant="outline" data-analytics-event="calculator_call_click">
                <a href="tel:0444331400">{t("home.calculator.cta_call")}</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
