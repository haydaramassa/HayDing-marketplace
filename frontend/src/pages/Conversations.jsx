import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { getConversations, getNotifications } from "../services/api";
import Navbar from "../components/Navbar";
import UserAvatar from "../components/UserAvatar";
import "../App.css";

function Conversations() {
  const navigate = useNavigate();
  const { isArabic, language } = useLanguage();

  const [conversations, setConversations] = useState([]);
  const [unreadMessageCounts, setUnreadMessageCounts] = useState({});
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

  function getNotificationConversationId(notification) {
    return (
      notification?.conversation?.id ||
      notification?.conversationId ||
      notification?.conversation?.conversationId ||
      notification?.conversation
    );
  }

  function isNotificationUnread(notification) {
    return (
      notification?.read === false ||
      notification?.isRead === false ||
      (!notification?.readAt && notification?.read !== true)
    );
  }

  function getUnreadCountForConversation(conversationId) {
    return Number(unreadMessageCounts[conversationId] || 0);
  }

  function getLastMessageText(conversation) {
    return (
      conversation.lastMessage?.content ||
      conversation.lastMessageContent ||
      conversation.lastMessagePreview ||
      ""
    );
  }

  function getConversationPreview(conversation, unreadCount) {
    if (unreadCount > 0) {
      if (unreadCount === 1) {
        return text("1 neue Nachricht", "رسالة جديدة واحدة", "1 new message");
      }

      return text(
        `${unreadCount} neue Nachrichten`,
        `${unreadCount} رسائل جديدة`,
        `${unreadCount} new messages`
      );
    }

    return getLastMessageText(conversation);
  }

  async function loadConversations(showLoading = false) {
    try {
      if (showLoading) {
        setIsLoading(true);
      }

      setError("");

      const conversationsData = await getConversations();
      const items = conversationsData?.data || conversationsData || [];

      setConversations(Array.isArray(items) ? items : []);

      const notificationsData = await getNotifications();
      const notifications = notificationsData?.data || notificationsData || [];

      const nextUnreadMessageCounts = {};

      if (Array.isArray(notifications)) {
        notifications
          .filter(
            (notification) =>
              notification?.type === "MESSAGE" &&
              isNotificationUnread(notification)
          )
          .forEach((notification) => {
            const conversationId = Number(
              getNotificationConversationId(notification)
            );

            if (!conversationId) return;

            nextUnreadMessageCounts[conversationId] =
              (nextUnreadMessageCounts[conversationId] || 0) + 1;
          });
      }

      setUnreadMessageCounts(nextUnreadMessageCounts);
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

  useEffect(() => {
    if (!localStorage.getItem("hayding-token")) {
      navigate("/login");
      return;
    }

    loadConversations(true);

    function handleNotificationsUpdated() {
      loadConversations(false);
    }

    window.addEventListener(
      "hayding-notifications-updated",
      handleNotificationsUpdated
    );

    const intervalId = setInterval(() => {
      loadConversations(false);
    }, 5000);

    return () => {
      clearInterval(intervalId);

      window.removeEventListener(
        "hayding-notifications-updated",
        handleNotificationsUpdated
      );
    };
  }, [navigate]);

  const currentUser = getCurrentUser();

  return (
    <div
      className={`create-page ${isArabic ? "rtl" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <Navbar variant="app" />

      <main className="conversations-compact-page">
        <section className="conversations-compact-shell">
          <header className="conversations-compact-header">
            <div>
              <p className="eyebrow">
                {text("Nachrichten", "الرسائل", "Messages")}
              </p>

              <h1>
                {text("Posteingang", "صندوق الرسائل", "Inbox")}
              </h1>
            </div>

            <span className="conversations-compact-count">
              {text(
                `${conversations.length} Konversationen`,
                `${conversations.length} محادثة`,
                `${conversations.length} conversations`
              )}
            </span>
          </header>

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
            <div className="conversations-compact-empty">
              <div>💬</div>

              <h2>
                {text(
                  "Noch keine Nachrichten.",
                  "لا توجد رسائل بعد.",
                  "No messages yet."
                )}
              </h2>

              <p>
                {text(
                  "Wenn jemand dich wegen einer Anzeige kontaktiert, erscheint die Konversation hier.",
                  "عندما يتواصل معك شخص بخصوص إعلان، ستظهر المحادثة هنا.",
                  "When someone contacts you about a listing, it will appear here."
                )}
              </p>
            </div>
          )}

          {!isLoading && !error && conversations.length > 0 && (
            <div className="conversations-compact-list">
              {conversations.map((conversation) => {
                const product = conversation.product;
                const unreadCount = getUnreadCountForConversation(conversation.id);
                const isUnread = unreadCount > 0;
                const preview = getConversationPreview(conversation, unreadCount);

                const otherUser =
                  Number(currentUser?.id) === Number(conversation?.buyer?.id)
                    ? conversation?.seller
                    : conversation?.buyer;

                return (
                  <Link
                    className={`conversation-compact-row ${
                      isUnread ? "unread" : ""
                    }`}
                    key={conversation.id}
                    to={`/conversations/${conversation.id}`}
                  >
                    <div className="conversation-compact-avatar">
                      <UserAvatar user={otherUser} size="medium" />

                      {isUnread && (
                        <span
                          className="conversation-compact-dot"
                          aria-hidden="true"
                        />
                      )}
                    </div>

                    <div className="conversation-compact-content">
                      <div className="conversation-compact-top">
                        <h2>{getUserName(otherUser)}</h2>

                        <time dateTime={getConversationDate(conversation) || ""}>
                          {formatDate(getConversationDate(conversation))}
                        </time>
                      </div>

                      <div className="conversation-compact-product">
                        {product?.title ||
                          text(
                            "Anzeige nicht verfügbar",
                            "الإعلان غير متاح",
                            "Listing unavailable"
                          )}
                      </div>

                      {preview && (
                        <p className="conversation-compact-preview">
                          {preview}
                        </p>
                      )}
                    </div>

                    {isUnread && (
                      <span className="conversation-compact-badge">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Conversations;