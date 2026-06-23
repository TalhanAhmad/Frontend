import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getSocket } from "../socket/socket.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useChat } from "../context/ChatContext.jsx";
import Avatar from "./Avatar.jsx";
import MessageBubble from "./MessageBubble.jsx";
import TypingIndicator from "./TypingIndicator.jsx";

export default function ChatWindow() {
  const { user } = useAuth();
  const { activeConversation, messages, sendMessage, typingUser } = useChat();
  const [text, setText] = useState("");
  const endRef = useRef(null);
  const other = activeConversation?.participants.find((participant) => participant._id !== user._id);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeConversation?._id]);

  const submit = (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    sendMessage(text);
    setText("");
    getSocket()?.emit("stopTyping", { conversationId: activeConversation._id });
  };

  const updateTyping = (value) => {
    setText(value);
    if (!activeConversation) return;
    const socket = getSocket();
    socket?.emit(value ? "typing" : "stopTyping", { conversationId: activeConversation._id });
  };

  if (!activeConversation) {
    return (
      <section className="chat-empty">
        <div>
          <h1>Soket Chat</h1>
          <p>Choose an accepted conversation or send a request from People.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="chat-window">
      <header className="chat-header">
        <Avatar user={other} />
        <div>
          <strong>{other?.name}</strong>
          <span>{other?.isOnline ? "Online" : other?.lastSeen ? `Last seen ${new Date(other.lastSeen).toLocaleString()}` : "Offline"}</span>
        </div>
      </header>
      <div className="message-list">
        {messages.map((message) => (
          <MessageBubble key={message._id} message={message} mine={message.sender._id === user._id || message.sender === user._id} />
        ))}
        {typingUser && typingUser !== user._id && <TypingIndicator />}
        <div ref={endRef} />
      </div>
      <form className="message-composer" onSubmit={submit}>
        <input value={text} onChange={(event) => updateTyping(event.target.value)} placeholder="Type a message" />
        <button className="send-button" type="submit" title="Send message">
          <Send size={20} />
        </button>
      </form>
    </section>
  );
}
