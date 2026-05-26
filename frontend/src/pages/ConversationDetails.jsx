import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import {
  getConversationMessages,
  getConversations,
  sendConversationMessage,
} from "../services/api";
import "../App.css";

function ConversationDetails() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { isArabic, language, setLanguage } = useLanguage();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);

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

  function getInitials(user) {
    const name = user?.fullName || user?.email || "?";

    return (
      name
        .trim()
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("") || "?"
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

  useEffect(() => {
    if (!localStorage.getItem("hayding-token")) {
      navigate("/login");
      return;
    }

    async function loadConversation() {
      try {
        setIsLoading(true);
        setError("");

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

        const messagesData = await getConversationMessages(conversationId);
        const loadedMessages = messagesData?.data || messagesData || [];

        setMessages(Array.isArray(loadedMessages) ? loadedMessages : []);
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
    scrollToBottom();
  }, [messages]);

  async function handleSendMessage(event) {
    event.preventDefault();

    const cleanMessage = messageText.trim();

    if (!cleanMessage || isSending) {
      return;
    }

    try {
      setIsSending(true);
      setError("");

      const data = await sendConversationMessage(conversationId, cleanMessage);
      const savedMessage = data?.data || data;

      if (savedMessage) {
        setMessages((currentMessages) => [...currentMessages, savedMessage]);
      }

      setMessageText("");
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
      <header className="create-header">
        <Link className="logo" to="/">
          <span className="logo-mark">H</span>
          <span>HayDing</span>
        </Link>

        <div className="create-header-actions">
          <div className="language-switcher" aria-label="Language switcher">
            {["DE", "EN", "AR"].map((lang) => (
              <button
                className={`language-btn ${language === lang ? "active" : ""}`}
                type="button"
                key={lang}
                onClick={() => setLanguage(lang)}
                aria-pressed={language === lang}
              >
                {lang}
              </button>
            ))}
          </div>

          <Link className="btn btn-secondary" to="/products">
            {text("Zurück", "رجوع", "Back")}
          </Link>
        </div>
      </header>

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

              {otherUser && (
                <Link
                  className="conversation-user-card"
                  to={`/users/${otherUser.id}`}
                >
                  <div className="conversation-avatar">
                    {getInitials(otherUser)}
                  </div>

                  <div>
                    <span className="conversation-label">
                      {text("Kontakt", "جهة التواصل", "Contact")}
                    </span>

                    <h3>{getUserName(otherUser)}</h3>

                    <p>
                      {otherUser.city ||
                        text(
                          "Ort nicht angegeben",
                          "المدينة غير محددة",
                          "City not specified"
                        )}
                    </p>
                  </div>
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

              <div className="conversation-messages">
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
                      <div className="message-bubble">
                        <p>{message.content}</p>

                        <span>
                          {getUserName(message.sender)} ·{" "}
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>

              <form className="conversation-form" onSubmit={handleSendMessage}>
                <textarea
                  value={messageText}
                  onChange={(event) => setMessageText(event.target.value)}
                  placeholder={text(
                    "Schreibe eine Nachricht...",
                    "اكتب رسالة...",
                    "Write a message..."
                  )}
                  rows="3"
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