import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import {
  deleteProduct,
  getMyProducts,
  markProductAsSold,
} from "../services/api";
import { getPrimaryProductImage } from "../utils/productImages";
import "../App.css";

function MyProducts() {
  const { isArabic, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRefs = useRef({});

  function text(de, ar, en) {
    if (isArabic) return ar;
    if (language === "EN") return en;
    return de;
  }

  function getStatusLabel(status) {
    const productStatus = status || "ACTIVE";

    if (productStatus === "SOLD") {
      return text("Verkauft", "مباع", "Sold");
    }

    if (productStatus === "RESERVED") {
      return text("Reserviert", "محجوز", "Reserved");
    }

    return text("Aktiv", "نشط", "Active");
  }

  function getConditionLabel(conditionStatus) {
    const labels = {
      NEW: text("Neu", "جديد", "New"),
      LIKE_NEW: text("Wie neu", "شبه جديد", "Like new"),
      GOOD: text("Gut", "جيد", "Good"),
      ACCEPTABLE: text("Akzeptabel", "مقبول", "Acceptable"),
      USED: text("Gebraucht", "مستعمل", "Used"),
    };

    return (
      labels[conditionStatus] ||
      conditionStatus ||
      text("Zustand", "الحالة", "Condition")
    );
  }

  async function handleMarkAsSold(productId) {
    const confirmed = window.confirm(
      text(
        "Diese Anzeige als verkauft markieren?",
        "هل تريد تحديد هذا الإعلان كمباع؟",
        "Mark this listing as sold?"
      )
    );

    if (!confirmed) return;

    try {
      await markProductAsSold(productId);

      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === productId
            ? { ...product, productStatus: "SOLD" }
            : product
        )
      );
    } catch (err) {
      setError(
        err.message ||
          text(
            "Anzeige konnte nicht als verkauft markiert werden.",
            "تعذر تحديد الإعلان كمباع.",
            "Could not mark listing as sold."
          )
      );
    }
  }

  async function handleDelete(productId) {
    const confirmed = window.confirm(
      text(
        "Diese Anzeige wirklich löschen?",
        "هل تريد حذف هذا الإعلان فعلًا؟",
        "Do you really want to delete this listing?"
      )
    );

    if (!confirmed) return;

    try {
      await deleteProduct(productId);

      setProducts((currentProducts) =>
        currentProducts.filter((product) => product.id !== productId)
      );
    } catch (err) {
      setError(
        err.message ||
          text(
            "Anzeige konnte nicht gelöscht werden.",
            "تعذر حذف الإعلان.",
            "Could not delete listing."
          )
      );
    }
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

  useEffect(() => {
    function handleClickOutside(event) {
      const openMenuElement = menuRefs.current[openMenuId];

      if (openMenuElement && !openMenuElement.contains(event.target)) {
        setOpenMenuId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId]);

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

            <h1>{text("Deine Anzeigen", "إعلاناتك", "Your listings")}</h1>

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
            {products.map((product) => {
              const imageUrl = getPrimaryProductImage(product);

              return (
                <article
                  className="product-card my-product-card my-management-card"
                  key={product.id}
                >
                  <div
                    className={`card-menu ${
                      openMenuId === product.id ? "open" : ""
                    }`}
                    ref={(element) => {
                      menuRefs.current[product.id] = element;
                    }}
                  >
                    <button
                      className="card-menu-button"
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setOpenMenuId((currentId) =>
                          currentId === product.id ? null : product.id
                        );
                      }}
                      aria-label={text("Aktionen", "خيارات", "Actions")}
                      aria-expanded={openMenuId === product.id}
                    >
                      ⋯
                    </button>

                    <div className="card-menu-list">
                      <Link
                        to={`/products/${product.id}`}
                        onClick={() => setOpenMenuId(null)}
                      >
                        {text("Ansehen", "عرض", "View")}
                      </Link>

                      <Link
                        to={`/edit-product/${product.id}`}
                        onClick={() => setOpenMenuId(null)}
                      >
                        {text("Bearbeiten", "تعديل", "Edit")}
                      </Link>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setOpenMenuId(null);
                          handleMarkAsSold(product.id);
                        }}
                        disabled={product.productStatus === "SOLD"}
                      >
                        {text(
                          "Als verkauft markieren",
                          "تحديد كمباع",
                          "Mark as sold"
                        )}
                      </button>

                      <button
                        className="danger"
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setOpenMenuId(null);
                          handleDelete(product.id);
                        }}
                      >
                        {text("Löschen", "حذف", "Delete")}
                      </button>
                    </div>
                  </div>

                  <Link
                    className="product-card-link"
                    to={`/products/${product.id}`}
                  >
                    <div className="product-image my-product-image">
                      {imageUrl && (
                        <img
                          className="product-real-image"
                          src={imageUrl}
                          alt={product.title}
                        />
                      )}

                      <span className="image-counter">1/1</span>
                    </div>

                    <div className="product-info">
                      <div className="product-card-tags">
                        <span className="product-tag">
                          {getConditionLabel(
                            product.conditionStatus || product.condition
                          )}
                        </span>

                        <span
                          className={`status-pill status-${(
                            product.productStatus || "ACTIVE"
                          ).toLowerCase()}`}
                        >
                          {getStatusLabel(product.productStatus)}
                        </span>
                      </div>

                      <h3>{product.title}</h3>

                      <p>{product.city}</p>

                      <strong>{product.price} €</strong>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyProducts;