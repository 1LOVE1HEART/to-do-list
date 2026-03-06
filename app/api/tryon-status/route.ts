import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { tryonResults } from "@/db/schema";
import Replicate from "replicate";

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const predictionId = searchParams.get("predictionId");
  const personImgUrl = searchParams.get("personImgUrl");
  const garmentImgUrl = searchParams.get("garmentImgUrl");
  const category = searchParams.get("category");

  if (!predictionId || !personImgUrl || !garmentImgUrl || !category) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const prediction = await replicate.predictions.get(predictionId);

  if (prediction.status === "succeeded") {
    const resultImgUrl = Array.isArray(prediction.output)
      ? prediction.output[0]
      : (prediction.output as string);

    // Save to DB
    await db.insert(tryonResults).values({
      userId: session.user.id,
      personImgUrl,
      garmentImgUrl,
      resultImgUrl,
      category,
    });

    return NextResponse.json({ status: "succeeded", resultImgUrl });
  }

  if (prediction.status === "failed" || prediction.status === "canceled") {
    return NextResponse.json(
      { status: "failed", error: prediction.error ?? "換裝失敗，請重試" },
      { status: 500 }
    );
  }

  return NextResponse.json({ status: prediction.status });
}
