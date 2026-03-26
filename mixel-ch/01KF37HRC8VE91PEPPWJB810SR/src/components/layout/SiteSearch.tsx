import { Button } from "@/components/ui/button.tsx";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command.tsx";
import { ExternalLink, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

type SearchItem = {
  id: string;
  group: string;
  label: string;
  hint?: string;
  href: string;
  external?: boolean;
};

export default function SiteSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { lng } = useParams<{ lng: string }>();
  const { t } = useTranslation("common");
  const locale = lng ?? "de";

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const items = useMemo<SearchItem[]>(
    () => [
      {
        id: "home",
        group: t("search.group.navigation"),
        label: t("nav.home"),
        href: `/${locale}`,
      },
      {
        id: "apps",
        group: t("search.group.navigation"),
        label: t("nav.apps"),
        href: `/${locale}/apps`,
      },
      {
        id: "contact",
        group: t("search.group.navigation"),
        label: t("nav.contact"),
        hint: t("search.hint.contact"),
        href: `/${locale}/contact`,
      },
      {
        id: "pricing",
        group: t("search.group.navigation"),
        label: t("nav.pricing"),
        href: `/${locale}/pricing`,
      },
      {
        id: "case-studies",
        group: t("search.group.navigation"),
        label: t("nav.case_studies"),
        href: `/${locale}/case-studies`,
      },
      {
        id: "insights",
        group: t("search.group.navigation"),
        label: t("nav.insights"),
        href: `/${locale}/insights`,
      },
      {
        id: "about",
        group: t("search.group.navigation"),
        label: t("nav.about"),
        href: `/${locale}/about`,
      },
      {
        id: "faq",
        group: t("search.group.navigation"),
        label: t("home.faq.title"),
        href: `/${locale}#faq`,
      },
      {
        id: "network",
        group: t("search.group.services"),
        label: t("service.network"),
        href: `/${locale}/services/network`,
      },
      {
        id: "server",
        group: t("search.group.services"),
        label: t("service.server"),
        href: `/${locale}/services/server`,
      },
      {
        id: "m365",
        group: t("search.group.services"),
        label: t("service.microsoft365"),
        href: `/${locale}/services/microsoft-365`,
      },
      {
        id: "video",
        group: t("search.group.services"),
        label: t("service.video"),
        href: `/${locale}/services/video-security`,
      },
      {
        id: "telephony",
        group: t("search.group.services"),
        label: t("service.telephony"),
        href: `/${locale}/services/telephony`,
      },
      {
        id: "servicedesk",
        group: t("search.group.services"),
        label: t("service.servicedesk"),
        href: `/${locale}/services/service-desk`,
      },
      {
        id: "ai",
        group: t("search.group.services"),
        label: t("service.ai"),
        href: `/${locale}/services/ai`,
      },
      {
        id: "portal-accounting",
        group: t("search.group.apps"),
        label: t("auth.portal.accounting"),
        hint: "acc.mixel.ch",
        href: "https://acc.mixel.ch",
        external: true,
      },
      {
        id: "portal-ticketing",
        group: t("search.group.apps"),
        label: t("auth.portal.ticketsystem"),
        hint: "ism.mixel.ch",
        href: "https://ism.mixel.ch",
        external: true,
      },
      {
        id: "portal-marketing",
        group: t("search.group.apps"),
        label: t("auth.portal.marketing"),
        hint: "marketing.mixel.ch",
        href: "https://marketing.mixel.ch",
        external: true,
      },
      {
        id: "portal-ai",
        group: t("search.group.apps"),
        label: t("auth.portal.mixekai"),
        hint: "ai.mixel.ch",
        href: "https://ai.mixel.ch",
        external: true,
      },
      {
        id: "portal-kyc",
        group: t("search.group.apps"),
        label: t("auth.portal.kyc"),
        hint: "kyc.mixel.ch",
        href: "https://kyc.mixel.ch",
        external: true,
      },
      {
        id: "privacy",
        group: t("search.group.legal"),
        label: t("footer.privacy"),
        href: `/${locale}/privacy`,
      },
      {
        id: "terms",
        group: t("search.group.legal"),
        label: t("footer.terms"),
        href: `/${locale}/terms`,
      },
    ],
    [locale, t],
  );

  const groupedItems = useMemo(() => {
    return items.reduce<Record<string, SearchItem[]>>((acc, item) => {
      if (!acc[item.group]) {
        acc[item.group] = [];
      }
      acc[item.group].push(item);
      return acc;
    }, {});
  }, [items]);

  const groups = Object.entries(groupedItems);

  const handleSelect = (item: SearchItem) => {
    setOpen(false);
    if (item.external) {
      window.open(item.href, "_blank", "noopener,noreferrer");
      return;
    }
    navigate(item.href);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="hidden min-w-[140px] justify-start gap-2 md:inline-flex"
        onClick={() => setOpen(true)}
        aria-label={t("search.open")}
      >
        <Search className="h-4 w-4" />
        <span className="truncate">{t("search.open")}</span>
        <span className="ml-auto hidden text-xs text-muted-foreground lg:inline">Ctrl+K</span>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
        aria-label={t("search.open")}
      >
        <Search className="h-4 w-4" />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={t("search.title")}
        description={t("search.subtitle")}
      >
        <CommandInput placeholder={t("search.placeholder")} />
        <CommandList>
          <CommandEmpty>{t("search.empty")}</CommandEmpty>

          {groups.map(([group, groupItems], groupIndex) => (
            <div key={group}>
              {groupIndex > 0 ? <CommandSeparator /> : null}
              <CommandGroup heading={group}>
                {groupItems.map((item) => (
                  <CommandItem key={item.id} onSelect={() => handleSelect(item)}>
                    <span className="flex-1">{item.label}</span>
                    {item.hint ? (
                      <span className="text-xs text-muted-foreground">{item.hint}</span>
                    ) : null}
                    {item.external ? <ExternalLink className="h-3.5 w-3.5" /> : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
