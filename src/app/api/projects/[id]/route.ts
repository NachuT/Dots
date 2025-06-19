import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const project_id = Number(params.id);
  if (!project_id) {
    return NextResponse.json({ error: "Missing project id" }, { status: 400 });
  }
  // For now, use 'nachu' as the current user
  const currentUser = "nachu";
  // Check if the project exists and was created by the current user
  const { data: project, error: fetchError } = await supabase
    .from("projects")
    .select("created_by")
    .eq("id", project_id)
    .single();
  if (fetchError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }
  if (project.created_by !== currentUser) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }
  // Delete the project
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", project_id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
} 