"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const supabaseRealtime = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const GRID_SIZE = 100;
const SECONDS_PER_PIXEL = 300;
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 3;
const INITIAL_ZOOM = 2.5;

export default function Canvas() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pixels, setPixels] = useState<{ [key: string]: string }>({});
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [availableTime, setAvailableTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pixelSize, setPixelSize] = useState(8);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);
  const didDrag = useRef(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  useEffect(() => {
    function handleResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const size = Math.floor(Math.min(w, h) / (GRID_SIZE / zoom));
      setPixelSize(size);
      setOffset({
        x: Math.floor((w - size * GRID_SIZE) / 2),
        y: Math.floor((h - size * GRID_SIZE) / 2),
      });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [zoom]);

  const fetchCodingTime = async () => {
    if (!session?.user?.id) return;
    try {
      const response = await fetch('/api/coding-time');
      const data = await response.json();
      if (!response.ok) {
        setAvailableTime(0);
        setIsLoading(false);
        return;
      }
      setAvailableTime(data.available_seconds);
      setIsLoading(false);
    } catch (error) {
      setAvailableTime(0);
      setIsLoading(false);
    }
  };

  const fetchPixels = async () => {
    try {
      const response = await fetch('/api/pixels');
      const data = await response.json();
      if (!response.ok) {
        return;
      }
      const pixelMap: { [key: string]: string } = {};
      data.forEach((pixel: { x: number; y: number; color: string }) => {
        pixelMap[`${pixel.x},${pixel.y}`] = pixel.color;
      });
      setPixels(pixelMap);
    } catch (error) {}
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchPixels();
      fetchCodingTime();
    }
  }, [session]);

  useEffect(() => {
    if (session?.user?.id) {
      const channel = supabaseRealtime
        .channel("pixel_placements")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "pixel_placements",
            filter: "*"
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              const { x, y, color } = payload.new;
              setPixels((prev) => ({ ...prev, [`${x},${y}`]: color }));
            }
          }
        )
        .subscribe();
      return () => {
        supabaseRealtime.removeChannel(channel);
      };
    }
  }, [session]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const seen = localStorage.getItem("seenInstructions");
      if (!seen) setShowInstructions(true);
    }
  }, []);

  const handleCloseInstructions = () => {
    setShowInstructions(false);
    localStorage.setItem("seenInstructions", "true");
  };

  function onMouseDown(e: React.MouseEvent) {
    setIsPanning(true);
    panStart.current = { ...pan };
    mouseStart.current = { x: e.clientX, y: e.clientY };
    didDrag.current = false;
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!isPanning) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const dx = e.clientX - mouseStart.current.x;
      const dy = e.clientY - mouseStart.current.y;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        didDrag.current = true;
      }
      setPan({ x: panStart.current.x + dx, y: panStart.current.y + dy });
    });
  }
  function onMouseUp() {
    setIsPanning(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }


  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, MAX_ZOOM));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, MIN_ZOOM));

  const handlePixelClick = async (x: number, y: number) => {
    if (!session?.user?.id || availableTime < SECONDS_PER_PIXEL) return;
    const key = `${x},${y}`;
    const prevColor = pixels[key] || "#ffffff";
    setPixels((prev) => ({ ...prev, [key]: selectedColor }));
    setAvailableTime((prev) => prev - SECONDS_PER_PIXEL);
    try {
      const response = await fetch('/api/pixels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          x,
          y,
          color: selectedColor,
          user_id: session.user.id,
          time_deducted_seconds: SECONDS_PER_PIXEL,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          setPixels((prev) => ({ ...prev, [key]: prevColor }));
          setAvailableTime((prev) => prev + SECONDS_PER_PIXEL);
          toast.error("Sorry too late!", { duration: 4000 });
        } else {
          setPixels((prev) => ({ ...prev, [key]: prevColor }));
          setAvailableTime((prev) => prev + SECONDS_PER_PIXEL);
          throw new Error(data.error || data.details || "Failed to place pixel");
        }
        return;
      }
    } catch (error) {
      setPixels((prev) => ({ ...prev, [key]: prevColor }));
      setAvailableTime((prev) => prev + SECONDS_PER_PIXEL);
      toast.error(error instanceof Error ? error.message : "Failed to place pixel", { duration: 4000 });
    }
  };

  return (
    <>
     
      {showInstructions && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{
            background: "#fff", borderRadius: 16, padding: 32, maxWidth: 400, boxShadow: "0 4px 32px #0003", textAlign: "center"
          }}>
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>Welcome to Dots!</h2>
            <div style={{ marginBottom: 24 }}>
              
              <p>Here you can place pixels on the canvas. Use the 2 buttons on the top left to zoom in and out and drag to pan the canvas. Normally you get 1 pixel every 5 minutes on hackatime, but to start you off you will get a free 12 pixels! Have fun and create something cool!</p>
            </div>
            <button
              onClick={handleCloseInstructions}
              style={{
                background: "#6366f1", color: "#fff", border: "none", borderRadius: 8,
                padding: "10px 24px", fontWeight: 600, cursor: "pointer"
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
      <div
        style={{
          width: "100vw",
          height: "100vh",
          overflow: "hidden",
          margin: 0,
          padding: 0,
          background: "#fff",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 0,
          fontFamily: 'Inter, sans-serif',
          userSelect: isPanning ? "none" : undefined,
          cursor: isPanning ? "grabbing" : "default",
        }}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <div style={{
          position: "fixed",
          top: 24,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          fontSize: 40,
          fontWeight: 700,
          letterSpacing: 2,
          textShadow: "0 2px 8px #fff8",
          background: "linear-gradient(90deg, #6366f1, #ec4899, #f59e42, #10b981, #6366f1)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
          WebkitTextFillColor: "transparent",
          padding: "0 16px"
        }}>
          DOTS
        </div>
        
        <div style={{ position: "fixed", top: 32, right: 48, zIndex: 10, textAlign: "right", display: "flex", alignItems: "center", gap: 16, background: "rgba(255,255,255,0.85)", borderRadius: 16, boxShadow: "0 2px 12px #0001", padding: "12px 20px" }}>
          <div style={{ fontSize: 20, color: "#444", fontWeight: 500, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session?.user?.name || "Profile"}</div>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            {session?.user?.image ? (
              <img src={session.user.image} alt="profile" style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="5"/><path d="M17 21v-2a5 5 0 0 0-10 0v2"/></svg>
            )}
          </div>
          
          <div style={{ marginLeft: 16, textAlign: "left" }}>
            <div style={{ fontSize: 16, color: "#6366f1", fontWeight: 600 }}>
              Pixels you can place: {Math.max(0, Math.floor(availableTime / SECONDS_PER_PIXEL))}
            </div>
            <div style={{ fontSize: 14, color: "#444" }}>
              Time available: {Math.max(0, Math.floor(availableTime / 60))} min {Math.max(0, availableTime % 60)} sec
            </div>
          </div>
        </div>
        
        <div style={{ position: "fixed", top: 32, left: 48, zIndex: 10, display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={handleZoomIn} style={{ fontSize: 24, width: 48, height: 48, borderRadius: 12, background: "#fff", border: "1.5px solid #e0e7ef", boxShadow: "0 2px 8px #0001", cursor: "pointer", fontWeight: 700, marginBottom: 4 }}>+</button>
          <button onClick={handleZoomOut} style={{ fontSize: 24, width: 48, height: 48, borderRadius: 12, background: "#fff", border: "1.5px solid #e0e7ef", boxShadow: "0 2px 8px #0001", cursor: "pointer", fontWeight: 700 }}>-</button>
        </div>
        
        <div style={{ position: "fixed", bottom: 48, right: 48, zIndex: 10, textAlign: "center" }}>
          <div style={{ background: "rgba(255,255,255,0.95)", border: "1.5px solid #e0e7ef", borderRadius: 16, boxShadow: "0 2px 12px #0001", padding: 20, marginBottom: 12, minWidth: 120 }}>
            <div style={{ fontSize: 16, marginBottom: 8, color: "#444", fontWeight: 500 }}>Color Picker</div>
            <input type="color" value={selectedColor} onChange={e => setSelectedColor(e.target.value)} style={{ width: 48, height: 48, border: "none", background: "none", borderRadius: 8, boxShadow: "0 1px 4px #0001" }} />
          </div>
          <button onClick={() => signOut()} style={{ fontSize: 16, color: "#fff", background: "#ef4444", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 600, boxShadow: "0 2px 8px #0001", cursor: "pointer", transition: "background 0.2s" }}>Logout</button>
        </div>
        
        <div style={{
          position: "fixed",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
          fontSize: 20,
          fontWeight: 500,
          letterSpacing: 1,
          background: "linear-gradient(90deg, #6366f1, #ec4899, #f59e42, #10b981, #6366f1)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
          WebkitTextFillColor: "transparent",
          borderRadius: 8,
          padding: "4px 18px",
          boxShadow: "0 1px 4px #0001"
        }}>
          By: Nachu
        </div>
        <div
          style={{
            position: "absolute",
            left: offset.x + pan.x,
            top: offset.y + pan.y,
            display: "grid",
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${pixelSize}px)` ,
            gridTemplateRows: `repeat(${GRID_SIZE}, ${pixelSize}px)` ,
            width: pixelSize * GRID_SIZE + (GRID_SIZE - 1),
            height: pixelSize * GRID_SIZE + (GRID_SIZE - 1),
            backgroundColor: "#e5e7eb",
            gap: "1px",
            cursor: isPanning ? "grabbing" : "grab",
            transition: isPanning ? "none" : "transform 0.2s cubic-bezier(.4,2,.6,1)",
            transform: `translate3d(0,0,0)`
          }}
          onMouseDown={onMouseDown}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
            const x = index % GRID_SIZE;
            const y = Math.floor(index / GRID_SIZE);
            const key = `${x},${y}`;
            const color = pixels[key] || "#ffffff";
            return (
              <div
                key={key}
                onClick={() => { if (!didDrag.current) handlePixelClick(x, y); }}
                style={{
                  width: pixelSize,
                  height: pixelSize,
                  backgroundColor: color,
                  userSelect: "none",
                  transition: "background 0.15s"
                }}
              />
            );
          })}
        </div>
      </div>
    </>
  );
} 