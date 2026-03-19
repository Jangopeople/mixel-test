import { Button } from "@/components/ui/button.tsx";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

const SERVICE_ROUTES = [
  { key: "network", path: "network" },
  { key: "server", path: "server" },
  { key: "microsoft365", path: "microsoft-365" },
  { key: "video", path: "video-security" },
  { key: "telephony", path: "telephony" },
  { key: "servicedesk", path: "service-desk" },
  { key: "ai", path: "ai" },
] as const;

export default function RelatedServices({
  currentPath,
}: {
  currentPath: (typeof SERVICE_ROUTES)[number]["path"];
}) {
  const { t } = useTranslation("common");
  const { lng } = useParams<{ lng: string }>();
  const locale = lng ?? "de";

  const related = SERVICE_ROUTES.filter((item) => item.path !== currentPath).slice(0, 4);

  return (
    <div className="rounded-2xl border bg-card p-6 md:p-8">
      <h3 className="text-2xl font-semibold">{t("service.related.title")}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{t("service.related.subtitle")}</p>
      <div className="mt-5 flex flex-wrap gap-2.5">
        {related.map((service) => (
          <Button key={service.path} asChild variant="outline" size="sm">
            <Link to={`/${locale}/services/${service.path}`}>
              {t(`service.${service.key}`)}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
