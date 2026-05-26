import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

function Navbar({ variant = "home" }) {
  const { language, setLanguage, isArabic } = useLanguage();
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem("hayding-token"));

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);

  function text(de, ar, en) {
    if (isArabic) return ar;
    if (language === "EN") return en;
    return de;
  }

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

  function handleLogout() {
    localStorage.removeItem("hayding-token");
    localStorage.removeItem("hayding-user");
    setIsAccountMenuOpen(false);
    navigate("/");
  }

  return (
    <header className="navbar">
      <Link className="logo" to="/">
        <span className="logo-mark">H</span>
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
              <Link to="/conversations">
                {text("Nachrichten", "الرسائل", "Messages")}
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
                <span>{text("Mein Konto", "حسابي", "My account")}</span>

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
                  to="/conversations"
                  onClick={() => setIsAccountMenuOpen(false)}
                >
                  {text("Nachrichten", "الرسائل", "Messages")}
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