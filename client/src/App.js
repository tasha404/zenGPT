import { useState, useEffect } from "react";
import "./App.css";
import ReactMarkdown from "react-markdown";

// 🔥 Firebase
import { auth, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from "firebase/firestore";

const API_URL = "https://zengpt-j99f.onrender.com/chat";

function App() {
  const [user, setUser] = useState(null);

  // auth
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // chat
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [chatId, setChatId] = useState(null);

  // sidebar
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(false);

  // 🔐 Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) loadHistory(u.uid);
    });
    return () => unsub();
  }, []);

  // 🔑 LOGIN
  const login = async () => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // 🆕 SIGNUP
  const signup = async () => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  // 🚪 LOGOUT
  const logout = async () => {
    await signOut(auth);
    setChat([]);
  };

  // 📂 LOAD HISTORY (list of chats)
  const loadHistory = async (uid) => {
    const q = query(collection(db, "sessions"), where("uid", "==", uid));
    const snap = await getDocs(q);

    let arr = [];
    snap.forEach((doc) => {
      arr.push({ id: doc.id, ...doc.data() });
    });

    setHistory(arr);
  };

  // 📂 LOAD ONE CHAT
  const loadChat = async (id) => {
    const q = query(
      collection(db, "messages"),
      where("chatId", "==", id),
      orderBy("createdAt")
    );

    const snap = await getDocs(q);

    let msgs = [];
    snap.forEach((doc) => msgs.push(doc.data()));

    setChat(msgs);
    setChatId(id);
  };

  // 🆕 NEW CHAT
  const newChat = async () => {
    setChat([]);
    setChatId(null);
  };

  // ❌ DELETE CHAT
  const deleteChat = async (id) => {
    await deleteDoc(doc(db, "sessions", id));
    loadHistory(user.uid);
  };

  // 🚀 SEND MESSAGE
  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMsg = { role: "user", content: message };
    setChat((prev) => [...prev, userMsg]);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();

      const aiMsg = { role: "assistant", content: data.reply };
      setChat((prev) => [...prev, aiMsg]);

      let currentChatId = chatId;

      // create new session if none
      if (!currentChatId) {
        const docRef = await addDoc(collection(db, "sessions"), {
          uid: user.uid,
          title: message.slice(0, 20),
          createdAt: new Date(),
        });
        currentChatId = docRef.id;
        setChatId(currentChatId);
        loadHistory(user.uid);
      }

      // save messages
      await addDoc(collection(db, "messages"), {
        chatId: currentChatId,
        role: "user",
        content: message,
        createdAt: new Date(),
      });

      await addDoc(collection(db, "messages"), {
        chatId: currentChatId,
        role: "assistant",
        content: data.reply,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  // 🔐 LOGIN UI
  if (!user) {
    return (
      <div className="auth">
        <h2>ZenGPT ✨</h2>
        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={login}>Login</button>
        <button onClick={signup}>Sign Up</button>
      </div>
    );
  }

  return (
    <div className="app">
      {/* SIDEBAR */}
      <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>

        <button onClick={newChat}>+ New Chat</button>

        {history.map((h) => (
          <div key={h.id} className="chat-item">
            <span onClick={() => loadChat(h.id)}>{h.title}</span>
            <button onClick={() => deleteChat(h.id)}>x</button>
          </div>
        ))}

        <button onClick={logout}>Logout</button>
      </div>

      {/* CHAT AREA */}
      <div className="main">
        <div className="chat-box">
          {chat.map((msg, i) => (
            <div key={i} className={`message ${msg.role}`}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          ))}
          {loading && <div className="message assistant">Typing...</div>}
        </div>

        <div className="input-box">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask anything..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;