
import { useEffect, useState } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";

export interface ChatUser {
  avatarUrl: string | undefined;
  id: string;
  name: string;
  lastMessage: string;
}
import { useParams } from "react-router-dom"; // if using react-router

import axios from "axios";

export default function ChatLayout() {
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const { username } = useParams();

  const loggedInUser = {
    id: username!,
    name: username!,
    avatarUrl: undefined,
    lastMessage: "",
  };

useEffect(() => {
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8000/users", {
        withCredentials: true,
      });

      const mappedUsers: ChatUser[] = res.data.map((u: any) => ({
        id: String(u.id ?? ""), // fallback to "" if missing
        name: u.username ?? "Unknown",
        avatarUrl: u.avatarUrl ?? undefined,
        lastMessage: "", // default since you aren't loading messages here
      }));

      setUsers(mappedUsers);
      console.log("Mapped users:", mappedUsers);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  fetchUsers();
}, []);
  return (
    <div className="flex h-screen">
      <ChatSidebar users={users} onSelectUser={setSelectedUser} selectedId={selectedUser?.id} />
      <div className="flex-1 border-l">
        {selectedUser ? (
          <ChatWindow user={loggedInUser} recipient={selectedUser} />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
