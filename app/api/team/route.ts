import { NextResponse } from "next/server";
import * as argon2 from "argon2";
import { getPrismaClient } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const currentUser = await getAuthenticatedUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const prisma = getPrismaClient();
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        role: {
          select: { name: true, description: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Also get call counts and assigned lead counts per user
    const leads = await prisma.lead.findMany({
      select: { assignedCaller: true },
    });
    const calls = await prisma.call.findMany({
      select: { callerName: true },
    });

    const team = users.map((u) => {
      const assignedLeadsCount = leads.filter(
        (l) => l.assignedCaller?.toLowerCase() === u.fullName.toLowerCase()
      ).length;
      const callsMadeCount = calls.filter(
        (c) => c.callerName?.toLowerCase() === u.fullName.toLowerCase()
      ).length;

      return {
        id: u.id.toString(),
        fullName: u.fullName,
        email: u.email,
        phone: u.phone || "",
        role: u.role?.name || "CALLER",
        isActive: u.isActive,
        createdAt: u.createdAt.toISOString().slice(0, 10),
        targetCallsPerDay: u.role?.name === "ADMIN" ? 20 : 50,
        assignedLeadsCount,
        callsMadeCount,
      };
    });

    return NextResponse.json({ success: true, team });
  } catch (error) {
    console.error("GET /api/team failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch team members." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const currentUser = await getAuthenticatedUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only Admin or Manager can invite/create team members
  const isAuthorized = /admin|manager/i.test(currentUser.role);
  if (!isAuthorized) {
    return NextResponse.json(
      { error: "Forbidden. Admin or Manager role required." },
      { status: 403 }
    );
  }

  let body: {
    fullName?: string;
    email?: string;
    password?: string;
    phone?: string;
    roleName?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { fullName, email, password, phone, roleName } = body;

  if (!fullName || !email || !password) {
    return NextResponse.json(
      { error: "Full Name, Email, and Password are required." },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const prisma = getPrismaClient();

    // Check existing email
    const existing = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 409 }
      );
    }

    // Resolve Role
    const targetRoleName = (roleName || "CALLER").toUpperCase();
    const roleRecord = await prisma.role.findFirst({
      where: { name: targetRoleName },
    });

    if (!roleRecord) {
      return NextResponse.json(
        { error: `Role '${targetRoleName}' does not exist.` },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    const newUser = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        passwordHash,
        phone: phone?.trim() || null,
        roleId: roleRecord.id,
        isActive: true,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        role: { select: { name: true } },
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id.toString(),
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone || "",
        role: newUser.role?.name || "CALLER",
        isActive: newUser.isActive,
        createdAt: newUser.createdAt.toISOString().slice(0, 10),
      },
    });
  } catch (error) {
    console.error("POST /api/team failed:", error);
    return NextResponse.json(
      { error: "Failed to create team member." },
      { status: 500 }
    );
  }
}

