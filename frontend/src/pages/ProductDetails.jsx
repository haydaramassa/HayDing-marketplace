import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { getProductById } from "../services/api";
import "../App.css";

function ProductDetails() {
  const { productId } = useParams();
  const { isArabic, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  function text(de, ar, en) {
    if (isArabic) return ar;
    if (language === "EN") return en;
    return de;
  }

  function getConditionLabel(conditionStatus) {
    const labels = {
      NEW: text("Neu", "جديد", "New"),
      LIKE_NEW: text("Wie neu", "شبه جديد", "Like new"),
      GOOD: text("Gut", "جيد", "Good"),
      ACCEPTABLE: text("Akzeptabel", "مقبول", "Acceptable"),
      USED: text("Gebraucht", "مستعمل", "Used"),
    };

    return labels[conditionStatus] || conditionStatus || text("Nicht angegeben", "غير محدد", "Not specified");
  }

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await getProductById(productId);
        setProduct(data?.data || data);
      } catch (err) {
        setError(
          err.message ||
            text(
              "Anzeige konnte nicht geladen werden.",
              "تعذر تحميل الإعلان.",
              "Could not load listing."
            )
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

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
            {["DE", "AR", "EN"].map((lang) => (
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

          <button className="btn btn-secondary" type="button" onClick={() => navigate(-1)}>
            {text("Zurück", "رجوع", "Back")}
          </button>
        </div>
      </header>

      <main className="product-details-page">
        {isLoading && (
          <p className="auth-message auth-success">
            {text("Anzeige wird geladen...", "جارٍ تحميل الإعلان...", "Loading listing...")}
          </p>
        )}

        {error && <p className="auth-message auth-error">{error}</p>}

        {!isLoading && !error && product && (
          <div className="product-details-layout">
            <section className="product-details-gallery">
              <div className="product-details-image">
                <span>📦</span>
              </div>

              <div className="product-thumbnails">
                <button type="button" className="thumbnail active">📦</button>
                <button type="button" className="thumbnail">＋</button>
                <button type="button" className="thumbnail">＋</button>
              </div>
            </section>

            <section className="product-details-info">
              <p className="eyebrow">
                {text("Anzeige", "إعلان", "Listing")}
              </p>

              <h1>{product.title}</h1>

              <strong className="details-price">{product.price} €</strong>

              <div className="details-meta">
                <div>
                  <span>{text("Stadt", "المدينة", "City")}</span>
                  <strong>{product.city || text("Nicht angegeben", "غير محدد", "Not specified")}</strong>
                </div>

                <div>
                  <span>{text("Zustand", "الحالة", "Condition")}</span>
                  <strong>{getConditionLabel(product.conditionStatus || product.condition)}</strong>
                </div>

                <div>
                  <span>{text("Status", "الحالة العامة", "Status")}</span>
                  <strong>{product.productStatus || text("Aktiv", "نشط", "Active")}</strong>
                </div>
              </div>

              <div className="details-section">
                <h2>{text("Beschreibung", "الوصف", "Description")}</h2>
                <p>
                  {product.description ||
                    text(
                      "Keine Beschreibung vorhanden.",
                      "لا يوجد وصف متاح.",
                      "No description available."
                    )}
                </p>
              </div>

              <div className="details-actions">
                <button className="btn btn-primary" type="button">
                  {text("Nachricht senden", "إرسال رسالة", "Send message")}
                </button>

                <button className="btn btn-secondary" type="button">
                  {text("Merken", "حفظ", "Save")}
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default ProductDetails;