import { X, UserRoundPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useChat } from "../context/ChatContext.jsx";
import Avatar from "./Avatar.jsx";

export default function ProfileModal({ user, onClose }) {
  const { user: currentUser } = useAuth();
  const { sendRequest, conversations, openConversation } = useChat();
  const conversation = conversations.find((item) => item._id === user.conversationId);
  const isSelf = currentUser?._id === user._id;

  const requestLabel = user.requestStatus ? `Request ${user.requestStatus}` : "Send request";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="profile-modal" onClick={(event) => event.stopPropagation()}>
        <button className="icon-button close" onClick={onClose} title="Close">
          <X size={18} />
        </button>
        <Avatar user={user} size="xl" />
        <h2>{user.name}</h2>
        <p>{user.bio || "No bio yet."}</p>
        <span className={user.isOnline ? "online-label" : "offline-label"}>{user.isOnline ? "Online" : "Offline"}</span>
        {conversation ? (
          <button className="primary-button" onClick={() => openConversation(conversation)}>
            Open chat
          </button>
        ) : !isSelf ? (
          <button className="primary-button" disabled={Boolean(user.requestStatus)} onClick={() => sendRequest(user._id)}>
            <UserRoundPlus size={17} /> {requestLabel}
          </button>
        ) : null}
      </section>
    </div>
  );
}
