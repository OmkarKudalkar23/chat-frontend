import React, { useEffect, useRef, useState } from "react";
import "../index.css";
import io from "socket.io-client";

const socket = io("https://chat-backend-ebmb.onrender.com");

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [myId, setMyId] = useState(null);
  const [username, setUsername] = useState("");
  const [nameSet, setNameSet] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("connect", () => {
      setMyId(socket.id);
    });

    socket.on("chatHistory", (history) => {
      setMessages(history);
    });

    socket.on("messageFromServerToClient", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("errorMessage", (msg) => {
      setError(msg);
      setTimeout(() => setError(""), 3000);
    });

    return () => {
      socket.off("connect");
      socket.off("chatHistory");
      socket.off("messageFromServerToClient");
      socket.off("errorMessage");
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

  const handleSetUsername = (e) => {
    e.preventDefault();
    if (username.trim()) {
      socket.emit("setUsername", username);
      setNameSet(true);
    }
  };

  if (!nameSet) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-r from-purple-900 via-indigo-900 to-black">
        <form
          onSubmit={handleSetUsername}
          className="bg-gray-900 p-8 rounded-2xl shadow-2xl w-80"
        >
          <h2 className="text-2xl font-bold mb-6 text-center text-purple-300">
            Choose a username
          </h2>
          <input
            type="text"
            className="w-full px-4 py-2 bg-gray-800 text-gray-200 border border-purple-500 rounded-md focus:ring-2 focus:ring-purple-400 outline-none"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
            required
          />
          <button
            type="submit"
            className="mt-6 w-full py-2 bg-gradient-to-r from-purple-700 to-indigo-700 text-white rounded-md font-semibold hover:opacity-90 transition"
          >
            Join Chat
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-purple-900 via-indigo-900 to-black p-4">
      <div className="w-full max-w-lg bg-gray-900 rounded-xl shadow-2xl flex flex-col h-full md:h-[650px] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white text-center py-4 font-bold text-xl shadow-md">
          Chat App – {username}
        </div>

        {/* Messages */}
        <ul className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-800">
          {messages
            .filter((msg) => !(msg.id === "server" && msg.text?.includes("left")))
            .map((msg, idx) => (
              <li
                key={idx}
                className={`max-w-[75%] px-4 py-2 rounded-2xl relative ${
                  msg.id === myId
                    ? "ml-auto bg-purple-600 text-white rounded-br-none"
                    : msg.id === "server"
                    ? "mx-auto bg-gray-700 text-purple-300 text-center rounded-lg italic"
                    : "mr-auto bg-gray-700 text-gray-200 rounded-bl-none"
                }`}
              >
                {msg.id !== "server" && (
                  <span className="block text-xs font-semibold mb-1 opacity-80 text-purple-300">
                    {msg.username}
                  </span>
                )}
                <div className="flex flex-col">
                  <span>{msg.text}</span>
                  {msg.time && (
                    <span className="text-[10px] text-gray-400 mt-1 self-end">
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

        {/* Error Toast */}
        {error && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
            {error}
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-gray-700 p-3 bg-gray-900"
        >
          <input
            type="text"
            className="flex-1 px-4 py-2 bg-gray-800 text-gray-200 border border-purple-500 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="Type your message..."
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            required
          />
          <button
            className="px-5 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 text-white rounded-full font-semibold hover:scale-105 transition"
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
