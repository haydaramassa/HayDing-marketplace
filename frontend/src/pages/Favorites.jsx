import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { getFavorites, removeFavorite } from "../services/api";
import ProductCardImage from "../components/ProductCardImage";
import Navbar from "../components/Navbar";
import "../App.css";

function Favorites() {
  const { isArabic, language } = useLanguage();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState("");

  function text(de, ar, en) {
    if (isArabic) return ar;
    if (language === "EN") return en;
    return de;
  }

  function isLoggedIn() {
    return Boolean(localStorage.getItem("hayding-token"));
  }

  function normalizeFavoriteItem(item) {
    return item?.product || item;
  }

  useEffect(() => {
    async function loadFavorites() {
      if (!isLoggedIn()) {
        navigate("/login");
        return;
      }

      try {
        const data = await getFavorites();
        const items = data?.data || data || [];

        const normalizedItems = Array.isArray(items)
          ? items.map(normalizeFavoriteItem).filter(Boolean)
          : [];

        setFavorites(normalizedItems);
      } catch (err) {
        setError(
          err.message ||
            text(
              "Favoriten konnten nicht geladen werden.",
              "تعذر تحميل المفضلة.",
              "Could not load favorites."
            )
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadFavorites();
  }, [navigate]);

  async function handleRemoveFavorite(event, productId) {
    event.preventDefault();
    event.stopPropagation();

    try {
      setRemovingId(productId);
      await removeFavorite(productId);

      setFavorites((currentFavorites) =>
        currentFavorites.filter((product) => product.id !== productId)
      );
    } catch (err) {
      setError(
        err.message ||
          text(
            "Favorit konnte nicht entfernt werden.",
            "تعذر إزالة المنتج من المفضلة.",
            "Could not remove favorite."
          )
      );
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div
      className={`create-page ${isArabic ? "rtl" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <Navbar variant="app" />

      <main className="my-products-page">
        <div className="my-products-header">
          <div>
            <p className="eyebrow">
              {text("Favoriten", "المفضلة", "Favorites")}
            </p>

            <h1>
              {text(
                "Gespeicherte Anzeigen",
                "الإعلانات المحفوظة",
                "Saved listings"
              )}
            </h1>

            <p>
              {text(
                "Hier findest du alle Anzeigen, die du gespeichert hast.",
                "هنا تجد كل الإعلانات التي حفظتها.",
                "Find all the listings you saved here."
              )}
            </p>
          </div>
        </div>

        {isLoading && (
          <p className="auth-message auth-success">
            {text(
              "Favoriten werden geladen...",
              "جارٍ تحميل المفضلة...",
              "Loading favorites..."
            )}
          </p>
        )}

        {error && <p className="auth-message auth-error">{error}</p>}

        {!isLoading && !error && favorites.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">♡</div>

            <h2>
              {text(
                "Noch keine Favoriten.",
                "لا توجد عناصر محفوظة بعد.",
                "No favorites yet."
              )}
            </h2>

            <p>
              {text(
                "Speichere Anzeigen über das Herz-Symbol, damit sie hier erscheinen.",
                "احفظ الإعلانات من زر القلب حتى تظهر هنا.",
                "Save listings using the heart button so they appear here."
              )}
            </p>

            <Link className="btn btn-primary" to="/products">
              {text(
                "Anzeigen entdecken",
                "استكشف الإعلانات",
                "Explore listings"
              )}
            </Link>
          </div>
        )}

        {!isLoading && !error && favorites.length > 0 && (
          <div className="my-products-grid">
            {favorites.map((product) => (
              <Link
                className="product-card my-product-card product-card-link"
                key={product.id}
                to={`/products/${product.id}`}
              >
                <ProductCardImage product={product}>
                  <button
                    className="favorite-btn active"
                    type="button"
                    onClick={(event) =>
                      handleRemoveFavorite(event, product.id)
                    }
                    disabled={removingId === product.id}
                    aria-label={text(
                      "Aus Favoriten entfernen",
                      "إزالة من المفضلة",
                      "Remove from favorites"
                    )}
                  >
                    ♥
                  </button>
                </ProductCardImage>

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
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Favorites;