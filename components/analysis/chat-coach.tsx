import { useState, useRef, useEffect } from "react";
import { AnalysisResultType } from "@/types";
import { SendHorizontal, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ChatCoachProps {
    data: AnalysisResultType;
}

type Message = {
    role: "user" | "assistant";
    content: string;
};

const parseInlineStyles = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={idx} className="font-bold">{part.slice(2, -2)}</strong>;
        }
        return <span key={idx}>{part}</span>;
    });
};

const renderMarkdown = (text: string) => {
    const paragraphs = text.split('\n\n');
    
    return (
        <div className="flex flex-col gap-3">
            {paragraphs.map((paragraph, pIdx) => {
                const lines = paragraph.split('\n');
                return (
                    <div key={pIdx} className="flex flex-col gap-1">
                        {lines.map((line, lIdx) => {
                            const trimmedLine = line.trim();
                            const isListItem = trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ');
                            const isNumberedList = /^\d+\.\s/.test(trimmedLine);
                            
                            let content = trimmedLine;
                            if (isListItem) content = trimmedLine.substring(2);
                            else if (isNumberedList) content = trimmedLine.replace(/^\d+\.\s/, '');

                            const parsedLine = parseInlineStyles(content);

                            if (isListItem || isNumberedList) {
                                return (
                                    <div key={lIdx} className="flex gap-2 items-start">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0" />
                                        <span>{parsedLine}</span>
                                    </div>
                                );
                            }

                            return <div key={lIdx} className={trimmedLine === '' ? 'h-2' : ''}>{parsedLine}</div>;
                        })}
                    </div>
                );
            })}
        </div>
    );
};

const ChatCoach: React.FC<ChatCoachProps> = ({ data }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content: "Hi there! I'm your AI Speech Coach. I've reviewed your presentation analysis. What would you like to work on first?",
        }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");
        
        const newMessages: Message[] = [
            ...messages,
            { role: "user", content: userMsg }
        ];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: newMessages,
                    context: data,
                }),
            });

            if (!response.ok) throw new Error("Failed to send message");

            const result = await response.json();
            
            setMessages([
                ...newMessages,
                { role: "assistant", content: result.text }
            ]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages([
                ...newMessages,
                { role: "assistant", content: "Sorry, I encountered an error answering your question. Please try again." }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-card rounded-2xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b bg-muted/30 flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">AI Speech Coach</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {messages.map((msg, idx) => (
                    <div 
                        key={idx} 
                        className={cn(
                            "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
                            msg.role === "user" 
                                ? "bg-primary text-primary-foreground ml-auto rounded-tr-sm" 
                                : "bg-muted text-foreground mr-auto rounded-tl-sm flex flex-col gap-2"
                        )}
                    >
                        {msg.role === "user" ? msg.content : renderMarkdown(msg.content)}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex max-w-[85%] rounded-2xl px-4 py-3 text-sm bg-muted text-foreground mr-auto rounded-tl-sm items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Thinking...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-muted/30 border-t flex gap-2">
                <Input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about your feedback..."
                    className="flex-1 rounded-full bg-background"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSend();
                    }}
                    disabled={isLoading}
                />
                <Button 
                    size="icon" 
                    className="rounded-full shrink-0" 
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                >
                    <SendHorizontal className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};

export default ChatCoach;