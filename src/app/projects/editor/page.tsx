import { useState } from "react"

export default function EditorPage() {
  const [pixels, setPixels] = useState(Array(10000).fill("#e5e7eb"))
  const [copied, setCopied] = useState(false)
  function handleClick(i: number) {
    setPixels(pixels => {
      const next = pixels.slice()
      next[i] = next[i] === "#e5e7eb" ? "#6366f1" : "#e5e7eb"
      return next
    })
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
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      <div className="p-6 rounded-2xl shadow-xl bg-white/80 border border-gray-100 flex flex-col items-center">
        <div className="grid" style={{ gridTemplateColumns: 'repeat(100, 0.5rem)', gridTemplateRows: 'repeat(100, 0.5rem)' }}>
          {grid}
        </div>
        <button onClick={exportCodex} className="mt-8 px-6 py-2 bg-indigo-100 text-indigo-700 rounded-lg shadow hover:bg-indigo-200 transition font-semibold">Export Codex</button>
      </div>
      {copied && <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-2 rounded-lg shadow-lg z-50">Copied to clipboard</div>}
    </div>
  )
} 