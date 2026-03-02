import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, todos } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

function isAdmin(session: any) {
  return session?.user?.role === "admin";
}

// GET /api/admin/users/[id] — get single user's todos
export async function GET(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!isAdmin(session))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const userTodos = await db
    .select()
    .from(todos)
    .where(eq(todos.userId, id))
    .orderBy(desc(todos.createdAt));

  return NextResponse.json({ user, todos: userTodos });
}

// PATCH /api/admin/users/[id] — ban/unban
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!isAdmin(session))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { isBanned } = body;

  const [updated] = await db
    .update(users)
    .set({ isBanned: Boolean(isBanned) })
    .where(eq(users.id, id))
    .returning();

  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(updated);
}
