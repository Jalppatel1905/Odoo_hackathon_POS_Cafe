import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.productCategory.findMany({
    orderBy: { sequence: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const category = await prisma.productCategory.create({ data });
  return NextResponse.json(category);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();

  // Batch reorder
  if (Array.isArray(data)) {
    for (const item of data) {
      await prisma.productCategory.update({
        where: { id: item.id },
        data: { name: item.name, color: item.color, sequence: item.sequence },
      });
    }
    return NextResponse.json({ success: true });
  }

  const { id, ...updateData } = data;
  const category = await prisma.productCategory.update({
    where: { id },
    data: updateData,
  });
  return NextResponse.json(category);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.productCategory.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
