import { useState } from "react";

export function useCopyFeedback(duration = 2000) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), duration);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return { copiedKey, copy };
}
