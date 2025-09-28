import React, { useEffect, useRef, useState } from "react";
import "../index.css";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [myId, setMyId] = useState(null);
  const [username, setUsername] = useState("");
  const [nameSet, setNameSet] = useState(false);
  const [error, setError] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const [activeUsers, setActiveUsers] = useState([]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("userTyping", ({ username, typing }) => {
      setTypingUser(typing ? username : "");
    });
    return () => socket.off("userTyping");
  }, []);

  useEffect(() => {
    socket.on("connect", () => setMyId(socket.id));
    socket.on("chatHistory", (history) => setMessages(history));
    socket.on("messageFromServerToClient", (data) =>
      setMessages((prev) => [...prev, data])
    );
    socket.on("errorMessage", (msg) => {
      setError(msg);
      setTimeout(() => setError(""), 3000);
    });
    socket.on("activeUsers", (users) => setActiveUsers(users));
    return () => {
      socket.off("connect");
      socket.off("chatHistory");
      socket.off("messageFromServerToClient");
      socket.off("errorMessage");
      socket.off("activeUsers");
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMsg.trim()) {
      socket.emit("messageFromClientToServer", newMsg);
      setNewMsg("");
    }
  };

  const handleTyping = (e) => {
    setNewMsg(e.target.value);
    socket.emit("typing", e.target.value.length > 0);
  };

  const handleSetUsername = (e) => {
    e.preventDefault();
    if (username.trim()) {
      socket.emit("setUsername", username);
      setNameSet(true);
    }
  };

  if (!nameSet) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black">
        <form
          onSubmit={handleSetUsername}
          className="bg-gray-900 p-10 rounded-2xl shadow-2xl w-96"
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-purple-300">
            Join the Chat
          </h2>
          <input
            type="text"
            className="w-full px-4 py-3 bg-gray-800 text-gray-200 border border-purple-500 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />
          <button
            type="submit"
            className="mt-6 w-full py-3 bg-gradient-to-r from-purple-700 to-indigo-700 text-white rounded-lg font-semibold hover:opacity-90 transition"
          >
            Start Chatting
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-black p-6">
      <div className="bg-gray-900 text-white p-4 rounded-xl mb-4 shadow-lg">
        <h3 className="font-bold text-lg mb-3">Active Users</h3>
        <div className="flex flex-wrap gap-2">
          {activeUsers.length > 0 ? (
            activeUsers.map((user, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-purple-700 rounded-full text-sm shadow-md"
              >
                {user}
              </span>
            ))
          ) : (
            <span className="text-gray-400 italic">No users online</span>
          )}
        </div>
      </div>

      <div className="w-full max-w-2xl mx-auto bg-gray-900 rounded-xl shadow-2xl flex flex-col h-full overflow-hidden">
        <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white flex justify-between items-center py-4 px-6 shadow-md rounded-t-xl">
          <span className="font-bold text-lg">Chat – {username}</span>
          <button
            className="px-4 py-1 bg-red-600 rounded-md text-sm font-semibold hover:bg-red-700 transition"
            onClick={() => {
              if (window.confirm("Clear chat for all users?")) {
                socket.emit("clearChat");
              }
            }}
          >
            Clear
          </button>
        </div>

        <ul className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-800">
          {messages
            .filter((msg) => !(msg.id === "server" && msg.text?.includes("left")))
            .map((msg, idx) => (
              <li
                key={idx}
                className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                  msg.id === myId
                    ? "ml-auto bg-purple-600 text-white rounded-br-none shadow-lg"
                    : msg.id === "server"
                    ? "mx-auto bg-gray-700 text-purple-300 text-center italic"
                    : "mr-auto bg-gray-700 text-gray-200 rounded-bl-none shadow-md"
                }`}
              >
                {msg.id !== "server" && (
                  <span className="block text-xs font-semibold mb-1 opacity-70 text-purple-300">
                    {msg.username}
                  </span>
                )}
                <div>
                  <span>{msg.text}</span>
                  {msg.time && (
                    <span className="block text-[10px] text-gray-400 mt-1 text-right">
                      {new Date(msg.time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              </li>
            ))}
          <div ref={messagesEndRef} />
        </ul>

        {typingUser && (
          <div className="text-gray-400 italic text-sm px-5 pb-2">
            {typingUser} is typing...
          </div>
        )}

        {error && (
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 border-t border-gray-700 p-4 bg-gray-900 rounded-b-xl"
        >
          <input
            type="text"
            className="flex-1 px-4 py-2 bg-gray-800 text-gray-200 border border-purple-500 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="Type a message..."
            value={newMsg}
            onChange={handleTyping}
            required
          />
          <button
            className="px-6 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 text-white rounded-full font-semibold hover:scale-105 transition"
            type="submit"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatApp;
