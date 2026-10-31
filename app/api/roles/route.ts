import { connection } from "next/server";

import { getRoles } from "@/services/role.service";

export async function GET() {
  await connection();

  try {
    const roles = await getRoles();

    return Response.json({
      success: true,
      message: "Roles fetched successfully",
      data: roles,
    });
  } catch (error) {
    console.error("GET /api/roles failed:", error);

    return Response.json(
      {
        success: false,
        message: "Failed to fetch roles",
        data: null,
      },
      { status: 500 },
    );
  }
}
