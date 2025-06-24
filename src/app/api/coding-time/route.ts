import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! 
);

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session);

    if (!session?.user?.id) {
      console.error("No session or user ID found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Fetching from HackaTime for user:", session.user.id);
    
    const hackaTimeUrl = `https://hackatime.hackclub.com/api/v1/users/${session.user.id}/stats`;
    console.log("HackaTime URL:", hackaTimeUrl);

    const response = await fetch(hackaTimeUrl, {
      headers: {
        "User-Agent": "Dots/1.0",
        "Accept": "application/json",
      },
    });

    console.log("HackaTime response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HackaTime API error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      return NextResponse.json(
        { error: `HackaTime API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    console.log("HackaTime API response:", responseData);

    // Check if data exists and is in the expected format
    if (!responseData?.data) {
      console.error("Invalid data format from HackaTime:", responseData);
      return NextResponse.json({
        human_readable_total: "0h 0m 0s",
        total_seconds: 0,
        available_seconds: 0
      });
    }

    const data = responseData.data;
    console.log("Parsed HackaTime data:", data);

    // Get total seconds directly from the API response
    const totalSeconds = data.total_seconds || 0;

    // Get or create coding_time row for this user
    const { data: codingTimeRows, error: fetchCodingTimeError } = await supabase
      .from("coding_time")
      .select("total_seconds, starting_total_seconds")
      .eq("user_id", session.user.id)
      .single();

    let startingTotalSeconds = codingTimeRows?.starting_total_seconds;
    let availableSeconds = 0;
    let updateStarting = false;

    if (startingTotalSeconds === null || startingTotalSeconds === undefined) {
      // First login: set starting_total_seconds and give 60 minutes
      startingTotalSeconds = totalSeconds;
      availableSeconds = 3600; // 60 minutes
      updateStarting = true;
    } else {
      // Allow 60 minutes plus any increase in coding time
      availableSeconds = 3600 + (totalSeconds - startingTotalSeconds);
    }

    // Get used time from pixel placements
    const { data: usedTime } = await supabase
      .from("pixel_placements")
      .select("time_deducted_seconds")
      .eq("user_id", session.user.id);

    const totalUsedSeconds = usedTime?.reduce(
      (sum, record) => sum + record.time_deducted_seconds,
      0
    ) || 0;

    // Subtract used time
    availableSeconds = availableSeconds - totalUsedSeconds;

    // Update the database with the new coding time and starting_total_seconds if needed
    const { error: dbError } = await supabase
      .from("coding_time")
      .upsert({
        user_id: session.user.id,
        total_seconds: totalSeconds,
        last_updated_at: new Date().toISOString(),
        ...(updateStarting ? { starting_total_seconds: startingTotalSeconds } : {})
      }, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      });

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to update coding time in database" },
        { status: 500 }
      );
    }

    // Return the data with available time
    return NextResponse.json({
      human_readable_total: data.human_readable_total,
      total_seconds: totalSeconds,
      available_seconds: availableSeconds
    });
  } catch (error) {
    console.error("Unexpected error in coding-time API:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch coding time",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 