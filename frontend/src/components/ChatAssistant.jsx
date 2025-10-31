import React, { useState, useEffect, useRef } from "react";
import config from "../config";

export default function ChatAssistant({ projectId = null }) {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, [projectId]);

  useEffect(() => {
    if (currentConversation) {
      fetchConversationMessages(currentConversation.id);
    }
  }, [currentConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${config.API_BASE_URL}/api/chat/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const filtered = projectId
          ? data.filter((c) => c.project_id === parseInt(projectId))
          : data;
        setConversations(filtered);
        
        // Auto-select first conversation if none selected
        if (!currentConversation && filtered.length > 0) {
          setCurrentConversation(filtered[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchConversationMessages = async (conversationId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(
        `${config.API_BASE_URL}/api/chat/conversations/${conversationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const messageText = inputMessage.trim();
    setInputMessage("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Please login first");
      }

      // Add user message to UI immediately
      const userMessage = {
        id: Date.now(),
        role: "user",
        content: messageText,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Send to backend
      const res = await fetch(`${config.API_BASE_URL}/api/chat/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: currentConversation?.id || null,
          message: messageText,
          projectId: projectId ? parseInt(projectId) : null,
          language: "en",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      // Update conversation if new one was created
      if (data.conversationId && !currentConversation) {
        await fetchConversations();
        // Set new conversation as current
        const newConv = conversations.find((c) => c.id === data.conversationId);
        if (newConv) {
          setCurrentConversation(newConv);
        }
      } else {
        // Refresh conversations to update timestamps
        await fetchConversations();
      }

      // Add AI response to UI
      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.message || data.response || "No response",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      // Show error message
      const errorMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: `Error: ${error.message || "Failed to send message"}`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConversation = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${config.API_BASE_URL}/api/chat/conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId: projectId ? parseInt(projectId) : null,
          title: "New Conversation",
          language: "en",
        }),
      });

      if (res.ok) {
        const newConv = await res.json();
        await fetchConversations();
        setCurrentConversation(newConv);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const handleSelectConversation = (conversation) => {
    setCurrentConversation(conversation);
    setMessages([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full bg-white rounded-lg shadow-sm">
      {/* Sidebar - Conversations */}
      <div className="w-64 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-800">Conversations</h3>
            <button
              onClick={handleCreateConversation}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              + New
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No conversations yet. Create a new one to start chatting!
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 transition ${
                  currentConversation?.id === conv.id ? "bg-blue-50 border-l-4 border-l-blue-600" : ""
                }`}
              >
                <div className="font-medium text-sm text-gray-800 truncate">
                  {conv.title || "Untitled Conversation"}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {conv.message_count || 0} messages
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-4">💬</div>
                <p className="text-lg font-medium mb-2">Start a conversation</p>
                <p className="text-sm">
                  Ask me anything about project management, risk analysis, or your projects.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-3xl rounded-lg px-4 py-2 ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  <div
                    className={`text-xs mt-1 ${
                      msg.role === "user" ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {new Date(msg.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              disabled={loading}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !inputMessage.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

