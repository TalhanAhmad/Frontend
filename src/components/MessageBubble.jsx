import { Check } from "lucide-react";

export default function MessageBubble({ message, mine }) {
  return (
    <div className={`message-row ${mine ? "mine" : ""}`}>
      <article className="message-bubble">
        <p>{message.text}</p>
        <footer className="message-meta">
          <time>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
          {mine && (
            <span className={`message-ticks ${message.isRead ? "read" : ""}`} title={message.isRead ? "Seen" : "Sent"}>
              <Check size={15} strokeWidth={2.6} />
              {message.isRead && <Check className="second-check" size={15} strokeWidth={2.6} />}
            </span>
          )}
        </footer>
      </article>
    </div>
  );
}
