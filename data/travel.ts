import type { TravelInfo } from "./logistics-types";

const hotelAddress = "2953 Ridge Way, Lake Wales, FL 33859";

export const travel: TravelInfo = {
  intro: "Our hotel block in Lake Wales.",
  airports: [],
  hotels: [
    {
      id: "holiday-inn-express-lake-wales",
      name: "Holiday Inn Express Lake Wales N-Winter Haven by IHG",
      status: "confirmed",
      address: hotelAddress,
      phone: "8639494800",
      bookingCode: "BLW",
      bookingDeadline: "April 10, 2027",
      notes:
        "Use discount code BLW when booking. Mention Lexi & Bright’s wedding. Reserve by April 10, 2027.",
    },
  ],
  transportation:
    "Most guests drive or rideshare from MCO. Add shuttle details here if they become available.",
  transportationIsPlaceholder: true,
  recommendations: [],
  emergencyContact: "Add an emergency or day-of contact once available.",
  emergencyIsPlaceholder: true,
};
