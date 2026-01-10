# Code Explanation - Anilyst Application

## Table of Contents
1. [app/layout.tsx](#1-applayouttsx)
2. [app/page.tsx](#2-apppagetsx)
3. [components/Navbar.tsx](#3-componentsnavbartsx)
4. [components/sidebar.tsx](#4-componentssidebartsx)
5. [components/ai-chat-interface.tsx](#5-componentsai-chat-interfacetsx)

---

## 1. app/layout.tsx

### Purpose
This file is the **root layout** of the Next.js application. Think of it as the "wrapper" or "container" that surrounds every page in your app. It's like the frame of a house - every room (page) sits inside this frame.

### Line-by-Line Explanation

```typescript
import "./globals.css";
```
**Explanation**: This imports the global CSS file that contains styling rules applied across the entire application. It's like importing a style guide that every page will follow.

```typescript
import type { Metadata } from "next";
```
**Explanation**: This imports the TypeScript type definition for `Metadata`. Types in TypeScript are like labels that tell the code what kind of data to expect. `Metadata` describes information about your webpage (title, description, etc.).

```typescript
import { Inter } from "next/font/google";
```
**Explanation**: This imports the Inter font from Google Fonts. Next.js has a special way of loading fonts that makes them load faster. Inter is a modern, clean font used throughout the app.

**Real-world example**: It's like choosing a specific font for your entire document in Microsoft Word.

```typescript
import { AuthProvider } from "@/providers/auth-provider";
import { PostHogProvider } from "./providers";
```
**Explanation**: These import "providers" which are special React components that wrap your app and provide functionality to all child components:
- `AuthProvider`: Manages user authentication (login/logout state)
- `PostHogProvider`: Manages analytics tracking (understanding how users use the app)

**Real-world analogy**: Providers are like utility services for a building - once connected, every room (component) can use them.

```typescript
const inter = Inter({ subsets: ["latin"] });
```
**Explanation**: This creates an instance of the Inter font configured to include Latin characters (English alphabet). The `subsets` option tells Next.js which character sets to load.

```typescript
export const metadata: Metadata = {
  title: "Anilyst - AI-Powered Data Analysis",
  description: "Transform your data into actionable insights...",
  // ... more metadata
};
```
**Explanation**: This defines the metadata for your website. This information appears in:
- Browser tabs (title)
- Search engine results (description)
- Social media previews when someone shares your link (openGraph)

**Real-world example**: When you share a link on Twitter, the preview card that appears uses this metadata.

```typescript
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
```
**Explanation**: This is the main layout component. The `children` parameter represents whatever page content should be displayed. 

**Real-world analogy**: Think of this as a picture frame. The frame (layout) stays the same, but the picture inside (children/page content) changes.

```typescript
return (
  <html lang="en" suppressHydrationWarning>
```
**Explanation**: 
- `lang="en"`: Tells browsers and screen readers the content is in English
- `suppressHydrationWarning`: Prevents React from showing warnings when server-rendered HTML doesn't exactly match client-rendered HTML (common with dynamic content)

```typescript
<PostHogProvider>
  <AuthProvider>
    {children}
    <Toaster />
    <PostHogPageView />
  </AuthProvider>
</PostHogProvider>
```
**Explanation**: This is the "provider stack" - each provider wraps the content:
1. `PostHogProvider`: Outermost - provides analytics
2. `AuthProvider`: Provides authentication state
3. `{children}`: The actual page content
4. `<Toaster />`: A component that shows toast notifications (pop-up messages)
5. `<PostHogPageView />`: Tracks page views for analytics

**Real-world analogy**: It's like layers of protection - each layer adds a specific capability to everything inside it.

---

## 2. app/page.tsx

### Purpose
This is the **landing page** (homepage) of the Anilyst application. It's what users see when they first visit the website. It includes hero sections, feature descriptions, animations, and call-to-action buttons.

### Key Concepts

#### State Management with useState
```typescript
const [isScrolled, setIsScrolled] = useState(false);
const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
```
**Explanation**: `useState` is a React Hook that lets components "remember" things. 
- `isScrolled`: Tracks whether the user has scrolled down the page
- `mousePosition`: Tracks the mouse cursor position for interactive effects

**Real-world analogy**: It's like a notepad where React writes down information it needs to remember between renders.

#### useEffect Hook
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
**Explanation**: `useEffect` runs code after the component renders. This specific effect:
1. Creates a function that checks if the user scrolled more than 20 pixels
2. Adds an event listener to detect scrolling
3. Returns a "cleanup" function that removes the listener when the component unmounts

**Real-world analogy**: It's like setting up a security camera (event listener) when you enter a room, and turning it off when you leave (cleanup).

#### Framer Motion Animations
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }}
>
```
**Explanation**: Framer Motion is an animation library. This code:
- `initial`: Starting state (invisible and 20px down)
- `animate`: Ending state (fully visible and in position)
- `transition`: How long the animation takes (0.8 seconds)

**Real-world example**: Like a curtain opening - it starts closed (opacity: 0) and gradually opens (opacity: 1).

#### CSS Animations
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
**Explanation**: This defines a custom CSS animation called "blob" that makes elements move and scale in a flowing pattern. The percentages represent keyframes (specific points in the animation timeline).

**Real-world analogy**: Like choreographing a dance - you define specific positions at specific times, and the browser smoothly transitions between them.

#### Dynamic Mouse Tracking
```typescript
style={{
  transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
  transition: 'transform 0.5s ease-out'
}}
```
**Explanation**: This creates a parallax effect where elements move slightly based on mouse position. The `* 0.02` multiplier makes the movement subtle (2% of mouse movement).

**Real-world example**: Like how your eyes track a moving object - the background elements follow your cursor but at a slower rate, creating depth.

### Component Structure

#### Hero Section
```typescript
<section className="min-h-screen py-10 flex items-center justify-center relative">
```
**Explanation**: 
- `min-h-screen`: Minimum height is the full viewport height
- `flex items-center justify-center`: Centers content both vertically and horizontally
- `relative`: Allows absolute positioning of child elements

#### Feature Cards
```typescript
{mainFeatures.map((feature, index) => (
  <motion.div
    key={index}
    whileHover={{ y: -8 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0, transition: { delay: 0.3 + index * 0.1 } }}
  >
```
**Explanation**: 
- `.map()`: Loops through the `mainFeatures` array and creates a card for each feature
- `key={index}`: React needs unique keys to track which items changed
- `whileHover={{ y: -8 }}`: Moves card up 8px when hovering
- `delay: 0.3 + index * 0.1`: Staggers animations (each card appears 0.1s after the previous)

**Real-world analogy**: Like dominoes falling in sequence - each card animates slightly after the previous one.

---

## 3. components/Navbar.tsx

### Purpose
The navigation bar that appears at the top of every page. It provides links to different sections and handles user authentication.

### State Management

```typescript
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
const [isDropdownOpen, setIsDropdownOpen] = useState(false);
const pathname = usePathname();
```
**Explanation**:
- `isMobileMenuOpen`: Tracks whether the mobile menu is visible
- `isDropdownOpen`: Tracks whether the "More" dropdown is open
- `pathname`: Gets the current URL path (e.g., "/dashboard/agent")

### Authentication Handling

```typescript
const handleSignIn = async () => {
  try {
    window.location.href = "/signin?callbackUrl=" + encodeURIComponent("/dashboard/agent");
  } catch (error) {
    console.error("Sign in error:", error);
  }
};
```
**Explanation**: 
- `async`: Marks the function as asynchronous (can wait for operations to complete)
- `window.location.href`: Redirects the browser to a new URL
- `encodeURIComponent`: Safely encodes the callback URL for use in a query parameter
- `try/catch`: Error handling - if something goes wrong, log the error instead of crashing

**Real-world example**: Like clicking a "Login" button that takes you to a login page, then brings you back to where you were.

### Conditional Rendering

```typescript
const showBackendStatus = pathname?.startsWith('/main');
```
**Explanation**: 
- `pathname?.startsWith()`: The `?` is optional chaining - safely checks if pathname exists before calling startsWith
- Only shows backend status indicator on pages that start with "/main"

### Responsive Design

```typescript
<div className={`fixed inset-0 bg-black/90 backdrop-blur-lg z-50 transition-transform duration-300 ${
  isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
} md:hidden`}>
```
**Explanation**:
- `fixed inset-0`: Covers the entire screen
- `backdrop-blur-lg`: Blurs the background
- `translate-x-0` vs `-translate-x-full`: Slides menu in/out from the left
- `md:hidden`: Hides on medium screens and larger (desktop)

**Real-world analogy**: Like a sliding door - it's off-screen until you open it, then slides into view.

---

## 4. components/sidebar.tsx

### Purpose
The sidebar navigation that shows chat history and user profile. It can collapse/expand and adapts to mobile screens.

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
**Explanation**: `useChatSessions` is a custom React Hook that manages chat session state. It returns:
- `sessions`: Array of all chat sessions
- `currentSession`: The currently active session
- `createSession`: Function to create a new chat
- `loadSession`: Function to load an existing chat
- `deleteSession`: Function to delete a chat
- `isLoading`: Boolean indicating if data is loading
- `refreshSessions`: Function to reload the session list

**Real-world analogy**: Like a remote control for your TV - it gives you buttons (functions) to control different aspects of the TV (chat sessions).

### Event Listeners

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
**Explanation**: This sets up a custom event listener:
1. When a "chatTitleUpdated" event fires anywhere in the app
2. The `handleTitleUpdate` function runs
3. It refreshes the session list to show the new title
4. Cleanup removes the listener when component unmounts

**Real-world example**: Like subscribing to notifications - when someone updates a chat title, you get notified and can update your display.

### Responsive Behavior

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
**Explanation**: 
- Checks if screen width is less than 768px (mobile breakpoint)
- Runs on mount and whenever window is resized
- Updates `isMobile` state accordingly

**Real-world analogy**: Like a thermostat that constantly checks the temperature and adjusts accordingly.

### Navigation with Router

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
**Explanation**:
- `await createSession()`: Waits for a new session to be created
- `router.push()`: Navigates to the new session URL
- `router.refresh()`: Forces a page refresh to load fresh data
- `handleItemClick()`: Closes mobile menu if open

**Real-world example**: Like creating a new document in Word - it creates the file, opens it, and you're ready to start typing.

### Conditional Styling

```typescript
className={`group relative p-2 rounded-lg transition-all duration-200 cursor-pointer ${
  currentSession?.id === chatSession.id
    ? 'bg-white/10'
    : 'hover:bg-white/5 hover:rounded-xl bg-black/10'
}`}
```
**Explanation**: 
- Uses template literals (backticks) to dynamically build className
- If this is the current session, apply `bg-white/10` (highlighted)
- Otherwise, apply hover effects and different background
- `group`: Allows child elements to respond to parent hover state

**Real-world analogy**: Like highlighting the current page in a book's table of contents.

### Truncation Helper

```typescript
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
```
**Explanation**: 
- If text is shorter than maxLength, return it as-is
- Otherwise, cut it at maxLength and add "..."
- Prevents long titles from breaking the layout

**Real-world example**: Like abbreviating a long address - "123 Main Street, Apartment 4B" becomes "123 Main Street, Ap..."

---

## 5. components/ai-chat-interface.tsx

### Purpose
The main chat interface where users interact with the AI. This is the most complex component, handling messages, file uploads, data visualization, and AI responses.

### State Management (Complex)

```typescript
const [messages, setMessages] = useState<Message[]>([]);
const [input, setInput] = useState("");
const [isLoading, setIsLoading] = useState(false);
const [currentFile, setCurrentFile] = useState<FileData | null>(null);
const [vectorContext, setVectorContext] = useState<VectorContext | null>(null);
```
**Explanation**: Multiple state variables track different aspects:
- `messages`: Array of all chat messages
- `input`: Current text in the input field
- `isLoading`: Whether AI is processing a request
- `currentFile`: Information about uploaded data file
- `vectorContext`: AI context from similar past analyses

**Real-world analogy**: Like a dashboard with multiple gauges - each tracks a different aspect of the system.

### Refs for DOM Access

```typescript
const textareaRef = useRef<HTMLTextAreaElement>(null);
const messagesEndRef = useRef<HTMLDivElement>(null);
```
**Explanation**: Refs provide direct access to DOM elements:
- `textareaRef`: Reference to the input textarea
- `messagesEndRef`: Reference to the bottom of the message list (for auto-scrolling)

**Real-world example**: Like bookmarks in a book - they let you quickly jump to specific pages (elements).

### Auto-Scroll Effect

```typescript
useEffect(() => {
  messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);
```
**Explanation**: 
- Runs whenever `messages` array changes
- Scrolls to the bottom of the message list smoothly
- `?.` is optional chaining (only scrolls if ref exists)

**Real-world example**: Like a chat app automatically scrolling to show new messages.

### Session Management

```typescript
useEffect(() => {
  const sessionParam = searchParams.get("session");
  if (sessionParam && sessionParam !== sessionId) {
    setSessionId(sessionParam);
    loadSessionMessages(sessionParam);
  } else if (!sessionParam && !sessionId) {
    const newId = generateSessionId();
    setSessionId(newId);
    router.push(`/dashboard/agent?session=${newId}`, { scroll: false });
  }
}, [searchParams, sessionId]);
```
**Explanation**: This complex effect manages session state:
1. Gets session ID from URL parameters
2. If URL has a session ID different from current, load that session
3. If no session ID exists, create a new one and update URL
4. `{ scroll: false }` prevents page from scrolling when URL updates

**Real-world analogy**: Like opening a specific conversation in a messaging app - it checks the URL to know which conversation to load.

### Message Loading

```typescript
const loadSessionMessages = async (sessionId: string) => {
  try {
    const response = await fetch(`/api/chat/sessions/${sessionId}/messages`);
    if (response.ok) {
      const data = await response.json();
      setMessages(data.messages || []);
      if (data.fileData) {
        setCurrentFile(data.fileData);
      }
    }
  } catch (error) {
    console.error("Error loading messages:", error);
  }
};
```
**Explanation**: 
- `async/await`: Waits for API response before continuing
- `fetch()`: Makes HTTP request to get messages
- `response.ok`: Checks if request succeeded (status 200-299)
- `response.json()`: Parses JSON response
- Updates state with loaded messages and file data

**Real-world example**: Like opening an old email thread - it fetches all previous messages from the server.

### Sending Messages

```typescript
const handleSend = async (isWelcomeScreen: boolean = false) => {
  if (!input.trim() || isLoading) return;

  const userMessage: Message = {
    role: "user",
    content: input.trim(),
  };

  setMessages((prev) => [...prev, userMessage]);
  setInput("");
  setIsLoading(true);

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [...messages, userMessage],
        sessionId,
        hasData: !!currentFile,
        dataContext: currentFile ? {
          fileName: currentFile.name,
          rowCount: currentFile.rowCount,
          columns: currentFile.columns,
        } : null,
      }),
    });

    const data = await response.json();
    
    setMessages((prev) => [...prev, {
      role: "assistant",
      content: data.message,
    }]);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    setIsLoading(false);
  }
};
```
**Explanation**: This function handles sending a message:
1. Validates input (not empty, not already loading)
2. Creates user message object
3. Adds message to state immediately (optimistic update)
4. Clears input field
5. Sets loading state
6. Sends POST request to API with message and context
7. Receives AI response
8. Adds AI response to messages
9. Handles errors gracefully
10. Always sets loading to false (finally block)

**Real-world analogy**: Like sending a text message - you see your message immediately, then wait for a response.

### File Upload Handling

```typescript
const handleUploadComplete = async (fileData: FileData) => {
  setCurrentFile(fileData);
  setIsUploadModalOpen(false);
  
  await fetch(`/api/chat/sessions/${sessionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      hasData: true,
      dataFileName: fileData.name,
      dataFileSize: fileData.size,
    }),
  });
};
```
**Explanation**:
- Receives file data from upload modal
- Updates current file state
- Closes upload modal
- Sends PATCH request to update session with file info

**Real-world example**: Like attaching a file to an email - it uploads, then updates the email to show the attachment.

### Keyboard Shortcuts

```typescript
const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend(false);
  }
};
```
**Explanation**:
- Listens for Enter key press
- If Shift is NOT held, send message
- If Shift IS held, allow new line (default behavior)
- `preventDefault()` stops default Enter behavior

**Real-world example**: Like most chat apps - Enter sends, Shift+Enter adds a new line.

### Markdown Rendering

```typescript
const renderMarkdown = (content: string) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
```
**Explanation**: 
- Converts markdown text to formatted HTML
- `remarkGfm`: Plugin for GitHub-flavored markdown (tables, strikethrough, etc.)
- Custom code component: Detects code blocks and applies syntax highlighting
- `inline`: Distinguishes between inline code (`code`) and code blocks (```code```)
- `SyntaxHighlighter`: Adds color syntax highlighting for code

**Real-world example**: Like how Reddit or Discord format text - **bold**, *italic*, `code`, etc.

### Welcome Screen Logic

```typescript
if (messages.length === 0 && !isLoading) {
  return (
    <div className="h-screen bg-[#0f1112] text-white flex flex-col overflow-hidden relative">
      {/* Welcome screen content */}
    </div>
  );
}
```
**Explanation**:
- If no messages exist and not loading, show welcome screen
- Otherwise, show chat interface
- This is conditional rendering based on state

**Real-world analogy**: Like opening a new document - you see a blank page with suggestions until you start typing.

### Dynamic Textarea Height

```typescript
onInput={(e) => {
  const target = e.target as HTMLTextAreaElement;
  target.style.height = 'auto';
  const newHeight = Math.min(target.scrollHeight, 200);
  target.style.height = `${newHeight}px`;
}}
```
**Explanation**:
- Resets height to auto (collapses to content)
- Gets scroll height (height needed to show all content)
- Limits to maximum 200px
- Sets height to calculated value
- Creates auto-expanding textarea

**Real-world example**: Like the compose box in Gmail - it grows as you type more lines.

### Context-Aware Prompts

```typescript
const contextualPrompts = hasData ? [
  {
    icon: <BarChart3 className="h-5 w-5" />,
    title: "Interactive Dashboard",
    description: "Create a comprehensive dashboard with multiple charts",
    prompt: "Create an interactive dashboard with multiple visualizations...",
  },
  // ... more prompts
] : [
  {
    icon: <Upload className="h-5 w-5" />,
    title: "Upload Data",
    description: "Get started by uploading your data file",
    prompt: "",
  },
  // ... more prompts
];
```
**Explanation**:
- Shows different example prompts based on whether data is uploaded
- If data exists: Show analysis prompts
- If no data: Show upload and info prompts
- Ternary operator: `condition ? valueIfTrue : valueIfFalse`

**Real-world analogy**: Like a GPS that shows different options based on whether you've entered a destination.

### Copy to Clipboard

```typescript
const copyMessage = async (content: string, messageId: string) => {
  try {
    await navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  } catch (error) {
    console.error("Failed to copy:", error);
  }
};
```
**Explanation**:
- Uses browser's clipboard API to copy text
- Sets copied message ID to show checkmark
- After 2 seconds, clears the ID (resets icon)
- Handles errors if clipboard access denied

**Real-world example**: Like the "Copy" button in code examples on websites.

### Transition Effects

```typescript
const [isTransitioning, setIsTransitioning] = useState(false);
const [showTransitionBox, setShowTransitionBox] = useState(false);

const handleSend = async (isWelcomeScreen: boolean = false) => {
  if (isWelcomeScreen) {
    setIsTransitioning(true);
    setShowTransitionBox(true);
    
    setTimeout(() => {
      // Send message
    }, 800);
  }
};
```
**Explanation**:
- Creates smooth transition from welcome screen to chat
- Sets transition state to trigger CSS animations
- Waits 800ms for animation to complete
- Then sends the message

**Real-world analogy**: Like a fade transition between scenes in a movie.

---

## Key React Concepts Explained

### 1. Component Lifecycle
Components go through phases:
- **Mount**: Component appears on screen
- **Update**: State or props change
- **Unmount**: Component removed from screen

`useEffect` lets you run code during these phases.

### 2. State vs Props
- **State**: Data owned by the component (can change)
- **Props**: Data passed from parent (read-only)

**Analogy**: State is like your personal belongings, props are like borrowed items.

### 3. Controlled Components
```typescript
<input value={input} onChange={(e) => setInput(e.target.value)} />
```
React controls the input value through state. Every keystroke updates state, which updates the input.

**Analogy**: Like a puppet - React pulls the strings (controls the value).

### 4. Event Handling
```typescript
onClick={() => handleClick()}
onChange={(e) => handleChange(e)}
```
Functions that run when events occur. The `e` parameter contains event details.

### 5. Conditional Rendering
```typescript
{isLoading ? <Spinner /> : <Content />}
{hasData && <DataDisplay />}
```
Show different UI based on conditions.

---

## Modern Web Development Patterns

### 1. API Routes (Next.js)
```typescript
fetch("/api/chat", {
  method: "POST",
  body: JSON.stringify(data),
})
```
Next.js lets you create API endpoints in the same project as your frontend.

### 2. Server Components vs Client Components
- **Server Components**: Render on server (default in Next.js 13+)
- **Client Components**: Render in browser (marked with `"use client"`)

### 3. TypeScript Benefits
```typescript
interface Message {
  role: "user" | "assistant";
  content: string;
}
```
Types catch errors before runtime and provide autocomplete.

### 4. Async/Await Pattern
```typescript
const data = await fetch(url);
const json = await data.json();
```
Makes asynchronous code look synchronous and easier to read.

### 5. CSS-in-JS with Tailwind
```typescript
className="bg-blue-500 hover:bg-blue-600 rounded-lg p-4"
```
Utility classes instead of writing CSS files.

---

## Summary

The Anilyst application is built with modern React and Next.js patterns:

1. **layout.tsx**: Provides global structure and providers
2. **page.tsx**: Landing page with animations and marketing content
3. **Navbar.tsx**: Navigation with responsive mobile menu
4. **sidebar.tsx**: Chat history with session management
5. **ai-chat-interface.tsx**: Main chat interface with AI integration

Key technologies:
- **React**: Component-based UI
- **Next.js**: Server-side rendering and routing
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **React Markdown**: Formatted AI responses

The app follows modern best practices:
- Responsive design (mobile-first)
- Optimistic UI updates
- Error handling
- Accessibility features
- Performance optimization

Each component is modular and reusable, making the codebase maintainable and scalable.
