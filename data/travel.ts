import type { TravelInfo } from "./logistics-types";

const hotelAddress = "2953 Ridge Way, Lake Wales, FL 33859";
const bokAddress = "1151 Tower Boulevard, Lake Wales, FL 33853";

export const travel: TravelInfo = {
  intro:
    "Fly into Orlando, stay at our hotel block in Lake Wales, and enjoy a quiet visit to Bok Tower Gardens nearby.",
  airports: [
    {
      id: "mco",
      name: "Orlando International Airport",
      code: "MCO",
      driveTimeLabel: "About 1 hour to Bella Cosa / Lake Wales.",
      driveTimeIsPlaceholder: false,
      notes: "Nearest major airport. Rental cars and rideshares are available.",
      notesIsPlaceholder: false,
    },
  ],
  hotels: [
    {
      id: "holiday-inn-express-lake-wales",
      name: "Holiday Inn Express Lake Wales N-Winter Haven by IHG",
      status: "confirmed",
      address: hotelAddress,
      phone: "8639494800",
      bookingCode: "BLW",
      notes: "Use discount code BLW when booking. Mention Bright & Lexi’s wedding.",
    },
  ],
  transportation:
    "Most guests drive or rideshare from MCO. Add shuttle details here if they become available.",
  transportationIsPlaceholder: true,
  recommendations: [
    {
      id: "bok-tower-gardens",
      category: "activity",
      name: "Bok Tower Gardens",
      description: `${bokAddress}. A National Historic Landmark with gardens and the Singing Tower — a beautiful stop near Bella Cosa.`,
      isPlaceholder: false,
      url: "https://boktowergardens.org/",
      imageSrc: "/images/travel/bok-tower-gardens.webp",
      imageAlt: "The Singing Tower at Bok Tower Gardens in Lake Wales, Florida",
    },
  ],
  emergencyContact: "Add an emergency or day-of contact once available.",
  emergencyIsPlaceholder: true,
};
