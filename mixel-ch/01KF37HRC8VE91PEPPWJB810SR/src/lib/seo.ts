export const SITE_URL = "https://www.mixel.ch";
export const SITE_NAME = "Mixel IT and Corporate Services GmbH";
export const OG_IMAGE = `${SITE_URL}/assets/branding/og-image.png`;

export const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/assets/branding/mixel-logo.png`,
  email: "info@mixel.ch",
  telephone: "+41444331400",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rüterspüelstrasse 17",
    postalCode: "8173",
    addressLocality: "Neerach",
    addressRegion: "Zurich",
    addressCountry: "CH",
  },
  areaServed: {
    "@type": "Country",
    name: "Switzerland",
  },
} as const;

export const LOCAL_BUSINESS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: SITE_NAME,
  image: `${SITE_URL}/assets/branding/og-image.png`,
  url: SITE_URL,
  telephone: "+41444331400",
  email: "info@mixel.ch",
  priceRange: "$$",
  openingHours: "Mo-Fr 07:00-12:00, Mo-Fr 13:00-17:00",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Rüterspüelstrasse 17",
    postalCode: "8173",
    addressLocality: "Neerach",
    addressRegion: "Zurich",
    addressCountry: "CH",
  },
  areaServed: {
    "@type": "Country",
    name: "Switzerland",
  },
} as const;

export function toAbsoluteUrl(pathname: string) {
  return new URL(pathname, SITE_URL).toString();
}

export function buildServiceSchema({
  name,
  description,
  pathname,
}: {
  name: string;
  description: string;
  pathname: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: toAbsoluteUrl(pathname),
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: {
      "@type": "Country",
      name: "Switzerland",
    },
    availableChannel: {
      "@type": "ServiceChannel",
      servicePhone: "+41444331400",
      serviceUrl: toAbsoluteUrl(pathname),
    },
  };
}
