import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";

    const tenant = await db.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json({ prospects: [], count: 0 });
    }

    const whereClause: any = {
      tenantId: tenant.id,
    };

    if (status !== "ALL") {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { companyName: { contains: search } },
      ];
    }

    const prospects = await db.prospect.findMany({
      where: whereClause,
      include: {
        account: true,
        assignedRep: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        enrollments: {
          include: {
            sequence: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const counts = await db.prospect.groupBy({
      by: ["status"],
      where: { tenantId: tenant.id },
      _count: true,
    });

    const statusCounts: Record<string, number> = {
      ALL: prospects.length,
      ACTIVE: 0,
      REPLIED: 0,
      MEETING_BOOKED: 0,
      BOUNCED: 0,
      UNENROLLED: 0,
    };

    counts.forEach((c) => {
      statusCounts[c.status] = c._count;
    });

    return NextResponse.json({
      success: true,
      prospects,
      counts: statusCounts,
    });
  } catch (error) {
    console.error("Failed to fetch prospects:", error);
    return NextResponse.json({ error: "Failed to fetch prospects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, companyName, title, timezone, tags } = body;

    const tenant = await db.tenant.findFirst();
    if (!tenant) {
      return NextResponse.json({ error: "No active tenant" }, { status: 400 });
    }

    const newProspect = await db.prospect.create({
      data: {
        tenantId: tenant.id,
        firstName,
        lastName,
        email,
        phone: phone || null,
        companyName: companyName || null,
        title: title || null,
        timezone: timezone || "America/New_York",
        tags: tags || "Inbound",
        status: "UNENROLLED",
      },
    });

    return NextResponse.json({ success: true, prospect: newProspect }, { status: 201 });
  } catch (error) {
    console.error("Failed to create prospect:", error);
    return NextResponse.json({ error: "Failed to create prospect" }, { status: 500 });
  }
}
