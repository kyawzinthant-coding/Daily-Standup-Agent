/**
 * Flattens Mastra message content.
 * For history messages, reasoning chunks are ignored.
 * For current conversation, all chunks are included.
 */

export function refineMessageContent(message: any, includeReasoning = false) {
  if (Array.isArray(message.content)) {
    return message.content
      .filter((chunk: any) => includeReasoning || chunk.type === "text")
      .map((chunk: any) => chunk.text.trim()) // trim spaces
      .filter(Boolean) // remove empty strings
      .join(" "); // add space between chunks
  }
  return message.content;
}

/**
 * Refines an array of messages for UI display.
 * `isHistory` = true: history conversation, reasoning skipped
 * `isHistory` = false: current conversation, include reasoning
 */
export function refineMessagesForUI(messages: any[], isHistory: boolean) {
  return messages.map((msg) => ({
    ...msg,
    content: refineMessageContent(msg, isHistory),
  }));
}
