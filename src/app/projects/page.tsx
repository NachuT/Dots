"use client";
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
// @ts-ignore
import { supabase } from "@/lib/supabase"

const GRID_SIZE = 100;

type OutlinePixel = { x: number; y: number; color: string };
type ProgressPixel = { x: number; y: number; color: string };
type Project = {
  id: number;
  name: string;
  outline: OutlinePixel[];
  progress: ProgressPixel[];
  created_by: string;
  created_at: string;
};

export default function ProjectsPage() {
  const { status } = useSession()
  const router = useRouter()
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login")
  }, [status, router])
  const [idea, setIdea] = useState("")
  const [projects, setProjects] = useState<any[]>([])
  useEffect(() => {
    supabase.from("projects").select("id, name, created_by, created_at").order("created_at", { ascending: false }).then(({ data }: any) => {
      if (data) setProjects(data)
    })
  }, [])
  if (status !== "authenticated") return null
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white scroll-smooth">
      <div className="flex flex-col items-center bg-white/80 border border-gray-100 rounded-2xl shadow p-6 mb-10 w-full max-w-md">
        <img src="https://avatars.githubusercontent.com/u/101623253?v=4" alt="Nachu" className="w-16 h-16 rounded-full mb-2" />
        <div className="text-xl font-semibold mb-1">Nachu</div>
        <div className="text-gray-500 mb-4">Project Author</div>
        <textarea
          className="w-full p-2 border rounded mb-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          placeholder="Describe your idea..."
          value={idea}
          onChange={e => setIdea(e.target.value)}
          rows={2}
        />
        {idea && <div className="w-full mt-2 text-gray-700 bg-indigo-50 rounded p-2">{idea}</div>}
      </div>
      <a href="/projects/editor" className="mb-8 px-6 py-2 rounded-lg bg-indigo-600 text-white text-lg font-semibold hover:bg-indigo-700 transition">Editor</a>
      <h1 className="text-5xl font-bold mb-8">Projects</h1>
      <div className="w-full max-w-2xl flex flex-col gap-4 mb-8">
        {projects.map(p => (
          <div key={p.id} className="bg-white/90 border border-gray-100 rounded-xl shadow p-4 flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="font-semibold text-lg text-indigo-700">{p.name}</div>
            <div className="text-gray-500 text-sm">By {p.created_by}</div>
            <div className="text-gray-400 text-xs">{new Date(p.created_at).toLocaleString()}</div>
          </div>
        ))}
      </div>
      <a href="/projects/blank" className="text-xl text-indigo-600 hover:underline">Go to blank page</a>
    </div>
  )
} 