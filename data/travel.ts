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
  ],
  hotels: [],
  transportation: "Add transportation options between hotels, airports, and Bella Cosa.",
  transportationIsPlaceholder: true,
  recommendations: [
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
