"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";

export default function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/main";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const form = new FormData(e.currentTarget as HTMLFormElement);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      setError("An error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn("google", {
        callbackUrl: "/main",
        redirect: true,
      });
    } catch (error) {
      setError("An error occurred during Google sign in");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}
      <div>
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full p-3 bg-white/10 rounded-lg text-white placeholder:text-white/60"
        />
      </div>
      <div>
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="w-full p-3 bg-white/10 rounded-lg text-white placeholder:text-white/60"
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-white text-black rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50"
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </button>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-black text-white/60">Or continue with</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/10
          hover:bg-white/20 text-white rounded-lg transition-colors"
      >
        <FcGoogle className="w-5 h-5" />
        {isLoading ? "Signing in..." : "Sign in with Google"}
      </button>
    </form>
  );
}
