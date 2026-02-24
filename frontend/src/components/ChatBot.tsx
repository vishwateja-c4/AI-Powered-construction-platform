import React, { useState, useRef, useEffect } from "react";
import { X, Send, Bot, User, Loader2 } from "lucide-react";
import { sendChatMessage } from "../utils/api";
import { useAppStore } from "../store";

export default function ChatBot() {
    const { chatOpen, setChatOpen, chatHistory, addChatMessage, plan, costs } =
        useAppStore();
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    if (!chatOpen) return null;

    const handleSend = async () => {
        const msg = input.trim();
        if (!msg || isLoading) return;

        addChatMessage({ role: "user", content: msg });
        setInput("");
        setIsLoading(true);

        try {
            const context: any = {};
            if (plan) context.plan_summary = plan.summary;
            if (costs) context.total_cost = costs.total_estimated_cost;

            const res = await sendChatMessage({
                message: msg,
                context: Object.keys(context).length > 0 ? context : undefined,
                history: chatHistory.slice(-10), // last 10 messages for context
            });
            addChatMessage({ role: "assistant", content: res.response });
        } catch {
            addChatMessage({
                role: "assistant",
                content: "Sorry, I'm having trouble connecting. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[520px] bg-dark-800 border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-dark-900/50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-dark-900 flex items-center justify-center">
                        <Bot size={18} />
                    </div>
                    <div>
                        <p className="font-semibold text-sm">BuildWise AI</p>
                        <p className="text-xs text-green-400">Online</p>
                    </div>
                </div>
                <button
                    onClick={() => setChatOpen(false)}
                    className="text-gray-400 hover:text-white transition"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {chatHistory.length === 0 && (
                    <div className="text-center text-gray-500 text-sm mt-8">
                        <Bot className="w-10 h-10 mx-auto mb-3 text-gray-600" />
                        <p>Hi! I'm your BuildWise assistant.</p>
                        <p className="mt-1">
                            Ask me about your plan, costs, timeline, or anything
                            construction-related.
                        </p>
                    </div>
                )}
                {chatHistory.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"
                            }`}
                    >
                        {msg.role === "assistant" && (
                            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-1">
                                <Bot size={14} />
                            </div>
                        )}
                        <div
                            className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${msg.role === "user"
                                    ? "bg-primary text-dark-900 rounded-br-sm"
                                    : "bg-white/10 text-gray-200 rounded-bl-sm"
                                }`}
                        >
                            {msg.content}
                        </div>
                        {msg.role === "user" && (
                            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-1">
                                <User size={14} />
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-2 items-center text-gray-400 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Thinking...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/10 p-3">
                <div className="flex items-center gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Ask about your project..."
                        className="flex-grow bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50"
                    />
                    <button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="bg-primary text-dark-900 p-2 rounded-lg hover:brightness-110 transition disabled:opacity-50"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
