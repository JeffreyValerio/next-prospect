'use client'

import { WhatsAppMessage } from "@/interfaces/whatsapp.interface";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";

interface MessageListProps {
  messages: WhatsAppMessage[];
  isLoading?: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-muted-foreground">Cargando mensajes...</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-muted-foreground text-center">
          No hay mensajes aún. Envía el primero para comenzar la conversación.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4 overflow-y-auto h-full">
      {messages.map((message) => {
        const isFromMe = message.isFromMe !== false;
        const messageDate = new Date(message.timestamp);

        return (
          <div
            key={message.id}
            className={cn(
              "flex flex-col max-w-[70%]",
              isFromMe ? "self-end items-end" : "self-start items-start"
            )}
          >
            <div
              className={cn(
                "rounded-lg px-4 py-2 break-words",
                isFromMe
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-muted text-muted-foreground rounded-bl-none"
              )}
            >
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              {message.mediaUrl && (
                <div className="mt-2">
                  <img
                    src={message.mediaUrl}
                    alt="Media"
                    className="max-w-full h-auto rounded"
                  />
                  {message.caption && (
                    <p className="text-sm mt-2">{message.caption}</p>
                  )}
                </div>
              )}
            </div>
            
            <div className={cn(
              "flex items-center gap-1 mt-1 text-xs text-muted-foreground",
              isFromMe ? "flex-row-reverse" : ""
            )}>
              <span>
                {format(messageDate, "HH:mm")}
              </span>
              {isFromMe && (
                <span className="ml-1">
                  {message.status === 'read' ? (
                    <CheckCheck className="h-3 w-3 text-blue-500" />
                  ) : message.status === 'delivered' ? (
                    <CheckCheck className="h-3 w-3" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
