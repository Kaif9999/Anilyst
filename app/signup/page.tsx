"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Brain, Mail, Lock, User, AlertCircle } from "lucide-react";
import SignUpForm from "@/components/SignUpForm";

export default function SignUp() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-gray-400">Sign up to get started with Anilyst</p>
          </div>

          <SignUpForm />

          {/* Sign In Link */}
          <p className="mt-6 text-center text-gray-400">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}