import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import {
  getNotifications,
  markAllNotificationsAsRead,
} from "../services/api";
import Navbar from "../components/Navbar";
import "../App.css";

function Notifications() {
  const { isArabic, language } = useLanguage();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [error, setError] = useState("");

  function text(de, ar, en) {
    if (isArabic) return ar;
    if (language === "EN") return en;
    return de;
  }

  function getActorName(notification) {
    return (
      notification.actorName ||
      text("Ein Nutzer", "مستخدم", "A user")
    );
  }

  function getNotificationTitle(notification) {
    if (notification.type === "MESSAGE") {
      return text(
        `${getActorName(notification)} hat dir eine Nachricht gesendet`,
        `أرسل لك ${getActorName(notification)} رسالة`,
        `${getActorName(notification)} sent you a message`
      );
    }

    if (notification.type === "FAVORITE") {
      return text(
        `${getActorName(notification)} hat deine Anzeige gespeichert`,
        `أضاف ${getActorName(notification)} إعلانك إلى المفضلة`,
        `${getActorName(notification)} saved your listing`
      );
    }

    return text("Neue Benachrichtigung", "إشعار جديد", "New notification");
  }

  function getNotificationText(notification) {
    if (notification.type === "MESSAGE") {
      return (
        notification.messagePreview ||
        text(
          "Öffne die Unterhaltung, um die Nachricht zu lesen.",
          "افتح المحادثة لقراءة الرسالة.",
          "Open the conversation to read the message."
        )
      );
    }

    if (notification.type === "FAVORITE") {
      return notification.productTitle
        ? text(
            `Anzeige: ${notification.productTitle}`,
            `الإعلان: ${notification.productTitle}`,
            `Listing: ${notification.productTitle}`
          )
        : text(
            "Jemand hat eine deiner Anzeigen gespeichert.",
            "قام شخص بحفظ أحد إعلاناتك.",
            "Someone saved one of your listings."
          );
    }

    return "";
  }

  function getNotificationIcon(notification) {
    if (notification.type === "MESSAGE") return "💬";
    if (notification.type === "FAVORITE") return "❤️";
    return "🔔";
  }

  function formatDate(dateValue) {
    if (!dateValue) return "";

    try {
      return new Intl.DateTimeFormat(
        language === "AR" ? "ar" : language === "EN" ? "en" : "de-DE",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      ).format(new Date(dateValue));
    } catch {
      return dateValue;
    }
  }

  function getNotificationTarget(notification) {
    if (notification.type === "MESSAGE" && notification.conversationId) {
      return `/conversations/${notification.conversationId}`;
    }

    if (notification.type === "FAVORITE" && notification.productId) {
      return `/products/${notification.productId}`;
    }

    return "/notifications";
  }

  async function loadNotifications() {
    try {
      setIsLoading(true);
      setError("");

      const data = await getNotifications();
      const loadedNotifications = data?.data || data || [];

      setNotifications(
        Array.isArray(loadedNotifications) ? loadedNotifications : []
      );
    } catch (err) {
      setError(
        err.message ||
          text(
            "Benachrichtigungen konnten nicht geladen werden.",
            "تعذر تحميل الإشعارات.",
            "Could not load notifications."
          )
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleMarkAllAsRead() {
    try {
      setIsMarkingRead(true);
      setError("");

      await markAllNotificationsAsRead();

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      window.dispatchEvent(new Event("hayding-notifications-updated"));
    } catch (err) {
      setError(
        err.message ||
          text(
            "Benachrichtigungen konnten nicht als gelesen markiert werden.",
            "تعذر تعليم الإشعارات كمقروءة.",
            "Could not mark notifications as read."
          )
      );
    } finally {
      setIsMarkingRead(false);
    }
  }

  function handleNotificationClick(notification) {
    navigate(getNotificationTarget(notification));
  }

  useEffect(() => {
    if (!localStorage.getItem("hayding-token")) {
      navigate("/login");
      return;
    }

    loadNotifications();
  }, [navigate]);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  return (
    <div
      className={`create-page ${isArabic ? "rtl" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <Navbar variant="app" />

      <main className="notifications-page">
        <section className="notifications-hero">
          <div>
            <p className="eyebrow">
              {text("Benachrichtigungen", "الإشعارات", "Notifications")}
            </p>

            <h1>
              {text(
                "Was gibt es Neues?",
                "ما الجديد؟",
                "What’s new?"
              )}
            </h1>

            <p>
              {text(
                "Hier findest du neue Nachrichten und Aktivitäten zu deinen Anzeigen.",
                "هنا تجد الرسائل الجديدة والنشاطات المتعلقة بإعلاناتك.",
                "Find new messages and activity around your listings here."
              )}
            </p>
          </div>

          <div className="notifications-summary-card">
            <span>🔔</span>
            <strong>{unreadCount}</strong>
            <p>
              {text(
                "ungelesen",
                "غير مقروءة",
                "unread"
              )}
            </p>
          </div>
        </section>

        <section className="notifications-card">
          <div className="notifications-toolbar">
            <div>
              <h2>
                {text(
                  "Aktuelle Benachrichtigungen",
                  "الإشعارات الحالية",
                  "Recent notifications"
                )}
              </h2>

              <p>
                {text(
                  `${notifications.length} Einträge`,
                  `${notifications.length} إشعار`,
                  `${notifications.length} items`
                )}
              </p>
            </div>

            <button
              className="btn btn-secondary"
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingRead || unreadCount === 0}
            >
              {isMarkingRead
                ? text("Wird aktualisiert...", "جارٍ التحديث...", "Updating...")
                : text(
                    "Alle als gelesen markieren",
                    "تعليم الكل كمقروء",
                    "Mark all as read"
                  )}
            </button>
          </div>

          {isLoading && (
            <p className="auth-message auth-success">
              {text(
                "Benachrichtigungen werden geladen...",
                "جارٍ تحميل الإشعارات...",
                "Loading notifications..."
              )}
            </p>
          )}

          {error && <p className="auth-message auth-error">{error}</p>}

          {!isLoading && !error && notifications.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔕</div>

              <h2>
                {text(
                  "Noch keine Benachrichtigungen.",
                  "لا توجد إشعارات بعد.",
                  "No notifications yet."
                )}
              </h2>

              <p>
                {text(
                  "Neue Nachrichten und Aktivitäten erscheinen hier.",
                  "ستظهر الرسائل والنشاطات الجديدة هنا.",
                  "New messages and activity will appear here."
                )}
              </p>
            </div>
          )}

          {!isLoading && !error && notifications.length > 0 && (
            <div className="notifications-list">
              {notifications.map((notification) => (
                <button
                  className={`notification-item ${
                    notification.read ? "read" : "unread"
                  }`}
                  type="button"
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <span className="notification-icon">
                    {getNotificationIcon(notification)}
                  </span>

                  <span className="notification-content">
                    <strong>{getNotificationTitle(notification)}</strong>
                    <span>{getNotificationText(notification)}</span>
                    <small>{formatDate(notification.createdAt)}</small>
                  </span>

                  {!notification.read && (
                    <span className="notification-unread-dot" />
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        <div className="notifications-actions">
          <Link className="btn btn-secondary" to="/conversations">
            {text("Nachrichten öffnen", "فتح الرسائل", "Open messages")}
          </Link>

          <Link className="btn btn-primary" to="/products">
            {text("Anzeigen entdecken", "استكشف الإعلانات", "Explore listings")}
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Notifications;