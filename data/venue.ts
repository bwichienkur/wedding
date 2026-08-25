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
  weather: "Add weather guidance and an indoor/outdoor contingency note.",
  weatherIsPlaceholder: true,
  layers: [
    {
      id: "architecture",
      label: "Bella Cosa",
      src: "/images/venue/bella-cosa.webp",
      alt: "Bella Cosa estate in Lake Wales, framed by live oaks and Spanish moss",
    },
  ],
};
