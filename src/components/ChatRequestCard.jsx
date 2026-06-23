import { Check, Clock, X } from "lucide-react";
import { useChat } from "../context/ChatContext.jsx";
import Avatar from "./Avatar.jsx";

export default function ChatRequestCard({ request }) {
  const { acceptRequest, rejectRequest } = useChat();

  return (
    <article className="request-card">
      <div className="request-main">
        <Avatar user={request.sender} size="lg" />
        <div>
          <span className="request-eyebrow">
            <Clock size={13} /> Incoming request
          </span>
          <strong>{request.sender.name}</strong>
          <small>{request.sender.bio}</small>
        </div>
      </div>
      <div className="request-actions">
        <button className="request-action accept" onClick={() => acceptRequest(request._id)} title="Accept">
          <Check size={18} />
          Accept
        </button>
        <button className="request-action reject" onClick={() => rejectRequest(request._id)} title="Reject">
          <X size={18} />
          Reject
        </button>
      </div>
    </article>
  );
}
