import { Link, useParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import "../App.css";

function ConversationDetails() {
  const { conversationId } = useParams();
  const { isArabic, language, setLanguage } = useLanguage();

  function text(de, ar, en) {
    if (isArabic) return ar;
    if (language === "EN") return en;
    return de;
  }

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

      <main className="my-products-page">
        <div className="my-products-header">
          <div>
            <p className="eyebrow">
              {text("Nachrichten", "الرسائل", "Messages")}
            </p>

            <h1>
              {text("Konversation", "المحادثة", "Conversation")}
            </h1>

            <p>
              {text(
                `Konversation #${conversationId} wurde geöffnet.`,
                `تم فتح المحادثة رقم ${conversationId}.`,
                `Conversation #${conversationId} opened.`
              )}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ConversationDetails;