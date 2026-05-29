import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import {
  addFavorite,
  getFavorites,
  getProducts,
  removeFavorite,
} from "../services/api";
import ProductCardImage from "../components/ProductCardImage";
import Navbar from "../components/Navbar";
import UserAvatar from "../components/UserAvatar";
import "../App.css";

function Products() {
  const { isArabic, language } = useLanguage();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteLoadingId, setFavoriteLoadingId] = useState(null);
  const [error, setError] = useState("");

  function text(de, ar, en) {
    if (isArabic) return ar;
    if (language === "EN") return en;
    return de;
  }

  function isLoggedIn() {
    return Boolean(localStorage.getItem("hayding-token"));
  }

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        const items = data?.data || data || [];
        setProducts(Array.isArray(items) ? items : []);

        if (isLoggedIn()) {
          const favoritesData = await getFavorites();
          const favorites = favoritesData?.data || favoritesData || [];

          const ids = Array.isArray(favorites)
            ? favorites.map(
                (item) => item.productId || item.product?.id || item.id
              )
            : [];

          setFavoriteIds(ids);
        }
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

  async function handleFavoriteClick(event, productId) {
    event.preventDefault();
    event.stopPropagation();

    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    const isFavorite = favoriteIds.includes(productId);

    try {
      setFavoriteLoadingId(productId);

      if (isFavorite) {
        await removeFavorite(productId);
        setFavoriteIds((currentIds) =>
          currentIds.filter((id) => id !== productId)
        );
      } else {
        await addFavorite(productId);
        setFavoriteIds((currentIds) => [...currentIds, productId]);
      }
    } catch (err) {
      setError(
        err.message ||
          text(
            "Favorit konnte nicht aktualisiert werden.",
            "تعذر تحديث المفضلة.",
            "Could not update favorite."
          )
      );
    } finally {
      setFavoriteLoadingId(null);
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
            {products.map((product) => {
              const isFavorite = favoriteIds.includes(product.id);
              const isFavoriteLoading = favoriteLoadingId === product.id;

              return (
                <Link
                  className="product-card my-product-card product-card-link"
                  key={product.id}
                  to={`/products/${product.id}`}
                >
                  <ProductCardImage product={product}>
                    <button
                      className={`favorite-btn ${isFavorite ? "active" : ""}`}
                      type="button"
                      onClick={(event) =>
                        handleFavoriteClick(event, product.id)
                      }
                      disabled={isFavoriteLoading}
                      aria-label={
                        isFavorite
                          ? text(
                              "Aus Favoriten entfernen",
                              "إزالة من المفضلة",
                              "Remove from favorites"
                            )
                          : text(
                              "Zu Favoriten hinzufügen",
                              "إضافة إلى المفضلة",
                              "Add to favorites"
                            )
                      }
                    >
                      {isFavorite ? "♥" : "♡"}
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

                    {product.seller?.id && (
                      <button
                        className="product-seller-mini product-seller-mini-button"
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          navigate(`/users/${product.seller.id}`);
                        }}
                      >
                        <UserAvatar user={product.seller} size="small" />

                        <span>
                          {product.seller.fullName ||
                            product.seller.email ||
                            text("Unbekannt", "غير معروف", "Unknown")}
                        </span>
                      </button>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Products;