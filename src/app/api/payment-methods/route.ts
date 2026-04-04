import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  let config = await prisma.paymentMethodConfig.findFirst();
  if (!config) {
    config = await prisma.paymentMethodConfig.create({
      data: { cash: true, digital: true, upi: false, upiId: "" },
    });
  }
  return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  let config = await prisma.paymentMethodConfig.findFirst();
  if (!config) {
    config = await prisma.paymentMethodConfig.create({ data });
  } else {
    config = await prisma.paymentMethodConfig.update({
      where: { id: config.id },
      data,
    });
  }
  return NextResponse.json(config);
}
