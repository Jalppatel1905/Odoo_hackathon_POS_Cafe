import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const customers = await prisma.customer.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(customers);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const customer = await prisma.customer.create({ data });
  return NextResponse.json(customer);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, ...updateData } = data;
  const customer = await prisma.customer.update({ where: { id }, data: updateData });
  return NextResponse.json(customer);
}
