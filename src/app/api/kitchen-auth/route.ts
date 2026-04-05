import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  // Use raw query since kitchenPassword may not be in generated types yet
  const configs = await prisma.$queryRaw<Array<{kitchenPassword: string}>>`
    SELECT kitchenPassword FROM PaymentMethodConfig LIMIT 1
  `;

  const kitchenPassword = configs[0]?.kitchenPassword || "";

  if (!kitchenPassword) {
    return NextResponse.json({ success: true });
  }

  if (kitchenPassword === password) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: "Wrong password" }, { status: 401 });
}
