import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // Use raw query to include kitchenPassword field
  const configs = await prisma.$queryRaw<Array<Record<string, unknown>>>`
    SELECT * FROM PaymentMethodConfig LIMIT 1
  `;

  if (configs.length === 0) {
    await prisma.$executeRaw`
      INSERT INTO PaymentMethodConfig (id, cash, digital, upi, upiId, kitchenPassword)
      VALUES ('pmc-default', true, true, false, '', '')
    `;
    return NextResponse.json({ id: "pmc-default", cash: true, digital: true, upi: false, upiId: "", kitchenPassword: "" });
  }

  return NextResponse.json(configs[0]);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();

  // Get existing config
  const configs = await prisma.$queryRaw<Array<{id: string}>>`
    SELECT id FROM PaymentMethodConfig LIMIT 1
  `;

  if (configs.length === 0) {
    // Create with defaults
    await prisma.$executeRaw`
      INSERT INTO PaymentMethodConfig (id, cash, digital, upi, upiId, kitchenPassword)
      VALUES ('pmc-default', true, true, false, '', '')
    `;
  }

  const configId = configs[0]?.id || "pmc-default";

  // Update each field if provided
  if (data.cash !== undefined) {
    await prisma.$executeRaw`UPDATE PaymentMethodConfig SET cash = ${data.cash} WHERE id = ${configId}`;
  }
  if (data.digital !== undefined) {
    await prisma.$executeRaw`UPDATE PaymentMethodConfig SET digital = ${data.digital} WHERE id = ${configId}`;
  }
  if (data.upi !== undefined) {
    await prisma.$executeRaw`UPDATE PaymentMethodConfig SET upi = ${data.upi} WHERE id = ${configId}`;
  }
  if (data.upiId !== undefined) {
    await prisma.$executeRaw`UPDATE PaymentMethodConfig SET upiId = ${data.upiId} WHERE id = ${configId}`;
  }
  if (data.kitchenPassword !== undefined) {
    await prisma.$executeRaw`UPDATE PaymentMethodConfig SET kitchenPassword = ${data.kitchenPassword} WHERE id = ${configId}`;
  }

  // Return updated config
  const updated = await prisma.$queryRaw<Array<Record<string, unknown>>>`
    SELECT * FROM PaymentMethodConfig WHERE id = ${configId}
  `;

  return NextResponse.json(updated[0]);
}
