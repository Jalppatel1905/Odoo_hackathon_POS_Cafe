import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const orders = await prisma.order.findMany({
    include: { lines: true, payments: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { lines, payments, ...orderData } = data;

  const order = await prisma.order.create({
    data: {
      ...orderData,
      customerId: orderData.customerId || null,
      lines: lines?.length ? { create: lines } : undefined,
      payments: payments?.length ? { create: payments } : undefined,
    },
    include: { lines: true, payments: true },
  });
  return NextResponse.json(order);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, lines, payments, ...orderData } = data;

  const order = await prisma.order.update({
    where: { id },
    data: orderData,
    include: { lines: true, payments: true },
  });
  return NextResponse.json(order);
}

export async function DELETE(req: NextRequest) {
  const { ids } = await req.json();
  await prisma.order.deleteMany({ where: { id: { in: ids } } });
  return NextResponse.json({ success: true });
}
