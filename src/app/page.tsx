"use client";

import Link from "next/link";
import React, { useEffect, useRef } from "react";

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
        <Link
          href="/login"
          className="mt-4 px-10 py-4 text-2xl font-bold rounded-lg bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition"
        >
          Sign in
        </Link>
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