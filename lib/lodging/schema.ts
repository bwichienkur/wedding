import { z } from "zod";
import { LODGING_ROOM_IDS } from "@/data/bella-cosa-rooms";

export const lodgingAssignmentsDocumentSchema = z.object({
  version: z.literal(1),
  assignments: z.record(z.string(), z.string()),
  updatedAt: z.string(),
});

export type LodgingAssignmentsDocument = z.infer<
  typeof lodgingAssignmentsDocumentSchema
>;

const roomIdSchema = z
  .string()
  .refine((id) => LODGING_ROOM_IDS.has(id), { message: "Unknown room" });

export const lodgingPatchSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("assign"),
    guestId: z.string().min(1),
    roomId: roomIdSchema,
  }),
  z.object({
    action: z.literal("unassign"),
    guestId: z.string().min(1),
  }),
  z.object({
    action: z.literal("replace"),
    assignments: z.record(z.string(), roomIdSchema),
  }),
]);
