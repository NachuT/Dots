"use client";

import { signIn } from "next-auth/react";
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

export default function LoginPage() {
  return null;
} 