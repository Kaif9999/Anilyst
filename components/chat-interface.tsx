"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

export default function ChatInterface() {
  const [input, setInput] = useState("");
  const [showResponse, setShowResponse] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      // Handle chat submission logic here
      console.log("Submitting:", input);
      setShowResponse(true);
      setInput("");
    }
  };

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-xl font-semibold">Ask a Question</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Enter your question here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button type="submit">
          <Send className="mr-2 h-4 w-4" /> Send
        </Button>
      </form>
      {showResponse && (
        <Card className="p-4 mt-4 transition-all duration-300 ease-in-out transform translate-y-0 opacity-100">
          <p>This is where the AI response will be displayed.</p>
        </Card>
      )}
    </div>
  );
}
