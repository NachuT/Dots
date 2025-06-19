import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("pixel_placements")
      .select("x, y, color");
    
    if (error) {
      console.error("Supabase error in GET:", error);
      throw error;
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching pixels:", error);
    return NextResponse.json({ error: "Failed to fetch pixels" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received request body:", body);

    const { x, y, color, user_id, time_deducted_seconds } = body;

    // Validate required fields
    if (
      x === undefined || y === undefined ||
      color === undefined || user_id === undefined || time_deducted_seconds === undefined
    ) {
      console.error("Missing required fields:", { x, y, color, user_id, time_deducted_seconds });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Upsert pixel: insert or update if exists
    const { error: upsertError } = await supabase
      .from("pixel_placements")
      .upsert({
        x,
        y,
        color,
        user_id,
        time_deducted_seconds,
        placed_at: new Date().toISOString(),
      }, { onConflict: ["x", "y"] });

    if (upsertError) {
      console.error("Error upserting pixel:", upsertError);
      throw upsertError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error placing pixel:", error);
    return NextResponse.json(
      { 
        error: "Failed to place pixel",
        details: error.message || "Unknown error"
      },
      { status: 500 }
    );
  }
} 