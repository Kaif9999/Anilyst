"use client";

import { useEffect, useState } from "react";
import { Server, CheckCircle, XCircle } from "lucide-react";
import { analysisApi } from "@/app/api/fastapi-analysis/analysis-api";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const BackendStatus = () => {
  const [status, setStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const [message, setMessage] = useState<string>("Checking connection to analytics backend...");

  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await analysisApi.checkHealth();
        if (response.status === "ok") {
          setStatus("connected");
          setMessage("Analytics backend connected and ready");
        } else {
          setStatus("disconnected");
          setMessage("Analytics backend connection issue");
        }
      } catch (error) {
        setStatus("disconnected");
        setMessage("Unable to connect to analytics backend");
        console.error("Backend health check failed:", error);
      }
    };

    checkBackendStatus();
    // Check connection every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors">
            {status === "checking" && (
              <>
                <div className="animate-pulse">
                  <Server className="h-3.5 w-3.5 text-blue-400" />
                </div>
                <span className="text-blue-400">Connecting...</span>
              </>
            )}
            {status === "connected" && (
              <>
                <CheckCircle className="h-3.5 w-3.5 text-green-400" />
                <span className="text-green-400">Backend Ready</span>
              </>
            )}
            {status === "disconnected" && (
              <>
                <XCircle className="h-3.5 w-3.5 text-red-400" />
                <span className="text-red-400">Backend Offline</span>
              </>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p className="font-semibold mb-1">
              {status === "connected" ? "Python Analytics Engine" : "Backend Status"}
            </p>
            <p className="text-xs opacity-90">{message}</p>
            {status === "disconnected" && (
              <p className="text-xs mt-1 text-red-300">
                Some advanced features may be unavailable
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BackendStatus; 