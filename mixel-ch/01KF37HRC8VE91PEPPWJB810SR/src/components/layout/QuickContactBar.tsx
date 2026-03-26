import { Button } from "@/components/ui/button.tsx";
import { Mail, PhoneCall, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";

const PHONE_NUMBER = "0444331400";

export default function QuickContactBar() {
  const { t } = useTranslation("common");
  const [isMounted, setIsMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || dismissed) {
    return null;
  }

  return createPortal(
    <>
      {/* Mobile: single floating phone button */}
      <div className="pointer-events-none fixed right-4 bottom-4 z-40 md:hidden">
        <Button
          asChild
          size="icon"
          className="pointer-events-auto h-12 w-12 rounded-full shadow-lg"
          data-analytics-event="quickbar_call_click"
        >
          <a href={`tel:${PHONE_NUMBER}`} aria-label={t("quickbar.call")}>
            <PhoneCall className="h-5 w-5" />
          </a>
        </Button>
      </div>

      {/* Desktop: panel with dismiss button */}
      <div className="quickbar-desktop pointer-events-none fixed right-6 bottom-6 z-40 hidden md:block">
        <div className="pointer-events-auto relative w-72 rounded-2xl border border-slate-300 bg-white/95 p-4 shadow-xl backdrop-blur">
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="absolute top-2 right-2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label={t("quickbar.dismiss")}
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-start gap-3 mb-2">
            <img 
              src="/assets/michael-lacar.png" 
              alt="Michael Lascar - Platform Engineering" 
              className="w-14 h-14 rounded-full object-cover border border-slate-200 shadow-sm" 
            />
            <div className="pr-5">
              <p className="text-sm font-semibold text-slate-900">
                {t("quickbar.desktop_title")}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {t("quickbar.desktop_subtitle")}
              </p>
            </div>
          </div>
          <div className="mt-3 grid gap-2">
            <Button
              asChild
              size="sm"
              className="justify-start"
              data-analytics-event="quickbar_desktop_call_click"
            >
              <a href={`tel:${PHONE_NUMBER}`}>
                <PhoneCall className="mr-2 h-4 w-4" />
                044 433 14 00
              </a>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="justify-start"
              data-analytics-event="quickbar_desktop_email_click"
            >
              <a href="mailto:info@mixel.ch?subject=Support%20request">
                <Mail className="mr-2 h-4 w-4" />
                info@mixel.ch
              </a>
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
