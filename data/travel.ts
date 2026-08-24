import type { TravelInfo } from "./logistics-types";

export const travel: TravelInfo = {
  intro:
    "Travel notes for Lake Wales, Florida. Confirmed bookings appear clearly; everything else stays labeled as a placeholder.",
  airports: [
    {
      id: "mco",
      name: "Add the primary recommended airport",
      code: "TBD",
      driveTimeLabel: "Add approximate drive time to Bella Cosa.",
      driveTimeIsPlaceholder: true,
      notes: "Add airport guidance for guests.",
      notesIsPlaceholder: true,
    },
    {
      id: "secondary",
      name: "Add a secondary airport option",
      code: "TBD",
      driveTimeLabel: "Add approximate drive time.",
      driveTimeIsPlaceholder: true,
      notes: "Add notes if a second airport is useful.",
      notesIsPlaceholder: true,
    },
  ],
  hotels: [
    {
      id: "hotel-block-1",
      name: "Add hotel information",
      status: "placeholder",
      address: "Add hotel address.",
      phone: undefined,
      bookingUrl: undefined,
      bookingCode: undefined,
      bookingDeadline: "Add booking deadline.",
      notes: "Add group code, room block details, and booking link when confirmed.",
    },
  ],
  transportation: "Add transportation options between hotels, airports, and Bella Cosa.",
  transportationIsPlaceholder: true,
  recommendations: [
    {
      id: "restaurant-1",
      category: "restaurant",
      name: "Add a restaurant recommendation",
      description: "Add a short note about a place guests might enjoy.",
      isPlaceholder: true,
    },
    {
      id: "activity-1",
      category: "activity",
      name: "Add something to do nearby",
      description: "Add a local activity or landmark worth visiting.",
      isPlaceholder: true,
    },
  ],
  emergencyContact: "Add an emergency or day-of contact once available.",
  emergencyIsPlaceholder: true,
};
