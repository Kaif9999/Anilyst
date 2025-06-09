"use client";

import { Inter } from "next/font/google";
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ["latin"] });

export default function AgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className=" overflow-hidden">
      {children}
    </div>
  );
}
