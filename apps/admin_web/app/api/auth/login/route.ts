import { NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { setAdminCookie, signAdminToken } from "../../../../lib/session";
const prisma = new PrismaClient();
export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email || "")
    .toLowerCase()
    .trim();
  const password = String(body.password || "");
  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: "Email and password are required" },
      { status: 400 },
    );
  }
  const admin = await prisma.adminUser.findUnique({
    where: { email },
  });
  if (!admin || !admin.isActive) {
    return NextResponse.json(
      { success: false, error: "Invalid credentials" },
      { status: 401 },
    );
  }
  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { success: false, error: "Invalid credentials" },
      { status: 401 },
    );
  }
  const token = signAdminToken({
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });
  setAdminCookie(token);
  return NextResponse.json({
    success: true,
    data: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
  });
}
