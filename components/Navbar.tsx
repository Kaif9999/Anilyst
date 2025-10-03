"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Brain, Menu, X } from "lucide-react";
import { signIn } from "next-auth/react";
import BackendStatus from "./BackendStatus";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const pathname = usePathname();
  
  // Only show the backend status on main app pages
  const showBackendStatus = pathname?.startsWith('/main');

  // Handle sign in with proper error handling
  const handleSignIn = async () => {
    try {
      // Use direct navigation to signin page instead of signIn()
      window.location.href = "/signin?callbackUrl=" + encodeURIComponent("/dashboard/agent");
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  const handleMobileSignIn = async () => {
    setIsMobileMenuOpen(false);
    try {
      // Use direct navigation to signin page instead of signIn()
      window.location.href = "/signin?callbackUrl=" + encodeURIComponent("/dashboard/agent");
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  return (
    <>
      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-black/90 backdrop-blur-lg z-50 transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden`}
      >
        <div className="p-6">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-6 right-6 p-2 text-white hover:bg-white/10 rounded-lg"
          >
            <X className="w-6 h-6 hover:text-red-500" />
          </button>
          <div className="flex flex-col space-y-8 mt-16">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-semibold text-white hover:text-blue-400 transition-colors"
            >
              Home
            </Link>
            <Link
              href="#features"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-semibold text-white hover:text-blue-400 transition-colors"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-semibold text-white hover:text-blue-400 transition-colors"
            >
              Pricing
            </Link>
            <div className="relative bg-black/10 rounded-lg md:hidden">
              <button
                className="text-2xl font-semibold text-white hover:text-blue-400 transition-colors"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                More
              </button>
              {isDropdownOpen && (
                <div
                  className="absolute top-full mt-2 bg-black shadow-lg rounded-md py-2 transition-all duration-300 ease-in-out border border-1 border-gray-500 radius-3xl"
                  style={{
                    opacity: isDropdownOpen ? 1 : 0,
                    transform: isDropdownOpen
                      ? "translateY(0)"
                      : "translateY(-10px)",
                  }}
                >
                  <Link
                    href="/privacy_policy"
                    className="block px-4 py-2 text-white hover:bg-gray-900"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    href="/refund_policy"
                    className="block px-4 py-2 text-white hover:bg-gray-900"
                  >
                    Refund Policy
                  </Link>
                  <Link
                    href="/terms_conditions"
                    className="block px-4 py-2 text-white hover:bg-gray-900"
                  >
                    Terms & Conditions
                  </Link>
                </div>
              )}
            </div>
            <div className="border-t border-white/10 pt-40">
            
            </div>
            <button
              onClick={handleMobileSignIn}
              className="block w-full py-3 text-center text-xl text-black bg-white hover:bg-green-400 rounded-lg mb-4"
            >
              Sign In
            </button>
            <Link
              href="/signup"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block w-full py-3 text-center text-xl bg-white text-black hover:bg-orange-400 rounded-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Navbar */}
      <nav className="fixed py-8 top-0 md:top-2 left-1/2 -translate-x-1/2 w-[85%] md:w-[85%] max-w-7xl z-40">
        <div className="bg-black backdrop-blur-lg border border-white/20 rounded-2xl">
          <div className="container mx-auto px-4 md:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Logo Area */}
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl md:text-2xl font-bold text-white">
                    Anilyst
                  </span>
                  {showBackendStatus && (
                    <div className="mt-1">
                      <BackendStatus />
                    </div>
                  )}
                </div>
              </Link>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-10">
                <Link
                  href="/"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Home
                </Link>
                <Link
                  href="#features"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="/pricing"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Pricing
                </Link>
                <div className="relative bg-black/10 rounded-lg ">
                  <button
                    className="text-white/80 hover:text-white transition-colors"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    More
                  </button>
                  {isDropdownOpen && (
                    <div
                      className="absolute top-full mt-2 bg-black shadow-lg rounded-md py-2 transition-all duration-300 ease-in-out border border-1 border-gray-500 radius-3xl"
                      style={{
                        opacity: isDropdownOpen ? 1 : 0,
                        transform: isDropdownOpen
                          ? "translateY(0)"
                          : "translateY(-10px)",
                      }}
                    >
                      <Link
                        href="/privacy_policy"
                        className="block px-4 py-2 text-white hover:bg-gray-900"
                      >
                        Privacy Policy
                      </Link>
                      <Link
                        href="/refund_policy"
                        className="block px-4 py-2 text-white hover:bg-gray-900"
                      >
                        Refund Policy
                      </Link>
                      <Link
                        href="/terms_conditions"
                        className="block px-4 py-2 text-white hover:bg-gray-900"
                      >
                        Terms & Conditions
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="hidden md:flex items-center space-x-6">
                <button
                  onClick={handleSignIn}
                  className="px-5 py-2.5 text-white/80 hover:text-white transition-colors"
                >
                  Sign In
                </button>
                <Link
                  href="/signup"
                  className="px-5 py-2.5 bg-white text-gray-900 rounded-xl hover:bg-white/90 transition-colors"
                >
                  Get Started
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Menu className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
