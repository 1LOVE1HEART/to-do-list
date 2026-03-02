import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { todoCreateSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userTodos = await db
    .select()
    .from(todos)
    .where(eq(todos.userId, session.user.id))
    .orderBy(desc(todos.createdAt));

  return NextResponse.json(userTodos);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = todoCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { title, priority, dueDate } = parsed.data;
  const [todo] = await db
    .insert(todos)
    .values({
      userId: session.user.id,
      title,
      priority,
      dueDate: dueDate ?? null,
    })
    .returning();

  return NextResponse.json(todo, { status: 201 });
}
