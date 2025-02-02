"use client";

import SignUpForm from "@/components/SignUpForm";
import Link from "next/link";
import { Brain } from "lucide-react";

export default function SignUp() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center space-x-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <span className="text-xl font-bold text-white">Anilyst</span>
      </Link>
      <div className="w-full max-w-md p-8 bg-white/10 rounded-xl backdrop-blur-lg">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Sign Up</h2>
        <SignUpForm />
        <p className="mt-4 text-center text-white/60">
          Already have an account?{" "}
          <Link href="/signin" className="text-white hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
} 