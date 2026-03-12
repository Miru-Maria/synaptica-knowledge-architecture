import { useState, useCallback } from "react";
import { fetchSSE } from "@/lib/sse";

export function useSSEChat(endpoint: string) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setInitialMessages = useCallback((initial: { role: string; content: string }[]) => {
    setMessages(initial);
  }, []);

  const sendMessage = useCallback(async (content: string, bodyPayload: any = {}) => {
    if (!content.trim()) return;

    // Add user message instantly
    setMessages((prev) => [...prev, { role: "user", content }]);
    setIsTyping(true);
    setError(null);

    // Placeholder for assistant message
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    await fetchSSE(
      endpoint,
      {
        method: "POST",
        body: JSON.stringify({ content, ...bodyPayload }),
      },
      (data) => {
        if (data.content) {
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.role === "assistant") {
              lastMessage.content += data.content;
            }
            return newMessages;
          });
        }
      },
      () => {
        setIsTyping(false);
      },
      (err) => {
        console.error("SSE Error:", err);
        setError("Failed to get response");
        setIsTyping(false);
      }
    );
  }, [endpoint]);

  return { messages, isTyping, error, sendMessage, setInitialMessages };
}
