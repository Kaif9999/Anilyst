import { NextResponse } from "next/server";
import { generateToken } from "@/lib/csrf";
import { CSRF_COOKIE_NAME } from "@/lib/csrf";

export async function GET() {
  const token = generateToken();

  const response = NextResponse.json({ token });
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}
