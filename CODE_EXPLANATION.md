# 📚 Anilyst - Comprehensive Code Explanation

## Table of Contents
1. [Project Overview](#project-overview)
2. [File Structure](#file-structure)
3. [Main Landing Page (app/page.tsx)](#main-landing-page)
4. [Root Layout (app/layout.tsx)](#root-layout)
5. [Type Definitions (types.ts)](#type-definitions)
6. [Navbar Component](#navbar-component)
7. [AI Chat Interface](#ai-chat-interface)
8. [Sidebar Component](#sidebar-component)
9. [Package Dependencies](#package-dependencies)

---

## Project Overview

**Anilyst** is a Next.js-based AI-powered data analysis platform that enables users to:
- Upload CSV, Excel, and PDF files
- Chat with AI about their data using natural language
- Generate interactive visualizations
- Get AI-powered insights, trends, and forecasts

**Tech Stack:**
- **Frontend:** Next.js 16, React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** FastAPI (Python), Next.js API routes
- **AI:** OpenAI, Google Generative AI
- **Database:** Prisma, Pinecone (vector DB)
- **Charts:** Chart.js, react-chartjs-2
- **Auth:** NextAuth.js

---

## File Structure

```
/vercel/sandbox/
├── app/
│   ├── page.tsx              # Main landing page
│   ├── layout.tsx            # Root layout with providers
│   ├── dashboard/
│   │   ├── agent/            # AI chat interface
│   │   ├── visualization/    # Data visualization page
│   │   └── analysis/         # Analysis results page
├── components/
│   ├── Navbar.tsx            # Navigation bar
│   ├── sidebar.tsx           # Sidebar with chat sessions
│   ├── ai-chat-interface.tsx # Main chat interface
│   └── ui/                   # Reusable UI components
├── types.ts                  # TypeScript type definitions
├── package.json              # Dependencies and scripts
└── tailwind.config.ts        # Tailwind CSS configuration
```

---

## Main Landing Page (app/page.tsx)

### Line-by-Line Explanation

```typescript
"use client";
```
**Explanation:** This directive tells Next.js that this component should be rendered on the client side (browser), not server-side. Required for components using React hooks like `useState`, `useEffect`, or browser APIs.

**Example:** Without this, you'd get errors when using `useState` or `window` object.

---

```typescript
import { motion } from "framer-motion";
```
**Explanation:** Imports the `motion` component from Framer Motion library for creating smooth animations.

**Example Usage:**
```typescript
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

---

```typescript
import Link from "next/link";
```
**Explanation:** Next.js optimized Link component for client-side navigation between pages without full page reloads.

**Example:**
```typescript
<Link href="/dashboard">Go to Dashboard</Link>
// Instead of: <a href="/dashboard">Go to Dashboard</a>
```

---

```typescript
import Image from "next/image";
```
**Explanation:** Next.js optimized Image component that automatically optimizes images (lazy loading, responsive sizes, WebP format).

**Example:**
```typescript
<Image 
  src="/logo.png" 
  width={200} 
  height={100} 
  alt="Logo"
/>
```

---

```typescript
import { useState, useEffect } from "react";
```
**Explanation:** 
- `useState`: React hook for managing component state
- `useEffect`: React hook for side effects (API calls, subscriptions, timers)

**Example:**
```typescript
const [count, setCount] = useState(0); // State
useEffect(() => {
  console.log("Component mounted");
}, []); // Runs once on mount
```

---

```typescript
import {
  ChevronRight,
  BarChart2,
  Brain,
  // ... more icons
} from "lucide-react";
```
**Explanation:** Imports icon components from lucide-react library. These are SVG icons that can be styled with CSS.

**Example:**
```typescript
<Brain className="w-6 h-6 text-blue-500" />
// Renders a brain icon, 24px × 24px, blue color
```

---

```typescript
const animationStyles = `
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
`;
```
**Explanation:** CSS keyframe animation definition stored as a string. Creates a "blob" animation that moves and scales an element.

**Example:** Applied to background blobs to create organic, flowing motion effects.

---

```typescript
const mainFeatures = [
  {
    icon: <Cpu className="w-6 h-6" />,
    title: "Smart Data Analysis",
    description: "Just upload your data and let our AI do the hard work..."
  },
  // ... more features
];
```
**Explanation:** Array of objects defining the main features displayed on the landing page. Each object contains an icon component, title, and description.

**Example Usage:**
```typescript
{mainFeatures.map((feature, index) => (
  <div key={index}>
    {feature.icon}
    <h3>{feature.title}</h3>
    <p>{feature.description}</p>
  </div>
))}
```

---

```typescript
export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
```
**Explanation:** 
- `Home` is the main component function
- `isScrolled`: Boolean state tracking if user has scrolled down
- `mousePosition`: Object state tracking mouse cursor position for parallax effects

**Example:** Used to change navbar appearance on scroll and create interactive background effects.

---

```typescript
useEffect(() => {
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 20);
  };
  
  window.addEventListener("scroll", handleScroll);
  
  return () => {
    window.removeEventListener("scroll", handleScroll);
  };
}, []);
```
**Explanation:** 
- Sets up scroll event listener when component mounts
- Updates `isScrolled` state when user scrolls more than 20px
- Cleanup function removes listener when component unmounts (prevents memory leaks)

**Example:** Changes navbar from transparent to solid background after scrolling 20px.

---

```typescript
const handleMouseMove = (e: MouseEvent) => {
  setMousePosition({ x: e.clientX, y: e.clientY });
};
```
**Explanation:** Event handler that captures mouse position and updates state. `e.clientX` and `e.clientY` are the mouse coordinates relative to the viewport.

**Example:** Used to create parallax effect where background blobs move slightly based on mouse position.

---

```typescript
<div className="relative bg-black min-h-screen overflow-hidden">
```
**Explanation:** 
- `relative`: CSS positioning context for absolute children
- `bg-black`: Black background color (Tailwind CSS)
- `min-h-screen`: Minimum height of 100vh (full viewport height)
- `overflow-hidden`: Hides content that extends beyond boundaries

**Example:** Main container that ensures page is at least full screen height with black background.

---

```typescript
<div className="absolute top-[15%] left-[20%] w-96 h-96 bg-purple-600/80 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob"
  style={{
    transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
    transition: 'transform 0.5s ease-out'
  }}
/>
```
**Explanation:** Animated background blob element
- `absolute`: Positioned absolutely within parent
- `top-[15%]`: 15% from top
- `w-96 h-96`: 384px × 384px (24rem)
- `bg-purple-600/80`: Purple with 80% opacity
- `rounded-full`: Perfect circle
- `mix-blend-overlay`: Blending mode for color mixing
- `blur-3xl`: Heavy blur effect
- `animate-blob`: Custom animation
- Inline style: Moves based on mouse position (parallax effect)

**Example:** Creates colorful, animated background blobs that respond to mouse movement.

---

```typescript
<motion.div
  className="text-center"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
>
```
**Explanation:** Framer Motion animated div
- `initial`: Starting state (invisible, 20px down)
- `animate`: End state (fully visible, original position)
- `transition`: Animation takes 0.8 seconds

**Example:** Hero section fades in and slides up when page loads.

---

```typescript
<h1 className="text-4xl py-6 sm:text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-white tracking-tight relative">
  <span className="bg-gradient-to-r from-white via-blue-100 to-white text-transparent bg-clip-text">
    Make Sense of Your Data
  </span>
</h1>
```
**Explanation:** Responsive heading with gradient text
- `text-4xl`: Base size (2.25rem/36px)
- `sm:text-5xl`: 3rem on small screens (640px+)
- `md:text-7xl`: 4.5rem on medium screens (768px+)
- `lg:text-8xl`: 6rem on large screens (1024px+)
- `bg-gradient-to-r`: Gradient from left to right
- `text-transparent bg-clip-text`: Makes text transparent and clips gradient to text shape

**Example:** Creates a large, responsive heading with gradient text effect.

---

```typescript
<Link href="/dashboard/agent">
  <motion.button 
    className="px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-lg font-medium"
    whileHover={{ 
      scale: 1.03,
      boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4)"
    }}
    transition={{ type: "spring", stiffness: 400, damping: 10 }}
  >
    Launch Analyzer <ArrowRight className="w-5 h-5" />
  </motion.button>
</Link>
```
**Explanation:** Animated call-to-action button
- `whileHover`: Scales up 3% and adds shadow on hover
- `transition`: Spring animation (bouncy effect)
- `type: "spring"`: Physics-based animation
- `stiffness: 400`: How "tight" the spring is
- `damping: 10`: How much the spring oscillates

**Example:** Button grows slightly and shows shadow when user hovers, with smooth spring animation.

---

```typescript
{mainFeatures.map((feature, index) => (
  <motion.div
    key={index}
    initial={{ opacity: 0, y: 20 }}
    animate={{ 
      opacity: 1, 
      y: 0,
      transition: { delay: 0.3 + index * 0.1 } 
    }}
  >
```
**Explanation:** Maps over features array and creates animated cards
- `key={index}`: Unique identifier for React list rendering
- `delay: 0.3 + index * 0.1`: Staggered animation (each card appears 0.1s after previous)

**Example:** Feature cards appear one by one with 0.1s delay between each.

---

## Root Layout (app/layout.tsx)

```typescript
import "./globals.css";
```
**Explanation:** Imports global CSS styles that apply to entire application.

---

```typescript
import type { Metadata } from "next";
```
**Explanation:** TypeScript type import for Next.js metadata object.

---

```typescript
export const metadata: Metadata = {
  title: "Anilyst - AI-Powered Data Analysis",
  description: "Transform your data into actionable insights...",
  keywords: ["data analysis", "AI analytics", ...],
  openGraph: {
    title: "Anilyst - AI-Powered Data Analysis",
    images: [{ url: "/landing_page.jpg", width: 1200, height: 630 }],
  },
};
```
**Explanation:** SEO metadata configuration
- `title`: Browser tab title and search engine title
- `description`: Meta description for search engines
- `keywords`: SEO keywords
- `openGraph`: Social media preview (Facebook, LinkedIn)
- `twitter`: Twitter card preview

**Example:** When sharing on Facebook, shows custom image and description.

---

```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
```
**Explanation:** Root layout component that wraps all pages
- `children`: All page content gets passed as children prop
- `React.ReactNode`: TypeScript type for any valid React content

---

```typescript
return (
  <html lang="en" suppressHydrationWarning>
    <head />
    <body className={inter.className}>
      <PostHogProvider>
        <AuthProvider>
          {children}
          <Toaster />
          <PostHogPageView />
        </AuthProvider>
      </PostHogProvider>
    </body>
  </html>
);
```
**Explanation:** HTML structure with providers
- `suppressHydrationWarning`: Prevents warnings during server-to-client hydration
- `PostHogProvider`: Analytics tracking wrapper
- `AuthProvider`: Authentication context (NextAuth)
- `{children}`: Page content inserted here
- `<Toaster />`: Toast notification system
- `<PostHogPageView />`: Page view tracking

**Example:** Every page is wrapped with authentication and analytics automatically.

---

## Type Definitions (types.ts)

```typescript
export type ChartType = 
  | 'bar' 
  | 'line' 
  | 'pie' 
  | 'doughnut' 
  | 'radar' 
  | 'polarArea'
  | 'bubble'
  | 'scatter';
```
**Explanation:** TypeScript union type defining all possible chart types. Provides autocomplete and type safety.

**Example:**
```typescript
const chartType: ChartType = 'bar'; // ✅ Valid
const invalid: ChartType = 'invalid'; // ❌ TypeScript error
```

---

```typescript
export interface ChartDataset {
  label: string;
  data: Array<number | { x: number; y: number; r?: number }>;
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
}
```
**Explanation:** Interface defining structure of chart dataset
- `label`: Dataset name (e.g., "Sales 2024")
- `data`: Array of numbers or coordinate objects
- `?`: Optional properties
- `r?`: Optional radius for bubble charts

**Example:**
```typescript
const dataset: ChartDataset = {
  label: "Revenue",
  data: [100, 200, 300],
  backgroundColor: "rgba(54, 162, 235, 0.8)"
};
```

---

```typescript
export interface AnalyticsResult {
  trends: {
    type: 'increasing' | 'decreasing';
    slope: number;
    confidence: number;
  };
  outliers: {
    indices: number[];
    values: number[];
    zscore: number[];
  };
}
```
**Explanation:** Interface for AI analysis results
- `trends`: Trend direction, slope, and confidence level
- `outliers`: Anomalous data points with z-scores
- `indices`: Array positions of outliers
- `zscore`: Statistical measure of how far from mean

**Example:**
```typescript
const result: AnalyticsResult = {
  trends: { type: 'increasing', slope: 2.5, confidence: 0.95 },
  outliers: { indices: [5, 12], values: [999, 1050], zscore: [3.2, 3.5] }
};
```

---

## Navbar Component

```typescript
"use client";

import { useState, useEffect } from "react";
```
**Explanation:** Client component with React hooks for state management.

---

```typescript
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
const [isDropdownOpen, setIsDropdownOpen] = useState(false);
```
**Explanation:** State for controlling mobile menu and dropdown visibility
- `false`: Initially closed
- `setIsMobileMenuOpen`: Function to update state

**Example:**
```typescript
<button onClick={() => setIsMobileMenuOpen(true)}>
  Open Menu
</button>
```

---

```typescript
const pathname = usePathname();
const showBackendStatus = pathname?.startsWith('/main');
```
**Explanation:** 
- `usePathname()`: Next.js hook to get current URL path
- `?.`: Optional chaining (safe navigation)
- `startsWith('/main')`: Checks if path begins with "/main"

**Example:** Shows backend status indicator only on main app pages, not landing page.

---

```typescript
const handleSignIn = async () => {
  try {
    window.location.href = "/signin?callbackUrl=" + encodeURIComponent("/dashboard/agent");
  } catch (error) {
    console.error("Sign in error:", error);
  }
};
```
**Explanation:** Sign-in handler function
- `async`: Asynchronous function (can use await)
- `encodeURIComponent`: Safely encodes URL parameter
- `try/catch`: Error handling

**Example:** Redirects to sign-in page, then back to dashboard after successful login.

---

```typescript
<div className={`fixed inset-0 bg-black/90 backdrop-blur-lg z-50 transition-transform duration-300 ${
  isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
} md:hidden`}>
```
**Explanation:** Mobile menu with conditional classes
- `fixed inset-0`: Fixed position covering entire screen
- `bg-black/90`: Black with 90% opacity
- `backdrop-blur-lg`: Blurs content behind
- `z-50`: High z-index (appears on top)
- `${...}`: Template literal for conditional class
- `translate-x-0`: Visible position
- `-translate-x-full`: Hidden off-screen
- `md:hidden`: Hidden on medium+ screens (768px+)

**Example:** Slides in from left on mobile when menu button clicked.

---

```typescript
<nav className="fixed py-8 top-0 md:top-2 left-1/2 -translate-x-1/2 w-[85%] md:w-[85%] max-w-7xl z-40">
```
**Explanation:** Centered navbar with responsive positioning
- `left-1/2 -translate-x-1/2`: Centers horizontally
- `w-[85%]`: 85% width (custom value)
- `max-w-7xl`: Maximum width of 80rem (1280px)
- `z-40`: Stacking order

**Example:** Navbar stays centered and responsive across all screen sizes.

---

## AI Chat Interface (components/ai-chat-interface.tsx)

```typescript
import { Chart as ChartJS, CategoryScale, LinearScale, ... } from "chart.js";
import { Bar, Line, Pie, Doughnut, Scatter } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);
```
**Explanation:** Chart.js setup
- Imports chart components and scales
- `register()`: Registers chart types and features globally
- Required before using any charts

**Example:** Enables bar, line, pie, doughnut, and scatter charts throughout the app.

---

```typescript
const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";
```
**Explanation:** Backend API URL configuration
- `process.env.NEXT_PUBLIC_FASTAPI_URL`: Environment variable
- `||`: Fallback to localhost if not set
- `NEXT_PUBLIC_`: Prefix makes it available in browser

**Example:** In production: `https://api.anilyst.com`, in development: `http://localhost:8000`

---

```typescript
interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  analysis_results?: any;
  vector_context_used?: boolean;
}
```
**Explanation:** TypeScript interface for chat messages
- `role`: Either user or AI assistant
- `content`: Message text
- `timestamp`: When message was sent
- `?`: Optional properties
- `analysis_results`: AI analysis data (if any)
- `vector_context_used`: Whether similar past analyses were used

**Example:**
```typescript
const message: Message = {
  role: "user",
  content: "Show me sales trends",
  timestamp: "2026-01-10T18:30:00Z"
};
```

---

```typescript
function useVectorContext(query: string, sessionId: string | null) {
  const [context, setContext] = useState<VectorContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);
```
**Explanation:** Custom React hook for fetching similar past analyses
- `query`: User's question
- `sessionId`: Current chat session ID
- Returns context and loading state

**Example:** Finds similar questions asked before to provide better context to AI.

---

```typescript
useEffect(() => {
  if (!query || query.length < 20 || !sessionId) {
    setContext(null);
    return;
  }
  
  const timer = setTimeout(getContext, 1000);
  return () => clearTimeout(timer);
}, [query, sessionId]);
```
**Explanation:** Debounced context fetching
- Only fetches if query is 20+ characters
- `setTimeout`: Waits 1 second before fetching
- Cleanup: Cancels timer if query changes
- Prevents excessive API calls while user is typing

**Example:** User types "Show me sal..." - waits until they finish typing before searching.

---

```typescript
const normalizeChartData = (chartConfig: any): ChartData | null => {
  if (!chartConfig || typeof chartConfig !== "object") {
    console.error("❌ Invalid chart config");
    return null;
  }
```
**Explanation:** Function to standardize chart data from AI
- Takes various chart formats from AI
- Converts to consistent format for Chart.js
- Returns `null` if invalid

**Example:** AI might return different formats - this normalizes them all.

---

```typescript
const colors = [
  { bg: "rgba(54, 162, 235, 0.8)", border: "rgba(54, 162, 235, 1)" },
  { bg: "rgba(255, 99, 132, 0.8)", border: "rgba(255, 99, 132, 1)" },
  // ... more colors
];
```
**Explanation:** Predefined color palette for charts
- `bg`: Background color with 80% opacity
- `border`: Border color with 100% opacity
- RGBA format: Red, Green, Blue, Alpha (opacity)

**Example:** First dataset gets blue, second gets red, etc.

---

## Sidebar Component

```typescript
const {
  sessions,
  currentSession,
  createSession,
  loadSession,
  deleteSession,
  isLoading,
  refreshSessions,
} = useChatSessions();
```
**Explanation:** Custom hook for managing chat sessions
- `sessions`: Array of all chat sessions
- `currentSession`: Active session
- `createSession`: Function to create new chat
- `loadSession`: Function to load existing chat
- `deleteSession`: Function to delete chat
- `isLoading`: Loading state
- `refreshSessions`: Function to reload sessions list

**Example:** Manages chat history and session switching.

---

```typescript
useEffect(() => {
  const handleTitleUpdate = (event: CustomEvent) => {
    console.log('🔔 Received title update event:', event.detail);
    refreshSessions();
  };
  
  window.addEventListener('chatTitleUpdated', handleTitleUpdate as EventListener);
  return () => {
    window.removeEventListener('chatTitleUpdated', handleTitleUpdate as EventListener);
  };
}, [refreshSessions]);
```
**Explanation:** Listens for custom events
- `CustomEvent`: Browser custom event
- `addEventListener`: Subscribes to event
- `removeEventListener`: Cleanup on unmount
- Refreshes sessions when chat title changes

**Example:** When AI generates a title for a chat, sidebar updates automatically.

---

```typescript
const handleNewChat = async () => {
  const newSession = await createSession();
  if (newSession) {
    router.push(`/dashboard/agent?session=${newSession.id}`);
    router.refresh();
  }
  handleItemClick();
};
```
**Explanation:** Creates new chat session
- `await`: Waits for session creation
- `router.push`: Navigates to new session
- `router.refresh`: Forces page refresh
- `handleItemClick`: Closes mobile menu

**Example:** User clicks "New Chat" button, creates fresh session and navigates to it.

---

## Package Dependencies

### Core Framework
```json
"next": "16.1.0-canary.12"
```
**Explanation:** Next.js framework (React meta-framework)
- Server-side rendering
- File-based routing
- API routes
- Image optimization

---

### UI Libraries
```json
"framer-motion": "^11.0.8"
```
**Explanation:** Animation library for smooth transitions and interactions

**Example:**
```typescript
<motion.div animate={{ x: 100 }} />
```

---

```json
"lucide-react": "^0.344.0"
```
**Explanation:** Icon library with 1000+ SVG icons

**Example:**
```typescript
<Brain className="w-6 h-6" />
```

---

### Data Visualization
```json
"chart.js": "^4.4.7",
"react-chartjs-2": "^5.2.0"
```
**Explanation:** Chart library for creating interactive graphs

**Example:** Bar charts, line charts, pie charts, scatter plots

---

### AI Integration
```json
"openai": "^4.93.0",
"@google/generative-ai": "^0.21.0"
```
**Explanation:** AI model APIs
- OpenAI: GPT models for chat
- Google: Gemini models for analysis

---

### Database
```json
"@prisma/client": "^6.9.0",
"@pinecone-database/pinecone": "^6.1.2"
```
**Explanation:** 
- Prisma: SQL database ORM
- Pinecone: Vector database for semantic search

---

### Authentication
```json
"next-auth": "^4.24.7"
```
**Explanation:** Authentication library for Next.js
- OAuth providers (Google, GitHub)
- Email/password
- Session management

---

### File Processing
```json
"xlsx": "^0.18.5",
"papaparse": "^5.5.2",
"pdfjs-dist": "^4.10.38"
```
**Explanation:** 
- xlsx: Excel file parsing
- papaparse: CSV file parsing
- pdfjs-dist: PDF file parsing

---

## Key Concepts Explained

### 1. Server vs Client Components

**Server Component (default):**
```typescript
// No "use client" directive
export default function Page() {
  return <div>Server rendered</div>
}
```
- Rendered on server
- No JavaScript sent to browser
- Can't use hooks or browser APIs

**Client Component:**
```typescript
"use client";
export default function Page() {
  const [state, setState] = useState(0);
  return <div>Client rendered</div>
}
```
- Rendered in browser
- Can use hooks and browser APIs
- Interactive

---

### 2. Tailwind CSS Classes

```typescript
className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
```
**Breakdown:**
- `px-4`: Padding left/right 1rem (16px)
- `py-2`: Padding top/bottom 0.5rem (8px)
- `bg-blue-500`: Blue background
- `text-white`: White text
- `rounded-lg`: Large border radius
- `hover:bg-blue-600`: Darker blue on hover

---

### 3. TypeScript Interfaces

```typescript
interface User {
  id: string;
  name: string;
  email?: string; // Optional
}

const user: User = {
  id: "123",
  name: "John"
  // email is optional
};
```
**Benefits:**
- Type safety
- Autocomplete
- Catches errors at compile time

---

### 4. React Hooks

**useState:**
```typescript
const [count, setCount] = useState(0);
setCount(count + 1); // Update state
```

**useEffect:**
```typescript
useEffect(() => {
  // Runs after render
  console.log("Component mounted");
  
  return () => {
    // Cleanup
    console.log("Component unmounted");
  };
}, []); // Empty array = run once
```

**Custom Hook:**
```typescript
function useCounter() {
  const [count, setCount] = useState(0);
  const increment = () => setCount(c => c + 1);
  return { count, increment };
}
```

---

### 5. Async/Await

```typescript
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
}
```
**Explanation:**
- `async`: Function returns Promise
- `await`: Waits for Promise to resolve
- `try/catch`: Error handling

---

## Common Patterns

### 1. Conditional Rendering
```typescript
{isLoading ? (
  <Loader />
) : (
  <Content />
)}
```

### 2. List Rendering
```typescript
{items.map((item, index) => (
  <div key={index}>{item.name}</div>
))}
```

### 3. Event Handling
```typescript
<button onClick={() => handleClick(id)}>
  Click me
</button>
```

### 4. Conditional Classes
```typescript
className={`base-class ${isActive ? 'active' : 'inactive'}`}
```

---

## Summary

This codebase demonstrates modern React/Next.js development with:
- ✅ TypeScript for type safety
- ✅ Tailwind CSS for styling
- ✅ Framer Motion for animations
- ✅ Chart.js for data visualization
- ✅ AI integration (OpenAI, Google)
- ✅ Vector database for semantic search
- ✅ Authentication with NextAuth
- ✅ Responsive design
- ✅ Server and client components
- ✅ Custom hooks for reusable logic

Each component is modular, reusable, and follows React best practices.
