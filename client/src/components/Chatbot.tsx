import { useState, useEffect, useRef } from "react";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    ts: number;
}

function ChatBot({
    endpoint = "http://localhost:8080/api/chat",
    welcomeMessage = "Xin chào! Mình có thể hỗ trợ bạn về chính sách, điều khoản, hủy/hoàn tour.",
}: { endpoint?: string; welcomeMessage?: string }) {
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>(() => {
        const cached = localStorage.getItem("tour_chat_messages");
        return cached
            ? JSON.parse(cached)
            : [{ id: crypto.randomUUID(), role: "assistant", content: welcomeMessage, ts: Date.now() }];
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null); setMessages

    useEffect(() => {
        localStorage.setItem("tour_chat_messages", JSON.stringify(messages));
        setTimeout(scrollToBottom, 50);
    }, [messages]);

    useEffect(() => {
        if (open) setTimeout(scrollToBottom, 50);
    }, [open]);

    const scrollToBottom = () => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    };

    const sendMessage = async (text?: string) => {
        const content = (text ?? input).trim();
        if (!content || loading) return;
        setError("");
        setLoading(true);
        const userMsg: Message = { id: crypto.randomUUID(), role: "user", content, ts: Date.now() };
        setMessages(prev => { const updated = [...prev, userMsg]; setTimeout(scrollToBottom, 50); return updated; });
        setInput("");
        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: content }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const reply = data.reply ?? "Xin lỗi, hiện chưa có phản hồi.";
            setMessages(prev => {
                const updated = [
                    ...prev,
                    { id: crypto.randomUUID(), role: "assistant" as "assistant", content: reply, ts: Date.now() }
                ];
                setTimeout(scrollToBottom, 50);
                return updated;
            });
        } catch (e) {
            setError("Không thể kết nối máy chủ. Vui lòng kiểm tra endpoint hoặc thử lại sau.");
            setMessages(prev => {
                const updated = [
                    ...prev,
                    { id: crypto.randomUUID(), role: "assistant" as const, content: "Mình đang gặp chút trục trặc kết nối. Bạn có thể thử lại hoặc để lại thông tin liên hệ nhé!", ts: Date.now() }
                ];
                setTimeout(scrollToBottom, 50);
                return updated;
            });
        } finally {
            setLoading(false);
        }
    };

    const resetChat = () => {
        setMessages([{ id: crypto.randomUUID(), role: "assistant" as const, content: welcomeMessage, ts: Date.now() }]);
    };

    const Bubble = ({ role, content }: { role: "user" | "assistant"; content: string }) => (
        <div className={`w-full flex ${role === "user" ? "justify-end" : "justify-start"}`}>
            <div
                className={`max-w-[80%] rounded-3xl px-5 py-3 text-base leading-relaxed shadow-lg transition-all duration-200 ${role === "user" ? "bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-br-none border-2 border-sky-400" : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"}`}
                style={{ boxShadow: role === "user" ? "0 2px 12px 0 rgba(14,165,233,0.15)" : "0 2px 12px 0 rgba(0,0,0,0.06)" }}
            >
                {content}
            </div>
        </div>
    );

    return (
        <div className="fixed z-[9999] bottom-6 right-6">
            {/* Floating button */}
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    aria-label="Open Chat"
                    className="rounded-full shadow-2xl px-6 py-4 text-white font-bold flex items-center gap-3 text-lg bg-gradient-to-br from-sky-500 to-blue-600 hover:scale-105 active:scale-95 transition-all duration-200"
                    style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)" }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-6 h-6"
                    >
                        <path d="M7 8h10M7 12h6m-8 8l4-4h8a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5H7A5 5 0 0 0 2 7v4a5 5 0 0 0 5 5h.172L5 20z" />
                    </svg>
                </button>
            )}

            {/* Chat panel */}
            {open && (
                <div className="w-[380px] sm:w-[420px] h-[600px] bg-gradient-to-br from-sky-100 to-blue-50 rounded-3xl shadow-2xl overflow-hidden flex flex-col border-2 border-sky-200 animate-fadeIn">
                    {/* Header */}
                    <div
                        className="px-6 py-4 flex items-center justify-between bg-gradient-to-r from-sky-500 to-blue-600 shadow-md"
                    >
                        <div className="flex items-center gap-3 text-white">
                            <span className="text-xs bg-white/30 rounded-full px-2 py-0.5 font-semibold">Hỗ trợ khách hàng</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={resetChat} className="text-white/90 hover:text-white text-xs border border-white/40 rounded-full px-3 py-1 font-semibold transition-all duration-150 hover:bg-white/10" title="Làm mới hội thoại">Reset</button>
                            <button onClick={() => setOpen(false)} className="text-white/90 hover:text-white text-lg font-bold px-2" aria-label="Close Chat" title="Đóng">✕</button>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-1 flex flex-col min-h-0">
                        {/* Suggestions */}
                        <div className="px-6 py-3 border-b border-sky-100 bg-white/80 backdrop-blur-sm flex-shrink-0">
                            <div className="text-xs text-sky-600 mb-2 font-semibold">Gợi ý nhanh</div>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => sendMessage("Chính sách hủy tour")} className="text-xs rounded-full border border-sky-200 bg-sky-50 px-4 py-1 hover:bg-sky-100 font-medium text-sky-700 transition-all duration-150">Chính sách hủy tour</button>
                                <button onClick={() => sendMessage("Điều khoản đặt tour")} className="text-xs rounded-full border border-sky-200 bg-sky-50 px-4 py-1 hover:bg-sky-100 font-medium text-sky-700 transition-all duration-150">Điều khoản đặt tour</button>
                                <button onClick={() => sendMessage("Chính sách hoàn tiền")} className="text-xs rounded-full border border-sky-200 bg-sky-50 px-4 py-1 hover:bg-sky-100 font-medium text-sky-700 transition-all duration-150">Chính sách hoàn tiền</button>
                                <button onClick={() => sendMessage("Quy định đặt phòng")} className="text-xs rounded-full border border-sky-200 bg-sky-50 px-4 py-1 hover:bg-sky-100 font-medium text-sky-700 transition-all duration-150">Quy định đặt phòng</button>
                                <button onClick={() => sendMessage("Chính sách hủy phòng và hoàn tiền")} className="text-xs rounded-full border border-sky-200 bg-sky-50 px-4 py-1 hover:bg-sky-100 font-medium text-sky-700 transition-all duration-150">Chính sách hủy phòng và hoàn tiền</button>
                            </div>
                        </div>
                        {/* Messages */}
                        <div
                            ref={scrollRef}
                            className="flex-1 px-4 py-4 space-y-3 bg-transparent overflow-y-auto scrollbar-thin scrollbar-thumb-sky-400 scrollbar-track-sky-100 hover:scrollbar-thumb-sky-500 transition-all duration-200 min-h-0"
                        >
                            {messages.map(m => <Bubble key={m.id} role={m.role} content={m.content} />)}
                            {loading && (
                                <div className="w-full flex justify-start">
                                    <div className="bg-white border border-sky-100 rounded-3xl px-5 py-3 text-base shadow flex items-center gap-2 animate-pulse">
                                        <span className="inline-flex h-2 w-2 rounded-full bg-sky-300 animate-bounce" />
                                        <span className="inline-flex h-2 w-2 rounded-full bg-sky-300 animate-bounce [animation-delay:150ms]" />
                                        <span className="inline-flex h-2 w-2 rounded-full bg-sky-300 animate-bounce [animation-delay:300ms]" />
                                        <span className="text-sky-500 text-xs ml-2">Đang soạn…</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Input area */}
                        <div className="p-4 pt-2 border-t border-sky-100 bg-white/90 backdrop-blur-sm flex-shrink-0 w-full">
                            {error && <div className="text-[12px] text-red-500 mb-2 font-semibold">{error}</div>}
                            <div className="flex items-end gap-3">
                                <textarea
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="Nhập câu hỏi về chính sách, điều khoản... (Enter để gửi, Shift+Enter xuống dòng)"
                                    className="flex-1 resize-none max-h-40 min-h-[48px] px-4 py-2 rounded-2xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-300 bg-sky-50 text-base shadow-sm"
                                    onKeyDown={e => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            sendMessage(input);
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => sendMessage(input)}
                                    disabled={loading || !input.trim()}
                                    className="rounded-2xl px-5 py-2 text-white font-bold shadow bg-gradient-to-br from-sky-500 to-blue-600 disabled:opacity-60 hover:scale-105 active:scale-95 transition-all duration-200"
                                    style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)" }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 inline-block mr-1">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                    Gửi
                                </button>
                            </div>
                            <div className="text-[11px] text-sky-500 mt-2 font-medium">Chỉ hỗ trợ thông tin về chính sách, điều khoản, hủy/hoàn tour và phòng.</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ChatBot;