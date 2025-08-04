import { useState, useRef } from "react";
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/chat/expandable-chat"; // Adjust import path
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatBubbleTimestamp,
} from "@/components/ui/chat/chat-bubble";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: string;
}

export default function ChatUI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! How can I help you today?",
      sender: "bot",
      timestamp: new Date().toLocaleTimeString(),
    },
  ]);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!inputRef.current || !inputRef.current.value.trim()) return;

    const userMessage = inputRef.current.value.trim();
    inputRef.current.value = "";

    const newMessage: Message = {
      id: messages.length + 1,
      text: userMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, newMessage]);

    // Simulate bot response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          text: "Thanks for your message. We'll get back to you shortly.",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }, 1000);
  };

  return (
    <ExpandableChat size="md" position="bottom-right" icon={<MessageCircle />}>
      <ExpandableChatHeader>
        <h4 className="font-semibold text-lg">Chat with Support</h4>
      </ExpandableChatHeader>

      <ExpandableChatBody>
        <ChatMessageList>
          {messages.map((msg) => (
            <ChatBubble key={msg.id} variant={msg.sender === "user" ? "sent" : "received"}>
              <ChatBubbleAvatar
                src={msg.sender === "bot" ? "/bot-avatar.png" : undefined}
                fallback={msg.sender === "bot" ? "B" : "U"}
              />
              <div>
                <ChatBubbleMessage variant={msg.sender === "user" ? "sent" : "received"}>
                  {msg.text}
                </ChatBubbleMessage>
                <ChatBubbleTimestamp timestamp={msg.timestamp} />
              </div>
            </ChatBubble>
          ))}
        </ChatMessageList>
      </ExpandableChatBody>

      <ExpandableChatFooter>
        <div className="flex items-end space-x-2">
          <ChatInput ref={inputRef} placeholder="Type a message..." />
          <Button onClick={handleSend}>Send</Button>
        </div>
      </ExpandableChatFooter>
    </ExpandableChat>
  );
}
