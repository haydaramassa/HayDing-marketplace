import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import {
  addFavorite,
  getCategories,
  getFavorites,
  getProducts,
  removeFavorite,
} from "../services/api";
import ProductCardImage from "../components/ProductCardImage";
import Navbar from "../components/Navbar";
import UserAvatar from "../components/UserAvatar";
import "../App.css";
import "./Products.css";

function Products() {
  const { isArabic, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteLoadingId, setFavoriteLoadingId] = useState(null);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [cityFilter, setCityFilter] = useState(searchParams.get("city") || "");
  const [minPriceFilter, setMinPriceFilter] = useState(
    searchParams.get("minPrice") || ""
  );
  const [maxPriceFilter, setMaxPriceFilter] = useState(
    searchParams.get("maxPrice") || ""
  );
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
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
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

  function getCategoryName(category) {
    if (isArabic) return category.nameAr;
    if (language === "EN") return category.nameEn;
    return category.nameDe;
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
    return categories.map((category) => ({
      value: String(category.id),
      label: getCategoryName(category),
    }));
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
    async function loadProductsPageData() {
      try {
        setIsLoading(true);
        setError("");

        const categoriesData = await getCategories();
        const categoryItems = categoriesData?.data || categoriesData || [];

        setCategories(Array.isArray(categoryItems) ? categoryItems : []);

        const productsData = await getProducts();
        const productItems = productsData?.data || productsData || [];

        setProducts(Array.isArray(productItems) ? productItems : []);

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

    loadProductsPageData();
  }, []);

  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");
    setCityFilter(searchParams.get("city") || "");
    setMinPriceFilter(searchParams.get("minPrice") || "");
    setMaxPriceFilter(searchParams.get("maxPrice") || "");
    setConditionFilter(searchParams.get("condition") || "");
    setCategoryFilter(searchParams.get("category") || "");
    setSortOption(searchParams.get("sort") || "newest");
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();

    const cleanSearchTerm = searchTerm.trim();
    const cleanCityFilter = cityFilter.trim();
    const cleanMinPrice = minPriceFilter.trim();
    const cleanMaxPrice = maxPriceFilter.trim();

    if (cleanSearchTerm) {
      params.set("search", cleanSearchTerm);
    }

    if (cleanCityFilter) {
      params.set("city", cleanCityFilter);
    }

    if (cleanMinPrice) {
      params.set("minPrice", cleanMinPrice);
    }

    if (cleanMaxPrice) {
      params.set("maxPrice", cleanMaxPrice);
    }

    if (conditionFilter) {
      params.set("condition", conditionFilter);
    }

    if (categoryFilter) {
      params.set("category", categoryFilter);
    }

    if (sortOption && sortOption !== "newest") {
      params.set("sort", sortOption);
    }

    const nextSearch = params.toString();
    const currentSearch = searchParams.toString();

    if (nextSearch !== currentSearch) {
      setSearchParams(params, { replace: true });
    }
  }, [
    searchTerm,
    cityFilter,
    minPriceFilter,
    maxPriceFilter,
    conditionFilter,
    categoryFilter,
    sortOption,
    searchParams,
    setSearchParams,
  ]);

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
    const minPrice = Number(minPriceFilter);
    const maxPrice = Number(maxPriceFilter);
    const hasMinPrice = minPriceFilter.trim() !== "" && !Number.isNaN(minPrice);
    const hasMaxPrice = maxPriceFilter.trim() !== "" && !Number.isNaN(maxPrice);

    return products.filter((product) => {
      const title = product.title?.toLowerCase() || "";
      const description = product.description?.toLowerCase() || "";
      const city = product.city?.toLowerCase() || "";
      const condition = product.conditionStatus || product.condition || "";
      const categoryId = getProductCategoryId(product);
      const price = getPriceValue(product);

      const matchesSearch =
        !cleanSearch ||
        title.includes(cleanSearch) ||
        description.includes(cleanSearch);

      const matchesCity = !cleanCity || city.includes(cleanCity);

      const matchesCondition =
        !conditionFilter || condition === conditionFilter;

      const matchesCategory =
        !categoryFilter || categoryId === String(categoryFilter);

      const matchesMinPrice = !hasMinPrice || price >= minPrice;
      const matchesMaxPrice = !hasMaxPrice || price <= maxPrice;

      return (
        matchesSearch &&
        matchesCity &&
        matchesCondition &&
        matchesCategory &&
        matchesMinPrice &&
        matchesMaxPrice
      );
    });
  }, [
    products,
    searchTerm,
    cityFilter,
    minPriceFilter,
    maxPriceFilter,
    conditionFilter,
    categoryFilter,
  ]);

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
      minPriceFilter.trim() ||
      maxPriceFilter.trim() ||
      conditionFilter ||
      categoryFilter ||
      sortOption !== "newest"
  );

  function clearFilters() {
    setSearchTerm("");
    setCityFilter("");
    setMinPriceFilter("");
    setMaxPriceFilter("");
    setConditionFilter("");
    setCategoryFilter("");
    setSortOption("newest");
    setOpenDropdown(null);
    setIsMobileFiltersOpen(false);
    setSearchParams({}, { replace: true });
  }

  async function handleFavoriteClick(event, productId) {
    event.preventDefault();
    event.stopPropagation();

    const product = products.find(
      (item) => Number(item.id) === Number(productId)
    );

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
      className={`products-page ${isArabic ? "rtl" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <Navbar variant="app" />

      <main className="products-page-main">
        <div className="products-page-header">
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

        <section
          className={`products-filter-card ${
            isMobileFiltersOpen ? "mobile-filters-open" : ""
          }`}
          ref={filtersRef}
        >
          <div className="products-mobile-filter-bar">
            <button
              className="products-mobile-filter-toggle"
              type="button"
              onClick={() =>
                setIsMobileFiltersOpen((currentValue) => !currentValue)
              }
            >
              <span>{text("Filter", "الفلاتر", "Filters")}</span>

              <span className="products-mobile-filter-count">
                {visibleProducts.length} {text("Anzeigen", "إعلانات", "listings")}
              </span>

              <span aria-hidden="true">
                {isMobileFiltersOpen ? "×" : "☰"}
              </span>
            </button>
          </div>

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
              <span>
                {text("Ort oder PLZ", "المدينة أو الرمز", "City or ZIP")}
              </span>
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

            <div className="products-filter-field products-price-range">
              <span>{text("Preis", "السعر", "Price")}</span>

              <div className="products-price-range-box">
                <input
                  type="number"
                  min="0"
                  value={minPriceFilter}
                  onChange={(event) => setMinPriceFilter(event.target.value)}
                  placeholder={text("Preis von", "السعر من", "Price from")}
                />

                <span className="products-price-separator">–</span>

                <input
                  type="number"
                  min="0"
                  value={maxPriceFilter}
                  onChange={(event) => setMaxPriceFilter(event.target.value)}
                  placeholder={text("Preis bis", "السعر إلى", "Price to")}
                />
              </div>
            </div>

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
          <div className="products-page-grid">
            {visibleProducts.map((product) => {
              const isFavorite = favoriteIds.includes(product.id);
              const isFavoriteLoading = favoriteLoadingId === product.id;
              const belongsToCurrentUser = isOwnProduct(product);

              return (
                <Link
                  className="products-page-card product-card-link"
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
