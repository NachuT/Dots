"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <button
          onClick={() => signIn("slack", { callbackUrl: "/" })}
          className="flex w-full justify-center items-center gap-3 rounded-md bg-[#4A154B] px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-[#3a1039] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A154B]"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 18.956 0a2.528 2.528 0 0 1 2.522 2.522v2.52h-2.522zM18.956 6.313a2.528 2.528 0 0 1 2.522 2.521 2.528 2.528 0 0 1-2.522 2.521h-2.521V8.834h2.521zM15.165 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 20.208 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.521V8.834zM15.165 18.956a2.528 2.528 0 0 1-2.52 2.522A2.528 2.528 0 0 1 10.123 18.956v-2.521h2.522v2.521zM15.165 15.165a2.528 2.528 0 0 1-2.52 2.521 2.528 2.528 0 0 1-2.522-2.521v-2.522h2.522v2.522zM15.165 15.165h2.521v-2.522h-2.521v2.522zM18.956 15.165h2.522a2.528 2.528 0 0 1 2.522 2.521 2.528 2.528 0 0 1-2.522 2.521h-2.522v-2.521z" />
          </svg>
          Sign in with Slack
        </button>
      </div>
    </div>
  );
} 