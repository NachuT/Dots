"use client";

import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

function BouncingBalls() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animationFrameId: number;
    const balls = Array.from({ length: 12 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      r: 18 + Math.random() * 10,
      color: `hsl(${Math.random() * 360}, 80%, 60%)`,
    }));
    function draw() {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const ball of balls) {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI);
        ctx.fillStyle = ball.color;
        ctx.globalAlpha = 0.25;
        ctx.fill();
        ctx.globalAlpha = 1;
        ball.x += ball.vx;
        ball.y += ball.vy;
        if (ball.x - ball.r < 0 || ball.x + ball.r > canvas.width) ball.vx *= -1;
        if (ball.y - ball.r < 0 || ball.y + ball.r > canvas.height) ball.vy *= -1;
      }
      animationFrameId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);
  return (
    <canvas
      ref={canvasRef}
      width={1920}
      height={1080}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}

export default function HomePage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/canvas");
    }
  }, [status, router]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white">
      <BouncingBalls />
      <div className="relative z-10 flex flex-col items-center">
        <h1
          className="text-7xl sm:text-8xl md:text-9xl font-extrabold text-transparent bg-clip-text animate-gradient mb-8 select-none"
          style={{
            backgroundImage:
              "linear-gradient(270deg, #6366f1, #ec4899, #f59e42, #10b981, #6366f1)",
            backgroundSize: "200% 200%",
            animation: "gradientMove 8s ease-in-out infinite",
          }}
        >
          Dots
        </h1>
        <button
          onClick={() => signIn("slack", { callbackUrl: "/" })}
          className="mt-4 px-10 py-4 text-2xl font-bold rounded-lg bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition flex items-center gap-4"
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, padding: 2 }}>
            <svg height="32" width="32" viewBox="0 0 512 512" style={{ display: 'block', height: '2rem', width: '2rem' }} xmlns="http://www.w3.org/2000/svg">
              <g>
                <path d="M122.643,316.682c0,26.596-21.727,48.323-48.321,48.323c-26.593,0-48.319-21.728-48.319-48.323    c0-26.592,21.727-48.318,48.319-48.318h48.321V316.682z" style={{ fill: '#E01E5A' }}/>
                <path d="M146.996,316.682c0-26.592,21.728-48.318,48.321-48.318c26.593,0,48.32,21.727,48.32,48.318V437.68    c0,26.592-21.728,48.319-48.32,48.319c-26.594,0-48.321-21.728-48.321-48.319V316.682z" style={{ fill: '#E01E5A' }}/>
                <path d="M195.317,122.643c-26.594,0-48.321-21.728-48.321-48.321c0-26.593,21.728-48.32,48.321-48.32    c26.593,0,48.32,21.728,48.32,48.32v48.321H195.317L195.317,122.643z" style={{ fill: '#36C5F0' }}/>
                <path d="M195.317,146.997c26.593,0,48.32,21.727,48.32,48.321c0,26.593-21.728,48.318-48.32,48.318H74.321    c-26.593,0-48.319-21.726-48.319-48.318c0-26.595,21.727-48.321,48.319-48.321H195.317L195.317,146.997z" style={{ fill: '#36C5F0' }}/>
                <path d="M389.359,195.318c0-26.595,21.725-48.321,48.32-48.321c26.593,0,48.318,21.727,48.318,48.321    c0,26.593-21.726,48.318-48.318,48.318h-48.32V195.318L389.359,195.318z" style={{ fill: '#2EB67D' }}/>
                <path d="M365.004,195.318c0,26.593-21.728,48.318-48.321,48.318c-26.593,0-48.32-21.726-48.32-48.318    V74.321c0-26.593,21.728-48.32,48.32-48.32c26.594,0,48.321,21.728,48.321,48.32V195.318L365.004,195.318z" style={{ fill: '#2EB67D' }}/>
                <path d="M316.683,389.358c26.594,0,48.321,21.727,48.321,48.321c0,26.592-21.728,48.319-48.321,48.319    c-26.593,0-48.32-21.728-48.32-48.319v-48.321H316.683z" style={{ fill: '#ECB22E' }}/>
                <path d="M316.683,365.005c-26.593,0-48.32-21.728-48.32-48.323c0-26.592,21.728-48.318,48.32-48.318H437.68    c26.593,0,48.318,21.727,48.318,48.318c0,26.596-21.726,48.323-48.318,48.323H316.683z" style={{ fill: '#ECB22E' }}/>
              </g>
            </svg>
          </span>
          with Slack
        </button>
      </div>
      <footer className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 text-gray-500 text-lg font-medium select-none">
        By: Nachu
      </footer>
      <style jsx global>{`
        @keyframes gradientMove {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .animate-gradient {
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }
      `}</style>
    </div>
  );
} 