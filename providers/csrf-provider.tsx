"use client";

import { useEffect } from "react";
import { getCsrfToken } from "@/lib/api-client";

export function CsrfProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    getCsrfToken().catch(() => {  
    });
  }, []);

  return <>{children}</>;
}
