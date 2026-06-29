import { NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { setAdminCookie, signAdminToken } from "../../../../lib/session";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  let email = "";
  let password = "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    email = String(body.email || "")
      .toLowerCase()
      .trim();
    password = String(body.password || "");
  } else {
    const form = await request.formData();
    email = String(form.get("email") || "")
      .toLowerCase()
      .trim();
    password = String(form.get("password") || "");
  }

  if (!email || !password) {
    return NextResponse.redirect(
      new URL(
        "/login?error=Email%20and%20password%20are%20required",
        request.url,
      ),
    );
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email },
  });

  if (!admin || !admin.isActive) {
    return NextResponse.redirect(
      new URL("/login?error=Invalid%20credentials", request.url),
    );
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    return NextResponse.redirect(
      new URL("/login?error=Invalid%20credentials", request.url),
    );
  }

  const token = signAdminToken({
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  });

  setAdminCookie(token);

  return NextResponse.redirect(new URL("/", request.url));
}
