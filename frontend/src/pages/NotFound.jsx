import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import Navbar from "../components/Navbar";
import "../App.css";

function NotFound() {
  const { isArabic, language } = useLanguage();

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
      <Navbar variant="app" />

      <main className="not-found-page">
        <section className="not-found-card">
          <p className="eyebrow">404</p>

          <h1>
            {text(
              "Seite nicht gefunden",
              "الصفحة غير موجودة",
              "Page not found"
            )}
          </h1>

          <p>
            {text(
              "Die gesuchte Seite existiert nicht oder wurde verschoben.",
              "الصفحة التي تبحث عنها غير موجودة أو تم نقلها.",
              "The page you are looking for does not exist or has been moved."
            )}
          </p>

          <div className="not-found-actions">
            <Link className="btn btn-primary" to="/products">
              {text(
                "Anzeigen entdecken",
                "استكشف الإعلانات",
                "Explore listings"
              )}
            </Link>

            <Link className="btn btn-secondary" to="/">
              {text("Zur Startseite", "إلى الرئيسية", "Back home")}
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default NotFound;