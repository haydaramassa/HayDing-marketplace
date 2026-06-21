import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { getNotifications, getUnreadNotificationCount } from "../services/api";
import UserAvatar from "./UserAvatar";

function Navbar({ variant = "home" }) {
  const { language, setLanguage, isArabic } = useLanguage();
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("hayding-token"));

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [unreadMessageNotificationCount, setUnreadMessageNotificationCount] =
    useState(0);

  const accountMenuRef = useRef(null);

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

  const currentUser = getCurrentUser();

  const accountLabel =
    currentUser?.fullName ||
    currentUser?.email ||
    text("Mein Konto", "حسابي", "My account");

  const hasNotificationBadge = isLoggedIn && unreadNotificationCount > 0;
  const hasMessageBadge = isLoggedIn && unreadMessageNotificationCount > 0;

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target)
      ) {
        setIsAccountMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setUnreadNotificationCount(0);
      setUnreadMessageNotificationCount(0);
      return;
    }

    async function loadUnreadNotificationState() {
      try {
        const countData = await getUnreadNotificationCount();
        const count = countData?.data ?? countData ?? 0;

        setUnreadNotificationCount(Number(count) || 0);

        const notificationsData = await getNotifications();
        const notifications = notificationsData?.data || notificationsData || [];

        const unreadMessageCount = Array.isArray(notifications)
          ? notifications.filter(
              (notification) =>
                notification?.type === "MESSAGE" && !notification?.read
            ).length
          : 0;

        setUnreadMessageNotificationCount(unreadMessageCount);
      } catch {
        setUnreadNotificationCount(0);
        setUnreadMessageNotificationCount(0);
      }
    }

    function handleNotificationsUpdated() {
      loadUnreadNotificationState();
    }

    loadUnreadNotificationState();

    window.addEventListener(
      "hayding-notifications-updated",
      handleNotificationsUpdated
    );

    const intervalId = setInterval(loadUnreadNotificationState, 10000);

    return () => {
      clearInterval(intervalId);

      window.removeEventListener(
        "hayding-notifications-updated",
        handleNotificationsUpdated
      );
    };
  }, [isLoggedIn]);

  function handleLogout() {
    localStorage.removeItem("hayding-token");
    localStorage.removeItem("hayding-user");
    setIsAccountMenuOpen(false);
    navigate("/");
  }

  return (
    <header className="navbar">
      <Link className="logo" to="/">
        <span className="logo-mark logo-image-mark">
          <img src="/icon/hayding-mark.png" alt="" aria-hidden="true" />
        </span>

        <span>HayDing</span>
      </Link>

      <nav className="nav-links">
        {variant === "home" ? (
          <>
            <a href="#categories">
              {text("Kategorien", "الفئات", "Categories")}
            </a>

            <a href="#how-it-works">
              {text("So funktioniert's", "كيف يعمل", "How it works")}
            </a>

            <Link to="/products">
              {text("Entdecken", "استكشف", "Explore")}
            </Link>
          </>
        ) : (
          <>
            <Link to="/products">
              {text("Entdecken", "استكشف", "Explore")}
            </Link>

            {isLoggedIn && (
              <Link className="nav-link-with-badge" to="/conversations">
                {text("Nachrichten", "الرسائل", "Messages")}

                {hasMessageBadge && (
                  <span
                    className="nav-notification-dot"
                    aria-label={text(
                      "Du hast neue Nachrichten",
                      "لديك رسائل جديدة",
                      "You have new messages"
                    )}
                  />
                )}
              </Link>
            )}

            {isLoggedIn && (
              <Link to="/favorites">
                {text("Favoriten", "المفضلة", "Favorites")}
              </Link>
            )}
          </>
        )}
      </nav>

      <div className="nav-actions">
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

        {isLoggedIn ? (
          <>
            <Link className="btn btn-primary nav-create-btn" to="/create-product">
              {text("Anzeige erstellen", "إضافة إعلان", "Create listing")}
            </Link>

            <div
              className={`account-menu ${isAccountMenuOpen ? "open" : ""}`}
              ref={accountMenuRef}
            >
              <button
                className="account-menu-button"
                type="button"
                onClick={() => setIsAccountMenuOpen((current) => !current)}
                aria-expanded={isAccountMenuOpen}
              >
                <UserAvatar user={currentUser} size="small" />

                <span className="account-menu-name">{accountLabel}</span>

                {hasNotificationBadge && (
                  <span
                    className="account-menu-badge account-menu-main-badge"
                    aria-label={text(
                      "Neue Benachrichtigungen",
                      "إشعارات جديدة",
                      "New notifications"
                    )}
                  >
                    {unreadNotificationCount}
                  </span>
                )}

                <span className="account-menu-chevron" aria-hidden="true">
                  ▾
                </span>
              </button>

              <div className="account-menu-list">
                <Link
                  to="/account"
                  onClick={() => setIsAccountMenuOpen(false)}
                >
                  {text("Konto", "حسابي", "Account")}
                </Link>

                <Link
                  className="account-menu-link-with-badge"
                  to="/notifications"
                  onClick={() => setIsAccountMenuOpen(false)}
                >
                  <span>
                    {text(
                      "Benachrichtigungen",
                      "الإشعارات",
                      "Notifications"
                    )}
                  </span>

                  {hasNotificationBadge && (
                    <span className="account-menu-badge">
                      {unreadNotificationCount}
                    </span>
                  )}
                </Link>

                <Link
                  className="account-menu-link-with-badge"
                  to="/conversations"
                  onClick={() => setIsAccountMenuOpen(false)}
                >
                  <span>{text("Nachrichten", "الرسائل", "Messages")}</span>

                  {hasMessageBadge && (
                    <span className="account-menu-badge">
                      {unreadMessageNotificationCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/my-products"
                  onClick={() => setIsAccountMenuOpen(false)}
                >
                  {text("Meine Anzeigen", "إعلاناتي", "My listings")}
                </Link>

                <Link
                  to="/favorites"
                  onClick={() => setIsAccountMenuOpen(false)}
                >
                  {text("Favoriten", "المفضلة", "Favorites")}
                </Link>

                <button type="button" onClick={handleLogout}>
                  {text("Logout", "تسجيل الخروج", "Logout")}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <Link className="btn btn-secondary" to="/login">
              {text("Login", "تسجيل الدخول", "Login")}
            </Link>

            <Link className="btn btn-primary nav-create-btn" to="/register">
              {text("Anzeige erstellen", "إضافة إعلان", "Create listing")}
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;