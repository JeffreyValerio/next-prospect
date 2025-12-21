'use client'

import { WhatsAppChat } from "@/interfaces/whatsapp.interface";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface ChatListProps {
  chats: WhatsAppChat[];
  selectedChatId?: string;
  onSelectChat: (chat: WhatsAppChat) => void;
  isLoading?: boolean;
}

export function ChatList({ chats, selectedChatId, onSelectChat, isLoading }: ChatListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-muted-foreground">Cargando conversaciones...</div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-muted-foreground text-center">
          No hay conversaciones disponibles
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {chats.map((chat) => {
        const isSelected = selectedChatId === chat.id;
        const initials = chat.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            className={cn(
              "flex items-center gap-3 p-4 cursor-pointer hover:bg-accent transition-colors border-b border-border",
              isSelected && "bg-accent"
            )}
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={chat.profilePicture} alt={chat.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-sm truncate">{chat.name}</h3>
                {chat.lastMessageTime && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {formatDistanceToNow(new Date(chat.lastMessageTime), {
                      addSuffix: true,
                    })}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground truncate">
                  {chat.lastMessage || "Sin mensajes"}
                </p>
                {chat.unreadCount && chat.unreadCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center ml-2 flex-shrink-0">
                    {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
