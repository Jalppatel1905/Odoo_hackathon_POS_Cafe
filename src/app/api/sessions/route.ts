import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const sessions = await prisma.pOSSession.findMany({
    orderBy: { openedAt: "desc" },
  });
  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const session = await prisma.pOSSession.create({ data });
  return NextResponse.json(session);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, ...updateData } = data;
  const session = await prisma.pOSSession.update({
    where: { id },
    data: updateData,
  });
  return NextResponse.json(session);
}
