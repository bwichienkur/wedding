import type { VenueInfo } from "./logistics-types";
import { wedding } from "./wedding";

const mapQuery = `${wedding.wedding.venueName}, ${wedding.wedding.city}, ${wedding.wedding.region}`;

export const venue: VenueInfo = {
  name: wedding.wedding.venueName,
  city: wedding.wedding.city,
  region: wedding.wedding.region,
  addressLine1: "Add the street address for Bella Cosa.",
  addressIsPlaceholder: true,
  mapQuery,
  mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`,
  directions: "Add driving directions and preferred arrival routes.",
  directionsIsPlaceholder: true,
  parking: "Add parking instructions.",
  parkingIsPlaceholder: true,
  accessibility: "Add accessibility details for ceremony, reception, and restrooms.",
  accessibilityIsPlaceholder: true,
  weather: "Add weather guidance and an indoor/outdoor contingency note.",
  weatherIsPlaceholder: true,
  arrivalGuidance: "Add guest arrival timing and where to enter the property.",
  arrivalIsPlaceholder: true,
  ceremonyLocation: "Add where the ceremony takes place on the property.",
  ceremonyIsPlaceholder: true,
  receptionLocation: "Add where the reception takes place on the property.",
  receptionIsPlaceholder: true,
  transportationNotes: "Add shuttle, rideshare, or transportation notes.",
  transportationIsPlaceholder: true,
  layers: [
    {
      id: "sky",
      label: "Sky",
      src: "/images/placeholders/venue-sky.svg",
      alt: "Placeholder background sky layer for Bella Cosa",
    },
    {
      id: "architecture",
      label: "Architecture",
      src: "/images/placeholders/venue-architecture.svg",
      alt: "Placeholder architecture layer for Bella Cosa",
    },
    {
      id: "foliage",
      label: "Foliage",
      src: "/images/placeholders/venue-foliage.svg",
      alt: "Placeholder foreground foliage layer for Bella Cosa",
    },
  ],
};
