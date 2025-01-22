"use client";

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RainbowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function RainbowButton({ children, className, ...props }: RainbowButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'relative inline-flex items-center px-8 py-4 text-lg font-semibold text-white rounded-full',
        'bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 background-animate',
        'hover:shadow-lg hover:shadow-purple-500/25 transition-shadow duration-300',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-purple-600 before:via-blue-600 before:to-purple-600',
        'before:opacity-0 before:transition-opacity before:rounded-full hover:before:opacity-100',
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}