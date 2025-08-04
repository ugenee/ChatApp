import { cn } from "@/lib/utils";
import type { ChatUser } from "./ChatLayout";
import { ModeToggle } from "@/components/ModeToggle";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Props {
  users: ChatUser[];
  selectedId?: string;
  onSelectUser: (user: ChatUser) => void;
}

export default function ChatSidebar({ users, selectedId, onSelectUser }: Props) {
  return (
    <aside className="w-64 border-r bg-white dark:bg-gray-900 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Chats</h2>
        <ModeToggle />
      </div>
      <hr></hr>

      <div className="space-y-2">
  {users.map((user) => {
    try {
      return (
        <button
          key={user.id}
          onClick={() => onSelectUser(user)}
          className={cn(
            "w-full flex items-center gap-3 text-left p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800",
            selectedId === user.id && "bg-gray-200 dark:bg-gray-700"
          )}
        >
          <Avatar>
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback>
              {(user.name ?? "")
                .split(" ")
                .map((n) => n[0] ?? "")
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-start overflow-hidden">
            <div className="font-medium truncate w-full">{user.name}</div>
            <div className="text-sm text-muted-foreground truncate w-full">
              {user.lastMessage}
            </div>
          </div>
        </button>
      );
    } catch (error) {
      console.error("Rendering user failed:", user, error);
      return null;
    }
  })}
</div>
    </aside>
  );
}
