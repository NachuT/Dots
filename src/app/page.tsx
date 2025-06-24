"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createNoise2D } from "simplex-noise";

function BouncingBalls({ logoRect }: { logoRect: DOMRect | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballsRef = useRef<any[] | null>(null);
  const mousePosRef = useRef({ x: -1000, y: -1000 });
  const animationFrameId = useRef<number | null>(null);
  const noise2D = createNoise2D();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      mousePosRef.current = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    };

    window.addEventListener('mousemove', handleMouseMove);

    let time = 0;
    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx || !ballsRef.current) {
        animationFrameId.current = requestAnimationFrame(draw);
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      time += 0.001;

      for (const ball of ballsRef.current) {
        const dx = mousePosRef.current.x - ball.x;
        const dy = mousePosRef.current.y - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < ball.r) {
          const angle = Math.atan2(dy, dx);
          ball.vx -= Math.cos(angle) * 0.5;
          ball.vy -= Math.sin(angle) * 0.5;
          ball.hue = (ball.hue + 5) % 360;
        }

        const noiseAngle = noise2D(ball.x / 400, ball.y / 400 + time) * Math.PI * 2;
        const force = 0.03;
        ball.vx += Math.cos(noiseAngle) * force;
        ball.vy += Math.sin(noiseAngle) * force;

        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vx *= 0.98;
        ball.vy *= 0.98;

        if (ball.x - ball.r < 0 || ball.x + ball.r > canvas.width) {
          ball.vx *= -0.9;
          ball.x = Math.max(ball.r, Math.min(canvas.width - ball.r, ball.x));
        }
        if (ball.y - ball.r < 0 || ball.y + ball.r > canvas.height) {
          ball.vy *= -0.9;
          ball.y = Math.max(ball.r, Math.min(canvas.height - ball.r, ball.y));
        }

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI);
        ctx.fillStyle = `hsl(${ball.hue}, 80%, 60%)`;
        ctx.globalAlpha = 0.25;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      animationFrameId.current = requestAnimationFrame(draw);
    };

    if (ballsRef.current === null) {
      ballsRef.current = Array.from({ length: 25 }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
        r: 25,
        hue: Math.random() * 360
      }));
    }

    animationFrameId.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={1920}
      height={1080}
      className="fixed inset-0 w-full h-full z-0"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}

export default function HomePage() {
  const { status } = useSession();
  const router = useRouter();
  const logoRef = useRef<HTMLHeadingElement>(null);
  const [logoRect, setLogoRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (logoRef.current) {
      setLogoRect(logoRef.current.getBoundingClientRect());
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/canvas");
    }
  }, [status, router]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white">
      <BouncingBalls logoRect={logoRect} />
      <div className="relative z-10 flex flex-col items-center">
        <h1
          ref={logoRef}
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
        <div className="relative group mt-4">
          <div
            className="absolute -inset-1 bg-gradient-to-r from-red-600 via-yellow-500 to-indigo-600 rounded-xl blur opacity-0 group-hover:opacity-75 transition duration-300"
          ></div>
          <button
            onClick={() => signIn("slack", { callbackUrl: "/" })}
            className="relative px-10 py-4 text-2xl font-bold rounded-xl bg-gray-900 text-white shadow-lg flex items-center gap-3"
          >
            Login with
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
          </button>
        </div>
      </div>
      <footer className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 text-gray-500 text-lg font-medium select-none flex flex-col items-center gap-2">
        <span>By: Nachu</span>
        <a href="https://github.com/NachuT/Dots" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-indigo-500 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.109-.778.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          GitHub
        </a>
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