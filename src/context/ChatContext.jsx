import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";
import { getSocket } from "../socket/socket.js";
import { useAuth } from "./AuthContext.jsx";

const ChatContext = createContext(null);

const sortConversations = (items) =>
  [...items].sort((a, b) => new Date(b.lastMessageTime || b.updatedAt) - new Date(a.lastMessageTime || a.updatedAt));

export function ChatProvider({ children }) {
  const { user, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);

  const resetChatState = () => {
    setUsers([]);
    setRequests([]);
    setConversations([]);
    setActiveConversation(null);
    setMessages([]);
    setTypingUser(null);
  };

  const refreshAll = async () => {
    if (!token || !user?._id) {
      resetChatState();
      return;
    }

    const [usersRes, requestsRes, conversationsRes] = await Promise.all([
      api.get("/users"),
      api.get("/requests/received"),
      api.get("/conversations")
    ]);
    const sortedConversations = sortConversations(conversationsRes.data);

    setUsers(usersRes.data);
    setRequests(requestsRes.data);
    setConversations(sortedConversations);
    setActiveConversation((current) => {
      if (!current) return null;
      const stillBelongsToCurrentUser = sortedConversations.some((conversation) => conversation._id === current._id);
      return stillBelongsToCurrentUser ? current : null;
    });
  };

  useEffect(() => {
    resetChatState();
    if (!user?._id || !token) return;
    refreshAll();
  }, [user?._id, token]);

  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      setTypingUser(null);
    }
  }, [activeConversation?._id]);

  useEffect(() => {
    if (!token || !user?._id) return;
    const socket = getSocket();
    if (!socket) return;

    const upsertConversation = (conversation) => {
      setConversations((current) => sortConversations([conversation, ...current.filter((item) => item._id !== conversation._id)]));
      setActiveConversation((current) => (current?._id === conversation._id ? conversation : current));
    };

    socket.on("receiveMessage", ({ message, conversation }) => {
      const belongsToCurrentUser = conversation.participants.some((participant) => participant._id === user._id);
      if (!belongsToCurrentUser) return;

      upsertConversation(conversation);
      setMessages((current) => {
        if (message.conversationId !== activeConversation?._id) return current;
        if (current.some((item) => item._id === message._id)) return current;
        return [...current, message];
      });

      const receiverId = message.receiver?._id || message.receiver;
      if (message.conversationId === activeConversation?._id && receiverId === user._id) {
        api.put(`/messages/read/${message.conversationId}`).catch(() => {});
      }
    });

    socket.on("messageRead", ({ conversationId, messageIds = [] }) => {
      setMessages((current) => {
        if (conversationId !== activeConversation?._id) return current;

        const readMessageIds = new Set(messageIds.map((id) => id.toString()));
        return current.map((message) => {
          const senderId = message.sender?._id || message.sender;
          const shouldMarkRead = readMessageIds.size ? readMessageIds.has(message._id) : senderId === user._id;
          return shouldMarkRead ? { ...message, isRead: true } : message;
        });
      });
    });

    socket.on("receiveChatRequest", (request) => {
      setRequests((current) => [request, ...current.filter((item) => item._id !== request._id)]);
      refreshAll();
    });

    socket.on("requestAccepted", ({ conversation }) => {
      const belongsToCurrentUser = conversation.participants.some((participant) => participant._id === user._id);
      if (!belongsToCurrentUser) return;

      upsertConversation(conversation);
      refreshAll();
    });

    socket.on("requestRejected", refreshAll);

    socket.on("userOnline", ({ userId, isOnline, lastSeen }) => {
      setUsers((current) => current.map((item) => (item._id === userId ? { ...item, isOnline, lastSeen } : item)));
      setConversations((current) =>
        current.map((conversation) => ({
          ...conversation,
          participants: conversation.participants.map((participant) =>
            participant._id === userId ? { ...participant, isOnline, lastSeen } : participant
          )
        }))
      );
    });

    socket.on("userDeleted", ({ userId }) => {
      setUsers((current) => current.filter((item) => item._id !== userId));
      setRequests((current) => current.filter((item) => item.sender?._id !== userId && item.receiver?._id !== userId));
      setConversations((current) => current.filter((conversation) => !conversation.participants.some((participant) => participant._id === userId)));
      setActiveConversation((current) =>
        current?.participants?.some((participant) => participant._id === userId) ? null : current
      );
    });

    socket.on("typing", ({ userId }) => setTypingUser(userId));
    socket.on("stopTyping", () => setTypingUser(null));

    return () => {
      socket.off("receiveMessage");
      socket.off("receiveChatRequest");
      socket.off("requestAccepted");
      socket.off("requestRejected");
      socket.off("userOnline");
      socket.off("userDeleted");
      socket.off("typing");
      socket.off("stopTyping");
      socket.off("messageRead");
    };
  }, [token, user?._id, activeConversation?._id]);

  const openConversation = async (conversation) => {
    const belongsToCurrentUser = conversation.participants.some((participant) => participant._id === user?._id);
    if (!belongsToCurrentUser) return;

    setActiveConversation(conversation);
    const socket = getSocket();
    socket?.emit("joinConversation", conversation._id);
    const { data } = await api.get(`/messages/${conversation._id}`);
    setMessages(data);
    const readRes = await api.put(`/messages/read/${conversation._id}`);
    const readMessageIds = new Set((readRes.data.messageIds || []).map((id) => id.toString()));
    if (readMessageIds.size) {
      setMessages((current) => current.map((message) => (readMessageIds.has(message._id) ? { ...message, isRead: true } : message)));
    }
  };

  const sendRequest = async (receiverId) => {
    await api.post("/requests/send", { receiverId });
    await refreshAll();
  };

  const acceptRequest = async (requestId) => {
    const { data } = await api.put(`/requests/${requestId}/accept`);
    await refreshAll();
    await openConversation(data.conversation);
  };

  const rejectRequest = async (requestId) => {
    await api.put(`/requests/${requestId}/reject`);
    await refreshAll();
  };

  const sendMessage = async (text) => {
    if (!activeConversation || !text.trim()) return;
    const socket = getSocket();
    socket?.emit("sendMessage", { conversationId: activeConversation._id, text });
  };

  const value = useMemo(
    () => ({
      users,
      requests,
      conversations,
      activeConversation,
      messages,
      typingUser,
      refreshAll,
      openConversation,
      sendRequest,
      acceptRequest,
      rejectRequest,
      sendMessage,
      setActiveConversation
    }),
    [users, requests, conversations, activeConversation, messages, typingUser]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export const useChat = () => useContext(ChatContext);
