import { useState, useRef, useEffect } from "react"
// @ts-ignore
import { supabase } from "@/lib/supabase"
import { useSession } from "next-auth/react"

export default function EditorPage() {
  const [pixels, setPixels] = useState(Array(10000).fill("#e5e7eb"))
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const { data: session } = useSession()
  const [active, setActive] = useState(false)
  function handleClick(i: number) {
    setPixels(pixels => {
      const next = pixels.slice()
      next[i] = next[i] === "#e5e7eb" ? "#6366f1" : "#e5e7eb"
      supabase.from('pixels').update({ data: next }).eq('id', 1)
      setActive(true)
      return next
    })
  }
  function exportCanvas() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    for (let y = 0; y < 100; y++) {
      for (let x = 0; x < 100; x++) {
        const i = y * 100 + x
        ctx.fillStyle = pixels[i]
        ctx.fillRect(x, y, 1, 1)
      }
    }
    const url = canvas.toDataURL("image/png")
    const a = document.createElement("a")
    a.href = url
    a.download = "pixel-art.png"
    a.click()
  }
  async function exportCodex() {
    const rows = []
    for (let y = 99; y >= 0; y--) {
      for (let x = 0; x < 100; x++) {
        const i = y * 100 + x
        rows.push(pixels[i] === "#e5e7eb" ? "0" : "1")
      }
    }
    const codex = rows.join(",")
    await navigator.clipboard.writeText(codex)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  const grid = []
  for (let y = 0; y < 100; y++) {
    for (let x = 0; x < 100; x++) {
      const i = y * 100 + x
      grid.push(
        <div
          key={x + "," + y}
          className="w-2 h-2 border border-gray-200 box-border cursor-pointer transition-colors duration-100 rounded-sm"
          style={{ backgroundColor: pixels[i] }}
          onClick={() => handleClick(i)}
        />
      )
    }
  }
  useEffect(() => {
    const channel = supabase.channel('realtime:pixel-editor')
    channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pixels' }, (payload: any) => {
      if (payload.new && payload.new.data) {
        setPixels(payload.new.data)
      }
    })
    channel.subscribe()
    return () => {
      channel.unsubscribe()
    }
  }, [])
  useEffect(() => {
    if (!session) return
    const channel = supabase.channel('presence:pixel-editor', {
      config: { presence: { key: session.user.email } }
    })
    channel.subscribe(async (status: any) => {
      if (status === 'SUBSCRIBED') {
        channel.track({ online_at: Date.now() })
      }
    })
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      setOnlineUsers(Object.keys(state))
    })
    return () => {
      channel.unsubscribe()
    }
  }, [session])
  useEffect(() => {
    if (!active) return
    const t = setTimeout(() => setActive(false), 1000)
    return () => clearTimeout(t)
  }, [active])
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      <div className="p-6 rounded-2xl shadow-xl bg-white/80 border border-gray-100 flex flex-col items-center">
        <div className="flex gap-2 mb-2">
          {onlineUsers.map(email => (
            <span key={email} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium flex items-center gap-1">{email}{active && session && session.user.email === email && <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />}</span>
          ))}
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(100, 0.5rem)', gridTemplateRows: 'repeat(100, 0.5rem)' }}>
          {grid}
        </div>
        <canvas ref={canvasRef} width={100} height={100} style={{ display: 'none' }} />
        <button onClick={exportCanvas} className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition">Export Canvas</button>
        <button onClick={exportCodex} className="mt-8 px-6 py-2 bg-indigo-100 text-indigo-700 rounded-lg shadow hover:bg-indigo-200 transition font-semibold">Export Codex</button>
      </div>
      {copied && <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-2 rounded-lg shadow-lg z-50">Copied to clipboard</div>}
    </div>
  )
} 