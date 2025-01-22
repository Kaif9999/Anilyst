"use client";

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = 500;
    const height = canvas.height = 500;
    const dots: { x: number; y: number; size: number; speed: number }[] = [];

    // Create dots
    for (let i = 0; i < 100; i++) {
      dots.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        speed: Math.random() * 2 + 0.5,
      });
    }

    function animate() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, width, height);

      dots.forEach(dot => {
        dot.y -= dot.speed;
        if (dot.y < 0) dot.y = height;

        ctx.fillStyle = 'rgba(147, 197, 253, 0.8)';
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    }

    animate();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1 }}
      className="relative w-full h-full flex items-center justify-center"
    >
      <canvas
        ref={canvasRef}
        className="absolute"
        style={{ width: '100%', height: '100%' }}
      />
    </motion.div>
  );
}