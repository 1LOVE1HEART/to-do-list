import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";
import { checkGuestUploadRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const session = await auth();
  
  // If not authenticated, enforce guest rate limit using IP
  if (!session?.user?.id) {
    // Get IP address from headers, fallback to "127.0.0.1" for local testing
    const ip = req.headers.get("x-forwarded-for") || (req as any).ip || "127.0.0.1";
    
    // Check guest upload rate limit
    const { success, remaining, reset } = await checkGuestUploadRateLimit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "訪客上傳次數已達上限 (每日10次)，請登入以繼續使用。", remaining, reset },
        { status: 429 }
      );
    }
  }

  // Debug: check env vars
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    return NextResponse.json({ error: "Cloudinary env vars missing in server" }, { status: 500 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const url = await uploadImage(buffer);
    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("DEBUG - Upload error details:", error);
    // Return the actual error message if possible for easier debugging
    return NextResponse.json({ 
      error: `Upload failed: ${error.message || "Unknown error"}`,
      details: error
    }, { status: 500 });
  }
}
