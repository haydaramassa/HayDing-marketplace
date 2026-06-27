import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { getProducts } from "../services/api";
import { getProductImages } from "../utils/productImages";
import Navbar from "../components/Navbar";
import ProductCardImage from "../components/ProductCardImage";
import "../App.css";

function Home() {
  const { language, isArabic } = useLanguage();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [latestProducts, setLatestProducts] = useState([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [activeShowcaseIndex, setActiveShowcaseIndex] = useState(0);
  const [isShowcasePaused, setIsShowcasePaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileVisibleCount, setMobileVisibleCount] = useState(6);

  function text(de, ar, en) {
    if (isArabic) return ar;
    if (language === "EN") return en;
    return de;
  }

  const content = {
    DE: {
      eyebrow: "Marketplace für Deutschland",
      titleLine1: "Was du hast,",
      titleLine2: "sucht",
      titleLine3: "jemand.",
      heroText:
        "HayDing verbindet Menschen, Dinge und Möglichkeiten. Verkaufe, kaufe oder entdecke gebrauchte und neue Artikel in deiner Nähe.",
      mobileTitle: "Was suchst du heute?",
      mobileText: "Finde Angebote in deiner Nähe.",
      searchPlaceholder: "Was suchst du heute?",
      locationPlaceholder: "Ort oder PLZ",
      searchButton: "Suchen",
      newAd: "Neue Anzeige",
      liveEyebrow: "Live auf HayDing",
      liveTitle: "Aktuelle Anzeigen auf der Plattform",
      liveText:
        "Echte Anzeigen von Nutzern – automatisch aktualisiert und alle 5 Sekunden hervorgehoben.",
      showListing: "Anzeige ansehen",
      noLiveListingsTitle: "Bald erscheinen hier echte Anzeigen.",
      noLiveListingsText:
        "Sobald Nutzer Anzeigen veröffentlichen, werden sie hier lebendig angezeigt.",
      createFirstListing: "Erste Anzeige erstellen",
      categoriesEyebrow: "Kategorien",
      categoriesTitle: "Entdecke Kategorien",
      productsEyebrow: "Aktuell",
      productsTitle: "Neueste Anzeigen",
      loadingProducts: "Anzeigen werden geladen...",
      noProductsTitle: "Noch keine Anzeigen vorhanden.",
      noProductsText:
        "Sobald neue Anzeigen veröffentlicht werden, erscheinen sie hier.",
      exploreAll: "Alle Anzeigen entdecken",
      showMore: "Mehr anzeigen",
      howEyebrow: "So funktioniert's",
      howTitle: "Einfach starten mit HayDing",
      step1Title: "Artikel einstellen",
      step1Text:
        "Beschreibe dein Ding, wähle eine Kategorie und veröffentliche es.",
      step2Title: "Gefunden werden",
      step2Text:
        "Interessierte Nutzer können dein Angebot sehen und kontaktieren.",
      step3Title: "Direkt handeln",
      step3Text:
        "Einigt euch einfach über Nachricht, Abholung oder Übergabe.",
      footerText: "Was du hast, sucht jemand.",
      categories: [
        "Elektronik",
        "Möbel",
        "Kleidung",
        "Haushalt",
        "Bücher",
        "Sport",
      ],
    },

    AR: {
      eyebrow: "سوق إلكتروني في ألمانيا",
      titleLine1: "ما تملكه،",
      titleLine2: "يبحث عنه",
      titleLine3: "شخص آخر.",
      heroText:
        "HayDing يربط الناس بالأشياء والفرص. بِع، اشترِ أو اكتشف منتجات جديدة ومستعملة بالقرب منك.",
      mobileTitle: "عن ماذا تبحث اليوم؟",
      mobileText: "اكتشف إعلانات قريبة منك.",
      searchPlaceholder: "ماذا تبحث اليوم؟",
      locationPlaceholder: "المدينة أو الرمز البريدي",
      searchButton: "بحث",
      newAd: "إعلان جديد",
      liveEyebrow: "مباشر على HayDing",
      liveTitle: "إعلانات حقيقية من المنصة",
      liveText:
        "إعلانات حقيقية من المستخدمين، تتبدل تلقائياً كل 5 ثوانٍ وتبقي الصفحة حيّة.",
      showListing: "عرض الإعلان",
      noLiveListingsTitle: "قريباً ستظهر هنا إعلانات حقيقية.",
      noLiveListingsText:
        "بمجرد أن ينشر المستخدمون إعلاناتهم، ستظهر هنا بشكل حي وجذاب.",
      createFirstListing: "أضف أول إعلان",
      categoriesEyebrow: "الفئات",
      categoriesTitle: "تصفح الفئات",
      productsEyebrow: "الأحدث",
      productsTitle: "أحدث الإعلانات",
      loadingProducts: "جارٍ تحميل الإعلانات...",
      noProductsTitle: "لا توجد إعلانات بعد.",
      noProductsText: "عند نشر إعلانات جديدة، ستظهر هنا.",
      exploreAll: "استكشف كل الإعلانات",
      showMore: "رؤية المزيد",
      howEyebrow: "كيف يعمل",
      howTitle: "ابدأ بسهولة مع HayDing",
      step1Title: "أضف المنتج",
      step1Text: "اكتب وصفًا بسيطًا، اختر الفئة، ثم انشر الإعلان.",
      step2Title: "ليجدك المهتمون",
      step2Text: "يمكن للمستخدمين مشاهدة إعلانك والتواصل معك.",
      step3Title: "تواصل واتفق",
      step3Text: "اتفقوا عبر الرسائل على السعر، الاستلام أو التسليم.",
      footerText: "ما تملكه، يبحث عنه شخص آخر.",
      categories: [
        "إلكترونيات",
        "أثاث",
        "ملابس",
        "منزل",
        "كتب",
        "رياضة",
      ],
    },

    EN: {
      eyebrow: "Marketplace for Germany",
      titleLine1: "What you have,",
      titleLine2: "someone",
      titleLine3: "is looking for.",
      heroText:
        "HayDing connects people, things and opportunities. Sell, buy or discover new and used items near you.",
      mobileTitle: "What are you looking for?",
      mobileText: "Find listings near you.",
      searchPlaceholder: "What are you looking for?",
      locationPlaceholder: "City or ZIP code",
      searchButton: "Search",
      newAd: "New listing",
      liveEyebrow: "Live on HayDing",
      liveTitle: "Real listings from the platform",
      liveText:
        "Real user listings, rotating automatically every 5 seconds to keep the page alive.",
      showListing: "View listing",
      noLiveListingsTitle: "Real listings will appear here soon.",
      noLiveListingsText:
        "As soon as users publish listings, they will appear here in a lively showcase.",
      createFirstListing: "Create the first listing",
      categoriesEyebrow: "Categories",
      categoriesTitle: "Browse categories",
      productsEyebrow: "Latest",
      productsTitle: "Newest listings",
      loadingProducts: "Loading listings...",
      noProductsTitle: "No listings yet.",
      noProductsText: "Once new listings are published, they will appear here.",
      exploreAll: "Explore all listings",
      showMore: "Show more",
      howEyebrow: "How it works",
      howTitle: "Start easily with HayDing",
      step1Title: "Create a listing",
      step1Text: "Describe your item, choose a category and publish it.",
      step2Title: "Get discovered",
      step2Text: "Interested users can see your offer and contact you.",
      step3Title: "Deal directly",
      step3Text: "Agree via messages on pickup, handover or details.",
      footerText: "What you have, someone is looking for.",
      categories: [
        "Electronics",
        "Furniture",
        "Clothing",
        "Home",
        "Books",
        "Sport",
      ],
    },
  };

  const t = content[language] || content.DE;

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("hayding-user") || "{}");
    } catch {
      return {};
    }
  })();
  
  const currentUserId = currentUser?.id || currentUser?.userId || currentUser?._id;
  
  function isOwnProduct(product) {
    const productOwnerId =
      product?.userId ||
      product?.sellerId ||
      product?.ownerId ||
      product?.user?.id ||
      product?.seller?.id ||
      product?.owner?.id;
  
    return Boolean(
      currentUserId &&
        productOwnerId &&
        String(currentUserId) === String(productOwnerId)
    );
  }

  const categoryIds = ["1", "2", "3", "5", "6", "8"];

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 760px)");

    function updateMobileState() {
      setIsMobile(mediaQuery.matches);
    }

    updateMobileState();

    mediaQuery.addEventListener("change", updateMobileState);

    return () => {
      mediaQuery.removeEventListener("change", updateMobileState);
    };
  }, []);

  useEffect(() => {
    setMobileVisibleCount(6);
  }, [isMobile, language]);

  useEffect(() => {
    async function loadLatestProducts() {
      try {
        setIsProductsLoading(true);
        setProductsError("");

        const data = await getProducts();
        const products = data?.data || data || [];

        setLatestProducts(Array.isArray(products) ? products : []);
      } catch (err) {
        setProductsError(
          err.message ||
            (language === "AR"
              ? "تعذر تحميل الإعلانات."
              : language === "EN"
                ? "Could not load listings."
                : "Anzeigen konnten nicht geladen werden.")
        );
      } finally {
        setIsProductsLoading(false);
      }
    }

    loadLatestProducts();
  }, [language]);

  const sortedActiveProducts = useMemo(() => {
    return [...latestProducts]
      .filter((product) => product.productStatus !== "SOLD")
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();

        if (Number.isNaN(dateA) || Number.isNaN(dateB)) {
          return Number(b.id || 0) - Number(a.id || 0);
        }

        return dateB - dateA;
      });
  }, [latestProducts]);

  const newestProducts = useMemo(() => {
    return sortedActiveProducts.slice(0, isMobile ? mobileVisibleCount : 3);
  }, [sortedActiveProducts, isMobile, mobileVisibleCount]);

  const hasMoreMobileProducts =
    isMobile && sortedActiveProducts.length > newestProducts.length;

  const showcaseProducts = useMemo(() => {
    return sortedActiveProducts.slice(0, 6);
  }, [sortedActiveProducts]);

  useEffect(() => {
    setActiveShowcaseIndex(0);
  }, [showcaseProducts.length]);

  useEffect(() => {
    if (showcaseProducts.length <= 1 || isShowcasePaused) {
      return;
    }

    const intervalId = setInterval(() => {
      setActiveShowcaseIndex((currentIndex) =>
        currentIndex === showcaseProducts.length - 1 ? 0 : currentIndex + 1
      );
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [showcaseProducts.length, isShowcasePaused]);

  function getConditionLabel(conditionStatus) {
    const labels = {
      NEW: language === "AR" ? "جديد" : language === "EN" ? "New" : "Neu",
      LIKE_NEW:
        language === "AR"
          ? "شبه جديد"
          : language === "EN"
            ? "Like new"
            : "Wie neu",
      GOOD: language === "AR" ? "جيد" : language === "EN" ? "Good" : "Gut",
      ACCEPTABLE:
        language === "AR"
          ? "مقبول"
          : language === "EN"
            ? "Acceptable"
            : "Akzeptabel",
      USED:
        language === "AR"
          ? "مستعمل"
          : language === "EN"
            ? "Used"
            : "Gebraucht",
    };

    return labels[conditionStatus] || conditionStatus;
  }

  function getProductImage(product) {
    return getProductImages(product)?.[0] || "";
  }

  function getProductDescription(product) {
    const description = product?.description?.trim();

    if (!description) {
      return t.liveText;
    }

    if (description.length > 70) {
      return `${description.slice(0, 67)}...`;
    }

    return description;
  }

  function handleSearch(event) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    }

    if (searchCity.trim()) {
      params.set("city", searchCity.trim());
    }

    const queryString = params.toString();

    navigate(queryString ? `/products?${queryString}` : "/products");
  }

  const activeShowcaseProduct = showcaseProducts[activeShowcaseIndex] || null;

  function renderSearchForm(extraClassName = "") {
    return (
      <form className={`search-box ${extraClassName}`} onSubmit={handleSearch}>
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder={t.searchPlaceholder}
          aria-label="Search products"
        />

        <input
          type="text"
          value={searchCity}
          onChange={(event) => setSearchCity(event.target.value)}
          placeholder={t.locationPlaceholder}
          aria-label="Search location"
        />

        <button type="submit">{t.searchButton}</button>
      </form>
    );
  }

  function renderCategories(sectionClassName = "") {
    return (
      <section className={`section ${sectionClassName}`} id="categories">
        <div className="section-header">
          <p className="eyebrow">{t.categoriesEyebrow}</p>
          <h2>{t.categoriesTitle}</h2>
        </div>

        <div className="categories-grid">
          {t.categories.map((category, index) => (
            <button
              className="category-card"
              type="button"
              key={category}
              onClick={() => navigate(`/products?category=${categoryIds[index]}`)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>
    );
  }

  function renderLatestProducts(sectionClassName = "") {
    return (
      <section className={`section ${sectionClassName}`} id="products">
        <div className="section-header section-header-with-action">
          <div>
            <p className="eyebrow">{t.productsEyebrow}</p>
            <h2>{t.productsTitle}</h2>
          </div>

          {!isMobile && (
            <Link className="btn btn-secondary" to="/products">
              {t.exploreAll}
            </Link>
          )}
        </div>

        {isProductsLoading && (
          <p className="auth-message auth-success">{t.loadingProducts}</p>
        )}

        {productsError && (
          <p className="auth-message auth-error">{productsError}</p>
        )}

        {!isProductsLoading && !productsError && newestProducts.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h2>{t.noProductsTitle}</h2>
            <p>{t.noProductsText}</p>
            <Link className="btn btn-primary" to="/create-product">
              {t.newAd}
            </Link>
          </div>
        )}

        {!isProductsLoading && !productsError && newestProducts.length > 0 && (
          <>
            <div className="products-grid">
              {newestProducts.map((product) => (
                <Link
                  className="product-card product-card-link"
                  key={product.id}
                  to={`/products/${product.id}`}
                >
                  <ProductCardImage
                    product={product}
                    showFavoriteButton={!isOwnProduct(product)}
                  />

                  <div className="product-info">
                    <span className="product-tag">
                      {getConditionLabel(product.conditionStatus || product.condition) ||
                        t.newAd}
                    </span>

                    <h3>{product.title}</h3>

                    <p>{product.city}</p>

                    <strong>{product.price} €</strong>
                  </div>
                </Link>
              ))}
            </div>

            {isMobile && (
              <div className="mobile-products-actions">
                {hasMoreMobileProducts ? (
                  <button
                    className="btn btn-secondary mobile-show-more-products"
                    type="button"
                    onClick={() =>
                      setMobileVisibleCount((currentCount) => currentCount + 10)
                    }
                  >
                    {t.showMore}
                  </button>
                ) : (
                  <Link className="btn btn-secondary mobile-show-more-products" to="/products">
                    {t.exploreAll}
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </section>
    );
  }

  function renderShowcase(sectionClassName = "") {
    return (
      <section className={`section ${sectionClassName}`}>
        <div
          className="hero-card live-hero-card"
          onMouseEnter={() => setIsShowcasePaused(true)}
          onMouseLeave={() => setIsShowcasePaused(false)}
        >
          <div className="hero-card-header live-hero-card-header">
            <span className="status-dot live-status-dot"></span>
            <span>{t.liveEyebrow}</span>
          </div>

          {isProductsLoading && (
            <div className="showcase-card showcase-card-loading">
              <div className="showcase-image-skeleton"></div>

              <div className="showcase-content">
                <h3>{t.liveTitle}</h3>
                <p>{t.loadingProducts}</p>
              </div>
            </div>
          )}

          {!isProductsLoading && productsError && (
            <div className="showcase-card showcase-fallback-card">
              <div className="showcase-fallback-icon">⚡</div>
              <h3>{t.liveTitle}</h3>
              <p>{productsError}</p>
            </div>
          )}

          {!isProductsLoading && !productsError && activeShowcaseProduct && (
            <div className="showcase-card">
              <Link
                className="showcase-image-link"
                to={`/products/${activeShowcaseProduct.id}`}
              >
                {getProductImage(activeShowcaseProduct) ? (
                  <img
                    className="showcase-image"
                    src={getProductImage(activeShowcaseProduct)}
                    alt={activeShowcaseProduct.title}
                  />
                ) : (
                  <div className="showcase-image-placeholder">📦</div>
                )}

                <span className="showcase-glow"></span>
              </Link>

              <div className="showcase-content">
                <div className="showcase-meta-row">
                  <span className="product-tag">
                    {getConditionLabel(
                      activeShowcaseProduct.conditionStatus ||
                        activeShowcaseProduct.condition
                    ) || t.newAd}
                  </span>

                  <span className="showcase-city">
                    {activeShowcaseProduct.city ||
                      text("Ort", "المدينة", "City")}
                  </span>
                </div>

                <h3>{activeShowcaseProduct.title}</h3>

                <p>{getProductDescription(activeShowcaseProduct)}</p>

                <div className="showcase-footer">
                  <strong>{activeShowcaseProduct.price} €</strong>

                  <Link
                    className="btn btn-primary showcase-cta"
                    to={`/products/${activeShowcaseProduct.id}`}
                  >
                    {t.showListing}
                  </Link>
                </div>

                {showcaseProducts.length > 1 && (
                  <div className="showcase-dots" aria-label="Showcase pages">
                    {showcaseProducts.map((product, index) => (
                      <button
                        type="button"
                        key={product.id}
                        className={`showcase-dot ${
                          activeShowcaseIndex === index ? "active" : ""
                        }`}
                        onClick={() => setActiveShowcaseIndex(index)}
                        aria-label={`${t.showListing} ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {!isProductsLoading &&
            !productsError &&
            showcaseProducts.length === 0 && (
              <div className="showcase-card showcase-fallback-card">
                <div className="showcase-fallback-icon">✨</div>
                <h3>{t.noLiveListingsTitle}</h3>
                <p>{t.noLiveListingsText}</p>

                <Link className="btn btn-primary showcase-cta" to="/create-product">
                  {t.createFirstListing}
                </Link>
              </div>
            )}
        </div>
      </section>
    );
  }

  function renderHowItWorks() {
    return (
      <section className="how-it-works" id="how-it-works">
        <div>
          <p className="eyebrow">{t.howEyebrow}</p>
          <h2>{t.howTitle}</h2>
        </div>

        <div className="steps">
          <div className="step">
            <span>1</span>
            <h3>{t.step1Title}</h3>
            <p>{t.step1Text}</p>
          </div>

          <div className="step">
            <span>2</span>
            <h3>{t.step2Title}</h3>
            <p>{t.step2Text}</p>
          </div>

          <div className="step">
            <span>3</span>
            <h3>{t.step3Title}</h3>
            <p>{t.step3Text}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div
      className={`app ${isArabic ? "rtl" : ""}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <Navbar variant="home" />

      <main className={isMobile ? "mobile-home-main" : "desktop-home-main"}>
        {isMobile ? (
          <>
            <section className="section mobile-home-search-section">
              <div className="section-header">
                <p className="eyebrow">HayDing</p>
                <h2>{t.mobileTitle}</h2>
                <p className="hero-text">{t.mobileText}</p>
              </div>

              {renderSearchForm("mobile-home-search-box")}
            </section>

            {renderCategories("mobile-home-categories-section")}

            {renderLatestProducts("mobile-home-products-section")}

            {renderShowcase("mobile-home-live-section")}
          </>
        ) : (
          <>
            <section className="hero">
              <div className="hero-content">
                <p className="eyebrow">{t.eyebrow}</p>

                <h1>
                  {t.titleLine1}
                  <br />
                  {t.titleLine2}
                  <br />
                  {t.titleLine3}
                </h1>

                <p className="hero-text">{t.heroText}</p>

                {renderSearchForm()}
              </div>

              {renderShowcase("desktop-live-section")}
            </section>

            {renderCategories()}

            {renderLatestProducts()}

            {renderHowItWorks()}
          </>
        )}
      </main>

      <footer className="footer">
        <div className="logo">
          <span className="logo-mark logo-image-mark">
            <img src="/icon/hayding-mark.png" alt="" aria-hidden="true" />
          </span>
          <span>HayDing</span>
        </div>

        <p>{t.footerText}</p>
      </footer>
    </div>
  );
}

export default Home;