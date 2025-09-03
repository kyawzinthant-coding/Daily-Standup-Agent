import { Bot } from "lucide-react";

export const TypingIndicator = () => (
  <div className="flex items-center space-x-3 px-4 py-3">
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-600">
      <Bot className="w-4 h-4 text-white" />
    </div>
    <div className="bg-gray-100 rounded-lg px-3 py-2 border">
      <div className="flex items-center space-x-1">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
        <span className="text-sm text-gray-600 ml-2">Typing...</span>
      </div>
    </div>
  </div>
);
