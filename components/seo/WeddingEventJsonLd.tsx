import { wedding, weddingLocationLine } from "@/data/wedding";

/** Google Event structured data for public SEO when site mode is public. */
export function WeddingEventJsonLd() {
  if (wedding.site.mode !== "public") return null;

  const data = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${wedding.couple.displayName} Wedding`,
    startDate: `${wedding.wedding.dateISO}T16:00:00-04:00`,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: wedding.wedding.venueName,
      address: {
        "@type": "PostalAddress",
        addressLocality: wedding.wedding.city,
        addressRegion: wedding.wedding.region,
        addressCountry: "US",
      },
    },
    description: wedding.site.description,
    organizer: {
      "@type": "Person",
      name: wedding.couple.displayName,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function weddingLocationPlain(): string {
  return weddingLocationLine();
}
