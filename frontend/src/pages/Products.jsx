import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { getProducts } from "../services/api";
import "../App.css";

function Products() {
  const { isArabic, language, setLanguage } = useLanguage();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  function text(de, ar, en) {
    if (isArabic) return ar;
    if (language === "EN") return en;
    return de;
  }

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        const items = data?.data || data || [];
        setProducts(Array.isArray(items) ? items : []);
      } catch (err) {
        setError(
          err.message ||
            text(
              "Anzeigen konnten nicht geladen werden.",
              "تعذر تحميل الإعلانات.",
              "Could not load listings."
            )
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

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

          <Link className="btn btn-secondary" to="/">
            {text("Zurück", "رجوع", "Back")}
          </Link>
        </div>
      </header>

      <main className="my-products-page">
        <div className="my-products-header">
          <div>
            <p className="eyebrow">
              {text("Entdecken", "استكشف", "Explore")}
            </p>

            <h1>
              {text(
                "Aktuelle Anzeigen",
                "الإعلانات الحالية",
                "Current listings"
              )}
            </h1>

            <p>
              {text(
                "Durchsuche aktive Anzeigen und finde Dinge, die in deiner Nähe angeboten werden.",
                "تصفح الإعلانات النشطة واعثر على أغراض معروضة بالقرب منك.",
                "Browse active listings and find items offered near you."
              )}
            </p>
          </div>
        </div>

        {isLoading && (
          <p className="auth-message auth-success">
            {text(
              "Anzeigen werden geladen...",
              "جارٍ تحميل الإعلانات...",
              "Loading listings..."
            )}
          </p>
        )}

        {error && <p className="auth-message auth-error">{error}</p>}

        {!isLoading && !error && products.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔎</div>
            <h2>
              {text(
                "Noch keine Anzeigen gefunden.",
                "لا توجد إعلانات بعد.",
                "No listings found yet."
              )}
            </h2>
            <p>
              {text(
                "Sobald neue Anzeigen veröffentlicht werden, erscheinen sie hier.",
                "عند نشر إعلانات جديدة، ستظهر هنا.",
                "Once new listings are published, they will appear here."
              )}
            </p>
          </div>
        )}

        {!isLoading && !error && products.length > 0 && (
          <div className="my-products-grid">
            {products.map((product) => (
              <article className="product-card my-product-card" key={product.id}>
                <div className="product-image my-product-image">
                  <button
                    className="image-arrow image-arrow-left"
                    type="button"
                    aria-label="Previous image"
                  >
                    ‹
                  </button>

                  <span className="image-counter">1/1</span>

                  <button
                    className="image-arrow image-arrow-right"
                    type="button"
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </div>

                <div className="product-info">
                  <span className="product-tag">
                    {product.conditionStatus ||
                      product.condition ||
                      text("Aktiv", "نشط", "Active")}
                  </span>

                  <h3>{product.title}</h3>

                  <p>{product.city}</p>

                  <strong>{product.price} €</strong>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Products;