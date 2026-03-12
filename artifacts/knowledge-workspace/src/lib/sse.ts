/**
 * Utility for consuming Server-Sent Events from POST requests
 */
export async function fetchSSE(
  url: string,
  options: RequestInit,
  onData: (data: any) => void,
  onDone: () => void,
  onError: (error: Error) => void
) {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    if (!res.body) {
      throw new Error("No response body");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        onDone();
        break;
      }
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || ""; // Keep the last incomplete chunk

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const dataStr = line.slice(6);
          if (dataStr.trim() === "[DONE]") {
            continue;
          }
          try {
            const data = JSON.parse(dataStr);
            if (data.done) {
              onDone();
            } else {
              onData(data);
            }
          } catch (e) {
            console.error("Error parsing SSE data string:", dataStr, e);
          }
        }
      }
    }
  } catch (error) {
    onError(error as Error);
  }
}
