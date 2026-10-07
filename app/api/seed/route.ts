import { NextResponse } from "next/server";
import { ensureSeedData } from "@/lib/seedData";

export async function GET() {
  try {
    const result = await ensureSeedData();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Error running seed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
