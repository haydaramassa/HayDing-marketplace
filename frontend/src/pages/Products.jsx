import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteLoadingId, setFavoriteLoadingId] = useState(null);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [cityFilter, setCityFilter] = useState(searchParams.get("city") || "");
  const [conditionFilter, setConditionFilter] = useState(
    searchParams.get("condition") || ""
  );

  function text(de, ar, en) {
    if (isArabic) return ar;
    if (language === "EN") return en;
    return de;
  }

  function isLoggedIn() {
    return Boolean(localStorage.getItem("hayding-token"));
  }

  function getConditionLabel(conditionStatus) {
    const labels = {
      NEW: text("Neu", "جديد", "New"),
      LIKE_NEW: text("Wie neu", "شبه جديد", "Like new"),
      GOOD: text("Gut", "جيد", "Good"),
      ACCEPTABLE: text("Akzeptabel", "مقبول", "Acceptable"),
      USED: text("Gebraucht", "مستعمل", "Used"),
    };

    return labels[conditionStatus] || conditionStatus;
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

  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
    setCityFilter(searchParams.get("city") || "");
    setConditionFilter(searchParams.get("condition") || "");
  }, [searchParams]);

  const availableCities = useMemo(() => {
    const cities = products
      .map((product) => product.city)
      .filter(Boolean)
      .map((city) => city.trim())
      .filter(Boolean);

    return [...new Set(cities)].sort((a, b) => a.localeCompare(b));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const cleanSearch = searchTerm.trim().toLowerCase();
    const cleanCity = cityFilter.trim().toLowerCase();

    return products.filter((product) => {
      const title = product.title?.toLowerCase() || "";
      const description = product.description?.toLowerCase() || "";
      const city = product.city?.toLowerCase() || "";
      const condition = product.conditionStatus || product.condition || "";

      const matchesSearch =
        !cleanSearch ||
        title.includes(cleanSearch) ||
        description.includes(cleanSearch);

      const matchesCity = !cleanCity || city === cleanCity;

      const matchesCondition =
        !conditionFilter || condition === conditionFilter;

      return matchesSearch && matchesCity && matchesCondition;
    });
  }, [products, searchTerm, cityFilter, conditionFilter]);

  const hasActiveFilters = Boolean(
    searchTerm.trim() || cityFilter || conditionFilter
  );

  function clearFilters() {
    setSearchTerm("");
    setCityFilter("");
    setConditionFilter("");
  }

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

        <section className="products-filter-card">
          <div className="products-filter-grid">
            <label className="products-filter-field products-filter-search">
              <span>{text("Suche", "بحث", "Search")}</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={text(
                  "Titel oder Beschreibung suchen...",
                  "ابحث بالعنوان أو الوصف...",
                  "Search title or description..."
                )}
              />
            </label>

            <label className="products-filter-field">
              <span>{text("Stadt", "المدينة", "City")}</span>
              <select
                value={cityFilter}
                onChange={(event) => setCityFilter(event.target.value)}
              >
                <option value="">
                  {text("Alle Städte", "كل المدن", "All cities")}
                </option>

                {availableCities.map((city) => (
                  <option value={city} key={city}>
                    {city}
                  </option>
                ))}
              </select>
            </label>

            <label className="products-filter-field">
              <span>{text("Zustand", "الحالة", "Condition")}</span>
              <select
                value={conditionFilter}
                onChange={(event) => setConditionFilter(event.target.value)}
              >
                <option value="">
                  {text("Alle Zustände", "كل الحالات", "All conditions")}
                </option>
                <option value="NEW">{text("Neu", "جديد", "New")}</option>
                <option value="LIKE_NEW">
                  {text("Wie neu", "شبه جديد", "Like new")}
                </option>
                <option value="GOOD">{text("Gut", "جيد", "Good")}</option>
                <option value="ACCEPTABLE">
                  {text("Akzeptabel", "مقبول", "Acceptable")}
                </option>
                <option value="USED">
                  {text("Gebraucht", "مستعمل", "Used")}
                </option>
              </select>
            </label>
          </div>

          <div className="products-filter-footer">
            <p>
              {text(
                `${filteredProducts.length} von ${products.length} Anzeigen`,
                `${filteredProducts.length} من ${products.length} إعلان`,
                `${filteredProducts.length} of ${products.length} listings`
              )}
            </p>

            {hasActiveFilters && (
              <button
                className="btn btn-secondary"
                type="button"
                onClick={clearFilters}
              >
                {text("Filter zurücksetzen", "إزالة الفلاتر", "Clear filters")}
              </button>
            )}
          </div>
        </section>

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

        {!isLoading && !error && filteredProducts.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔎</div>

            <h2>
              {products.length === 0
                ? text(
                    "Noch keine Anzeigen gefunden.",
                    "لا توجد إعلانات بعد.",
                    "No listings found yet."
                  )
                : text(
                    "Keine passenden Anzeigen gefunden.",
                    "لا توجد إعلانات مطابقة.",
                    "No matching listings found."
                  )}
            </h2>

            <p>
              {products.length === 0
                ? text(
                    "Sobald neue Anzeigen veröffentlicht werden, erscheinen sie hier.",
                    "عند نشر إعلانات جديدة، ستظهر هنا.",
                    "Once new listings are published, they will appear here."
                  )
                : text(
                    "Versuche andere Suchbegriffe oder entferne die Filter.",
                    "جرّب كلمات بحث أخرى أو أزل الفلاتر.",
                    "Try different search terms or clear the filters."
                  )}
            </p>

            {hasActiveFilters && (
              <button className="btn btn-primary" type="button" onClick={clearFilters}>
                {text("Filter zurücksetzen", "إزالة الفلاتر", "Clear filters")}
              </button>
            )}
          </div>
        )}

        {!isLoading && !error && filteredProducts.length > 0 && (
          <div className="my-products-grid">
            {filteredProducts.map((product) => {
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
                      {getConditionLabel(
                        product.conditionStatus || product.condition
                      ) || text("Aktiv", "نشط", "Active")}
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