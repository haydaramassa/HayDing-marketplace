import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import {
  getConversationMessages,
  getConversations,
  sendConversationMessage,
} from "../services/api";
import Navbar from "../components/Navbar";
import UserAvatar from "../components/UserAvatar";
import "../App.css";

function ConversationDetails() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { isArabic, language } = useLanguage();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const shouldScrollToBottomRef = useRef(true);

  const emojis = [
    "😀",
    "😁",
    "😂",
    "😊",
    "😍",
    "😎",
    "🥳",
    "👍",
    "🙏",
    "👏",
    "🔥",
    "❤️",
    "💚",
    "✅",
    "👌",
    "🤝",
    "💬",
    "📦",
    "🚲",
    "📍",
    "💶",
    "⭐",
    "🎉",
    "🙌",
  ];

  function text(de, ar, en) {
    if (isArabic) return ar;
    if (language === "EN") return en;
    return de;
  }

  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem("hayding-user") || "{}");
    } catch {
      return {};
    }
  }

  function getUserName(user) {
    return (
      user?.fullName ||
      user?.email ||
      text("Unbekannt", "غير معروف", "Unknown")
    );
  }

  function formatDate(dateValue) {
    if (!dateValue) return "";

    try {
      return new Intl.DateTimeFormat(language === "AR" ? "ar" : "de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(dateValue));
    } catch {
      return dateValue;
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function isNearBottom() {
    const container = messagesContainerRef.current;

    if (!container) {
      return true;
    }

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    return distanceFromBottom < 90;
  }

  function goToUserProfile(user) {
    if (!user?.id) return;

    navigate(`/users/${user.id}`);
  }

  function handleEmojiClick(emoji) {
    setMessageText((currentText) => `${currentText}${emoji}`);
  }

  async function loadMessagesOnly(showError = false) {
    try {
      const wasNearBottom = isNearBottom();

      const messagesData = await getConversationMessages(conversationId);
      const loadedMessages = messagesData?.data || messagesData || [];

      setMessages(Array.isArray(loadedMessages) ? loadedMessages : []);

      shouldScrollToBottomRef.current = wasNearBottom;
    } catch (err) {
      if (showError) {
        setError(
          err.message ||
            text(
              "Nachrichten konnten nicht geladen werden.",
              "تعذر تحميل الرسائل.",
              "Could not load messages."
            )
        );
      }
    }
  }

  useEffect(() => {
    if (!localStorage.getItem("hayding-token")) {
      navigate("/login");
      return;
    }

    async function loadConversation() {
      try {
        setIsLoading(true);
        setError("");
        shouldScrollToBottomRef.current = true;

        const conversationsData = await getConversations();
        const conversations = conversationsData?.data || conversationsData || [];

        const selectedConversation = Array.isArray(conversations)
          ? conversations.find(
              (item) => Number(item.id) === Number(conversationId)
            )
          : null;

        if (!selectedConversation) {
          throw new Error(
            text(
              "Konversation wurde nicht gefunden.",
              "لم يتم العثور على المحادثة.",
              "Conversation was not found."
            )
          );
        }

        setConversation(selectedConversation);

        await loadMessagesOnly(true);
        shouldScrollToBottomRef.current = true;
      } catch (err) {
        setError(
          err.message ||
            text(
              "Konversation konnte nicht geladen werden.",
              "تعذر تحميل المحادثة.",
              "Could not load conversation."
            )
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadConversation();
  }, [conversationId, navigate]);

  useEffect(() => {
    if (!localStorage.getItem("hayding-token")) {
      return;
    }

    const intervalId = setInterval(() => {
      loadMessagesOnly(false);
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [conversationId]);

  useEffect(() => {
    if (shouldScrollToBottomRef.current) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setIsEmojiOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleSendMessage(event) {
    event.preventDefault();

    const cleanMessage = messageText.trim();

    if (!cleanMessage || isSending) {
      return;
    }

    try {
      setIsSending(true);
      setError("");
      setIsEmojiOpen(false);
      shouldScrollToBottomRef.current = true;

      const data = await sendConversationMessage(conversationId, cleanMessage);
      const savedMessage = data?.data || data;

      if (savedMessage) {
        setMessages((currentMessages) => [...currentMessages, savedMessage]);
      }

      setMessageText("");
      await loadMessagesOnly(false);
      shouldScrollToBottomRef.current = true;
    } catch (err) {
      setError(
        err.message ||
          text(
            "Nachricht konnte nicht gesendet werden.",
            "تعذر إرسال الرسالة.",
            "Could not send message."
          )
      );
    } finally {
      setIsSending(false);
    }
  }

  const currentUser = getCurrentUser();
  const product = conversation?.product;

  const otherUser =
    Number(currentUser?.id) === Number(conversation?.buyer?.id)
      ? conversation?.seller
      : conversation?.buyer;

  return (
    <div
      className={`create-page ${isArabic ? "rtl" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <Navbar variant="app" />

      <main className="my-products-page conversation-page">
        <div className="my-products-header">
          <div>
            <p className="eyebrow">
              {text("Nachrichten", "الرسائل", "Messages")}
            </p>

            <h1>{text("Konversation", "المحادثة", "Conversation")}</h1>

            <p>
              {text(
                "Schreibe sicher über die Anzeige und kläre die nächsten Schritte.",
                "تواصل بأمان حول الإعلان واتفق على الخطوات التالية.",
                "Chat safely about the listing and arrange the next steps."
              )}
            </p>
          </div>
        </div>

        {isLoading && (
          <p className="auth-message auth-success">
            {text(
              "Konversation wird geladen...",
              "جارٍ تحميل المحادثة...",
              "Loading conversation..."
            )}
          </p>
        )}

        {error && <p className="auth-message auth-error">{error}</p>}

        {!isLoading && conversation && (
          <section className="conversation-shell">
            <aside className="conversation-sidebar">
              {product && (
                <Link
                  className="conversation-product-card"
                  to={`/products/${product.id}`}
                >
                  <span className="conversation-label">
                    {text("Anzeige", "الإعلان", "Listing")}
                  </span>

                  <h2>{product.title}</h2>

                  <p>{product.city}</p>

                  <strong>{product.price} €</strong>
                </Link>
              )}

            </aside>

            <section className="conversation-chat">
              <div className="conversation-chat-header">
                <div>
                  <span className="conversation-label">
                    {text("Chat", "الدردشة", "Chat")}
                  </span>

                  <h2>{getUserName(otherUser)}</h2>
                </div>
              </div>

              <div className="conversation-messages" ref={messagesContainerRef}>
                {messages.length === 0 && (
                  <div className="empty-state conversation-empty">
                    <div className="empty-icon">💬</div>

                    <h2>
                      {text(
                        "Noch keine Nachrichten.",
                        "لا توجد رسائل بعد.",
                        "No messages yet."
                      )}
                    </h2>

                    <p>
                      {text(
                        "Schreibe die erste Nachricht und starte die Unterhaltung.",
                        "اكتب أول رسالة وابدأ المحادثة.",
                        "Write the first message and start the conversation."
                      )}
                    </p>
                  </div>
                )}

                {messages.map((message) => {
                  const isMine =
                    Number(message.sender?.id) === Number(currentUser?.id);

                  return (
                    <div
                      className={`message-row ${isMine ? "mine" : "theirs"}`}
                      key={message.id}
                    >
                      {!isMine && (
                        <button
                          className="message-avatar-button"
                          type="button"
                          onClick={() => goToUserProfile(message.sender)}
                          aria-label={text(
                            "Profil öffnen",
                            "فتح الملف الشخصي",
                            "Open profile"
                          )}
                        >
                          <UserAvatar user={message.sender} size="small" />
                        </button>
                      )}

                      <div className="message-bubble">
                        <p>{message.content}</p>

                        <button
                          className="message-meta-button"
                          type="button"
                          onClick={() => goToUserProfile(message.sender)}
                          disabled={!message.sender?.id}
                        >
                          {getUserName(message.sender)} ·{" "}
                          {formatDate(message.createdAt)}
                        </button>
                      </div>

                      {isMine && (
                        <button
                          className="message-avatar-button"
                          type="button"
                          onClick={() => goToUserProfile(message.sender)}
                          aria-label={text(
                            "Profil öffnen",
                            "فتح الملف الشخصي",
                            "Open profile"
                          )}
                        >
                          <UserAvatar user={message.sender} size="small" />
                        </button>
                      )}
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>

              <form className="conversation-form" onSubmit={handleSendMessage}>
                <div className="conversation-input-tools" ref={emojiPickerRef}>
                  <button
                    className="emoji-toggle"
                    type="button"
                    onClick={() => setIsEmojiOpen((current) => !current)}
                    aria-label={text(
                      "Emoji auswählen",
                      "اختيار إيموجي",
                      "Choose emoji"
                    )}
                  >
                    😀
                  </button>

                  {isEmojiOpen && (
                    <div className="emoji-picker">
                      {emojis.map((emoji) => (
                        <button
                          type="button"
                          key={emoji}
                          onClick={() => handleEmojiClick(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <textarea
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  placeholder={text(
                    "Schreibe eine Nachricht...",
                    "اكتب رسالة...",
                    "Write a message..."
                  )}
                  rows="2"
                />

                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={isSending || !messageText.trim()}
                >
                  {isSending
                    ? text("Wird gesendet...", "جارٍ الإرسال...", "Sending...")
                    : text("Senden", "إرسال", "Send")}
                </button>
              </form>
            </section>
          </section>
        )}
      </main>
    </div>
  );
}

export default ConversationDetails;