import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { getConversations } from "../services/api";
import Navbar from "../components/Navbar";
import UserAvatar from "../components/UserAvatar";
import "../App.css";

function Conversations() {
  const navigate = useNavigate();
  const { isArabic, language } = useLanguage();

  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

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

  function getConversationDate(conversation) {
    return (
      conversation?.lastMessageAt ||
      conversation?.updatedAt ||
      conversation?.createdAt ||
      conversation?.product?.createdAt
    );
  }

  useEffect(() => {
    if (!localStorage.getItem("hayding-token")) {
      navigate("/login");
      return;
    }

    async function loadConversations() {
      try {
        setIsLoading(true);
        setError("");

        const data = await getConversations();
        const items = data?.data || data || [];

        setConversations(Array.isArray(items) ? items : []);
      } catch (err) {
        setError(
          err.message ||
            text(
              "Konversationen konnten nicht geladen werden.",
              "تعذر تحميل المحادثات.",
              "Could not load conversations."
            )
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadConversations();
  }, [navigate]);

  const currentUser = getCurrentUser();

  return (
    <div
      className={`create-page ${isArabic ? "rtl" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <Navbar variant="app" />

      <main className="my-products-page conversations-page">
        <div className="my-products-header">
          <div>
            <p className="eyebrow">
              {text("Nachrichten", "الرسائل", "Messages")}
            </p>

            <h1>
              {text(
                "Meine Konversationen",
                "محادثاتي",
                "My conversations"
              )}
            </h1>

            <p>
              {text(
                "Hier findest du alle Nachrichten zu deinen Käufen und Verkäufen.",
                "هنا تجد كل الرسائل المتعلقة بعمليات الشراء والبيع.",
                "Find all messages related to your buying and selling here."
              )}
            </p>
          </div>
        </div>

        {isLoading && (
          <p className="auth-message auth-success">
            {text(
              "Konversationen werden geladen...",
              "جارٍ تحميل المحادثات...",
              "Loading conversations..."
            )}
          </p>
        )}

        {error && <p className="auth-message auth-error">{error}</p>}

        {!isLoading && !error && conversations.length === 0 && (
          <div className="empty-state">
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
                "Wenn jemand dich wegen einer Anzeige kontaktiert oder du eine Nachricht sendest, erscheint die Konversation hier.",
                "عندما يتواصل معك شخص بخصوص إعلان أو ترسل أنت رسالة، ستظهر المحادثة هنا.",
                "When someone contacts you about a listing, or you send a message, the conversation will appear here."
              )}
            </p>
          </div>
        )}

        {!isLoading && !error && conversations.length > 0 && (
          <div className="conversations-list">
            {conversations.map((conversation) => {
              const product = conversation.product;

              const otherUser =
                Number(currentUser?.id) === Number(conversation?.buyer?.id)
                  ? conversation?.seller
                  : conversation?.buyer;

              return (
                <Link
                  className="conversation-list-card"
                  key={conversation.id}
                  to={`/conversations/${conversation.id}`}
                >
                  <UserAvatar user={otherUser} size="medium" />

                  <div className="conversation-list-main">
                    <div className="conversation-list-top">
                      <h2>{getUserName(otherUser)}</h2>

                      <span>
                        {formatDate(getConversationDate(conversation))}
                      </span>
                    </div>

                    <p className="conversation-list-product">
                      {product?.title ||
                        text(
                          "Anzeige nicht verfügbar",
                          "الإعلان غير متاح",
                          "Listing unavailable"
                        )}
                    </p>

                    <p className="conversation-list-preview">
                      {conversation.lastMessage?.content ||
                        conversation.lastMessageContent ||
                        text(
                          "Konversation öffnen",
                          "افتح المحادثة",
                          "Open conversation"
                        )}
                    </p>
                  </div>

                  <span className="conversation-list-arrow">›</span>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Conversations;