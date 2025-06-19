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

const GRID_SIZE = 50;
const SIDEBAR_WIDTH = 256;
const NAVBAR_HEIGHT = 64;

export default function Canvas() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [pixels, setPixels] = useState<{ [key: string]: string }>({});
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [availableTime, setAvailableTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pixelSize, setPixelSize] = useState(12);
  const gridContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  useEffect(() => {
    function handleResize() {
      if (!gridContainerRef.current) return;
      const { width, height } = gridContainerRef.current.getBoundingClientRect();
      const size = Math.floor(Math.min(width, height) / GRID_SIZE);
      setPixelSize(size > 2 ? size : 2);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const handlePixelClick = async (x: number, y: number) => {
    if (!session?.user?.id || availableTime < 600) return;
    const key = `${x},${y}`;
    const prevColor = pixels[key] || "#ffffff";
    setPixels((prev) => ({ ...prev, [key]: selectedColor }));
    setAvailableTime((prev) => prev - 600);
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
          time_deducted_seconds: 600,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          setPixels((prev) => ({ ...prev, [key]: prevColor }));
          setAvailableTime((prev) => prev + 600);
          toast.error("Sorry too late!", { duration: 4000 });
        } else {
          setPixels((prev) => ({ ...prev, [key]: prevColor }));
          setAvailableTime((prev) => prev + 600);
          throw new Error(data.error || data.details || "Failed to place pixel");
        }
        return;
      }
      await fetchPixels();
    } catch (error) {
      setPixels((prev) => ({ ...prev, [key]: prevColor }));
      setAvailableTime((prev) => prev + 600);
      toast.error(error instanceof Error ? error.message : "Failed to place pixel", { duration: 4000 });
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="flex" style={{ height: `calc(100vh - ${NAVBAR_HEIGHT}px)` }}>
      <div
        ref={gridContainerRef}
        className="flex-1 flex items-center justify-center bg-gray-100"
        style={{ minWidth: 0, minHeight: 0 }}
      >
        <div
          className="border border-gray-300"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${pixelSize}px)` ,
            gridTemplateRows: `repeat(${GRID_SIZE}, ${pixelSize}px)` ,
            width: pixelSize * GRID_SIZE + (GRID_SIZE - 1),
            height: pixelSize * GRID_SIZE + (GRID_SIZE - 1),
            backgroundColor: "#e5e7eb",
            gap: "1px",
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
            const x = index % GRID_SIZE;
            const y = Math.floor(index / GRID_SIZE);
            const key = `${x},${y}`;
            const color = pixels[key] || "#ffffff";
            return (
              <div
                key={key}
                onClick={() => handlePixelClick(x, y)}
                style={{
                  width: pixelSize,
                  height: pixelSize,
                  backgroundColor: color,
                  cursor: availableTime >= 600 ? "pointer" : "not-allowed",
                  userSelect: "none",
                }}
                className={`transition-opacity ${
                  availableTime >= 600 ? "hover:opacity-80" : "opacity-50"
                }`}
              />
            );
          })}
        </div>
      </div>
      <div
        className="bg-white border-l border-gray-200 p-6 flex flex-col"
        style={{ width: SIDEBAR_WIDTH }}
      >
        <h1 className="text-2xl font-bold mb-6">Pixel Canvas</h1>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Color
            </label>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full h-12 rounded cursor-pointer border border-gray-300"
            />
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Coding Time</h2>
            {isLoading ? (
              <p className="text-gray-500">Loading...</p>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  {formatTime(availableTime)}
                </p>
                <p className="text-sm text-gray-600">
                  {availableTime >= 600
                    ? "Click on a pixel to place your color (costs 10 minutes)"
                    : "Not enough coding time to place a pixel"}
                </p>
              </>
            )}
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">How to Play</h2>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Select a color from the picker</li>
              <li>• Click on any white pixel to place your color</li>
              <li>• Each pixel costs 10 minutes of coding time</li>
              <li>• You can't place pixels on already colored spots</li>
            </ul>
          </div>
          <button
            onClick={() => signOut()}
            className="mt-8 px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
} 