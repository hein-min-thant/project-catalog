import React, { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ChatAppProps {
  projectContent: string;
  onClose: () => void;
}

const ChatApp: React.FC<ChatAppProps> = ({
  projectContent,
  onClose,
}: ChatAppProps) => {
  const [conversationHistory, setConversationHistory] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);

  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [modelId, setModelId] = useState("deepseek/deepseek-r1-0528:free");
  const [isBackendReachable, setIsBackendReachable] = useState<boolean | null>(
    null
  );
  const conversationEndRef = useRef<HTMLDivElement>(null);

  // Endpoint for the AI model API
  const endpoint = "http://localhost:8080/generate";

  // Check if backend is reachable
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: "test" }],
            modelId: "deepseek/deepseek-chat-v3-0324:free",
          }),
        });

        setIsBackendReachable(response.ok);
      } catch (error) {
        console.error("Backend check failed:", error);
        setIsBackendReachable(false);
      }
    };

    checkBackend();
  }, []);

  // Initialize conversation with system message when component mounts
  useEffect(() => {
    if (projectContent && conversationHistory.length === 0) {
      const systemMessage = {
        role: "user" as const,
        content: `You are an AI assistant. Your Purpose: The following is project content you must use as context to assist user and respond to what they ask:\n\n${projectContent}\n\nIgnore html tags if they are not in code blocks. Always respond with context awareness.`,
      };

      setConversationHistory([systemMessage]);
    }
  }, [projectContent]);

  // Function to handle form submission and AI response
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userInput.trim()) return;

    // Add user message to conversation
    const userMessage = { role: "user" as const, content: userInput };
    const newHistory = [...conversationHistory, userMessage];

    setConversationHistory(newHistory);
    setUserInput("");
    setIsTyping(true);

    try {
      // Prepare messages for the AI API
      const messages = newHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const payload = {
        messages: messages,
        modelId: modelId.trim() || "deepseek/deepseek-chat-v3-0324:free",
      };

      console.log("Sending payload:", payload);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        const errorText = await response.text();

        console.error("Error response body:", errorText);
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorText}`
        );
      }

      const aiResponseText = await response.text();

      console.log("AI Response:", aiResponseText);

      if (!aiResponseText || aiResponseText.trim() === "") {
        throw new Error("Empty response from AI service");
      }

      // Add AI response to conversation
      setConversationHistory((prev) => [
        ...prev,
        { role: "assistant", content: aiResponseText },
      ]);
    } catch (error) {
      console.error("Error fetching AI response:", error);

      setConversationHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, something went wrong: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Auto-scroll to the bottom of the conversation when a new message is added
  useEffect(() => {
    if (conversationEndRef.current) {
      conversationEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversationHistory]);

  return (
    <div className="flex flex-col h-full bg-background dark:bg-zinc-950 shadow-xl">
      <div className="p-4 bg-gray-100 dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Project Assistant
          </h3>
          {isBackendReachable !== null && (
            <div
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                isBackendReachable
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isBackendReachable ? "bg-green-500" : "bg-red-500"
                }`}
              />
              {isBackendReachable ? "Connected" : "Disconnected"}
            </div>
          )}
        </div>

        <Button
          className="rounded-full p-0"
          size="sm"
          variant="flat"
          onPress={onClose}
        >
          <Icon className="text-xl" icon="mdi:close" />
        </Button>
      </div>

      <div className="flex-grow p-4 overflow-y-auto scrollbar-hide space-y-3">
        {conversationHistory.slice(1).map((msg, idx) => (
          <div
            key={idx + 1}
            className={`flex items-start gap-2 max-w-[90%] transition-colors duration-200 ${
              msg.role === "user" ? "ml-auto flex-row-reverse" : ""
            }`}
          >
            <div
              className={`p-3 rounded-lg break-words text-sm shadow-sm ${
                msg.role === "user"
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-gray-200 text-gray-800 rounded-bl-none dark:bg-zinc-700 dark:text-gray-100"
              }`}
            >
              {msg.role === "assistant" ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: marked.parse(msg.content),
                  }}
                  className="prose dark:prose-invert prose-sm"
                />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="typing-indicator self-start p-3 bg-gray-200 text-gray-700 dark:bg-zinc-700 dark:text-gray-100 rounded-lg animate-pulse w-fit">
            AI is thinking...
          </div>
        )}
        <div ref={conversationEndRef} />
      </div>

      <div className="p-4 bg-gray-100 dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 flex flex-col gap-3">
        <form
          className="w-full flex gap-2"
          id="chat-form"
          onSubmit={handleSubmit}
        >
          <Input
            required
            className="flex-grow p-2 text-sm rounded-md border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
          <Button
            className="px-4 py-2 text-sm rounded-md shadow-sm"
            color="primary"
            size="sm"
            type="submit"
          >
            <Icon className="text-lg" icon="mdi:send" />
          </Button>
        </form>

        <div className="model-input-container w-full">
          <Label
            className="text-xs font-medium text-gray-500 dark:text-gray-400"
            htmlFor="model-id"
          >
            Model:
          </Label>
          <Select value={modelId} onValueChange={(value) => setModelId(value)}>
            <SelectTrigger className="w-full text-xs h-8 mt-1 rounded-md border border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent className="dark:bg-zinc-800 dark:text-white">
              <SelectItem value="deepseek/deepseek-r1-0528:free">
                DeepSeek R1
              </SelectItem>
              <SelectItem value="deepseek/deepseek-chat-v3-0324:free">
                DeepSeek Chat
              </SelectItem>
              <SelectItem value="qwen/qwen3-coder:free">Qwen Coder</SelectItem>
              <SelectItem value="cognitivecomputations/dolphin-mistral-24b-venice-edition:free">
                Dolphin Mistral
              </SelectItem>
              <SelectItem value="tngtech/deepseek-r1t2-chimera:free">
                DeepSeek R1T2 Chimera
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Debug section */}
        <div className="flex gap-2">
          <Button
            className="flex-1 text-xs h-8"
            color="secondary"
            size="sm"
            onPress={() => {
              console.log("Current conversation history:", conversationHistory);
              console.log("Project content:", projectContent);
            }}
          >
            Debug Info
          </Button>
          <Button
            className="flex-1 text-xs h-8"
            color="secondary"
            size="sm"
            onPress={async () => {
              try {
                const testPayload = {
                  messages: [
                    { role: "user", content: "Hello, this is a test message." },
                  ],
                  modelId: "deepseek/deepseek-chat-v3-0324:free",
                };

                console.log("Sending test payload:", testPayload);

                const response = await fetch(endpoint, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(testPayload),
                });

                console.log("Test response status:", response.status);
                const responseText = await response.text();

                console.log("Test response body:", responseText);

                if (response.ok) {
                  alert("Test successful! Check console for details.");
                } else {
                  alert(
                    `Test failed with status ${response.status}: ${responseText}`
                  );
                }
              } catch (error) {
                console.error("Test failed:", error);
                alert(
                  `Test failed: ${error instanceof Error ? error.message : "Unknown error"}`
                );
              }
            }}
          >
            Test API
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
