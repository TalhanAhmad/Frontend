import { useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import ProfileModal from "../components/ProfileModal.jsx";

export default function Chat() {
  const [profileUser, setProfileUser] = useState(null);

  return (
    <main className="chat-app">
      <Sidebar onOpenProfile={setProfileUser} />
      <ChatWindow />
      {profileUser && <ProfileModal user={profileUser} onClose={() => setProfileUser(null)} />}
    </main>
  );
}
