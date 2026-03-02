import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validations";
import { verifyTurnstile } from "@/lib/turnstile";
import { checkRateLimit } from "@/lib/rateLimit";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const ip =
      (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    // Rate limit
    if (ip !== "unknown") {
      const rl = await checkRateLimit(ip);
      if (!rl.success) {
        return NextResponse.json(
          { error: "請求太頻繁，請稍後再試" },
          { status: 429 }
        );
      }
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { username, password, cfTurnstileToken } = parsed.data;

    // Turnstile
    const turnstileOk = await verifyTurnstile(cfTurnstileToken);
    if (!turnstileOk) {
      return NextResponse.json(
        { error: "人機驗證失敗，請重試" },
        { status: 400 }
      );
    }

    // Check duplicate
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    if (existing) {
      return NextResponse.json({ error: "帳號已存在" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    await db.insert(users).values({ username, password: hashed });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[register]", err);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}
