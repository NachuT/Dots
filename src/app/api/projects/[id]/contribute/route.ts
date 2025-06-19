import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { x, y, color, filled_by } = body;
    const project_id = Number(params.id);
    if (!project_id || x === undefined || y === undefined || !color || !filled_by) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const { data, error } = await supabase.from("project_contributions").insert({
      project_id,
      x,
      y,
      color,
      filled_by,
    }).select();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data[0]);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 