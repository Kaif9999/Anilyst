# Anilyst Code Explanation - Line by Line

This document provides a comprehensive line-by-line explanation of the Anilyst codebase with examples.

---

## Table of Contents
1. [Package.json - Project Configuration](#packagejson)
2. [Types.ts - TypeScript Type Definitions](#typests)
3. [Tailwind Config - Styling Configuration](#tailwind-config)
4. [Navbar Component](#navbar-component)
5. [Sidebar Component](#sidebar-component)
6. [Home Page (Landing Page)](#home-page)
7. [Agent Page](#agent-page)

---

## Package.json

### Project Metadata
```json
"name": "anilyst1"
```
**Explanation:** The project name identifier used by npm/yarn.
**Example:** When you run `npm install`, this name appears in package-lock.json.

```json
"version": "1.2.2"
```
**Explanation:** Semantic versioning (MAJOR.MINOR.PATCH) - 1.2.2 means major version 1, minor version 2, patch 2.
**Example:** Version 1.2.3 would be the next bug fix, 1.3.0 would be the next feature addition.

```json
"private": true
```
**Explanation:** Prevents accidental publishing to npm registry.
**Example:** If you try `npm publish`, it will fail with an error.

### Scripts Section
```json
"dev": "next dev"
```
**Explanation:** Starts Next.js development server with hot reload.
**Example:** Run `npm run dev` → Server starts at http://localhost:3000

```json
"build": "prisma generate && next build"
```
**Explanation:** Generates Prisma client first, then builds production-ready Next.js app.
**Example:** `npm run build` → Creates `.next` folder with optimized code.

```json
"start": "next start"
```
**Explanation:** Starts production server (must run `build` first).
**Example:** `npm run build && npm start` → Production server on port 3000.

```json
"postinstall": "prisma generate"
```
**Explanation:** Automatically runs after `npm install` to generate Prisma client.
**Example:** When deploying to Vercel, this ensures database client is ready.

### Key Dependencies

```json
"@auth/prisma-adapter": "^2.7.4"
```
**Explanation:** Connects NextAuth.js authentication with Prisma database.
**Example:** Stores user sessions, accounts in PostgreSQL/MySQL via Prisma.

```json
"@google/generative-ai": "^0.21.0"
```
**Explanation:** Google's Gemini AI SDK for natural language processing.
**Example:** Used to analyze data and answer user questions about datasets.

```json
"@pinecone-database/pinecone": "^6.1.2"
```
**Explanation:** Vector database client for storing embeddings.
**Example:** Stores chat history as vectors for semantic search and context retrieval.

```json
"@prisma/client": "^6.9.0"
```
**Explanation:** Auto-generated database client based on schema.
**Example:** `prisma.user.findMany()` to query users table.

```json
"chart.js": "^4.4.7"
```
**Explanation:** JavaScript charting library for data visualization.
**Example:** Creates bar charts, line graphs, pie charts from data.

```json
"framer-motion": "^11.0.8"
```
**Explanation:** Animation library for React components.
**Example:** Smooth page transitions, hover effects, scroll animations.

```json
"next": "16.1.0-canary.12"
```
**Explanation:** React framework with server-side rendering and routing.
**Example:** File-based routing: `app/page.tsx` → `/` route.

```json
"next-auth": "^4.24.7"
```
**Explanation:** Authentication library for Next.js.
**Example:** Google OAuth login, session management, protected routes.

```json
"openai": "^4.93.0"
```
**Explanation:** OpenAI API client for GPT models.
**Example:** Chat completions, embeddings generation for AI features.

```json
"react-chartjs-2": "^5.2.0"
```
**Explanation:** React wrapper for Chart.js.
**Example:** `<Bar data={chartData} />` renders bar chart in React.

```json
"zustand": "^5.0.5"
```
**Explanation:** Lightweight state management library.
**Example:** Global state for chat sessions, user preferences without Redux complexity.

---

## Types.ts

### Chart Type Definition
```typescript
export type ChartType = 
  | 'bar' 
  | 'line' 
  | 'pie'
```
**Explanation:** Union type defining all supported chart types.
**Example:** `const chartType: ChartType = 'bar'` ✅ | `const chartType: ChartType = 'invalid'` ❌

### ChartDataset Interface
```typescript
export interface ChartDataset {
  label: string;
  data: Array<number | { x: number; y: number; r?: number }>;
```
**Explanation:** Defines structure for chart data series.
**Example:**
```typescript
const dataset: ChartDataset = {
  label: "Sales 2024",
  data: [100, 200, 150, 300] // Simple numbers for bar/line
}

// Or for scatter/bubble charts:
const scatterDataset: ChartDataset = {
  label: "Price vs Quantity",
  data: [
    { x: 10, y: 50, r: 5 }, // x=price, y=quantity, r=bubble size
    { x: 20, y: 30, r: 10 }
  ]
}
```

```typescript
backgroundColor?: string | string[];
```
**Explanation:** Optional color(s) for chart elements. Single color or array for multiple bars.
**Example:**
```typescript
backgroundColor: '#3B82F6' // Single blue color
backgroundColor: ['#3B82F6', '#EF4444', '#10B981'] // Different color per bar
```

```typescript
trendline?: {
  type: 'linear' | 'exponential' | 'moving-average';
  data: number[];
  label: string;
  borderColor: string;
};
```
**Explanation:** Optional trendline overlay on chart.
**Example:**
```typescript
trendline: {
  type: 'linear',
  data: [105, 195, 155, 295], // Calculated trend values
  label: 'Trend',
  borderColor: '#FF6384'
}
```

### DataInsight Interface
```typescript
export interface DataInsight {
  type: 'trend' | 'anomaly' | 'correlation' | 'forecast' | 'pattern';
  title: string;
  description: string;
  confidence: number;
  importance: 'high' | 'medium' | 'low';
}
```
**Explanation:** Structure for AI-generated insights about data.
**Example:**
```typescript
const insight: DataInsight = {
  type: 'trend',
  title: 'Increasing Sales Trend',
  description: 'Sales have increased by 25% over the last quarter',
  confidence: 0.89, // 89% confidence
  importance: 'high'
}
```

### AnalyticsResult Interface
```typescript
trends: {
  type: 'increasing' | 'decreasing';
  slope: number;
  confidence: number;
};
```
**Explanation:** Statistical trend analysis results.
**Example:**
```typescript
trends: {
  type: 'increasing',
  slope: 12.5, // Increases by 12.5 units per time period
  confidence: 0.92 // 92% statistical confidence
}
```

```typescript
outliers: {
  indices: number[];
  values: number[];
  zscore: number[];
};
```
**Explanation:** Detected anomalies in data using z-score method.
**Example:**
```typescript
outliers: {
  indices: [5, 12], // Positions in array
  values: [500, 480], // Actual outlier values
  zscore: [3.2, 3.5] // How many std deviations from mean
}
// If data is [100, 110, 105, 500, 108], index 3 (value 500) is outlier
```

```typescript
forecast: {
  values: number[];
  confidence: number;
  range: {
    upper: number[];
    lower: number[];
  };
};
```
**Explanation:** Future predictions with confidence intervals.
**Example:**
```typescript
forecast: {
  values: [320, 340, 360], // Predicted next 3 values
  confidence: 0.85,
  range: {
    upper: [350, 380, 410], // Upper bound (optimistic)
    lower: [290, 300, 310]  // Lower bound (pessimistic)
  }
}
```

```typescript
statistics: {
  basic: {
    mean: number;
    median: number;
    mode: number[];
    stdDev: number;
    variance: number;
    skewness: number;
    kurtosis: number;
  };
```
**Explanation:** Comprehensive statistical measures.
**Example:**
```typescript
// For data: [10, 20, 20, 30, 40]
basic: {
  mean: 24,        // Average: (10+20+20+30+40)/5
  median: 20,      // Middle value when sorted
  mode: [20],      // Most frequent value(s)
  stdDev: 11.4,    // Spread of data
  variance: 130,   // stdDev squared
  skewness: 0.5,   // Asymmetry (positive = right tail)
  kurtosis: -1.2   // Peakedness (negative = flat)
}
```

### TimeSeriesAnalysis Interface
```typescript
seasonality: {
  detected: boolean;
  period: number;
  strength: number;
};
```
**Explanation:** Detects repeating patterns in time-series data.
**Example:**
```typescript
// Monthly sales data showing yearly pattern
seasonality: {
  detected: true,
  period: 12,      // Pattern repeats every 12 months
  strength: 0.75   // Strong seasonal effect (0-1 scale)
}
```

---

## Tailwind Config

### Dark Mode Configuration
```typescript
darkMode: ["class"]
```
**Explanation:** Enables dark mode using CSS class strategy.
**Example:** Add `class="dark"` to `<html>` tag → All dark: variants activate.

### Content Paths
```typescript
content: [
  "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  "./components/**/*.{js,ts,jsx,tsx,mdx}",
  "./app/**/*.{js,ts,jsx,tsx,mdx}",
]
```
**Explanation:** Tells Tailwind where to look for class names to include in final CSS.
**Example:** `className="bg-blue-500"` in `app/page.tsx` → Tailwind includes blue-500 in output.

### Custom Colors
```typescript
colors: {
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
```
**Explanation:** Uses CSS variables for dynamic theming.
**Example:**
```css
/* In globals.css */
:root {
  --background: 0 0% 100%; /* White in light mode */
}
.dark {
  --background: 0 0% 0%; /* Black in dark mode */
}
```
```tsx
<div className="bg-background text-foreground">
  {/* Automatically switches colors based on theme */}
</div>
```

### Border Radius Variables
```typescript
borderRadius: {
  lg: 'var(--radius)',
  md: 'calc(var(--radius) - 2px)',
  sm: 'calc(var(--radius) - 4px)'
}
```
**Explanation:** Consistent border radius system using CSS calc.
**Example:**
```css
--radius: 0.5rem; /* 8px */
```
```tsx
<div className="rounded-lg">  {/* 8px radius */}
<div className="rounded-md">  {/* 6px radius */}
<div className="rounded-sm">  {/* 4px radius */}
```

### Custom Animations
```typescript
animation: {
  rainbow: 'rainbow var(--speed, 2s) infinite linear'
}
```
**Explanation:** Defines reusable animation with customizable speed.
**Example:**
```tsx
<div className="animate-rainbow bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
  {/* Background gradient animates continuously */}
</div>
```

```typescript
keyframes: {
  rainbow: {
    '0%': { 'background-position': '0%' },
    '100%': { 'background-position': '200%' }
  }
}
```
**Explanation:** Defines animation steps for rainbow effect.
**Example:** Moves gradient from left to right creating flowing color effect.

---

## Navbar Component

### Client Component Directive
```typescript
"use client";
```
**Explanation:** Marks component as client-side rendered (needed for interactivity).
**Example:** Required for useState, useEffect, event handlers in Next.js 13+ App Router.

### State Management
```typescript
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
```
**Explanation:** React hook for managing mobile menu visibility.
**Example:**
```typescript
// Initially closed
isMobileMenuOpen = false

// User clicks hamburger icon
setIsMobileMenuOpen(true) → Menu slides in

// User clicks X button
setIsMobileMenuOpen(false) → Menu slides out
```

```typescript
const pathname = usePathname();
```
**Explanation:** Next.js hook to get current URL path.
**Example:**
```typescript
// User on homepage
pathname = '/'

// User on pricing page
pathname = '/pricing'

// Used to conditionally show backend status
const showBackendStatus = pathname?.startsWith('/main');
```

### Sign In Handler
```typescript
const handleSignIn = async () => {
  try {
    window.location.href = "/signin?callbackUrl=" + encodeURIComponent("/dashboard/agent");
  } catch (error) {
    console.error("Sign in error:", error);
  }
};
```
**Explanation:** Redirects user to sign-in page with return URL.
**Example:**
```
User clicks "Sign In" button
→ Redirects to: /signin?callbackUrl=%2Fdashboard%2Fagent
→ After successful login, NextAuth redirects back to /dashboard/agent
```

### Mobile Menu JSX
```tsx
<div className={`fixed inset-0 bg-black/90 backdrop-blur-lg z-50 transition-transform duration-300 ${
  isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
} md:hidden`}>
```
**Explanation:** Full-screen mobile menu with conditional slide animation.
**Example:**
- `fixed inset-0` → Covers entire screen
- `translate-x-0` when open → Menu visible
- `-translate-x-full` when closed → Menu hidden off-screen left
- `md:hidden` → Only shows on mobile (< 768px width)

### Dropdown Menu Logic
```tsx
<button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
  More
</button>
{isDropdownOpen && (
  <div className="absolute top-full mt-2 bg-black shadow-lg rounded-md">
    <Link href="/privacy_policy">Privacy Policy</Link>
  </div>
)}
```
**Explanation:** Toggle dropdown visibility on click.
**Example:**
```
Initial: isDropdownOpen = false → Dropdown hidden
Click "More": setIsDropdownOpen(true) → Dropdown appears
Click again: setIsDropdownOpen(false) → Dropdown disappears
```

### Responsive Navigation
```tsx
<div className="hidden md:flex items-center space-x-10">
  <Link href="/">Home</Link>
  <Link href="#features">Features</Link>
</div>
```
**Explanation:** Desktop navigation hidden on mobile, visible on medium+ screens.
**Example:**
- Mobile (< 768px): `hidden` → Links not shown, hamburger menu instead
- Desktop (≥ 768px): `md:flex` → Links shown horizontally

---

## Sidebar Component

### Suspense Wrapper
```tsx
function SidebarWithSuspense(props: SidebarProps) {
  return (
    <Suspense fallback={<aside>Loading...</aside>}>
      <Sidebar {...props} />
    </Suspense>
  );
}
```
**Explanation:** Wraps component with loading fallback for async operations.
**Example:** While `useSearchParams()` loads, shows loading skeleton instead of blank screen.

### Custom Hook Usage
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
**Explanation:** Custom hook providing chat session management functions.
**Example:**
```typescript
// Create new chat
const newSession = await createSession();
// Result: { id: 'abc123', title: 'New Chat', messages: [] }

// Load existing chat
await loadSession('abc123');
// Fetches messages from database and sets as current

// Delete chat
await deleteSession('abc123');
// Removes from database and updates UI
```

### Event Listener for Title Updates
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
**Explanation:** Listens for custom events to refresh chat list when titles change.
**Example:**
```typescript
// In chat interface, after AI generates title:
window.dispatchEvent(new CustomEvent('chatTitleUpdated', {
  detail: { sessionId: 'abc123', newTitle: 'Sales Analysis Q4' }
}));

// Sidebar receives event → Calls refreshSessions() → Updates chat list
```

### Mobile Detection
```typescript
useEffect(() => {
  const checkIfMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };

  checkIfMobile();
  window.addEventListener('resize', checkIfMobile);
  return () => {
    window.removeEventListener('resize', checkIfMobile);
  };
}, []);
```
**Explanation:** Detects screen size and updates on window resize.
**Example:**
```
Desktop (1920px): isMobile = false → Full sidebar
User resizes to 600px: isMobile = true → Hamburger menu
User rotates tablet: Resize event → Rechecks width
```

### New Chat Handler
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
**Explanation:** Creates new chat session and navigates to it.
**Example:**
```
1. User clicks "New Chat" button
2. createSession() → API call → Database creates record
3. Returns: { id: 'xyz789', title: 'New Chat', createdAt: '2026-01-10' }
4. router.push() → URL becomes /dashboard/agent?session=xyz789
5. router.refresh() → Reloads page data
6. handleItemClick() → Closes mobile menu if open
```

### Chat Session Rendering
```tsx
{sessions.map((chatSession) => (
  <div
    key={chatSession.id}
    onClick={() => handleChatClick(chatSession.id)}
    className={`${
      currentSession?.id === chatSession.id
        ? 'bg-white/10'
        : 'hover:bg-white/5'
    }`}
  >
    <h4>{truncateText(chatSession.title, 25)}</h4>
    <p>{truncateText(chatSession.lastMessage, 35)}</p>
    <span>{formatDate(chatSession.updatedAt)}</span>
  </div>
))}
```
**Explanation:** Renders list of chat sessions with highlighting for active chat.
**Example:**
```typescript
sessions = [
  { id: '1', title: 'Sales Analysis 2024', lastMessage: 'Show me trends', updatedAt: '2026-01-09' },
  { id: '2', title: 'Customer Data', lastMessage: 'What is the average?', updatedAt: '2026-01-08' }
]

// If currentSession.id = '1':
// First chat: bg-white/10 (highlighted)
// Second chat: hover:bg-white/5 (normal)

// truncateText('Sales Analysis 2024', 25) → 'Sales Analysis 2024'
// truncateText('Very long title that exceeds limit', 25) → 'Very long title that ex...'

// formatDate('2026-01-09') → 'Yesterday'
// formatDate('2026-01-03') → '7 days ago'
```

### Delete Chat Handler
```typescript
const handleDeleteChat = async (e: React.MouseEvent, sessionId: string) => {
  e.stopPropagation();
  if (confirm('Are you sure you want to delete this chat?')) {
    await deleteSession(sessionId);
  }
};
```
**Explanation:** Prevents click propagation and confirms before deletion.
**Example:**
```
User clicks delete icon on chat item
→ e.stopPropagation() prevents handleChatClick from firing
→ Browser shows: "Are you sure you want to delete this chat?"
→ User clicks OK: deleteSession() → API call → Removes from DB
→ User clicks Cancel: Nothing happens
```

### Collapsed Sidebar View
```tsx
{isCollapsed && !isMobile && (
  <div className="flex flex-col items-center h-full py-4">
    <div className="w-10 h-10">
      <Image src="/anilyst_logo.svg" alt="Logo" width={25} height={25}/>
    </div>
    <button onClick={handleProfileClick}>
      {/* Profile avatar */}
    </button>
  </div>
)}
```
**Explanation:** Shows minimal sidebar with just logo and avatar when collapsed.
**Example:**
```
Normal sidebar (260px wide):
┌─────────────────┐
│ 🔷 Anilyst      │
│ [+ New Chat]    │
│ 💬 Chat 1       │
│ 💬 Chat 2       │
│ 👤 User Profile │
└─────────────────┘

Collapsed sidebar (64px wide):
┌───┐
│ 🔷 │
│    │
│    │
│ 👤 │
└───┘
```

---

## Home Page (Landing Page)

### Animation Styles Injection
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
**Explanation:** Defines CSS keyframe animation for floating blob effect.
**Example:**
```css
/* Applied to background gradient blobs */
.animate-blob {
  animation: blob 7s infinite;
}

/* Creates organic, flowing movement:
0s: Original position
2.3s: Moves right 30px, up 50px, grows 10%
4.6s: Moves left 20px, down 20px, shrinks 10%
7s: Back to original, repeats
*/
```

### Mouse Position Tracking
```typescript
const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };
  window.addEventListener('mousemove', handleMouseMove);
}, []);
```
**Explanation:** Tracks mouse cursor position for parallax effects.
**Example:**
```typescript
// User moves mouse to position (500, 300)
mousePosition = { x: 500, y: 300 }

// Applied to blob:
style={{
  transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
}}
// Result: translate(10px, 6px) - subtle parallax movement
```

### Animated Background Blobs
```tsx
<div className="absolute top-[15%] left-[20%] w-96 h-96 bg-purple-600/80 rounded-full mix-blend-overlay filter blur-3xl opacity-60 animate-blob" 
  style={{
    transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
  }}
/>
```
**Explanation:** Creates animated gradient blob that follows mouse.
**Example:**
- `w-96 h-96` → 384px × 384px circle
- `bg-purple-600/80` → Purple with 80% opacity
- `blur-3xl` → Heavy blur (48px)
- `mix-blend-overlay` → Blends with other blobs
- `animate-blob` → Floating animation
- Mouse at (1000, 500) → Blob shifts by (20px, 10px)

### Feature Cards with Hover Animation
```tsx
<motion.div
  className="bg-white/5 backdrop-blur-lg rounded-xl p-6"
  whileHover={{ y: -8, transition: { duration: 0.2 } }}
  initial={{ opacity: 0, y: 20 }}
  animate={{ 
    opacity: 1, 
    y: 0,
    transition: { delay: 0.3 + index * 0.1 } 
  }}
>
```
**Explanation:** Framer Motion animations for feature cards.
**Example:**
```
Initial state (page load):
- opacity: 0 (invisible)
- y: 20 (20px below final position)

Animation (staggered by index):
- Card 0: Starts at 0.3s
- Card 1: Starts at 0.4s
- Card 2: Starts at 0.5s
- Card 3: Starts at 0.6s

Each card fades in and slides up

On hover:
- y: -8 (lifts up 8px)
- Duration: 0.2s (quick response)
```

### How It Works Section
```tsx
{howItWorksSteps.map((step, index) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 + index * 0.1 }}
  >
    <div className="absolute -left-5 -top-5 w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
      {step.step}
    </div>
  </motion.div>
))}
```
**Explanation:** Numbered steps with staggered animation.
**Example:**
```
Step 1: Upload Your Data
- Number badge: Gradient circle with "1"
- Appears at 0.2s

Step 2: Instant Visualization
- Number badge: Gradient circle with "2"
- Appears at 0.3s

Step 3: AI-Powered Insights
- Number badge: Gradient circle with "3"
- Appears at 0.4s

Step 4: Ask Questions
- Number badge: Gradient circle with "4"
- Appears at 0.5s
```

### Use Cases with Image Overlay
```tsx
<div className="relative overflow-hidden rounded-xl group h-[350px]">
  <Image src={useCase.image} className="group-hover:scale-110" />
  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
    <div className="transform translate-y-2 group-hover:translate-y-0">
      <h3>{useCase.title}</h3>
    </div>
  </div>
</div>
```
**Explanation:** Image with gradient overlay and hover zoom effect.
**Example:**
```
Normal state:
- Image: scale(1) - normal size
- Title: translateY(2px) - slightly below

Hover state:
- Image: scale(1.1) - zooms in 10%
- Title: translateY(0) - moves to final position
- Transition: 700ms smooth animation

Visual effect: Image zooms while title slides up
```

### Architecture Cards with Expandable Content
```tsx
<div className="max-h-0 group-hover:max-h-72 opacity-0 group-hover:opacity-100 transition-all duration-500">
  <p>{component.detailedDescription}</p>
  {component.highlightPoints.map((point) => (
    <div><CheckCircle /> {point}</div>
  ))}
</div>
```
**Explanation:** Hidden content that expands on hover.
**Example:**
```
Normal state:
- max-h-0: Height collapsed to 0
- opacity-0: Invisible

Hover state:
- max-h-72: Expands to 288px max
- opacity-100: Fully visible
- duration-500: 0.5s smooth expansion

Result: Content smoothly slides down and fades in
```

---

## Agent Page

```typescript
import AgentPage from '@/components/ai-chat-interface';

export default function AIChatPage() {
  return <AgentPage />;
}
```
**Explanation:** Simple wrapper that renders the main AI chat interface component.
**Example:**
```
URL: /dashboard/agent
→ Next.js loads app/dashboard/agent/page.tsx
→ Renders <AgentPage /> component
→ AgentPage contains full chat interface with file upload, messages, visualizations
```

---

## AI Chat Interface Component (Main Component)

### Chart.js Registration
```typescript
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
**Explanation:** Registers Chart.js components globally before use.
**Example:** Without registration, `<Bar />` component would throw error. This enables all chart types.

### Environment Configuration
```typescript
const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000";
```
**Explanation:** Gets FastAPI backend URL from environment variables with fallback.
**Example:**
```bash
# .env.local
NEXT_PUBLIC_FASTAPI_URL=https://api.anilyst.com

# In production: FASTAPI_URL = "https://api.anilyst.com"
# In development: FASTAPI_URL = "http://localhost:8000"
```

### Message Interface
```typescript
interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  analysis_results?: any;
  vector_context_used?: boolean;
  context_summary?: {
    similar_analyses_count: number;
    suggested_sources: string[];
    suggested_analysis_types: string[];
  };
  dataContext?: {
    fileName: string;
    rowCount: number;
    dataType: string;
    columns: string[];
  };
}
```
**Explanation:** Defines structure for chat messages with optional AI analysis data.
**Example:**
```typescript
// User message
const userMsg: Message = {
  role: "user",
  content: "Show me sales trends",
  timestamp: "2026-01-10T14:30:00Z"
}

// AI response with analysis
const aiMsg: Message = {
  role: "assistant",
  content: "Here's the sales trend analysis...",
  timestamp: "2026-01-10T14:30:05Z",
  analysis_results: {
    trend: "increasing",
    growth_rate: 15.5
  },
  vector_context_used: true,
  context_summary: {
    similar_analyses_count: 3,
    suggested_sources: ["Q3_sales.csv", "Q4_sales.csv"],
    suggested_analysis_types: ["forecast", "correlation"]
  },
  dataContext: {
    fileName: "sales_2024.csv",
    rowCount: 1250,
    dataType: "CSV",
    columns: ["Date", "Product", "Revenue", "Quantity"]
  }
}
```

### Vector Context Hook
```typescript
function useVectorContext(query: string, sessionId: string | null) {
  const [context, setContext] = useState<VectorContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 20 || !sessionId) {
      setContext(null);
      return;
    }

    const getContext = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/vector/context", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            session_id: sessionId,
            user_id: "user_123",
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.context && data.context.has_context) {
            setContext(data.context);
          }
        }
      } catch (error) {
        console.error("Error fetching vector context:", error);
        setContext(null);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(getContext, 1000);
    return () => clearTimeout(timer);
  }, [query, sessionId]);

  return { context, isLoading };
}
```
**Explanation:** Custom hook that fetches relevant context from vector database based on user query.
**Example:**
```typescript
// User types: "What were the sales trends in Q4?"
// Hook waits 1 second (debounce)
// If query >= 20 chars, makes API call to Pinecone

// API returns similar past analyses:
context = {
  similar_analyses: [
    {
      id: "abc123",
      score: 0.89, // 89% similarity
      analysis_type: "trend_analysis",
      key_insights: ["15% growth", "Peak in December"],
      session_id: "prev_session_1"
    }
  ],
  suggested_data_sources: ["Q4_2023.csv", "Q4_2024.csv"],
  suggested_analysis_types: ["forecast", "comparison"],
  has_context: true
}

// AI uses this context to provide better answers
```

### Chart Data Normalization
```typescript
const normalizeChartData = (chartConfig: any): ChartData | null => {
  try {
    console.log("🔄 Normalizing chart data:", chartConfig);

    if (!chartConfig || typeof chartConfig !== "object" || Object.keys(chartConfig).length === 0) {
      console.error("❌ Invalid chart config");
      return null;
    }

    if (!chartConfig.type) {
      console.error("❌ Chart missing type field");
      return null;
    }

    const colors = [
      { bg: "rgba(54, 162, 235, 0.8)", border: "rgba(54, 162, 235, 1)" },
      { bg: "rgba(255, 99, 132, 0.8)", border: "rgba(255, 99, 132, 1)" },
      { bg: "rgba(75, 192, 192, 0.8)", border: "rgba(75, 192, 192, 1)" },
      { bg: "rgba(255, 206, 86, 0.8)", border: "rgba(255, 206, 86, 1)" },
      { bg: "rgba(153, 102, 255, 0.8)", border: "rgba(153, 102, 255, 1)" },
      { bg: "rgba(255, 159, 64, 0.8)", border: "rgba(255, 159, 64, 1)" },
    ];
```
**Explanation:** Converts various chart data formats into standardized Chart.js format.
**Example:**
```typescript
// AI might return different formats:

// Format 1: Correct Chart.js format
{
  type: "bar",
  title: "Sales by Month",
  data: {
    labels: ["Jan", "Feb", "Mar"],
    datasets: [{
      label: "Revenue",
      data: [1000, 1500, 1200]
    }]
  }
}
// → Returns as-is with color enhancements

// Format 2: Series format (needs conversion)
{
  type: "line",
  title: "Temperature",
  x: ["Mon", "Tue", "Wed"],
  series: [
    { name: "City A", data: [20, 22, 21] },
    { name: "City B", data: [18, 19, 20] }
  ]
}
// → Converts to:
{
  type: "line",
  title: "Temperature",
  data: {
    labels: ["Mon", "Tue", "Wed"],
    datasets: [
      { label: "City A", data: [20, 22, 21], backgroundColor: "rgba(54, 162, 235, 0.3)", ... },
      { label: "City B", data: [18, 19, 20], backgroundColor: "rgba(255, 99, 132, 0.3)", ... }
    ]
  }
}

// Format 3: Legacy format
{
  type: "pie",
  labels: ["Product A", "Product B"],
  datasets: [{ data: [300, 200] }]
}
// → Converts to correct nested structure
```

### Color Application Logic
```typescript
datasets: chartConfig.data.datasets.map((ds: any, idx: number) => ({
  ...ds,
  backgroundColor: ds.backgroundColor || 
    (chartConfig.type === "bar"
      ? colors[idx % colors.length].bg
      : colors[idx % colors.length].bg.replace("0.8", "0.3")),
  borderColor: ds.borderColor || colors[idx % colors.length].border,
  borderWidth: ds.borderWidth || 3,
  pointRadius: chartConfig.type === "scatter" ? 6 : 4,
  pointHoverRadius: chartConfig.type === "scatter" ? 8 : 6,
  pointBackgroundColor: colors[idx % colors.length].border,
  pointBorderColor: "#ffffff",
  pointBorderWidth: 2,
  tension: 0.4,
  fill: chartConfig.type === "area" || ds.fill,
}))
```
**Explanation:** Applies consistent styling to chart datasets with type-specific adjustments.
**Example:**
```typescript
// For bar chart (dataset index 0):
backgroundColor: "rgba(54, 162, 235, 0.8)" // Solid blue
borderColor: "rgba(54, 162, 235, 1)" // Darker blue border
borderWidth: 3

// For line chart (dataset index 0):
backgroundColor: "rgba(54, 162, 235, 0.3)" // Transparent blue (0.8 → 0.3)
borderColor: "rgba(54, 162, 235, 1)"
tension: 0.4 // Smooth curves

// For scatter chart:
pointRadius: 6 // Larger points
pointHoverRadius: 8 // Even larger on hover
pointBackgroundColor: "rgba(54, 162, 235, 1)"
pointBorderColor: "#ffffff" // White outline
pointBorderWidth: 2

// For area chart:
fill: true // Fill area under line
backgroundColor: "rgba(54, 162, 235, 0.3)" // Transparent fill

// Multiple datasets cycle through colors:
// Dataset 0: Blue
// Dataset 1: Red
// Dataset 2: Teal
// Dataset 3: Yellow
// Dataset 4: Purple
// Dataset 5: Orange
// Dataset 6: Blue again (idx % 6)
```

### Series Format Conversion
```typescript
if ((chartConfig.x || chartConfig.labels) && chartConfig.series) {
  console.log("🔧 Converting series format to correct format");

  const xLabels = chartConfig.x || chartConfig.labels || [];
  const series = chartConfig.series || [];

  if (!Array.isArray(xLabels) || !Array.isArray(series) || series.length === 0) {
    console.error("❌ Invalid x labels or series");
    return null;
  }

  return {
    type: chartConfig.type,
    title: chartConfig.title || "Chart",
    data: {
      labels: xLabels,
      datasets: series.map((s: any, idx: number) => {
        const seriesData = s.data || s.y || [];
        return {
          label: s.name || `Series ${idx + 1}`,
          data: seriesData,
          backgroundColor: chartConfig.type === "bar"
            ? colors[idx % colors.length].bg
            : colors[idx % colors.length].bg.replace("0.8", "0.3"),
          borderColor: colors[idx % colors.length].border,
          borderWidth: 3,
          pointRadius: chartConfig.type === "scatter" ? 6 : 4,
          pointHoverRadius: chartConfig.type === "scatter" ? 8 : 6,
          pointBackgroundColor: colors[idx % colors.length].border,
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          tension: 0.4,
          fill: chartConfig.type === "area",
        };
      }),
    },
  };
}
```
**Explanation:** Handles alternative chart data format where series are separate from labels.
**Example:**
```typescript
// Input from AI:
{
  type: "line",
  title: "Stock Prices",
  x: ["Jan", "Feb", "Mar", "Apr"],
  series: [
    { name: "AAPL", data: [150, 155, 152, 160] },
    { name: "GOOGL", y: [2800, 2850, 2900, 2950] }, // Note: uses 'y' instead of 'data'
    { data: [100, 105, 103, 108] } // No name provided
  ]
}

// Output (normalized):
{
  type: "line",
  title: "Stock Prices",
  data: {
    labels: ["Jan", "Feb", "Mar", "Apr"],
    datasets: [
      {
        label: "AAPL",
        data: [150, 155, 152, 160],
        backgroundColor: "rgba(54, 162, 235, 0.3)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 3,
        tension: 0.4,
        fill: false
      },
      {
        label: "GOOGL",
        data: [2800, 2850, 2900, 2950],
        backgroundColor: "rgba(255, 99, 132, 0.3)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 3,
        tension: 0.4,
        fill: false
      },
      {
        label: "Series 3", // Auto-generated label
        data: [100, 105, 103, 108],
        backgroundColor: "rgba(75, 192, 192, 0.3)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 3,
        tension: 0.4,
        fill: false
      }
    ]
  }
}
```

---

## Summary

This codebase demonstrates:

1. **Modern React Patterns**: Client/server components, hooks, suspense
2. **Type Safety**: Comprehensive TypeScript interfaces
3. **Responsive Design**: Mobile-first with Tailwind CSS
4. **Smooth Animations**: Framer Motion for professional UX
5. **State Management**: Zustand for global state, React hooks for local state
6. **Authentication**: NextAuth.js with Prisma adapter
7. **AI Integration**: OpenAI and Google Gemini APIs
8. **Data Visualization**: Chart.js with React wrapper
9. **Vector Search**: Pinecone for semantic chat history
10. **Data Normalization**: Robust handling of multiple chart data formats
11. **Debouncing**: Optimized API calls with timeout-based debouncing
12. **Error Handling**: Comprehensive validation and fallback mechanisms

Each component is modular, reusable, and follows React best practices with proper error handling and loading states.

---

## Key Patterns Used

### 1. Custom Hooks Pattern
```typescript
// Encapsulates complex logic
const { context, isLoading } = useVectorContext(query, sessionId);
```

### 2. Debouncing Pattern
```typescript
// Prevents excessive API calls
const timer = setTimeout(getContext, 1000);
return () => clearTimeout(timer);
```

### 3. Data Normalization Pattern
```typescript
// Handles multiple input formats
const normalized = normalizeChartData(rawData);
```

### 4. Conditional Rendering Pattern
```tsx
{isLoading && <Loader />}
{error && <ErrorMessage />}
{data && <Content />}
```

### 5. Environment Configuration Pattern
```typescript
// Flexible deployment configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
```

This architecture ensures maintainability, scalability, and excellent developer experience.
