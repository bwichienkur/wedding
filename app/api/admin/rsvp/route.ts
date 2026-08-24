import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { exportRsvpCsv, getAdminRsvpSummary } from "@/lib/rsvp/service";

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  if (searchParams.get("format") === "csv") {
    const csv = await exportRsvpCsv();
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="rsvp-export.csv"',
      },
    });
  }

  const summary = await getAdminRsvpSummary();
  return NextResponse.json(summary);
}
