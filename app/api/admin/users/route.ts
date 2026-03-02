import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, todos } from "@/db/schema";
import { eq, count, desc, sql } from "drizzle-orm";

function isAdmin(session: any) {
  return session?.user?.role === "admin";
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  // Subquery count of todos per user
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      role: users.role,
      isBanned: users.isBanned,
      createdAt: users.createdAt,
      todoCount: sql<number>`cast(count(${todos.id}) as int)`,
    })
    .from(users)
    .leftJoin(todos, eq(todos.userId, users.id))
    .groupBy(users.id)
    .orderBy(desc(users.createdAt));

  const filtered = q
    ? rows.filter((u) => u.username.toLowerCase().includes(q.toLowerCase()))
    : rows;

  return NextResponse.json(filtered);
}
