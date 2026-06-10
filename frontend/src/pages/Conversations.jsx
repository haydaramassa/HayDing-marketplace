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

    return (
      conversation.lastMessage?.content ||
      conversation.lastMessageContent ||
      conversation.lastMessagePreview ||
      text(
        "Noch keine Nachrichtenvorschau verfügbar",
        "لا توجد معاينة للرسائل بعد",
        "No message preview yet"
      )
    );
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
              const unreadCount = getUnreadCountForConversation(conversation.id);
              const isUnread = unreadCount > 0;

              const otherUser =
                Number(currentUser?.id) === Number(conversation?.buyer?.id)
                  ? conversation?.seller
                  : conversation?.buyer;

              return (
                <Link
                  className={`conversation-list-card ${
                    isUnread ? "conversation-list-card-unread" : ""
                  }`}
                  key={conversation.id}
                  to={`/conversations/${conversation.id}`}
                >
                  <div className="conversation-avatar-wrap">
                    <UserAvatar user={otherUser} size="medium" />

                    {isUnread && (
                      <span
                        className="conversation-unread-avatar-dot"
                        aria-hidden="true"
                      />
                    )}
                  </div>

                  <div className="conversation-list-main">
                    <div className="conversation-list-top">
                      <h2>{getUserName(otherUser)}</h2>

                      <div className="conversation-list-date-wrap">
                        {isUnread && (
                          <span className="conversation-unread-pill">
                            {unreadCount === 1
                              ? text("Neu", "جديد", "New")
                              : text(
                                  `${unreadCount} neu`,
                                  `${unreadCount} جديد`,
                                  `${unreadCount} new`
                                )}
                          </span>
                        )}

                        <span>
                          {formatDate(getConversationDate(conversation))}
                        </span>
                      </div>
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
                      {getConversationPreview(conversation, unreadCount)}
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