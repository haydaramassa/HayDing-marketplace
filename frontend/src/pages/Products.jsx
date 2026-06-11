import { useEffect, useMemo, useRef, useState } from "react";
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
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get("category") || ""
  );
  const [sortOption, setSortOption] = useState(
    searchParams.get("sort") || "newest"
  );

  const [openDropdown, setOpenDropdown] = useState(null);
  const filtersRef = useRef(null);

  function text(de, ar, en) {
    if (isArabic) return ar;
    if (language === "EN") return en;
    return de;
  }

  function isLoggedIn() {
    return Boolean(localStorage.getItem("hayding-token"));
  }

  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem("hayding-user") || "{}");
    } catch {
      return {};
    }
  }

  function isOwnProduct(product) {
    const currentUser = getCurrentUser();

    return (
      currentUser?.id &&
      product?.seller?.id &&
      Number(currentUser.id) === Number(product.seller.id)
    );
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

  function getCategoryOptions() {
    return [
      { value: "1", label: text("Elektronik", "إلكترونيات", "Electronics") },
      { value: "2", label: text("Möbel", "أثاث", "Furniture") },
      { value: "3", label: text("Kleidung", "ملابس", "Clothing") },
      { value: "4", label: text("Schuhe", "أحذية", "Shoes") },
      { value: "5", label: text("Haushalt", "أدوات منزلية", "Household") },
      { value: "6", label: text("Bücher", "كتب", "Books") },
      { value: "7", label: text("Spielzeug", "ألعاب", "Toys") },
      { value: "8", label: text("Sport", "رياضة", "Sports") },
      { value: "9", label: text("Kinder", "أطفال", "Kids") },
      { value: "10", label: text("Sonstiges", "أخرى", "Others") },
    ];
  }

  function getConditionOptions() {
    return [
      { value: "NEW", label: text("Neu", "جديد", "New") },
      { value: "LIKE_NEW", label: text("Wie neu", "شبه جديد", "Like new") },
      { value: "GOOD", label: text("Gut", "جيد", "Good") },
      { value: "ACCEPTABLE", label: text("Akzeptabel", "مقبول", "Acceptable") },
      { value: "USED", label: text("Gebraucht", "مستعمل", "Used") },
    ];
  }

  function getSortOptions() {
    return [
      {
        value: "price-asc",
        label: text(
          "Preis aufsteigend",
          "السعر من الأقل للأعلى",
          "Price low to high"
        ),
      },
      {
        value: "price-desc",
        label: text(
          "Preis absteigend",
          "السعر من الأعلى للأقل",
          "Price high to low"
        ),
      },
    ];
  }

  function getProductCategoryId(product) {
    return String(product.categoryId || product.category?.id || "");
  }

  function getProductDateValue(product) {
    const dateValue =
      product.updatedAt || product.createdAt || product.publishedAt;

    if (dateValue) {
      const time = new Date(dateValue).getTime();

      if (!Number.isNaN(time)) {
        return time;
      }
    }

    return Number(product.id) || 0;
  }

  function getPriceValue(product) {
    const value = Number(product.price);

    return Number.isNaN(value) ? 0 : value;
  }

  function getSelectedLabel(options, value, fallback) {
    return options.find((option) => option.value === value)?.label || fallback;
  }

  function CustomDropdown({
    id,
    label,
    value,
    fallback,
    options,
    onChange,
  }) {
    const isOpen = openDropdown === id;

    return (
      <div className="products-filter-field custom-filter-field">
        <span>{label}</span>

        <button
          className={`custom-filter-button ${isOpen ? "open" : ""}`}
          type="button"
          onClick={() =>
            setOpenDropdown((currentValue) =>
              currentValue === id ? null : id
            )
          }
        >
          <span>{getSelectedLabel(options, value, fallback)}</span>
          <span aria-hidden="true">▾</span>
        </button>

        {isOpen && (
          <div className="custom-filter-menu">
            <button
              className={`custom-filter-option ${value === "" ? "active" : ""}`}
              type="button"
              onClick={() => {
                onChange("");
                setOpenDropdown(null);
              }}
            >
              {fallback}
            </button>

            {options.map((option) => (
              <button
                className={`custom-filter-option ${
                  value === option.value ? "active" : ""
                }`}
                type="button"
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setOpenDropdown(null);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
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
    setCategoryFilter(searchParams.get("category") || "");
    setSortOption(searchParams.get("sort") || "newest");
  }, [searchParams]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const cleanSearch = searchTerm.trim().toLowerCase();
    const cleanCity = cityFilter.trim().toLowerCase();

    return products.filter((product) => {
      const title = product.title?.toLowerCase() || "";
      const description = product.description?.toLowerCase() || "";
      const city = product.city?.toLowerCase() || "";
      const condition = product.conditionStatus || product.condition || "";
      const categoryId = getProductCategoryId(product);

      const matchesSearch =
        !cleanSearch ||
        title.includes(cleanSearch) ||
        description.includes(cleanSearch);

      const matchesCity = !cleanCity || city.includes(cleanCity);

      const matchesCondition =
        !conditionFilter || condition === conditionFilter;

      const matchesCategory =
        !categoryFilter || categoryId === String(categoryFilter);

      return matchesSearch && matchesCity && matchesCondition && matchesCategory;
    });
  }, [products, searchTerm, cityFilter, conditionFilter, categoryFilter]);

  const visibleProducts = useMemo(() => {
    const sortedProducts = [...filteredProducts];

    if (sortOption === "price-asc") {
      sortedProducts.sort((a, b) => getPriceValue(a) - getPriceValue(b));
    } else if (sortOption === "price-desc") {
      sortedProducts.sort((a, b) => getPriceValue(b) - getPriceValue(a));
    } else {
      sortedProducts.sort(
        (a, b) => getProductDateValue(b) - getProductDateValue(a)
      );
    }

    return sortedProducts;
  }, [filteredProducts, sortOption]);

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
      cityFilter.trim() ||
      conditionFilter ||
      categoryFilter ||
      sortOption !== "newest"
  );

  function clearFilters() {
    setSearchTerm("");
    setCityFilter("");
    setConditionFilter("");
    setCategoryFilter("");
    setSortOption("newest");
    setOpenDropdown(null);
  }

  async function handleFavoriteClick(event, productId) {
    event.preventDefault();
    event.stopPropagation();

    const product = products.find((item) => Number(item.id) === Number(productId));

    if (isOwnProduct(product)) {
      return;
    }

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

        <section className="products-filter-card" ref={filtersRef}>
          <div className="products-filter-grid products-filter-grid-with-sort">
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

            <label className="products-filter-field products-city-input">
              <span>{text("Ort oder PLZ", "المدينة أو الرمز", "City or ZIP")}</span>
              <input
                type="text"
                value={cityFilter}
                onChange={(event) => setCityFilter(event.target.value)}
                placeholder={text(
                  "z. B. Leipzig",
                  "مثلاً Leipzig",
                  "e.g. Leipzig"
                )}
              />
            </label>

            <CustomDropdown
              id="category"
              label={text("Kategorie", "الفئة", "Category")}
              value={categoryFilter}
              fallback={text("Alle Kategorien", "كل الفئات", "All categories")}
              options={getCategoryOptions()}
              onChange={setCategoryFilter}
            />

            <CustomDropdown
              id="condition"
              label={text("Zustand", "الحالة", "Condition")}
              value={conditionFilter}
              fallback={text("Alle Zustände", "كل الحالات", "All conditions")}
              options={getConditionOptions()}
              onChange={setConditionFilter}
            />

            <CustomDropdown
              id="sort"
              label={text("Sortieren", "ترتيب", "Sort")}
              value={sortOption}
              fallback={text("Neueste zuerst", "الأحدث أولاً", "Newest first")}
              options={getSortOptions()}
              onChange={(value) => setSortOption(value || "newest")}
            />
          </div>

          <div className="products-filter-footer">
            <p>
              {text(
                `${visibleProducts.length} von ${products.length} Anzeigen`,
                `${visibleProducts.length} من ${products.length} إعلان`,
                `${visibleProducts.length} of ${products.length} listings`
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

        {!isLoading && !error && visibleProducts.length === 0 && (
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
              <button
                className="btn btn-primary"
                type="button"
                onClick={clearFilters}
              >
                {text("Filter zurücksetzen", "إزالة الفلاتر", "Clear filters")}
              </button>
            )}
          </div>
        )}

        {!isLoading && !error && visibleProducts.length > 0 && (
          <div className="my-products-grid products-results-grid">
            {visibleProducts.map((product) => {
              const isFavorite = favoriteIds.includes(product.id);
              const isFavoriteLoading = favoriteLoadingId === product.id;
              const belongsToCurrentUser = isOwnProduct(product);

              return (
                <Link
                  className="product-card my-product-card product-card-link products-compact-card"
                  key={product.id}
                  to={`/products/${product.id}`}
                >
                  <ProductCardImage product={product}>
                    {!belongsToCurrentUser && (
                      <button
                        className={`favorite-btn ${
                          isFavorite ? "active" : ""
                        }`}
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
                    )}
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