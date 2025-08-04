import { useEffect, useRef, useState } from "react";
import { ChatMessageList } from "./ui/chat/chat-message-list";
import { ChatBubble, ChatBubbleMessage, ChatBubbleTimestamp } from "./ui/chat/chat-bubble";
import { ChatInput } from "./ui/chat/chat-input";
import { Button } from "./ui/button";
import type { ChatUser } from "./ChatLayout";
import axios from "axios";

interface Message {
  id: number;
  sender: "user" | "other";
  content: string;
  timestamp: string;
}

interface Props {
  user: ChatUser;
  recipient: ChatUser;
}

export default function ChatWindow({ user, recipient }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // 1. Fetch chat history AND connect websocket
  useEffect(() => {
    const fetchAndConnect = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/messages/${recipient.name}`, {
          withCredentials: true,
        });

        const history = res.data.map((msg: any) => ({
          id: msg.id,
          sender: msg.sender_username === user.name ? "user" : "other",
          content: msg.content,
          timestamp: new Date(msg.timestamp).toLocaleTimeString(),
        }));

        setMessages(history);
      } catch (err) {
        console.error("Failed to fetch messages:", err);
      }

      const socket = new WebSocket(`ws://localhost:8000/ws/${user.name}`);
      socketRef.current = socket;

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Received message via socket:", data);

        if (
          (data.sender === user.name && data.recipient === recipient.name) ||
          (data.sender === recipient.name && data.recipient === user.name)
        ) {
          const newMessage: Message = {
            id: Date.now() + Math.random(),
            sender: data.sender === user.name ? "user" : "other",
            content: data.message,
            timestamp: new Date(data.timestamp).toLocaleTimeString(),
          };
          setMessages((prev) => [...prev, newMessage]);
        }
      };

      socket.onclose = () => console.log("WebSocket closed");
      socket.onerror = (e) => console.error("WebSocket error", e);
    };

    fetchAndConnect();

    return () => {
      socketRef.current?.close();
    };
  }, [recipient.name, user.name]);

  const sendMessage = () => {
    const content = inputRef.current?.value.trim();
    if (!content || !socketRef.current) return;

    const payload = {
      sender: user.name,
      recipient: recipient.name,
      message: content,
    };

    socketRef.current.send(JSON.stringify(payload));
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 font-semibold">Chatting with {recipient.name}</div>

      <div className="flex-1 overflow-y-auto p-4">
        <ChatMessageList>
          {messages.map((msg) => (
            <ChatBubble key={msg.id} variant={msg.sender === "user" ? "sent" : "received"}>
              <div>
                <ChatBubbleMessage variant={msg.sender === "user" ? "sent" : "received"}>
                  {msg.content}
                </ChatBubbleMessage>
                <ChatBubbleTimestamp timestamp={msg.timestamp} />
              </div>
            </ChatBubble>
          ))}
        </ChatMessageList>
      </div>

      <div className="border-t p-4 flex gap-2">
        <ChatInput ref={inputRef} placeholder="Type your message..." />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  );
}
