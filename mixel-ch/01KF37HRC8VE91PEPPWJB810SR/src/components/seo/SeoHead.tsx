import { SUPPORTED_LOCALES_ARRAY, type SupportedLocale } from "@/i18n.ts";
import { OG_IMAGE, SITE_URL } from "@/lib/seo.ts";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type JsonLd = Record<string, unknown>;

interface SeoHeadProps {
  title: string;
  description: string;
  image?: string;
  noIndex?: boolean;
  schema?: JsonLd | JsonLd[];
}

const SEARCH_CONSOLE_VERIFICATION = import.meta.env.VITE_GSC_VERIFICATION as
  | string
  | undefined;

const OG_LOCALE_MAP: Record<SupportedLocale, string> = {
  de: "de_CH",
  en: "en_CH",
  fr: "fr_CH",
};

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  let meta = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(attribute, key);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

function setAlternateLinks(pathname: string) {
  for (const node of document.head.querySelectorAll('link[data-seo-hreflang="true"]')) {
    node.remove();
  }

  const segments = pathname.split("/").filter(Boolean);
  const maybeLocale = segments[0] as SupportedLocale | undefined;
  const isLocalizedPath = maybeLocale ? SUPPORTED_LOCALES_ARRAY.includes(maybeLocale) : false;
  const suffix = isLocalizedPath ? segments.slice(1).join("/") : "";

  for (const locale of SUPPORTED_LOCALES_ARRAY) {
    const localizedPath = suffix.length > 0 ? `/${locale}/${suffix}` : `/${locale}`;
    const href = new URL(localizedPath, SITE_URL).toString();
    const link = document.createElement("link");
    link.setAttribute("rel", "alternate");
    link.setAttribute("hreflang", locale);
    link.setAttribute("href", href);
    link.setAttribute("data-seo-hreflang", "true");
    document.head.appendChild(link);
  }

  const xDefault = document.createElement("link");
  xDefault.setAttribute("rel", "alternate");
  xDefault.setAttribute("hreflang", "x-default");
  xDefault.setAttribute("href", new URL("/de", SITE_URL).toString());
  xDefault.setAttribute("data-seo-hreflang", "true");
  document.head.appendChild(xDefault);
}

export default function SeoHead({
  title,
  description,
  image,
  noIndex = false,
  schema,
}: SeoHeadProps) {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname || "/";
    const canonicalUrl = new URL(pathname, SITE_URL).toString();
    const currentLocaleSegment = pathname.split("/").filter(Boolean)[0] as SupportedLocale | undefined;
    const currentLocale =
      currentLocaleSegment && SUPPORTED_LOCALES_ARRAY.includes(currentLocaleSegment)
        ? currentLocaleSegment
        : "de";
    const fullTitle = title.includes("Mixel") ? title : `${title} | Mixel IT`;
    const imageUrl = image ? new URL(image, SITE_URL).toString() : OG_IMAGE;

    document.title = fullTitle;

    upsertMeta("name", "description", description);
    upsertMeta("name", "language", currentLocale);
    upsertMeta("name", "robots", noIndex ? "noindex, nofollow" : "index, follow");
    if (SEARCH_CONSOLE_VERIFICATION) {
      upsertMeta(
        "name",
        "google-site-verification",
        SEARCH_CONSOLE_VERIFICATION,
      );
    }

    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:site_name", "Mixel IT");
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", canonicalUrl);
    upsertMeta("property", "og:image", imageUrl);
    upsertMeta("property", "og:locale", OG_LOCALE_MAP[currentLocale]);

    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", fullTitle);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", imageUrl);

    upsertCanonical(canonicalUrl);
    setAlternateLinks(pathname);

    for (const node of document.head.querySelectorAll('script[data-seo-schema="true"]')) {
      node.remove();
    }

    if (schema) {
      const schemaItems = Array.isArray(schema) ? schema : [schema];
      for (const entry of schemaItems) {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-seo-schema", "true");
        script.textContent = JSON.stringify(entry);
        document.head.appendChild(script);
      }
    }
  }, [description, image, location.pathname, noIndex, schema, title]);

  return null;
}
