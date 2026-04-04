import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const floors = await prisma.floor.findMany({
    include: { tables: { orderBy: { number: "asc" } } },
  });
  return NextResponse.json(floors);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { tables, ...floorData } = data;
  const floor = await prisma.floor.create({
    data: {
      ...floorData,
      tables: tables?.length ? { create: tables } : undefined,
    },
    include: { tables: true },
  });
  return NextResponse.json(floor);
}

export async function PUT(req: NextRequest) {
  const data = await req.json();
  const { id, tables, ...floorData } = data;

  // Update floor
  await prisma.floor.update({ where: { id }, data: floorData });

  // Sync tables - delete removed, update existing, create new
  if (tables) {
    const existingIds = tables.filter((t: { id: string }) => t.id).map((t: { id: string }) => t.id);
    await prisma.floorTable.deleteMany({
      where: { floorId: id, id: { notIn: existingIds } },
    });

    for (const table of tables) {
      if (table.id) {
        await prisma.floorTable.upsert({
          where: { id: table.id },
          update: { number: table.number, seats: table.seats, active: table.active },
          create: { ...table, floorId: id },
        });
      } else {
        await prisma.floorTable.create({
          data: { ...table, floorId: id },
        });
      }
    }
  }

  const updated = await prisma.floor.findUnique({
    where: { id },
    include: { tables: { orderBy: { number: "asc" } } },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  await prisma.floor.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
