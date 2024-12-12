"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  width?: string;
  delay?: number;
}

export default function Tooltip({
  content,
  children,
  position = "top",
  width = "200px",
  delay = 0.3,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const positionStyles = {
    top: { x: "-50%", y: "-120%" },
    bottom: { x: "-50%", y: "120%" },
    left: { x: "-120%", y: "-50%" },
    right: { x: "120%", y: "-50%" },
  };

  useEffect(() => {
    const updatePosition = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setCoords({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        });
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, ...positionStyles[position] }}
            animate={{ opacity: 1, scale: 1, ...positionStyles[position] }}
            exit={{ opacity: 0, scale: 0.9, ...positionStyles[position] }}
            transition={{ duration: 0.2, delay }}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width,
              zIndex: 50,
            }}
            className="pointer-events-none"
          >
            <div className="bg-gray-900 text-white p-2 rounded-lg shadow-lg text-sm">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
