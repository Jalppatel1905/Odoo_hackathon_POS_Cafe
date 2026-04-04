import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "Email already exists" }, { status: 400 });
  }

  const user = await prisma.user.create({
    data: { name, email, password, role: "admin" },
  });

  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}
