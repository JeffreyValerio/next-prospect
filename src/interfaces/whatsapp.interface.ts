export interface WhatsAppContact {
  id: string;
  name: string;
  phoneNumber: string;
  profilePicture?: string;
  isBlocked?: boolean;
}

export interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  text?: string;
  timestamp: number;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact';
  status?: 'sent' | 'delivered' | 'read' | 'failed';
  isFromMe?: boolean;
  mediaUrl?: string;
  caption?: string;
}

export interface WhatsAppChat {
  id: string;
  phoneNumber: string;
  name: string;
  lastMessage?: string;
  lastMessageTime?: number;
  unreadCount?: number;
  profilePicture?: string;
}

export interface SendMessageRequest {
  to: string;
  text: string;
  mediaUrl?: string;
  type?: 'text' | 'image' | 'video' | 'audio' | 'document';
}

export interface WasenderApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
