import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { getMyProducts } from "../services/api";
import "../App.css";

function MyProducts() {
  const { isArabic, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  function text(de, ar, en) {
    if (isArabic) return ar;
    if (language === "EN") return en;
    return de;
  }

  useEffect(() => {
    const token = localStorage.getItem("hayding-token");

    if (!token) {
      navigate("/login");
      return;
    }

    async function loadMyProducts() {
      try {
        const data = await getMyProducts();
        const items = data?.data || data || [];
        setProducts(Array.isArray(items) ? items : []);
      } catch (err) {
        setError(
          err.message ||
            text(
              "Deine Anzeigen konnten nicht geladen werden.",
              "تعذر تحميل إعلاناتك.",
              "Could not load your listings."
            )
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadMyProducts();
  }, [navigate]);

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

          <Link className="btn btn-primary" to="/create-product">
            {text("Neue Anzeige", "إعلان جديد", "New listing")}
          </Link>

          <Link className="btn btn-secondary" to="/">
            {text("Zurück", "رجوع", "Back")}
          </Link>
        </div>
      </header>

      <main className="my-products-page">
      <div className="my-products-header">
  <div>
    <p className="eyebrow">
      {text("Meine Anzeigen", "إعلاناتي", "My listings")}
    </p>

    <h1>
      {text(
        "Deine Anzeigen",
        "إعلاناتك",
        "Your listings"
      )}
    </h1>

    <p>
      {text(
        "Verwalte deine veröffentlichten Artikel an einem Ort.",
        "أدر إعلاناتك المنشورة من مكان واحد.",
        "Manage your published items in one place."
      )}
    </p>
  </div>

  <Link className="btn btn-primary" to="/create-product">
    {text("Neue Anzeige", "إعلان جديد", "New listing")}
  </Link>
</div>

        {isLoading && (
          <p className="auth-message auth-success">
            {text("Anzeigen werden geladen...", "جارٍ تحميل الإعلانات...", "Loading listings...")}
          </p>
        )}

        {error && <p className="auth-message auth-error">{error}</p>}

        {!isLoading && !error && products.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h2>
              {text(
                "Du hast noch keine Anzeigen.",
                "ليس لديك إعلانات بعد.",
                "You do not have any listings yet."
              )}
            </h2>
            <p>
              {text(
                "Erstelle deine erste Anzeige und gib Dingen eine neue Chance.",
                "أنشئ إعلانك الأول وامنح أغراضك فرصة جديدة.",
                "Create your first listing and give things a new chance."
              )}
            </p>
            <Link className="btn btn-primary" to="/create-product">
              {text("Anzeige erstellen", "إضافة إعلان", "Create listing")}
            </Link>
          </div>
        )}

        {!isLoading && !error && products.length > 0 && (
          <div className="my-products-grid">
            {products.map((product) => (
             <Link
             className="product-card my-product-card product-card-link"
             key={product.id}
             to={`/products/${product.id}`}
           >
             <div className="product-image my-product-image">
               <button className="image-arrow image-arrow-left" type="button" aria-label="Previous image">
                 ‹
               </button>
           
               <span className="image-counter">1/1</span>
           
               <button className="image-arrow image-arrow-right" type="button" aria-label="Next image">
                 ›
               </button>
             </div>
           
             <div className="product-info">
               <span className="product-tag">
                 {product.conditionStatus || product.condition || text("Aktiv", "نشط", "Active")}
               </span>
           
               <h3>{product.title}</h3>
           
               <p>{product.city}</p>
           
               <strong>{product.price} €</strong>
             </div>
             </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyProducts;