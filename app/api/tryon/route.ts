import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { checkTryonRateLimit } from "@/lib/rateLimit";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Replicate from "replicate";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

type GarmentCategory = "upper_body" | "lower_body" | "dress";

async function classifyGarment(imageUrl: string): Promise<GarmentCategory> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const imgRes = await fetch(imageUrl);
    const contentType = imgRes.headers.get("content-type") || "image/jpeg";
    const buffer = await imgRes.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: contentType,
          data: base64,
        },
      },
      "指出這張照片中的主要衣物品類。請**僅回傳**以下其中一個單字，不要有其他描述：upper_body、lower_body、dress。如果是不確定的情況，預設回傳 upper_body。",
    ]);
    const text = result.response.text().trim().toLowerCase();
    if (text.includes("lower_body")) return "lower_body";
    if (text.includes("dress")) return "dress";
    return "upper_body";
  } catch (error) {
    console.error("Gemini classification failed:", error);
    return "upper_body"; // fallback to upper body on model failure
  }
}

async function fetchImageAsBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Could not fetch image for Gemini");
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { success, remaining, reset } = await checkTryonRateLimit(session.user.id);
  if (!success) {
    const resetDate = new Date(reset);
    return NextResponse.json(
      {
        error: `每小時最多 5 次換裝，請於 ${resetDate.toLocaleTimeString("zh-TW")} 後再試。`,
        remaining: 0,
        reset,
      },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { personImgUrl, garmentImgUrl } = body;

  if (!personImgUrl || !garmentImgUrl) {
    return NextResponse.json({ error: "Missing image URLs" }, { status: 400 });
  }

  try {
    // Step 1: Classify garment type
    // Using a separate try/catch in the function or fallback
    const category = await classifyGarment(garmentImgUrl);

    // Step 2: Start Replicate prediction (IDM-VTON)
    const prediction = await replicate.predictions.create({
      version: "c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4",
      input: {
        human_img: personImgUrl,
        garm_img: garmentImgUrl,
        garment_des: "a piece of clothing",
        is_checked: true,
        is_checked_crop: false,
        denoise_steps: 30,
        seed: 42,
        category:
          category === "upper_body"
            ? "upper_body"
            : category === "lower_body"
            ? "lower_body"
            : "dresses",
      },
    });

    return NextResponse.json({
      predictionId: prediction.id,
      category,
      remaining,
    });
  } catch (error: any) {
    console.error("Try-on prediction error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong during try-on start" }, { status: 500 });
  }
}
