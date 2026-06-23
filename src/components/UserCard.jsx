import { MessageCircle, UserRound } from "lucide-react";
import { useChat } from "../context/ChatContext.jsx";
import Avatar from "./Avatar.jsx";

export default function UserCard({ user, onOpenProfile }) {
  const { sendRequest, conversations, openConversation } = useChat();
  const conversation = conversations.find((item) => item._id === user.conversationId);
  const canRequest = !user.requestStatus && !conversation;

  return (
    <article className="user-card">
      <button className="user-main" onClick={onOpenProfile}>
        <Avatar user={user} />
        <span className={user.isOnline ? "presence on" : "presence"} />
        <div>
          <strong>{user.name}</strong>
          <small>{user.bio || "Available after request approval."}</small>
        </div>
      </button>
      <div className="user-card-action">
        {conversation ? (
          <button className="mini-action" onClick={() => openConversation(conversation)} title="Open chat">
            <MessageCircle size={17} />
          </button>
        ) : canRequest ? (
          <button className="mini-action" onClick={() => sendRequest(user._id)} title="Send request">
            <UserRound size={17} />
          </button>
        ) : (
          <span className={`status-pill ${user.requestStatus}`}>{user.requestStatus}</span>
        )}
      </div>
    </article>
  );
}
