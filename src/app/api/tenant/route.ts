import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET current tenant settings (white-label configuration)
export async function GET() {
  try {
    const tenant = await db.tenant.findFirst({
      include: {
        _count: {
          select: {
            users: true,
            prospects: true,
            sequences: true,
            mailboxes: true,
          },
        },
      },
    });

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, tenant });
  } catch (error) {
    console.error("Failed to fetch tenant:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH update tenant branding
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { name, brandColor, logoUrl, isWhiteLabeled, customDomain } = body;

    const currentTenant = await db.tenant.findFirst();
    if (!currentTenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const updated = await db.tenant.update({
      where: { id: currentTenant.id },
      data: {
        ...(name && { name }),
        ...(brandColor && { brandColor }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(isWhiteLabeled !== undefined && { isWhiteLabeled }),
        ...(customDomain !== undefined && { customDomain }),
      },
    });

    return NextResponse.json({ success: true, tenant: updated });
  } catch (error) {
    console.error("Failed to update tenant branding:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
