import { Link } from "react-router-dom";
import { LogOut, Search, Settings } from "lucide-react";
import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useChat } from "../context/ChatContext.jsx";
import UserCard from "./UserCard.jsx";
import ChatRequestCard from "./ChatRequestCard.jsx";
import Avatar from "./Avatar.jsx";

export default function Sidebar({ onOpenProfile }) {
  const { user, logout } = useAuth();
  const { users, requests, conversations, activeConversation, openConversation } = useChat();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("chats");

  const filteredUsers = useMemo(
    () => users.filter((item) => item.name.toLowerCase().includes(query.toLowerCase())),
    [users, query]
  );

  const pendingRequests = requests.filter((request) => request.status === "pending");

  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <button className="avatar-button" onClick={() => onOpenProfile(user)} title="View profile">
          <Avatar user={user} />
        </button>
        <div>
          <strong>{user.name}</strong>
          <span>Online</span>
        </div>
        <Link className="icon-button" to="/profile" title="Settings">
          <Settings size={18} />
        </Link>
        <button className="icon-button" onClick={logout} title="Logout">
          <LogOut size={18} />
        </button>
      </header>

      <div className="search-box">
        <Search size={18} />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users" />
      </div>

      <div className="tabs">
        <button className={tab === "chats" ? "active" : ""} onClick={() => setTab("chats")}>
          Chats
        </button>
        <button className={tab === "requests" ? "active" : ""} onClick={() => setTab("requests")}>
          Requests {pendingRequests.length ? <span>{pendingRequests.length}</span> : null}
        </button>
        <button className={tab === "people" ? "active" : ""} onClick={() => setTab("people")}>
          People
        </button>
      </div>

      <div className="sidebar-scroll">
        {tab === "chats" &&
          (conversations.length ? (
            conversations.map((conversation) => {
              const other = conversation.participants.find((participant) => participant._id !== user._id);
              return (
                <button
                  key={conversation._id}
                  className={`conversation-row ${activeConversation?._id === conversation._id ? "selected" : ""}`}
                  onClick={() => openConversation(conversation)}
                >
                  <Avatar user={other} />
                  <span className={other?.isOnline ? "presence on" : "presence"} />
                  <div>
                    <strong>{other?.name}</strong>
                    <small>{conversation.lastMessageText || "No messages yet"}</small>
                  </div>
                  <time>{conversation.lastMessageTime ? new Date(conversation.lastMessageTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}</time>
                </button>
              );
            })
          ) : (
            <p className="empty-state">Accepted chats will appear here.</p>
          ))}

        {tab === "requests" &&
          (pendingRequests.length ? (
            <div className="request-stack">
              <div className="sidebar-section-title">
                <strong>Received requests</strong>
                <span>{pendingRequests.length}</span>
              </div>
              {pendingRequests.map((request) => (
                <ChatRequestCard key={request._id} request={request} />
              ))}
            </div>
          ) : (
            <p className="empty-state">No pending requests.</p>
          ))}

        {tab === "people" &&
          (filteredUsers.length ? (
            <div className="people-stack">
              {filteredUsers.map((item) => (
                <UserCard key={item._id} user={item} onOpenProfile={() => onOpenProfile(item)} />
              ))}
            </div>
          ) : (
            <p className="empty-state">No users found.</p>
          ))}
      </div>
    </aside>
  );
}
