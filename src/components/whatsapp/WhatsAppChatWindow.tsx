'use client'

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { WhatsAppChat, WhatsAppMessage } from "@/interfaces/whatsapp.interface";
import { ChatList } from "./ChatList";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { RefreshCw, MessageSquare, Plus } from "lucide-react";
import { getStoredMessages, storeMessage, storeMessages } from "@/lib/whatsapp-storage";
import { NewChatDialog } from "./NewChatDialog";

export function WhatsAppChatWindow() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [chats, setChats] = useState<WhatsAppChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<WhatsAppChat | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastErrorRef = useRef<{ chatId: string; timestamp: number } | null>(null);
  const processedOpenChatRef = useRef<string | null>(null);

  // Cargar conversaciones
  const loadChats = useCallback(async () => {
    try {
      setIsLoadingChats(true);
      const response = await fetch("/api/whatsapp/chats");
      if (!response.ok) throw new Error("Error al cargar conversaciones");
      
      const data = await response.json();
      const newChats = data.chats || [];
      
      // Preservar el chat seleccionado si aún existe
      if (selectedChat) {
        const existingChat = newChats.find((chat: WhatsAppChat) => 
          chat.phoneNumber === selectedChat.phoneNumber || chat.id === selectedChat.id
        );
        if (existingChat) {
          setSelectedChat(existingChat);
          setChats(newChats);
        } else {
          // Si el chat seleccionado no está en la lista nueva, mantenerlo
          setChats([selectedChat, ...newChats]);
        }
      } else {
        setChats(newChats);
      }
    } catch (error) {
      console.error("Error cargando chats:", error);
      toast.error("Error al cargar las conversaciones");
    } finally {
      setIsLoadingChats(false);
    }
  }, [selectedChat]);

  // Cargar mensajes de una conversación
  const loadMessages = async (chat: WhatsAppChat) => {
    try {
      setIsLoadingMessages(true);
      
      // Cargar mensajes desde almacenamiento local (enviados)
      const storedMessages = getStoredMessages(chat.phoneNumber);
      
      // También consultar mensajes recibidos vía webhook
      try {
        const response = await fetch(`/api/whatsapp/webhook-messages?phoneNumber=${chat.phoneNumber}`);
        if (response.ok) {
          const data = await response.json();
          const receivedMessages = data.messages || [];
          
          // Combinar mensajes enviados y recibidos
          const allMessages = [...storedMessages, ...receivedMessages];
          
          // Eliminar duplicados por ID y ordenar por timestamp
          const uniqueMessages = Array.from(
            new Map(allMessages.map((msg) => [msg.id, msg])).values()
          ).sort((a, b) => a.timestamp - b.timestamp);
          
          setMessages(uniqueMessages);
          
          // Guardar todos los mensajes en localStorage
          storeMessages(uniqueMessages);
        } else {
          setMessages(storedMessages);
        }
      } catch (error) {
        console.error("Error obteniendo mensajes recibidos:", error);
        setMessages(storedMessages);
      }
      
      // Limpiar el error ref si la carga fue exitosa
      if (lastErrorRef.current?.chatId === chat.id) {
        lastErrorRef.current = null;
      }
    } catch (error) {
      console.error("Error cargando mensajes:", error);
      // En caso de error, intentar cargar desde localStorage de todos modos
      try {
        const storedMessages = getStoredMessages(chat.phoneNumber);
        setMessages(storedMessages);
      } catch {
        setMessages([]);
      }
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Enviar mensaje
  const handleSendMessage = async (text: string) => {
    if (!selectedChat) return;

    // Agregar mensaje optimista
    const optimisticMessage: WhatsAppMessage = {
      id: `temp-${Date.now()}`,
      from: "me",
      to: selectedChat.phoneNumber,
      text,
      timestamp: Date.now(),
      type: 'text',
      status: 'sent',
      isFromMe: true,
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      setIsSending(true);

      const response = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selectedChat.phoneNumber,
          text,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al enviar mensaje");
      }

      // Actualizar el mensaje optimista con el ID real si está disponible
      const result = await response.json();
      const finalMessage: WhatsAppMessage = result.data?.id 
        ? { ...optimisticMessage, id: result.data.id, status: 'sent' as const }
        : { ...optimisticMessage, status: 'sent' as const };
      
      // Actualizar en el estado
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === optimisticMessage.id ? finalMessage : msg
        )
      );
      
      // Almacenar el mensaje
      storeMessage(finalMessage);

      toast.success("Mensaje enviado");
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      toast.error(error instanceof Error ? error.message : "Error al enviar mensaje");
      // Remover mensaje optimista en caso de error
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
    } finally {
      setIsSending(false);
    }
  };

  // Seleccionar chat
  const handleSelectChat = (chat: WhatsAppChat) => {
    setSelectedChat(chat);
    loadMessages(chat);
  };

  // Iniciar nueva conversación
  const handleStartNewChat = (phoneNumber: string) => {
    // Crear un chat temporal con el número proporcionado
    const newChat: WhatsAppChat = {
      id: `new-${phoneNumber}`,
      phoneNumber,
      name: phoneNumber, // Usar el número como nombre por ahora
      lastMessage: "",
      lastMessageTime: undefined,
      unreadCount: 0,
    };

    // Verificar si ya existe un chat con ese número
    const existingChat = chats.find((chat) => chat.phoneNumber === phoneNumber);
    
    if (existingChat) {
      // Si ya existe, seleccionarlo
      handleSelectChat(existingChat);
    } else {
      // Si no existe, agregarlo a la lista y seleccionarlo
      setChats((prev) => [newChat, ...prev]);
      setSelectedChat(newChat);
      setMessages([]); // No hay mensajes previos
    }
  };

  // Scroll al final de los mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Efecto para abrir chat desde query param
  useEffect(() => {
    const openChatPhone = searchParams.get("openChat");
    
    // Si no hay query param, resetear el ref
    if (!openChatPhone) {
      processedOpenChatRef.current = null;
      return;
    }

    // Si ya procesamos este número, no hacer nada
    if (processedOpenChatRef.current === openChatPhone) {
      return;
    }

    // Función para normalizar números de teléfono para comparación
    const normalizePhone = (phone: string) => {
      if (!phone) return "";
      // Remover espacios, guiones, paréntesis y el símbolo +
      return phone.replace(/[\s\-\(\)\+]/g, "").trim();
    };

    const normalizedTarget = normalizePhone(openChatPhone);

    // Si los chats aún no están cargados, esperar
    if (isLoadingChats) {
      // Intentar de nuevo cuando los chats se carguen
      return;
    }

    // Marcar como procesado
    processedOpenChatRef.current = openChatPhone;

    // Buscar el chat existente
    const existingChat = chats.find((chat) => {
      const normalizedChat = normalizePhone(chat.phoneNumber);
      return normalizedChat === normalizedTarget || 
             normalizedChat.endsWith(normalizedTarget) || 
             normalizedTarget.endsWith(normalizedChat);
    });
    
    if (existingChat) {
      setSelectedChat(existingChat);
      loadMessages(existingChat);
    } else {
      // Crear chat temporal y seleccionarlo
      const newChat: WhatsAppChat = {
        id: `new-${openChatPhone}`,
        phoneNumber: openChatPhone,
        name: openChatPhone,
        lastMessage: "",
        lastMessageTime: undefined,
        unreadCount: 0,
      };
      setChats((prev) => {
        // Evitar duplicados
        const exists = prev.some((chat) => {
          const normalized = normalizePhone(chat.phoneNumber);
          return normalized === normalizedTarget;
        });
        return exists ? prev : [newChat, ...prev];
      });
      setSelectedChat(newChat);
      setMessages([]);
      // Cargar mensajes para el nuevo chat
      loadMessages(newChat);
    }
    
    // Limpiar el query param después de un breve delay
    setTimeout(() => {
      router.replace("/whatsapp", { scroll: false });
    }, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString(), chats, isLoadingChats]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Recargar mensajes periódicamente (tanto enviados como recibidos)
  useEffect(() => {
    if (!selectedChat) return;

    const interval = setInterval(() => {
      loadMessages(selectedChat);
    }, 3000); // Recargar cada 3 segundos

    return () => clearInterval(interval);
  }, [selectedChat]);

  const selectedChatInitials = selectedChat
    ? selectedChat.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  return (
    <div className="flex h-[calc(100vh-200px)] border border-border rounded-lg overflow-hidden bg-background">
      {/* Lista de conversaciones */}
      <div className="w-1/3 border-r border-border flex flex-col bg-muted/30">
        <div className="p-4 border-b border-border flex items-center justify-between bg-background">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <h2 className="font-semibold">Conversaciones</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsNewChatDialogOpen(true)}
              title="Nueva conversación"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={loadChats}
              disabled={isLoadingChats}
              title="Actualizar conversaciones"
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingChats ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
        <ChatList
          chats={chats}
          selectedChatId={selectedChat?.id}
          onSelectChat={handleSelectChat}
          isLoading={isLoadingChats}
        />
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Header del chat */}
            <div className="p-4 border-b border-border bg-background flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedChat.profilePicture} alt={selectedChat.name} />
                <AvatarFallback>{selectedChatInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{selectedChat.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedChat.phoneNumber}</p>
              </div>
            </div>

            {/* Lista de mensajes */}
            <div className="flex-1 overflow-hidden">
              <MessageList messages={messages} isLoading={isLoadingMessages} />
              <div ref={messagesEndRef} />
            </div>

            {/* Input de mensaje */}
            <MessageInput
              onSendMessage={handleSendMessage}
              disabled={isSending}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Selecciona una conversación para comenzar</p>
            </div>
          </div>
        )}
      </div>

      {/* Dialog para nueva conversación */}
      <NewChatDialog
        open={isNewChatDialogOpen}
        onOpenChange={setIsNewChatDialogOpen}
        onStartChat={handleStartNewChat}
      />
    </div>
  );
}
