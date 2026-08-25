import type { VenueInfo } from "./logistics-types";
import { wedding } from "./wedding";

const addressLine1 = "3111 Masterpiece Rd, Lake Wales, FL 33898";
const mapQuery = `${wedding.wedding.venueName}, ${addressLine1}`;

export const venue: VenueInfo = {
  name: wedding.wedding.venueName,
  city: wedding.wedding.city,
  region: wedding.wedding.region,
  addressLine1,
  addressIsPlaceholder: false,
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
      id: "architecture",
      label: "Bella Cosa",
      src: "/images/venue/bella-cosa.webp",
      alt: "Bella Cosa estate in Lake Wales, framed by live oaks and Spanish moss",
    },
  ],
};
