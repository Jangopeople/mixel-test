import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

function loadGtag(measurementId: string) {
  if (document.querySelector(`script[data-gtag-id="${measurementId}"]`)) {
    return;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.setAttribute("data-gtag-id", measurementId);
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", measurementId, { send_page_view: false });
}

export default function RouteAnalytics() {
  const location = useLocation();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) {
      return;
    }
    loadGtag(GA_MEASUREMENT_ID);
  }, []);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || typeof window.gtag !== "function") {
      return;
    }

    const pagePath = `${location.pathname}${location.search}${location.hash}`;
    window.gtag("event", "page_view", {
      page_title: document.title,
      page_location: window.location.href,
      page_path: pagePath,
      send_to: GA_MEASUREMENT_ID,
    });
  }, [location.hash, location.pathname, location.search]);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) {
      return;
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const trackingElement = target?.closest<HTMLElement>("[data-analytics-event]");
      if (!trackingElement || typeof window.gtag !== "function") {
        return;
      }

      const eventName = trackingElement.dataset.analyticsEvent;
      if (!eventName) {
        return;
      }

      window.gtag("event", eventName, {
        page_path: `${location.pathname}${location.search}${location.hash}`,
        send_to: GA_MEASUREMENT_ID,
      });
    };

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
    };
  }, [location.hash, location.pathname, location.search]);

  return null;
}
