import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc,
  doc,
  onSnapshot,
  Timestamp,
  limit as firestoreLimit
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Conversation, Message } from '@/types';
import { uploadChatImage } from '@/services/storage';
import { createNotification, NotificationMessages } from '@/services/notifications';

interface UseConversationsReturn {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
}

export function useConversations(userId: string | undefined): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('participants', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedConversations: Conversation[] = [];
      snapshot.forEach((doc) => {
        fetchedConversations.push({ id: doc.id, ...doc.data() } as Conversation);
      });
      setConversations(fetchedConversations);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return { conversations, loading, error };
}

interface UseMessagesReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (text: string, image?: File) => Promise<void>;
  markAsRead: () => Promise<void>;
}

export function useMessages(
  conversationId: string | undefined,
  currentUserId: string | undefined
): UseMessagesReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'), firestoreLimit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages: Message[] = [];
      snapshot.forEach((doc) => {
        fetchedMessages.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(fetchedMessages);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [conversationId]);

  const sendMessage = useCallback(async (text: string, image?: File) => {
    if (!conversationId || !currentUserId) return;

    try {
      let imageUrl: string | undefined;
      
      if (image) {
        imageUrl = await uploadChatImage(image, conversationId);
      }

      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      const newMessage = {
        senderId: currentUserId,
        text: text || undefined,
        imageUrl,
        timestamp: Timestamp.now(),
        read: false,
      };

      await addDoc(messagesRef, newMessage);

      // Update conversation's last message
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        lastMessage: text || '📷 Image',
        lastMessageAt: Timestamp.now(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  }, [conversationId, currentUserId]);

  const markAsRead = useCallback(async () => {
    if (!conversationId || !currentUserId) return;

    try {
      // Mark all unread messages from other users as read
      const unreadMessages = messages.filter(
        m => m.senderId !== currentUserId && !m.read
      );

      for (const message of unreadMessages) {
        const messageRef = doc(db, 'conversations', conversationId, 'messages', message.id);
        await updateDoc(messageRef, { read: true });
      }

      // Reset unread count for current user
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        [`unreadCount.${currentUserId}`]: 0,
      });
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  }, [conversationId, currentUserId, messages]);

  return { messages, loading, error, sendMessage, markAsRead };
}

// Create or get existing conversation
export function useCreateConversation() {
  const [loading, setLoading] = useState(false);

  const createConversation = async (
    participantIds: string[],
    productId?: string
  ): Promise<string | null> => {
    setLoading(true);

    try {
      // Check if conversation already exists
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('participants', '==', participantIds.sort())
      );

      const snapshot = await (await import('firebase/firestore')).getDocs(q);

      if (!snapshot.empty) {
        setLoading(false);
        return snapshot.docs[0].id;
      }

      // Create new conversation
      const newConversation = {
        participants: participantIds.sort(),
        productId,
        lastMessage: '',
        lastMessageAt: Timestamp.now(),
        unreadCount: participantIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {}),
      };

      const docRef = await addDoc(conversationsRef, newConversation);
      setLoading(false);
      return docRef.id;
    } catch (err) {
      console.error('Failed to create conversation:', err);
      setLoading(false);
      return null;
    }
  };

  return { createConversation, loading };
}
