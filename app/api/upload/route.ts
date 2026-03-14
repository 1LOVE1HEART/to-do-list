import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";
import { checkGuestUploadRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    // If not authenticated, enforce guest rate limit using IP
    if (!session?.user?.id) {
      const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";
      
      const { success, remaining, reset } = await checkGuestUploadRateLimit(ip);
      if (!success) {
        return NextResponse.json(
          { error: "訪客上傳次數已達上限 (每日 10 次)，請登入以繼續使用。", remaining, reset },
          { status: 429 }
        );
      }
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
      throw new Error("伺服器 Cloudinary 設定缺失");
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "未提供檔案" }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "檔案太大了 (上限 10MB)" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const url = await uploadImage(buffer);
    return NextResponse.json({ url });

  } catch (error: any) {
    console.error("[UPLOAD_API_ERROR]", error);
    return NextResponse.json({ 
      error: `上傳失敗: ${error.message || "未知錯誤"}`,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined
    }, { status: 500 });
  }
}

