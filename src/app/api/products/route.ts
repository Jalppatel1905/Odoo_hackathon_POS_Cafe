import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    include: { variants: true, category: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { variants, ...productData } = data;

  const product = await prisma.product.create({
    data: {
      ...productData,
      variants: variants?.length ? { create: variants } : undefined,
    },
    include: { variants: true },
  });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, variants, ...productData } = data;

  // Delete old variants and create new ones
  await prisma.productVariant.deleteMany({ where: { productId: id } });

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...productData,
      variants: variants?.length ? { create: variants } : undefined,
    },
    include: { variants: true },
  });
  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest) {
  const { ids } = await req.json();
  await prisma.product.deleteMany({ where: { id: { in: ids } } });
  return NextResponse.json({ success: true });
}
